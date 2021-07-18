import fs from 'fs'
import path from 'path'
function contains(target, pattern) {
  var value = 0

  pattern.forEach(function (word) {
    if (
      path.extname(target.originalname) === word ||
      path.extname(target.originalname) === word.toUpperCase()
    ) {
      value = value + 1
    }
  })
  return value >= 1
}

var validation = (req, res, next) => {
  if (req.files) {
    if (req.files.length >= 1) {
      let image = req.files
      var accessType = ['.jpeg', '.png', '.jpg']
      var result = image.map((imageFile) => {
        if (!contains(imageFile, accessType)) {
          console.log(contains(imageFile, accessType))
          fs.unlinkSync(imageFile.path)
          return imageFile
        }
      })
      result = result.filter((item) => item !== undefined)
      console.log(result)
      if (result.length === image.length) {
        return res.status(400).json({
          success: false,
          message: 'file not support',
        })
      }
    }
  }

  next()
}

export default validation
