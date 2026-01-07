import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  grade: String,
  studentNumber: String
});

export default mongoose.model('Student', studentSchema);