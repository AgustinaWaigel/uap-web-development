import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = (global as any).mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI no está definido en las variables de entorno.");
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI)
    .then((mongoose) => mongoose)
    .catch((err) => {
      console.error("Error al conectar a MongoDB Atlas:", err);
      throw new Error("No se pudo conectar a la base de datos. Revisa tu string de conexión y permisos en Atlas.");
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
