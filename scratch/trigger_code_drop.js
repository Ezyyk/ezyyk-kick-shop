const { createRedeemCode, deactivateOldCodes, getSetting, logBotEvent } = require('./lib/db');
const { sendChatMessage } = require('./lib/kick-api');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function triggerTestCodeDrop() {
  console.log('--- TRIGGERING TEST CODE DROP ---');
  
  try {
    // Deactivate old codes
    await deactivateOldCodes();
    
    // Generate a test code
    const code = 'TEST1';
    await createRedeemCode(code, 10);
    
    // Get chatroom id
    const chatroomId = await getSetting('last_chatroom_id');
    
    // Send to chat
    const message = `🎁 TEST CODE DROP! První kdo napíše kód [ ${code} ] na ezyyk.com/codes získá 10 bodů! ⚡`;
    const success = await sendChatMessage(message, undefined, chatroomId || undefined);
    
    if (success) {
      await logBotEvent('code.drop', 'system', null, 0, `Manual Test Code: ${code}`);
      console.log(`✅ Test code ${code} dropped successfully!`);
    } else {
      console.error('❌ Failed to send chat message.');
    }
  } catch (error) {
    console.error('❌ Error dropping test code:', error);
  }
}

triggerTestCodeDrop();
