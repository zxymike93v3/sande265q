const { check } = require("express-validator");

module.exports = {
    rule: [
        check("products.*.id")
            .not()
            .isEmpty(),
        check("products.*.qty")
            .not()
            .isEmpty(),
        check("products.*.sale_price")
            .not()
            .isEmpty()
    ]
}