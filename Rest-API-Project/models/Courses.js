import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  department: String,
  room: String
});

export default mongoose.model('Teacher', teacherSchema);