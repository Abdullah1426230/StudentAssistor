const express =
    require("express");

const router =
    express.Router();

const cacheService =
    require(
        "../services/cacheService"
    );

router.get(
    "/:book/:page",
    async (req, res) => {

        const data =
            await cacheService.getCache(
                req.params.book,
                req.params.page
            );

        res.json(data);

    }
);

module.exports =
    router;