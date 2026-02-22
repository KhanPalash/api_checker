const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const path = require('path');
const cors = require('cors');
const attachDetect = require('./server_addition');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/check', async (req, res) => {
  try {
    let { baseUrl, customPath = '', method = 'GET', headers = {}, timeoutMs = 30000, probeBody } = req.body;
    // Accept Authorization token from incoming request header (from frontend) too
    // If the frontend passed an Authorization header, merge it into headers used for the proxied request
    const incomingAuth = req.header('authorization') || req.header('Authorization');
    if (incomingAuth) { headers = Object.assign({}, headers, { Authorization: incomingAuth }); }
    if (!baseUrl) return res.status(400).json({ error: 'baseUrl required' });

    let url = baseUrl;
    if (customPath) {
      if (!url.endsWith('/') && !customPath.startsWith('/')) url += '/';
      url += customPath;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const fetchOptions = {
      method,
      headers,
      signal: controller.signal,
    };
    // Auto-build body for OpenAI-compatible chat/completions if model is provided
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      if (probeBody) {
        fetchOptions.body = typeof probeBody === 'string' ? probeBody : JSON.stringify(probeBody);
      } else if (/chat\/completions/i.test(customPath) && req.body.model) {
        fetchOptions.body = JSON.stringify({
          model: req.body.model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 16
        });
      }
      if (fetchOptions.body && !fetchOptions.headers['Content-Type'] && !fetchOptions.headers['content-type']) {
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }

    const start = Date.now();
    const resp = await fetch(url, fetchOptions);
    clearTimeout(timeout);
    const timeMs = Date.now() - start;

    let snippet = '';
    try {
      const text = await resp.text();
      snippet = text.slice(0, 2000);
    } catch (e) {
      snippet = '<unreadable body>';
    }

    res.json({
      ok: resp.ok,
      status: resp.status,
      statusText: resp.statusText,
      timeMs,
      url,
      snippet,
      headers: Object.fromEntries(resp.headers.entries()),
    });
  } catch (err) {
    const isAbort = err.name === 'AbortError';
    res.json({
      ok: false,
      status: null,
      statusText: isAbort ? 'timeout' : (err.message || 'error'),
      timeMs: null,
      url: null,
      error: err.message
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`api-checker listening on http://localhost:${PORT}`));
// attach detect-models endpoint
attachDetect(app, fetch);
