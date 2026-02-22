// detect-models endpoint
module.exports = async function attachDetectModels(app, fetch) {
  app.post('/api/detect-models', async (req, res) => {
    try {
      const { baseUrl } = req.body;
      if (!baseUrl) return res.json({ ok:false, models: [] });

      const incomingAuth = req.header('authorization') || req.header('Authorization');
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
          if (!resp || !resp.ok) continue;
          let j = null;
          try { j = await resp.json(); } catch(e) { continue; }
          if (Array.isArray(j.models)) { models = j.models.map(m => m.id || m.name || m); break; }
          if (Array.isArray(j.data)) { models = j.data.map(m => m.id || m.name || m); break; }
          if (Array.isArray(j.model)) { models = j.model.map(m => m.id || m.name || m); break; }
        } catch(e) { continue; }
      }
      res.json({ ok: true, models });
    } catch(e) { res.json({ ok:false, models: [] }); }
  });
};
