import re

with open('e:/websites/SMS/backend/src/services/frontoffice.service.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add _sanitizeData method at the top of the class
if '_sanitizeData' not in content:
    content = content.replace('class FrontOfficeService {\n  constructor() {', 'class FrontOfficeService {\n  _sanitizeData(data) {\n    const cleaned = {};\n    for (const [key, value] of Object.entries(data)) {\n      cleaned[key] = value === \'\' ? null : value;\n    }\n    return cleaned;\n  }\n\n  constructor() {')

# Replace Object.keys(data) with Object.keys(this._sanitizeData(data))
content = content.replace('const keys = Object.keys(data);', 'const cleanData = this._sanitizeData(data);\n    const keys = Object.keys(cleanData);')
content = content.replace('const values = Object.values(data);', 'const values = Object.values(cleanData);')

with open('e:/websites/SMS/backend/src/services/frontoffice.service.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated frontoffice.service.js")
