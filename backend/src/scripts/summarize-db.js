const fs = require('fs');
const path = require('path');
const dbStructure = require('./actual-db-structure.json');

console.log('=== DATABASE AUDIT SUMMARY ===');
console.log(`Total Tables: ${Object.keys(dbStructure).length}`);

for (const [table, info] of Object.entries(dbStructure)) {
  const colNames = info.columns.map(c => c.field);
  console.log(`- Table [${table}] (${colNames.length} columns):`);
  console.log(`  Columns: ${colNames.join(', ')}`);
}
