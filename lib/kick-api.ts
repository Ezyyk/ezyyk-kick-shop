import crypto from 'crypto';
import { getSetting, setSetting } from './db';

async function getStoredTokens(type: 'bot' | 'broadcaster') {
  const settingKey = type === 'bot' ? 'kick_tokens_bot' : 'kick_tokens_broadcaster';
  try {
    const data = await getSetting(settingKey);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`[KICK-API] Error reading ${type} tokens from DB:`, e);
  }
  return null;
}

async function saveTokens(type: 'bot' | 'broadcaster', tokens: any) {
  const settingKey = type === 'bot' ? 'kick_tokens_bot' : 'kick_tokens_broadcaster';
  try {
    await setSetting(settingKey, JSON.stringify(tokens));
    console.log(`[KICK-API] ${type} tokens saved to DB successfully.`);
  } catch (e) {
    console.error(`[KICK-API] Error saving ${type} tokens to DB:`, e);
  }
}

async function refreshAccessToken(type: 'bot' | 'broadcaster'): Promise<string | null> {
  const tokens = await getStoredTokens(type);
  if (!tokens || !tokens.refresh_token) {
    console.error(`[KICK-API] No refresh token available for ${type}`);
    return null;
  }

  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  console.log(`[KICK-API] Refreshing ${type} access token...`);

  try {
    const response = await fetch('https://id.kick.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refresh_token,
      }),
    });

    if (!response.ok) {
      console.error(`[KICK-API] Failed to refresh ${type} token:`, await response.text());
      return null;
    }

    const data = await response.json();
    await saveTokens(type, data);
    return data.access_token;
  } catch (error) {
    console.error(`[KICK-API] Error refreshing ${type} token:`, error);
    return null;
  }
}

// Kick public key for webhook signature verification
const KICK_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq/+l1WnlRrGSolDMA+A8
6rAhMbQGmQ2SapVcGM3zq8ANXjnhDWocMqfWcTd95btDydITa10kDvHzw9WQOqp2
MZI7ZyrfzJuz5nhTPCiJwTwnEtWft7nV14BYRDHvlfqPUaZ+1KR4OCaO/wWIk/rQ
L/TjY0M70gse8rlBkbo2a8rKhu69RQTRsoaf4DVhDPEeSeI5jVrRDGAMGL3cGuyY
6CLKGdjVEM78g3JfYOvDU/RvfqD7L89TZ3iN94jrmWdGz34JNlEI5hqK8dd7C5EF
BEbZ5jgB8s8ReQV8H+MkuffjdAj3ajDDX3DOJMIut1lBrUVD1AaSrGCKHooWoL2e
twIDAQAB
-----END PUBLIC KEY-----`;

/**
 * Verify webhook signature from Kick
 * Signature = RSA-SHA256(messageId.timestamp.body) signed with Kick's private key
 */
export function verifyWebhookSignature(
  messageId: string,
  timestamp: string,
  body: string,
  signature: string
): boolean {
  try {
    const message = `${messageId}.${timestamp}.${body}`;
    const signatureBuffer = Buffer.from(signature, 'base64');
    
    const verifier = crypto.createVerify('SHA256');
    verifier.update(message);
    verifier.end();
    
    return verifier.verify(KICK_PUBLIC_KEY, signatureBuffer);
  } catch (error) {
    console.error('[KICK-API] Signature verification failed:', error);
    return false;
  }
}

/**
 * Get an App Access Token using client credentials flow
 */
async function getAppAccessToken(): Promise<string | null> {
  try {
    const clientId = process.env.KICK_CLIENT_ID;
    const clientSecret = process.env.KICK_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('[KICK-API] Missing KICK_CLIENT_ID or KICK_CLIENT_SECRET');
      return null;
    }

    const response = await fetch('https://id.kick.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      console.error('[KICK-API] Failed to get app access token:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('[KICK-API] Error getting app access token:', error);
    return null;
  }
}

async function getAccessToken(type: 'bot' | 'broadcaster'): Promise<string | null> {
  const tokens = await getStoredTokens(type);
  if (tokens && tokens.access_token) {
    return tokens.access_token;
  }

  const envToken = type === 'bot' ? process.env.KICK_BOT_TOKEN : process.env.KICK_BROADCASTER_TOKEN;
  if (envToken) return envToken;
  
  return await getAppAccessToken();
}

/**
 * Send a chat message to the broadcaster's channel
 */
export async function sendChatMessage(content: string, broadcasterUserId?: number, chatId?: string | number): Promise<boolean> {
  try {
    const token = await getAccessToken('bot');
    if (!token) {
      console.error('[KICK-API] No bot access token available to send chat message');
      return false;
    }

    const buid = broadcasterUserId || parseInt(process.env.KICK_BROADCASTER_USER_ID || '0');
    if (!buid) {
      console.error('[KICK-API] No broadcaster user ID configured');
      return false;
    }

    const payload: any = {
      broadcaster_user_id: buid,
      content: content,
      type: 'user',
      chat_id: chatId || String(buid), // Fallback to broadcaster's user ID as chat ID
    };

    console.log(`[KICK-API] Using token: ${token.substring(0, 5)}...`);
    console.log(`[KICK-API] Sending chat payload:`, payload);

    let response = await fetch('https://api.kick.com/public/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
      body: JSON.stringify(payload),
    });

    // Handle token expiration
    if (response.status === 401) {
      console.log('[KICK-API] Bot token expired (401), attempting refresh...');
      const newToken = await refreshAccessToken('bot');
      if (newToken) {
        response = await fetch('https://api.kick.com/public/v1/chat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            'Accept': '*/*',
          },
          body: JSON.stringify(payload),
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[KICK-API] Failed to send chat message:', response.status, errorText);
      return false;
    }

    const data = await response.json();
    console.log('[KICK-API] Chat message sent:', data);
    return true;
  } catch (error) {
    console.error('[KICK-API] Error sending chat message:', error);
    return false;
  }
}

/**
 * Subscribe to webhook events for the broadcaster's channel
 */
export async function subscribeToEvents(webhookUrl: string): Promise<boolean> {
  try {
    const token = await getAccessToken('broadcaster');
    if (!token) {
      console.error('[KICK-API] No broadcaster access token available for subscriptions');
      return false;
    }

    const buid = parseInt(process.env.KICK_BROADCASTER_USER_ID || '0');
    if (!buid) {
      console.error('[KICK-API] No broadcaster user ID configured');
      return false;
    }

    const events = [
      { name: 'chat.message.sent', version: 1 },
      { name: 'channel.subscription.new', version: 1 },
      { name: 'channel.subscription.renewal', version: 1 },
      { name: 'channel.subscription.gifts', version: 1 },
      { name: 'kicks.gifted', version: 1 },
      { name: 'livestream.status.updated', version: 1 },
    ];

    let response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
      body: JSON.stringify({
        broadcaster_user_id: buid,
        events: events,
        method: 'webhook',
      }),
    });

    // Handle token expiration
    if (response.status === 401) {
      console.log('[KICK-API] Broadcaster token expired (401), attempting refresh...');
      const newToken = await refreshAccessToken('broadcaster');
      if (newToken) {
        response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            'Accept': '*/*',
          },
          body: JSON.stringify({
            broadcaster_user_id: buid,
            events: events,
            method: 'webhook',
          }),
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[KICK-API] Failed to subscribe to events:', response.status, errorText);
      return false;
    }

    const data = await response.json();
    console.log('[KICK-API] Subscribed to events:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('[KICK-API] Error subscribing to events:', error);
    return false;
  }
}

/**
 * Get current event subscriptions
 */
export async function getEventSubscriptions(): Promise<unknown[]> {
  try {
    const token = await getAccessToken('broadcaster');
    if (!token) return [];

    let response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
      },
    });

    if (response.status === 401) {
      const newToken = await refreshAccessToken('broadcaster');
      if (newToken) {
        response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Accept': '*/*',
          },
        });
      }
    }

    if (!response.ok) return [];

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[KICK-API] Error getting subscriptions:', error);
    return [];
  }
}
