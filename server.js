const express = require('express');
const fs = require('fs').promises; // Use the promise-based version of fs
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9001;

// Enable CORS for all routes
app.use(cors());

// Serve shared static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the vcards directory for each vCard
app.use('/:name', async (req, res, next) => {
  const name = req.params.name;
  const vcardPath = path.join(__dirname, 'vcards', name);

  try {
    if (await fs.access(vcardPath).then(() => true).catch(() => false)) {
      express.static(vcardPath)(req, res, next);
    } else {
      const unknownVCardPath = path.join(__dirname, 'vcards', 'bulunamadi');
      express.static(unknownVCardPath)(req, res, next);
      // next();
    }
  } catch (error) {
    const unknownVCardPath = path.join(__dirname, 'vcards', 'bulunamadi');
    express.static(unknownVCardPath)(req, res, next);
    // next(error); // Pass errors to Express error handling
  }
});

// Read the JSON file into an object asynchronously
let paths;
fs.readFile(path.join(__dirname, 'vcards.json'), 'utf8')
  .then(data => {
    paths = JSON.parse(data);
  })
  .catch(error => {
    console.error('Failed to read vcards.json', error);
    paths = {}; // Fallback to an empty object
  });

app.get('/:name', async (req, res) => {
  const { name } = req.params;
  const unknownFilePath = path.join(__dirname, 'vcards', 'bulunamadi', 'bulunamadi.html'); // Path for the unknown user HTML

  // Basic input sanitization
  if (Object.prototype.hasOwnProperty.call(paths, name)) {
    const filePath = paths[name];

    try {
      // Check if the file exists asynchronously
      await fs.access(filePath);
      console.log("Serving file: ", filePath);
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      console.log("Error | Serving file: ", filePath);
      // If the file doesn't exist, serve the unknown user HTML
      res.sendFile(path.resolve(unknownFilePath));
    }
  } else {
    console.log("False | Serving file: ", filePath);
    // If the name is not found in paths, serve the unknown user HTML
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
