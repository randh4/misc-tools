window.ToolboxHandlers = {
  // 1. SUBNET CALCULATOR
  'subnet-calculator:calculate': () => {
    const ip = document.getElementById('input-ip')?.value.trim();
    const cidr = parseInt(document.getElementById('input-cidr')?.value, 10);
    if (!ip || isNaN(cidr) || cidr < 0 || cidr > 32) throw new Error('Format IP atau CIDR (0-32) tidak valid.');

    const ipParts = ip.split('.').map(Number);
    if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) throw new Error('Format IPv4 tidak valid.');

    const ipNum = ((ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]) >>> 0;
    const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const netNum = (ipNum & mask) >>> 0;
    const broadNum = (netNum | (~mask >>> 0)) >>> 0;

    const numToIp = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

    document.getElementById('out-network').textContent = numToIp(netNum);
    document.getElementById('out-broadcast').textContent = numToIp(broadNum);
    document.getElementById('out-netmask').textContent = numToIp(mask);
    document.getElementById('out-hosts').textContent = cidr >= 31 ? '0' : (broadNum - netNum - 1).toLocaleString();
  },

  // 2. JWT DECODER
  'jwt-decoder:convert': () => {
    const rawJwt = document.getElementById('input-jwt')?.value.trim();
    if (!rawJwt) throw new Error('JWT token kosong.');

    const parts = rawJwt.split('.');
    if (parts.length !== 3) throw new Error('Format JWT tidak valid (harus 3 segment dipisah titik).');

    const b64Decode = str => decodeURIComponent(atob(str.replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

    try {
      document.getElementById('out-jwt-header').value = JSON.stringify(JSON.parse(b64Decode(parts[0])), null, 2);
      document.getElementById('out-jwt-payload').value = JSON.stringify(JSON.parse(b64Decode(parts[1])), null, 2);
    } catch (e) {
      throw new Error('Gagal decode JSON Web Token.');
    }
  },

  // 3. SSL CHECKER
  'ssl-checker:check': async () => {
    const host = document.getElementById('input-host')?.value.trim();
    const port = document.getElementById('input-port')?.value.trim() || '443';
    if (!host) throw new Error('Hostname/domain wajib diisi.');

    const res = await fetch('/tools/api/ssl-checker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, port })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memeriksa SSL.');

    document.getElementById('out-ssl-valid-to').textContent = new Date(data.validTo).toLocaleString();
    document.getElementById('out-ssl-days').textContent = `${data.daysRemaining} hari`;
    document.getElementById('out-ssl-issuer').textContent = data.issuer;
    document.getElementById('out-ssl-san').textContent = data.san;
  },

  // 4. PASSWORD GENERATOR
  'password-generator:generate': () => {
    const len = parseInt(document.getElementById('input-length')?.value || '20', 10);
    const withSymbols = document.getElementById('chk-symbols')?.checked;
    const withNumbers = document.getElementById('chk-numbers')?.checked;

    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    if (withNumbers) chars += '0123456789';
    if (withSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const arr = new Uint32Array(len);
    window.crypto.getRandomValues(arr);
    const pass = Array.from(arr).map(n => chars[n % chars.length]).join('');
    document.getElementById('out-password').value = pass;
  },

  // 5. HASH GENERATOR
  'hash-generator:generate': async () => {
    const text = document.getElementById('input-hash-text')?.value || '';
    const enc = new TextEncoder();
    const data = enc.encode(text);

    const hashBuffer = async (algo) => {
      const buf = await window.crypto.subtle.digest(algo, data);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    document.getElementById('out-sha256').value = await hashBuffer('SHA-256');
    document.getElementById('out-sha512').value = await hashBuffer('SHA-512');
    document.getElementById('out-sha1').value = await hashBuffer('SHA-1');
  },

  // 6. BASE64 CONVERTER
  'base64-converter:convert': (btn) => {
    const input = document.getElementById('input-b64-text')?.value;
    const mode = btn.dataset.mode;
    if (!input) throw new Error('Input text kosong.');

    if (mode === 'encode') {
      document.getElementById('out-base64').value = btoa(unescape(encodeURIComponent(input)));
    } else {
      document.getElementById('out-base64').value = decodeURIComponent(escape(atob(input.trim())));
    }
  },

  // 7. URL ENCODER
  'url-encoder:convert': (btn) => {
    const input = document.getElementById('input-url-text')?.value;
    const mode = btn.dataset.mode;
    if (!input) throw new Error('Input text kosong.');

    if (mode === 'encode') {
      document.getElementById('out-url').value = encodeURIComponent(input);
    } else {
      document.getElementById('out-url').value = decodeURIComponent(input);
    }
  },

  // 8. JSON FORMATTER
  'json-formatter:format': () => {
    const raw = document.getElementById('input-json')?.value.trim();
    if (!raw) throw new Error('JSON input kosong.');
    const parsed = JSON.parse(raw);
    document.getElementById('out-json').value = JSON.stringify(parsed, null, 2);
  },
  'json-formatter:minify': () => {
    const raw = document.getElementById('input-json')?.value.trim();
    if (!raw) throw new Error('JSON input kosong.');
    const parsed = JSON.parse(raw);
    document.getElementById('out-json').value = JSON.stringify(parsed);
  },

  // 9. YAML <-> JSON CONVERTER
  'yaml-json-converter:convert': (btn) => {
    const input = document.getElementById('input-yaml-json')?.value.trim();
    const mode = btn.dataset.mode;
    if (!input) throw new Error('Input kosong.');

    if (mode === 'to-json') {
      const lines = input.split('\n');
      const obj = {};
      lines.forEach(l => {
        const parts = l.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join(':').trim();
          obj[key] = isNaN(val) ? val.replace(/^["']|["']$/g, '') : Number(val);
        }
      });
      document.getElementById('out-yaml-json').value = JSON.stringify(obj, null, 2);
    } else {
      const parsed = JSON.parse(input);
      const yaml = Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join('\n');
      document.getElementById('out-yaml-json').value = yaml;
    }
  },

  // 10. DNS LOOKUP
  'dns-lookup:resolve': async () => {
    const domain = document.getElementById('input-dns-domain')?.value.trim();
    const type = document.getElementById('input-dns-type')?.value || 'A';
    if (!domain) throw new Error('Domain wajib diisi.');

    const res = await fetch('/tools/api/dns-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, type })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal resolve DNS.');
    document.getElementById('out-dns-result').textContent = JSON.stringify(data.records, null, 2);
  },

  // 11. PING TEST
  'ping-test:check': async () => {
    const host = document.getElementById('input-ping-host')?.value.trim();
    const port = document.getElementById('input-ping-port')?.value.trim() || '80';
    if (!host) throw new Error('Target host wajib diisi.');

    const res = await fetch('/tools/api/ping-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, port })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Host unreachable.');
    document.getElementById('out-ping-status').textContent = data.status;
    document.getElementById('out-ping-latency').textContent = `${data.latencyMs} ms`;
  },

  // 12. PORT CHECKER
  'port-checker:check': async () => {
    const host = document.getElementById('input-port-host')?.value.trim();
    const port = document.getElementById('input-port-num')?.value.trim();
    if (!host || !port) throw new Error('Host dan Port wajib diisi.');

    const res = await fetch('/tools/api/port-checker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, port })
    });

    const data = await res.json();
    document.getElementById('out-port-status').textContent = data.message;
    document.getElementById('out-port-status').className = data.open ? 'font-bold text-emerald-600' : 'font-bold text-rose-600';
  },

  // 13. WHOIS LOOKUP
  'whois-lookup:resolve': async () => {
    const domain = document.getElementById('input-whois-domain')?.value.trim();
    if (!domain) throw new Error('Domain wajib diisi.');

    const res = await fetch('/tools/api/whois-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal lookup WHOIS.');
    document.getElementById('out-whois-raw').value = data.raw;
  },

  // 14. CRONTAB GENERATOR
  'crontab-generator:explain': () => {
    const cron = document.getElementById('input-cron')?.value.trim();
    if (!cron) throw new Error('Cron expression kosong.');

    const parts = cron.split(/\s+/);
    if (parts.length !== 5) throw new Error('Cron harus memiliki 5 bagian: min hour day month weekday');
    document.getElementById('out-cron-desc').textContent = `Menit: [${parts[0]}], Jam: [${parts[1]}], Hari: [${parts[2]}], Bulan: [${parts[3]}], Hari Minggu/Pekan: [${parts[4]}]`;
  },

  // 15. REGEX TESTER
  'regex-tester:check': () => {
    const pat = document.getElementById('input-regex-pattern')?.value;
    const flags = document.getElementById('input-regex-flags')?.value || 'g';
    const str = document.getElementById('input-regex-text')?.value || '';

    const rx = new RegExp(pat, flags);
    const matches = [...str.matchAll(rx)].map(m => m[0]);
    document.getElementById('out-regex-result').textContent = matches.length ? JSON.stringify(matches, null, 2) : 'No match found.';
  },

  // 16. CHMOD CALCULATOR
  'chmod-calculator:calculate': () => {
    const calcDigit = (r, w, x) => (r ? 4 : 0) + (w ? 2 : 0) + (x ? 1 : 0);
    const u = calcDigit(document.getElementById('chk-u-r').checked, document.getElementById('chk-u-w').checked, document.getElementById('chk-u-x').checked);
    const g = calcDigit(document.getElementById('chk-g-r').checked, document.getElementById('chk-g-w').checked, document.getElementById('chk-g-x').checked);
    const o = calcDigit(document.getElementById('chk-o-r').checked, document.getElementById('chk-o-w').checked, document.getElementById('chk-o-x').checked);

    const symb = (d) => `${d & 4 ? 'r' : '-'}${d & 2 ? 'w' : '-'}${d & 1 ? 'x' : '-'}`;
    document.getElementById('out-chmod-octal').textContent = `${u}${g}${o}`;
    document.getElementById('out-chmod-symbolic').textContent = `-${symb(u)}${symb(g)}${symb(o)}`;
  },

  // 17. UUID GENERATOR
  'uuid-generator:generate': () => {
    const qty = Math.min(50, Math.max(1, parseInt(document.getElementById('input-uuid-qty')?.value || '1', 10)));
    const list = Array.from({ length: qty }, () => crypto.randomUUID()).join('\n');
    document.getElementById('out-uuid-list').value = list;
  },

  // 18. TIMESTAMP CONVERTER
  'timestamp-converter:convert': () => {
    const ep = document.getElementById('input-epoch')?.value.trim();
    const iso = document.getElementById('input-iso')?.value.trim();

    let d;
    if (ep) {
      const num = Number(ep);
      d = new Date(ep.length === 10 ? num * 1000 : num);
    } else if (iso) {
      d = new Date(iso);
    } else {
      d = new Date();
    }

    if (isNaN(d.getTime())) throw new Error('Nilai tanggal/timestamp tidak valid.');

    document.getElementById('out-time-sec').textContent = Math.floor(d.getTime() / 1000);
    document.getElementById('out-time-utc').textContent = d.toUTCString();
    document.getElementById('out-time-local').textContent = d.toLocaleString();
  },

  // 19. CURL BUILDER
  'curl-builder:generate': () => {
    const method = document.getElementById('input-curl-method')?.value || 'GET';
    const url = document.getElementById('input-curl-url')?.value.trim();
    const headers = document.getElementById('input-curl-headers')?.value.trim();
    const body = document.getElementById('input-curl-body')?.value.trim();

    if (!url) throw new Error('Endpoint URL wajib diisi.');

    let cmd = `curl -X ${method} "${url}"`;
    if (headers) {
      headers.split('\n').forEach(h => {
        if (h.trim()) cmd += ` \\\n  -H "${h.trim()}"`;
      });
    }
    if (body && method !== 'GET') {
      cmd += ` \\\n  -d '${body.replace(/'/g, "'\\''")}'`;
    }

    document.getElementById('out-curl-cmd').value = cmd;
  },

  // 20. SQL FORMATTER
  'sql-formatter:format': () => {
    const raw = document.getElementById('input-sql')?.value.trim();
    if (!raw) throw new Error('SQL query kosong.');

    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE'];
    let formatted = raw.replace(/\s+/g, ' ');
    keywords.forEach(kw => {
      const rx = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(rx, `\n${kw}`);
    });
    document.getElementById('out-sql').value = formatted.trim();
  },

  // 21. MARKDOWN PREVIEWER
  'markdown-previewer:render': () => {
    const src = document.getElementById('input-markdown')?.value || '';
    const escapeHtml = str => str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

    let html = escapeHtml(src)
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold my-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold my-2">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold my-1">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="bg-slate-200 px-1 rounded text-rose-600">$1</code>')
      .replace(/\n/gim, '<br>');

    document.getElementById('out-markdown-html').innerHTML = html;
  },

  // 22. DIFF CHECKER
  'diff-checker:check': () => {
    const orig = (document.getElementById('input-diff-orig')?.value || '').split('\n');
    const mod = (document.getElementById('input-diff-mod')?.value || '').split('\n');

    let output = '';
    const max = Math.max(orig.length, mod.length);
    for (let i = 0; i < max; i++) {
      const o = orig[i];
      const m = mod[i];
      if (o === m) {
        output += `  ${o || ''}\n`;
      } else {
        if (o !== undefined) output += `- ${o}\n`;
        if (m !== undefined) output += `+ ${m}\n`;
      }
    }
    document.getElementById('out-diff-result').textContent = output || 'Teks identik.';
  },

  // 23. IP LOOKUP
  'ip-lookup:lookup': async () => {
    const ip = document.getElementById('input-ip-target')?.value.trim();
    const res = await fetch('/tools/api/ip-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal lookup IP.');

    document.getElementById('out-ip-addr').textContent = data.query || ip;
    document.getElementById('out-ip-country').textContent = data.country || '-';
    document.getElementById('out-ip-city').textContent = `${data.city || ''}, ${data.regionName || ''}`;
    document.getElementById('out-ip-isp').textContent = `${data.isp || ''} (${data.as || '-'})`;
  },

  // 24. HTTP STATUS CHECKER
  'http-status-checker:check': async () => {
    const url = document.getElementById('input-http-url')?.value.trim();
    if (!url) throw new Error('URL wajib diisi.');

    const res = await fetch('/tools/api/http-status-checker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal request HTTP target.');

    document.getElementById('out-http-status').textContent = `${data.statusCode} ${data.statusMessage}`;
    document.getElementById('out-http-time').textContent = `${data.responseTimeMs} ms`;
    document.getElementById('out-http-headers').textContent = JSON.stringify(data.headers, null, 2);
  },

  // 25. DOCKER RUN CONVERTER
  'docker-run-converter:convert': () => {
    const raw = document.getElementById('input-docker-run')?.value.trim();
    if (!raw) throw new Error('Perintah docker run kosong.');

    const parts = raw.split(/\s+/);
    let image = 'app-image:latest';
    let containerName = 'app_service';
    const ports = [];
    const volumes = [];
    const envs = [];

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '--name' && parts[i + 1]) containerName = parts[++i];
      else if ((parts[i] === '-p' || parts[i] === '--publish') && parts[i + 1]) ports.push(parts[++i]);
      else if ((parts[i] === '-v' || parts[i] === '--volume') && parts[i + 1]) volumes.push(parts[++i]);
      else if ((parts[i] === '-e' || parts[i] === '--env') && parts[i + 1]) envs.push(parts[++i]);
      else if (!parts[i].startsWith('-') && parts[i] !== 'docker' && parts[i] !== 'run' && i === parts.length - 1) image = parts[i];
    }

    let compose = `version: '3.8'\nservices:\n  ${containerName}:\n    image: ${image}\n    container_name: ${containerName}`;
    if (ports.length) compose += `\n    ports:\n` + ports.map(p => `      - "${p}"`).join('\n');
    if (volumes.length) compose += `\n    volumes:\n` + volumes.map(v => `      - ${v}`).join('\n');
    if (envs.length) compose += `\n    environment:\n` + envs.map(e => `      - ${e}`).join('\n');

    document.getElementById('out-docker-compose').value = compose;
  }
};
