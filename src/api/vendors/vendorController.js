const { localValidation } = require('../../helpers/ValidationHelper');
const { paginate } = require('../../middlewares/Paginate')
const { create, updateVendor, getVendor, getVendors, deleteVendor, searchVendor } = require('./vendorModel')

module.exports = {
    createVendor: (req, res) => {
        const body = req.body
        let validationRule = {
            vendor_name: ['required'],
        };
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
                    message: "Vendor Created Successfully"
                })
            })
        }
    },
    getVendors: (req, res) => {
        getVendors((err, result) => {
            const { pages, limits, start, to, filterData, total, last_page, q } = paginate(result, req)
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`
            })
            if (q) {
                searchVendor(q, (error, results) => {
                    const { pages, limits, start, filterData, to, total, last_page } = paginate(results, req)
                    if (error) console.log("error", error);
                    else return res.status(200).json({
                        message: "Successfully Retrived Vendors List",
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
                message: "Successfully Retrived Vendors List",
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
    getVendor: (req, res) => {
        const id = req.params.id;
        getVendor(id, (err, result) => {
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
                message: "Successfully Retrived Vendor Details",
                data: result[0],
            })
        })
    },
    updateVendor: (req, res) => {
        const id = req.params.id;
        const body = req.body;
        updateVendor(id, body, (err, result) => {
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`,
            })
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: 'No Vendor Found With the Given ID.'
                })
            }
            return res.status(200).json({
                message: "Successfully Updated Vendor.",
            })
        })
    },
    deleteVendor: (req, res) => {
        const id = req.params.id;
        deleteVendor(id, (err, result) => {
            if (err) return res.status(400).json({
                message: `${err.sqlMessage ? err.sqlMessage : 'Something Went Wrong'}`
            })
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: 'No Vendor Found With Then Given ID',
                })
            }
            return res.status(200).json({
                message: "Vendor Deleted Successfully",
            })
        })
    }
}