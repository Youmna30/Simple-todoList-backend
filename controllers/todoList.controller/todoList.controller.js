import TodoList from "../../models/todoList.model/todoList.model"
import { body, check } from 'express-validator';
import { checkValidations, apiError, checkExistThenGet, checkExist} from '../../helpers/checkMethods';

const populateQuery = {path:"user", model:"user"}

export default {
    async findAll(req, res, next) {
        try {
            var { user } = req.query;
            var query = {};
            // Filteration
            if (user)
                //To get all the todolists of specific user
                query.user = user
            let todoLists = await TodoList.find(query).populate(populateQuery);
            res.status(200).send({todoLists})
        } catch (error) {
            next(error)
        }
    },
    validateTodoListBody() {
        let validations = [

            body('content').not().isEmpty().withMessage("Content is required"),
        ];
        return validations;
    },
    async create(req,res,next){
        try {
            let data = checkValidations(req)
            let id = req.user.id;
            data.user = id
            let todoList = await TodoList.create(data)
            todoList = await TodoList.populate(todoList,populateQuery)
            res.status(201).send({todoList})
            
        } catch (error) {
            next(error)
        }
    },
    validateTodoListUpdatedBody() {
        let validations = [

            body('content').optional().not().isEmpty().withMessage("Content is required"),
        ];
        return validations;
    },
    async update(req,res,next){
        try {
            let id = req.params.id;
            await checkExist(id,TodoList)            
            let data = checkValidations(req)
            let todoList = await TodoList.findByIdAndUpdate({_id:id},data, { new: true }).populate(populateQuery)
            res.status(200).send({todoList})
            
        } catch (error) {
            next(error)
        }
    },
    async getById (req,res,next){
        try {
            let id = req.params.id;
            let todoList = await checkExistThenGet(id,TodoList)
            res.status(200).send({todoList})
        } catch (error) {
            next(error)
        }
    },
    async delete (req,res,next){
        try {
            let id = req.params.id;
            await checkExist(id,TodoList)
            await TodoList.deleteOne({_id:id})
            res.status(200).send("Deleted Successfully")
        } catch (error) {
            next(error)
        }
    }
}