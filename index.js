const fs = require('fs');

const Gasper = require('./lib/gasper');

module.exports = new Gasper(fs.fstatSync(0).isFIFO() ? process.stdin : null, process.stdout);
