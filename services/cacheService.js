const fs = require("fs-extra");
const path = require("path");

const CACHE_DIR = path.join(
    __dirname,
    "..",
    "cache",
    "translations"
);

async function ensureCacheDir() {
    await fs.ensureDir(CACHE_DIR);
}

function getCacheFilePath(bookId, pageNumber) {
    return path.join(
        CACHE_DIR,
        `${bookId}_${pageNumber}.json`
    );
}

async function hasCache(bookId, pageNumber) {
    await ensureCacheDir();

    const filePath = getCacheFilePath(
        bookId,
        pageNumber
    );

    return fs.pathExists(filePath);
}

async function getCache(bookId, pageNumber) {
    await ensureCacheDir();

    const filePath = getCacheFilePath(
        bookId,
        pageNumber
    );

    const exists = await fs.pathExists(
        filePath
    );

    if (!exists) {
        return null;
    }

    return fs.readJson(filePath);
}

async function saveCache(
    bookId,
    pageNumber,
    translatedText
) {
    await ensureCacheDir();

    const filePath = getCacheFilePath(
        bookId,
        pageNumber
    );

    await fs.writeJson(
        filePath,
        {
            bookId,
            pageNumber,
            translatedText,
            createdAt: new Date().toISOString()
        },
        {
            spaces: 2
        }
    );
}

async function deleteCache(
    bookId,
    pageNumber
) {
    const filePath = getCacheFilePath(
        bookId,
        pageNumber
    );

    if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        return true;
    }

    return false;
}

async function clearCache() {
    await ensureCacheDir();

    const files = await fs.readdir(
        CACHE_DIR
    );

    for (const file of files) {
        await fs.remove(
            path.join(CACHE_DIR, file)
        );
    }

    return true;
}

module.exports = {
    hasCache,
    getCache,
    saveCache,
    deleteCache,
    clearCache
};