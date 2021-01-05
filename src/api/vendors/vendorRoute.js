const router = require('express').Router();
const { verifyToken } = require("../auth/token_validation");
const { createVendor, getVendors, getVendor, updateVendor, deleteVendor } = require('./vendorController')

router.post("/vendors", verifyToken, createVendor);
router.get("/vendors", verifyToken, getVendors);
router.get("/vendor/:id", verifyToken, getVendor);
router.patch("/vendor/:id", verifyToken, updateVendor);
router.delete("/vendor/:id", verifyToken, deleteVendor)

module.exports = router