import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment variables");
}

const client = new MongoClient(MONGODB_URI);

let db;
let userCol;

export async function connectDB() {
    try {
        await client.connect();
        db = client.db();
        userCol = db.collection("users"); // Assuming the collection name is "users"
        console.log("Connected to MongoDB Atlas");
        return db;
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        throw err;
    }
}

export function getCollections() {
    if (!db) {
        throw new Error("Database not connected yet");
    }

    return {
        db,
        user: userCol
    };
}
