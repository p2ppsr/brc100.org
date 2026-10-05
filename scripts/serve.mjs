import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('frontend');
const types = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.xml':'application/xml' };
const server = http.createServer(async (request,response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff' });
    response.end(content);
  } catch (_) { response.writeHead(404); response.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4179),'127.0.0.1',() => console.log('BRC100 preview: http://127.0.0.1:' + (process.env.PORT || 4179)));
