async function getCache(pageId) {

    try {

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
    catch (error) {

        console.error(
            "Cache Read Error:",
            error
        );

        return {
            exists: false
        };

    }

}

async function saveCache(
    pageId,
    translation
) {

    try {

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

        return true;

    }
    catch (error) {

        console.error(
            "Cache Save Error:",
            error
        );

        return false;

    }

}

async function deleteCache(
    pageId
) {

    try {

        await fetch(
            "/api/cache/delete",
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

        return true;

    }
    catch (error) {

        console.error(
            "Cache Delete Error:",
            error
        );

        return false;

    }

}

async function clearAllCache() {

    try {

        await fetch(
            "/api/cache/clear",
            {
                method: "POST"
            }
        );

        return true;

    }
    catch (error) {

        console.error(
            "Clear Cache Error:",
            error
        );

        return false;

    }

}

async function cacheExists(
    pageId
) {

    const result =
        await getCache(pageId);

    return result.exists === true;

}