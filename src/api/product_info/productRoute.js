const router = require('express').Router();
const { verifyToken } = require("../auth/token_validation")
const { createEditProduct, getProducts, getProduct, updateProduct, deleteProduct } = require('./productController')

router.post("/products", verifyToken, createEditProduct);
router.get("/products", verifyToken, getProducts);
router.get("/product/:id", verifyToken, getProduct);
router.patch("/product/:id", verifyToken, updateProduct);
router.delete("/product/:id", verifyToken, deleteProduct)

module.exports = router