const { validationResult } = require("express-validator");
const isEmpty = require("is-empty");
const Joi = require("joi");
const pool = require("../../database/database");
const { localValidation } = require("../../helpers/ValidationHelper");
const { paginate } = require("../../middlewares/Paginate");
const { getProduct, updateProduct, reduce } = require("../product_info/productModel");
const { Sales, dailySales, sell } = require("./salesModel");

const nFormatter = (num, digits) => {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function (item) {
        return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

module.exports = {
    getSales: (req, res) => {
        let { start_date, end_date } = req.query;
        Sales({ start_date, end_date }, (err, result) => {
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`
            })
            else {
                const { pages, limits, start, to, filterData, total, last_page } = paginate(result, req)
                if (result[0]) {
                    res.status(200).json({
                        message: `Successfully Retrived Sales Report from ${start_date} to ${end_date}`,
                        current_page: pages,
                        data: filterData,
                        from: start,
                        to,
                        per_page: limits,
                        total,
                        last_page,
                    })
                } else {
                    res.status(204).json({})
                }
            }
        })
    },
    getDailySales: (req, res) => {
        let yourDate = new Date()
        const offset = yourDate.getTimezoneOffset()
        localDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
        let date = req.query.date ? req.query.date : localDate.toISOString().split('T')[0]
        var dt = new Date(date).toISOString().slice(0, 19).replace("T", " ");
        let prev_mth = new Date(new Date().getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0]
        let today = new Date().toISOString().split("T")[0];
        let monthly_total = 0;
        Sales({ start_date: prev_mth, end_date: today }, (err, result) => {
            if (err) console.log("errir", err);
            if (result && result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i] && result[i].sale_price !== null) {
                        monthly_total += (parseInt(result[i].sale_price) * parseInt(result[i].qty))
                    }
                }
            }
        })
        dailySales(dt, (err, result) => {

            if (err) res.status(400).json({ err })
            else if (result) {
                let total = 0;
                let qty = 0;
                let profit = 0;
                if (result && result.length > 0) {
                    for (var i = 0; i < result.length; i++) {
                        if (result[i] && result[i].sale_price !== null) {
                            total += (result[i].sale_price * result[i].qty);
                            qty += result[i].qty;
                            profit += result[i].sale_price * 0.35
                        }
                    }
                }

                if (qty >= 1) {
                    res.status(200).json({
                        message: "Successfully Retrived List of Sold items",
                        data: result,
                        total_amount: total,
                        total_qty: qty,
                        date: dt,
                        profit,
                        monthly_total: monthly_total ? nFormatter(monthly_total, 3) : 0
                    })
                } else {
                    res.status(400).json({
                        message: 'No Sold Items on Given Date',
                        date: dt,
                        monthly_total: monthly_total ? nFormatter(monthly_total, 3) : 0,
                    })
                }
            }
        })
    },
    sellItem: (req, res) => {
        let id = req.params.id;
        let data = {};
        let body = req.body;
        getProduct(id, (err, result) => {
            if (err) res.status(400).json({ err })
            if (result) {
                let product = result[0]
                if (!product) {
                    res.status('400').json({
                        message: "No Product Found with the given ID"
                    })
                } else if
                    (product && product.qty >= 1) {
                    if (product.qty < body.qty) {
                        res.status(422).json({
                            message: { qty: ["Not Enough Quantity, remaining qty = " + product.qty] }
                        })
                    } else {
                        data['qty'] = body.qty
                        data['sold_date'] = body.sold_date ? body.sold_date : new Date().toISOString().split("T")[0]
                        data['product_name'] = product.product_name
                        data['sale_price'] = body.sale_price
                        data['sold_product_id'] = product.id
                        data['actual_price'] = body.actual_price ? body.actual_price : product.actual_price
                        let validationRule = {
                            sale_price: ['required'],
                            qty: ['required']
                        };
                        let errors = {};
                        const validation = localValidation(data, validationRule, errors, false)
                        if (validation.localvalidationerror) {
                            return res.status(422).json({
                                message: { ...validation.error },
                            })
                        } else {
                            sell(id, data, (error, response) => {
                                if (error) res.status(400).json({ error })
                                if (response) {
                                    product['qty'] = product.qty - body.qty
                                    product['category'] = "";
                                    product['type'] = '';
                                    if (product['qty'] === 0) {
                                        product['status'] = 0
                                        product['is_sold'] = 1
                                    }
                                    updateProduct(id, product, (err, callback) => {
                                        if (err) res.status(400).json({ err, message: 'Something Went Wrong' })
                                        if (callback) {
                                            res.status(200).json({
                                                message: 'Product Successfully Sold',
                                                qty: body.qty,
                                                product
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }
                } else {
                    res.status(422).json({
                        message: { qty: ['No Product Quantity Left to Sell.'] }
                    })
                }
            }
        })
    },
    sellMultipleItems: async (req, res) => {
        let body = req.body
        let validationRule = {
            products: ['required', 'array'],
        };
        let errors = {};
        let total_sold_qty = 0;
        const validation = localValidation(body, validationRule, errors, false)
        if (validation.localvalidationerror) {
            return res.status(422).json({
                message: { ...validation.error },
            })
        } else {
            let { products, sold_date } = body;
            let error = validationResult(req);
            if (!error.isEmpty()) {
                return res.status(422).json(
                    error.array().map(i => {
                        return {
                            [i.param]: [i.msg]
                        }
                    })
                );
            }
            else {
                var fails = []
                new Promise((resolve, reject) => {
                    products.forEach((item, i) => {
                        getProduct(item.id, (err, result) => {
                            if (err) reject({ code: 500, message: err })
                            else if (result) {
                                let product = result[0]
                                if (!product) {
                                    fails.push({ ['products.' + i + '.id']: ['No Product Found with the given ID'] })
                                    if (i === products.length - 1) reject(fails)
                                } else if (product && product.qty >= 1) {
                                    if (product.qty < item.qty) {
                                        fails.push({ ['products.' + i + '.qty']: ["Not Enough Quantity, remaining qty = " + product.qty] })
                                        if (i === products.length - 1) reject(fails)
                                    } else {
                                        let data = {};
                                        data['qty'] = item.qty
                                        data['sold_date'] = item.sold_date ? new Date(item.sold_date) : sold_date ? new Date(sold_date) : new Date().toISOString().split("T")[0]
                                        data['product_name'] = product.product_name
                                        data['sale_price'] = item.sale_price
                                        data['sold_product_id'] = product.id
                                        data['actual_price'] = item.actual_price ? item.actual_price : product.actual_price
                                        sell(item.id, data, (error, response) => {
                                            if (error) console.log("errr", error);
                                            if (response) {
                                                total_sold_qty += item.qty
                                                if (product.id === result[0].id) {
                                                    product.qty - item.qty
                                                }
                                                product['qty'] = product.qty - item.qty
                                                product['category'] = "";
                                                product['type'] = '';
                                                if (product['qty'] === 0) {
                                                    product['status'] = 0
                                                    product['is_sold'] = 1
                                                }
                                                reduce(item.id, item.qty, (err, cb) => {
                                                    if (err) console.log(err);
                                                })
                                                if (i === products.length - 1) {
                                                    resolve({ message: "All Products Sold Successfully" })
                                                }
                                            }
                                        })
                                    }
                                } else {
                                    fails.push({ ['products.' + i + '.qty']: ['No Product Quantity Left to Sell.'] })
                                    if (i === products.length - 1) reject(fails)
                                }
                            }
                        })
                    })
                }).then(
                    response => {
                        res.status(200).json(response)
                    },
                    err => {
                        res.status(422).json({
                            message: err
                        })
                    }
                )
            }
        }
    }
}