const express = require('express');
const { stat } = require('fs');
const http = require('http');
const https = require('https');

const app = express()
const port = process.env.PORT || 3000;



app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);
    console.log('Params:', req.params);
    next();
})


app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World! Rahul')
})

app.get('/ping', (req, res) => {
    res.send('pong');
});



app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})