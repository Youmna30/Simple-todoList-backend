import express from 'express';
const router = express.Router();

import userRoute from './user.route/user.route';
import todoListRoute from './todoList.route/todoList.route'

router.use('/', userRoute);
router.use('/todoList', todoListRoute);

export default router;
