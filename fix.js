const fs = require('fs');
const file = 'e:/websites/SMS/backend/src/services/frontoffice.service.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('_sanitizeData')) {
    content = content.replace('class FrontOfficeService {\\n  constructor() {', 'class FrontOfficeService {\\n  _sanitizeData(data) {\\n    const cleaned = {};\\n    for (const [key, value] of Object.entries(data)) {\\n      cleaned[key] = value === \\'\\' ? null : value;\\n    }\\n    return cleaned;\\n  }\\n\\n  constructor() {');
}

content = content.split('const keys = Object.keys(data);').join('const cleanData = this._sanitizeData(data);\\n    const keys = Object.keys(cleanData);');
content = content.split('const values = Object.values(data);').join('const values = Object.values(cleanData);');

fs.writeFileSync(file, content, 'utf8');
console.log('Updated frontoffice.service.js');
