const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'points.sqlite'));

db.serialize(() => {
  db.run('DELETE FROM purchase_history');
  db.run('DELETE FROM users');
  console.log('Cleared users and purchase history successfully.');
});
