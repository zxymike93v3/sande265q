const router = require('express').Router();
const multer = require('multer');
const { localValidation } = require('../helpers/ValidationHelper');
const { updateProduct } = require('./product_info/productModel');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getUTCSeconds() + Math.random().toFixed(5) + file.originalname)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 512
    }
}).single('image')

const uploadImage = (req, res) => {

}


router.post("/upload", uploadImage)

module.exports = router;