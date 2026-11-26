const CONTACT_RECIPIENT = 'telemo-office@giguuu.jp';

function doPost(e) {
  const data = parseForm_(e);
  const returnUrl = safeReturnUrl_(data.return_url);
  if (data.botcheck) return resultPage_(false, '送信を受け付けられませんでした。', returnUrl);

  const name = field_(data.name, 100);
  const company = field_(data.company, 150);
  const email = field_(data.email, 254);
  const tel = field_(data.tel, 50);
  const message = field_(data.message, 5000);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return resultPage_(false, '入力内容を確認して、もう一度送信してください。', returnUrl);
  }

  const subject = '【GIGUUU】お問い合わせがありました';
  const body = [
    'GIGUUUサイトの問い合わせフォームから連絡がありました。',
    '',
    'お名前: ' + name,
    '会社名: ' + (company || '未入力'),
    'メールアドレス: ' + email,
    '電話番号: ' + (tel || '未入力'),
    '',
    'お問い合わせ内容:',
    message,
  ].join('\n');

  try {
    MailApp.sendEmail(CONTACT_RECIPIENT, subject, body, {
      name: 'GIGUUU お問い合わせフォーム',
      replyTo: email,
    });
    return resultPage_(true, 'お問い合わせを送信しました。担当者からの連絡をお待ちください。', returnUrl);
  } catch (error) {
    console.error(error);
    return resultPage_(false, '送信できませんでした。時間をおいて再度お試しください。', returnUrl);
  }
}

function parseForm_(e) {
  const body = e && e.postData && e.postData.contents;
  if (!body) return e && e.parameter ? e.parameter : {};
  const data = {};
  body.split('&').forEach(part => {
    const separator = part.indexOf('=');
    if (separator < 0) return;
    try {
      const key = decodeURIComponent(part.slice(0, separator).replace(/\+/g, ' '));
      const value = decodeURIComponent(part.slice(separator + 1).replace(/\+/g, ' '));
      data[key] = value;
    } catch (error) {
      console.warn('Invalid form encoding');
    }
  });
  return data;
}

function field_(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function safeReturnUrl_(value) {
  const url = String(value || '').trim();
  if (url.length > 2048 || !/^https?:\/\/[^\s<>"'\\]+$/i.test(url)) return '';
  const match = url.match(/^(https?):\/\/([^/?#]+)/i);
  if (!match) return '';
  const scheme = match[1].toLowerCase();
  const authority = match[2].toLowerCase();
  if (scheme === 'http' && /^(localhost|127\.0\.0\.1)(:\d{1,5})?$/.test(authority)) return url;
  if (scheme === 'https' && ['giguuu.jp', 'www.giguuu.jp', 'rintaro8910-tech.github.io'].includes(authority)) return url;
  return '';
}

function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
}

function resultPage_(success, message, returnUrl) {
  const color = success ? '#087e76' : '#b42318';
  const html = '<!doctype html><html lang="ja"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>GIGUUU お問い合わせ</title>' +
    '<style>body{margin:0;background:#f4f8fb;color:#172a3a;font-family:system-ui,sans-serif}' +
    'main{max-width:560px;margin:10vh auto;padding:40px;background:white;border-radius:16px;' +
    'box-shadow:0 10px 32px #172a3a12}h1{font-size:1.5rem;color:' + color + '}' +
    'p{line-height:1.8}a{margin-top:20px;padding:12px 20px;border:0;border-radius:8px;' +
    'background:#172a3a;color:white;font:inherit;cursor:pointer;text-decoration:none;display:inline-block}</style></head><body>' +
    '<main><h1>' + (success ? '送信完了' : '送信できませんでした') + '</h1>' +
    '<p>' + message + '</p>' + (returnUrl ? '<a href="' + escapeHtml_(returnUrl) + '" target="_top">サイトに戻る</a>' : '') + '</main>' +
    '</body></html>';
  return HtmlService.createHtmlOutput(html);
}
