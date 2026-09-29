// # filepath: controllers/tools.controller.js
const tls = require('tls');
const dns = require('dns').promises;
const net = require('net');
const https = require('https');
const http = require('http');

/**
 * Robust IPv4 and IPv6 private/loopback/link-local address checker.
 * Handles IPv6-mapped IPv4 addresses (e.g. ::ffff:127.0.0.1) by normalizing them.
 */
const isPrivateIP = (ip) => {
  let normalized = ip;
  if (normalized.startsWith('::ffff:')) {
    normalized = normalized.substring(7);
  }

  if (net.isIPv4(normalized)) {
    const parts = normalized.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return true;

    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local & Cloud Metadata 169.254.169.254)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0/8 (Current network)
    if (parts[0] === 0) return true;
    // 100.64.0.0/10 (Carrier-Grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
    if (parts[0] >= 224) return true;

    return false;
  }

  if (net.isIPv6(normalized)) {
    const lower = normalized.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    // fe80::/10 (Link-local)
    if (lower.startsWith('fe80:') || lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true;
    // fc00::/7 (Unique Local Address)
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    return false;
  }

  return true; // Reject unrecognized IP formats
};

/**
 * Performs server-side DNS resolution & IP canonicalization before any connection.
 * Resolves hostnames/IP encodings (decimal, hex, octal, loopback domains, etc.) to actual IPs
 * and verifies that NONE resolve to private/loopback/internal address spaces (SSRF Mitigation).
 */
const resolveAndValidateHost = async (rawHost) => {
  if (!rawHost || typeof rawHost !== 'string') {
    throw new Error('Hostname/domain wajib diisi.');
  }

  let cleanHost = rawHost
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split('?')[0]
    .trim();

  if (cleanHost.startsWith('[')) {
    const closingIdx = cleanHost.indexOf(']');
    if (closingIdx !== -1) {
      cleanHost = cleanHost.substring(1, closingIdx);
    }
  } else if (cleanHost.includes(':')) {
    const colonCount = (cleanHost.match(/:/g) || []).length;
    if (colonCount === 1) {
      cleanHost = cleanHost.split(':')[0];
    }
  }

  if (!cleanHost) {
    throw new Error('Hostname/domain tidak valid.');
  }

  let addresses;
  try {
    addresses = await dns.lookup(cleanHost, { all: true });
  } catch (err) {
    throw new Error(`Gagal lookup host '${cleanHost}': ${err.message}`);
  }

  if (!addresses || addresses.length === 0) {
    throw new Error(`Host '${cleanHost}' tidak dapat ditemukan.`);
  }

  for (const item of addresses) {
    if (isPrivateIP(item.address)) {
      throw new Error(`Akses ke IP internal/privat (${item.address}) dilarang (SSRF Protection).`);
    }
  }

  return { cleanHost, resolvedIp: addresses[0].address };
};

exports.checkSSL = async (req, res) => {
  const { host, port = 443 } = req.body;

  let validated;
  try {
    validated = await resolveAndValidateHost(host);
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }

  const { cleanHost, resolvedIp } = validated;
  const targetPort = parseInt(port, 10) || 443;

  const socket = tls.connect(targetPort, resolvedIp, { servername: cleanHost }, () => {
    const cert = socket.getPeerCertificate(true);
    socket.destroy();

    if (!cert || Object.keys(cert).length === 0) {
      if (!res.headersSent) return res.status(500).json({ error: 'Sertifikat SSL tidak ditemukan.' });
    }

    const validTo = new Date(cert.valid_to);
    const daysRemaining = Math.max(0, Math.ceil((validTo - new Date()) / 86400000));

    if (!res.headersSent) {
      res.json({
        subject: cert.subject?.CN || cleanHost,
        issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        daysRemaining,
        san: cert.subjectaltname || 'None',
        fingerprint: cert.fingerprint256 || cert.fingerprint
      });
    }
  });

  socket.setTimeout(8000, () => {
    socket.destroy();
    if (!res.headersSent) res.status(504).json({ error: 'Koneksi TLS timeout (8s).' });
  });

  socket.on('error', (err) => {
    socket.destroy();
    if (!res.headersSent) res.status(500).json({ error: `TLS error: ${err.message}` });
  });
};

exports.resolveDNS = async (req, res) => {
  const { domain, type = 'A' } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain wajib diisi.' });

  const cleanDomain = domain.replace(/^https?:\/\//i, '').split('/')[0].trim();
  try {
    const fnMap = { A: 'resolve4', AAAA: 'resolve6', MX: 'resolveMx', TXT: 'resolveTxt', NS: 'resolveNs', CNAME: 'resolveCname' };
    const fn = fnMap[type.toUpperCase()];
    if (!fn) return res.status(400).json({ error: `Record ${type} tidak didukung.` });

    const records = await dns[fn](cleanDomain);
    res.json({ domain: cleanDomain, type, records });
  } catch (err) {
    res.status(err.code === 'ENOTFOUND' || err.code === 'ENODATA' ? 404 : 500).json({ error: `DNS query gagal: ${err.message}` });
  }
};

exports.pingHost = async (req, res) => {
  const { host, port = 80 } = req.body;

  let validated;
  try {
    validated = await resolveAndValidateHost(host);
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }

  const { cleanHost, resolvedIp } = validated;
  const targetPort = parseInt(port, 10) || 80;

  const start = process.hrtime();
  const socket = new net.Socket();
  socket.setTimeout(5000);

  socket.connect(targetPort, resolvedIp, () => {
    const diff = process.hrtime(start);
    const latency = ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2);
    socket.destroy();
    if (!res.headersSent) res.json({ host: cleanHost, status: 'Reachable', latencyMs: latency });
  });

  socket.on('error', (err) => {
    socket.destroy();
    if (!res.headersSent) res.status(500).json({ host: cleanHost, status: 'Unreachable', error: err.message });
  });

  socket.on('timeout', () => {
    socket.destroy();
    if (!res.headersSent) res.status(504).json({ host: cleanHost, status: 'Timeout', error: 'Ping timed out (5s).' });
  });
};

exports.checkPort = async (req, res) => {
  const { host, port } = req.body;
  if (!port) return res.status(400).json({ error: 'Port wajib diisi.' });

  const targetPort = parseInt(port, 10);
  if (isNaN(targetPort) || targetPort < 1 || targetPort > 65535) {
    return res.status(400).json({ error: 'Port harus 1 - 65535.' });
  }

  let validated;
  try {
    validated = await resolveAndValidateHost(host);
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }

  const { cleanHost, resolvedIp } = validated;

  const socket = new net.Socket();
  socket.setTimeout(4000);

  socket.connect(targetPort, resolvedIp, () => {
    socket.destroy();
    if (!res.headersSent) res.json({ host: cleanHost, port: targetPort, open: true, message: `Port ${targetPort} OPEN.` });
  });

  socket.on('error', (err) => {
    socket.destroy();
    if (!res.headersSent) res.json({ host: cleanHost, port: targetPort, open: false, message: `Port ${targetPort} CLOSED (${err.code}).` });
  });

  socket.on('timeout', () => {
    socket.destroy();
    if (!res.headersSent) res.json({ host: cleanHost, port: targetPort, open: false, message: `Port ${targetPort} FILTERED/TIMEOUT.` });
  });
};

exports.lookupWhois = async (req, res) => {
  const { domain } = req.body;

  let validated;
  try {
    validated = await resolveAndValidateHost(domain);
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }

  const { cleanHost } = validated;

  const socket = new net.Socket();
  let buffer = '';
  socket.setTimeout(10000);

  socket.connect(43, 'whois.iana.org', () => {
    socket.write(`${cleanHost}\r\n`);
  });

  socket.on('data', (chunk) => { buffer += chunk.toString(); });
  socket.on('end', () => {
    if (!res.headersSent) res.json({ domain: cleanHost, raw: buffer || 'No data.' });
  });

  socket.on('error', (err) => {
    socket.destroy();
    if (!res.headersSent) res.status(500).json({ error: `WHOIS error: ${err.message}` });
  });

  socket.on('timeout', () => {
    socket.destroy();
    if (!res.headersSent) res.status(504).json({ error: 'WHOIS timeout.' });
  });
};

exports.lookupIP = async (req, res) => {
  const rawIp = (req.body.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').replace(/^.*:/, '');
  const target = rawIp === '1' || rawIp === '' ? '8.8.8.8' : rawIp;

  let validated;
  try {
    validated = await resolveAndValidateHost(target);
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }

  const { resolvedIp } = validated;

  // ponytail: Use HTTPS endpoint over cleartext HTTP to prevent network MITM sniffing
  https.get(`https://ipwho.is/${resolvedIp}`, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch (e) {
        if (!res.headersSent) res.status(500).json({ error: 'Gagal parse data GeoIP.' });
      }
    });
  }).on('error', (err) => {
    if (!res.headersSent) res.status(500).json({ error: `GeoIP error: ${err.message}` });
  });
};

exports.checkHTTP = async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL wajib diisi.' });

  let targetUrl;
  try {
    targetUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch (e) {
    return res.status(400).json({ error: 'Format URL tidak valid.' });
  }

  let validated;
  try {
    validated = await resolveAndValidateHost(targetUrl.hostname);
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }

  const { resolvedIp } = validated;
  const client = targetUrl.protocol === 'https:' ? https : http;
  const start = Date.now();

  // Pin connection to resolvedIp with explicit Host header to prevent DNS Rebinding Attacks
  const requestOptions = {
    hostname: resolvedIp,
    port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
    path: targetUrl.pathname + targetUrl.search,
    method: 'GET',
    headers: {
      'Host': targetUrl.host,
      'User-Agent': 'IT-Toolbox/1.0'
    },
    servername: targetUrl.hostname // TLS SNI extension
  };

  const request = client.request(requestOptions, (response) => {
    const elapsed = Date.now() - start;
    if (!res.headersSent) {
      res.json({
        url: targetUrl.href,
        statusCode: response.statusCode,
        statusMessage: response.statusMessage,
        responseTimeMs: elapsed,
        headers: response.headers
      });
    }
    response.destroy();
  });

  request.setTimeout(7000, () => {
    request.destroy();
    if (!res.headersSent) res.status(504).json({ error: 'HTTP request timeout (7s).' });
  });

  request.on('error', (err) => {
    if (!res.headersSent) res.status(500).json({ error: `Gagal HTTP request: ${err.message}` });
  });

  request.end();
};
