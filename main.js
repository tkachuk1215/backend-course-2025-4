#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs').promises; // асинхронний fs
const http = require('http');
const { XMLBuilder } = require('fast-xml-parser');

// CLI аргументи
program
  .requiredOption('-i, --input <path>', 'Input JSON file path')
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port');

program.parse(process.argv);
const options = program.opts();

// XML builder
const builder = new XMLBuilder({
  ignoreAttributes: false,
  format: true
});

const server = http.createServer(async (req, res) => {
  try {
    // читаємо файл
    const fileData = await fs.readFile(options.input, 'utf-8');
    const lines = fileData.trim().split('\n');
    const passengers = lines.map(line => JSON.parse(line));

    // отримуємо URL-параметри
    const query = new URL(req.url, `http://${options.host}:${options.port}`).searchParams;

    let filtered = passengers;

    // ?survived=true
    if (query.get("survived") === "true") {
      filtered = filtered.filter(p => p.Survived == 1);
    }

    // формуємо XML об'єкт
    const xmlData = filtered.map(p => {
      let item = {
        name: p.Name,
        ticket: p.Ticket
      };

      // ?age=true → додаємо Age
      if (query.get("age") === "true") {
        item.age = p.Age ?? "Unknown"; // якщо віку нема — пишемо Unknown
      }

      return item;
    });

    const xml = builder.build({
      passengers: {
        passenger: xmlData
      }
    });

    res.writeHead(200, { "Content-Type": "application/xml" });
    res.end(xml);

  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Server error: " + error.message);
  }
});

// старт
server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
