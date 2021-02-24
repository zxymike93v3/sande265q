const router = require('express').Router();
const { verifyToken } = require("../auth/token_validation");
const { createDebtor, getDebtors, getDebtor, updateDebtor, deleteDebtor } = require('./debtorsController')

router.post("/debtors", verifyToken, createDebtor);
router.get("/debtors", verifyToken, getDebtors);
router.get("/debtors/:id", verifyToken, getDebtor);
router.patch("/debtors/:id", verifyToken, updateDebtor);
router.delete("/debtors/:id", verifyToken, deleteDebtor)

module.exports = router