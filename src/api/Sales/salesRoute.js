const { verifyToken } = require("../auth/token_validation");
const { getDailySales, getSales, sellItem, sellMultipleItems } = require("./salesController");
const { rule } = require("./validationRule");

const router = require('express').Router();

router.get('/sales', verifyToken, getDailySales);
router.get('/sales-report', verifyToken, getSales);
router.post('/sell/:id', verifyToken, sellItem);
router.post('/sell', rule, sellMultipleItems);

module.exports = router