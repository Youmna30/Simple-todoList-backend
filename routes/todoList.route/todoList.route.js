import express from 'express';
import {  requireAuth  } from '../../helpers/passport';
import todoListController from '../../controllers/todoList.controller/todoList.controller';
const router = express.Router();

router.post('/',requireAuth,todoListController.validateTodoListBody(),todoListController.create)
router.get('/',todoListController.findAll)
router.get('/:id',todoListController.getById)
router.delete('/:id',requireAuth,todoListController.delete)
router.put('/:id',requireAuth,todoListController.validateTodoListUpdatedBody(),todoListController.update)

export default router;
