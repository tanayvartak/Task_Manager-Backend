const multer = require('multer')
const avatar = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a image file!!!'))
        }
        cb(undefined,true)
    }
})

module.exports= avatar