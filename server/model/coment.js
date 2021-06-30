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
  },
  { timestamps: true },
)
var commentModel = mongoose.model('Comments', comment,'Comments')
export default commentModel
