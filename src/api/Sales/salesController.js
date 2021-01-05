const pool = require("../../database/database");
const { paginate } = require("../../middlewares/Paginate");
const { getProduct, updateProduct } = require("../product_info/productModel");
const { Sales, dailySales, sell } = require("./salesModel");

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
        dailySales(dt, (err, result) => {

            if (err) res.status(400).json({ err })
            else if (result) {
                let total = 0;
                let qty = 0;
                if (result && result.length > 0) {
                    for (var i = 0; i < result.length; i++) {
                        if (result[i] && result[i].sale_price !== null) {
                            total += (result[i].sale_price * result[i].qty)
                            qty += result[i].qty
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
                    })
                } else {
                    res.status(400).json({
                        message: 'No Sold Items on Given Date',
                        date: dt
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
                        sell(id, data, (error, response) => {
                            if (error) res.status(400).json({ error })
                            if (response) {
                                product['qty'] = product.qty - body.qty
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
                } else {
                    res.status(422).json({
                        message: { qty: ['No Product Quantity Left to Sell.'] }
                    })
                }
            }
        })
    }
}