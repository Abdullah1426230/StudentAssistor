const express =
    require("express");

const multer =
    require("multer");

const path =
    require("path");

const router =
    express.Router();

const storage =
    multer.diskStorage({

        destination:
            "./uploads",

        filename:
            (
                req,
                file,
                cb
            ) => {

                cb(
                    null,
                    Date.now() +
                    path.extname(
                        file.originalname
                    )
                );

            }

    });

const upload =
    multer({
        storage
    });

router.post(
    "/",
    upload.single("pdf"),
    (
        req,
        res
    ) => {

        res.json({
            success: true,
            filename:
                req.file.filename
        });

    }
);
await convertPdfToImages(
    req.file.path,
    currentPage
);
module.exports =
    router;