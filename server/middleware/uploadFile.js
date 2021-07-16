import multer from 'multer'
import shortid from 'shortid'
import path from 'path'
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    var nameFile = `${shortid.generate()}-${file.fieldname}-${Date.now()}-${
      file.originalname
    }${path.extname(file.originalname)}`
    cb(null, nameFile)
  },
})
const fileFilter = (req, file, cb) => {
  cb(null, true)
}

let upload = multer({
  storage: storage,

  fileFilter: fileFilter,
})
export default upload
