import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment variables");
}

const client = new MongoClient(MONGODB_URI);

let db;
let teachersCol;
let coursesCol;
let studentsCol;
let testsCol;

export async function connectDB() {
    await client.connect();
    db = client.db();
    teachersCol = db.collection("teachers");
    coursesCol = db.collection("courses");
    studentsCol = db.collection("students");
    testsCol = db.collection("tests");
    console.log("Connected to MongoDB Atlas");
}

export function getCollections() {
    if (!db) {
        throw new Error("Database not connected yet");
    }

    return {
        db,
        teachersCol,
        coursesCol,
        studentsCol,
        testsCol
    };
}
