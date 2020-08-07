import bcrypt from 'bcryptjs';
import { body, check } from 'express-validator';
import { checkValidations, apiError, checkExistThenGet, checkExist} from '../../helpers/checkMethods';
import { generateToken } from '../../helpers/token';
import User from '../../models/user.model/user.model';

export default {
    async findAll(req, res, next) {
        try {
            var { name, email } = req.query;
            var query = {};
            // Filteration
            if (name)
                query.name = { '$regex': name, '$options': 'i' };
            if (email)
                query.email = { '$regex': email, '$options': 'i' };
            let users = await User.find(query);
            res.status(200).send({users})
        } catch (error) {
            next(error)
        }
    },

    validateUserSignin() {
        let validations = [

            body('email').not().isEmpty().withMessage("Email is required"),
            body('password').not().isEmpty().withMessage("Password is required"),
        ];
        return validations;
    },

    async signIn(req, res, next) {
        try {
            let data = checkValidations(req);
            data.email = (data.email.trim()).toLowerCase();
            let user = await User.findOne({ email: data.email })
            if (user) {
                await user.isValidPassword(data.password, async function (err, isMatch) {
                    if (err) {

                        return next(new apiError(422, err.message));
                    }
                    if (!isMatch) {
                        return next(new apiError(422, "Wrong password"));
                    } else {
                        const token = generateToken(user.id);
                        return res.status(200).send({
                            "user": user,
                            "token": token
                        });
                    }

                });
            }
            else {
                return next(new apiError(404, "User not found"));
            }

        } catch (err) {
            next(err);
        }
    },

    validateUserCreateBody() {
        let validations = [
            body('name').not().isEmpty().withMessage("Name is required"),
            body('email').trim().not().isEmpty().withMessage("Email is required")
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    if (await User.findOne({ email: value }))
                        throw new Error("Email already exists");
                    else
                        return true;
                }),
            body('password').not().isEmpty().withMessage("Password is required")
        ];
        return validations;
    },

    async signUp(req, res, next) {
        try {
            const validatedBody = checkValidations(req)
            validatedBody.email = (validatedBody.email.trim()).toLowerCase();
            let createdUser = await User.create({
                ...validatedBody
            });
            res.status(201).send({
                user: createdUser,
                token: generateToken(createdUser.id)
            });
        } catch (err) {
            next(err);
        }
    },


    validateUserUpdate() {
        let validations = [
            body('name').optional().not().isEmpty().withMessage("Name is required"),
            body('email').optional().trim().not().isEmpty().withMessage("Email is required")
                .isEmail().custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    if (await User.findOne( { email: value , _id: {$ne: req.user._id} }))
                        throw new Error('Email already exists');
                    else
                        return true;
                }),
            body('newPassword').optional().not().isEmpty().withMessage("New password is required"),
            body('currentPassword').optional().not().isEmpty().withMessage("Current password is required"),
        ];
        return validations;
    },

    async updateInfo(req, res, next) {
        try {
            let userId = req.user.id;
            let validatedBody = checkValidations(req);
            let user = await checkExistThenGet(userId, User);
            if (validatedBody.newPassword) {
                if (validatedBody.currentPassword) {
                    if (bcrypt.compareSync(validatedBody.currentPassword, user.password)) {
                        validatedBody.password = await bcrypt.hash(validatedBody.newPassword, bcrypt.genSaltSync());
                        delete validatedBody.newPassword;
                        delete validatedBody.currentPassword;
                    } else {
                        return next(new apiError(403, "Wrong password"))
                    }
                } else {
                    return res.status(400).send("Current password is required");
                }
            } else if (validatedBody.password) {
                const salt = bcrypt.genSaltSync();
                var hash = await bcrypt.hash(validatedBody.password, salt);
                validatedBody.password = hash;
            }
            user = await User.findOneAndUpdate({_id: userId }, validatedBody, { new: true });
            res.status(200).send(user);

        } catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            let id = req.params.id
            var user = await checkExistThenGet(id, User);
            await User.remove({_id:id})
            res.status(200).send('Deleted Successfully');
        } catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            let id = req.params.id
            let user = await checkExistThenGet(id, User);
            res.status(200).send({ user: user });
        } catch (error) {
            next(error);
        }
    }
};