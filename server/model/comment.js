import mongoose from 'mongoose'
var Schema = mongoose.Schema
var comment = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    users: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Users',
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref:"Posts"
    }
  },
  { timestamps: true },
)
var commentModel = mongoose.model('Comments', comment,'Comments')
export default commentModel
