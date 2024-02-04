
import express from 'express';

import { createTask, deleteTask, getTasksByUserId, updateTask } from '../controllers/taskController.js';

const router = express.Router();

// Route to get tasks associated with a user
router.get('/', getTasksByUserId);
router.post('/',createTask)
router.put('/', updateTask);
router.delete('/', deleteTask);



export default router;
