const vocabularyButtonOne =
    document.getElementById(
        "openVocabularyBtn"
    );

const closeVocabularyButtonOne =
    document.getElementById(
        "closeVocabularyBtn"
    );

const vocabularyModalOne =
    document.getElementById(
        "vocabularyModal"
    );

const vocabularyListOne =
    document.getElementById(
        "vocabularyList"
    );

// vocabularyButtonOne.addEventListener(
//     "click",
//     openVocabulary
// );

closeVocabularyButtonOne.addEventListener(
    "click",
    closeVocabulary
);

// async function openVocabulary() {

//     vocabularyModalOne.classList.remove(
//         "hidden"
//     );

//     await loadVocabulary();

// }

function closeVocabulary() {

    vocabularyModalOne.classList.add(
        "hidden"
    );

}

// async function loadVocabulary() {

//     try {

//         const response =
//             await fetch(
//                 "/api/vocabulary"
//             );

//         const words =
//             await response.json();

//         renderVocabulary(
//             words
//         );

//     }
//     catch (error) {

//         console.error(
//             error
//         );

//     }

// }

// function renderVocabulary(words) {

//     vocabularyListOne.innerHTML = "";

//     if (!words.length) {

//         vocabularyListOne.innerHTML = `
//             <p>
//                 لا توجد مفردات حالياً
//             </p>
//         `;

//         return;

//     }

//     words.forEach(word => {

//         const item =
//             document.createElement(
//                 "div"
//             );

//         item.className =
//             "vocabulary-item";

//         item.innerHTML = `
//             <div class="word">
//                 ${word.word}
//             </div>
//         `;

//         vocabularyListOne.appendChild(
//             item
//         );

//     });

// }



console.log(
    "Vocabulary Module Loaded"
);