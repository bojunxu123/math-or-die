//declare all gun audio variables
const cockingAudio = new Audio('cocking.mp3');
const gunshotAudio = new Audio('gunFire.mp3');
const failedShotAudio = new Audio('failedFire.mp3');

let correctAnswer = null;
let timerInterval = null; // Store timer interval globally
let score = 0;
let rouletteInProgress = false;

function generateRandomEquation() {
    const operators = ['+', '-', '*', '/'];
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let equation;
    switch (operator) {
        case '+':
            equation = `${num1} + ${num2}`;
            correctAnswer = num1 + num2;
            break;
        case '-':
            equation = `${num1} - ${num2}`;
            correctAnswer = num1 - num2;
            break;
        case '*':
            equation = `${num1} * ${num2}`;
            correctAnswer = num1 * num2;
            break;
        case '/':
            equation = `${num1} / ${num2}`;
            correctAnswer = Math.round(num1 / num2);
            break;
    }
    return equation;
}

// Display the math question to the user
function showEquation() {
    let actualEquation = generateRandomEquation();
    let questionP = document.getElementById('question');
    if (questionP) {
        questionP.textContent = actualEquation;
    }
}

function checkAnswer() {
    const answerInput = document.getElementById('answer');
    const inputValue = answerInput.value.trim();

    // If input is blank, treat as incorrect
    if (inputValue === "") {
        clearInterval(timerInterval);
        localStorage.setItem('score', score);
        playRoulette();
        return;
    }

    let userAnswer = Number(inputValue);
    if (userAnswer === correctAnswer) {
        clearInterval(timerInterval); // Pause timer
        score += 1;
        document.getElementById('score').textContent = score;
        document.getElementById('result').textContent = "Correct!";
        setTimeout(() => {
            document.getElementById('result').textContent = "";
            showEquation();
            answerInput.value = '';
            answerInput.focus();
            startTimer(3); // Restart timer for next question
        }, 1200); // 1.2 seconds pause
    } else {
        clearInterval(timerInterval);
        localStorage.setItem('score', score);
        playRoulette();
    }
}

function startTimer(duration) {
    const timerBar = document.getElementById('timer-bar');
    timerBar.innerHTML = ""; // Clear previous timer
    const timerFill = document.createElement('div');
    timerBar.appendChild(timerFill);

    // Set the initial width of the timer fill
    timerFill.style.width = '100%';

    // Calculate the decrement per interval
    const interval = 10; // Update every 10ms
    const decrement = 100 / (duration * 1000 / interval);

    let currentWidth = 100;

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        currentWidth -= decrement;
        if (currentWidth <= 0) {
            currentWidth = 0;
            clearInterval(timerInterval);
            playRoulette();
        }
        timerFill.style.width = currentWidth + '%';
    }, interval);
}

function showSection(sectionId) {
    const sections = ['main-menu', 'game-section', 'tutorial-section', 'roulette-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === sectionId) ? 'block' : 'none';
    });
}

function playRoulette() {
    if (rouletteInProgress) return;
    rouletteInProgress = true;

    showSection('roulette-section');
    document.getElementById('fire').style.display = 'none';
    document.getElementById('play-again').style.display = 'none';

    // Hide final score by default
    const finalScoreDiv = document.getElementById('final-score');
    finalScoreDiv.style.display = 'none';

    const nextQuestionBtn = document.getElementById('next-question');
    nextQuestionBtn.style.display = 'none';
    nextQuestionBtn.disabled = true;

    cockingAudio.currentTime = 0;
    cockingAudio.play();

    setTimeout(function() {
        if (Math.floor(Math.random() * 3) === 0) {
            // Player dies
            document.getElementById('fire').style.display = 'block';
            document.getElementById('play-again').style.display = 'block';
            // Show final score
            finalScoreDiv.textContent = `Final Score: ${score}`;
            finalScoreDiv.style.display = 'block';
            gunshotAudio.currentTime = 0;
            gunshotAudio.play();
            gunshotAudio.onended = function() {
                rouletteInProgress = false;
            };
        } else {
            // Player survives
            finalScoreDiv.style.display = 'none';
            failedShotAudio.currentTime = 0;
            failedShotAudio.play();
            failedShotAudio.onended = function() {
                nextQuestionBtn.style.display = 'block';
                nextQuestionBtn.disabled = false;
                rouletteInProgress = false;
            };
        }
    }, 1000);
}

function startGame() {
    score = 0; // Reset score to zero
    document.getElementById('score').textContent = score; // Update score display
    document.getElementById('answer').value = '';
    document.getElementById('result').textContent = '';
    showSection('game-section');
    showEquation();
    startTimer(3);
    document.getElementById('answer').focus();
}


// Start the timer when the page loads
window.onload = function () {
    showSection('main-menu');
    // Set up button handlers
    document.getElementById('submit-button').onclick = checkAnswer;
    document.getElementById('answer').onkeydown = function (e) {
        if (e.key === "Enter") checkAnswer();
    };
};

function nextQuestionAfterRoulette() {
    showSection('game-section');
    showEquation();
    startTimer(3);
    document.getElementById('answer').value = '';
    document.getElementById('result').textContent = '';
    document.getElementById('answer').focus();
}