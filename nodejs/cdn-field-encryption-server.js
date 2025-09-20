const fs = require('fs');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;

// Use body-parser to parse urlencoded form data (for form POSTs) and JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// Decrypt one field
function decryptField(encryptedBase64) {
// Load private key
 const privateKeyPem = fs.readFileSync(path.join(__dirname, 'private_key.pem'), 'utf8');
// const privateKeyPem = fs.readFileSync('/Users/rahu/.ssh/rahu-cloudfront-rsa-private', 'utf8');
// If needed, remove the private key passphrase part; ensure the PEM is correct.
// For PKCS#1 (BEGIN RSA PRIVATE KEY) or PKCS#8 (BEGIN PRIVATE KEY)

// Create a private Key object for decryption
const privateKey = {
  key: privateKeyPem,
  // If your private key is encrypted / has passphrase, include `passphrase: '...'`
  padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
  oaepHash: 'sha256'
};    
  try {
    const buffer = Buffer.from(encryptedBase64, 'base64');

    console.log("Buffer:", buffer.length);
    // Decrypt using RSA OAEP SHA‑256
    const decryptedBuffer = crypto.privateDecrypt(privateKey, buffer);
    return decryptedBuffer.toString('utf8');
  } catch (err) {
    console.error('Decrypt Field Error:', err);
    throw err;
  }
}

app.post('/users', (req, res) => {
  // CloudFront will forward the request; encrypted fields will be base64 strings in form fields
  const body = req.body;
  const decrypted = {};

    body.USER_MOBILE = 'AYABeBGJwgbUVrqBHv/Q3RmVN2oAAAABAANBV1MADHJhaHUtcnNhLWtleQEAHHsDHES/npFyuAj6C0PXw/5DIFx4Df+/rNHPp6QOg0jP8SWC74sk2EPGH1eXG0K/TJ4yw6DgOaPSBzGT4DCOokZG5LJG2XtLPy8Bp13MdIanKQbrww6EwWolU+n2x79DNLzhsXHBylkLPFivxI4jBkCaJFWJtEqcQEY5n9I035hBpo/Efs8XLxmCNk8mryOhloKIbLcUVN/kZ/F3Cc8OBCb8VS5qx+VFAdQ0Jl6V0LlA92vHv21TwWxoD98Hk/1nKbQWBcbgD7cGc9Ol59YkXTHgS9ocqqWyyPFTLUraabB/tbf0FAP0wvq3XgPwwjAxX3H+IVU57m7Fa8qO3oO1SQIAAAAADAAAEAAAAAAAAAAAAAAAAABlwp/Be7tI65LuSsIJa8fX/////wAAAAEAAAAAAAAAAAAAAAEAAAAK2nYik2LiE3aiicrxvriYFQfHVDvmSXkwV9w=';


  // Suppose you know which fields are encrypted, e.g. CREDIT_CARD, USER_MOBILE
  const encryptedFields = ['CREDIT_CARD', 'USER_MOBILE'];

  try {
    for (const key in body) {
      if (!body.hasOwnProperty(key)) continue;

      if (encryptedFields.includes(key)) {
        // decrypt this field
        decrypted[key] = decryptField(body[key]);
      } else {
        // leave as is
        decrypted[key] = body[key];
      }
    }

    console.log('Decrypted:', decrypted);
    res.json({ success: true, data: decrypted });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Decryption failed', details: err.toString(),body });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
