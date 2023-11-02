import express from "express";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {authBasicValidationMiddleware} from "../../middlewares/authBasicValidationMiddleware";
import {userAdminValidationMiddleware} from "../../middlewares/userAdminValidationMiddleware";
import {usersContainer} from "../../compositionRoots/compositionRootUsers";
import {UsersController} from "./usersController";

const usersController = usersContainer.resolve(UsersController)

export const userRouter = () => {
  const router = express.Router()

  router.get('/', usersController.getUser.bind(usersController))

  router.post(
    '/',
    ...userAdminValidationMiddleware,
    inputValidationErrorsMiddleware,
    usersController.createUser.bind(usersController)
  )

  router.delete(
    '/:id',
    authBasicValidationMiddleware,
    usersController.deleteUser.bind(usersController)
  )

  return router
}