let perQuestionTime = 30;
let remainingTime = perQuestionTime;
let score = 0;
let questionCount = 0;
let correctAnswer = 0;
let timer;
const totalQuestions = 10;

const timeDisplay = document.getElementById("time");
const scoreDisplay = document.getElementById("score");
const questionDisplay = document.getElementById("question");
const resultDisplay = document.getElementById("result");
const finalDisplay = document.getElementById("final");
const answerInput = document.getElementById("answer");
const usernameInput = document.getElementById("username");
const scoreList = document.getElementById("scoreList");
const updateTime = document.getElementById("updateTime");
const recentScores = document.getElementById("recentScores");
const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const bgMusic = document.getElementById("bgMusic");

function startGame() {
  if (!usernameInput.value.trim()) {
    alert("Please enter your name.");
    return;
  }
  score = 0;
  questionCount = 0;
  finalDisplay.textContent = "";
  scoreDisplay.textContent = score;
  bgMusic.play();
  nextQuestion();
}

function startTimer() {
  clearInterval(timer);
  remainingTime = perQuestionTime;
  timeDisplay.textContent = remainingTime;
  timer = setInterval(() => {
    remainingTime--;
    timeDisplay.textContent = remainingTime;
    if (remainingTime <= 0) {
      clearInterval(timer);
      submitAnswer(true);
    }
  }, 1000);
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextQuestion() {
  const opType = randomInt(0, 3);
  let a, b, q;

  switch (opType) {
    case 0:
      a = randomInt(1, 199);
      b = randomInt(1, 199 - a);
      correctAnswer = a + b;
      q = `${a} + ${b}`;
      break;
    case 1:
      a = randomInt(10, 199);
      b = randomInt(0, a);
      correctAnswer = a - b;
      q = `${a} - ${b}`;
      break;
    case 2:
      a = randomInt(1, 99);
      b = randomInt(1, 9);
      correctAnswer = a * b;
      q = `${a} × ${b}`;
      break;
    case 3:
      b = randomInt(1, 9);
      correctAnswer = randomInt(2, 10);
      a = b * correctAnswer;
      q = `${a} ÷ ${b}`;
      break;
  }

  questionDisplay.textContent = q;
  answerInput.value = "";
  answerInput.focus();
  startTimer();
}

function submitAnswer(auto = false) {
  clearInterval(timer);
  const userAnswer = parseInt(answerInput.value);
  if (!auto && userAnswer === correctAnswer) {
    score += remainingTime;
    scoreDisplay.textContent = score;
    resultDisplay.textContent = "Correct! +" + remainingTime;
    resultDisplay.className = "result animate-correct";
    correctSound.play();
  } else {
    resultDisplay.textContent = "Wrong!";
    resultDisplay.className = "result";
    wrongSound.play();
  }
  questionCount++;
  if (questionCount < totalQuestions) {
    setTimeout(nextQuestion, 1000);
  } else {
    endGame();
  }
}

function endGame() {
  const now = new Date();
  finalDisplay.innerHTML = `<h2>Game Over</h2><p>${usernameInput.value}, Your Score: ${score}</p>`;
  bgMusic.pause();
  bgMusic.currentTime = 0;
  fetch('/save_score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: usernameInput.value,
      score: score,
      time: now.toLocaleTimeString(),
      date: now.toISOString().split('T')[0]
    })
  }).then(() => displayScores());
}

function displayScores() {
  fetch('/get_scores')
    .then(res => res.json())
    .then(data => {
      const playerScores = {};
      const playerHistory = {};
      data.forEach(({ name, score, time }) => {
        playerScores[name] = (playerScores[name] || 0) + score;
        if (!playerHistory[name]) playerHistory[name] = [];
        playerHistory[name].push({ score, time });
      });

      const ranked = Object.entries(playerScores).sort((a, b) => b[1] - a[1]);
      scoreList.innerHTML = ranked
        .map(([name, total], index) => {
          let trophy = "";
          if (index === 0) trophy = "🥇";
          else if (index === 1) trophy = "🥈";
          else if (index === 2) trophy = "🥉";
          return `<li><span class='trophy'>${trophy}</span><strong>${name}</strong>: ${total}</li>`;
        })
        .join("");

      const me = usernameInput.value;
      if (playerHistory[me]) {
        const recent = playerHistory[me].slice(-3).reverse();
        recentScores.innerHTML = `<strong>Recent:</strong>` + recent.map(r => `<div>${r.score} pts at ${r.time}</div>`).join("");
      } else {
        recentScores.innerHTML = "";
      }

      const now = new Date();
      updateTime.textContent = `Updated: ${now.toLocaleTimeString()}`;
    });
}

displayScores();
