import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  stduentId: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  },
  testName: String,
  date: String,
  outOf: String,
  weight: String
});

export default mongoose.model('Test', testSchema);