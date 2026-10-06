const express = require("express");
const config = require("./config");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const productsRouter = require("./routes/products");

const app = express();

app.use(express.json());

app.use(logger);

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.json({
        message: "Express REST API работает"
    });
});

app.use("/api/products", productsRouter);

app.use((req, res) => {
    res.status(404).json({
        error: "Маршрут не найден"
    });
});

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Server started: http://localhost:${config.port}`);
});