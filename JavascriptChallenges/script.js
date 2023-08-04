function submitChallengeForm(event, funcToCall, numInputs, ...inputTypes) {
   let inputConversionArray = [];
   for (i = 0; i < numInputs; i++) {
      try {
         switch (inputTypes[i]) {
            case "Array":
               const inputToArray = convertInputToArray(event.target[i].value);
               inputConversionArray.push(inputToArray);
               break;
            case "String":
               inputConversionArray.push(event.target[i].value);
            case "Number":
               inputConversionArray.push(Number(event.target[i].value));
         }
      } catch {
         alert(`Input '${event.target[i].value}' is not a valid ${inputTypes[i]}.`);

         return false;
      }
   }

   let outputValue = "";
   try {
      outputValue = funcToCall(...inputConversionArray);
   } catch {
      alert("Function failed.");
      return false;
   }

   const outputTextarea = event.target.querySelector("textarea");

   outputTextarea.value = Stringify_WithSpaces(outputValue);

   return false;
}

function convertInputToArray(string) {
   return JSON.parse(string);
}

// from https://stackoverflow.com/a/57467694
function Stringify_WithSpaces(obj) {
   let result = JSON.stringify(obj, null, 1); // stringify, with line-breaks and indents
   result = result.replace(/^ +/gm, " "); // remove all but the first space for each line
   result = result.replace(/\n/g, ""); // remove line-breaks
   result = result.replace(/{ /g, "{").replace(/ }/g, "}"); // remove spaces between object-braces and first/last props
   result = result.replace(/\[ /g, "[").replace(/ \]/g, "]"); // remove spaces between array-brackets and first/last items
   return result;
}