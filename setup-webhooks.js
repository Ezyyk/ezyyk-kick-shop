/**
 * Setup Kick Webhooks
 * 
 * This script helps you:
 * 1. Get an OAuth token with the right scopes
 * 2. Register webhook event subscriptions
 * 
 * Usage:
 *   node setup-webhooks.js              - Show OAuth URL to authorize
 *   node setup-webhooks.js subscribe    - Subscribe to webhook events
 *   node setup-webhooks.js list         - List current subscriptions
 *   node setup-webhooks.js token <code> - Exchange auth code for token
 */

require('dotenv').config({ path: '.env.local' });

const CLIENT_ID = process.env.KICK_CLIENT_ID;
const CLIENT_SECRET = process.env.KICK_CLIENT_SECRET;
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || 'https://your-domain.com';
const BROADCASTER_USER_ID = process.env.KICK_BROADCASTER_USER_ID;

const SCOPES = 'user:read chat:write events:subscribe channel:read';

const crypto = require('crypto');

// Generate PKCE verifier and challenge
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

// We need to store the verifier to exchange the code later
const fs = require('fs');
const PKCE_FILE = '.pkce_verifier';

async function getAppToken() {
  const response = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    console.error('Failed to get app token:', await response.text());
    return null;
  }

  const data = await response.json();
  console.log('✅ App Access Token obtained');
  console.log('   Token:', data.access_token?.substring(0, 20) + '...');
  console.log('   Scope:', data.scope);
  return data.access_token;
}

async function exchangeCode(code) {
  let verifier = '';
  try {
    verifier = fs.readFileSync(PKCE_FILE, 'utf8');
  } catch (e) {
    console.error('❌ Could not find PKCE verifier. Did you run the script without "token" first?');
    return null;
  }

  const response = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: 'http://localhost:3000/api/auth/callback/kick',
      code_verifier: verifier
    }),
  });

  if (!response.ok) {
    console.error('Failed to exchange code:', await response.text());
    return null;
  }

  const data = await response.json();
  console.log('\n✅ Tokens obtained!');
  console.log('   Access Token:', data.access_token);
  console.log('   Refresh Token:', data.refresh_token);
  console.log('   Scope:', data.scope);
  console.log('\n👉 Add this to your .env.local:');
  console.log(`   KICK_BROADCASTER_TOKEN="${data.access_token}"`);
  
  // Cleanup verifier
  try { fs.unlinkSync(PKCE_FILE); } catch(e) {}
  
  return data;
}

async function subscribeToEvents(token) {
  if (!BROADCASTER_USER_ID) {
    console.error('❌ KICK_BROADCASTER_USER_ID not set in .env.local');
    return;
  }

  const events = [
    { name: 'chat.message.sent', version: 1 },
    { name: 'channel.subscription.new', version: 1 },
    { name: 'channel.subscription.renewal', version: 1 },
    { name: 'channel.subscription.gifts', version: 1 },
    { name: 'kicks.gifted', version: 1 },
    { name: 'livestream.status.updated', version: 1 },
  ];

  console.log(`\n📡 Subscribing to ${events.length} events...`);
  console.log(`   Webhook URL: ${WEBHOOK_BASE_URL}/api/kick-webhook`);
  console.log(`   Broadcaster ID: ${BROADCASTER_USER_ID}`);

  const response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': '*/*',
    },
    body: JSON.stringify({
      broadcaster_user_id: parseInt(BROADCASTER_USER_ID),
      events: events,
      method: 'webhook',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ Failed to subscribe (${response.status}):`, error);
    return;
  }

  const data = await response.json();
  console.log('\n✅ Subscribed to events:');
  if (data.data) {
    data.data.forEach(sub => {
      const status = sub.error ? `❌ ${sub.error}` : `✅ ID: ${sub.subscription_id}`;
      console.log(`   ${sub.name} - ${status}`);
    });
  }
}

async function listSubscriptions(token) {
  const response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': '*/*',
    },
  });

  if (!response.ok) {
    console.error('Failed to list subscriptions:', await response.text());
    return;
  }

  const data = await response.json();
  console.log('\n📋 Current Subscriptions:');
  if (data.data && data.data.length > 0) {
    data.data.forEach(sub => {
      console.log(`   ${sub.event} (ID: ${sub.id}) - broadcaster: ${sub.broadcaster_user_id}`);
    });
  } else {
    console.log('   No subscriptions found.');
  }
}

async function main() {
  const command = process.argv[2];

  console.log('🤖 Kick Webhook Setup\n');

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing KICK_CLIENT_ID or KICK_CLIENT_SECRET in .env.local');
    process.exit(1);
  }

  if (!command || command === 'help') {
    // Generate PKCE
    const { verifier, challenge } = generatePKCE();
    fs.writeFileSync(PKCE_FILE, verifier);

    // Show OAuth URL
    const redirectUri = encodeURIComponent('http://localhost:3000/api/auth/callback/kick');
    const scope = encodeURIComponent(SCOPES);
    const oauthUrl = `https://id.kick.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&code_challenge=${challenge}&code_challenge_method=S256&state=webhook-setup`;
    
    console.log('📋 Available commands:');
    console.log('   node setup-webhooks.js              - Show this help');
    console.log('   node setup-webhooks.js subscribe    - Subscribe to events (needs token)');
    console.log('   node setup-webhooks.js list         - List subscriptions');
    console.log('   node setup-webhooks.js token <code> - Exchange auth code for token');
    console.log('\n🔗 OAuth URL (open in browser to authorize):');
    console.log(`\n${oauthUrl}\n`);
    console.log('After authorizing, you will be redirected. Copy the "code" from the URL and run:');
    console.log('   node setup-webhooks.js token YOUR_CODE\n');
    return;
  }

  if (command === 'token') {
    const code = process.argv[3];
    if (!code) {
      console.error('❌ Usage: node setup-webhooks.js token <authorization_code>');
      return;
    }
    await exchangeCode(code);
    return;
  }

  // For subscribe and list, we need a token
  const token = process.env.KICK_BROADCASTER_TOKEN || await getAppToken();
  if (!token) {
    console.error('❌ Could not get access token');
    return;
  }

  if (command === 'subscribe') {
    await subscribeToEvents(token);
  } else if (command === 'list') {
    await listSubscriptions(token);
  } else {
    console.error(`❌ Unknown command: ${command}`);
  }
}

main().catch(console.error);
