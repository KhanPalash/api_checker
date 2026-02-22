export function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, service: 'api-checker-pages' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
