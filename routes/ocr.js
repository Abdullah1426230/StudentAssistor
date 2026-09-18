const express = require("express");
const multer = require("multer");

const {
    extractCleanText
} = require("../services/ocrService");

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});

router.post(
    "/",
    upload.single("image"),
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    error: "لم يتم رفع صورة"
                });

            }

            const result =
                await extractCleanText(
                    req.file.path
                );

            res.json(result);

        }
        catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            });

        }

    }
);

module.exports = router;