const express = require('express');
const http = require('http');
const https = require('https');

const app = express()
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World! Rahul')
})

app.get('/ping', (req, res) => {
    res.send('pong');
  });

// create a new route that returns a ec2 instance id and availability zone
app.get('/instance', (req, res) => {
    const instanceId = process.env.INSTANCE_ID;
    const availabilityZone = process.env.AVAILABILITY_ZONE;
    if (!instanceId || !availabilityZone) {
        return res.status(500).json({ error: 'Instance ID or Availability Zone not set' });
    }
    res.json({ instanceId, availabilityZone });
});

function getIMDSToken() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'PUT',
      host: '169.254.169.254',
      path: '/latest/api/token',
      headers: {
        'X-aws-ec2-metadata-token-ttl-seconds': '21600',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.end();
  });
}

function fetchMetadataWithToken(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      host: '169.254.169.254',
      path: `/latest/meta-data/${path}`,
      headers: {
        'X-aws-ec2-metadata-token': token,
      },
    };

    http.get(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

app.get('/info', async (req, res) => {
    try {
        const token = await getIMDSToken();
        const instanceId = await fetchMetadataWithToken('instance-id', token);
        const az = await fetchMetadataWithToken('placement/availability-zone', token);
        res.json({ instanceId, availabilityZone: az });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch metadata' });
    }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})