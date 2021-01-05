const router = require('express').Router();
const { verifyToken } = require("../auth/token_validation");
const { createCategory, getCategories, getCategory, updateCategory, deleteCategory } = require('./categoryController')

router.post("/categories", verifyToken, createCategory);
router.get("/categories", verifyToken, getCategories);
router.get("/category/:id", verifyToken, getCategory);
router.patch("/category/:id", verifyToken, updateCategory);
router.delete("/category/:id", verifyToken, deleteCategory)

module.exports = router