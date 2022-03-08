/**
 * Mackerel Webhook Handling Function
 *
 *
 * @param {*} context
 * @param {*} event
 * @param {*} callback
 */
// eventサンプル
// {
//   "request": {
//     "headers": {
//       "x-request-id": "647105f1-a917-4f9c-9f36-fc134fca05ab",
//       "content-length": "80",
//       "t-request-id": "RQ1e45c1594b8b9618c9f9c3d38137adc0",
//       "content-type": "application/json",
//       "user-agent": "Mackerel Webhook Agent (https://mackerel.io/)",
//       "accept": "*/*"
//     },
//     "cookies": {}
//   },
//   "event": "sample",
//   "message": "Sample Notification from Mackerel",
//   "imageUrl": null
// }
const SteinStore = require('stein-js-client');
const Twilio = require('twilio');
const MAX_LOOP = 2; // 最大ループ回数
exports.handler = async function (context, event, callback) {
  try {
    // Mackerelからパラメータを取得
    // console.log(`🐞 ${JSON.stringify(event, null, '  ')}`);
    const message = event.message || 'メッセージが取得できませんでした。';

    // ループ制御
    let idx = event.idx || 0; // インデックスパラメータを取得
    let loop = event.loop || 1; // ループパラメータを取得

    // Google SpreadSheetから架電先リストを取得する
    const store = new SteinStore(context.STEIN_API);
    const numbers = await store.read('sheet1', {
      authentication: {
        username: context.STEIN_USER,
        password: context.STEIN_PASS,
      },
      limit: 10,
    });
    console.dir(numbers);
    if (numbers.length === 0) {
      // 架電リストが登録されていない
      throw new Error('No call list is registered.');
    }
    if (idx >= numbers.length) {
      // 架電リストの最後までかけたので次のループ
      idx = 0;
      loop++;
      if (loop > MAX_LOOP) {
        // ループ回数を越えたので終了
        callback(null, 'The maximum number of calls has been reached.');
      }
    }

    // 取得できた架電先に対して、Twilio Studioを使って架電を行う
    const twilioClient = new Twilio(context.API_KEY, context.API_SECRET, {
      accountSid: context.ACCOUNT_SID,
    });
    const to = numbers[idx]['電話番号'].replace(/^0/, '+81'); // OAB〜JをE.164に変換
    idx++; // インデックスを更新
    const flow = await twilioClient.studio.v2
      .flows(context.FLOW_SID)
      .executions.create({
        to,
        from: context.FROM_NUMBER,
        parameters: {
          message,
          idx,
          loop,
        },
      });
    console.log(`🐞 flow: ${flow.sid}`);
    callback(null, flow.sid);
  } catch (e) {
    console.error(`👺 ERROR: ${e.message ? e.message : e}`);
    callback(e);
  }
};
