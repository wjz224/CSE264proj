const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000; // Set your desired port number

app.use(express.static(__dirname));

app.use((req, res, next) => {
    const filePath = path.join(__dirname, req.url);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).send('File not found!');
            return;
        }
        next();
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
});