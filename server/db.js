import dotenv from "dotenv"
dotenv.config()
import mongoose from 'mongoose'
var connectDB = async () => {
    var url = process.env.DB_SERVER
    try {
        await mongoose.connect(url, {
				useCreateIndex: true,
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false
			});
        console.log("MongoDB connected")
    } catch (error) {
        console.log(error)
    }
}
/**
 * Anonymous
 * 123456789
 * abc@example.com
 */
export default connectDB