//declare all gun audio variables
const cockingAudio = new Audio('cocking.mp3');
const gunshotAudio = new Audio('gunFire.mp3');
const failedShotAudio = new Audio('failedFire.mp3');

//declare the correct answer, the timer interval, the initial score, and whether the gun screen is in progress
let correctAnswer = null;
let timerInterval = null; 
let score = 0;
let rouletteInProgress = false;

//generates random equation as a string
function generateRandomEquation() {
    //declare an array of possible operators
    const operators = ['+', '-', '*', '/'];
    //generate random first and second numbers 1-10
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    //choose a random operator from the operators array
    const operator = operators[Math.floor(Math.random() * operators.length)];
    //declare the equation variable
    let equation;
    //for any possible operator chosen by line 20, generate an equation and the correct answer
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
            //note that the answer for any division problem will always be rounded to the nearest whole number
            correctAnswer = Math.round(num1 / num2);
            break;
    }
    //return the equation in the form of a string
    return equation;
}

//display the math question to the user
function showEquation() {
    //generate an actual equation that will be displayed to the user
    let actualEquation = generateRandomEquation();
    //find the question element in the webpage
    let questionP = document.getElementById('question');
    //if found, set the content of the question as the equation previously determined
    if (questionP) {
        //set questionP's textContent as actualEquation
        questionP.textContent = actualEquation;
    }
}

//check the answer inputted by the user
function checkAnswer() {
    //get the answer inputted by the user
    const answerInput = document.getElementById('answer');
    //parse the value inputted by the user
    const inputValue = answerInput.value.trim();

    // If input is blank, treat as incorrect
    if (inputValue === "") {
        //clear the timer bar
        clearInterval(timerInterval);
        //temporarily store the user's score so it doesn't get reset
        localStorage.setItem('score', score);
        //make the user play gun roulette
        playRoulette();
        return;
    }
    
    let userAnswer = Number(inputValue);
    //if the user's answer is correct,
    if (userAnswer === correctAnswer) {
        //pause the timer
        clearInterval(timerInterval);
        //increase the score by 1
        score += 1;
        //display the user's current score
        document.getElementById('score').textContent = score;
        //congratulate the user
        document.getElementById('result').textContent = "Correct!";
        
        setTimeout(() => {
            document.getElementById('result').textContent = "";
            showEquation();
            answerInput.value = '';
            answerInput.focus();
            startTimer(3); // Restart timer for next question
        }, 1200); // 1.2 seconds pause
    } else {
        //pause the timer
        clearInterval(timerInterval);
        //temporarily store the score of the user so it doesn't get reset
        localStorage.setItem('score', score);
        //make the user play gun roulette
        playRoulette();
    }
}
//start a timer for how long the user has to answer the question that takes a duration
function startTimer(duration) {
    //declare the timer bar that will be displayed to the user
    const timerBar = document.getElementById('timer-bar');
    //clear the previous timer, if there was one
    timerBar.innerHTML = ""; // Clear previous timer
    //
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
