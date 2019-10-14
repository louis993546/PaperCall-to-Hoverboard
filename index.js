#!/usr/bin/env node

if (process.argv.length !== 3) {
    console.error('Please provide "PaperCall.io" JSON as argument');
    process.exit(1);
}

var fs = require('fs');
var contents = fs.readFileSync(process.argv[2], 'utf8');
var data = JSON.parse(contents);

