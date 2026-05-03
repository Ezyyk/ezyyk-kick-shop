/**
 * Next.js Instrumentation - runs once when the server starts.
 * Sets up a 5-minute interval to award points to active chatters.
 */
export async function register() {
  // Only run on the server (not during build or in edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[BOT] Starting background point ticker (every 5 minutes)...');
    
    const TICK_INTERVAL = 30 * 1000; // 30 seconds
    
    // Start the ticker after a short delay to let the server fully initialize
    setTimeout(() => {
      setInterval(async () => {
        try {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const token = process.env.BOT_CRON_SECRET || process.env.ADMIN_PASSWORD;
          
          const response = await fetch(`${baseUrl}/api/bot-tick`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.usersAwarded > 0) {
              console.log(`[BOT-TICK] ✅ Awarded points to ${data.usersAwarded} users`);
            }
          } else {
            console.error('[BOT-TICK] ❌ Tick failed:', response.status);
          }
        } catch (error) {
          console.error('[BOT-TICK] ❌ Tick error:', error);
        }
      }, TICK_INTERVAL);
      
      console.log('[BOT] ✅ Point ticker started');
    }, 10000); // 10s delay after server start
  }
}
