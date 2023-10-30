import {authValidationMiddleware} from "./authValidationMiddleware";
import {body} from "express-validator";

export const commentLikesValidationMiddleware = [
  authValidationMiddleware,

  body('likeStatus')
    .isString()
    .trim()
    .isIn(['None', 'Like', 'Dislike'])
    .withMessage('Incorrect like status'),
]