import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json'};
http.createServer((req,res)=>{const clean=decodeURIComponent(req.url.split('?')[0]);const target=path.join(root,clean==='/'?'index.html':clean);if(!target.startsWith(root)){res.writeHead(403);return res.end()}fs.readFile(target,(error,data)=>{if(error){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});res.end(data)})}).listen(4173,'127.0.0.1');
