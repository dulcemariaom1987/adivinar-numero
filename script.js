let gameState = {
    secretNumber: 0,
    attempts: 0,
    difficulty: 'medium',
    maxNumber: 100,
    guesses: [],
    record: null
};

const difficulties = {
    easy: { max: 50, name: 'Fácil' },
    medium: { max: 100, name: 'Medio' },
    hard: { max: 500, name: 'Difícil' }
};

function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    event.target.closest('.difficulty-btn').classList.add('selected');
}

function startGame() {
    const diff = difficulties[gameState.difficulty];
    gameState.maxNumber = diff.max;
    gameState.secretNumber = Math.floor(Math.random() * diff.max) + 1;
    gameState.attempts = 0;
    gameState.guesses = [];
    
    loadRecord();
    
    document.getElementById('rangeDisplay').textContent = '1-' + diff.max;
    document.getElementById('attemptsDisplay').textContent = '0';
    document.getElementById('guessInput').setAttribute('max', diff.max);
    document.getElementById('guessInput').value = '';
    document.getElementById('guessesHistory').innerHTML = '';
    document.getElementById('hintText').textContent = '¡Adivina el número secreto!';
    
    resetTemperatureBar();
    
    showScreen('gameScreen');
    document.getElementById('guessInput').focus();
}

function showScreen(screenId) {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById(screenId).classList.remove('hidden');
}

function makeGuess() {
    const input = document.getElementById('guessInput');
    const guess = parseInt(input.value);
    
    if (!guess || guess < 1 || guess > gameState.maxNumber) {
        showHint('⚠️ Ingresa un número válido entre 1 y ' + gameState.maxNumber, 'warning');
        return;
    }
    
    if (gameState.guesses.includes(guess)) {
        showHint('🔄 Ya intentaste ese número', 'warning');
        return;
    }
    
    gameState.attempts++;
    gameState.guesses.push(guess);
    document.getElementById('attemptsDisplay').textContent = gameState.attempts;
    
    addGuessToHistory(guess);
    
    if (guess === gameState.secretNumber) {
        winGame();
    } else if (guess < gameState.secretNumber) {
        showHint('📈 ¡Más alto! El número es mayor', 'higher');
        updateTemperature(guess);
    } else {
        showHint('📉 ¡Más bajo! El número es menor', 'lower');
        updateTemperature(guess);
    }
    
    input.value = '';
    input.focus();
}

function addGuessToHistory(guess) {
    const history = document.getElementById('guessesHistory');
    const chip = document.createElement('div');
    chip.className = 'guess-chip';
    
    if (guess < gameState.secretNumber) {
        chip.classList.add('higher');
        chip.innerHTML = guess + ' ↑';
    } else {
        chip.classList.add('lower');
        chip.innerHTML = guess + ' ↓';
    }
    
    history.appendChild(chip);
}

function showHint(message, type) {
    const hintText = document.getElementById('hintText');
    hintText.textContent = message;
    hintText.style.animation = 'none';
    setTimeout(() => {
        hintText.style.animation = 'pulse 0.5s ease-out';
    }, 10);
}

function updateTemperature(guess) {
    const difference = Math.abs(guess - gameState.secretNumber);
    const maxDiff = gameState.maxNumber;
    const proximity = 1 - (difference / maxDiff);
    const percentage = proximity * 100;
    
    const tempFill = document.getElementById('tempFill');
    const tempEmoji = document.getElementById('tempEmoji');
    const tempText = document.getElementById('tempText');
    
    tempFill.style.width = percentage + '%';
    
    if (percentage > 80) {
        tempFill.style.background = 'linear-gradient(90deg, #ff6b6b 0%, #ee5a6f 100%)';
        tempEmoji.textContent = '🔥';
        tempText.textContent = '¡Hirviendo!';
    } else if (percentage > 60) {
        tempFill.style.background = 'linear-gradient(90deg, #ff9f43 0%, #ee5a6f 100%)';
        tempEmoji.textContent = '♨️';
        tempText.textContent = 'Caliente';
    } else if (percentage > 40) {
        tempFill.style.background = 'linear-gradient(90deg, #feca57 0%, #ff9f43 100%)';
        tempEmoji.textContent = '☀️';
        tempText.textContent = 'Tibio';
    } else if (percentage > 20) {
        tempFill.style.background = 'linear-gradient(90deg, #48dbfb 0%, #0abde3 100%)';
        tempEmoji.textContent = '❄️';
        tempText.textContent = 'Frío';
    } else {
        tempFill.style.background = 'linear-gradient(90deg, #00d2d3 0%, #48dbfb 100%)';
        tempEmoji.textContent = '🧊';
        tempText.textContent = 'Congelado';
    }
}

function resetTemperatureBar() {
    const tempFill = document.getElementById('tempFill');
    const tempEmoji = document.getElementById('tempEmoji');
    const tempText = document.getElementById('tempText');
    
    tempFill.style.width = '0%';
    tempFill.style.background = 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)';
    tempEmoji.textContent = '❄️';
    tempText.textContent = 'Frío';
}

function winGame() {
    document.getElementById('secretDisplay').textContent = gameState.secretNumber;
    document.getElementById('winNumber').textContent = gameState.secretNumber;
    document.getElementById('finalAttempts').textContent = gameState.attempts;
    document.getElementById('finalDifficulty').textContent = difficulties[gameState.difficulty].name;
    
    let message = '';
    if (gameState.attempts === 1) {
        message = '🎯 ¡INCREÍBLE! ¡Lo adivinaste al primer intento!';
    } else if (gameState.attempts <= 3) {
        message = '🌟 ¡Excelente! Muy pocos intentos';
    } else if (gameState.attempts <= 7) {
        message = '👏 ¡Muy bien! Buen trabajo';
    } else if (gameState.attempts <= 15) {
        message = '✨ ¡Bien hecho! Lo lograste';
    } else {
        message = '🎉 ¡Lo conseguiste! Perseverancia ganadora';
    }
    
    document.getElementById('winMessageDetail').textContent = message;
    
    saveRecord();
    createConfetti();
    
    showScreen('winScreen');
}

function createConfetti() {
    const confetti = document.getElementById('confetti');
    confetti.innerHTML = '';
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8', '#f7dc6f'];
    
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.style.position = 'absolute';
        piece.style.width = '10px';
        piece.style.height = '10px';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = '-10px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        piece.style.animation = 'fall ' + (Math.random() * 3 + 2) + 's linear';
        piece.style.opacity = Math.random();
        confetti.appendChild(piece);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}

function restartGame() {
    startGame();
}

function goToStart() {
    showScreen('startScreen');
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        makeGuess();
    }
}

function saveRecord() {
    const key = 'record_' + gameState.difficulty;
    const currentRecord = localStorage.getItem(key);
    
    if (!currentRecord || gameState.attempts < parseInt(currentRecord)) {
        localStorage.setItem(key, gameState.attempts);
    }
}

function loadRecord() {
    const key = 'record_' + gameState.difficulty;
    const record = localStorage.getItem(key);
    
    if (record) {
        document.getElementById('recordDisplay').textContent = record;
    } else {
        document.getElementById('recordDisplay').textContent = '-';
    }
}
