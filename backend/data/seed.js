const { saveDb } = require('./store');

(async () => {
  const seeded = await require('./store').getDb();
  await saveDb(seeded);
  console.log('Database seeded.');
})();
