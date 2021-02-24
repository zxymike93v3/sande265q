const pool = require("../../database/database")

const pareseBool = (string) => {
    if (string === 'true' || string) return true
    else return false
}

module.exports = {
    create: (data, callback) => {
        pool.query(
            `INSERT into debtors (name, type, status, pri_amt, rate, accured_int)
                    values(?,?,?,?,?,?)`,
            [
                data.name,
                data.type,
                parseInt(data.status) === 1 || pareseBool(data.status) === true ? 1 : 0,
                data.pri_amt,
                data.rate,
                data.accured_int
            ], (error, result) => {
                if (error) return callback(error)
                return (callback(null, result))
            }
        )
    },
    getDebtors: callback => {
        pool.query(
            `SELECT * from debtors`,
            [],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    getDebtor: (id, callback) => {
        pool.query(
            `SELECT * from debtors where id = ?`,
            [id],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    updateDebtor: (id, data, callback) => {
        pool.query(
            `UPDATE debtors SET name=?, type=?, status=?, pri_amt=?, rate=?, accured_int=? where id = ?`,
            [
                data.name,
                data.type,
                parseInt(data.status) === 1 || pareseBool(data.status) === true ? 1 : 0,
                data.pri_amt,
                data.rate,
                data.accured_int,
                id
            ],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    deleteDebtor: (id, callback) => {
        pool.query(
            `DELETE FROM debtors WHERE id = ?`,
            [id],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    searchDebtor: (query, callback) => {
        pool.query(
            `SELECT id, * FROM debtors WHERE CONCAT(name) LIKE (?)`,
            [`%${query}%`],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    }
}