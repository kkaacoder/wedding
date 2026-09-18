// _worker.js
// 同時相容 Cloudflare Pages 與 Cloudflare Workers + Static Assets

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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API 路由: /api/wish
    if (url.pathname === '/api/wish') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: JSON_HEADERS });
      }

      if (request.method === 'GET') {
        const db = env.a1 || env.DB;
        if (db && typeof db.prepare === 'function') {
          try {
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
          }
        }

        const randomIndex = Math.floor(Math.random() * FALLBACK_WISHES.length);
        return new Response(
          JSON.stringify({
            success: true,
            source: 'fallback',
            data: FALLBACK_WISHES[randomIndex]
          }),
          { headers: JSON_HEADERS }
        );
      }

      if (request.method === 'POST') {
        const db = env.a1 || env.DB;
        try {
          const body = await request.json();
          const content = (body.content || '').trim();
          const author = (body.author || '神秘賓客').trim();

          if (!content) {
            return new Response(
              JSON.stringify({ success: false, message: '祝福語內容不可為空' }),
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
    }

    // 靜態資源 (HTML / 圖片 等)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
