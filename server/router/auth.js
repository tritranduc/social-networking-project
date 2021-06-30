import express from 'express'

var router = express.Router()
import { login, register , addFriend , searchUser} from '../controllers/auth.js'
import { verifyToken } from '../middleware/auth.js'


router.post('/register', register)
router.post('/login', login)
router.post("/addfriend", verifyToken, addFriend)
router.post("/search",verifyToken,searchUser)
export default router