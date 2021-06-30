import mongoose from 'mongoose'
var Schema = mongoose.Schema
var auth = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      require: true,
    },
    phone: {
      type: Number,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    friend: [{
      type: Schema.Types.ObjectId,
      ref: 'Users'
    }],
    keyword: [{
      type: String
    }]
  },
  { timestamps: true },
)

export default mongoose.model('Users', auth,"Users")
