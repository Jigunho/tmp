const fs = require('fs');
const img = fs.readFileSync('./0green40.png', 'utf8');
console.log(img);

fs.writeFileSync(`img.png`,img);