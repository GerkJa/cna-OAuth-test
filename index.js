const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const port = process.env.PORT || 3000
const app = express()

app.get("/", (req, res) => {
    return res.send(`<h1>Hello!</h1>`)
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
});