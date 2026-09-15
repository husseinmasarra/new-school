import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Secure Token for API authentication (Prevents unauthorized local network database access)
const SYNC_SECURITY_TOKEN = 'sp-secure-wifi-sync-token-2026';

// Custom plugin to handle Android APK downloads, API Security, and Automated Backups
const devDbSyncPlugin = () => ({
  name: 'dev-db-sync-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // 1. Enforce Android APK MIME type
      if (req.url && req.url.includes('.apk')) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="school-portal.apk"');
        next();
        return;
      }

      // 2. Validate Security Token for all Database API endpoints
      if (req.url && req.url.startsWith('/api/db/')) {
        const clientToken = req.headers['x-sync-token'];
        if (clientToken !== SYNC_SECURITY_TOKEN) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Unauthorized API Access: Invalid or missing token.' }));
          return;
        }
      }

      // 3. POST API to save database (with automatic rotating backups)
      if (req.url === '/api/db/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            // Write main database file
            const dbPath = path.join(__dirname, 'src', 'database.json');
            fs.writeFileSync(dbPath, body, 'utf8');

            // Generate rolling automated backup (keeps last 10 states)
            const backupsDir = path.join(__dirname, 'src', 'backups');
            if (!fs.existsSync(backupsDir)) {
              fs.mkdirSync(backupsDir, { recursive: true });
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(backupsDir, `database_${timestamp}.json`);
            fs.writeFileSync(backupPath, body, 'utf8');

            // Maintain rolling log of 10 backups maximum to conserve disk space
            const backupFiles = fs.readdirSync(backupsDir)
              .filter(f => f.startsWith('database_') && f.endsWith('.json'))
              .map(f => ({ name: f, mtime: fs.statSync(path.join(backupsDir, f)).mtime.getTime() }))
              .sort((a, b) => a.mtime - b.mtime);

            if (backupFiles.length > 10) {
              const obsoleteFiles = backupFiles.slice(0, backupFiles.length - 10);
              obsoleteFiles.forEach(f => {
                try {
                  fs.unlinkSync(path.join(backupsDir, f.name));
                } catch (err) {
                  console.error('[DB Backups] Failed to delete obsolete backup:', err);
                }
              });
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      // 4. GET API to load database
      if (req.url === '/api/db/load' && req.method === 'GET') {
        try {
          const dbPath = path.join(__dirname, 'src', 'database.json');
          res.setHeader('Content-Type', 'application/json');
          if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8');
            res.end(data);
          } else {
            res.end(JSON.stringify({}));
          }
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), devDbSyncPlugin()],
  base: './',
  server: {
    host: true,
    port: 5173
  }
})
