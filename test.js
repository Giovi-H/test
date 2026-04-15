const KEY = 'GVKA2KXNJKCOZHKC440BPCJR0XPB4PH4GP4HMRM50A4GVB1U'

const https = require('https');

const options = {
  hostname: 'places-api.foursquare.com',
  path: '/places/search?ll=40.7128,-74.0060&query=cafe&categories=4bf58dd8d48988d16d941735,4bf58dd8d48988d1e0931735&limit=10&fields=fsq_place_id,name,location,categories,distance',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${KEY}`,
    'Accept': 'application/json',
    'X-Places-Api-Version': '2025-06-17',
  },
  timeout: 10000,
};

const req = https.request(options, (res) => {
  let data = '';
  console.log('Status:', res.statusCode);
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

req.on('timeout', () => { console.error('Timed out'); req.destroy(); });
req.on('error', (e) => console.error('Error:', e.message));
req.end();