const { getStore, connectLambda } = require('@netlify/blobs');

const STORE_NAME = 'pt-mungyo-db';
const KEY = 'db';

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

exports.handler = async (event) => {
  try {
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
