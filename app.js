const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000; // Set your desired port number

app.use(express.static(__dirname));

app.use(express.static(
    path.resolve(__dirname, "public")
));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
});