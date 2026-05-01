const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function test() {
  try {
    const db = await open({
      filename: './points.sqlite',
      driver: sqlite3.Database
    });
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        points INTEGER DEFAULT 0,
        is_sub BOOLEAN DEFAULT 0,
        last_ping DATETIME,
        trade_url TEXT
      );
    `);
    
    try {
      await db.exec('ALTER TABLE users ADD COLUMN trade_url TEXT;');
      console.log("Column added");
    } catch (e) {
      console.log("Column likely exists:", e.message);
    }

    const user = await db.get('SELECT * FROM users LIMIT 1');
    console.log("User:", user);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
