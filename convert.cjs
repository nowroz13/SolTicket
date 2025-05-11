const bs58 = require('bs58');
const fs = require('fs');

// Replace with your Phantom exported private key (base58 string)
const base58Key = '3qzNgoBsd4yneBr1yYoZ9ctKDcEJ8U37yK2G2XYwjfadfrpcSryDYduLxVWeSzgFDXtL42ZuGRyA4UauhwHWMsa8';

const secretKey = bs58.decode(base58Key);
fs.writeFileSync('server-keypair.json', JSON.stringify(Array.from(secretKey)));
console.log('server-keypair.json created!'); 