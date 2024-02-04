

import mongoose, { Schema } from 'mongoose';

const subTaskSchema = new Schema({
  id:{ type:Number},
  task_id: { type: Schema.Types.ObjectId, ref: 'task', required: true },
  Description:{
    type :String ,
  },
  status: { type: Number, enum: [0, 1], default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  deleted_at: { type: Date },
});

const SubTask = mongoose.model('SubTask', subTaskSchema);
export default SubTask;
