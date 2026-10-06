const multer = require("multer");

const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                error: "Размер изображения не должен превышать 2 МБ"
            });
        }

        return res.status(400).json({
            error: err.message
        });
    }

    const status = err.status || 500;

    res.status(status).json({
        error: err.message || "Внутренняя ошибка сервера"
    });
};

module.exports = errorHandler;