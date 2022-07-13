const fs = require('fs');

let code = fs.readFileSync('src/index.js', 'utf8');

const read = (path) => ('`' + fs.readFileSync('src/' + path + (!path.includes('.') ? '.js' : ''), 'utf8').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`');

code = code.replace(/await getBuiltin\(['"`](.*?)['"`]\)/g, (_, path) => read('builtins/' + path));
code = code.replace(/await \(await fetch\(\'http:\/\/localhost\:1337\/src\/([A-Za-z0-9\/\.]*?)\'\)\)\.text\(\)/g, (_, path) => read(path));
code = code.replace('`https://wmeluna.com/topaz/src/index.js`', '`https://goosemod.github.io/topaz/out.js`');
code = code.replace('`https://wmeluna.com/topaz/popular.json`', '`https://goosemod.github.io/topaz/popular.json`');
code = code.replaceAll('https://wmeluna.com/topaz/src/', 'https://goosemod.github.io/topaz/src/');

// console.log(code);
fs.writeFileSync('out.js', code);

console.log('bundled topaz!');