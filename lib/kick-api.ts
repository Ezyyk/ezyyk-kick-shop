import crypto from 'crypto';

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

/**
 * Get a valid access token - tries bot token first, then broadcaster token, falls back to app token
 */
async function getAccessToken(): Promise<string | null> {
  // Try the dedicated bot token first
  const botToken = process.env.KICK_BOT_TOKEN;
  if (botToken) {
    return botToken;
  }

  // Try the broadcaster's stored token next
  const broadcasterToken = process.env.KICK_BROADCASTER_TOKEN;
  if (broadcasterToken) {
    return broadcasterToken;
  }
  
  // Fall back to app access token
  return await getAppAccessToken();
}

/**
 * Send a chat message to the broadcaster's channel
 */
export async function sendChatMessage(content: string, broadcasterUserId?: number, chatId?: string | number): Promise<boolean> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.error('[KICK-API] No access token available to send chat message');
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
    };
    if (chatId) {
      payload.chat_id = chatId;
    }

    console.log(`[KICK-API] Sending chat payload:`, payload);

    const response = await fetch('https://api.kick.com/public/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
      body: JSON.stringify(payload),
    });

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
    const token = await getAccessToken();
    if (!token) {
      console.error('[KICK-API] No access token available');
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

    const response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
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
    const token = await getAccessToken();
    if (!token) return [];

    const response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[KICK-API] Error getting subscriptions:', error);
    return [];
  }
}
