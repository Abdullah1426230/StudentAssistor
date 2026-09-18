const progressBar =
    document.getElementById(
        "progressBar"
    );

const progressValue =
    document.getElementById(
        "progressValue"
    );

function setProgress(percent) {

    percent = Math.max(
        0,
        Math.min(100, percent)
    );

    if (progressBar) {

        progressBar.style.width =
            `${percent}%`;

    }

    if (progressValue) {

        progressValue.textContent =
            `${percent}%`;

    }

}

function resetProgress() {

    setProgress(0);

}

function completeProgress() {

    setProgress(100);

}

function increaseProgress(value) {

    const current =
        parseInt(
            progressValue.textContent
                .replace("%", "")
        ) || 0;

    setProgress(
        current + value
    );

}

window.setProgress =
    setProgress;

window.resetProgress =
    resetProgress;

window.completeProgress =
    completeProgress;

window.increaseProgress =
    increaseProgress;

console.log(
    "Progress Module Loaded"
);