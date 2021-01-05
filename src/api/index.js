const userRoutes = require('./users/userRoute')
const authRoutes = require('./auth/authRoute')
const productRoute = require('./product_info/productRoute')
const customerRoute = require('./customers/customerRoute')
const vendorRoute = require('./vendors/vendorRoute')
const salesRoute = require('./Sales/salesRoute')
const categoryRoute = require('./category/categoryRoute')

module.exports = {
    userRoutes,
    authRoutes,
    productRoute,
    customerRoute,
    vendorRoute,
    salesRoute,
    categoryRoute
}