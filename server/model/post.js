import mongoose from 'mongoose'
var Schema = mongoose.Schema
var post = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    users: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Users',
    },
    attachment: String,
    likeCount: {
      type: Number,
      default: 0,
    },
    private: {
      type: Boolean,
      default: false,
    },
    comment: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comments',
      },
    ],
  },
  { timestamps: true},
)
//comment: [{ type: Schema.Types.ObjectId, default: '' }],
export var postModel = mongoose.model('Posts', post,"Posts")
