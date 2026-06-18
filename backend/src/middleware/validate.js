const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extracted = errors.array().map((e) => ({
            field: e.path,
            message: e.msg,
        }));
        return sendError(res, 400, 'Validation failed', extracted);
    }
    next();
};

module.exports = validate;