import {CommentModel} from "../db/db"
import {CommentStatus, CommentsType, CommentType} from "../types/generalTypes";
import {createDefaultSortedParams, getPagesCount} from "../utils/utils";
import {mockCommentModel} from "../constants/blanks";
import {GetSortedCommentsModel} from "../features/comments/models/GetSortedCommentsModel";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";

export const commentsQueryRepository = {
  async findCommentById(id: string, likedStatus: CommentStatus = CommentStatus.None): Promise<CommentViewModel | null> {
    const foundComment = await CommentModel.findOne({id}, {projection: {_id: 0}}).exec()

    return foundComment ?
      {
        id: foundComment.id,
        content: foundComment.content,
        commentatorInfo: {
          userId: foundComment.commentatorInfo.userId,
          userLogin: foundComment.commentatorInfo.userLogin
        },
        likesInfo: {
          likesCount: foundComment.likesInfo.likesCount,
          dislikesCount: foundComment.likesInfo.dislikesCount,
          myStatus: likedStatus
        },
        createdAt: foundComment.createdAt
      } : null
  },

  async getSortedComments(params: GetSortedCommentsModel, postId: string): Promise<CommentsType> {
    const {
      pageNumber,
      pageSize,
      skipSize,
      sortBy,
      sortDirection
    } = createDefaultSortedParams({
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      model: mockCommentModel
    })

    const comments: Array<CommentType> = await CommentModel
      .find({postId}, {_id: 0, __v: 0})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .lean()

    const commentsCount = await CommentModel.countDocuments({postId})

    const pagesCount = getPagesCount(commentsCount, pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: commentsCount,
      items: comments.map(c => {
        return {
          id: c.id,
          content: c.content,
          commentatorInfo: {
            userId: c.commentatorInfo.userId,
            userLogin: c.commentatorInfo.userLogin
          },
          likesInfo: {
            likesCount: c.likesInfo.likesCount,
            dislikesCount: c.likesInfo.dislikesCount,
            myStatus: CommentStatus.Like
          },
          createdAt: c.createdAt
        }
      })
    }
  },
}