const pool = require("../../database/database")

module.exports = {
    create: (data, callback) => {
        pool.query(
            `INSERT into category(name, description, status)
                value(?,?,?)`,
            [
                data.name,
                data.description,
                parseInt(data.status) === 1 || data.status === true ? 1 : 0,
            ], (error, result) => {
                if (error) return callback(error)
                return (callback(null, result))
            }
        )
    },
    getCategories: callback => {
        pool.query(
            `SELECT * from category`,
            [], (error, result) => {
                if (error) return callback(error)
                return (callback(null, result))
            }
        )
    },
    getCategory: (id, callback) => {
        pool.query(
            `SELECT * from category WHERE id=?`,
            [id],
            (error, result) => {
                if (error) return callback(error)
                else {
                    return (callback(null, result))
                }
            }
        )
    },
    updateCategory: (id, data, callback) => {
        const updated_at = new Date()
        updated_at.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
        pool.query(
            `UPDATE category SET name=?, description=?, status=?, updated_at=? WHERE id = ?`,
            [
                data.name,
                data.description,
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
    deleteCategory: (id, callback) => {
        pool.query(
            `DELETE FROM category WHERE id = ?`,
            [id],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    searchCategory: (query, callback) => {
        pool.query(
            `SELECT * FROM category WHERE CONCAT(name, description) LIKE (?)`,
            [`%${query}%`],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    }
}