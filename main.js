#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const http = require('http');

program
  .requiredOption('-i, --input <path>', 'Input JSON file path')
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port');

program.parse(process.argv);

const options = program.opts();

// Перевіряємо чи існує файл
if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

// Поки що просто приб'ємо сервер-привітання
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(`Server running! Input file: ${options.input}`);
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
