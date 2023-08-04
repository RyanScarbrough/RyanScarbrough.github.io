// 1st Challenge
function organizeArray(array) {
   let arrayNums = [];
   let arrayStrings = [];

   for (value of array) {
      if (typeof value === "number") {
         arrayNums.push(value);
      } else if (typeof value === "string" && !isNaN(Number(value))) {
         arrayStrings.push(value);
      }
   }

   const numSort = (a, b) => a - b;
   arrayNums = arrayNums.sort(numSort);
   arrayStrings = arrayStrings.sort(numSort);

   const organizedNums = organize(arrayNums);
   const organizedStrings = organize(arrayStrings);

   let results = [];
   if (organizedNums.length) results.push(organizedNums);
   if (organizedStrings.length) results.push(organizedStrings);

   return results;
}

function organize(array) {
   let organizedArray = [];

   let tempArray = [];
   for (i = 0; i < array.length; i++) {
      if (array[i] === array[i + 1]) {
         tempArray.push(array[i]);
      } else {
         if (tempArray.length > 0) {
            tempArray.push(array[i]);
            organizedArray.push(tempArray);
         } else {
            organizedArray.push(array[i]);
         }

         tempArray = [];
      }
   }

   return organizedArray;
}

// 2nd Challenge
function findSums(numArray, sum) {
   let sums = [];
   console.log(numArray)
   console.log(sum)
   for (i = 0; i < numArray.length; i++) {
      for (i2 = i + 1; i2 < numArray.length; i2++) {
         if (numArray[i] + numArray[i2] === sum) {
            sums.push([numArray[i], numArray[i2]]);
         }
      }
   }

   return sums;
}

// 3rd Challenge
function hexRGBConversion(input) {
   const isHex = new RegExp("^#[0-9A-F]{6}$", "i");
   const isRGB = new RegExp(
      "rgb\\((( *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *),){2}( *0*([1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *)\\)"
   );

   if(isHex.test(input)) {
      const red = parseInt(input.slice(1, 3), 16);
      const green = parseInt(input.slice(3, 5), 16);
      const blue = parseInt(input.slice(5, 7), 16);

      return `rgb(${red}, ${green}, ${blue})`
   } else if(isRGB.test(input)) {
      const nums = input.match(/\d+/g);

      const red = Number(nums[0]).toString(16);
      const green = Number(nums[1]).toString(16);
      const blue = Number(nums[2]).toString(16);

      return `#${red}${green}${blue}`.toUpperCase();
   } else {
      return "Invalid input format. Use '#xxxxxx' or 'rgb(x, x, x)' formatting."
   }
}