import { SHA3 } from 'sha3';

const hash = new SHA3(512);
hash.update('razdvatri');
console.log(hash.digest('hex'));