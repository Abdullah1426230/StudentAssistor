async function translatePage(
    text,
    pageId
) {

    try {

        const cached =
            await getCachedTranslation(
                pageId
            );

        if (
            cached &&
            cached.exists
        ) {

            return cached.translation;

        }

        const chunks =
            splitText(
                text,
                800
            );

        let finalTranslation =
            "";

        for (
            let i = 0;
            i < chunks.length;
            i++
        ) {

            const translated =
                await translateChunk(
                    chunks[i]
                );

            finalTranslation +=
                translated + "\n\n";

            const progress =
                Math.round(
                    (
                        (i + 1)
                        /
                        chunks.length
                    ) * 100
                );

            updateProgress(
                progress
            );

        }

        await saveTranslationCache(
            pageId,
            finalTranslation
        );

        return finalTranslation;

    }
    catch (error) {

        console.error(
            "Translation Error:",
            error
        );

        return "حدث خطأ أثناء الترجمة";

    }

}

function splitText(
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

// async function translateChunk(
//     text
// ) {

//     const response =
//         await fetch(
//             "/api/translate",
//             {
//                 method: "POST",

//                 headers: {
//                     "Content-Type":
//                         "application/json"
//                 },

//                 body: JSON.stringify({
//                     text
//                 })
//             }
//         );

//     const result =
//         await response.json();

//     if (!result.success) {

//         throw new Error(
//             result.error || "Translation Failed"
//         );

//     }

//     return result.translation;

// }

async function getCachedTranslation(
    pageId
) {

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

async function saveTranslationCache(
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

function updateProgress(progress) {

    const progressBar =
        document.getElementById("progressBar");

    const progressText =
        document.getElementById("progressValue");

    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;

    }

    if (progressText) {

        progressText.textContent =
            `${progress}%`;

    }

}
