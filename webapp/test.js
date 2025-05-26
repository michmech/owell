import { SHA3 } from 'sha3';

const hash = new SHA3(512);
hash.update('test');
console.log(hash.digest('hex'));