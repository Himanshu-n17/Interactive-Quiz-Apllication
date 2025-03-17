document.addEventListener("DOMContentLoaded", function () {
  let allQuestions = [];
  let selectedQuestions = [];
  const totalQuestions = 10;
  let currentQuestionIndex = 0;
  let score = 0;
  let timer;
  let timeLeft = 15;

  const questionElement = document.getElementById("question");
  const optionsElement = document.getElementById("options");
  const nextButton = document.getElementById("nextButton");
  const scoreContainer = document.getElementById("scoreContainer");
  const restartButton = document.getElementById("restartButton");
  const liveScoreElement = document.getElementById("liveScore");
  const timerElement = document.getElementById("timer");

  async function fetchQuestions() {
    try {
      questionElement.textContent = "Loading quiz...";
      const res = await fetch(API_URL);
      const data = await res.json();
      allQuestions = data.results;

      if (allQuestions.length === 0) {
        questionElement.textContent = "No questions found. Try again later!";
        return;
      }

      selectedQuestions = shuffle([...allQuestions]).slice(0, totalQuestions);
      startQuiz();
    } catch (error) {
      console.error("Error fetching questions:", error);
      questionElement.textContent = "Failed to load quiz. Please refresh.";
    }
  }

  function decodeHTMLEntities(str) {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    liveScoreElement.textContent = score;
    scoreContainer.style.display = "none";
    nextButton.style.display = "none";
    restartButton.style.display = "none";

    loadQuestion();
  }

  function loadQuestion() {
    clearOptions();
    resetTimer();
    startTimer();

    const currentQ = selectedQuestions[currentQuestionIndex];
    const questionText = decodeHTMLEntities(currentQ.question);
    const correctAnswer = decodeHTMLEntities(currentQ.correct_answer);
    const incorrectAnswers = currentQ.incorrect_answers.map(decodeHTMLEntities);

    const allAnswers = shuffle([correctAnswer, ...incorrectAnswers]);

    questionElement.textContent = `Q${
      currentQuestionIndex + 1
    }: ${questionText}`;

    allAnswers.forEach((answer) => {
      const button = document.createElement("button");
      button.textContent = answer;
      button.classList.add("option-btn");
      button.addEventListener("click", () =>
        selectAnswer(button, correctAnswer)
      );
      optionsElement.appendChild(button);
    });
  }

  function clearOptions() {
    optionsElement.innerHTML = "";
    nextButton.style.display = "none";
  }

  function selectAnswer(selectedButton, correctAnswer) {
    stopTimer();

    const optionButtons = document.querySelectorAll(".option-btn");

    optionButtons.forEach((button) => {
      button.disabled = true;
      if (button.textContent === correctAnswer) {
        button.classList.add("correct");
      } else {
        button.classList.add("wrong");
      }
    });

    if (selectedButton.textContent === correctAnswer) {
      score++;
      liveScoreElement.textContent = score;
    }

    nextButton.style.display = "block";
  }

  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestions) {
      loadQuestion();
    } else {
      stopTimer();
      showScore();
    }
  }

  function showScore() {
    questionElement.textContent = `Quiz Completed!`;
    optionsElement.innerHTML = "";
    nextButton.style.display = "none";
    scoreContainer.innerHTML = `Your score: ${score} / ${totalQuestions}`;
    scoreContainer.style.display = "block";
    restartButton.style.display = "block";
  }

  function restartQuiz() {
    selectedQuestions = shuffle([...allQuestions]).slice(0, totalQuestions);
    startQuiz();
  }

  function startTimer() {
    timeLeft = 15;
    timerElement.textContent = timeLeft;

    timer = setInterval(() => {
      timeLeft--;
      timerElement.textContent = timeLeft;

      if (timeLeft <= 0) {
        stopTimer();
        timeOut();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  function resetTimer() {
    stopTimer();
    timeLeft = 15;
    timerElement.textContent = timeLeft;
  }

  function timeOut() {
    const optionButtons = document.querySelectorAll(".option-btn");

    optionButtons.forEach((button) => {
      button.disabled = true;
      const currentQ = selectedQuestions[currentQuestionIndex];
      const correctAnswer = decodeHTMLEntities(currentQ.correct_answer);
      if (button.textContent === correctAnswer) {
        button.classList.add("correct");
      } else {
        button.classList.add("wrong");
      }
    });

    nextButton.style.display = "block";
  }

  nextButton.addEventListener("click", nextQuestion);
  restartButton.addEventListener("click", restartQuiz);

  // Fetch and start the quiz on page load
  fetchQuestions();
});
