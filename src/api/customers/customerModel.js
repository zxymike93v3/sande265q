const pool = require("../../database/database")

module.exports = {
    create: (data, callback) => {
        pool.query(
            `INSERT into customers(customer_name, contact, location, email, status)
                value(?,?,?,?,?)`,
            [
                data.customer_name,
                data.contact,
                data.location,
                data.email,
                parseInt(data.status) === 1 || data.status === true ? 1 : 0,
            ], (error, result) => {
                if (error) return callback(error)
                return (callback(null, result))
            }
        )
    },
    getCustomers: callback => {
        pool.query(
            `SELECT * from customers`,
            [], (error, result) => {
                if (error) return callback(error)
                return (callback(null, result))
            }
        )
    },
    getCustomer: (id, callback) => {
        pool.query(
            `SELECT * from customers WHERE id=?`,
            [id],
            (error, result) => {
                if (error) return callback(error)
                else {
                    return (callback(null, result))
                }
            }
        )
    },
    updateCustomer: (id, data, callback) => {
        const updated_at = new Date()
        updated_at.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
        pool.query(
            `UPDATE customers SET customer_name=?, contact=?, email=?, location=?, status=?, updated_at=? WHERE id = ?`,
            [
                data.customer_name,
                data.contact,
                data.email,
                data.location,
                parseInt(data.status) === 1 || data.status === true ? 1 : 0,
                updated_at,
                id,
            ],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    deleteCustomer: (id, callback) => {
        pool.query(
            `DELETE FROM customers WHERE id = ?`,
            [id],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    searchCustomer: (query, callback) => {
        pool.query(
            `SELECT * FROM customers WHERE CONCAT(customer_name, email) LIKE (?)`,
            [`%${query}%`],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    }
}