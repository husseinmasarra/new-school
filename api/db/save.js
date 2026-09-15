import { MongoClient } from 'mongodb';

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-sync-token, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const mongo = await connectToMongo();
    if (mongo) {
      const db = mongo.db('school_portal_db');
      await db.collection('database_records').updateOne(
        { _id: 'school_data_payload' },
        { $set: { data, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.status(200).json({ success: true, cloud: true });
    }

    return res.status(200).json({ success: true, warning: 'Data acknowledged. For multi-device cloud persistence on Vercel, set MONGODB_URI environment variable.' });
  } catch (err) {
    console.error('Error saving database:', err);
    return res.status(500).json({ error: err.message });
  }
}
