import auth from '../model/auth.js'
import { postModel } from '../model/post.js'
import { generateKeywords } from './service.js'

export var addPost = async (req, res) => {
  console.log('add post')
  var { title, content, likeCount, username, attachment } = req.body
  var keyword = generateKeywords(title)
  attachment = attachment || ''
  var error = []
  if (!title) error.push('title is require')
  content = content || ''
  if (username) {
    if (username.length <= 0) {
      error.push('username must is the array')
    }
  }
  req.body.private = req.body.private || false
  if (error.length > 0)
    return res.status(400).json({ success: false, message: error })
  try {
    var data = {
      ...req.body,
      users: req.userId,
      keyword,
    }
    var newPost = new postModel(data)
    await newPost.save(function (err) {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          return res.status(422).send({
            success: false,
            message:
              'Post already in database if you want to make this you can use another user',
          })
        }
        return res
          .status(422)
          .json({ success: false, message: 'Internal database Error' })
      }
      return res.status(200).json({
        success: true,
        message: 'the post is in database',
        data: newPost,
      })
    })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var getPublicPost = async (req, res) => {
  console.log('getPublicPost')
  try {
    var posts = await postModel
      .find({ private: false })
      .populate('users', ['username', 'friend'])
    return res.json({
      success: true,
      message: 'happy this is all post you can watch',
      posts,
    })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var getPrivatePost = async (req, res) => {
  console.log('getPrivatePost')
  try {
    var posts = await postModel
      .find({
        private: true,
      })
      .populate('users', ['username', 'friend'])
      .lean()
    var newPost = []
    for (let index = 0; index < posts.length; index++) {
      const element = posts[index].users
      var dataUser = await auth.findOne({ username: element.username })
      if (req.userId == dataUser._id || req.userId in dataUser.friend) {
        newPost.push(element)
      }
    }
    return res.json({
      success: true,
      message: 'happy this is all post you can watch',
      posts,
    })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var updatePost = async (req, res) => {
  var { title, content, likeCount, username, attachment, id } = req.body
  var privateStatus = req.body.private
  var error = []
  attachment = attachment || ''
  if (!title) error.push('title is require')
  if (!id) error.push('id is require')
  content = content || ''
  var postTemp = await postModel.findOne({ _id: id }).lean()

  likeCount = postTemp.likeCount + 1 || likeCount
  if (username) {
    if (username.length <= 0) {
      error.push('username must is the array')
    }
  }

  if (error.length > 0)
    return res.status(400).json({ success: false, message: error })
  try {
    var postTemp = await postModel.findOne({ _id: id }).lean()
    likeCount = postTemp.likeCount + 1 || likeCount
    let updated
    if (typeof privateStatus !== 'undefined') {
      updated = {
        title,
        content,
        attachment,
        likeCount,
        private: privateStatus,
      }
    } else {
      updated = {
        title,
        content,
        attachment,
        likeCount,
      }
    }
    var postUpdateConditions = { _id: id, users: req.userId }
    updated = await postModel.findOneAndUpdate(postUpdateConditions, updated, {
      new: true,
    })
    if (!updated) {
      return res.status(401).json({
        success: false,
        message: 'post not found or user is not Authorization',
      })
    }
    return res.json({
      success: true,
      message: 'happy the post is in database',
      post: updated,
    })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var deletePost = async (req, res) => {
  try {
    var { id } = req.body
    var postDeleteConditions = { _id: id, users: req.userId }
    var deletePost = await postModel.findOneAndDelete(postDeleteConditions)
    if (!deletePost) {
      return res.status(401).json({
        success: false,
        message: 'post not found or user is not Authorization',
      })
    }
    return res.json({
      success: true,
      message: 'the post is delete',
      post: deletePost,
    })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var getMyAllPost = async (req, res) => {
  try {
    var post = await postModel
      .find({ users: req.userId })
      .populate('users', ['username'])
      .populate('comment')
      .lean()
    for (var index = 0; index < post.length; index++) {
      var element = post[index]
      for (let index = 0; index < element.comment.length; index++) {
        var element_comment = await element.comment[index]
        var user = await auth.findOne({ _id: element_comment.users }).lean()
        var dataPush = [user.username, user._id]
        element_comment.users = dataPush
      }
      console.log(index, element)
    }
    return res.json({ success: true, post })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var searchPost = async (req, res) => {
  var search = req.body.search
  if (!search) {
    return res
      .status(400)
      .json({ success: false, message: 'search key is require' })
  }
  try {
    var post = await postModel
      .find({ keyword: { $in: search }, private: false })
      .lean()
    for (let index = 0; index < post.length; index++) {
      const element = post[index]
      var userId = element.users
      var username = await auth.findOne({ _id: userId })
      username = username.username
      post[index].users = username
    }
    return res.status(200).json({ success: true, post })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var addLike = async (req, res) => {
  var { postId } = req.body
  if (!postId)
    return res
      .status(400)
      .json({ success: false, message: 'postId is require' })
  try {
    var tempPost = await postModel.findOne({ _id: postId }).lean()
    var likeCount = tempPost.likeCount + 1
    console.log(likeCount)
    var updated = await postModel.findOneAndUpdate(
      { _id: postId },
      { likeCount },
      { new: true },
    )
    return res.json({ success: true, post: updated })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
