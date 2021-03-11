const express = require('express');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');
const {authRoutes, customerRoute, userRoutes, productRoute, vendorRoute, salesRoute, categoryRoute, debtorsRoute} = require('./src/api');
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
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
            integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" 
        crossorigin="anonymous">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <div class="d-flex justify-content-center align-items-center">
            <div class="card mt-5">
                <div class="card-body">
                    <h3 class="card-title">Welcome, Sorry the page you are looking for cannot be found<h3>
                </div>
            </div>
        </div>            
    </body>
    </html>
    `)
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
    categoryRoute /* Category Routes */,
    debtorsRoute, /* Debtors Route */
)

app.use('/uploads', express.static('uploads'))


app.listen(port || 3000, () => {
    console.log(`Server is running on port ${port}`);
})