const express = require("express");
const router = express.Router();

const {
    validate,
    createProductSchema,
    updateProductSchema,
    patchProductSchema
} = require("../middleware/validate");

const upload = require("../middleware/upload");

let products = [];
let nextId = 1;


// GET /api/products
router.get("/", (req, res) => {
    let result = [...products];

    const { category, minPrice, maxPrice } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
        return res.status(400).json({
            error: "page и limit должны быть больше 0"
        });
    }

    if (category) {
        result = result.filter(
            (product) => product.category === category
        );
    }

    if (minPrice !== undefined) {
        const min = Number(minPrice);

        if (Number.isNaN(min)) {
            return res.status(400).json({
                error: "minPrice должен быть числом"
            });
        }

        result = result.filter(
            (product) => product.price >= min
        );
    }

    if (maxPrice !== undefined) {
        const max = Number(maxPrice);

        if (Number.isNaN(max)) {
            return res.status(400).json({
                error: "maxPrice должен быть числом"
            });
        }

        result = result.filter(
            (product) => product.price <= max
        );
    }

    const total = result.length;

    const start = (page - 1) * limit;
    const end = start + limit;

    const data = result.slice(start, end);

    res.json({
        data,
        total,
        page,
        limit
    });
});


// GET /api/products/:id
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    const product = products.find(
        (product) => product.id === id
    );

    if (!product) {
        return res.status(404).json({
            error: "Товар не найден"
        });
    }

    res.json(product);
});


// POST /api/products
router.post(
    "/",
    validate(createProductSchema),
    (req, res) => {
        const product = {
            id: nextId++,
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            stock: req.body.stock ?? 0,
            description: req.body.description || "",
            imageUrl: null,
            createdAt: new Date().toISOString()
        };

        products.push(product);

        res.status(201).json(product);
    }
);


// PUT /api/products/:id
router.put(
    "/:id",
    validate(updateProductSchema),
    (req, res) => {
        const id = Number(req.params.id);

        const index = products.findIndex(
            (product) => product.id === id
        );

        if (index === -1) {
            return res.status(404).json({
                error: "Товар не найден"
            });
        }

        const oldProduct = products[index];

        const updatedProduct = {
            id: oldProduct.id,
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            stock: req.body.stock ?? 0,
            description: req.body.description || "",
            imageUrl: oldProduct.imageUrl,
            createdAt: oldProduct.createdAt
        };

        products[index] = updatedProduct;

        res.json(updatedProduct);
    }
);


// PATCH /api/products/:id
router.patch(
    "/:id",
    validate(patchProductSchema),
    (req, res) => {
        const id = Number(req.params.id);

        const index = products.findIndex(
            (product) => product.id === id
        );

        if (index === -1) {
            return res.status(404).json({
                error: "Товар не найден"
            });
        }

        products[index] = {
            ...products[index],
            ...req.body,
            id: products[index].id,
            createdAt: products[index].createdAt,
            imageUrl: products[index].imageUrl
        };

        res.json(products[index]);
    }
);


// DELETE /api/products/:id
router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = products.findIndex(
        (product) => product.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            error: "Товар не найден"
        });
    }

    products.splice(index, 1);

    res.status(204).send();
});


// POST /api/products/:id/image
router.post(
    "/:id/image",

    (req, res, next) => {
        const id = Number(req.params.id);

        const product = products.find(
            (product) => product.id === id
        );

        if (!product) {
            return res.status(404).json({
                error: "Товар не найден"
            });
        }

        req.product = product;
        next();
    },

    upload.single("image"),

    (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                error: "Изображение не загружено"
            });
        }

        req.product.imageUrl =
            `/uploads/products/${req.file.filename}`;

        res.json(req.product);
    }
);


module.exports = router;