const express =
    require("express");

const router =
    express.Router();

const vocabularyService =
    require(
        "../services/vocabularyService"
    );

router.get(
    "/",
    async (req, res) => {

        const words =
            await vocabularyService
                .getVocabulary();

        res.json(words);

    }
);
router.post(
    "/",
    async (req, res) => {

        try {

            const {
                word,
                meaning
            } = req.body;

            await vocabularyService.addWord(
                word,
                meaning
            );

            res.json({
                success: true
            });

        }
        catch (error) {

            res.status(500).json({
                success: false,
                error: error.message
            });

        }

    }
);
module.exports =
    router;