let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let isLoadingPage = false;
let currentPdfFilename = "";
let cropper = null;
let ocrRunning = false;
import * as pdfjsLib from
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

document
    .getElementById(
        "openVocabularyBtn"
    )
    .addEventListener(
        "click",
        loadVocabulary
    );

document
    .getElementById(
        "exportVocabularyBtn"
    )
    .addEventListener(
        "click",
        exportVocabularyJson
    );

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            document
                .querySelectorAll(
                    ".modal,#snapshotModal, #translationModal"
                )
                .forEach(modal => {

                    modal.classList.add(
                        "hidden"
                    );

                });

        }

    }
);
    
// بديل للتصدير
document
    .getElementById(
        "exportPdfBtn"
    )
    .addEventListener(
        "click",
        exportVocabularyPdf
    );



const pageImage =
    document.getElementById(
        "pageImage"
    );
let stopRequested = false;
const pdfFileInput = document.getElementById("pdfFile");
const snapshotButton =
    document.getElementById(
        "snapshotBtn"
    );


snapshotButton.addEventListener(
    "click",
    openSnapshotModal
);
const pasteImageBtn =
    document.getElementById(
        "pasteImageBtn"
    );
pasteImageBtn.addEventListener(
    "click",
    async () => {

        try {

            const items =
                await navigator.clipboard.read();

            for (
                const item of items
            ) {

                const imageType =
                    item.types.find(
                        type =>
                            type.startsWith(
                                "image/"
                            )
                    );

                if (!imageType) {
                    continue;
                }

                const blob =
                    await item.getType(
                        imageType
                    );

                await translateClipboardImage(
                    blob
                );

                return;

            }

            alert(
                "لا توجد صورة في الحافظة"
            );

        }
        catch (error) {

            console.error(error);

            alert(
                "فشل الوصول إلى الحافظة"
            );

        }

    }
);

async function exportVocabularyJson() {

    try {

        const response =
            await fetch(
                "/api/vocabulary"
            );

        const words =
            await response.json();

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        words,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;

        link.download =
            "vocabulary.json";

        link.click();

        URL.revokeObjectURL(
            url
        );

    }
    catch (error) {

        console.error(error);

    }

}




// بديل للتصدير
async function exportVocabularyPdf() {

    const response =
        await fetch("/api/vocabulary");

    const words =
        await response.json();

    let html = `
    <html dir="rtl">
    <head>
        <meta charset="utf-8">
        <title>القاموس الشخصي</title>

        <style>

            body{
                font-family: Tahoma;
                padding:20px;
            }

            table{
                width:100%;
                border-collapse:collapse;
            }

            th,td{
                border:1px solid #000;
                padding:8px;
                text-align:center;
            }

        </style>

    </head>
    <body>

        <h1>القاموس الشخصي</h1>

        <table>

            <tr>
                <th>#</th>
                <th>الكلمة</th>
                <th>الترجمة</th>
            </tr>

            ${words.map((item,index)=>`
                <tr>
                    <td>${index+1}</td>
                    <td>${item.word}</td>
                    <td>${item.meaning || "-"}</td>
                </tr>
            `).join("")}

        </table>

    </body>
    </html>
    `;

    const win =
        window.open(
            "",
            "_blank"
        );

    win.document.write(
        html
    );

    win.document.close();

    win.print();

}

function openSnapshotModal() {

    const modal =
        document.getElementById(
            "snapshotModal"
        );

    const snapshotImage =
        document.getElementById(
            "snapshotImage"
        );

    snapshotImage.src =
        pageImage.src;

    modal.classList.remove(
        "hidden"
    );

    setTimeout(() => {

        if (cropper) {

            cropper.destroy();

        }
console.log("Opening Cropper");
        cropper =
            new Cropper(
                snapshotImage,
                {
                    viewMode: 1
                }
            );

    }, 100);
console.log(cropper);
}

document
    .getElementById(
        "closeSnapshotBtn"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "snapshotModal"
                )
                .classList
                .add(
                    "hidden"
                );

            if (cropper) {

                cropper.destroy();

                cropper = null;

            }

        }
    );
document
    .getElementById(
        "closeTranslationModal"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "translationModal"
                )
                .classList
                .add(
                    "hidden"
                );

        }
    );
    document
    .getElementById(
        "translateCropBtn"
    )
    .addEventListener(
        "click",
        async () => {

            if (!cropper) {
                alert("حدد جزءاً أولاً");
                return;
            }

            try {

                const canvas =
                    cropper.getCroppedCanvas({
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: "high"
                    });

                const result =
                    await Tesseract.recognize(
                        canvas,
                        "eng"
                    );

                const text =
                    result.data.text.trim();

                if (!text) {

                    alert(
                        "لم يتم العثور على نص"
                    );

                    return;

                }

                const response =
                    await fetch(
                        "/api/translate",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                text
                            })
                        }
                    );

                const translationResult =
                    await response.json();

                document
                    .getElementById(
                        "selectedText"
                    )
                    .value = text;

                document
                    .getElementById(
                        "selectedTranslation"
                    )
                    .value =
                    translationResult.translation ||
                    "فشلت الترجمة";

                document
                    .getElementById(
                        "translationModal"
                    )
                    .classList
                    .remove(
                        "hidden"
                    );

            }
            catch (error) {

                console.error(error);

                alert(
                    "فشل استخراج أو ترجمة النص"
                );

            }

        }
    );

const pageNumberElement =
    document.getElementById("currentPage");
const startOCRButton = document.getElementById("startOCR");
startOCRButton.addEventListener(
    "click",
    runManualOCR
);
const stopButton =
    document.getElementById("stopAll");
stopButton.addEventListener(
    "click",
    async () => {

        stopRequested = true;

        await fetch(
            "/api/reset",
            {
                method: "DELETE"
            }
        );

        pageImage.src = "";

        translationBox.value = "";

        document.getElementById(
            "ocrResult"
        ).value = "";

        document.getElementById(
            "pageText"
        ).value = "";

        document.getElementById(
            "cachedTranslation"
        ).value = "";

        console.log(
            "Application reset"
        );
location.reload();
    }
);
document
    .getElementById(
        "deleteAllVocabularyBtn"
    )
    .addEventListener(
        "click",
        async () => {

            if (
                !confirm(
                    "هل تريد حذف جميع المفردات؟"
                )
            ) {
                return;
            }

            await fetch(
                "/api/vocabulary",
                {
                    method: "DELETE"
                }
            );

            await loadVocabulary();

        }
    );
let selectedText = "";

const selectionMenu =
    document.getElementById(
        "selectionMenu"
    );

const translateSelectionBtn =
    document.getElementById(
        "translateSelectionBtn"
    );

const cancelSelectionBtn =
    document.getElementById(
        "cancelSelectionBtn"
    );
document.addEventListener(
    "mouseup",
    (event) => {

        const text =
            window.getSelection()
                .toString()
                .trim();

        if (!text) {

            selectionMenu.classList.add(
                "hidden"
            );

            return;

        }

        selectedText = text;

        selectionMenu.style.left =
            `${event.pageX}px`;

        selectionMenu.style.top =
            `${event.pageY}px`;

        selectionMenu.classList.remove(
            "hidden"
        );

    }
);
cancelSelectionBtn.addEventListener(
    "click",
    () => {

        selectionMenu.classList.add(
            "hidden"
        );

        window
            .getSelection()
            .removeAllRanges();

    }
);
translateSelectionBtn.addEventListener(
    "click",
    async () => {

        const response =
            await fetch(
                "/api/translate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        text:
                            selectedText
                    })
                }
            );

        const result =
            await response.json();

        document.getElementById(
            "selectedText"
        ).value =
            selectedText;

        document.getElementById(
            "selectedTranslation"
        ).value =
            result.translation || "";

        document
            .getElementById(
                "translationModal"
            )
            .classList
            .remove(
                "hidden"
            );

        selectionMenu.classList.add(
            "hidden"
        );

    }
);
document
    .getElementById(
        "closeTranslationModal"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "translationModal"
                )
                .classList
                .add(
                    "hidden"
                );

        }
    );

const totalPagesElement =
    document.getElementById("totalPages");
const pageJump =
    document.getElementById("pageJump");
const translationBox =
    document.getElementById("translationBox");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressValue");

const prevButton =
    document.getElementById("prevPage");

const nextButton =
    document.getElementById("nextPage");

pdfFileInput.addEventListener(
    "change",
    handleFileUpload
);

prevButton.addEventListener(
    "click",
    showPreviousPage
);

nextButton.addEventListener(
    "click",
    showNextPage
);

async function runManualOCR() {

    try {

        if (!pdfDoc) {

            alert("افتح ملف PDF أولاً");

            return;

        }
        if(ocrRunning){
            ocrRunning = true;
        }
        translationBox.value =
            "جاري تشغيل OCR...";

        updateProgress(0);

        const pageImage =
    document.getElementById(
        "pageImage"
    );

        const result =
            await Tesseract.recognize(
                pageImage,
                "eng",
                {
                    logger: (info) => {
                        if (stopRequested) {
    throw new Error(
        "OCR Stopped"
    );
}
                        if (
                            info.status ===
                            "recognizing text"
                        ) {

                            updateProgress(
                                Math.round(
                                    (info.progress || 0) * 100
                                )
                            );

                        }

                    }
                }
            );

    
const text =
    (
        result.data.text || ""
    ).trim();

const ocrResult =
    document.getElementById(
        "ocrResult"
    );

if (ocrResult) {

    ocrResult.value =
        text;

}

const translated =
    await translateChunk(
        text
    );

if (translationBox) {

    translationBox.value =
        translated;

}
        updateProgress(100);

    }
    catch (error) {

        console.error(error);

        alert("فشل تشغيل OCR");

    }
    finally{
        ocrRunning=false;
    }
}





pageJump.addEventListener(
    "input",
    () => {

        pageJump.value =
            pageJump.value.replace(
                /\D/g,
                ""
            );

    }
);
function updateProgress(value) {

    if (progressBar) {

        progressBar.style.width =
            `${value}%`;

    }

    if (progressText) {

        progressText.textContent =
            `${value}%`;

    }

    console.log(
        "Progress:",
        value
    );

}

pageJump.addEventListener(
    "keydown",
    async (event) => {

        if (event.key !== "Enter") {
            return;
        }

        const page =
            parseInt(
                pageJump.value
            );

        if (
            isNaN(page) ||
            page < 1 ||
            page > totalPages
        ) {

            alert(
                `أدخل رقم بين 1 و ${totalPages}`
            );

            return;

        }

        currentPage = page;

// توليد صور الصفحة الحالية وما حولها
await fetch(
    "/api/render-pages",
    {
        method: "POST",

        headers: {
            "Content-Type":
                "application/json"
        },

        body: JSON.stringify({

            filename:
                currentPdfFilename,

            page:
                currentPage

        })

    }
);

// عرض الصورة
await renderPage(
    currentPage
);

// تحميل النص والترجمة
const pdfPage =
    await pdfDoc.getPage(
        currentPage
    );

await translateCurrentPage(
    pdfPage
);

    }
);
async function handleFileUpload(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    try {

        const formData = new FormData();

        formData.append(
            "pdf",
            file
        );

        const uploadResponse =
            await fetch(
                "/api/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

        const uploadResult =
            await uploadResponse.json();
            currentPdfFilename =
    uploadResult.filename;
  
        if (!uploadResult.success) {

            alert("فشل رفع الملف");

            return;

        }

        const arrayBuffer =
            await file.arrayBuffer();

        await loadPdfFromBuffer(
            arrayBuffer
        );

    }
    catch (error) {

        console.error(error);

        alert("حدث خطأ أثناء رفع الملف");

    }

}

async function loadPdfFromBuffer(buffer) {

    const loadingTask =
        pdfjsLib.getDocument({
            data: buffer
        });

    pdfDoc =
        await loadingTask.promise;

    totalPages =
        pdfDoc.numPages;

    currentPage = 1;

    totalPagesElement.textContent =
        totalPages;

    await fetch(
        "/api/render-pages",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                filename:
                    currentPdfFilename,
                page: 1
            })
        }
    );

    await renderPage(currentPage);

const page =
    await pdfDoc.getPage(
        currentPage
    );

await translateCurrentPage(
    page
);


}
async function extractTextWithLayout(page) {

    const textContent =
        await page.getTextContent({
            disableCombineTextItems: false
        });

    const items =
        textContent.items;

    let result = "";

    let lastY = null;
    let lastX = null;

    items.forEach(item => {

        const x =
            item.transform[4];

        const y =
            item.transform[5];

        if (
            lastY !== null &&
            Math.abs(y - lastY) > 5
        ) {

            result += "\n";

            lastX = null;

        }

        if (
            lastX !== null &&
            x - lastX > 20
        ) {

            result += " ";

        }

        result += item.str;

        lastY = y;

        lastX =
            x + item.width;

    });

    return result;

}



async function renderPage(pageNumber) {

    currentPage = pageNumber;

    const fileName =
        String(pageNumber)
            .padStart(3, "0");

    pageImage.src =
        `/pages/page-${fileName}.png?${Date.now()}`;

    pageNumberElement.textContent =
        pageNumber;

}


async function showPreviousPage() {

    if (isLoadingPage) {
        return;
    }

    if (currentPage <= 1) {
        return;
    }

    currentPage--;

    prevButton.disabled = true;
    nextButton.disabled = true;

    try {

        await fetch(
            "/api/render-pages",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    filename:
                        currentPdfFilename,
                    page:
                        currentPage
                })
            }
        );

        await renderPage(currentPage);

        const page =
            await pdfDoc.getPage(
                currentPage
            );

        await translateCurrentPage(page);

    }
    finally {

        prevButton.disabled = false;
        nextButton.disabled = false;

    }

}


async function showNextPage() {

    if (isLoadingPage) {
        return;
    }

    if (currentPage >= totalPages) {
        return;
    }

    currentPage++;

    prevButton.disabled = true;
    nextButton.disabled = true;

    try {

        await fetch(
            "/api/render-pages",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    filename:
                        currentPdfFilename,
                    page:
                        currentPage
                })
            }
        );

        await renderPage(currentPage);

        const page =
            await pdfDoc.getPage(
                currentPage
            );

        await translateCurrentPage(page);

    }
    finally {

        prevButton.disabled = false;
        nextButton.disabled = false;

    }

}

async function extractText(page) {

    const textContent =
    await page.getTextContent({
        disableCombineTextItems: false
    });

    const text =
        textContent.items
            .map(item => item.str)
            .join(" ");

    return text;

}

function splitIntoChunks(
    text,
    chunkSize = 800
) {

    const chunks = [];

    for (
        let i = 0;
        i < text.length;
        i += chunkSize
    ) {

        chunks.push(
            text.slice(
                i,
                i + chunkSize
            )
        );

    }

    return chunks;

}


async function getPageText(page) {

    return await extractTextWithLayout(page);

}

function cleanExtractedText(text) {

    return text

        // حذف الأسطر الفارغة الكثيرة
        .replace(/\n{2,}/g, "\n")

        // حذف المسافات المكررة
        .replace(/\s{2,}/g, " ")

        // دمج الكلمات المكسورة بشرطة
        .replace(/(\w)-\s+(\w)/g, "$1$2")

        // إزالة الرموز الغريبة
        .replace(/[■□▪▫¤§]/g, "")

        // تحسين OCR الشائع
        .replace(/\b0f\b/g, "of")
        .replace(/\bteh\b/g, "the")
        .replace(/\brn\b/g, "m")

        .trim();

}


function repairOCRWords(text) {

    return text
        .replace(
            /\b([A-Z]{2,})\s+([A-Z]{2,})\b/g,
            "$1$2"
        )
        .replace(/\s+/g, " ")
        .trim();

}
async function translateCurrentPage(page) {

    try {

        if (translationBox) {
            translationBox.value =
                "الترجمة جارية ...";
        }

        const extractedText =
    await getPageText(page);

        console.log(
            "PDF TEXT:",
            extractedText
        );

        if (
            !extractedText ||
            !extractedText.trim()
        ) {

            if (translationBox) {
                translationBox.value =
                    "لا يوجد نص في الصفحة";
            }

            return;

        }

        const ocrBox =
            document.getElementById(
                "ocrResult"
            );

        if (ocrBox) {

            ocrBox.value =
                extractedText;

        }

        const pageId =
            `page_${currentPage}`;

        const cached =
            await getCache(pageId);

        if (
    cached &&
    cached.translation &&
    cached.translation.trim().length > 0
) {

    translationBox.value =
        cached.translation;

    return;

}

        const chunks =
            splitIntoChunks(
                extractedText,
                800
            );

        let finalTranslation =
            "";

        updateProgress(0);

        for (
            let i = 0;
            i < chunks.length;
            i++
        ) {
            if (stopRequested) {

    stopRequested = false;

    throw new Error(
        "Operation Stopped"
    );

}
console.log("Sending chunk:", chunks[i]);
            const translated =
                await translateChunk(
                    chunks[i]
                );

            finalTranslation +=
                translated + "\n\n";

            const progress =
                Math.round(
                    ((i + 1) /
                        chunks.length) * 100
                );

            updateProgress(
                progress
            );

        }

        if (translationBox) {
            console.log(finalTranslation);
            translationBox.value =
                finalTranslation;

        }


        if (
    finalTranslation &&
    finalTranslation.trim().length > 0
) {

    await saveCache(
        pageId,
        finalTranslation
    );

}

        updateProgress(100);

    }
    catch (error) {

        console.error(error);

        if (translationBox) {

            translationBox.value =
                "حدث خطأ أثناء الترجمة";

        }

    }

}
async function translateChunk(text) {

    console.log("Sending:", text);

    const engine ="nllb";

    const response =
        await fetch(
            "/api/translate",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    text: text,

                   

                })

            }
        );

    const result =
        await response.json();

    if (!result.success) {

        throw new Error(
            result.error ||
            "Translation Failed"
        );

    }

    return result.translation;

}


async function getCache(pageId) {

    const response =
        await fetch(
            "/api/cache/get",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    pageId
                })
            }
        );

    return await response.json();

}

async function saveCache(
    pageId,
    translation
) {

    await fetch(
        "/api/cache/save",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                pageId,
                translation
            })
        }
    );

}

console.log(
    "Student Assistor Ready"
);

async function translateClipboardImage(
    imageBlob
) {

    try {

        updateProgress(0);

        const result =
            await Tesseract.recognize(
                imageBlob,
                "eng",
                {
                    logger: info => {

                        if (
                            info.status ===
                            "recognizing text"
                        ) {

                            updateProgress(
                                Math.round(
                                    (info.progress || 0) * 100
                                )
                            );

                        }

                    }
                }
            );

        const text =
            (
                result.data.text || ""
            ).trim();

        if (!text) {

            alert(
                "لم يتم العثور على نص داخل الصورة"
            );

            return;

        }

        const response =
            await fetch(
                "/api/translate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        text
                    })
                }
            );

        const data =
            await response.json();

        document.getElementById(
            "selectedText"
        ).value =
            text;

        document.getElementById(
            "selectedTranslation"
        ).value =
            data.translation || "";

        document
            .getElementById(
                "translationModal"
            )
            .classList
            .remove(
                "hidden"
            );

        updateProgress(100);

    }
    catch (error) {

        console.error(error);

        alert(
            "فشل ترجمة الصورة"
        );

    }

}
// async function extractVocabulary(text) {

//     const words =
//         text.match(/[A-Za-z]+/g) || [];

//     const uniqueWords =
//         [...new Set(
//             words.map(
//                 word => word.toLowerCase()
//             )
//         )]
//         .filter(
//             word =>
//                 word.length > 4
//         );

//     for (const word of uniqueWords) {

//         try {

//             await fetch(
//                 "/api/vocabulary",
//                 {
//                     method: "POST",

//                     headers: {
//                         "Content-Type":
//                             "application/json"
//                     },

//                     body: JSON.stringify({
//                         word,
//                         page: currentPage
//                     })
//                 }
//             );

//         }
//         catch (error) {

//             console.error(
//                 "Vocabulary Error:",
//                 error
//             );

//         }

//     }

// }
async function loadVocabulary() {

    const response =
        await fetch(
            "/api/vocabulary"
        );

    const words =
        await response.json();

    const container =
        document.getElementById(
            "vocabularyList"
        );

    container.innerHTML = `
<table class="vocab-table">

<thead>
<tr>
<th>#</th>
<th>الكلمة</th>
<th>الترجمة</th>
<th>⭐</th>
<th>حذف</th>
</tr>
</thead>

<tbody>

${words.map((item,index)=>`

<tr>

<td>${index+1}</td>

<td>${item.word}</td>

<td>${item.meaning || "-"}</td>

<td>
<button
onclick="toggleFavorite(${item.id})"
>
${item.favorite ? "⭐" : "☆"}
</button>
</td>

<td>
<button
onclick="deleteWord(${item.id})"
>
🗑️
</button>
</td>

</tr>

`).join("")}

</tbody>

</table>
`;

}
