// function convertPdfToImages(
//     pdfPath,
//     pageNumber
// ) {

//     return new Promise(
//         (resolve, reject) => {

//             const outputDir =
//                 path.join(
//                     __dirname,
//                     "public",
//                     "pages"
//                 );

//             if (
//                 fs.existsSync(
//                     outputDir
//                 )
//             ) {

//                 fs.mkdirSync(
//                     outputDir,
//                     {
//                         recursive: true
//                     }
//                 );

//             }

//             const startPage =
//                 Math.max(
//                     1,
//                     pageNumber - 5
//                 );

//             const endPage =
//                 pageNumber + 5;

//             const command =
//                 `"C:\\poppler\\Library\\bin\\pdftoppm.exe" \
//                 -png \
//                 -r 200 \
//                 -f ${startPage} \
//                 -l ${endPage} \
//                 "${pdfPath}" \
//                 "${outputDir}\\page"`;

//             console.log(command);

//             exec(
//                 command,
//                 (error) => {

//                     if (error) {

//                         reject(error);

//                         return;

//                     }

//                     resolve();

//                 }
//             );

//         }
//     );

// }

async function convertPdfToImages(
    pdfPath,
    currentPage
) {

    const outputDir =
        path.join(
            __dirname,
            "public",
            "pages"
        );

    await fs.ensureDir(
        outputDir
    );

    await fs.emptyDir(
        outputDir
    );

    const startPage =
        Math.max(
            1,
            currentPage - 5
        );

    const endPage =
        currentPage + 5;

    return new Promise(
        (resolve, reject) => {

            exec(
                `pdftoppm -png -f ${startPage} -l ${endPage} "${pdfPath}" "${outputDir}/page"`,
                (error) => {

                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();

                }
            );

        }
    );

}