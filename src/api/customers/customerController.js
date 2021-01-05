const { localValidation } = require('../../helpers/ValidationHelper');
const { paginate } = require('../../middlewares/Paginate')
const { create, updateCustomer, getCustomer, getCustomers, deleteCustomer, searchCustomer } = require('./customerModel')

module.exports = {
    createCustomer: (req, res) => {
        const body = req.body
        let validationRule = {
            customer_name: ['required'],
            contact: ['required'],
            email: ['required', 'email']
        };
        let error = {};
        // console.log("body", body);
        const validation = localValidation(body, validationRule, error, false)
        if (validation.localvalidationerror) {
            return res.status(422).json({
                message: { ...validation.error }
            })
        } else {
            create(body, (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(422).json({
                            message: {
                                email: ['Email already exists.']
                            }
                        })
                    } else {
                        return res.status(400).json({
                            message: `${err.sqlMessage ? err.sqlMessage : 'Result Not Found.'}`
                        })
                    }

                }
                return res.status(200).json({
                    message: "Customer Added Successfully"
                })
            })
        }
    },
    getCustomers: (req, res) => {
        getCustomers((err, result) => {
            const { pages, limits, start, to, filterData, total, last_page, q } = paginate(result, req)
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`
            })
            if (q) {
                searchCustomer(q, (error, results) => {
                    const { pages, limits, start, filterData, to, total, last_page } = paginate(results, req)
                    if (error) console.log("error", error);
                    else return res.status(200).json({
                        message: "Successfully Retrived Customers List",
                        current_page: pages,
                        data: filterData,
                        from: start,
                        to,
                        per_page: limits,
                        total,
                        last_page,
                    })
                })
            }
            else return res.status(200).json({
                message: "Successfully Retrived Customers List",
                current_page: pages,
                data: filterData,
                from: start,
                to,
                per_page: limits,
                total,
                last_page,
            })
        })
    },
    getCustomer: (req, res) => {
        const id = req.params.id;
        getCustomer(id, (err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                    message: `${err.sqlMessage ? err.sqlMessage : 'Result Not Found.'}`
                })
            }
            if (result && result.length <= 0) {
                return res.status(400).json({
                    message: 'No Records Found'
                })
            }
            return res.status(200).json({
                message: "Successfully Retrived Customer Details",
                data: result[0],
            })
        })
    },
    updateCustomer: (req, res) => {
        const id = req.params.id;
        const body = req.body;
        updateCustomer(id, body, (err, result) => {
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`,
            })
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: 'No Customer Found With the Given ID.'
                })
            }
            return res.status(200).json({
                message: "Successfully Updated Customer.",
            })
        })
    },
    deleteCustomer: (req, res) => {
        const id = req.params.id;
        deleteCustomer(id, (err, result) => {
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`
            })
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: 'No Customer Found With Then Given ID',
                })
            }
            return res.status(200).json({
                message: "Customer Removed Successfully",
            })
        })
    }
}