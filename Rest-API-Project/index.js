// ADDED TRY AND CATCH STUFF TO EACH ROUTE FOR EXTRA ERROR CHECKING
// importing express and file system (reading and writing files) and path (file path handling)
import express from 'express';
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

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

const client = new MongoClient(MONGODB_URI);

let db;
let teachersCol;
let coursesCol;
let studentsCol;
let testsCol;

async function connectDB() {
    await client.connect();
    db = client.db(); // uses db name from URI, or default
    teachersCol = db.collection("teachers");
    coursesCol = db.collection("courses");
    studentsCol = db.collection("students");
    testsCol = db.collection("tests");
    console.log("Connected to MongoDB Atlas");
}

async function getNextLegacyId(col) {
    const doc = await col.find().sort({ id: -1 }).limit(1).toArray();
    if (doc.length === 0) return 1;
    return Number(doc[0].id) + 1;
}

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

/* <--------------- Teachers ---------------> */

app.get("/teachers", async (req, res) => {
    const teachers = await teachersCol.find().toArray();
    res.json(teachers);
});

// get teacher by id
app.get("/teachers/:id", async (req, res) => {
    try {
        const teacher = await teachersCol.findOne({ _id: new ObjectId(req.params.id) });
        if (!teacher) return res.status(404).json({ error: "Teacher not found" });
        res.json(teacher);
    } catch (err) {
        console.error("Invalid ID format:", err);
        res.status(400).json({ error: "Invalid ID" });
    }
});

// creates a new teacher w parameters and pushes it and returns status code 201 if successful and 400 if not all parameters r filled
app.post("/teachers", async (req, res) => {
    try {
        const newTeacher = req.body;
        const result = await teachersCol.insertOne(newTeacher);
        res.status(201).json({ _id: result.insertedId, ...newTeacher });
    } catch (err) {
        console.error("Error creating teacher:", err);
        res.status(400).json({ error: "Invalid data" });
    }
});

// find teacher then replace data if given replacement data
app.put("/teachers/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;

        // Build a filter that works whether _id is ObjectId or a string
        const filter = ObjectId.isValid(id)
            ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
            : { _id: id };

        const updateResult = await teachersCol.updateOne(filter, { $set: updates });

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        // Fetch the updated doc using the same filter style
        const updatedTeacher = await teachersCol.findOne(filter);
        return res.status(200).json(updatedTeacher);
    } catch (err) {
        console.error("Error updating teacher:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// find teacher w id and then splice and delete the whole thing (block deletion)
app.delete("/teachers/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // Works whether _id is ObjectId or string
        const filter = ObjectId.isValid(id)
            ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
            : { _id: id };

        const deleteResult = await teachersCol.deleteOne(filter);

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        return res.status(200).json({ message: "Deleted" });
    } catch (err) {
        console.error("Error deleting teacher:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});


/* <--------------- Courses ---------------> */

// get all courses
app.get("/courses", async (req, res) => {
    try {
        const courses = await coursesCol.find().toArray();
        res.json(courses);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// get a course (accepts ObjectId or string _id)
app.get("/courses/:id", async (req, res) => {
    try {
        const course = await coursesCol.findOne(idFilter(req.params.id));
        if (!course) return res.status(404).json({ error: "Course not found" });
        res.json(course);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// create a course (teacherId can be ObjectId-ish or string)
app.post("/courses", async (req, res) => {
    try {
        const { code, name, teacherId, semester, room, schedule } = req.body;
        if (!code || !name || !teacherId || !semester || !room || !schedule) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // teacher exists (match teachers._id as ObjectId OR string)
        const teacherExists = await teachersCol.findOne(idFilter(teacherId));
        if (!teacherExists) {
            return res.status(400).json({ error: "Teacher doesn't exist" });
        }

        // store teacherId in a consistent way if possible
        const teacherIdStored = normalizeIdForStorage(teacherId);

        const result = await coursesCol.insertOne({
            code,
            name,
            teacherId: teacherIdStored,
            semester,
            room,
            schedule,
        });

        res.status(201).json({
            _id: result.insertedId,
            code,
            name,
            teacherId: teacherIdStored,
            semester,
            room,
            schedule,
        });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// update a course (accepts ObjectId or string for :id, and teacherId)
app.put("/courses/:id", async (req, res) => {
    try {
        const { code, name, teacherId, semester, room, schedule } = req.body;

        if (
            code === undefined &&
            name === undefined &&
            teacherId === undefined &&
            semester === undefined &&
            room === undefined &&
            schedule === undefined
        ) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const update = {};
        if (teacherId !== undefined) {
            const teacherExists = await teachersCol.findOne(idFilter(teacherId));
            if (!teacherExists) return res.status(400).json({ error: "Teacher doesn't exist" });
            update.teacherId = normalizeIdForStorage(teacherId);
        }

        if (code !== undefined) update.code = code;
        if (name !== undefined) update.name = name;
        if (semester !== undefined) update.semester = semester;
        if (room !== undefined) update.room = room;
        if (schedule !== undefined) update.schedule = schedule;

        const updateResult = await coursesCol.updateOne(idFilter(req.params.id), { $set: update });

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Course not found" });
        }

        const updatedCourse = await coursesCol.findOne(idFilter(req.params.id));
        res.json(updatedCourse);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// delete course (accepts ObjectId or string _id)
app.delete("/courses/:id", async (req, res) => {
    try {
        const deleteResult = await coursesCol.deleteOne(idFilter(req.params.id));
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/* <--------------- Students ---------------> */

// get all students
app.get("/students", async (req, res) => {
    try {
        const students = await studentsCol.find().toArray();
        res.json(students);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// get a student (accepts ObjectId or string _id)
app.get("/students/:id", async (req, res) => {
    try {
        const student = await studentsCol.findOne(idFilter(req.params.id));
        if (!student) return res.status(404).json({ error: "Student not found" });
        res.json(student);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// create a new student
app.post("/students", async (req, res) => {
    try {
        const { firstName, lastName, grade, studentNumber } = req.body;
        if (!firstName || !lastName || grade === undefined || !studentNumber) {
            return res.status(400).json({ error: "Missing field" });
        }

        // Optional: prevent client-provided _id from creating string ids
        const doc = { firstName, lastName, grade, studentNumber };
        const result = await studentsCol.insertOne(doc);

        res.status(201).json({ _id: result.insertedId, ...doc });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// change students (accepts ObjectId or string _id)
app.put("/students/:id", async (req, res) => {
    try {
        const { firstName, lastName, grade, studentNumber } = req.body;

        if (
            firstName === undefined &&
            lastName === undefined &&
            grade === undefined &&
            studentNumber === undefined
        ) {
            return res.status(400).json({ error: "Missing field" });
        }

        const update = {};
        if (firstName !== undefined) update.firstName = firstName;
        if (lastName !== undefined) update.lastName = lastName;
        if (grade !== undefined) update.grade = grade;
        if (studentNumber !== undefined) update.studentNumber = studentNumber;

        const updateResult = await studentsCol.updateOne(idFilter(req.params.id), { $set: update });

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        const updatedStudent = await studentsCol.findOne(idFilter(req.params.id));
        res.json(updatedStudent);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// delete a student (accepts ObjectId or string _id)
app.delete("/students/:id", async (req, res) => {
    try {
        const deleteResult = await studentsCol.deleteOne(idFilter(req.params.id));
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/* <--------------- Tests ---------------> */

// get tests
app.get("/tests", async (req, res) => {
    try {
        const tests = await testsCol.find().toArray();
        res.json(tests);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// get a test (accepts ObjectId or string _id)
app.get("/tests/:id", async (req, res) => {
    try {
        const test = await testsCol.findOne(idFilter(req.params.id));
        if (!test) return res.status(404).json({ error: "Test not found" });
        res.json(test);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// create a new test (studentId/courseId can be ObjectId-ish or string)
app.post("/tests", async (req, res) => {
    try {
        const { studentId, courseId, testName, date, mark, outOf, weight } = req.body;
        if (
            !studentId ||
            !courseId ||
            !testName ||
            !date ||
            mark === undefined ||
            outOf === undefined ||
            weight === undefined
        ) {
            return res.status(400).json({ error: "Missing field" });
        }

        const studentIdStored = normalizeIdForStorage(studentId);
        const courseIdStored = normalizeIdForStorage(courseId);

        const result = await testsCol.insertOne({
            studentId: studentIdStored,
            courseId: courseIdStored,
            testName,
            date,
            mark,
            outOf,
            weight,
        });

        res.status(201).json({
            _id: result.insertedId,
            studentId: studentIdStored,
            courseId: courseIdStored,
            testName,
            date,
            mark,
            outOf,
            weight,
        });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// update existing test (accepts ObjectId or string _id, plus studentId/courseId)
app.put("/tests/:id", async (req, res) => {
    try {
        const { studentId, courseId, testName, date, mark, outOf, weight } = req.body;

        if (
            studentId === undefined &&
            courseId === undefined &&
            testName === undefined &&
            date === undefined &&
            mark === undefined &&
            outOf === undefined &&
            weight === undefined
        ) {
            return res.status(400).json({ error: "Missing field" });
        }

        const update = {};
        if (studentId !== undefined) update.studentId = normalizeIdForStorage(studentId);
        if (courseId !== undefined) update.courseId = normalizeIdForStorage(courseId);
        if (testName !== undefined) update.testName = testName;
        if (date !== undefined) update.date = date;
        if (mark !== undefined) update.mark = mark;
        if (outOf !== undefined) update.outOf = outOf;
        if (weight !== undefined) update.weight = weight;

        const updateResult = await testsCol.updateOne(idFilter(req.params.id), { $set: update });

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Test not found" });
        }

        const updatedTest = await testsCol.findOne(idFilter(req.params.id));
        res.json(updatedTest);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// delete tests (accepts ObjectId or string _id)
app.delete("/tests/:id", async (req, res) => {
    try {
        const deleteResult = await testsCol.deleteOne(idFilter(req.params.id));
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: "Test not found" });
        }
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/* <--------------- Extra Stuff ---------------> */

// list all tests for a specific student (studentId stored as ObjectId OR string)
app.get("/student/:id/tests", async (req, res) => {
    try {
        const studentTests = await testsCol.find(fkFilter("studentId", req.params.id)).toArray();
        res.json(studentTests);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// list all tests for a specific course (courseId stored as ObjectId OR string)
app.get("/courses/:id/tests", async (req, res) => {
    try {
        const courseTests = await testsCol.find(fkFilter("courseId", req.params.id)).toArray();
        res.json(courseTests);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// calculate the student's average across all tests
app.get("/students/:id/average", async (req, res) => {
    try {
        const studentTests = await testsCol.find(fkFilter("studentId", req.params.id)).toArray();
        if (studentTests.length === 0) {
            return res.status(404).json({ error: "Student didnt take any tests" });
        }

        const totalPercent = studentTests.reduce((sum, test) => sum + (test.mark / test.outOf) * 100, 0);
        const average = totalPercent / studentTests.length;

        res.json({ studentId: req.params.id, average: average.toFixed(2) });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// calculate class average
app.get("/courses/:id/average", async (req, res) => {
    try {
        const classTests = await testsCol.find(fkFilter("courseId", req.params.id)).toArray();
        if (classTests.length === 0) {
            return res.status(404).json({ error: "course doesnt exist" });
        }

        const totalPercent = classTests.reduce((sum, test) => sum + (test.mark / test.outOf) * 100, 0);
        const average = totalPercent / classTests.length;

        res.json({ courseId: req.params.id, average: average.toFixed(2) });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB AFTER server starts
connectDB()
    .then(() => {
        console.log("Connected to MongoDB Atlas");
    })
    .catch(err => {
        console.error("MongoDB connection failed:", err);
    });