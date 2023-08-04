import express from "express";
import cors from "cors";
import morgan from "morgan";

import Task from "./taskModel.js";

const app = express();

app.use(express.json());
app.use(express.static("build"));
app.use(cors());
app.use(morgan("tiny"));

// Get all daily tasks AND scheduled tasks for the current week.
app.get("/api/tasks/", (request, response, next) => {
   // get this week's days in YYYY-DD-MM string format,
   let lastSunday = new Date();
   lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay());

   const weekStringsDate = [];
   weekStringsDate.push(dateToString(lastSunday));

   let prevDay = lastSunday;
   for (let i = 1; i <= 6; i++) {
      let nextDay = new Date();
      nextDay.setDate(prevDay.getDate() + 1);

      // and store them in weekStringsDate.
      weekStringsDate.push(dateToString(nextDay));
      prevDay = nextDay;
   }

   // Return all daily tasks and tasks that have a date string of a date of the current week.
   Task.find({})
      .then((tasks) => {
         response.json(
            tasks.filter(
               (task) =>
                  task.date === "" ||
                  weekStringsDate.find((weekString) => weekString === task.date)
            )
         );
      })
      .catch((error) => next(error));
});

// Get all daily tasks AND scheduled tasks after or equal to the current date.
app.get("/api/tasks/:date", (request, response, next) => {
   const today = request.params.date;

   console.log("getting tasks for day: " + today);
   if (today === undefined) {
      return response.status(400).json({
         error: "date for getAll not set",
      });
   }
   Task.find({})
      .then((tasks) => {
         tasks = tasks.filter(
            (task) =>
               task.date === "" || parseDate(task.date) >= parseDate(today)
         );

         response.json(tasks);
      })
      .catch((error) => next(error));
});

// Create new task.
app.post("/api/tasks", (request, response, next) => {
   const task = request.body;

   if (!task.name) {
      return response.status(400).json({ error: "no task name" });
   }

   if (!task.xPer && !task.date) {
      return response.status(400).json({ error: "need xPer or date" });
   }

   if (task.xPer && task.date) {
      return response
         .status(400)
         .json({ error: "cannot have both xPer and date" });
   }

   const taskDoc = new Task({
      name: task.name,
      xPer: task.xPer || 0,
      date: task.date || "",
   });

   taskDoc
      .save()
      .then((savedTask) => response.json(savedTask))
      .catch((error) => next(error));
});

// Update task xPer property by task id.
app.put("/api/tasks/:id", (request, response, next) => {
   const id = request.params.id;

   const newxPer = request.body.xPer;
   console.log(request.body);
   if (newxPer === undefined) {
      return response.status(400).json({
         error: "xPer not set",
      });
   }
   Task.findByIdAndUpdate(id, { xPer: newxPer }, { new: true })
      .then((updatedTask) => {
         if (updatedTask) {
            response.json(updatedTask);
         } else {
            response.status(404).end();
         }
      })
      .catch((error) => next(error));
});

// Delete task by id.
app.delete("/api/tasks/:id", (request, response, next) => {
   const id = request.params.id;

   Task.findByIdAndDelete(id)
      .then(() => response.status(204).end())
      .catch((error) => next(error));
});

// Parse date string to new Date() object.
function parseDate(input) {
   let parts = input.split("-");

   // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
   return new Date(parts[0], parts[1] - 1, parts[2]); // Note: months are 0-based
}

// Convert Date() object to YYYY-MM-DD string format
const dateToString = (date) => {
   return (
      date.getFullYear().toString() +
      "-" +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      date.getDate().toString().padStart(2, "0")
   );
};

// Page not found middleware.
const unknownEndpoint = (request, response) => {
   response.status(404).send("<p>Page not found!</p>");
};

app.use(unknownEndpoint);

// Error handler middleware.
const errorHandler = (error, request, response, next) => {
   console.error(error.message);

   if (error.name === "CastError") {
      return response.status(400).send({ error: "malformatted id" });
   }

   next(error);
};

app.use(errorHandler);

// Port used.
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("listening on port: " + PORT));
