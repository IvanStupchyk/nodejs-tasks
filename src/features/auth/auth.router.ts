import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithBody} from "../../types/types";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {LoginUserModel} from "./models/LoginUserModel";
import {loginValidationMiddleware} from "../../middlewares/loginValidationMiddleware";
import {authService} from "../../domains/auth.service";
import {jwtService} from "../../application/jwt-service";
import {authValidationMiddleware} from "../../middlewares/authValidationMiddleware";
import {usersQueryRepository} from "../../repositories/usersQueryRepository";
import {userValidationMiddleware} from "../../middlewares/userValidationMiddleware";
import {CreateUserModel} from "../users/models/CreateUserModel";
import {confirmationValidationMiddleware} from "../../middlewares/confirmationValidationMiddleware";
import {ConfirmEmailModel} from "./models/ConfirmEmailModel";
import {ResendingCodeToEmailModel} from "./models/ResendingCodeToEmailModel";
import {resendEmailValidationMiddleware} from "../../middlewares/resendEmailValidationMiddleware";

export const authRouter = () => {
  const router = express.Router()

  router.get(
    '/me',
    authValidationMiddleware,
    async (req: Request, res: Response) => {
   const user = await usersQueryRepository.findUserById(req.user!.id)

    if (user) {
      res.status(HTTP_STATUSES.OK_200).send({
        email: user.email,
        login: user.login,
        userId: user.id
      })
    }
  })

  router.post(
    '/login',
    ...loginValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<LoginUserModel>, res: Response) => {
    const {loginOrEmail, password} = req.body
    const id = await authService.loginUser(loginOrEmail, password)

    if (typeof id === 'string') {
      const token = await jwtService.createJWT(id)
      res.status(HTTP_STATUSES.OK_200).send({
        accessToken: token
      })
    } else {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }
  })

  router.post('/registration',
    ...userValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<CreateUserModel>, res: Response) => {
      const isSentEmail = await authService.createUser(req.body.email, req.body.login, req.body.password)

      res.sendStatus(isSentEmail
        ? HTTP_STATUSES.CREATED_201
        : HTTP_STATUSES.BAD_REQUEST_400
      )
    }
  )

  router.post('/registration-confirmation',
    ...confirmationValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<ConfirmEmailModel>, res: Response) => {
      const isConfirmed = await authService.confirmEmail(req.body.code)

      res.sendStatus(isConfirmed
        ? HTTP_STATUSES.NO_CONTENT_204
        : HTTP_STATUSES.BAD_REQUEST_400
      )
    }
  )

  router.post('/registration-email-resending',
    ...resendEmailValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<ResendingCodeToEmailModel>, res: Response) => {
      const isSentEmail = await authService.resendEmail(req.body.email)

      res.sendStatus(isSentEmail
        ? HTTP_STATUSES.NO_CONTENT_204
        : HTTP_STATUSES.BAD_REQUEST_400
      )
    })

  return router
}