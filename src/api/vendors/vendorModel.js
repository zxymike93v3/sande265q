const pool = require("../../database/database")

module.exports = {
    create: (data, callback) => {
        pool.query(
            `INSERT into vendors (vendor_name, purchase_amount, purchase_date, total, status)
                    values(?,?,?,?,?)`,
            [
                data.vendor_name,
                data.purchase_amount,
                data.purchase_date,
                data.total,
                parseInt(data.status) === 1 || data.status === true ? 1 : 0,
            ], (error, result) => {
                if (error) return callback(error)
                return (callback(null, result))
            }
        )
    },
    getVendors: callback => {
        pool.query(
            `SELECT id, vendor_name, purchase_amount, purchase_date,status, created_at, updated_at from vendors`,
            [],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    getVendor: (id, callback) => {
        pool.query(
            `SELECT * from vendors where id = ?`,
            [id],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    updateVendor: (id, data, callback) => {
        const updated_at = new Date()
        updated_at.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
        pool.query(
            `UPDATE vendors SET vendor_name=?, purchase_amount=?, pending_dues=?, purchase_date=?, total=?, updated_at=?, status=? where id = ?`,
            [
                data.vendor_name,
                data.purchase_amount,
                data.pending_dues,
                data.purchase_date,
                data.total,
                updated_at,
                parseInt(data.status) === 1 || data.status == true ? 1 : 0,
                id
            ],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    deleteVendor: (id, callback) => {
        pool.query(
            `DELETE FROM vendors WHERE id = ?`,
            [id],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    searchVendor: (query, callback) => {
        pool.query(
            `SELECT id, vendor_name, purchase_amount, purchase_date,status, created_at, updated_at FROM vendors WHERE CONCAT(vendor_name) LIKE (?)`,
            [`%${query}%`],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    }
}