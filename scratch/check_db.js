const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('points.sqlite');

db.all('SELECT * FROM settings', (err, settings) => {
  if (err) console.error(err);
  console.log('--- Settings ---');
  console.log(settings);

  db.all('SELECT * FROM redeem_codes ORDER BY id DESC LIMIT 5', (err, codes) => {
    if (err) console.error(err);
    console.log('\n--- Recent Codes ---');
    console.log(codes);
    db.close();
  });
});
