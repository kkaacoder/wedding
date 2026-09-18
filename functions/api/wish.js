// Cloudflare Pages Function: /api/wish
// 支援從 D1 資料庫 (綁定名稱 a1 或 DB) 隨機讀取新婚祝福語

// 備援預設祝福語（若資料庫尚未綁定或離線時無縫降級使用）
const FALLBACK_WISHES = [
  { content: '百年好合，永結同心！🌹', author: '親友團' },
  { content: '執子之手，與子偕老 💍', author: '伴娘' },
  { content: '新婚愉快，甜甜蜜蜜！💗', author: '好友小美' },
  { content: '願你們的愛情如玫瑰般永遠綻放 ✨', author: '伴郎阿強' },
  { content: '琴瑟和鳴，相敬如賓 💒', author: '大伯母' },
  { content: '永浴愛河，早生貴子 👶', author: '奶奶' },
  { content: '執手並肩，幸福一生一世 🌸', author: '大學同學' },
  { content: '佳偶天成，天作之合 🥂', author: '同事情友' },
  { content: '白頭偕老，恩愛一生！💑', author: '表姊' },
  { content: '願每個明天都比今天更加相愛 💕', author: '閨蜜' }
];

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, no-cache, must-revalidate'
};

// 處理 OPTIONS 預檢請求
export async function onRequestOptions() {
  return new Response(null, { headers: JSON_HEADERS });
}

// GET: 隨機獲取一則新婚祝福語
export async function onRequestGet(context) {
  const db = context.env.a1 || context.env.DB;

  if (db && typeof db.prepare === 'function') {
    try {
      // 從 D1 資料庫隨機選取一筆
      const result = await db
        .prepare('SELECT id, content, author FROM wedding_wishes ORDER BY RANDOM() LIMIT 1')
        .first();

      if (result && result.content) {
        return new Response(
          JSON.stringify({
            success: true,
            source: 'd1',
            data: {
              id: result.id,
              content: result.content,
              author: result.author || '賓客'
            }
          }),
          { headers: JSON_HEADERS }
        );
      }
    } catch (err) {
      console.error('D1 query error:', err);
      // 發生錯誤時降級至備援清單，不中斷遊戲體驗
    }
  }

  // 降級備援回傳隨機一則
  const randomIndex = Math.floor(Math.random() * FALLBACK_WISHES.length);
  const randomWish = FALLBACK_WISHES[randomIndex];

  return new Response(
    JSON.stringify({
      success: true,
      source: 'fallback',
      data: randomWish
    }),
    { headers: JSON_HEADERS }
  );
}

// POST: 讓賓客新增祝福語至 D1
export async function onRequestPost(context) {
  const db = context.env.a1 || context.env.DB;

  try {
    const body = await context.request.json();
    const content = (body.content || '').trim();
    const author = (body.author || '神秘賓客').trim();

    if (!content) {
      return new Response(
        JSON.stringify({ success: false, message: '祝福語內容不可為空' }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    if (content.length > 100) {
      return new Response(
        JSON.stringify({ success: false, message: '祝福語長度請在 100 字以內' }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    if (db && typeof db.prepare === 'function') {
      await db
        .prepare('INSERT INTO wedding_wishes (content, author) VALUES (?, ?)')
        .bind(content, author)
        .run();

      return new Response(
        JSON.stringify({ success: true, message: '祝福語已成功送出！💗' }),
        { headers: JSON_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'D1 資料庫尚未綁定 (a1)' }),
      { status: 503, headers: JSON_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message || '新增失敗' }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
