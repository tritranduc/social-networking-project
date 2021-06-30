import express from 'express'

var router = express.Router()
import { addPost, getPublicPost , getPrivatePost , updatePost,deletePost} from '../controllers/post.js'
import { verifyToken } from '../middleware/auth.js'

router.post('/add', verifyToken, addPost)
router.get('/public', getPublicPost)
router.get('/private', verifyToken, getPrivatePost)
router.post("/update",verifyToken,updatePost)
router.post("/delete",verifyToken,deletePost)

export default router
