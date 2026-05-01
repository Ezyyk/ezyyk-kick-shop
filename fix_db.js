const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'points.sqlite'));

db.serialize(() => {
  // For each username, find all rows, sum up points, keep one with id=name
  db.all('SELECT name, GROUP_CONCAT(id) as ids, SUM(points) as total_points, COUNT(*) as cnt FROM users GROUP BY name HAVING cnt > 1', (err, rows) => {
    if (err) { console.error(err); return; }
    if (!rows || rows.length === 0) {
      console.log('No duplicates found');
    }
    rows.forEach(row => {
      const name = row.name;
      const totalPoints = row.total_points;
      console.log(`Merging ${row.cnt} accounts for "${name}" (IDs: ${row.ids}) → total ${totalPoints} points`);
      
      // Delete ALL rows for this name
      db.run('DELETE FROM users WHERE name = ?', name, () => {
        // Insert one clean row with id = name
        db.run('INSERT INTO users (id, name, points) VALUES (?, ?, ?)', [name, name, totalPoints], () => {
          console.log(`  ✓ Created single account: id="${name}", points=${totalPoints}`);
        });
      });
    });
  });
  
  // Also fix any single accounts that have UUID as id instead of name
  db.all('SELECT * FROM users WHERE id != name', (err, rows) => {
    if (err) { console.error(err); return; }
    if (!rows || rows.length === 0) return;
    rows.forEach(row => {
      // Check if there's already a row with id = name
      db.get('SELECT * FROM users WHERE id = ?', row.name, (err, existing) => {
        if (existing) {
          // Merge points into the name-based row and delete UUID row
          db.run('UPDATE users SET points = points + ? WHERE id = ?', [row.points, row.name]);
          db.run('DELETE FROM users WHERE id = ?', row.id);
          console.log(`Merged UUID account ${row.id} into ${row.name}`);
        } else {
          // Rename id to name
          db.run('UPDATE users SET id = ? WHERE id = ?', [row.name, row.id]);
          console.log(`Renamed UUID ${row.id} → ${row.name}`);
        }
      });
    });
  });
});

setTimeout(() => {
  db.all('SELECT * FROM users', (err, rows) => {
    console.log('\nFinal state:');
    console.log(JSON.stringify(rows, null, 2));
    db.close();
  });
}, 2000);
