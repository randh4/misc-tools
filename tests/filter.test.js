// # filepath: tests/filter.test.js
const assert = require('assert');
const tools = require('../data/tools.json');

function filterTools(list, category) {
  if (category === 'all') return list;
  return list.filter(t => t.category === category);
}

// 1. Total tools minimum 25
assert.ok(tools.length >= 25, `Expected >= 25 tools, got ${tools.length}`);

// 2. Kategori terdefinisi lengkap
const categories = ['network', 'security', 'devops', 'crypto-encoding', 'formatter-converter'];
categories.forEach(cat => {
  const filtered = filterTools(tools, cat);
  assert.ok(filtered.length > 0, `Category ${cat} should have tools`);
});

// 3. Filter 'all' return semua data
assert.strictEqual(filterTools(tools, 'all').length, tools.length);

// 4. Filter invalid category return empty array
assert.strictEqual(filterTools(tools, 'nonexistent').length, 0);

console.log(`Validation passed: ${tools.length} tools verified across ${categories.length} categories.`);