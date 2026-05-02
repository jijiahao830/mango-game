#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f "config.json" ]; then
  echo "Missing config.json. Please create it and fill database settings first."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  npm install
fi

node - <<'NODE'
const fs = require('fs');
const mysql = require('mysql2/promise');

(async () => {
  const sql = fs.readFileSync('schema.sql', 'utf8');
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  const db = config.database || {};
  const conn = await mysql.createConnection({
    host: db.host,
    port: Number(db.port || 3306),
    user: db.user,
    password: db.password,
    database: db.name,
    multipleStatements: true,
    charset: 'utf8mb4'
  });
  await conn.query(sql);
  await conn.end();
  console.log('Database table is ready.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
NODE

export PORT="$(node -e "const c=require('./config.json'); console.log(c.port || 8090)")"
echo "Starting car case game on port ${PORT}..."
exec node server.js
