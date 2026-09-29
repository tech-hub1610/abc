import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transform } from 'sucrase';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let PORT = parseInt(process.env.PORT || '5173', 10);
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.ts': 'application/javascript; charset=utf-8',
  '.tsx': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// Rewrite relative imports in transpiled code to resolve .ts/.tsx extensions automatically
function resolveImports(code, currentFilePath) {
  // Strip any raw .css imports inside JS/TS files to avoid MIME type errors in browsers
  code = code.replace(/import\s+['"][^'"]+\.css['"];?/g, '// [css import removed]');

  return code.replace(
    /from\s+['"](\.[^'"]+)['"]/g,
    (match, importPath) => {
      if (path.extname(importPath)) {
        return `from "${importPath}"`;
      }
      const dir = path.dirname(currentFilePath);
      const possibleExtensions = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.js'];
      for (const ext of possibleExtensions) {
        const testPath = path.join(dir, importPath + ext);
        if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
          return `from "${importPath}${ext}"`;
        }
      }
      return `from "${importPath}.tsx"`;
    }
  );
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(__dirname, reqPath);
  let isSourceFile = reqPath.startsWith('/src/') || reqPath.endsWith('.ts') || reqPath.endsWith('.tsx');

  // Handle vendor and static assets
  if (reqPath.startsWith('/vendor/')) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // Handle source files
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.tsx')) {
      filePath = filePath + '.tsx';
      isSourceFile = true;
    } else if (fs.existsSync(filePath + '.ts')) {
      filePath = filePath + '.ts';
      isSourceFile = true;
    } else if (fs.existsSync(filePath + '/index.tsx')) {
      filePath = filePath + '/index.tsx';
      isSourceFile = true;
    } else if (fs.existsSync(filePath + '/index.ts')) {
      filePath = filePath + '/index.ts';
      isSourceFile = true;
    } else if (!reqPath.includes('.')) {
      // SPA Fallback for client-side routing
      filePath = path.join(__dirname, 'index.html');
      isSourceFile = false;
    }
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found: ' + reqPath);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();

  // If serving TypeScript / JSX, transpile on the fly with Sucrase
  if (ext === '.ts' || ext === '.tsx') {
    try {
      let rawCode = fs.readFileSync(filePath, 'utf-8');

      // Ensure React import exists if JSX is present
      if ((ext === '.tsx' || rawCode.includes('<')) && !rawCode.includes("from 'react'") && !rawCode.includes('from "react"')) {
        rawCode = `import React from 'react';\n` + rawCode;
      }

      const compiled = transform(rawCode, {
        transforms: ['jsx', 'typescript'],
        jsxRuntime: 'classic',
        production: true,
      });

      const resolvedCode = resolveImports(compiled.code, filePath);

      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      });
      res.end(resolvedCode);
      return;
    } catch (err) {
      console.error(`Transpile error in ${filePath}:`, err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Transpile error: ' + err.message);
      return;
    }
  }

  // Static files
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error: ' + err.message);
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  });
});

function startServer(port) {
  server.listen(port, HOST, () => {
    console.log(`\n==================================================`);
    console.log(`🎰 Lucky Buzz WebApp Running Successfully!`);
    console.log(`==================================================`);
    console.log(`➜ Local:   http://localhost:${port}/`);
    console.log(`➜ Network: http://${HOST}:${port}/`);
    console.log(`==================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
