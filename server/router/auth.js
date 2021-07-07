import express from 'express'

var router = express.Router()
import {
  login,
  register,
  addFriend,
  searchUser,
  checkUserLogin,
  searchFriend,
} from '../controllers/auth.js'
import { verifyToken } from '../middleware/auth.js'

router.get('/', verifyToken, checkUserLogin)
router.post('/register', register)
router.post('/login', login)
router.post('/addfriend', verifyToken, addFriend)
router.post('/search', verifyToken, searchUser)
router.get('/friend', verifyToken, searchFriend)
export default router
