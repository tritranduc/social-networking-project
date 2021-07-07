import auth from '../model/auth.js'

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { generateKeywords } from './service.js'
const saltRounds = 10

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}
export var checkUserLogin = async (req, res) => {
  console.log("checkUserLogin")
  try {
    var user = await auth
      .findById(req.userId)
      .select(['-password', '-phone', '-email', '-keyword', '-friend'])
    if (!user)
      return res.status(400).json({ success: false, message: 'user not found' })
    res.json({ success: true, user })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var register = async (req, res) => {
  var { username, password, phone, email } = req.body
  var data = ''
  var hashPassword
  console.log('register')
  var error = []
  if (!username) {
    error.push('username is require')
  }
  if (!password) {
    error.push('password is require')
  }
  if (!phone) {
    error.push('phone is require')
  }
  if (!email) {
    error.push('email is require')
  }
  if (phone.startsWith('+84')) {
    phone = phone.replace('+84', '0')
  } else {
    phone = '0' + phone
  }
  if (!validateEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: 'email is not Validate' })
  }
  try {
    phone = parseInt(phone)
  } catch (error) {
    console.log(error)
  }
  if (error.length > 0)
    return res.status(400).json({ success: false, message: error })
  try {
    hashPassword = await bcrypt.hash(password, saltRounds)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
  try {
    var userInDB = await auth.findOne({
      username,
    })
    if (userInDB) {
      return res
        .status(400)
        .json({ success: false, message: 'username already taken' })
    }
    var keyword = generateKeywords(username)
    data = {
      username: username,
      password: hashPassword,
      phone,
      email,
      friend: [],
      keyword,
    }
    var newUser = await new auth(data)
    await newUser.save()
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
  var accessToken = jwt.sign(
    { userId: newUser._id },
    process.env.ACCESS_TOKEN_SECRET,
  )
  return res.status(200).json({
    success: true,
    message: 'happy your user is in database',
    data: { ...data, password: 'password is in database' },
    accessToken,
  })
}
export var login = async (req, res) => {
  console.log('login')
  var { password } = req.body
  var username = req.body.username || req.body.email
  if (!username || !password) {
    res.status(400).json({
      success: false,
      massage: 'missing username or email or password',
    })
  }
  try {
    var userInDB =
      (await auth.findOne({
        username,
      })) ||
      (await auth.findOne({
        email: username,
      }))
    if (!userInDB) {
      return res
        .status(400)
        .json({ success: false, message: 'incorrect username or email or password' })
    }
    var passwordVerify = await bcrypt.compare(password, userInDB.password)
    if (!passwordVerify) {
      return res.status(400).json({
        success: false,
        message: 'incorrect username or email or password',
      })
    }
    var accessToken = jwt.sign(
      { userId: userInDB._id },
      process.env.ACCESS_TOKEN_SECRET,
    )
    return res
      .status(200)
      .json({ success: true, accessToken, message: 'user login successfully' })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var addFriend = async (req, res) => {
  var user = req.userId
  var friend = req.body.friend
  if (!friend) {
    return res
      .status(400)
      .json({ success: false, message: 'friend is require' })
  }
  var userInfo = await auth.findOne({ _id: user }).lean()
  if (!userInfo) {
    return res.status(400), json({ success: false, message: 'user not found' })
  }
  if (friend in userInfo.friend) {
    return res
      .status(400)
      .json({ success: false, message: 'the friend is in database' })
  }
  if (friend === userInfo.username) {
    return res.status(400).json({ success: false, message: 'this is the you' })
  }
  var friendId = []
  if (typeof friend === 'string') {
    var friendInfo = await auth.findOne({ username: friend })
    if (!friendInfo)
      return (
        res.status(400), json({ success: false, message: 'friend not found' })
      )
    friendId.push(friendInfo._id)
  } else {
    for (let index = 0; index < friend.length; index++) {
      const element = friend[index]
      var friendInfo = await auth.findOne({ username: element })
      if (!friendInfo)
        return (
          res.status(400), json({ success: false, message: 'friend not found' })
        )
      friendId.push(friendInfo._id)
    }
  }

  console.log(friendId)
  try {
    var friendInDB = [...userInfo.friend, ...friendId]
    var updated = { friend: friendInDB }
    var userUpdateConditions = { _id: userInfo._id }
    updated = await auth.findOneAndUpdate(userUpdateConditions, updated, {
      new: true,
    })
    return res.json({ success: true, user: updated })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var searchUser = async (req, res) => {
  var search = [req.body.search]
  if (!search) {
    return res
      .status(400)
      .json({ success: false, message: 'search key is require' })
  }
  try {
    var user = await auth.find({ keyword: { $in: search } }).lean()
    var userResult = []
    for (let index = 0; index < user.length; index++) {
      const element = user[index]
      userResult.push([element._id, element.username])
    }
    return res.status(200).json({ success: true, user: userResult })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' })
  }
}
export var searchFriend = async(req, res) => {
  var userId = req.userId
  var user = await auth.findOne({ _id: userId }).populate("friend").lean()
  if (!user) {
    return res.status(400).json({success:false,message:"user not found"})
  }
  var friend = user.friend
  return res.json({success:true , friend})
}