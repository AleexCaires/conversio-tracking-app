import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

//console.log("MONGODB_URI:", uri); // Debugging

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedDb: Db | null = null;

export const connectToDatabase = async (): Promise<Db> => {
    if (cachedDb) {
      return cachedDb;
    }
  
    const client = await MongoClient.connect(uri, {
    });
  
    const db = client.db('eventdata');  

    cachedDb = db;
  
    return db;
  };
