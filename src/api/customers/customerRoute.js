const router = require('express').Router();
const { verifyToken } = require("../auth/token_validation");
const { createCustomer, getCustomers, getCustomer, updateCustomer, deleteCustomer } = require('./customerController')

router.post("/customers", verifyToken, createCustomer);
router.get("/customers", verifyToken, getCustomers);
router.get("/customer/:id", verifyToken, getCustomer);
router.patch("/customer/:id", verifyToken, updateCustomer);
router.delete("/customer/:id", verifyToken, deleteCustomer)

module.exports = router