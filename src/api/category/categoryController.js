const { localValidation } = require('../../helpers/ValidationHelper');
const { paginate } = require('../../middlewares/Paginate')
const { create, updateCategory, getCategory, getCategories, deleteCategory, searchCategory } = require('./categoryModel')

module.exports = {
    createCategory: (req, res) => {
        const body = req.body
        let validationRule = {
            name: ['required'],
            status: ['required']
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
                    return res.status(400).json({
                        message: `${err.sqlMessage ? err.sqlMessage : 'Result Not Found.'}`
                    })
                }
                return res.status(200).json({
                    message: "Category Added Successfully"
                })
            })
        }
    },
    getCategories: (req, res) => {
        getCategories((err, result) => {
            const { pages, limits, start, to, filterData, total, last_page, q } = paginate(result, req)
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`
            })
            if (q) {
                searchCustomer(q, (error, results) => {
                    const { pages, limits, start, filterData, to, total, last_page } = paginate(results, req)
                    if (error) console.log("error", error);
                    else return res.status(200).json({
                        message: "Successfully Retrived Categories List",
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
                message: "Successfully Retrived Categories List",
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
    getCategory: (req, res) => {
        const id = req.params.id;
        getCategory(id, (err, result) => {
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
                message: "Successfully Retrived Category Details",
                data: result[0],
            })
        })
    },
    updateCategory: (req, res) => {
        const id = req.params.id;
        const body = req.body;
        updateCategory(id, body, (err, result) => {
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`,
            })
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: 'No Category Found With the Given ID.'
                })
            }
            return res.status(200).json({
                message: "Successfully Updated Category.",
            })
        })
    },
    deleteCategory: (req, res) => {
        const id = req.params.id;
        deleteCategory(id, (err, result) => {
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`
            })
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: 'No Category Found With Then Given ID',
                })
            }
            return res.status(200).json({
                message: "Category Deleted Successfully",
            })
        })
    }
}