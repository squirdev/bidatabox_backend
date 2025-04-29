const bcrypt = require('bcrypt');

bcrypt.hash('fadacai2025', 10).then(hash => {
  console.log('Hashed password:', hash);
});