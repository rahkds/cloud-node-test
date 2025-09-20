const express = require('express');
const { stat } = require('fs');
const http = require('http');
const https = require('https');
const forge = require('node-forge');
const fs = require('fs');


const app = express()
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));





const decryptField = (encryptedBase64) => {
  let filepath = '/Users/rahu/.ssh/rahu-cloudfront-rsa-private';
  const privateKeyPem = fs.readFileSync(filepath, 'utf8');
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);  
  const encryptedBytes = forge.util.decode64(encryptedBase64);
  const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP');
  return decrypted;
};

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

app.post('/users', async (req, res) => {
  
  let body = req.body || {};
  console.log('Body:', body);

  body.USER_MOBILE = 'AYABeBGJwgbUVrqBHv/Q3RmVN2oAAAABAANBV1MADHJhaHUtcnNhLWtleQEAHHsDHES/npFyuAj6C0PXw/5DIFx4Df+/rNHPp6QOg0jP8SWC74sk2EPGH1eXG0K/TJ4yw6DgOaPSBzGT4DCOokZG5LJG2XtLPy8Bp13MdIanKQbrww6EwWolU+n2x79DNLzhsXHBylkLPFivxI4jBkCaJFWJtEqcQEY5n9I035hBpo/Efs8XLxmCNk8mryOhloKIbLcUVN/kZ/F3Cc8OBCb8VS5qx+VFAdQ0Jl6V0LlA92vHv21TwWxoD98Hk/1nKbQWBcbgD7cGc9Ol59YkXTHgS9ocqqWyyPFTLUraabB/tbf0FAP0wvq3XgPwwjAxX3H+IVU57m7Fa8qO3oO1SQIAAAAADAAAEAAAAAAAAAAAAAAAAABlwp/Be7tI65LuSsIJa8fX/////wAAAAEAAAAAAAAAAAAAAAEAAAAK2nYik2LiE3aiicrxvriYFQfHVDvmSXkwV9w=';

  if(body.USER_MOBILE) {
    try {
      body.USER_MOBILE = decryptField(body.USER_MOBILE);
    } catch (err) {
      console.error('Decryption error:', err);
      //return res.status(400).json({ error: 'Invalid encrypted USER_MOBILE' });
    }
  }

  res.json({ message: 'User created', user: body });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})