// controllers/userController.js
import User from "../models/user.js";
import Task from "../models/task.js";
import jwt from "jsonwebtoken";
import SubTask from "../models/subTasks.js";
import twilio from "twilio";
// import task from '../../models/task';

import cron from "node-cron";
const accountSid = "AC043c005e4d89c23a8e5e5f59bb5193a8";
const authToken = "f921d252f8c8fda46e552963f991ac51";

const client = twilio(accountSid, authToken);
const fromPhoneNumber = "+14154841517";
const makeTwilioCall = async (Callmessage, toPhoneNumber) => {
  try {
    const call = await client.calls.create({
      twiml: Callmessage,
      to: toPhoneNumber,
      from: fromPhoneNumber,
    });

    console.log(`Twilio call SID: ${call.sid}`);
  } catch (error) {
    console.error("Error making Twilio call:", error);
  }
};

// Create a new task
export const createTask = async (req, res) => {
  let { title, Description, dueDate, token } = req.body;

  try {
    // Get user ID from the JWT token
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findOne({ id: decoded.id });
    const userId = req.user.id;
   

    // Check if the user exists
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const due_date = new Date(dueDate);
    // check number of days between due_date in Date format of mongodb and current date in javascript
    var differenceInDays = Math.floor(
      Math.abs(due_date.getTime() - new Date().getTime()) / (3600 * 24 * 1000)
    );
    if (differenceInDays < 0) {
      return res.status(400).send("Due date must be in future");
    }
    let priority = 0;
    if (differenceInDays == 0) {
      priority = 0;
    } else if (differenceInDays <= 2) {
      priority = 1;
    } else if (differenceInDays <= 4) {
      priority = 2;
    } else {
      priority = 3;
    }
    // Create a new task
    const newTask = new Task({
      title,
      Description,
      dueDate,
      user: userId,
      priority,
    });
    await newTask.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTasksByUserId = async (req, res) => {
  const { userId } = req.body;

  try {
    // Find the user by ID
    const user = await Task.find({ user: userId }).populate("subtasks");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    // const tasks = user.tasks;

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Update the task

export const updateTask = async (req, res) => {
  try {
    const { _id, status, dueDate } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "Subtask ID not provided" });
    }

    let updatedTask;

    if (status !== undefined || dueDate !== undefined) {
      const updateFields = {};
      if (status !== undefined) {
        updateFields.status = status;
      }
      if (dueDate !== undefined) {
        updateFields.dueDate = dueDate;
      }

      updatedTask = await Task.findByIdAndUpdate(_id, updateFields, {
        new: true,
      });
 

      if (!updatedTask) {
        return res.status(404).json({ error: "Subtask not found" });
      }
    } else {
      return res.status(400).json({ error: "No valid update fields provided" });
    }

    res.status(200).json({ updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const performTaskOperation = async (tasks) => {
  //make empty array
  let NoOfUsers = [];

  for (let i = 0; i < tasks.length; i++) {
    

    const due_date = tasks[i].dueDate;
    const task_status=tasks[i].status;
    if(due_date==null || due_date==undefined)
    continue
    const dateNow = new Date();
    var differenceInDays = Math.floor(
      Math.abs(due_date?.getTime() - dateNow?.getTime()) / (3600 * 24 * 1000)
    );
    
    if (due_date.getTime()<dateNow.getTime() && task_status!="DONE" ) {

       const userId = tasks[i].user;
    const user = await User.findOne({ id: userId });
    if (user) {
      NoOfUsers.push(user);
    }
    }
    let priority = 0;
    if (differenceInDays == 0) {
      priority = 0;

    } else if (differenceInDays <= 2) {
      priority = 1;
    } else if (differenceInDays <= 4) {
      priority = 2;
    } else {
      priority = 3;
    }
    console.log(tasks[i].priority, priority);
    Task.findByIdAndUpdate(tasks[i]._id, { $set: { priority } });
  }

  NoOfUsers.sort((a, b) => a.priority - b.priority);
   //remove duplicate users from NoOfUsers
   NoOfUsers = [...new Set(NoOfUsers)];
   for(let i=0;i<NoOfUsers.length;i++)
   {
    makeTwilioCall("Your task is due",NoOfUsers[i].phone_number)
   }
  
};

// Define the task to be executed every minute
const scheduledTask = async () => {
  // update all task's priority if they are over due
  const tasks = await Task.find({});
  performTaskOperation(tasks);
};

// Schedule the task to run every 5 minute
cron.schedule('*/60 * * * *', async () => {
  await scheduledTask();
}, {
  scheduled: true
});



//delete task controller
export const deleteTask=async(req,res)=>{
    const {taskId}=req.body
      try{
    const deletedTask=await Task.findById(taskId)
    if(!deletedTask){
      return res.status(400).json('No such task exists')
    }else{

      deletedTask.status="DONE"
    }
    res.status(200).json(deletedTask)
    
  }catch(err){    
    res.status(404).json({message:"No task found"})
  
  }
}


 