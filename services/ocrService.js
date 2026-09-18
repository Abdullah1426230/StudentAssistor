const Tesseract = require("tesseract.js");

/*
=========================================
OCR من صورة
=========================================
*/
async function recognizeImage(imagePath) {

    try {

        const result =
            await Tesseract.recognize(
                imagePath,
                "eng",
                {
                    logger: (info) => {

                        if (
                            info.status &&
                            info.progress !== undefined
                        ) {

                            console.log(
                                `${info.status}: ${Math.round(
                                    info.progress * 100
                                )}%`
                            );

                        }

                    }
                }
            );

        return {
            success: true,
            text: result.data.text
        };

    }
    catch (error) {

        return {
            success: false,
            error: error.message
        };

    }

}

/*
=========================================
OCR من Buffer
=========================================
*/
async function recognizeBuffer(buffer) {

    try {

        const result =
            await Tesseract.recognize(
                buffer,
                "eng"
            );

        return {
            success: true,
            text: result.data.text
        };

    }
    catch (error) {

        return {
            success: false,
            error: error.message
        };

    }

}

/*
=========================================
OCR + تنظيف النص
=========================================
*/
async function extractCleanText(imagePath) {

    const result =
        await recognizeImage(imagePath);

    if (!result.success) {
        return result;
    }

    let text = result.text;

    text = text.replace(/\r/g, "");
    text = text.replace(/\t/g, " ");
    text = text.replace(/\s+/g, " ");
    text = text.trim();

    return {
        success: true,
        text
    };

}

/*
=========================================
OCR + استخراج مفردات
=========================================
*/
async function extractWords(imagePath) {

    const result =
        await extractCleanText(
            imagePath
        );

    if (!result.success) {
        return result;
    }

    const words =
        result.text
            .split(" ")
            .map(word => word.trim())
            .filter(word => word.length > 2);

    const uniqueWords =
        [...new Set(words)];

    return {
        success: true,
        words: uniqueWords
    };

}

module.exports = {
    recognizeImage,
    recognizeBuffer,
    extractCleanText,
    extractWords
};