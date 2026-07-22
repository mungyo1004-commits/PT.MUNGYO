const { put, head } = require('@vercel/blob');
// 데이터를 저장할 파일 이름 (하나의 JSON 파일에 전체 데이터를 저장)
const BLOB_PATHNAME = 'pt-mungyo-db.json';
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      let data = null;
      try {
        const info = await head(BLOB_PATHNAME);
        // 이 스토어는 비공개(private)로 구성되어 있어서, 파일 URL을 그냥
        // fetch하면 거부됩니다. 인증 토큰을 Authorization 헤더에 실어 보내야
        // 비공개 blob 내용을 읽어올 수 있습니다.
        const authToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN;
        const r = await fetch(info.url, {
          cache: 'no-store',
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        data = await r.json();
      } catch (e) {
        // 아직 저장된 데이터가 없는 경우 (최초 실행)
        data = null;
      }
      res.status(200).json(data);
      return;
    }
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body || '{}');
        } catch (e) {
          res.status(400).json({ error: '잘못된 JSON 형식입니다.' });
          return;
        }
      }
      await put(BLOB_PATHNAME, JSON.stringify(body), {
        access: 'private',
        contentType: 'application/json; charset=utf-8',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('data function error', err);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      debug_name: err && err.name,
      debug_message: err && err.message,
    });
  }
};
