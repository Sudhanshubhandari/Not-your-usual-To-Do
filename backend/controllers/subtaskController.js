import SubTask from "../models/subTasks.js";
import task from "../models/task.js";
import cron from "node-cron";

export const createSubtask = async (req, res) => {
  let { task_id, Description } = req.body;
  try {
    // Find the task by its ID

    const Task = await task.findById(task_id);
    if (!Task) {
      throw new Error("Task not found");
    }

    // Create a new subtask
    const newSubtask = new SubTask({ task_id: Task._id, Description });
    const savedSubtask = await newSubtask.save();

    // Associate the subtask with the task
    Task.subtasks.push(savedSubtask._id);
    await Task.save();
    res.status(201).json(savedSubtask);
    return savedSubtask;
  } catch (error) {
    throw error;
  }
};

export const getSubTaskById = async (req, res) => {
  try {
    let task_id = null; // Assuming the task_id is passed in the URL parameters
    console.log("helllo");
    var task;
    if (req.body != null && req.body != undefined && req.body.task_id) {
      task_id = req.body.task_id;
    }
    if (task_id != null && task_id != undefined) {
      console.log("bye");
      task = await SubTask.find({ task_id: task_id });

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
    } else {
      console.log("hello", task_id);

      task = await SubTask.find({});
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const checkIfTaskCompleted = async (task_id) => {
  const check = await SubTask.find({ task_id: task_id })
    .where("status", 0)
    .countDocuments();
  if (check == 0) {
    await task.findByIdAndUpdate(task_id, { $set: { status: "DONE" } });
  }
};

export const updateSubTask = async (req, res) => {
  try {
    const { _id, status } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "Subtask ID not provided" });
    }

    let updatedSubTask;

    if (status !== undefined) {
      updatedSubTask = await SubTask.findByIdAndUpdate(
        _id,
        { status: status, updated_at: /* current time*/ new Date() },
        { new: true }
      );
      await task.findByIdAndUpdate(updatedSubTask.task_id, {
        $set: { status: "IN_PROGRESS" },
      });

      checkIfTaskCompleted(updatedSubTask?.task_id);
    

      if (!updatedSubTask) {
        return res.status(404).json({ error: "Subtask not found" });
      }
    } else {
      return res
        .status(400)
        .json({ error: "No valid status provided for update" });
    }

    res.status(200).json({ updatedSubTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteSubTask = async (req, res) => {
  const { subtaskId } = req.body;
  console.log(subtaskId);

  try {
    const deletedSubtask = await SubTask.findById(subtaskId);
    if (!deletedSubtask) {
      return res.status(400).json("No such task exists");
    } else {
      deletedSubtask.status = 1;
      deletedSubtask.deleted_at = new Date().toISOString();

      await deletedSubtask.save();

      
      // await relatedTask.save()
      await task.findByIdAndUpdate(deletedSubtask.task_id, {
        $set: { status: "IN_PROGRESS" },
      });
      checkIfTaskCompleted(deletedSubtask?.task_id);
    }

    res.status(200).json(deletedSubtask);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "No task found" });
  }
};
