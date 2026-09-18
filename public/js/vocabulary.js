const vocabularyButton =
    document.getElementById(
        "openVocabularyBtn"
    );

const closeVocabularyButton =
    document.getElementById(
        "closeVocabularyBtn"
    );

const vocabularyModal =
    document.getElementById(
        "vocabularyModal"
    );

const vocabularyList =
    document.getElementById(
        "vocabularyList"
    );

const addVocabularyBtn =
    document.getElementById(
        "addVocabularyBtn"
    );

vocabularyButton.addEventListener(
    "click",
    openVocabulary
);

closeVocabularyButton.addEventListener(
    "click",
    closeVocabulary
);

addVocabularyBtn.addEventListener(
    "click",
    addVocabulary
);
document
    .getElementById(
        "importVocabularyBtn"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "importVocabularyInput"
                )
                .click();

        }
    );

document
    .getElementById(
        "importVocabularyInput"
    )
    .addEventListener(
        "change",
        importVocabulary
    );

async function importVocabulary(
    event
) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    const text =
        await file.text();

    const words =
        JSON.parse(text);

    for (
        const item of words
    ) {

        await fetch(
            "/api/vocabulary",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    item
                )
            }
        );

    }

    await loadVocabulary();

}

async function openVocabulary() {

    vocabularyModal.classList.remove(
        "hidden"
    );

    await loadVocabulary();

}

function closeVocabulary() {

    vocabularyModal.classList.add(
        "hidden"
    );

}

async function loadVocabulary() {

    try {

        const response =
            await fetch(
                "/api/vocabulary"
            );

        const words =
            await response.json();

        renderVocabulary(
            words
        );

    }
    catch (error) {

        console.error(
            error
        );

    }

}

function renderVocabulary(words) {

    if (!words.length) {

        vocabularyList.innerHTML = `
            <p>
                لا توجد مفردات حالياً
            </p>
        `;

        return;

    }

    vocabularyList.innerHTML = `
        <table class="vocab-table">

            <thead>
                <tr>
                    <th>#</th>
                    <th>الكلمة</th>
                    <th>الترجمة</th>
                    <th>⭐</th>
                    <th>🗑️</th>
                </tr>
            </thead>

            <tbody>

                ${words.map((item, index) => `

                    <tr>

                        <td>${index + 1}</td>

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

async function addVocabulary() {

    const word =
        document
            .getElementById(
                "newWord"
            )
            .value
            .trim();

    const meaning =
        document
            .getElementById(
                "newMeaning"
            )
            .value
            .trim();

    if (!word || !meaning) {

        alert(
            "أدخل الكلمة والترجمة"
        );

        return;

    }

    try {

        await saveWord(
            word,
            meaning
        );

        document.getElementById(
            "newWord"
        ).value = "";

        document.getElementById(
            "newMeaning"
        ).value = "";

        await loadVocabulary();

    }
    catch (error) {

        console.error(
            error
        );

        alert(
            "فشل حفظ المفردة"
        );

    }

}

async function saveWord(
    word,
    meaning
) {

    const item = {

        id:
            Date.now(),

        word,

        meaning,

        favorite:
            false,

        createdAt:
            new Date()
                .toISOString(),

        updatedAt:
            new Date()
                .toISOString()

    };

    await fetch(
        "/api/vocabulary",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(
                item
            )

        }
    );

}

console.log(
    "Vocabulary Module Loaded"
);
async function deleteWord(id) {

    try {

        await fetch(
            `/api/vocabulary/${id}`,
            {
                method: "DELETE"
            }
        );

        await loadVocabulary();

    }
    catch (error) {

        console.error(error);

    }

}

window.deleteWord =
    deleteWord;

window.deleteWord = deleteWord;
async function toggleFavorite(id) {

    try {

        await fetch(
            `/api/vocabulary/favorite/${id}`,
            {
                method: "PUT"
            }
        );

        await loadVocabulary();

    }
    catch (error) {

        console.error(error);

    }

}