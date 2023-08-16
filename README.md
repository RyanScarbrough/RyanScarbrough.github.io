# Ryan Scarbrough Projects

## CIS 89A - Web Page Development Final Project
https://ryanscarbrough.github.io/CIS89A/final.html

Uses: **HTML**, **CSS**

Source code: [here](https://github.com/RyanScarbrough/ryanscarbrough.github.io/blob/main/CIS89A/final.html)

Details:
- Vacation destination webpage (Bali, Indonesia), using basic HTML / CSS
- Was requred to use a table to position the information

## Misc. Web Creations

### PHP Login System (MySQL)
https://php-login-f3f568530bb4.herokuapp.com/index.php

Uses: **PHP**, **MySQL**

Source code: [login](https://github.com/RyanScarbrough/ryanscarbrough.github.io/blob/main/PHPLoginSystem/includes/login.inc.php), [signup](https://github.com/RyanScarbrough/ryanscarbrough.github.io/blob/main/PHPLoginSystem/includes/signup.inc.php), [everything else](https://github.com/RyanScarbrough/ryanscarbrough.github.io/tree/main/PHPLoginSystem)

Details:
- Database created and tested with MySQL queries ([img](https://ibb.co/YcRZkBC)).
- PHP connects to MySQL database and sends queries to create users and verify users for signups and logins.
- Uses MySQL prepared statements and hashed passwords to protect from SQL injections and database hackers.
- Uses a PHP session to keep the user logged in.

### Weekly Planner App
https://weekly-planner-rs-63229654947f.herokuapp.com/

Uses: **React**, **Express**, **Javascript**, **MongoDB**

Source code: [front-end](https://github.com/RyanScarbrough/ryanscarbrough.github.io/blob/main/WeeklyPlanner/Frontend/src/App.js), [back-end](https://github.com/RyanScarbrough/ryanscarbrough.github.io/blob/main/WeeklyPlanner/Backend/index.js), [both](https://github.com/RyanScarbrough/ryanscarbrough.github.io/tree/main/WeeklyPlanner)

Details:
- A fun ideal I came up with as a project to program with React
- Uses Express.js for the backend web application
- Puts task data in a MongoDB database stored on MongoDB Atlas

### Pokemon Loader
https://ryanscarbrough.github.io/PokemonLoader/index.html

Uses: **HTML**, **CSS**, **Javascript**

Source code: [here](https://github.com/RyanScarbrough/ryanscarbrough.github.io/tree/main/PokemonLoader)

Details:
- Loads a select number of pokemon images & names using JavaScript and basic HTML
- Uses JavaScript to create HTML divs. (Inside [pokemonLoader.js](https://ryanscarbrough.github.io/PokemonLoader/pokemonLoader.js))

### Quizzer
https://ryanscarbrough.github.io/Quizzer/index.html

Uses: **HTML**, **CSS**, **Javascript**

Source code: [here](https://github.com/RyanScarbrough/ryanscarbrough.github.io/tree/main/Quizzer)

Details:
- Quizzer that loads questions from a questionBank array. (Inside [questionBank.js](https://github.com/RyanScarbrough/ryanscarbrough.github.io/blob/main/Quizzer/questionBank.js))
- Uses JavaScript to create HTML divs from question bank and appends questions to page. (Inside [script.js](https://github.com/RyanScarbrough/ryanscarbrough.github.io/blob/main/Quizzer/script.js))

### Javascript Challenges UI
https://ryanscarbrough.github.io/JavascriptChallenges/index.html

Uses: **HTML**, **CSS**, **Javascript**

Source code: [here](https://github.com/RyanScarbrough/ryanscarbrough.github.io/tree/main/JavascriptChallenges)

Details:
- UI for inputting function arguments to get function outputs of Javascript functions completed from challenges
- Javascript functions located in [challenges.js](https://ryanscarbrough.github.io/JavascriptChallenges/challenges.js)
- Form submission utilizes callback functions to use the same function for every form ([script.js](https://ryanscarbrough.github.io/JavascriptChallenges/script.js))
- To use: input arguments then click Submit for the corresponding function's output

### Node.js Database Mirroring
https://github.com/RyanScarbrough/ryanscarbrough.github.io/blob/main/DatabaseCopier/databaseCopier.js

Uses: **Node.js**, **Javascript**, **MongoDB**

Details:
- Javascript project that mirrors the database from [Universalis](https://universalis.app/) to a locally hosted MongoDB database
- Uses Universalis's REST API to create a local MongoDB copy, then connects to Universalis's WebSocket API to keep MongoDB database up-to-date
- Universalis documentation located here: https://docs.universalis.app/
