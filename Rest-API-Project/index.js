// importing express and file system (reading and writing files) and path (file path handling)
import express from 'express';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

// initialize
const app = express();

// for parsing payload requests
app.use(express.json());

// store files
const TEACHERS_FILE = path.join(__dirname, "teachers.json");
const COURSES_FILE = path.join(__dirname, "courses.json");
const STUDENTS_FILE = path.join(__dirname, "students.json");
const TESTS_FILE = path.join(__dirname, "tests.json");

// check if file exists and reads and parses json from disk
function loadJson(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf-8");
    try {
        return JSON.parse(data);
    } catch (err) {
        console.error("error parsing", filePath, err);
        return [];
    }
}

// converts the object to formatted json and writes to disk
function saveJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// on server start loads current data from json files into memory
let teachers = loadJson(TEACHERS_FILE);
let courses = loadJson(COURSES_FILE);
let students = loadJson(STUDENTS_FILE);
let tests = loadJson(TESTS_FILE);

// assigns new ids to new records
let nextTeacherId = teachers.reduce((max, t) => Math.max(max, t.id), 0) + 1;
let nextCoursesId = courses.reduce((max, c) => Math.max(max, c.id), 0) + 1;
let nextStudentsId = students.reduce((max, s) => Math.max(max, s.id), 0) + 1;
let nextTestsId = tests.reduce((max, t) => Math.max(max, t.id), 0) + 1;

// start server on port 3000
app.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`);
});

app.get("/teachers", (req, res) => res.json(teachers));

// get teacher by id
app.get("/teachers/:id", (req, res) => {
    try {
        const id = Number(req.params.id);       // string to number
        const teacher = teachers.find(t => t.id === id);    // find teacher
        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        res.json(teacher);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// creates a new teacher w parameters and pushes it and returns status code 201 if successful and 400 if not all parameters r filled
app.post("/teachers", (req, res) => {
    try {
        const { firstName, lastName, email, department, room } = req.body;
        if (!firstName || !lastName || !email || !department || !room) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const newTeacher = {
            id: nextTeacherId++,
            firstName,
            lastName,
            email,
            department,
            room
        };
        teachers.push(newTeacher);
        saveJson(TEACHERS_FILE, teachers);
        res.status(201).json(newTeacher);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// find teacher then replace data if given replacement data
app.put("/teachers/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const teacher = teachers.find(t => t.id === id);
        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        const { firstName, lastName, email, department, room } = req.body;
        if (!firstName && !lastName && !email && !department && !room) {
            return res.status(400).json({ error: "No fields provided to update" });
        }
        if (firstName !== undefined) teacher.firstName = firstName;
        if (lastName !== undefined) teacher.lastName = lastName;
        if (email !== undefined) teacher.email = email;
        if (department !== undefined) teacher.department = department;
        if (room !== undefined) teacher.room = room;
        saveJson(TEACHERS_FILE, teachers);
        res.json(teacher);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// find teacher w id and then splice and delete the whole thing (block deletion)
app.delete("/teachers/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const teacher = teachers.findIndex(t => t.id === id);
        if (teacher === -1) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        const deletedTeacher = teachers.splice(teacher, 1)[0];
        saveJson(TEACHERS_FILE, teachers);
        res.status(200).json(deletedTeacher);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// get all courses
app.get("/courses", (req, res) => { res.json(courses) });

// get a course
app.get("/courses/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const course = courses.find(c => c.id === id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        };
        res.json(course);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// create a course
app.post("/courses", (req, res) => {
    try {
        const { code, name, teacherId, semester, room, schedule } = req.body;
        if (!code || !name || !teacherId || !semester || !room || !schedule) {
            return res.status(400).json({ error: "Missing fields" });
        };
        const newCourse = {
            id: nextCoursesId++,
            code,
            name,
            teacherId,
            semester,
            room,
            schedule
        };
        courses.push(newCourse);
        saveJson(COURSES_FILE, courses);
        res.status(201).json(newCourse);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// update a course and validate teacherId if changed
app.put("/courses/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const course = courses.find(c => c.id === id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        };
        const { code, name, teacherId, semester, room, schedule } = req.body;
        if (!code && !name && !teacherId && !semester && !room && !schedule) {
            return res.status(400).json({ error: "Missing fields" });
        };
        if (teacherId !== undefined) {
            const tE = teachers.some(t => t.id === Number(teacherId));
            if (!tE) {
                return res.status(400).json({ error: "Teacher doesn't exist" });
            };
            course.teacherId = Number(teacherId);
        };
        if (code !== undefined) course.code = code;
        if (name !== undefined) course.name = name;
        if (semester !== undefined) course.semester = semester;
        if (room !== undefined) course.room = room;
        if (schedule !== undefined) course.schedule = schedule;
        saveJson(COURSES_FILE, courses);
        res.json(course);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// block delete course
app.delete("/courses/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const course = courses.findIndex(c => c.id === id);
        if (course === -1) {
            return res.status(404).json({ error: "Course not found" });
        };
        const deletedCourse = courses.splice(course, 1)[0];
        saveJson(COURSES_FILE, courses);
        res.status(200).json(deletedCourse);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// get all students
app.get("/students", (req, res) => { res.json(students) });

// get a student
app.get("/students/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const student = students.find(s => s.id === id);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        };
        res.json(student);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// create a new student
app.post("/students", (req, res) => {
    try {
        const { firstName, lastName, grade, studentNumber } = req.body;
        if (!firstName || !lastName || !grade || !studentNumber) {
            return res.status(400).json({ error: "Missing field" });
        };
        const newStudent = {
            id: nextStudentsId++,
            firstName,
            lastName,
            grade,
            studentNumber
        };
        students.push(newStudent);
        saveJson(STUDENTS_FILE, students);
        res.status(201).json(newStudent);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// change students
app.put("/students/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const student = students.find(s => s.id === id);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        };
        const { firstName, lastName, grade, studentNumber } = req.body;
        if (!firstName && !lastName && !grade && !studentNumber) {
            return res.status(401).json({ error: "Missing field" });
        };
        if (firstName !== undefined) student.firstName = firstName;
        if (lastName !== undefined) student.lastName = lastName;
        if (grade !== undefined) student.grade = grade;
        if (studentNumber !== undefined) student.studentNumber = studentNumber;
        saveJson(STUDENTS_FILE, students);
        res.json(student);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// delete a student
app.delete("/students/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const student = students.findIndex(s => s.id === id);
        if (student === -1) {
            return res.status(404).json({ error: "Student not found" });
        };
        const deletedStudent = students.splice(student, 1)[0];
        saveJson(STUDENTS_FILE, students);
        res.status(200).json(deletedStudent);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// get tests
app.get("/tests", (req, res) => { res.json(tests) });

// get a test
app.get("/tests/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const test = tests.find(t => t.id === id);
        if (!test) {
            return res.status(404).json({ error: "Student not found" });
        };
        res.json(test);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// create a new test
app.post("/tests", (req, res) => {
    try {
        const { studentId, courseId, testName, date, mark, outOf, weight } = req.body;
        if (!studentId || !courseId || !testName || !date || !mark || !outOf || !weight) {
            return res.status(400).json({ error: "Missing field" });
        };
        const newTest = {
            id: nextTestsId++,
            studentId,
            courseId,
            testName,
            date,
            mark,
            outOf,
            weight
        };
        tests.push(newTest);
        saveJson(TESTS_FILE, tests);
        res.status(201).json(newTest);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// update existing test
app.put("/tests/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const test = tests.find(t => t.id === id);
        if (!test) {
            return res.status(404).json({ error: "Test not found" });
        };
        const { studentId, courseId, testName, date, mark, outOf, weight } = req.body;
        if (!studentId && !courseId && !testName && !date && !mark && !outOf && !weight) {
            return res.status(400).json({ error: "Missing field" });
        };
        if (studentId !== undefined) {
            const sE = students.some(s => s.id === Number(studentId));
            if (!sE) {
                return res.status(400).json({ error: "Student doesn't exist" });
            };
            test.studentId = Number(studentId);
        };
        if (courseId !== undefined) {
            const cE = courses.some(c => c.id === Number(courseId));
            if (!cE) {
                return res.status(400).json({ error: "Course doesn't exist" });
            };
            test.courseId = Number(courseId);
        };
        if (testName !== undefined) test.testName = testName;
        if (date !== undefined) test.date = date;
        if (mark !== undefined) test.mark = mark;
        if (outOf !== undefined) test.outOf = outOf;
        if (weight !== undefined) test.weight = weight;
        saveJson(TESTS_FILE, tests);
        res.json(test);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// delete tests
app.delete("/tests/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const test = tests.findIndex(t => t.id === id);
        if (test === -1) {
            return res.status(404).json({ error: "Test not found" });
        };
        const deletedTest = tests.splice(test, 1)[0];
        saveJson(TESTS_FILE, tests);
        res.status(200).json(deletedTest);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// list all tests for a specific student
app.get("/student/:id/tests", (req, res) => {
    try {
        const id = Number(req.params.id);
        const studentTests = tests.filter(t => t.studentId === id);
        res.json(studentTests);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// list all tests for a specific course
app.get("/courses/:id/tests", (req, res) => {
    try {
        const id = Number(req.params.id);
        const courseTests = tests.filter(t => t.courseId === id);
        res.json(courseTests);
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// calculate the student's average across all tests weighted
app.get("/students/:id/average", (req, res) => {
    try {
        const id = Number(req.params.id);
        const studentTests = tests.filter(t => t.studentId === id);
        if (studentTests.length === 0) {
            return res.status(404).json({ error: "Student didnt take any tests" });
        };
        const totalPercent = studentTests.reduce((sum, test) => {
            return sum + (test.mark / test.outOf) * 100;
        }, 0);
        const average = totalPercent / studentTests.length;
        res.json({ studentId: id, average: average.toFixed(2) });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

// calculate class average
app.get("/courses/:id/average", (req, res) => {
    try {
        const id = Number(req.params.id);
        const classTests = tests.filter(t => t.courseId === id);
        if (classTests.length === 0) {
            return res.status(404).json({ error: "course doesnt exist" });
        };
        const totalPercent = classTests.reduce((sum, test) => {
            return sum + (test.mark / test.outOf) * 100;
        }, 0);
        const average = totalPercent / classTests.length;
        res.json({ courseId: id, average: average.toFixed(2) });
    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

