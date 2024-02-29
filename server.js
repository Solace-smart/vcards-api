const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 9001;

// Read the JSON file into an object
const paths = JSON.parse(fs.readFileSync('./vcards.json', 'utf8'));

app.get('/:name', (req, res) => {
  const { name } = req.params;

  // Check if the name exists in the paths object
  if (paths.hasOwnProperty(name)) {
    const filePath = paths[name];

    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Serve the HTML file
      res.sendFile(path.resolve(filePath));
    } else {
      res.status(404).send('HTML file not found');
    }
  } else {
    res.status(404).send('Name not found in paths');
  }
});

app.get("/test/ping", (req, res) => {
  res.send("pong");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`-- Help:`)
  console.log(`\t 1. Try http://localhost:${port}/[name] where [name] is a key in vcards.json`);
});

