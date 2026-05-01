const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'points.sqlite'));

db.all('SELECT id, name, points FROM users', (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(rows);
});
