const express = require('express');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');
const { authRoutes, customerRoute, userRoutes, productRoute, vendorRoute, salesRoute, categoryRoute } = require('./src/api');
const imageRoute = require('./src/api/imageUpload')
const cors = require('cors')

//Environment variable
const port = process.env.PORT

//parser
app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))

//CORS
app.use(cors())

//defualt url callback
app.get("/", (req, res) => {
    res.status(200).send({
        message: "Node.js application server"
    })
})

//middleware
app.use('/api',
    userRoutes /* User Routes */,
    authRoutes /* Authentication Routes */,
    productRoute /* Products Routes */,
    customerRoute /* Customers Routes */,
    vendorRoute /* Vendors Route */,
    salesRoute /* Daily Sales Routes */,
    imageRoute /* testing */,
    categoryRoute /* Category Routes */
)

app.use('/uploads', express.static('uploads'))


app.listen(port || 3000, () => {
    console.log(`Server is running on port ${port}`);
})