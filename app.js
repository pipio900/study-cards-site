let cards = [];
let current = 0;
let mode = "";
let flipped = false;
let correctAnswers = 0;

// Load cards when site opens

window.onload = function() {
    loadCards();
    renderCardsList();
};

function saveCards() {
    localStorage.setItem("studyCards", JSON.stringify(cards));
}

function loadCards() {
    let saved = localStorage.getItem("studyCards");

    if (saved) {
        try {
            cards = JSON.parse(saved);
        } catch {
            cards = [];
        }
    }
}

function addCard() {
    let q = document.getElementById("question").value.trim();
    let a = document.getElementById("answer").value.trim();

    if (!q || !a) {
        return;
    }

    cards.push({question: q, answer: a});

    saveCards();
    renderCardsList();

    document.getElementById("question").value = "";
    document.getElementById("answer").value = "";
}

function deleteCard(index) {
    cards.splice(index, 1);

    saveCards();
    renderCardsList();

    exitGame();
}

function renderCardsList() {
    let list = document.getElementById("cardsList");
    list.innerHTML = "";

    cards.forEach((c, i) => {
        let item = document.createElement("div");
        item.className = "card-item";

        item.innerHTML =
            "<strong>" + c.question + "</strong> - " + c.answer +
            "<button class='delete-btn' onclick='deleteCard(" + i + ")'>Delete</button>";

        list.appendChild(item);
    });

    if (cards.length === 0) {
        list.innerHTML = "<p>No cards created yet</p>";
    }
}

function setMode(m) {
    mode = m;
    current = 0;
    flipped = false;
    correctAnswers = 0;

    document.body.classList.add("game-active");

    render();
}

function exitGame() {
    mode = "";
    document.body.classList.remove("game-active");
}

function render() {
    if (mode === "cards") {
        renderFlashcard();
    } else if (mode === "quiz") {
        renderQuiz();
    } else {
        renderCardsList();
    }
}

function renderFlashcard() {
    let area = document.getElementById("gameArea");
    area.innerHTML = "";

    if (cards.length === 0) {
        return;
    }

    let cardDiv = document.createElement("div");
    cardDiv.className = "card";

    if (flipped) {
        cardDiv.classList.add("flip");
    }

    cardDiv.onclick = () => {
        flipped = !flipped;
        cardDiv.classList.toggle("flip");
        renderFlashcard();
    };

    cardDiv.innerHTML = flipped
        ? "<h2>" + cards[current].answer + "</h2>"
        : "<h2>" + cards[current].question + "</h2>";

    area.appendChild(cardDiv);

    let nav = document.createElement("div");
    nav.innerHTML = `
        <button onclick="prevCard()">Previous</button>
        <button onclick="nextCard()">Next</button>
    `;

    area.appendChild(nav);
}

function nextCard() {
    if (cards.length === 0) return;

    current++;
    if (current >= cards.length) current = 0;

    flipped = false;
    render();
}

function prevCard() {
    if (cards.length === 0) return;

    current--;
    if (current < 0) current = cards.length - 1;

    flipped = false;
    render();
}

function renderQuiz() {
    let area = document.getElementById("gameArea");
    area.innerHTML = "";

    if (cards.length < 4) {
        return;
    }

    let questionText = cards[current].question;
    let correct = cards[current].answer;

    let options = [correct];

    while (options.length < 4) {
        let rand = cards[Math.floor(Math.random() * cards.length)].answer;

        if (!options.includes(rand)) {
            options.push(rand);
        }
    }

    options.sort(() => Math.random() - 0.5);

    let title = document.createElement("h2");
    title.innerHTML = questionText;
    area.appendChild(title);

    options.forEach(optText => {
        let opt = document.createElement("div");
        opt.className = "option";
        opt.innerHTML = optText;

        opt.onclick = () => checkOptionColor(opt, optText, correct);

        area.appendChild(opt);
    });

    document.getElementById("quizScore").innerHTML =
        "Correct answers: " + correctAnswers;
}

function checkOptionColor(element, selected, correct) {

    let all = document.querySelectorAll(".option");
    all.forEach(o => o.style.pointerEvents = "none");

    if (selected === correct) {
        element.classList.add("correct");
        correctAnswers++;

        saveCards();

        setTimeout(() => {
            nextCard();
        }, 800);

    } else {
        element.classList.add("wrong");

        setTimeout(() => {
            all.forEach(o => {
                o.style.pointerEvents = "auto";
                o.classList.remove("wrong");
            });
        }, 800);
    }
}

