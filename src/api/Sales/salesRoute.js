const { verifyToken } = require("../auth/token_validation");
const { getDailySales, getSales, sellItem } = require("./salesController");

const router = require('express').Router();

router.get('/sales', verifyToken, getDailySales)
router.get('/sales-report', verifyToken, getSales)
router.post('/sell/:id', sellItem)

module.exports = router