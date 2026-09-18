function splitText(text, chunkSize = 800) {

    if (!text) {
        return [];
    }

    const chunks = [];

    let start = 0;

    while (start < text.length) {

        chunks.push(
            text.slice(
                start,
                start + chunkSize
            )
        );

        start += chunkSize;
    }

    return chunks;
}

module.exports = {
    splitText
};