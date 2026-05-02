import { createClient, Client } from '@libsql/client';

let client: Client | null = null;

/**
 * Compatibility wrapper to maintain sqlite-like API (get, all, run, exec)
 * while using the LibSQL client for Turso.
 */
class LibSqlCompatibilityWrapper {
  constructor(private client: Client) {}

  async get(sql: string, ...args: any[]) {
    const res = await this.client.execute({ sql, args });
    return res.rows[0] as any;
  }

  async all(sql: string, ...args: any[]) {
    const res = await this.client.execute({ sql, args });
    return res.rows as any[];
  }

  async run(sql: string, ...args: any[]) {
    const res = await this.client.execute({ sql, args });
    return { lastID: Number(res.lastInsertRowid), changes: res.rowsAffected };
  }

  async exec(sql: string) {
    await this.client.execute(sql);
  }
}

let wrapper: LibSqlCompatibilityWrapper | null = null;

export async function getDb() {
  if (wrapper) return wrapper;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not defined');
  }

  client = createClient({
    url: url,
    authToken: authToken,
  });

  wrapper = new LibSqlCompatibilityWrapper(client);

  // Initialize tables if they don't exist
  await wrapper.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      points INTEGER DEFAULT 0,
      is_sub BOOLEAN DEFAULT 0,
      last_ping DATETIME,
      trade_url TEXT,
      avatar_url TEXT
    );
  `);

  await wrapper.exec(`
    CREATE TABLE IF NOT EXISTS purchase_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      user_name TEXT,
      item_id TEXT NOT NULL,
      item_title TEXT NOT NULL,
      cost INTEGER NOT NULL,
      user_message TEXT,
      purchased_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await wrapper.exec(`
    CREATE TABLE IF NOT EXISTS shop_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      cost INTEGER NOT NULL,
      image_url TEXT,
      category TEXT DEFAULT 'other',
      stock INTEGER DEFAULT -1,
      image_scale REAL DEFAULT 1.0,
      requires_message BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now'))
    );
  `);

  await wrapper.exec(`
    CREATE TABLE IF NOT EXISTS giveaways (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      ticket_cost INTEGER NOT NULL DEFAULT 100,
      ends_at DATETIME NOT NULL,
      winner_name TEXT,
      status TEXT DEFAULT 'active',
      image_scale REAL DEFAULT 1.0,
      created_at DATETIME DEFAULT (datetime('now'))
    );
  `);

  await wrapper.exec(`
    CREATE TABLE IF NOT EXISTS giveaway_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      giveaway_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      purchased_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (giveaway_id) REFERENCES giveaways(id)
    );
  `);

  await wrapper.exec(`
    CREATE TABLE IF NOT EXISTS bot_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      username TEXT NOT NULL,
      kick_user_id INTEGER,
      points_awarded INTEGER DEFAULT 0,
      details TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    );
  `);

  await wrapper.exec(`
    CREATE TABLE IF NOT EXISTS chat_activity (
      username TEXT PRIMARY KEY,
      kick_user_id INTEGER,
      last_chat_at DATETIME,
      last_points_at DATETIME,
      is_sub BOOLEAN DEFAULT 0
    );
  `);

  await wrapper.exec(`
    CREATE TABLE IF NOT EXISTS bot_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  await wrapper.exec(`
    CREATE TABLE IF NOT EXISTS redeem_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      points INTEGER DEFAULT 10,
      is_used BOOLEAN DEFAULT 0,
      used_by_user_id TEXT,
      used_at DATETIME,
      created_at DATETIME DEFAULT (datetime('now'))
    );
  `);

  // Migrations
  try {
    await wrapper.exec('ALTER TABLE shop_items ADD COLUMN stock INTEGER DEFAULT -1');
  } catch (e) {}

  try {
    await wrapper.exec('ALTER TABLE purchase_history ADD COLUMN is_sent BOOLEAN DEFAULT 0');
  } catch (e) {}

  try {
    await wrapper.exec('ALTER TABLE shop_items ADD COLUMN image_scale REAL DEFAULT 1.0');
  } catch (e) {}

  try {
    await wrapper.exec('ALTER TABLE giveaways ADD COLUMN image_scale REAL DEFAULT 1.0');
  } catch (e) {}

  try {
    await wrapper.exec('ALTER TABLE giveaways ADD COLUMN is_sent BOOLEAN DEFAULT 0');
  } catch (e) {}

  try {
    await wrapper.exec('ALTER TABLE users ADD COLUMN avatar_url TEXT');
  } catch (e) {}

  try {
    await wrapper.exec('ALTER TABLE shop_items ADD COLUMN requires_message BOOLEAN DEFAULT 0');
  } catch (e) {}

  try {
    await wrapper.exec('ALTER TABLE purchase_history ADD COLUMN user_message TEXT');
  } catch (e) {}

  return wrapper;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  await db.run(
    'INSERT INTO bot_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
    key, value, value
  );
}

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  const db = await getDb();
  const res = await db.get('SELECT value FROM bot_settings WHERE key = ?', key);
  return res ? res.value : defaultValue;
}

export async function createRedeemCode(code: string, points: number = 10) {
  const db = await getDb();
  await db.run('INSERT INTO redeem_codes (code, points) VALUES (?, ?)', code, points);
}

export async function deactivateOldCodes() {
  const db = await getDb();
  await db.run('UPDATE redeem_codes SET is_used = 1 WHERE is_used = 0');
}

export async function redeemCode(code: string, userId: string) {
  const db = await getDb();
  const existingCode = await db.get('SELECT * FROM redeem_codes WHERE code = ? AND is_used = 0', code);
  
  if (!existingCode) return { success: false, message: 'Kód je neplatný nebo již byl použit.' };
  
  await db.run(
    'UPDATE redeem_codes SET is_used = 1, used_by_user_id = ?, used_at = datetime(\'now\') WHERE code = ?',
    userId, code
  );
  
  await addPoints(userId, existingCode.points);
  
  return { success: true, points: existingCode.points };
}

export async function getUser(id: string) {
  const db = await getDb();
  return await db.get('SELECT * FROM users WHERE id = ?', id);
}

export async function getUserByName(name: string) {
  const db = await getDb();
  return await db.get('SELECT * FROM users WHERE name = ?', name);
}

export async function createUser(id: string, name: string) {
  const db = await getDb();
  await db.run('INSERT OR IGNORE INTO users (id, name, points) VALUES (?, ?, 0)', id, name);
  return await getUser(id);
}

export async function findOrCreateUserByName(name: string) {
  const db = await getDb();
  let user = await db.get('SELECT * FROM users WHERE name = ?', name);
  if (!user) {
    await db.run('INSERT OR IGNORE INTO users (id, name, points) VALUES (?, ?, 0)', name, name);
    user = await db.get('SELECT * FROM users WHERE name = ?', name);
  }
  return user;
}

export async function addPoints(id: string, points: number) {
  const db = await getDb();
  await db.run('UPDATE users SET points = points + ?, last_ping = datetime(\'now\') WHERE id = ?', points, id);
  return await getUser(id);
}

export async function addPointsByName(name: string, points: number) {
  const db = await getDb();
  const user = await findOrCreateUserByName(name);
  if (user) {
    await db.run('UPDATE users SET points = points + ?, last_ping = datetime(\'now\') WHERE name = ?', points, name);
  }
  return await getUserByName(name);
}

export async function spendPoints(id: string, points: number) {
  const db = await getDb();
  const user = await getUser(id);
  if (!user || user.points < points) return false;
  
  await db.run('UPDATE users SET points = points - ? WHERE id = ?', points, id);
  return true;
}

export async function updateTradeUrl(id: string, tradeUrl: string) {
  const db = await getDb();
  await db.run('UPDATE users SET trade_url = ? WHERE id = ?', tradeUrl, id);
  return await getUser(id);
}

export async function logBotEvent(eventType: string, username: string, kickUserId: number | null, pointsAwarded: number, details?: string) {
  const db = await getDb();
  await db.run(
    'INSERT INTO bot_events (event_type, username, kick_user_id, points_awarded, details) VALUES (?, ?, ?, ?, ?)',
    eventType, username, kickUserId, pointsAwarded, details || null
  );
}

export async function getRecentBotEvents(limit: number = 50) {
  const db = await getDb();
  return await db.all('SELECT * FROM bot_events ORDER BY created_at DESC LIMIT ?', limit);
}

export async function updateChatActivity(username: string, kickUserId: number | null, isSub: boolean) {
  const db = await getDb();
  await db.run(
    `INSERT INTO chat_activity (username, kick_user_id, last_chat_at, is_sub)
     VALUES (?, ?, datetime('now'), ?)
     ON CONFLICT(username) DO UPDATE SET
       last_chat_at = datetime('now'),
       kick_user_id = COALESCE(?, kick_user_id),
       is_sub = ?`,
    username, kickUserId, isSub ? 1 : 0, kickUserId, isSub ? 1 : 0
  );
}

export async function getActiveChattersDueForPoints() {
  const db = await getDb();
  return await db.all(
    `SELECT ca.username, ca.kick_user_id, ca.is_sub
     FROM chat_activity ca
     WHERE ca.last_chat_at >= datetime('now', '-30 minutes')
       AND (ca.last_points_at IS NULL OR ca.last_points_at <= datetime('now', '-5 minutes'))`
  );
}

export async function markChatPointsAwarded(username: string) {
  const db = await getDb();
  await db.run(
    `UPDATE chat_activity SET last_points_at = datetime('now') WHERE username = ?`,
    username
  );
}

export async function updateUserSubStatus(name: string, isSub: boolean) {
  const db = await getDb();
  await db.run('UPDATE users SET is_sub = ? WHERE name = ?', isSub ? 1 : 0, name);
  await db.run('UPDATE chat_activity SET is_sub = ? WHERE username = ?', isSub ? 1 : 0, name);
}

export async function getTopUsers(limit: number = 20) {
  const db = await getDb();
  return await db.all('SELECT name, points, is_sub FROM users ORDER BY points DESC LIMIT ?', limit);
}

export async function getAllUsers() {
  const db = await getDb();
  return await db.all('SELECT id, name, points, is_sub, last_ping, trade_url FROM users ORDER BY points DESC');
}

export async function logPurchase(userId: string, userName: string, itemId: string, itemTitle: string, cost: number, userMessage: string = '') {
  const db = await getDb();
  await db.run(
    'INSERT INTO purchase_history (user_id, user_name, item_id, item_title, cost, user_message) VALUES (?, ?, ?, ?, ?, ?)',
    userId, userName, itemId, itemTitle, cost, userMessage
  );
}

export async function getPurchaseHistory() {
  const db = await getDb();
  return await db.all(
    'SELECT ph.*, u.trade_url, u.points as current_points FROM purchase_history ph LEFT JOIN users u ON ph.user_id = u.id ORDER BY ph.purchased_at DESC'
  );
}

export async function getUserPurchases(userId: string) {
  const db = await getDb();
  return await db.all(
    'SELECT * FROM purchase_history WHERE user_id = ? ORDER BY purchased_at DESC',
    userId
  );
}

export async function deletePurchase(id: number) {
  const db = await getDb();
  await db.run('DELETE FROM purchase_history WHERE id = ?', id);
}

export async function updatePurchaseStatus(id: number, isSent: boolean) {
  const db = await getDb();
  await db.run('UPDATE purchase_history SET is_sent = ? WHERE id = ?', isSent ? 1 : 0, id);
}

export async function getShopItems() {
  const db = await getDb();
  return await db.all('SELECT * FROM shop_items ORDER BY created_at DESC');
}

export async function createShopItem(id: string, title: string, description: string, cost: number, imageUrl: string, category: string, stock: number = -1, imageScale: number = 1.0, requiresMessage: boolean = false) {
  const db = await getDb();
  await db.run(
    'INSERT INTO shop_items (id, title, description, cost, image_url, category, stock, image_scale, requires_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id, title, description, cost, imageUrl, category, stock, imageScale, requiresMessage ? 1 : 0
  );
}

export async function updateShopItem(id: string, title: string, description: string, cost: number, imageUrl: string, category: string, stock: number = -1, imageScale: number = 1.0, requiresMessage: boolean = false) {
  const db = await getDb();
  await db.run(
    'UPDATE shop_items SET title = ?, description = ?, cost = ?, image_url = ?, category = ?, stock = ?, image_scale = ?, requires_message = ? WHERE id = ?',
    title, description, cost, imageUrl, category, stock, imageScale, requiresMessage ? 1 : 0, id
  );
}

export async function decrementStock(id: string) {
  const db = await getDb();
  // Jen pokud není neomezený (-1)
  const item = await db.get('SELECT stock FROM shop_items WHERE id = ?', id);
  if (item && item.stock > 0) {
    await db.run('UPDATE shop_items SET stock = stock - 1 WHERE id = ?', id);
    return true;
  }
  return item && item.stock === -1;
}

export async function deleteShopItem(id: string) {
  const db = await getDb();
  await db.run('DELETE FROM shop_items WHERE id = ?', id);
}

export async function updateUserPoints(id: string, points: number) {
  const db = await getDb();
  await db.run('UPDATE users SET points = ? WHERE id = ?', points, id);
  return await getUser(id);
}

/**
 * GIVEAWAY LOGIC
 */
export async function checkAndDrawGiveaways() {
  const db = await getDb();
  
  // Find active giveaways that have ended
  // We fetch all active ones and check date in JS to avoid SQLite timezone issues
  const active = await db.all("SELECT * FROM giveaways WHERE status = 'active'");
  const now = new Date();
  
  let drawnCount = 0;
  
  for (const g of active) {
    const dateStr = g.ends_at.includes("T") && !g.ends_at.endsWith("Z") ? g.ends_at + "Z" : g.ends_at;
    const endTime = new Date(dateStr);
    
    if (endTime <= now) {
      console.log(`[GIVEAWAY] Drawing winner for: ${g.title} (${g.id})`);
      
      const tickets = await db.all(
        'SELECT user_name FROM giveaway_tickets WHERE giveaway_id = ?',
        g.id
      );
      
      if (tickets.length > 0) {
        // Random draw
        const winner = tickets[Math.floor(Math.random() * tickets.length)];
        await db.run(
          "UPDATE giveaways SET status = 'ended', winner_name = ? WHERE id = ?",
          winner.user_name, g.id
        );
        console.log(`[GIVEAWAY] Winner drawn: ${winner.user_name}`);
      } else {
        // No tickets
        await db.run(
          "UPDATE giveaways SET status = 'ended', winner_name = NULL WHERE id = ?",
          g.id
        );
        console.log(`[GIVEAWAY] Ended with no tickets.`);
      }
      drawnCount++;
    }
  }
  return drawnCount;
}

export async function updateGiveawayStatus(id: string, isSent: boolean) {
  const db = await getDb();
  await db.run('UPDATE giveaways SET is_sent = ? WHERE id = ?', isSent ? 1 : 0, id);
}

export async function getSentRewards() {
  const db = await getDb();
  
  // Get sent shop purchases
  const shopPurchases = await db.all(`
    SELECT 
      ph.id, 
      ph.user_name, 
      ph.item_title as title, 
      ph.purchased_at as date,
      'shop' as type,
      si.image_url,
      u.avatar_url
    FROM purchase_history ph
    LEFT JOIN shop_items si ON ph.item_id = si.id
    LEFT JOIN users u ON ph.user_id = u.id
    WHERE ph.is_sent = 1
    ORDER BY ph.purchased_at DESC
  `);

  // Get sent giveaway wins
  const giveawayWins = await db.all(`
    SELECT 
      g.id, 
      g.winner_name as user_name, 
      g.title, 
      g.ends_at as date,
      'giveaway' as type,
      g.image_url,
      u.avatar_url
    FROM giveaways g
    LEFT JOIN users u ON g.winner_name = u.name
    WHERE g.status = 'ended' AND g.winner_name IS NOT NULL AND g.is_sent = 1
    ORDER BY g.ends_at DESC
  `);

  // Combine and sort by date
  return [...shopPurchases, ...giveawayWins].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
export async function getUserGiveawayHistory(userName: string) {
  const db = await getDb();
  return await db.all(`
    SELECT g.*, COUNT(gt.id) as tickets_bought, MIN(gt.purchased_at) as first_ticket_at
    FROM giveaways g
    JOIN giveaway_tickets gt ON g.id = gt.giveaway_id
    WHERE gt.user_name = ?
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `, userName);
}

export async function getAllTicketHistory() {
  const db = await getDb();
  return await db.all(`
    SELECT gt.*, g.title as giveaway_title
    FROM giveaway_tickets gt
    JOIN giveaways g ON gt.giveaway_id = g.id
    ORDER BY gt.purchased_at DESC
    LIMIT 500
  `);
}
