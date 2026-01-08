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

function mustBeNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
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
        const updates = req.body;  // e.g., { "subject": "Chemistry" }
        const result = await teachersCol.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updates },
            { returnDocument: "after" }
        );
        if (!result.value) return res.status(404).json({ error: "Teacher not found" });
        res.json(result.value);
    } catch (err) {
        console.error("Error updating teacher:", err);
        res.status(400).json({ error: "Invalid ID or data" });
    }
});

// find teacher w id and then splice and delete the whole thing (block deletion)
app.delete("/teachers/:id", async (req, res) => {
    try {
        const result = await teachersCol.findOneAndDelete({ _id: new ObjectId(req.params.id) });
        if (!result.value) return res.status(404).json({ error: "Teacher not found" });
        res.json({ message: "Deleted", teacher: result.value });
    } catch (err) {
        console.error("Error deleting teacher:", err);
        res.status(400).json({ error: "Invalid ID" });
    }
});


/* <--------------- Courses ---------------> */

// get all courses
app.get("/courses", async (req, res) => {
    const courses = await coursesCol.find().toArray();
    res.json(courses);
});

// get a course
app.get("/courses/:id", async (req, res) => {
    try {
        const course = await coursesCol.findOne({ _id: new ObjectId(req.params.id) });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.json(course);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// create a course
app.post("/courses", async (req, res) => {
    try {
        const { code, name, teacherId, semester, room, schedule } = req.body;
        if (!code || !name || !teacherId || !semester || !room || !schedule) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const teacherExists = await teachersCol.findOne({ _id: new ObjectId(teacherId) });
        if (!teacherExists) {
            return res.status(400).json({ error: "Teacher doesn't exist" });
        }

        const result = await coursesCol.insertOne({
            code,
            name,
            teacherId: new ObjectId(teacherId),
            semester,
            room,
            schedule
        });

        res.status(201).json({ _id: result.insertedId, code, name, teacherId, semester, room, schedule });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// update a course and validate teacherId if changed
app.put("/courses/:id", async (req, res) => {
    try {
        const update = {};
        const { code, name, teacherId, semester, room, schedule } = req.body;

        if (!code && !name && !teacherId && !semester && !room && !schedule) {
            return res.status(400).json({ error: "Missing fields" });
        }

        if (teacherId !== undefined) {
            const teacherExists = await teachersCol.findOne({ _id: new ObjectId(teacherId) });
            if (!teacherExists) {
                return res.status(400).json({ error: "Teacher doesn't exist" });
            }
            update.teacherId = new ObjectId(teacherId);
        }

        if (code !== undefined) update.code = code;
        if (name !== undefined) update.name = name;
        if (semester !== undefined) update.semester = semester;
        if (room !== undefined) update.room = room;
        if (schedule !== undefined) update.schedule = schedule;

        const result = await coursesCol.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: update },
            { returnDocument: "after" }
        );

        if (!result.value) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.json(result.value);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// block delete course
app.delete("/courses/:id", async (req, res) => {
    try {
        const result = await coursesCol.findOneAndDelete({ _id: new ObjectId(req.params.id) });
        if (!result.value) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.status(200).json(result.value);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


/* <--------------- Students ---------------> */

// get all students
app.get("/students", async (req, res) => {
    const students = await studentsCol.find().toArray();
    res.json(students);
});

// get a student
app.get("/students/:id", async (req, res) => {
    try {
        const student = await studentsCol.findOne({ _id: new ObjectId(req.params.id) });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
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
        if (!firstName || !lastName || !grade || !studentNumber) {
            return res.status(400).json({ error: "Missing field" });
        }

        const result = await studentsCol.insertOne({ firstName, lastName, grade, studentNumber });
        res.status(201).json({ _id: result.insertedId, firstName, lastName, grade, studentNumber });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// change students
app.put("/students/:id", async (req, res) => {
    try {
        const update = {};
        const { firstName, lastName, grade, studentNumber } = req.body;

        if (!firstName && !lastName && !grade && !studentNumber) {
            return res.status(401).json({ error: "Missing field" });
        }

        if (firstName !== undefined) update.firstName = firstName;
        if (lastName !== undefined) update.lastName = lastName;
        if (grade !== undefined) update.grade = grade;
        if (studentNumber !== undefined) update.studentNumber = studentNumber;

        const result = await studentsCol.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: update },
            { returnDocument: "after" }
        );

        if (!result.value) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json(result.value);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// delete a student
app.delete("/students/:id", async (req, res) => {
    try {
        const result = await studentsCol.findOneAndDelete({ _id: new ObjectId(req.params.id) });
        if (!result.value) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.status(200).json(result.value);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


/* <--------------- Tests ---------------> */

// get tests
app.get("/tests", async (req, res) => {
    const tests = await testsCol.find().toArray();
    res.json(tests);
});

// get a test
app.get("/tests/:id", async (req, res) => {
    try {
        const test = await testsCol.findOne({ _id: new ObjectId(req.params.id) });
        if (!test) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json(test);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// create a new test
app.post("/tests", async (req, res) => {
    try {
        const { studentId, courseId, testName, date, mark, outOf, weight } = req.body;
        if (!studentId || !courseId || !testName || !date || !mark || !outOf || !weight) {
            return res.status(400).json({ error: "Missing field" });
        }

        const result = await testsCol.insertOne({
            studentId: new ObjectId(studentId),
            courseId: new ObjectId(courseId),
            testName,
            date,
            mark,
            outOf,
            weight
        });

        res.status(201).json({ _id: result.insertedId, studentId, courseId, testName, date, mark, outOf, weight });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// update existing test
app.put("/tests/:id", async (req, res) => {
    try {
        const update = {};
        const { studentId, courseId, testName, date, mark, outOf, weight } = req.body;

        if (!studentId && !courseId && !testName && !date && !mark && !outOf && !weight) {
            return res.status(400).json({ error: "Missing field" });
        }

        if (studentId !== undefined) update.studentId = new ObjectId(studentId);
        if (courseId !== undefined) update.courseId = new ObjectId(courseId);
        if (testName !== undefined) update.testName = testName;
        if (date !== undefined) update.date = date;
        if (mark !== undefined) update.mark = mark;
        if (outOf !== undefined) update.outOf = outOf;
        if (weight !== undefined) update.weight = weight;

        const result = await testsCol.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: update },
            { returnDocument: "after" }
        );

        if (!result.value) {
            return res.status(404).json({ error: "Test not found" });
        }

        res.json(result.value);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// delete tests
app.delete("/tests/:id", async (req, res) => {
    try {
        const result = await testsCol.findOneAndDelete({ _id: new ObjectId(req.params.id) });
        if (!result.value) {
            return res.status(404).json({ error: "Test not found" });
        }
        res.status(200).json(result.value);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


/* <--------------- Extra Stuff ---------------> */

// list all tests for a specific student
app.get("/student/:id/tests", async (req, res) => {
    try {
        const studentId = new ObjectId(req.params.id);
        const studentTests = await testsCol.find({ studentId }).toArray();
        res.json(studentTests);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// list all tests for a specific course
app.get("/courses/:id/tests", async (req, res) => {
    try {
        const courseId = new ObjectId(req.params.id);
        const courseTests = await testsCol.find({ courseId }).toArray();
        res.json(courseTests);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// calculate the student's average across all tests weighted
app.get("/students/:id/average", async (req, res) => {
    try {
        const studentId = new ObjectId(req.params.id);
        const studentTests = await testsCol.find({ studentId }).toArray();
        if (studentTests.length === 0) {
            return res.status(404).json({ error: "Student didnt take any tests" });
        }
        const totalPercent = studentTests.reduce((sum, test) => {
            return sum + (test.mark / test.outOf) * 100;
        }, 0);
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
        const courseId = new ObjectId(req.params.id);
        const classTests = await testsCol.find({ courseId }).toArray();
        if (classTests.length === 0) {
            return res.status(404).json({ error: "course doesnt exist" });
        }
        const totalPercent = classTests.reduce((sum, test) => {
            return sum + (test.mark / test.outOf) * 100;
        }, 0);
        const average = totalPercent / classTests.length;
        res.json({ courseId: req.params.id, average: average.toFixed(2) });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start DB and server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Connected to MongoDB Atlas\nServer running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
    });