const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  const form = new FormData();
  form.append('file', fs.createReadStream('../mar26.pdf')); // Use the user's actual file they mentioned
  try {
    const res = await axios.post('http://localhost:5001/api/debug-parse', form, {
      headers: form.getHeaders(),
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log(JSON.stringify(err.response.data, null, 2));
    } else {
      console.log(err.message);
    }
  }
}
test();
