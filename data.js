const { getStore, connectLambda } = require('@netlify/blobs');

const STORE_NAME = 'pt-mungyo-db';
const KEY = 'db';

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

exports.handler = async (event) => {
  try {
    // Netlify Functions(Lambda 호환) 환경에서 Blobs 컨텍스트를 자동으로 연결합니다.
    connectLambda(event);
    const store = getStore({ name: STORE_NAME });

    if (event.httpMethod === 'GET') {
      const data = await store.get(KEY, { type: 'json' });
      return { statusCode: 200, headers, body: JSON.stringify(data || null) };
    }

    if (event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: '잘못된 JSON 형식입니다.' }) };
      }
      // 부분 저장(patch) 지원: 클라이언트가 변경된 항목(키)만 보내면,
      // 서버에 저장된 기존 데이터와 병합해서 저장합니다.
      // (예: A기기가 주문서만 수정해 저장해도, B기기가 그 사이 저장한
      //  자재관리 데이터를 덮어써서 지우는 일이 없도록 함)
      const current = (await store.get(KEY, { type: 'json' })) || {};
      const merged = { ...current, ...body };
      await store.setJSON(KEY, merged);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (err) {
    console.error('data function error', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '서버 오류가 발생했습니다.',
        debug_name: err && err.name,
        debug_message: err && err.message,
      }),
    };
  }
};
