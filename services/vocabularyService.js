const fs = require("fs-extra");
const path = require("path");

const VOCABULARY_FILE = path.join(
    __dirname,
    "../data/vocabulary.json"
);

async function ensureVocabularyFile() {
    if (!(await fs.pathExists(VOCABULARY_FILE))) {
        await fs.writeJson(VOCABULARY_FILE, []);
    }
}

async function getVocabulary() {
    await ensureVocabularyFile();
    return await fs.readJson(VOCABULARY_FILE);
}

async function saveVocabulary(vocabulary) {
    await fs.writeJson(
        VOCABULARY_FILE,
        vocabulary,
        { spaces: 2 }
    );
}

function extractWords(text) {
    return text
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .map(word => word.trim())
        .filter(word => word.length > 2);
}

async function addWords(words) {

    const vocabulary =
        await getVocabulary();

    const existingWords =
        new Set(
            vocabulary.map(
                item =>
                    item.word.toLowerCase()
            )
        );

    let addedCount = 0;

    for (const word of words) {

        const normalized =
            word.toLowerCase();

        if (
            !existingWords.has(
                normalized
            )
        ) {

            vocabulary.push({
                word,
                createdAt:
                    new Date()
                        .toISOString()
            });

            existingWords.add(
                normalized
            );

            addedCount++;
        }
    }

    await saveVocabulary(
        vocabulary
    );

    return addedCount;
}

async function addText(text) {

    const words =
        extractWords(text);

    const uniqueWords =
        [...new Set(words)];

    const added =
        await addWords(
            uniqueWords
        );

    return {
        totalWords:
            uniqueWords.length,
        addedWords:
            added
    };
}

async function searchWord(word) {

    const vocabulary =
        await getVocabulary();

    return (
        vocabulary.find(
            item =>
                item.word
                    .toLowerCase() ===
                word.toLowerCase()
        ) || null
    );
}

async function clearVocabulary() {
    await saveVocabulary([]);
}

async function addWord(
    word,
    meaning = ""
) {

    const vocabulary =
        await getVocabulary();

    vocabulary.push({

        id: Date.now(),

        word,

        meaning,

        favorite: false

    });

    await saveVocabulary(
        vocabulary
    );

}

module.exports = {
    extractWords,
    addWords,
    addText,
    getVocabulary,
    searchWord,
    clearVocabulary,
    addWord
};