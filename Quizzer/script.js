document.querySelector("h2").innerText = `"${quizName}"`;
loadQuestionBank();

function loadQuestionBank() {
   questionBank.forEach((question, idx) => {
      const questionDiv = createQuestionContainer(question, idx + 1);

      // append new question div to page
      document.querySelector("#all-questions").appendChild(questionDiv);
   });
}

function submitQuiz() {
   console.log("Quiz submitted!");
   let score = 0;

   let questionForms = document.querySelector("#all-questions");
   questionForms = Array.from(questionForms.children);

   questionForms.forEach((questionForm, idx) => {
      const guess = document.querySelector(`input[name='question${idx + 1}']:checked`)?.value;

      if (guess && questionBank[idx].isAnswer(Number(guess))) {
         score++;
      }
   });

   let percentScore = (score / questionForms.length) * 100;
   percentScore = parseFloat(percentScore.toFixed(1));

   console.log(`Total score: ${percentScore}%`);

   window.scrollTo(0, 0);

   document.querySelector("#total-score").innerHTML = `Total score: <u>${percentScore}%</u>`;

   return false;
}

// create question cotainer div from question in questionBank
function createQuestionContainer(question, questionNum) {
   const questionContainer = document.createElement("div");
   questionContainer.classList.add("question-container");

   const questionDiv = document.createElement("div");
   questionDiv.classList.add("question");
   questionDiv.innerText = question.question;

   const answersContainer = document.createElement("div");
   answersContainer.classList.add("answers-container");

   question.answerArray.forEach((answer, idx) => {
      const answerDiv = document.createElement("div");
      answerDiv.classList.add("answer");

      const label = document.createElement("label");

      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.name = `question${questionNum}`;
      radioInput.value = idx + 1;

      const answerText = document.createElement("span");
      answerText.innerText = answer;

      label.appendChild(radioInput);
      label.appendChild(answerText);

      answerDiv.appendChild(label);

      answersContainer.appendChild(answerDiv);
   });

   questionContainer.appendChild(questionDiv);
   questionContainer.appendChild(answersContainer);

   return questionContainer;
}
