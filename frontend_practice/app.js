import express from 'express';
import { connectDB, getCollections } from "./db.js";

let dataCol;

dotenv.config();
// initialize
const app = express();
// for parsing payload requests
app.use(express.json());

app.get("/health", (req, res) => {
    res.status(db ? 200 : 503).json({
        ok: Boolean(db),
        dbConnected: Boolean(db)
    });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.log("Render sees MONGODB_URI?", Boolean(process.env.MONGODB_URI));
    console.log("Keys include MONGODB_URI?", Object.keys(process.env).includes("MONGODB_URI"));
    throw new Error("Missing MONGODB_URI in environment variables");
};

connectDB()
    .then(() => {
        const cols = getCollections();
        dataCol = cols.data;
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

// Same idea, but for foreign keys stored as either ObjectId or string in your documents
function fkFilter(field, idValue) {
    const id = String(idValue);
    return ObjectId.isValid(id)
        ? { $or: [{ [field]: new ObjectId(id) }, { [field]: id }] }
        : { [field]: id };
}

function normalizeIdForStorage(idValue) {
    const id = String(idValue);
    return ObjectId.isValid(id) ? new ObjectId(id) : id;
}

/* <---------- stuff ----------> */
app.get("/data", async (req, res) => {
    const data = await dataCol.find().toArray();
    res.json(data);
});

app.post("/data", async (req, res) => {
    try {
        const newData = req.body;
        const result = await dataCol.insertOne(newData);
        res.status(201).json({ _id: result.insertedId, ...newData });
    } catch (err) {
        console.error("Error creating data:", err);
        res.status(400).json({ error: "Invalid data" });
    }
});


