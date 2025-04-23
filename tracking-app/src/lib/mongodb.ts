import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

console.log("MONGODB_URI:", uri); // Debugging

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export const connectToDatabase = async (): Promise<Db> => {
    if (cachedDb) {
      console.log("Using cached database connection");
      return cachedDb;
    }
  
    console.log("Connecting to MongoDB...");
    const client = await MongoClient.connect(uri, {
      // Optional: use unified topology and server API (especially for Atlas)
      // serverApi: ServerApiVersion.v1,
    });
  
    console.log("Connected to MongoDB");
    const db = client.db('eventdata');  
  
    cachedClient = client;
    cachedDb = db;
  
    return db;
  };
