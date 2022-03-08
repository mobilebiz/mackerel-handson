/**
 * Logging for call Function
 * Studioフローから呼ばれ、架電の結果をSpreadsheetに書き込む
 *
 * @param {*} context
 * @param {*} event
 * @param {*} callback
 */
const SteinStore = require('stein-js-client');
const dayjs = require('dayjs');
exports.handler = async function (context, event, callback) {
  try {
    // Studioからパラメータを取得
    // console.log(`🐞 ${JSON.stringify(event, null, '  ')}`);
    const { to, status } = event;
    if (!to || !status) {
      throw new Error('Parameter(s) not exist.');
    }

    const number = to.replace(/^\+81/, '0'); // E.164 -> 0AB〜J
    // Google Spreadsheetから架電先の名前を取得
    const store = new SteinStore(context.STEIN_API);
    const data = await store.read('sheet1', {
      authentication: {
        username: context.STEIN_USER,
        password: context.STEIN_PASS,
      },
      search: { 電話番号: number },
    });
    const name = data.length > 0 ? data[0]['名前'] : '不明';
    // Google SpreadSheetに履歴を記録
    const now = dayjs();
    await store.append(
      'sheet2',
      [
        {
          発信日時: now.format('YYYY-MM-DD HH:mm:ss'),
          発信先: name,
          発信先電話番号: number,
          ステータス: status,
        },
      ],
      {
        authentication: {
          username: context.STEIN_USER,
          password: context.STEIN_PASS,
        },
      },
    );
    callback(null, 'OK');
  } catch (e) {
    console.error(`👺 ERROR: ${e.message ? e.message : e}`);
    callback(e);
  }
};
