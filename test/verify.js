// filepath: test/verify.js
import assert from 'node:assert';

function safeParse(val, fallback) {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

assert.deepStrictEqual(safeParse('invalid json{', []), []);
assert.deepStrictEqual(safeParse('{"valid":1}', {}), { valid: 1 });

const payload = '"><script>alert(1)</script>';
const escaped = escapeHtml(payload);
assert.strictEqual(escaped.includes('<script>'), false);
assert.strictEqual(escaped, '&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;');

const tool = { id: '"><img src=x onerror=alert(1)>', name: '<b onmouseover=alert(1)>t</b>' };
const sidebarEntry = `<button data-tool="${escapeHtml(tool.id)}">${escapeHtml(tool.name)}</button>`;
assert.strictEqual(sidebarEntry.includes('<img'), false);
assert.strictEqual(sidebarEntry.includes('<b'), false);

console.log('Semua cek integritas keamanan lolos.');