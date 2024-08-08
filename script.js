const images = [
    "kuva1.avif", "kuva2.avif", "kuva3.avif", "kuva4.avif",
    "kuva5.avif", "kuva6.avif", "kuva7.avif", "kuva8.avif",
    "kuva9.avif", "kuva10.avif", "kuva11.avif", "kuva12.avif"
];

const audioFiles = {
    "kuva1.avif": "kuva1.mp3",
    "kuva2.avif": "kuva2.mp3",
    "kuva3.avif": "kuva3.mp3",
    "kuva4.avif": "kuva4.mp3",
    "kuva5.avif": "kuva5.mp3",
    "kuva6.avif": "kuva6.mp3",
    "kuva7.avif": "kuva7.mp3",
    "kuva8.avif": "kuva8.mp3",
    "kuva9.avif": "kuva9.mp3",
    "kuva10.avif": "kuva10.mp3",
    "kuva11.avif": "kuva11.mp3",
    "kuva12.avif": "kuva12.mp3"
};

let selectedImages = [];
let gameBoard = document.getElementById('game-board');
let restartButton = document.getElementById('restart-button');
let congratulationsText = document.getElementById('congratulations');
let firstCard, secondCard;
let lockBoard = false;
let matchedPairs = 0;
let currentLevel = 1;

const BOARD_VERTICAL_OFFSET = 0.1;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createBoard(columns, rows) {
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gameBoard.style.gap = '10px';
    gameBoard.innerHTML = '';
    congratulationsText.style.display = 'none';
    restartButton.style.display = 'none';
    matchedPairs = 0;

    selectedImages.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;

        const img = document.createElement('img');
        img.src = image;
        card.appendChild(img);

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });

    resizeCards();
}

function resizeCards() {
    const maxWidth = 800;
    const maxHeight = window.innerHeight * 0.7;
    
    let gameBoardWidth = Math.min(window.innerWidth * 0.9, maxWidth);
    let gameBoardHeight = maxHeight;
    
    gameBoard.style.width = `${gameBoardWidth}px`;
    gameBoard.style.height = `${gameBoardHeight}px`;

    const columns = getComputedStyle(gameBoard).gridTemplateColumns.split(' ').length;
    const rows = getComputedStyle(gameBoard).gridTemplateRows.split(' ').length;

    const gapSize = 10;
    const availableWidth = gameBoardWidth - (gapSize * (columns - 1));
    const availableHeight = gameBoardHeight - (gapSize * (rows - 1));
    
    const cardWidth = availableWidth / columns;
    const cardHeight = availableHeight / rows;
    
    let cardSize = Math.min(cardWidth, cardHeight);

    document.documentElement.style.setProperty('--card-size', `${cardSize}px`);
}

function adjustGameBoardSize() {
    const columns = getComputedStyle(gameBoard).gridTemplateColumns.split(' ').length;
    const rows = getComputedStyle(gameBoard).gridTemplateRows.split(' ').length;

    const cardSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-size'));
    const gapSize = 10;

    const newWidth = (cardSize * columns) + (gapSize * (columns - 1));
    const newHeight = (cardSize * rows) + (gapSize * (rows - 1));

    gameBoard.style.width = `${newWidth}px`;
    gameBoard.style.height = `${newHeight}px`;
}

function centerGameBoard() {
    const header = document.querySelector('h1');
    const headerHeight = header.offsetHeight;
    const gameBoardHeight = gameBoard.offsetHeight;
    const windowHeight = window.innerHeight;

    const verticalOffset = windowHeight * BOARD_VERTICAL_OFFSET;

    const topMargin = Math.max(
        ((windowHeight - headerHeight - gameBoardHeight) / 2) - verticalOffset, 
        20
    );

    gameBoard.style.marginTop = `${topMargin + headerHeight}px`;
}

function positionFeedback() {
    const feedbackContainer = document.getElementById('feedback-container');
    const gameBoardRect = gameBoard.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    feedbackContainer.style.position = 'absolute';
    feedbackContainer.style.left = `${gameBoardRect.left}px`;
    feedbackContainer.style.width = `${gameBoardRect.width}px`;
    
    const feedbackTop = Math.min(gameBoardRect.bottom + 20, windowHeight - feedbackContainer.offsetHeight - 20);
    feedbackContainer.style.top = `${feedbackTop}px`;

    congratulationsText.style.textAlign = 'center';
}

function adjustLayout() {
    resizeCards();
    adjustGameBoardSize();
    centerGameBoard();
    positionFeedback();
}

function startGame(level) {
    currentLevel = level;
    let pairs, columns, rows;
    switch(level) {
        case 1:
            pairs = 3;
            columns = 3;
            rows = 2;
            break;
        case 2:
            pairs = 6;
            columns = 4;
            rows = 3;
            break;
        case 3:
            pairs = 10;
            columns = 5;
            rows = 4;
            break;
    }
    selectedImages = shuffle(images).slice(0, pairs);
    selectedImages = shuffle([...selectedImages, ...selectedImages]);
    createBoard(columns, rows);
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    congratulationsText.style.display = 'none';
    restartButton.style.display = 'none';
    
    adjustLayout();
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');
    playSound(this.dataset.image);

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.image === secondCard.dataset.image;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    matchedPairs++;
    if (matchedPairs === selectedImages.length / 2) {
        setTimeout(() => {
            congratulationsText.style.display = 'block';
            restartButton.style.display = 'block';
            adjustLayout();
        }, 500);
    }

    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function playSound(image) {
    let audio = new Audio(audioFiles[image]);
    audio.play();
}

function restartGame() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
}

window.addEventListener('resize', adjustLayout);
window.addEventListener('load', adjustLayout);