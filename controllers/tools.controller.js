// # filepath: controllers/tools.controller.js
const tls = require('tls');
const dns = require('dns').promises;
const net = require('net');
const https = require('https');
const http = require('http');

const isPrivateHost = (host) => {
  return /^(localhost|127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.|::1|0\.0\.0\.0)/i.test(host);
};

exports.checkSSL = async (req, res) => {
  const { host, port = 443 } = req.body;
  if (!host) return res.status(400).json({ error: 'Hostname/domain wajib diisi.' });

  const cleanHost = host.replace(/https?:\/\//, '').split('/')[0].split(':')[0];
  if (isPrivateHost(cleanHost)) return res.status(403).json({ error: 'Akses host privat dilarang.' });

  const targetPort = parseInt(port, 10) || 443;
  const socket = tls.connect(targetPort, cleanHost, { servername: cleanHost }, () => {
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

  const cleanDomain = domain.replace(/https?:\/\//, '').split('/')[0];
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

exports.pingHost = (req, res) => {
  const { host, port = 80 } = req.body;
  if (!host) return res.status(400).json({ error: 'Host wajib diisi.' });

  const cleanHost = host.replace(/https?:\/\//, '').split('/')[0].split(':')[0];
  if (isPrivateHost(cleanHost)) return res.status(403).json({ error: 'Akses host privat dilarang.' });

  const start = process.hrtime();
  const socket = new net.Socket();
  socket.setTimeout(5000);

  socket.connect(parseInt(port, 10) || 80, cleanHost, () => {
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

exports.checkPort = (req, res) => {
  const { host, port } = req.body;
  if (!host || !port) return res.status(400).json({ error: 'Host dan Port wajib diisi.' });

  const cleanHost = host.replace(/https?:\/\//, '').split('/')[0].split(':')[0];
  if (isPrivateHost(cleanHost)) return res.status(403).json({ error: 'Akses host privat dilarang.' });

  const targetPort = parseInt(port, 10);
  if (isNaN(targetPort) || targetPort < 1 || targetPort > 65535) {
    return res.status(400).json({ error: 'Port harus 1 - 65535.' });
  }

  const socket = new net.Socket();
  socket.setTimeout(4000);

  socket.connect(targetPort, cleanHost, () => {
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

exports.lookupWhois = (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain wajib diisi.' });

  const cleanDomain = domain.replace(/https?:\/\//, '').split('/')[0].trim();
  if (isPrivateHost(cleanDomain)) return res.status(403).json({ error: 'Domain privat tidak valid.' });

  const socket = new net.Socket();
  let buffer = '';
  socket.setTimeout(10000);

  socket.connect(43, 'whois.iana.org', () => {
    socket.write(`${cleanDomain}\r\n`);
  });

  socket.on('data', (chunk) => { buffer += chunk.toString(); });
  socket.on('end', () => {
    if (!res.headersSent) res.json({ domain: cleanDomain, raw: buffer || 'No data.' });
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

exports.lookupIP = (req, res) => {
  const rawIp = (req.body.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').replace(/^.*:/, '');
  const target = rawIp === '1' || rawIp === '' ? '8.8.8.8' : rawIp;
  if (isPrivateHost(target)) return res.status(403).json({ error: 'IP privat dilarang.' });

  // ponytail: Use HTTPS endpoint over cleartext HTTP to prevent network MITM sniffing
  https.get(`https://ipwho.is/${target}`, (apiRes) => {
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

exports.checkHTTP = (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL wajib diisi.' });

  let targetUrl;
  try {
    targetUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch (e) {
    return res.status(400).json({ error: 'Format URL tidak valid.' });
  }

  if (isPrivateHost(targetUrl.hostname)) {
    return res.status(403).json({ error: 'Akses target internal/privat dilarang (SSRF Protection).' });
  }

  const client = targetUrl.protocol === 'https:' ? https : http;
  const start = Date.now();

  const request = client.request(targetUrl, { method: 'GET', headers: { 'User-Agent': 'IT-Toolbox/1.0' } }, (response) => {
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