import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

let cachedClient = null;

async function connectToMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-sync-token, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const mongo = await connectToMongo();
    if (mongo) {
      const db = mongo.db('school_portal_db');
      const record = await db.collection('database_records').findOne({ _id: 'school_data_payload' });
      if (record && record.data && Object.keys(record.data).length > 0) {
        return res.status(200).json(record.data);
      }
    }

    // Fallback: Read database.json bundled with the build
    const dbPath = path.join(process.cwd(), 'src', 'database.json');
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf8');
      return res.status(200).send(fileData);
    }

    return res.status(200).json({});
  } catch (err) {
    console.error('Error loading database:', err);
    return res.status(500).json({ error: err.message });
  }
}
