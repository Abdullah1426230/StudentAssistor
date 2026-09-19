require("dotenv").config();
;
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
// const path = require("path");
const { exec } = require("child_process");
const app = express();
const { execFile } =
    require("child_process");

// const fs =
//     require("fs");

const path =
    require("path");
const PORT = process.env.PORT || 3000;
let currentProcess = null;
app.use(cors());
const vocabularyFile =
    path.join(
        __dirname,
        "data",
        "vocabulary.json"
    )
app.use(express.json({
    limit: "50mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

const translateRoute =
    require("./routes/translate");

app.use(
    "/api/translate",
    translateRoute
);



const ocrRoute =
    require("./routes/ocr");

app.use(
    "/api/ocr",
    ocrRoute
);
app.use(express.static(path.join(__dirname, "public")));

const uploadDir = path.join(__dirname, "uploads");

fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },

    filename(req, file, cb) {
        const ext = path.extname(file.originalname);

        cb(
            null,
            `${Date.now()}-${uuidv4()}${ext}`
        );
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 500
    }
});

const translationProgress = {};

app.post(
    "/api/upload",
    upload.single("pdf"),
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false
                });

            }

         if (!req.file) {

    return res.status(400).json({
        success: false
    });

}

res.json({
    success: true,
    filename: req.file.filename,
    originalName: req.file.originalname
});

        }
        catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                error: error.message
            });

        }

    }
);

app.use(
    "/pages",
    express.static(
        path.join(
            __dirname,
            "public",
            "pages"
        )
    )
);
app.delete(
    "/api/vocabulary",
    async (req, res) => {

        try {

            await fs.writeJson(
                vocabularyFile,
                [],
                {
                    spaces: 2
                }
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
app.delete(
    "/api/reset",
    async (req, res) => {

        try {

            await fs.emptyDir(
                path.join(
                    __dirname,
                    "cache",
                    "translations"
                )
            );

            await fs.emptyDir(
                path.join(
                    __dirname,
                    "uploads"
                )
            );

            await fs.emptyDir(
                path.join(
                    __dirname,
                    "public",
                    "pages"
                )
            );

            for (const key in translationProgress) {

                delete translationProgress[key];

            }

            res.json({
                success: true
            });

        }
        catch (error) {

            console.error(error);

            res.status(500).json({
                success: false
            });

        }

    }
);
app.get(
    "/api/progress/:id",
    (req, res) => {

        const id = req.params.id;

        res.json({
            progress: translationProgress[id] || 0
        });

    }
);
app.get(
    "/api/vocabulary/pdf",
    async (req, res) => {

        try {

            const words =
                await fs.readJson(
                    vocabularyFile
                );

            const doc =
                new PDFDocument({
                    margin: 40
                });

            res.setHeader(
                "Content-Type",
                "application/pdf"
            );

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=vocabulary.pdf"
            );

            doc.pipe(res);

            // خط عربي
            doc.registerFont(
                "arabic",
                path.join(
                    __dirname,
                    "public",
                    "fonts",
                    "NotoSansArabic-Regular.ttf"
                )
            );

            doc.font(
                "arabic"
            );

            doc.fontSize(20);

            doc.text(
                "القاموس الشخصي",
                {
                    align: "center"
                }
            );

            doc.moveDown();

            words.forEach(
                (
                    item,
                    index
                ) => {

                    doc.fontSize(
                        12
                    );

                    doc.text(
                        `${index + 1} | ${item.word} | ${item.meaning || "-"}`
                    );

                }
            );

            doc.end();

        }
        catch (err) {

            console.error(
                err
            );

            res.status(500).json({
                success: false
            });

        }

    }
);

app.post(
    "/api/cache/save",
    async (req, res) => {

        try {

            const {
                pageId,
                translation
            } = req.body;

            const cacheDir = path.join(
                __dirname,
                "cache",
                "translations"
            );

            await fs.ensureDir(cacheDir);

            await fs.writeFile(
                path.join(cacheDir, `${pageId}.json`),
                JSON.stringify({
                    translation
                }, null, 2)
            );

            res.json({
                success: true
            });

        }
        catch (err) {

            res.status(500).json({
                success: false,
                error: err.message
            });

        }

    }
);

app.post(
    "/api/cache/get",
    async (req, res) => {

        try {

            const {
                pageId
            } = req.body;

            const file = path.join(
                __dirname,
                "cache",
                "translations",
                `${pageId}.json`
            );

            if (!(await fs.pathExists(file))) {

                return res.json({
                    exists: false
                });

            }

            const data = await fs.readJson(file);

            res.json({
                exists: true,
                translation: data.translation
            });

        }
        catch (err) {

            res.status(500).json({
                success: false,
                error: err.message
            });

        }

    }
);

app.get(
    "/api/vocabulary",
    async (req, res) => {

        try {

            const file = path.join(
                __dirname,
                "data",
                "vocabulary.json"
            );

            const vocab = await fs.readJson(file);

            res.json(vocab);

        }
        catch {

            res.json([]);

        }

    }
);

app.post(
    "/api/vocabulary",
    async (req, res) => {

        try {

            const file =
                vocabularyFile;

            let data = [];

            if (
                await fs.pathExists(file)
            ) {

                data =
                    await fs.readJson(file);

            }

            const item = {

                id: Date.now(),

                word:
                    req.body.word,

                meaning:
                    req.body.meaning,

                favorite:
                    req.body.favorite || false

            };

            data.push(item);

            await fs.writeJson(
                file,
                data,
                {
                    spaces: 2
                }
            );

            res.json({
                success: true
            });

        }
        catch (err) {

            res.status(500).json({
                success: false,
                error: err.message
            });

        }

    }
);
app.delete(
    "/api/vocabulary/:id",
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );

            const words =
                await fs.readJson(
                    vocabularyFile
                );

            const filteredWords =
                words.filter(
                    item =>
                        item.id !== id
                );

            await fs.writeJson(
                vocabularyFile,
                filteredWords,
                {
                    spaces: 2
                }
            );

            res.json({
                success: true
            });

        }
        catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                error: error.message
            });

        }

    }
);
app.put(
    "/api/vocabulary/favorite/:id",
    async (req, res) => {

        const id =
            Number(
                req.params.id
            );

        const words =
            await fs.readJson(
                vocabularyFile
            );

        const item =
            words.find(
                word =>
                    word.id === id
            );

        if (item) {

            item.favorite =
                !item.favorite;

        }

        await fs.writeJson(
            vocabularyFile,
            words,
            {
                spaces: 2
            }
        );

        res.json({
            success: true
        });

    }
);

app.post(
    "/api/render-pages",
    async (req, res) => {

        try {

            console.log(
                "RENDER ROUTE HIT",
                req.body
            );

            const {
                filename,
                page
            } = req.body;

            const pdfPath =
                path.join(
                    uploadDir,
                    filename
                );

            const pagesDir =
                path.join(
                    __dirname,
                    "public",
                    "pages"
                );

            await fs.ensureDir(
                pagesDir
            );

            const startPage =
                Math.max(
                    1,
                    page - 3
                );

            const endPage =
                page + 3;

            console.log(
                "START RENDER"
            );

            console.log(
                pdfPath
            );

            console.log(
                startPage,
                endPage
            );

            const outputPrefix =
                path.join(
                    pagesDir,
                    "page"
                );

            execFile(
                "pdftoppm",
                [
                    "-f",
                    String(startPage),

                    "-l",
                    String(endPage),

                    "-png",

                    pdfPath,

                    outputPrefix
                ],

                async (
                    error,
                    stdout,
                    stderr
                ) => {

                    console.log(
                        "FINISHED RENDER"
                    );

                    console.log(
                        "STDOUT:",
                        stdout
                    );

                    console.log(
                        "STDERR:",
                        stderr
                    );

                    if (error) {

                        console.error(
                            error
                        );

                        return res.status(500).json({
                            success: false,
                            error: error.message
                        });

                    }

                    const files =
                        await fs.readdir(
                            pagesDir
                        );

                    console.log(
                        "FILES:",
                        files
                    );

                    res.json({
                        success: true
                    });

                }
            );

        }
        catch (err) {

            console.error(
                err
            );

            res.status(500).json({
                success: false,
                error: err.message
            });

        }

    }
);
app.use((req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log(" Student Assistor Started ");
    console.log("================================");
    console.log(`URL: http://localhost:${PORT}`);
    console.log("");

});
