class Question {
   constructor(question, answerArray, correctAnswer) {
      this.question = question;
      this.answerArray = answerArray;
      this.correctAnswer = correctAnswer;
   }

   isAnswer(guess) {
      return guess === this.correctAnswer;
   }
}

const quizName = "Some random questions loaded from a question bank."
const questionBank = [];

questionBank.push(new Question("What is 1 + 1?", ["4", "1", "3", "2"], 4));
questionBank.push(new Question("What is the current ECMAScript version?", ["8", "5", "14", "10"], 3));
questionBank.push(
   new Question(
      "Who is the founder of CSS?",
      ["Håkon Wium Lie",
      "Neil Armstrong",
      "Tim Berners-Lee",
      "George Washington"],
      1
   )
);
questionBank.push(
   new Question(
      "What's the first sentence of the Gettysburg Address by Abraham Lincoln?",
      ["I am happy to join with you today in what will go down in history as the greatest demonstration for freedom in the history of our nation.",
      "It is for us, the living, rather, to be dedicated here to the unfinished work which they who fought here, have, thus far, so nobly advanced.",
      "We're no strangers to love. You know the rules and so do I. A full commitment's what I'm thinking of. You wouldn't get this from any other guy",
      "Four score and seven years ago our fathers brought forth, upon this continent, a new nation, conceived in liberty, and dedicated to the proposition that all men are created equal."],
      4
   )
);
questionBank.push(
   new Question(
      "How many cans can a canner can, if a canner can can cans?",
      ["A canner can can as many cans as a canner can, if a canner can can cans.",
      "4",
      "None!",
      "Maybe a few."],
      1
   )
);
// questionBank.push(
//    new Question(
//       "Test question?",
//       ["Answer 1", "Answer 2", "Answer 3!", "Answer 4"],
//       3
//    )
// );
