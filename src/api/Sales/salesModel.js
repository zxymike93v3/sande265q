const pool = require("../../database/database")

module.exports = {
    Sales: (data, callback) => {
        pool.query(
            `SELECT * FROM sales WHERE sold_date >= ? AND sold_date <= ?`,
            [data.start_date, data.end_date],
            (error, result) => {
                if (error) return callback(error)
                return (callback(null, result))
            }
        )
    },
    dailySales: (dt, callback) => {
        pool.query(
            "SELECT * FROM sales WHERE cast(sold_date as date) = cast(? as date) ",
            [dt],
            (error, result) => {
                if (error) return callback(error)
                return (callback(null, result))
            }
        )
    },
    sell: (id, data, callback) => {
        pool.query(
            `INSERT into sales( product_name, sale_price, sold_product_id, sold_date,qty, actual_price)
            value(?,?,?,?,?,?)`,
            [
                data.product_name,
                data.sale_price,
                id,
                data.sold_date,
                data.qty,
                data.actual_price,
            ],
            (error, result) => {
                if (error) return callback(error)
                return (callback(null, result))
            }
        )
    }
}