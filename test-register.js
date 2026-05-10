import http from 'https';

const data = JSON.stringify({
  fullName: 'Test User',
  email: 'test' + Date.now() + '@example.com',
  password: 'Password123!',
  organizationType: 'clinic'
});

const options = {
  hostname: 'flowforge-production-0fc1.up.railway.app',
  port: 443,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
