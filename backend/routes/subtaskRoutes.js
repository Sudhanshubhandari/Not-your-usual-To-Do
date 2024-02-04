import { deleteModel } from "mongoose";
import { createSubtask, deleteSubTask, getSubTaskById, updateSubTask } from "../controllers/subtaskController.js";
import express from 'express';

const router = express.Router();
router.post('/', createSubtask);
router.post('/getSubtaskById', getSubTaskById);
router.put('/', updateSubTask);
router.delete('/', deleteSubTask);





export default router;