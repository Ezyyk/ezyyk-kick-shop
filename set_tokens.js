const fs = require('fs');
const envPath = '.env.local';
let content = fs.readFileSync(envPath, 'utf8');

const newToken = 'OGJKMJBHZTMTOWNHYY0ZYWIWLWI5ZTUTMJUXMZHINZQ2NZI1';
content = content.replace(/KICK_BOT_TOKEN=".*"/, `KICK_BOT_TOKEN="${newToken}"`);
content = content.replace(/KICK_BROADCASTER_TOKEN=".*"/, `KICK_BROADCASTER_TOKEN="${newToken}"`);

fs.writeFileSync(envPath, content);
console.log('Updated .env.local with working app access token');
