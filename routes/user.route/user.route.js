import express from 'express';
import {  requireAuth  } from '../../helpers/passport';
import userController from '../../controllers/user.controller/user.controller';
const router = express.Router();


router.get('/user/:id', userController.getById)
router.get('/allUsers', userController.findAll);
router.route('/signup').post(userController.validateUserCreateBody(), userController.signUp);
router.post('/signin',userController.validateUserSignin(), userController.signIn);
router.route('/delete/:id').delete(requireAuth , userController.delete);
router.put('/updateInfo', requireAuth,userController.validateUserUpdate(), userController.updateInfo);

export default router;
