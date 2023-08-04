import { useState, useEffect, createRef } from "react";

import axiosTasks from "./axiosTasks";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faAnglesUp, faHeart } from "@fortawesome/free-solid-svg-icons";

import "./App.css";

// change day offset to check other days
const DAY_OFFSET = 0;

const App = () => {
   // tasks for app
   const [tasks, setTasks] = useState([]);

   // state of initial task retrieval from db
   const [initializing, setInitializing] = useState(true);

   // input states
   const [taskInput, setTaskInput] = useState("");
   const [xPerInput, setxPerInput] = useState("");
   const [dateInput, setDateInput] = useState("");

   // handle input states
   const handleTaskInputChange = (event) => {
      setTaskInput(event.target.value);
   };
   const handlexPerInputChange = (event) => {
      setxPerInput(event.target.value);
      setDateInput("");
   };
   const handleDateInputChange = (event) => {
      setDateInput(event.target.value);
      setxPerInput("");
   };

   // INITIALIZE TASKS

   useEffect(() => {
      console.log("Initiating tasks from db...");
      axiosTasks.getAll().then((tasks) => {
         console.log("Tasks initialized:");
         console.log(tasks);
         setInitializing(false);
         setTasks(tasks);
      });
   }, []);

   // NEW TASK

   const handleTaskFormSubmit = (event) => {
      event.preventDefault();

      // check for valid input
      if (
         taskInput.trim() === "" ||
         (Number(xPerInput) === 0 && dateInput === "")
      )
         return false;

      const newTaskObj = {
         name: taskInput,
         xPer: Number(xPerInput),
         date: dateInput,
      };

      // save task to db
      axiosTasks.create(newTaskObj).then((savedTask) => {
         setTasks(tasks.concat(savedTask));
         console.log("Submitted: ", savedTask);
      });

      // reset inputs
      setTaskInput("");
      setxPerInput("");
      setDateInput("");

      return true;
   };

   // SUBMIT DAY

   const handleSubmitDay = async (event) => {
      event.preventDefault();

      let taskChanges = [];
      let taskRemoves = [];

      // Go through each checkbox in form,
      Array.prototype.forEach.call(event.target.elements, (element) => {
         if (element.type === "checkbox" && element.checked) {
            // get the id of the task belonging to checkbox,
            const id = element.id.substring(element.id.indexOf("-id") + 3);

            // find any tasks beloning to that id,
            const findTask = tasks.find((task) => task.id === id);

            // if xPer for that task is greater than 1,
            if (findTask.xPer !== 0 && findTask.xPer !== 1) {
               // reduce its xPer by 1 and push it to taskChanges
               findTask.xPer--;
               taskChanges.push(findTask);
            }
            // else if it is a date scheduled task or only has 1 xPer
            else {
               // push it to taskRemvoes
               taskRemoves.push(findTask);
            }

            // uncheck the checkbox for the next submission
            element.checked = false;
         }
      });

      // remove each task from db that is to be removed
      taskRemoves.forEach((task) => {
         axiosTasks.del(task.id).then((t) => console.log("deleted: ", task));
      });

      // update all tasks in db that are to be updated,
      // await until all tasks have been updated,
      // and push unfound tasks to taskRemoves
      await Promise.all(
         taskChanges.map(async (task) => {
            await axiosTasks
               .updatexPer(task.id, { xPer: task.xPer })
               .then((updatedTask) => console.log("updated: ", updatedTask))
               .catch((error) => {
                  if (error.message === "Request failed with status code 404") {
                     alert("Task '" + task.name + "' has already been removed from server.")
                     console.log("deleting: ", task);
                     taskRemoves.push(task);
                  }
               });
         })
      );

      // filter out taskRemoves tasks from UI tasks
      const removedTasks = tasks.filter(
         (task) => !taskRemoves.find((t) => t.id === task.id)
      );

      // update taskChanges tasks remaining in removedTasks
      const updatedTasks = removedTasks.map((task) =>
         taskChanges.find((t) => t.id === task.id)
            ? taskChanges.find((t) => t.id === task.id)
            : task
      );

      // update UI tasks
      setTasks(updatedTasks);

      console.log("Submitted day, updated tasks:");
      console.log(updatedTasks);
   };

   // REMOVE TASK

   const handleRemoveTask = (task) => {
      // remove task from db
      axiosTasks.del(task.id).then((t) => {
         setTasks(tasks.filter((t) => t.id !== task.id));
         console.log("Removed task: ", task);
      });
   };

   // RESET DETAILED FORM INPUTS

   const resetDetailedFormInputs = () => {
      setxPerInput("");
      setDateInput("");
   };

   // MAIN APP RENDER

   return (
      <div id="App">
         <h2>Your Weekly Planner</h2>
         <PlannerForm
            taskInput={taskInput}
            xPerInput={xPerInput}
            dateInput={dateInput}
            handleTaskInputChange={handleTaskInputChange}
            handlexPerInputChange={handlexPerInputChange}
            handleDateInputChange={handleDateInputChange}
            handleTaskFormSubmit={handleTaskFormSubmit}
            resetDetailedFormInputs={resetDetailedFormInputs}
         />
         <Weeks tasks={tasks} handleRemoveTask={handleRemoveTask} />
         <div id="hoverExplanation">(hover over any day to see scheduled tasks)</div>
         <DailyTodo
            tasks={tasks}
            initializing={initializing}
            handleSubmitDay={handleSubmitDay}
            handleRemoveTask={handleRemoveTask}
         />
      </div>
   );
};

// Doesn't seem to fit app but I'll leave it here just in case for later
const Footer = () => {
   return (
      <p id="AppFooter">
         Made with &nbsp;
         <FontAwesomeIcon icon={faHeart} size="sm" color="red" />
         &nbsp; by Ryan Scarbrough
      </p>
   );
};

// NEW TASK FORM

const PlannerForm = ({
   taskInput,
   xPerInput,
   dateInput,
   handleTaskInputChange,
   handlexPerInputChange,
   handleDateInputChange,
   handleTaskFormSubmit,
   resetDetailedFormInputs,
}) => {
   // for toggling detailed task form
   const [showTaskCreationDetail, setShowTaskCreationDetail] = useState(false);

   // for focusing taskInput if needed
   const taskInputRef = createRef();

   // for setting min. day in date input
   const todayString = getCurrentDateString();

   //
   // Initial Form
   //
   if (!showTaskCreationDetail) {
      return (
         <form id="PlannerForm" onSubmit={(event) => event.preventDefault()}>
            <div className="taskInputLabel">
               <label>
                  Task name: {}
                  <input
                     autoFocus
                     size={25}
                     maxLength={60}
                     value={taskInput}
                     onChange={handleTaskInputChange}
                  ></input>
               </label>{" "}
               &nbsp;
               <button
                  id="CreateTaskButton"
                  onClick={() => {
                     if (taskInput.trim() !== "")
                        setShowTaskCreationDetail(true);
                  }}
               >
                  Setup task
               </button>
            </div>
         </form>
      );
   } else {
      //
      // Detailed Form
      //
      return (
         <form
            id="PlannerForm"
            onSubmit={(event) => {
               if (handleTaskFormSubmit(event)) {
                  setShowTaskCreationDetail(false);
                  // taskInputRef.current.focus();
               }
            }}
         >
            <div className="taskInputLabel">
               <label>
                  Task name: {}
                  <input
                     size={25}
                     maxLength={60}
                     ref={taskInputRef}
                     value={taskInput}
                     onChange={handleTaskInputChange}
                  ></input>
               </label>
               <FontAwesomeIcon
                  icon={faAnglesUp}
                  size="lg"
                  className="detailedFormXIcon"
                  onClick={(e) => {
                     resetDetailedFormInputs();
                     setShowTaskCreationDetail(false);
                  }}
               />
            </div>
            <div className="taskDetails">
               <label>
                  <input
                     autoFocus
                     size={2}
                     maxLength={2}
                     onKeyPress={validate}
                     value={xPerInput}
                     onChange={handlexPerInputChange}
                  ></input>
                  {} times per week
               </label>
               <label>
                  &nbsp;{}{" "}
                  <span span style={{ fontFamily: "Roboto Medium" }}>
                     OR
                  </span>{" "}
                  {}&nbsp;scheduled on {}
                  <input
                     type="date"
                     min={todayString}
                     value={dateInput}
                     onChange={handleDateInputChange}
                  ></input>
               </label>
            </div>
            <button id="SubmitNewTaskButton" type="submit">
               Create task
            </button>
         </form>
      );
   }

   // Validate xPer input box (numbers only)
   function validate(evt) {
      var theEvent = evt || window.event;

      // handle key press
      var keyC = theEvent.keyCode || theEvent.which;
      var key = String.fromCharCode(keyC);

      var regex = /[0-9]|\./;
      if (!regex.test(key) && !(keyC === 13)) {
         theEvent.returnValue = false;
         if (theEvent.preventDefault) theEvent.preventDefault();
      }
   }
};

// WEEKS SECTION

const Weeks = ({ tasks, handleRemoveTask }) => {
   //
   // HOVER BOX PROGRAMMING
   //

   // When mouse moves over a .dayContainer, make it's hoverDiv visible
   // and move it's position to the mouse's location.
   const handleMouseMove = (event) => {
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // find the hoverDiv child,
      const hoverDiv = event.target.querySelector(".hoverDiv");

      // return if not found,
      if (!hoverDiv) return;

      // make it visible,
      hoverDiv.style.display = "block";

      // and if the hoverDiv hasn't been click activated yet,
      if (
         !hoverDiv.attributes.clicked ||
         hoverDiv.attributes.clicked.value === "false"
      ) {
         console.log(
            `hoverDiv rendering for ${
               event.target.querySelector(".dayName").innerHTML
            }!`
         );

         // get document body for body.clientWidth
         const body = document.body;

         // get page height as body.clientHeight doesn't cover page
         const html = document.documentElement;
         const pageHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
         );

         // check if the hoverDiv will go out of bounds,
         const outOfBoundsOnX =
            mouseX + hoverDiv.clientWidth > body.clientWidth;

         const outOfBoundsOnY = mouseY + hoverDiv.clientHeight > pageHeight;

         let normalizedX = mouseX;
         let normalizedY = mouseY;

         // normalzie on X if it does,
         if (outOfBoundsOnX) {
            normalizedX = body.clientWidth - hoverDiv.clientWidth + 10;
         }

         // normalize on Y if it does,
         if (outOfBoundsOnY) {
            normalizedY = pageHeight - hoverDiv.clientHeight;
         }

         // and move it to the mouse's position or normalized position if needed.
         hoverDiv.style.left = normalizedX + "px";
         hoverDiv.style.top = normalizedY + "px";
      }
      // Otherwise don't move it's position, since it was clicked,
      else {
         // get hoverDiv's size and mouse's position,
         const hoverDivRect = hoverDiv.getBoundingClientRect();
         const mouseX = event.clientX;
         const mouseY = event.clientY;

         // and if mouse goes within the hoverDiv,
         if (
            hoverDivRect.x + 3 <= mouseX &&
            mouseX <= hoverDivRect.right &&
            hoverDivRect.y + 3 <= mouseY &&
            mouseY <= hoverDivRect.bottom &&
            hoverDiv.attributes.clicked &&
            hoverDiv.attributes.clicked.value === "true"
         ) {
            console.log("now within hoverDiv...");

            // turn hoverDiv pointerEvent ON, so that it can handle the mouseLeave.
            hoverDiv.style.pointerEvents = "auto";
         }
      }
   };

   // When mouse is clicked on a .dayContainer, freeze its hoverDiv's position
   // by setting it's 'clicked' attribute to true.
   const handleMouseClick = (event) => {
      // get hoverDiv child,
      const hoverDiv = event.target.querySelector(".hoverDiv");

      // return if not found,
      if (!hoverDiv) return;

      // return if .hoverFooterStatic is found, meaning there are no tasks in this .dayContainer
      if (hoverDiv.querySelector(".hoverFooterStatic")) return;

      // otherwise conitinue,
      console.log(
         `${event.target.querySelector(".dayName").innerHTML} clicked!`
      );

      // change hoverDiv footer to let user know it was clicked,
      const hoverFooter = hoverDiv.querySelector(".hoverFooter");
      if (hoverFooter) hoverFooter.innerHTML = "clicked!";

      // set opacity to full,
      hoverDiv.style.backgroundColor = "rgba(63, 63, 63, 1.0)";

      // and set hoverDiv 'clicked' attribute to true, so that it will no longer move.
      hoverDiv.setAttribute("clicked", true);
   };

   // When mouse leaves a .dayContainer, close its hoverDiv.
   const handleMouseLeave = (event) => {
      // get the hoverDiv child,
      const hoverDiv = event.target.querySelector(".hoverDiv");

      // return if not found,
      if (!hoverDiv) return;

      // reset hoverFooter to initial text,
      const hoverFooter = hoverDiv.querySelector(".hoverFooter");
      if (hoverFooter) hoverFooter.innerHTML = "(click to manage)";

      // and reset hoverDiv to not display and initial opacity,
      hoverDiv.style.display = "none";
      hoverDiv.style.backgroundColor = "rgba(63, 63, 63, 0.9)";

      // and set hoverDiv 'clicked' attribute to false, so that it can move again.
      hoverDiv.setAttribute("clicked", false);

      console.log("hoverDiv closed.");
   };

   // For when the hoverDiv needs to handle the mouse leave, close the hoverDiv and
   // set its pointer-events back to 'none' so it doesn't get in the way in the future.
   const handleMouseLeaveHoverDiv = (event) => {
      let hoverDiv = "";

      // get the hoverDiv element if bug happens,
      if (event.target.className !== "hoverDiv") {
         // THIS IS A REACT BUG!
         // Sometimes event.target is the children of .hoverDiv when the mouse is moved too fast.
         console.log(event.target);
         // Get hoverDiv by looking in parents.
         hoverDiv = event.target.closest(".hoverDiv");

         console.log(
            "Mouse moved too fast, don't worry I fixed it! This should now say hoverDiv: '" +
               hoverDiv.className +
               "'"
         );
      } else {
         // whew, no bug.
         hoverDiv = event.target;
      }

      // reset hoverFooter to initial state,
      const hoverFooter = hoverDiv.querySelector(".hoverFooter");
      if (hoverFooter) hoverFooter.innerHTML = "(click to manage)";

      // and reset hoverDiv to not display and initial opacity,
      hoverDiv.style.display = "none";
      hoverDiv.style.backgroundColor = "rgba(63, 63, 63, 0.9)";

      // and set hoverDiv 'clicked' attribute to false, so that it can move again.
      hoverDiv.setAttribute("clicked", false);

      // turn hoverDiv pointerEvent OFF, so that it doesn't get in the way in the future.
      hoverDiv.style.pointerEvents = "none";

      console.log("hoverDiv closed.");
   };

   // GET THIS WEEK'S DAYS IN YYYY-DD-MM STRING FORMAT
   let lastSunday = new Date();
   lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay());

   const weekStringsDate = [];
   weekStringsDate.push(dateToString(lastSunday));

   let prevDay = lastSunday;
   for (let i = 1; i <= 6; i++) {
      let nextDay = new Date();
      nextDay.setDate(prevDay.getDate() + 1);

      // AND STORE THEM IN weekStringsDate.
      weekStringsDate.push(dateToString(nextDay));
      prevDay = nextDay;
   }

   // Check if week strings are correct:
   // console.log(weekStringsDate)

   // Get current day, modify by DAY_OFFSET, and store as YYYY-DD-MM in string format.
   const currentDay = new Date();
   currentDay.setDate(currentDay.getDate() + DAY_OFFSET);

   // STYLIZE THE .dayContainer THAT'S THE CURRENT DAY

   const weekClassNames = new Array(7);
   for (let i = 0; i <= 6; i++) {
      weekClassNames[i] = {};

      const isThisToday = currentDay.getDay() === i;

      weekClassNames[i].title = isThisToday
         ? "dayName currentDayName"
         : "dayName";

      weekClassNames[i].dayBox = isThisToday
         ? "dayBox currentDayBox"
         : "dayBox";
   }

   // GET INFO FOR EACH DAY

   const weekInfo = new Array(7);
   for (let i = 0; i <= 6; i++) {
      weekInfo[i] = {};
      const tasksForDay = tasks.filter(
         (task) => task.date === weekStringsDate[i]
      );

      let numTasks = tasksForDay.length;

      weekInfo[i].tasksOutput = "";
      if (numTasks === 1) {
         weekInfo[i].tasksOutput = numTasks + " task scheduled";
      } else if (numTasks > 1) {
         weekInfo[i].tasksOutput = numTasks + " tasks scheduled";
      }

      weekInfo[i].tasks = tasksForDay;
   }

   weekInfo[0].dayName = "Sunday";
   weekInfo[1].dayName = "Monday";
   weekInfo[2].dayName = "Tuesday";
   weekInfo[3].dayName = "Wednesday";
   weekInfo[4].dayName = "Thursday";
   weekInfo[5].dayName = "Friday";
   weekInfo[6].dayName = "Saturday";

   // Check to make sure weekInfo is correct:
   // console.log(weekInfo)

   return (
      <>
         <div id="Week">
            <h3>Current week:</h3>

            {/* Iterate through each day and print each dayContainer,
                each with it's own hoverDiv containing scheduled tasks for that day. */}
            {weekInfo.map((day, idx) => (
               <div
                  key={day.dayName}
                  className="dayContainer"
                  date={weekStringsDate[idx]}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleMouseClick}
               >
                  {/* Title and box of the current day, highlighted if it's the current day. */}
                  <div className={weekClassNames[idx].title}>{day.dayName}</div>
                  <div className={weekClassNames[idx].dayBox}>
                     {/* Text inside box saying how many scheduled tasks there are for that day. */}
                     <div className="dayText">{weekInfo[idx].tasksOutput}</div>
                  </div>

                  {/* hoverDiv is invisible until it's dayContainer is hovered over. */}
                  <div
                     className="hoverDiv"
                     onMouseLeave={handleMouseLeaveHoverDiv}
                  >
                     <div className="hoverTitle">Scheduled tasks:</div>
                     <div className="hoverTasks">
                        {/* Iterate through each task belonging to the current day
                            in iteration, and put them in that day's hoverDiv. */}
                        {day.tasks.map((task) => (
                           <div key={task.id} className="hoverTaskDisplay">
                              <FontAwesomeIcon
                                 icon={faTrashCan}
                                 className="trashIcon"
                                 onClick={() => handleRemoveTask(task)}
                              />
                              <label>{task.name}</label>
                           </div>
                        ))}
                     </div>
                     {/* Footer of hoverDiv, changed when hoverDiv is clicked. */}
                     {day.tasks.length > 0 ? (
                        <div className="hoverFooter">(click to manage)</div>
                     ) : (
                        <div className="hoverFooterStatic">none yet!</div>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </>
   );
};

// BOTTOM SECTION

const DailyTodo = ({
   tasks,
   initializing,
   handleSubmitDay,
   handleRemoveTask,
}) => {
   // get today in YYYY-MM-DD string format
   const todayString = getCurrentDateString();

   // get all daily tasks
   const tasksWithxPer = tasks.filter((task) => task.date === "");
   // get scheduled tasks for today
   const tasksScheduledToday = tasks.filter(
      (task) => task.date === todayString
   );

   return (
      <form onSubmit={handleSubmitDay}>
         <div id="DailyTodo">
            {/* */}
            {/* LEFT SIDE */}
            {/* */}
            <div id="TodayContainer">
               <h4>Tasks for Today</h4>
               <div id="Today">
                  {/* Heading for scheduled tasks */}
                  {tasksScheduledToday.length > 0 ? (
                     <p className="taskTypeTitle">Scheduled today</p>
                  ) : (
                     ""
                  )}
                  {/* Iterate through each scheduled task */}
                  {tasksScheduledToday.map((task) => (
                     <div key={task.id} className="taskDisplay">
                        <input
                           id={`taskDisplayCheckbox-id${task.id}`}
                           type="checkbox"
                        ></input>
                        <label htmlFor={`taskDisplayCheckbox-id${task.id}`}>
                           {task.name}
                        </label>
                     </div>
                  ))}
                  {/* Heading for daily tasks */}
                  {(() => {
                     if (
                        tasksScheduledToday.length > 0 &&
                        tasksWithxPer.length === 0
                     ) {
                        return "";
                     } else if (
                        tasksScheduledToday.length === 0 &&
                        tasksWithxPer.length === 0
                     ) {
                        return (
                           <>
                              <p className="taskTypeTitle">Weekly tasks</p>
                              {initializing ? (
                                 <div
                                    className="taskDisplay"
                                    id="createToBeginDisplay"
                                 >
                                    Initializing tasks ...
                                 </div>
                              ) : (
                                 <div
                                    className="taskDisplay"
                                    id="createToBeginDisplay"
                                 >
                                    Setup a task to begin!
                                 </div>
                              )}
                           </>
                        );
                     } else if (tasksWithxPer.length > 0) {
                        return <p className="taskTypeTitle">Weekly tasks</p>;
                     }
                  })()}
                  {/* Iterate through each daily tasks */}
                  {tasksWithxPer.map((task) => (
                     <div key={task.id} className="taskDisplay">
                        <input
                           id={`taskDisplayCheckbox-id${task.id}`}
                           type="checkbox"
                        ></input>
                        <label htmlFor={`taskDisplayCheckbox-id${task.id}`}>
                           {task.name}
                        </label>
                     </div>
                  ))}
               </div>
               {/* Submit day button */}
               {tasksScheduledToday.length > 0 || tasksWithxPer.length > 0 ? (
                  <>
                     <br />
                     <button id="SubmitDayButton">Submit day!</button>
                  </>
               ) : (
                  ""
               )}
            </div>
            <hr />
            {/* */}
            {/* RIGHT SIDE */}
            {/* */}
            <div id="AllTasksContainer">
               <h4>Weekly Tracker</h4>
               <div id="AllTasks">
                  {/* Heading for daily tasks */}
                  <p className="taskTypeTitle">Weekly tasks</p>
                  {/* Iterate through each daily task */}
                  {/* with trash icon for task removal */}
                  {tasksWithxPer.map((task) => (
                     <div key={task.id} className="taskDisplayRight">
                        <FontAwesomeIcon
                           icon={faTrashCan}
                           size="1x"
                           className="trashIcon"
                           onClick={() => handleRemoveTask(task)}
                        />
                        <span style={{fontFamily: "Roboto Medium", marginLeft: 7}}>&nbsp;x{task.xPer}</span>
                        <label>{task.name}</label>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </form>
   );
};

// Get today in YYYY-MM-DD string format
const getCurrentDateString = () => {
   let d = new Date();
   d.setDate(d.getDate() + DAY_OFFSET);
   const today =
      d.getFullYear().toString() +
      "-" +
      (d.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      d.getDate().toString().padStart(2, "0");

   return today;
};

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

export default App;
