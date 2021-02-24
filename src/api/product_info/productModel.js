const pool = require("../../database/database")

const pareseBool = (string) => {
    if (string === 'true' || string) return true
    else return false
}

module.exports = {
    create: (data, callback) => {
        pool.query(
            `INSERT into products(product_name, category, type,slug, color, price, actual_price, sale_price, is_sold, purchased_date, sold_date, status, image, qty)
                value(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                data.product_name,
                JSON.stringify(data.category),
                JSON.stringify(data.type),
                data.slug ? data.slug : data.product_name && data.product_name.replace(/ +/g, '-').toLowerCase(),
                data.color,
                data.price,
                data.actual_price,
                data.sale_price,
                data.is_sold,
                data.purchased_date,
                data.sold_date,
                parseInt(data.status) === 1 || pareseBool(data.status) === true ? 1 : 0,
                data.image,
                data.qty,
            ], (error, result) => {
                if (error) return callback(error)
                return (callback(null, result))
            }
        )
    },
    getProducts: callback => {
        pool.query(
            `SELECT * from products ORDER BY id desc`,
            [], (error, result) => {
                if (error) return callback(error)
                return (callback(null, result))
            }
        )
    },
    getProduct: (id, callback) => {
        pool.query(
            `SELECT * from products WHERE id=? || slug=?`,
            [id, id],
            (error, result) => {
                if (error) return callback(error)
                else {
                    return (callback(null, result))
                }
            }
        )
    },
    updateProduct: (id, data, callback) => {
        const updated_at = new Date()
        updated_at.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
        let is_sold = data.is_sold ? data.is_sold : 0;
        let status = null
        if (parseInt(data.qty) >= 1) {
            status = 1
            is_sold = 0
        } else {
            status = 0
            is_sold = 1
            // status = parseInt(data.status) === 1 || pareseBool(data.status) === true ? 1 : 0
        }
        pool.query(
            `UPDATE products SET product_name=?, category=?, type=?,slug=?, color=?, price=?, actual_price=?, sale_price=?, is_sold=?, purchased_date=?, sold_date=?, status=?, qty=?,image=?, updated_at=? WHERE id = ?`,
            [
                data.product_name,
                JSON.stringify(data.category),
                JSON.stringify(data.type),
                data.slug,
                data.color,
                data.price,
                data.actual_price,
                data.sale_price,
                is_sold,
                data.purchased_date,
                data.sold_date,
                status,
                data.qty,
                data.image,
                updated_at,
                id,
            ],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    deleteProduct: (id, callback) => {
        pool.query(
            `DELETE FROM products WHERE id = ?`,
            [id],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    reduce: (id, qty, callback) => {
        pool.query(
            `UPDATE products SET qty=qty-? WHERE id = ?`,
            [qty, id],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
    searchProduct: (query, callback) => {
        let search;
        if (typeof query === 'object') {
            Object.keys(query).map(item => {
                search = query[item];
            })
        } else {
            search = query;
        }
        pool.query(
            `SELECT * FROM products WHERE CONCAT(product_name, slug, id) LIKE (?)`,
            [`%${search}%`],
            (error, result) => {
                if (error) return callback(error)
                return callback(null, result)
            }
        )
    },
}