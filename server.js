const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9001;

// Enable CORS for all routes
app.use(cors());

// Serve shared static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the vcards directory for each vCard
app.use('/:name', (req, res, next) => {
  const name = req.params.name;
  const vcardPath = path.join(__dirname, 'vcards', name);
  if (fs.existsSync(vcardPath)) {
    express.static(vcardPath)(req, res, next);
  } else {
    next();
  }
});

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
      console.log("Serving file: ", filePath)
      res.sendFile(path.resolve(filePath));
    } else {
      res.status(404).send('HTML file not found');
    }
  } else {
    console.log("Name not found in paths: serving the unknown user html file");
    // vcards/bulunamadi/bulunamadi.html
    const unknownFilePath = path.join(__dirname, 'vcards', 'bulunamadi', 'bulunamadi.html');
    res.sendFile(path.resolve(unknownFilePath));
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
