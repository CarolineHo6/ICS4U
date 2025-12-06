// importing express and file system (reading and writing files) and path (file path handling)
import express from 'express';
import fs from 'fs';
import path from 'path';

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
    } catch(err) {
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
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:3000`);
});

app.get("/teachers", (req, res) => res.json(teachers));

// get teacher by id
app.get("/teacher/:id", (req, res) => {
    const id = Number(req.params.id);       // string to number
    const teacher = teachers.find(t => t.id === id);    // find teacher
    if (!teacher) {
        return res.status(404).json({error: "Teacher not found"});
    }
    res.json(teacher);
});

// creates a new teacher w parameters and pushes it and returns status code 201 if successful and 400 if not all parameters r filled
app.post("/teacher", (req, res) => {
    const {firstName, lastName, email, department, room} = req.body;
    if (!firstName || !lastName || !email || !department || !room) {
        return res.status(400).json({error: "Missing fields"});
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
    res.status(201).json(teachers);
});

// find teacher then replace data if given replacement data
app.put("/teachers/:id", (req, res) => {
    const id = Number(res.param.id);
    const teacher = teachers.find(t => t.id === id);
    if (!teacher) {
        res.status(404).json({error: "Teacher not found"});
    }
    const {firstName, lastName, email, department, room} = req.body;
    if (!firstName && !lastName && !email && !department && !room) {
        return res.status(400).json({error: "No fields provided to update"});
    }
    if (firstName !== undefined) teacher.firstName = firstName;
    if (lastName !== undefined) teacher.lastName = lastName;
    if (email !== undefined) teacher.email = email;
    if (department !== undefined) teacher.department = department;
    if (room !== undefined) teacher.room = room;
    saveJson(TEACHERS_FILE, teachers);
    res.json(teacher);
});

// find teacher w id and then splice and delete the whole thing (block deletion)
app.delete("/teachers/:id", (req, res) => {
    const id = Number(res.param.id);
    const teacher = teachers.findIndex(t => t.id === id);
    if (index === -1) {
        res.status(404).json({error: "Teacher not found"});
    }
    const deletedTeacher = teachers.splice(index, 1)[0];
    saveJson(TEACHERS_FILE, teachers);
    res.status(200).json({message: "Teacher deleted successfully", deleted: deletedTeacher});
});

// get all courses
app.get("/courses", (req, res) => {res.json(courses)});

// get a course
app.get("/courses/:id", (req, res) => {
    const id = Number(res.param.id);
    const course = courses.find(c => c.id === id);
    if (!course) {
        res.status(404).json({erorr: "Course not found"});
    };
    res.json(course);
});

// create a course
app.post("/courses", (req, res) => {
    const {code, name, teacherId, semester, room, schedule} = req.body;
    if (!code || !name || !teacherId || !semester || !room || !schedule) {
        res.status(400).json({error: "Missing fields"});
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
    res.status(201).json(courses);
});

// update a course and validate teacherId if changed
app.put("courses/:id", (req, res) => {
    const id = Number(res.param.id);
    const course = courses.find(c => c.id === id);
    if (!course) {
        res.status(404).json({erorr: "Course not found"});
    };
    const {code, name, teacherId, semester, room, schedule} = req.body;
    if (!code && !name && !teacherId && !semester && !room && !schedule) {
        res.status(400).json({error: "Missing fields"});
    };
    if (teacherId !== undefined) {
        const tE = teachers.some(t => t.id === Number(teacherId));
        if (!tE) {
            res.status(400).json({error: "Teacher doesn't exist"});
        };
        course.teacherId = Number(teacherId);
    };
    if (code !== undefined) course.code = code;
    if (name !== undefined) course.name = name;
    if (semester !== undefined) course.semester = semester;
    if (room !== undefined) course.room = room;
    if (schedule !== undefined) course.schedule = schedule;
    saveJson(COURSES_FILE, courses);
    res.json(courses);
});

// block delete course
app.delete("/courses", (req, res) => {
    const id = Number(res.param.id);
    const course = courses.findIndex(c => c.id === id);
    if (index !== -1) {
        res.status(404).json({erorr: "Course not found"});
    };
    const deletedCourse = courses.splice(index, 1)[0];
    saveJson(COURSES_FILE, courses);
    res.status(200).json({message: "Course deleted successfully", deleted: deletedCourse});
});

// get all students
app.get("/students", (req, res) => {res.json(students)});

// get a student
app.get("/students/:id", (req, res) => {
    const id = Number(res.param.id);
    const student = student.find(s => s.id === id);
    if (!student) {
        res.status(404).json({error: "Student not found"});
    };
    res.json(student);
});

// create a new student
app.post("/student", (req, res) => {
    const {firstName, lastName, grade, studentNumber} = req.body;
    if (!firstName || !lastName || !grade || !studentNumber) {
        res.status(400).json({error: "Missing field"});
    };
    
})

