let ocrWorker = null;

async function initializeOCR() {

    if (ocrWorker) {
        return ocrWorker;
    }

    ocrWorker = await Tesseract.createWorker("eng");

    return ocrWorker;

}

async function runOCRFromCanvas() {

    try {

        const canvas =
            document.getElementById(
                "pdfCanvas"
            );

        if (!canvas) {

            alert("لم يتم العثور على Canvas");

            return;

        }

        const loadingOverlay =
            document.getElementById(
                "loadingOverlay"
            );

        if (loadingOverlay) {

            loadingOverlay.classList.remove(
                "hidden"
            );

        }

        const worker =
            await initializeOCR();

        const result =
            await worker.recognize(
                canvas.toDataURL(
                    "image/png"
                )
            );

        const text =
            result.data.text || "";

        const ocrResult =
            document.getElementById(
                "ocrResult"
            );

        if (ocrResult) {

            ocrResult.value =
                text;

        }

        if (loadingOverlay) {

            loadingOverlay.classList.add(
                "hidden"
            );

        }

        return text;

    }
    catch (error) {

        console.error(
            "OCR Error:",
            error
        );

        alert(
            "حدث خطأ أثناء OCR"
        );

    }

}

async function runOCRFromImage(
    imageFile
) {

    try {

        const worker =
            await initializeOCR();

        const result =
            await worker.recognize(
                imageFile
            );

        return (
            result.data.text || ""
        );

    }
    catch (error) {

        console.error(error);

        return "";

    }}