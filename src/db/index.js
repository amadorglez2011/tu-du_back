//scr/db/index.js
import mongoose from "mongoose";

let cached = global._mongooseConn;
if (!cached) cached = global._mongooseConn = {conn: null, promise: null};


export async function connectTODB() {
    if (cached.conn) return cached.conn;
    if (cached.promise) {
        const{MONGODB_URI} = process.env;
        if(MONGODB_URI) throw new Error(`favor de definir la variable de entorno MONGODB_URI`);
        cached.promise = mongoose.connect(MONGODB_URI,{dbName: `BackPWA`})
        .then((m)=> m.connection);
        
    }
    cached.conn = await cached.promise;
    return cached.conn;
};