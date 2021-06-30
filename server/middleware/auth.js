import jwt, { decode } from 'jsonwebtoken'
import auth from "../model/auth.js"
export var verifyToken = async(req, res, next) => {
  var authHeader = req.header('Authorization')
  var token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Access token not found' })
  }
  try {
    var decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (decoded) {
      var user = await auth.findOne({ _id: decoded.userId })
      if (!user) {
        return res.status(400).json({ success: false, message: 'user not found' })
      }
    }
    req.userId = decoded.userId
    next()
  } catch (error) {
      console.log(error)
      return res.status(403).json({success:false,message:"Invalid token"})
  }
}
