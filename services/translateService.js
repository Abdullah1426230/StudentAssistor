const translate =
    require(
        "google-translate-api-x"
    );

async function translateText(text) {

    const result =
        await translate(
            text,
            {
                to: "ar"
            }
        );

    return result.text;

}

module.exports = {
    translateText
};