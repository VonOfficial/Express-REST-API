const Joi = require("joi");

const categories = ["electronics", "clothing", "food", "other"];

const createProductSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    price: Joi.number().greater(0).required(),
    category: Joi.string().valid(...categories).required(),
    stock: Joi.number().integer().min(0).default(0),
    description: Joi.string().max(500).allow("").optional()
});

const updateProductSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    price: Joi.number().greater(0).required(),
    category: Joi.string().valid(...categories).required(),
    stock: Joi.number().integer().min(0).default(0),
    description: Joi.string().max(500).allow("").optional()
});

const patchProductSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    price: Joi.number().greater(0),
    category: Joi.string().valid(...categories),
    stock: Joi.number().integer().min(0),
    description: Joi.string().max(500).allow("")
}).min(1);

const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false
        });

        if (error) {
            return res.status(400).json({
                error: "Validation error",
                details: error.details.map((item) => item.message)
            });
        }

        req.body = value;
        next();
    };
};

module.exports = {
    validate,
    createProductSchema,
    updateProductSchema,
    patchProductSchema
};