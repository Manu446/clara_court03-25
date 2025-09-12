// seeds/01_users.js
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    { id: 1, name: 'Admin User', email: 'admin@example.com' },
    { id: 2, name: 'Test User', email: 'test@example.com' }
  ]);
};
