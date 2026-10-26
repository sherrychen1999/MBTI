/**
 * 擇木良食｜吃貨動物測驗　收資料程式
 * 貼到 Google 試算表的「擴充功能 → Apps Script」，部署成網頁應用程式。
 *
 * 會建立兩個工作表：
 *   results：每完成一次測驗一列
 *   clicks ：報告頁每按一次按鈕一列
 *
 * 不會收到、也不會儲存任何健康狀況或家族病史。
 */

const RESULT_HEADERS = ['時間', '工作階段', '入口來源', '在LINE內開啟', 'LINE UID', '同意行銷',
  '類型代碼', '動物', '分流', '年齡', 'BMI區間', '腰圍超過80', '想調整的', '推薦產品'];
const CLICK_HEADERS = ['時間', '工作階段', '入口來源', '類型代碼', '分流', '按鈕', 'LINE UID'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const now = new Date();
    if (d.kind === 'result') {
      const sh = sheet_(ss, 'results', RESULT_HEADERS);
      sh.appendRow([now, s_(d.session), s_(d.src), !!d.inLine, s_(d.lineUid), !!d.marketing,
        s_(d.type), s_(d.animal), tierName_(d.tier), s_(d.age), s_(d.bmiBand), d.waistOver80 === '' ? '' : !!d.waistOver80,
        s_(d.goals), s_(d.recs)]);
      if (d.marketing && d.lineUid) pushResult_(d);
    } else if (d.kind === 'click') {
      const sh = sheet_(ss, 'clicks', CLICK_HEADERS);
      sh.appendRow([now, s_(d.session), s_(d.src), s_(d.type), tierName_(d.tier), s_(d.button), s_(d.lineUid)]);
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}

function sheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

// 避免有人送進長字串或試算表公式
function s_(v) {
  let t = v == null ? '' : String(v).slice(0, 200);
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

function tierName_(t) {
  return { escort: '專人陪伴型', care: '加強照顧型', free: '自在保養型' }[t] || s_(t);
}

/**
 * （選用）測驗完成後，用 LINE 官方帳號推一則結果訊息給客人。
 * 需要在「專案設定 → 指令碼屬性」新增 LINE_CHANNEL_TOKEN（Messaging API 的 Channel access token）。
 * 沒設定就自動略過。客人必須已加入官方帳號好友才收得到。
 */
function pushResult_(d) {
  const token = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_TOKEN');
  if (!token) return;
  const text = '你的吃貨動物是「' + s_(d.animal) + '」！\n' +
    '謝謝你完成擇木良食的吃貨動物測驗，之後有任何飲食問題，都可以直接在這裡問營養師。';
  try {
    UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      payload: JSON.stringify({ to: d.lineUid, messages: [{ type: 'text', text: text }] }),
      muteHttpExceptions: true
    });
  } catch (err) { /* 推播失敗不影響存檔 */ }
}
