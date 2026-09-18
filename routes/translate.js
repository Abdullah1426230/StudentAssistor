const express =
    require("express");

const router =
    express.Router();

const {
    translateText
} = require(
    "../services/googleTranslateService"
);

router.post(
    "/",
    async (req, res) => {

        try {

            const {
                text
            } = req.body;

            const translation =
                await translateText(
                    text
                );

            res.json({

                success: true,

                translation

            });

        }
        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);

module.exports = router;