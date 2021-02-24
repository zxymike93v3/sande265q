const { localValidation } = require('../../helpers/ValidationHelper');
const { paginate } = require('../../middlewares/Paginate')
const { create, updateDebtor, getDebtor, getDebtors, deleteDebtor, searchDebtor } = require('./debtorsModel')

const validationRule = {
    name: ['required'],
    type: ['required'],
    status: ['required'],
    pri_amt: ['required'],
    rate: ['required'],
    accured_int: ['required'],
};

module.exports = {
    createDebtor: (req, res) => {
        const body = req.body
        let error = {};
        const validation = localValidation(body, validationRule, error, false)
        if (validation.localvalidationerror) {
            return res.status(422).json({
                message: { ...validation.error }
            })
        } else {
            create(body, (err, result) => {
                if (err) {
                    return res.status(400).json({
                        message: `${err.sqlMessage ? err.sqlMessage : 'Result Not Found.'}`
                    })

                }
                return res.status(200).json({
                    message: "Debtor Created Successfully"
                })
            })
        }
    },
    getDebtors: (req, res) => {
        getDebtors((err, result) => {
            const { pages, limits, start, to, filterData, total, last_page, q } = paginate(result, req)
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`
            })
            if (q) {
                searchDebtor(q, (error, results) => {
                    const { pages, limits, start, filterData, to, total, last_page } = paginate(results, req)
                    if (error) console.log("error", error);
                    else return res.status(200).json({
                        message: "Successfully Retrived Debtor List",
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
                message: "Successfully Retrived Debtor List",
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
    getDebtor: (req, res) => {
        const id = req.params.id;
        getDebtor(id, (err, result) => {
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
                message: "Successfully Retrived Debtor Details",
                data: result[0],
            })
        })
    },
    updateDebtor: (req, res) => {
        const id = req.params.id;
        const body = req.body;
        let error = {};
        const validation = localValidation(body, validationRule, error, false)
        if (validation.localvalidationerror) {
            return res.status(422).json({
                message: { ...validation.error }
            })
        } else {
            updateDebtor(id, body, (err, result) => {
                if (err) return res.status(400).json({
                    message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`,
                })
                if (result.affectedRows === 0) {
                    return res.status(400).json({
                        message: 'No Debtor Found With the Given ID.'
                    })
                }
                return res.status(200).json({
                    message: "Successfully Updated Debtor.",
                })
            })
        }
    },
    deleteDebtor: (req, res) => {
        const id = req.params.id;
        deleteDebtor(id, (err, result) => {
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`
            })
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: 'No Debtor Found With Then Given ID',
                })
            }
            return res.status(200).json({
                message: "Debtor Deleted Successfully",
            })
        })
    }
}