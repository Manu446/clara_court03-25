// simple migration runner to create DB and sample data
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const dbFile = path.join(__dirname,'data','database.sqlite');
if(!fs.existsSync('./data')) fs.mkdirSync('./data');
const db = new Database(dbFile);
const initSql = fs.readFileSync(path.join(__dirname,'migrations','init.sql'),'utf8');
db.exec(initSql);
console.log('Migration finished — database created at', dbFile);
