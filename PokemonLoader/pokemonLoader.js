function loadPokemon() {
   const howManyInput = document.getElementById("howMany")
   const howManyValue = howManyInput.value;
   
   let newHtml = "";
   for (let i = 1; i <= howManyValue; i++) {
      iString = String(i);
      while (iString.length < 4) iString = "0" + iString; // 0001, 0002, etc.

      newHtml += `<div class="pokemonTile">`;
      newHtml += `#${i}<br>`;
      newHtml += `<img src="pokemonImages/${iString}.png" alt="${pokemonNames[i]}">`;
      newHtml += `<br>${pokemonNames[i]}`;
      newHtml += `</div>`;
   }

   document.getElementById("pokemonContainer").innerHTML = newHtml;

   howManyInput.value = "";
   howManyInput.blur();

   return false; // prevents form from refreshing page.
}