import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof global & {
  _mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalWithMongoose._mongooseCache || {
  conn: null,
  promise: null,
};

export async function dbConnect() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined,
    });
  }

  cache.conn = await cache.promise;
  globalWithMongoose._mongooseCache = cache;
  return cache.conn;
}

export default dbConnect;
