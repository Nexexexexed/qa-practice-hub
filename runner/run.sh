#!/bin/bash
mkdir -p /app/work
echo "$HTML_CONTENT" | base64 -d > /app/work/page.html
echo "$USER_CODE" | base64 -d > /app/work/user.js
echo "$TEST_CODE" | base64 -d > /app/work/test.js
cd /app/work

node -e "
const vm = require('vm');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const { assert } = require('chai');

const html = fs.readFileSync('page.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
const window = dom.window;
const document = window.document;

const userScript = fs.readFileSync('user.js', 'utf8');
const testScript = fs.readFileSync('test.js', 'utf8');

const context = { window, document, assert, console };
vm.createContext(context);

try {
  new vm.Script(userScript).runInContext(context);
  new vm.Script(testScript).runInContext(context);
  console.log(JSON.stringify({ numTotalTests: 1, numPassedTests: 1, message: 'All tests passed', error: '', time: 0 }));
} catch (err) {
  console.log(JSON.stringify({ numTotalTests: 1, numPassedTests: 0, message: '', error: err.message, time: 0 }));
}
" 2>&1