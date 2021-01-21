const multer = require('multer');
const { localValidation } = require('../../helpers/ValidationHelper');
const { paginate } = require('../../middlewares/Paginate')
const { create, updateProduct, getProduct, getProducts, deleteProduct, searchProduct, filterProduct } = require('./productModel')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/.')
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
}).single('product_image')

module.exports = {
    createEditProduct: (req, res) => {
        upload(req, res, (error) => {
            let body = req.body;
            let validationRule = {
                product_name: ['required'],
                // image: ['required'],
                color: ['required'],
                price: ['required', 'numeric'],
                actual_price: ['required'],
                qty: ['required']
            };
            if (body._method) {
                let id = req.body.id
                if (req.file) {
                    let path = req.file && req.file.path && req.file.path.split('\\')[1];
                    body['image'] = `http://${process.env.BASE_URL}/uploads/${path}`
                }
                let errors = {};
                const validation = localValidation(body, validationRule, errors, false)
                if (validation.localvalidationerror) {
                    return res.status(422).json({
                        message: { ...validation.error },
                    })
                } else {
                    if (error) {
                        if (error.code === 'LIMIT_FILE_SIZE') {
                            error.message = 'File Size is too large. Allowed file size is 512KB';
                        }
                        res.status(400).json({
                            message: { image: [error.message] }
                        })
                    } else {
                        updateProduct(id, body, (err, result) => {
                            if (err) {
                                if (err.code) {
                                    let key = err.sqlMessage && err.sqlMessage.split(`'`)[1];
                                    return res.status(422).json({
                                        message: {
                                            err,
                                            [key]: [`${err.sqlMessage && err.sqlMessage.split(`'`)[1]} ${err.sqlMessage && err.sqlMessage.split(`'`)[2]}`]
                                        }
                                    })
                                } else {
                                    return res.status(400).json({
                                        err
                                    })
                                }
                            }
                            return res.status(200).json({
                                message: "Product Updated Successfully",
                                body
                            })
                        })
                    }
                }
            } else {
                if (req.file) {
                    // let path = req.file && req.file.path && req.file.path.split('uploads')[1];
                    console.log("req, file", req.file?.path?.split('uploads')[1]);
                    body['image'] = `http://${process.env.BASE_URL}/uploads/tested`
                }
                let errors = {};
                const validation = localValidation(body, validationRule, errors, false)
                if (validation.localvalidationerror) {
                    return res.status(422).json({
                        message: { ...validation.error }
                    })
                } else {
                    if (error) {
                        if (error.code == 'LIMIT_FILE_SIZE') {
                            error.message = 'File Size is too large. Allowed file size is 512KB';
                        }
                        res.status(400).json({
                            message: { image: [error.message] }
                        })
                    } else {
                        create(body, (err, result) => {
                            if (err) {
                                if (err.code) {
                                    let key = err.sqlMessage && err.sqlMessage.split(`'`)[1];
                                    return res.status(422).json({
                                        message: {
                                            err,
                                            [key]: [`${err.sqlMessage && err.sqlMessage.split(`'`)[1]} ${err.sqlMessage && err.sqlMessage.split(`'`)[2]}`]
                                        }
                                    })
                                } else {
                                    return res.status(400).json({
                                        err
                                    })
                                }
                            }
                            return res.status(200).json({
                                message: "Product Created Successfully"
                            })
                        })
                    }
                }
            }
        })
    },
    getProducts: (req, res) => {
        getProducts((err, result) => {
            let { sort_by, sort_field } = req.query;
            const { pages, limits, start, to, filterData, total, last_page, q } = paginate(result, req)
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`
            })
            if (q) {
                searchProduct(q, (error, results) => {
                    const { pages, limits, start, filterData, to, total, last_page } = paginate(results, req)
                    if (error) console.log("error", error);
                    else {
                        return res.status(200).json({
                            message: "Successfully Retrived Products List",
                            current_page: pages,
                            data: filterData,
                            from: start,
                            to,
                            per_page: limits,
                            total,
                            last_page,
                        })
                    }
                })
            }
            else {
                return res.status(200).json({
                    message: "Successfully Retrived Products List",
                    current_page: pages,
                    data: filterData,
                    from: start,
                    to,
                    per_page: limits,
                    total,
                    last_page,
                })
            }
        })
    },
    getProduct: (req, res) => {
        const id = req.params.id;
        getProduct(id, (err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                    message: `${err.sqlMessage ? err.sqlMessage : 'Result Not Found.'}`
                })
            }
            if (result && result.length <= 0) {
                return res.status(400).json({
                    message: 'No Records Found'
                })
            }
            result[0].category = JSON.parse(result[0].category)
            result[0].type = JSON.parse(result[0].type)
            return res.status(200).json({
                message: "Successfully Retrived Product Details",
                data: result[0],
            })
        })
    },
    updateProduct: (req, res) => {
        const id = req.params.id;
        const body = req.body;
        updateProduct(id, body, (err, result) => {
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`,
                err
            })
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: 'No Product Found With the Given ID.'
                })
            }
            return res.status(200).json({
                message: "Successfully Updated product.",
                // data: result
            })
        })
    },
    deleteProduct: (req, res) => {
        const id = req.params.id;
        deleteProduct(id, (err, result) => {
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`
            })
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: 'No Product Found With Then Given ID',
                })
            }
            return res.status(200).json({
                message: "Product Deleted Successfully",
                // data: result
            })
        })
    }
}