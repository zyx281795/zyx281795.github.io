const SETTINGS = {
  owner: 'zyx281795',
  repo: 'zyx281795.github.io',
  branch: 'main',
  dataPath: 'food-cards/restaurants.json',
  adminEmail: 'ryan20040506@gmail.com'
};

function doPost(e) {
  try {
    const p = e.parameter || {};
    const restaurant = sanitizeSubmission_(p);
    validateSubmission_(restaurant);

    const id = Utilities.getUuid();
    const approvalToken = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    const pending = {
      id,
      approvalToken,
      createdAt: new Date().toISOString(),
      status: 'pending',
      restaurant
    };

    PropertiesService.getScriptProperties().setProperty('PENDING_' + id, JSON.stringify(pending));

    const appUrl = ScriptApp.getService().getUrl();
    const approveUrl = appUrl + '?action=approve&id=' + encodeURIComponent(id) + '&token=' + encodeURIComponent(approvalToken);
    const rejectUrl = appUrl + '?action=reject&id=' + encodeURIComponent(id) + '&token=' + encodeURIComponent(approvalToken);

    sendReviewEmail_(restaurant, approveUrl, rejectUrl);

    return HtmlService.createHtmlOutput(successPage_('投稿完成', '推薦已送出，網站管理者審核通過後才會出現在公開字卡。'));
  } catch (err) {
    return HtmlService.createHtmlOutput(successPage_('投稿失敗', escapeHtml_(String(err.message || err))));
  }
}

function doGet(e) {
  const action = (e.parameter.action || '').toLowerCase();
  const id = e.parameter.id || '';
  const token = e.parameter.token || '';

  if (!action || !id || !token) {
    return HtmlService.createHtmlOutput(successPage_('Food Cards Review', '缺少審核參數。'));
  }

  const key = 'PENDING_' + id;
  const raw = PropertiesService.getScriptProperties().getProperty(key);
  if (!raw) {
    return HtmlService.createHtmlOutput(successPage_('找不到投稿', '這筆投稿可能已被處理，或審核連結已失效。'));
  }

  const pending = JSON.parse(raw);
  if (pending.approvalToken !== token) {
    return HtmlService.createHtmlOutput(successPage_('無效連結', '審核權杖不正確。'));
  }

  if (action === 'reject') {
    PropertiesService.getScriptProperties().deleteProperty(key);
    return HtmlService.createHtmlOutput(successPage_('已拒絕', '這筆餐廳投稿不會加入網站。'));
  }

  if (action !== 'approve') {
    return HtmlService.createHtmlOutput(successPage_('未知操作', '不支援的審核動作。'));
  }

  try {
    appendRestaurantToGitHub_(pending.restaurant, id);
    PropertiesService.getScriptProperties().deleteProperty(key);
    return HtmlService.createHtmlOutput(successPage_('核准成功 🎉', '餐廳資料已提交到 GitHub。GitHub Pages 更新後，新的字卡就會自動出現。'));
  } catch (err) {
    return HtmlService.createHtmlOutput(successPage_('更新失敗', escapeHtml_(String(err.message || err))));
  }
}

function sanitizeSubmission_(p) {
  return {
    name: clean_(p.name, 80),
    category: clean_(p.category || p.name, 80),
    emoji: clean_(p.emoji || '🍽️', 8),
    micro: clean_(p.micro || 'Community recommendation', 100),
    note: clean_(p.note, 280),
    mapUrl: clean_(p.mapUrl, 500),
    recommender: clean_(p.recommender || '匿名推薦者', 60)
  };
}

function validateSubmission_(r) {
  if (!r.name) throw new Error('請填寫餐廳名稱。');
  if (!r.note) throw new Error('請填寫推薦理由。');
  if (!/^https:\/\/(maps\.app\.goo\.gl|www\.google\.[^/]+\/maps|maps\.google\.[^/]+)\//i.test(r.mapUrl)) {
    throw new Error('Google Maps 連結格式不正確。');
  }
}

function sendReviewEmail_(r, approveUrl, rejectUrl) {
  const subject = '【口袋美食卡】新餐廳投稿：' + r.name;
  const plain = [
    '收到一筆新的餐廳推薦：',
    '',
    '餐廳：' + r.name,
    '分類：' + r.category,
    '推薦者：' + r.recommender,
    '推薦理由：' + r.note,
    'Google Maps：' + r.mapUrl,
    '',
    '核准：' + approveUrl,
    '拒絕：' + rejectUrl
  ].join('\n');

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC',sans-serif;max-width:620px;margin:auto;color:#262521">
      <h2>🍽️ 新的口袋美食卡投稿</h2>
      <div style="background:#f7f2e9;border-radius:18px;padding:20px">
        <p><b>餐廳：</b>${escapeHtml_(r.name)}</p>
        <p><b>分類：</b>${escapeHtml_(r.category)}</p>
        <p><b>推薦者：</b>${escapeHtml_(r.recommender)}</p>
        <p><b>推薦理由：</b>${escapeHtml_(r.note)}</p>
        <p><a href="${escapeAttr_(r.mapUrl)}">查看 Google Maps</a></p>
      </div>
      <p style="margin-top:24px">
        <a href="${escapeAttr_(approveUrl)}" style="display:inline-block;background:#2c2b27;color:#fff;padding:12px 18px;border-radius:12px;text-decoration:none;margin-right:8px">✓ 核准並發布</a>
        <a href="${escapeAttr_(rejectUrl)}" style="display:inline-block;background:#eee7dd;color:#4d4740;padding:12px 18px;border-radius:12px;text-decoration:none">✕ 拒絕</a>
      </p>
      <p style="color:#777268;font-size:13px">只有按下「核准並發布」後，資料才會寫入 GitHub 並公開顯示。</p>
    </div>`;

  MailApp.sendEmail({
    to: SETTINGS.adminEmail,
    subject,
    body: plain,
    htmlBody: html,
    name: 'Pocket Food Cards'
  });
}

function appendRestaurantToGitHub_(r, requestId) {
  const props = PropertiesService.getScriptProperties();
  const githubToken = props.getProperty('GITHUB_TOKEN');
  if (!githubToken) throw new Error('尚未設定 GITHUB_TOKEN。');

  const apiUrl = 'https://api.github.com/repos/' + SETTINGS.owner + '/' + SETTINGS.repo + '/contents/' + SETTINGS.dataPath;
  const headers = {
    Authorization: 'Bearer ' + githubToken,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  const getResp = UrlFetchApp.fetch(apiUrl + '?ref=' + encodeURIComponent(SETTINGS.branch), {
    method: 'get',
    headers,
    muteHttpExceptions: true
  });

  if (getResp.getResponseCode() !== 200) {
    throw new Error('讀取 GitHub restaurants.json 失敗：' + getResp.getContentText());
  }

  const file = JSON.parse(getResp.getContentText());
  const decoded = Utilities.newBlob(Utilities.base64Decode(file.content.replace(/\n/g, ''))).getDataAsString('UTF-8');
  const restaurants = JSON.parse(decoded);

  restaurants.push({
    id: 'community-' + requestId,
    name: r.name,
    category: r.category,
    emoji: r.emoji,
    micro: r.micro,
    note: r.note,
    mapUrl: r.mapUrl,
    recommender: r.recommender
  });

  const newContent = JSON.stringify(restaurants, null, 2) + '\n';
  const payload = {
    message: 'Add community food recommendation: ' + r.name,
    content: Utilities.base64Encode(Utilities.newBlob(newContent, 'application/json').getBytes()),
    sha: file.sha,
    branch: SETTINGS.branch
  };

  const putResp = UrlFetchApp.fetch(apiUrl, {
    method: 'put',
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (putResp.getResponseCode() < 200 || putResp.getResponseCode() >= 300) {
    throw new Error('更新 GitHub 失敗：' + putResp.getContentText());
  }
}

function clean_(value, maxLen) {
  return String(value || '').trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, maxLen);
}

function escapeHtml_(s) {
  return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function escapeAttr_(s) {
  return escapeHtml_(s);
}

function successPage_(title, message) {
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml_(title)}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC',sans-serif;background:#f6f1e8;color:#262521;display:grid;place-items:center;min-height:100vh;margin:0}.box{max-width:560px;margin:24px;background:#fffdf8;border:1px solid #d8d0c4;border-radius:24px;padding:30px;box-shadow:0 18px 50px rgba(61,50,37,.12)}h1{margin-top:0}p{line-height:1.7;color:#686258}</style></head><body><div class="box"><h1>${escapeHtml_(title)}</h1><p>${message}</p><p>你可以關閉這個頁面。</p></div></body></html>`;
}
