import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
// Rate limiting for API endpoints ONLY to prevent brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // limit each IP to 5000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

const SYNC_SECURITY_TOKEN = process.env.SYNC_SECURITY_TOKEN || 'sp-secure-wifi-sync-token-2026';

// 1. Validate security token for database endpoints
const authenticateToken = (req, res, next) => {
  const clientToken = req.headers['x-sync-token'];
  if (clientToken !== SYNC_SECURITY_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing token.' });
  }
  next();
};

// 2. Cloud MongoDB / Local JSON Database Setup
const MONGODB_URI = process.env.MONGODB_URI;
let mongoClient = null;
let dbCollection = null;

if (MONGODB_URI) {
  mongoClient = new MongoClient(MONGODB_URI);
  mongoClient.connect()
    .then(() => {
      const db = mongoClient.db('school_portal_db');
      dbCollection = db.collection('database_records');
      console.log('[Database] Connected successfully to Cloud MongoDB Atlas!');
    })
    .catch(err => {
      console.error('[Database] Failed to connect to MongoDB, falling back to local file:', err.message);
    });
}

const dbPath = path.join(__dirname, 'src', 'database.json');

// Save Database API
app.post('/api/db/save', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    // ---- Simple payload validation ----
    if (typeof data !== 'object' || data === null) {
      return res.status(400).json({ error: 'Invalid payload: expected JSON object.' });
    }
    // Reject keys that could be used for MongoDB operator injection
    const hasIllegalKey = Object.keys(data).some(k => k.startsWith('$'));
    if (hasIllegalKey) {
      return res.status(400).json({ error: 'Payload contains prohibited keys.' });
    }

    if (dbCollection) {
      // Save to Cloud MongoDB
      await dbCollection.updateOne(
        { _id: 'school_data_payload' },
        { $set: { data, updatedAt: new Date() } },
        { upsert: true }
      );
      console.log('[Database] Saved successfully to Cloud MongoDB.');
    } else {
      // Fallback: Write local database file
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

      // Generate rolling automated backup (keeps last 10 states)
      const backupsDir = path.join(__dirname, 'src', 'backups');
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupsDir, `database_${timestamp}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');

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
      console.log('[Database] Saved successfully to local disk.');
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Load Database API
app.get('/api/db/load', authenticateToken, async (req, res) => {
  try {
    if (dbCollection) {
      // Load from Cloud MongoDB
      const record = await dbCollection.findOne({ _id: 'school_data_payload' });
      if (record && record.data && Object.keys(record.data).length > 0) {
        res.json(record.data);
      } else {
        // Fallback seed: check if local database.json exists on disk
        if (fs.existsSync(dbPath)) {
          console.log('[Database] MongoDB is empty. Seeding from local database.json...');
          try {
            const localDataRaw = fs.readFileSync(dbPath, 'utf8');
            const localData = JSON.parse(localDataRaw);
            
            // Seed the MongoDB collection so it persists
            await dbCollection.updateOne(
              { _id: 'school_data_payload' },
              { $set: { data: localData, updatedAt: new Date() } },
              { upsert: true }
            );
            res.json(localData);
          } catch (parseErr) {
            console.error('[Database] Failed to parse local database.json during seeding:', parseErr);
            res.json({});
          }
        } else {
          res.json({});
        }
      }
    } else {
      // Fallback: Load local database file
      if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      } else {
        res.json({});
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Force no-cache for logo, favicon, and icon files
app.get(/\/(logo|favicon|icon)/, (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// 4. Serve the built React static files
app.use(express.static(path.join(__dirname, 'dist'), {
  etag: false,
  setHeaders: (res, filePath) => {
    if (filePath.includes('logo') || filePath.includes('favicon') || filePath.includes('icon')) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }
  }
}));

// 5. Fallback route for React Router (Single Page App)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
