import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  user: {
    type: Number,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  Description:{
    type :String ,
  },
  status:{
  type:String,
  default:"TODO",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  priority:{
  type:Number
  },
  subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubTask' }],

  dueDate:{
    type: Date,
    required:true
  },
});

const task = mongoose.model("task", taskSchema);

export default task;
