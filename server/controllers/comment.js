import { postModel } from '../model/post.js'
import commentModel from '../model/coment.js'
export var getComment = async (req, res) => {
  var { postId } = req.body
  if (!postId) {
    return res
      .status(400)
      .json({ success: false, message: 'postId is require' })
  }
  try {
    var result = await postModel
      .findOne({ _id: postId })
      .populate('comment')
      .populate('users', ['username'])
    result = result.comment
    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'comment not found or user is not Authorization',
      })
    }
    var dataResult = []
    for (let index = 0; index < result.length; index++) {
      const element = result[index]
      var commentTemp = await commentModel
        .findOne({ _id: element._id })
        .populate('users', ['username'])
      dataResult.push(commentTemp)
    }
    return res.json({ success: true, comment: dataResult })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var addComment = async (req, res) => {
  var { content, postId } = req.body
  var userId = req.userId
  if (!content) {
    return res
      .status(400)
      .json({ success: false, message: 'content is require' })
  }
  if (!postId) {
    return res
      .status(400)
      .json({ success: false, message: 'postId is require' })
  }
  try {
    var commentCreate = { content, users: userId }
    var newComment = new commentModel(commentCreate)
    await newComment.save()
    var postUpdateConditions = { _id: postId }
    var updated
    updated = await postModel.findOneAndUpdate(
      postUpdateConditions,
      { $push: { comment: newComment._id } },
      {
        new: true,
      },
    )
    updated = await postModel
      .findOne({ _id: postId })
      .populate('comment')
      .populate('users', ['username'])
      .lean()
    console.log(updated)
    if (!updated) {
      return res.status(401).json({
        success: false,
        message: 'post not found or user is not Authorization',
      })
    }
    return res.json({
      success: true,
      message: 'happy the comment is in database',
      post: updated,
    })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var deleteComment = async (req, res) => {
  try {
    var { id } = req.body
    var postDeleteConditions = { _id: id, users: req.userId }
    var deletePost = await commentModel.findOneAndDelete(postDeleteConditions)
    if (!deletePost) {
      return res.status(401).json({
        success: false,
        message: 'comment not found or user is not Authorization',
      })
    }
    return res.json({
      success: true,
      message: 'the comment is delete',
      comment: deletePost,
    })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
