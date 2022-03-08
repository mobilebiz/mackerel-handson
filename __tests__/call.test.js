const axios = require('axios');
const URL = 'http://localhost:3000/call';

const execFunction = async (params) => {
  return await axios.post(URL, params);
};

test('正常終了', () => {
  const params = {
    message: 'これはテストです。',
  };
  return execFunction(params).then((res) => {
    expect(res.status).toBe(200);
    expect(res.data).toMatch(/^FN*/);
  });
});
