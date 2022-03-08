const axios = require('axios');
const URL = 'http://localhost:3000/log';

const execFunction = async (params) => {
  return await axios.post(URL, params);
};

test('正常終了', () => {
  const params = {
    to: '+81xxxxxxxxxx', // 架電リストにかかれている電話番号に変更してください
    status: 'ユニットテスト',
  };
  return execFunction(params).then((res) => {
    expect(res.status).toBe(200);
    expect(res.data).toMatch(/OK/);
  });
});
