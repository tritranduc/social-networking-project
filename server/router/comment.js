import express from 'express'
import { getComment, addComment ,deleteComment} from '../controllers/comment.js'
import { verifyToken } from '../middleware/auth.js'

var router = express.Router()

router.get('/', verifyToken, getComment)
router.post('/add', verifyToken, addComment)
router.post('/delete', verifyToken, deleteComment)

export default router
