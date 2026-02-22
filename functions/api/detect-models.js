export async function onRequestPost(context) {
  try {
    const req = context.request;
    const { baseUrl } = await req.json();
    if (!baseUrl) return json({ ok: false, models: [] });

    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization');
    const fetchHeaders = incomingAuth ? { Authorization: incomingAuth } : {};

    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const isV1Base = /\/v1$/i.test(base);
    const tryPaths = isV1Base
      ? ['/models', '/model']
      : ['/v1/models', '/models', '/v1/model', '/model'];

    let models = [];
    for (const p of tryPaths) {
      try {
        const url = base + p;
        const resp = await fetch(url, { method: 'GET', headers: fetchHeaders });
        if (!resp.ok) continue;

        let j;
        try { j = await resp.json(); } catch { continue; }

        if (Array.isArray(j.models)) { models = j.models.map(m => m.id || m.name || m); break; }
        if (Array.isArray(j.data)) { models = j.data.map(m => m.id || m.name || m); break; }
        if (Array.isArray(j.model)) { models = j.model.map(m => m.id || m.name || m); break; }
      } catch {}
    }

    return json({ ok: true, models });
  } catch {
    return json({ ok: false, models: [] });
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

export const onRequestOptions = () => json({}, 204);
