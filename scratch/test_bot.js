// Use global fetch
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function testChat() {
  const token = process.env.KICK_BOT_TOKEN;
  const buid = process.env.KICK_BROADCASTER_USER_ID;
  
  if (!token) {
    console.error('KICK_BOT_TOKEN is missing!');
    return;
  }
  
  console.log('Testing bot token:', token.substring(0, 10) + '...');
  
  const payload = {
    broadcaster_user_id: parseInt(buid),
    content: 'Test message from bot diagnostics',
    type: 'user',
    chat_id: String(buid)
  };

  try {
    const res = await fetch('https://api.kick.com/public/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      },
      body: JSON.stringify(payload)
    });
    
    const status = res.status;
    const text = await res.text();
    console.log('Status:', status);
    console.log('Response:', text);
  } catch (e) {
    console.error('Error:', e);
  }
}

testChat();
