const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const CLIENT_ID = process.env.KICK_CLIENT_ID;
const CLIENT_SECRET = process.env.KICK_CLIENT_SECRET;
const CODE = 'ZGYZYZDINJITOTA0YY0ZNGZHLWE2NZQTZTQ1NJZJZJHHODU1';
const VERIFIER = 'NHr1XalvsRsEvC9IlI4FCdkr9W0MsmkwXu9QUsa6RDc';

async function exchange() {
  console.log('Exchanging code for token...');
  
  try {
    const response = await fetch('https://id.kick.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: CODE,
        redirect_uri: 'http://localhost:3000/api/auth/callback/kick',
        code_verifier: VERIFIER
      }),
    });

    if (!response.ok) {
      console.error('Failed to exchange code:', await response.text());
      return;
    }

    const data = await response.json();
    console.log('✅ Token obtained!');
    
    // Update .env.local
    let envContent = fs.readFileSync('.env.local', 'utf8');
    
    // Update BOT token (assuming this was the bot account)
    if (envContent.includes('KICK_BOT_TOKEN=')) {
      envContent = envContent.replace(/KICK_BOT_TOKEN=".*"/, `KICK_BOT_TOKEN="${data.access_token}"`);
    } else {
      envContent += `\nKICK_BOT_TOKEN="${data.access_token}"`;
    }
    
    // Also update broadcaster token just in case
    if (envContent.includes('KICK_BROADCASTER_TOKEN=')) {
      envContent = envContent.replace(/KICK_BROADCASTER_TOKEN=".*"/, `KICK_BROADCASTER_TOKEN="${data.access_token}"`);
    }

    fs.writeFileSync('.env.local', envContent);
    console.log('✅ .env.local updated with new token');
    
  } catch (e) {
    console.error('Error:', e);
  }
}

exchange();
