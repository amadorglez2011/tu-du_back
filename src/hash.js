import bcrypt from 'bcryptjs';
const hash = bcrypt.hashSync('mdeozx13', 10);
console.log(hash);
console.log(bcrypt.compareSync('mdeozx13', hash));