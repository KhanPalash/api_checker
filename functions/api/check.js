export async function onRequestPost(context) {
  try {
    const req = context.request;
    let { baseUrl, customPath = '', method = 'GET', headers = {}, timeoutMs = 30000, probeBody, model } = await req.json();

    if (!baseUrl) {
      return json({ ok: false, error: 'baseUrl required' }, 400);
    }

    const incomingAuth = req.headers.get('authorization') || req.headers.get('Authorization');
    if (incomingAuth) headers = { ...headers, Authorization: incomingAuth };

    let url = baseUrl;
    if (customPath) {
      if (!url.endsWith('/') && !customPath.startsWith('/')) url += '/';
      url += customPath;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const fetchOptions = {
      method,
      headers,
      signal: controller.signal,
    };

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      if (probeBody) {
        fetchOptions.body = typeof probeBody === 'string' ? probeBody : JSON.stringify(probeBody);
      } else if (/chat\/completions/i.test(customPath) && model) {
        fetchOptions.body = JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 16
        });
      }
      if (fetchOptions.body && !fetchOptions.headers['Content-Type'] && !fetchOptions.headers['content-type']) {
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }

    const start = Date.now();
    let resp;
    try {
      resp = await fetch(url, fetchOptions);
    } finally {
      clearTimeout(timer);
    }
    const timeMs = Date.now() - start;

    let snippet = '';
    try {
      const text = await resp.text();
      snippet = text.slice(0, 2000);
    } catch {
      snippet = '<unreadable body>';
    }

    return json({
      ok: resp.ok,
      status: resp.status,
      statusText: resp.statusText,
      timeMs,
      url,
      snippet,
      headers: Object.fromEntries(resp.headers.entries())
    });
  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    return json({
      ok: false,
      status: null,
      statusText: isAbort ? 'timeout' : (err?.message || 'error'),
      timeMs: null,
      url: null,
      error: err?.message || 'error'
    });
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
