import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { ObjectId } from "mongodb";
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getCollections } from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files (index.html, etc.) from the current directory
app.use(express.static(__dirname));

// Serve index.html for the root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

let userCol;
let db;

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.log("Render sees MONGODB_URI?", Boolean(process.env.MONGODB_URI));
    console.log("Keys include MONGODB_URI?", Object.keys(process.env).includes("MONGODB_URI"));
    throw new Error("Missing MONGODB_URI in environment variables");
}

connectDB()
    .then((database) => {
        db = database;
        const cols = getCollections();
        userCol = cols.user;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("MongoDB connection failed:", err);
    });

// Put this near the top (after imports). It lets routes accept either ObjectId _id or string _id.
function idFilter(idParam) {
    const id = String(idParam);
    return ObjectId.isValid(id)
        ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
        : { _id: id };
}

/* <--------------- Users ---------------> */

app.get("/user", async (req, res) => {
    const users = await userCol.find().toArray();
    res.json(users);
});

// get user by id
app.get("/user/:id", async (req, res) => {
    try {
        const user = await userCol.findOne(idFilter(req.params.id));
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        console.error("Invalid ID format:", err);
        res.status(400).json({ error: "Invalid ID" });
    }
});

// creates a new user w parameters and pushes it and returns status code 201 if successful and 400 if not all parameters r filled
app.post("/user", async (req, res) => {
    try {
        const newUser = req.body;
        const result = await userCol.insertOne(newUser);
        res.status(201).json({ _id: result.insertedId, ...newUser });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(400).json({ error: "Invalid data" });
    }
});

// find user then replace data if given replacement data
app.put("/user/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;

        const filter = idFilter(id);
        const updateResult = await userCol.updateOne(filter, { $set: updates });

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const updatedUser = await userCol.findOne(filter);
        return res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// find user w id and then delete the whole thing
app.delete("/user/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const filter = idFilter(id);
        const deleteResult = await userCol.deleteOne(filter);

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "Deleted" });
    } catch (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
