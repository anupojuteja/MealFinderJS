async function searchMeals() {
    const searchInput = document.getElementById("searchInput").value.trim();
    const mealResults = document.getElementById("mealResults");

    // Clear previous results
    mealResults.innerHTML = "";

    if (!searchInput) {
        mealResults.innerHTML = "<p>Please enter something to search!</p>";
        return;
    }

    try {
        // Fetch data from TheMealDB API
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInput}`);
        const data = await response.json();

        if (data.meals) {
            // Loop through meals and display them
            data.meals.forEach(meal => {
                const mealDiv = document.createElement("div");
                mealDiv.innerHTML = `
                    <h2>${meal.strMeal}</h2>
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width: 200px;">
                    <p>${meal.strInstructions.slice(0, 100)}...</p>
                `;
                mealResults.appendChild(mealDiv);
            });
        } else {
            mealResults.innerHTML = "<p>No meals found. Try something else!</p>";
        }
    } catch (error) {
        mealResults.innerHTML = "<p>Oops! Something went wrong. Try again later.</p>";
        console.error(error);
    }
}