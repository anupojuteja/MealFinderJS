document.addEventListener("DOMContentLoaded", () => {
    const navIcon = document.querySelector(".nav-icon");
    const sidebar = document.querySelector(".sidebar");
    const closeBtn = document.querySelector(".close-btn");
    const mealList = document.getElementById("mealList");
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const categoriesContainer = document.getElementById("categoriesContainer");
    const mealDetails = document.getElementById("meal-details");

    // API URLs
    const categoriesAPI = "https://www.themealdb.com/api/json/v1/1/categories.php";
    const mealSearchAPI = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
    const mealByCategoryAPI = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
    const mealDetailAPI = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

    // Toggle sidebar
    navIcon.addEventListener("click", () => {
        sidebar.classList.add("active");
        fetchMeals();
    });

    closeBtn.addEventListener("click", () => {
        sidebar.classList.remove("active");
    });

    // Fetch meal categories for sidebar
    async function fetchMeals() {
        try {
            const response = await fetch(categoriesAPI);
            const data = await response.json();
            mealList.innerHTML = "";

            data.categories.forEach((category) => {
                const listItem = document.createElement("li");
                listItem.textContent = category.strCategory;
                listItem.addEventListener("click", () => fetchMealsByCategory(category, true));
                mealList.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error fetching meals:", error);
        }
    }

    // Fetch and display meal images for a selected category
    async function fetchMealsByCategory(category, showTitle) {
        mealDetails.innerHTML = showTitle ? `
        <h2>${category.strCategory}</h2>
        <p>${category.strCategoryDescription}</p>
        <div id="relatedMeals" class="meal-container"></div>` : `<div id="relatedMeals" class="meal-container"></div>`;
        mealDetails.style.display = "block";

        try {
            const response = await fetch(mealByCategoryAPI + category.strCategory);
            const data = await response.json();

            const relatedMealsContainer = document.getElementById("relatedMeals");
            relatedMealsContainer.innerHTML = ""; // Clear previous meals

            if (data.meals && data.meals.length > 0) {
                data.meals.forEach((meal) => {
                    const mealItem = document.createElement("div");
                    mealItem.classList.add("meal-item");
                    mealItem.innerHTML = `
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" data-id="${meal.idMeal}">
                    <p>${meal.strMeal}</p>
                `;
                    relatedMealsContainer.appendChild(mealItem);

                    // Click on image to fetch full meal details
                    mealItem.querySelector("img").addEventListener("click", () => {
                        fetchMealDetails(meal.idMeal);
                    });
                });
            } else {
                relatedMealsContainer.innerHTML = `<p>No meals found for category: ${category.strCategory}.</p>`;
            }
        } catch (error) {
            console.error("Error fetching related meals:", error);
        }
    }

    // Search for meals and display images
    searchBtn.addEventListener("click", async () => {
        const query = searchInput.value.trim();
        if (query !== "") {
            try {
                const response = await fetch(mealSearchAPI + query);
                const data = await response.json();
                mealDetails.innerHTML = ""; // Clear previous results

                if (data.meals) {
                    data.meals.forEach((meal) => {
                        const mealItem = document.createElement("div");
                        mealItem.classList.add("meal-item");
                        mealItem.innerHTML = `
                            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" data-id="${meal.idMeal}">
                            <p>${meal.strMeal}</p>
                        `;
                        mealDetails.appendChild(mealItem);

                        // Click on image to fetch full meal details
                        mealItem.querySelector("img").addEventListener("click", () => {
                            fetchMealDetails(meal.idMeal);
                        });
                    });
                } else {
                    mealDetails.innerHTML = "<p>No meals found.</p>";
                }
            } catch (error) {
                console.error("Error searching meals:", error);
            }
        }
    });

    // Fetch full meal details (Ingredients, Instructions, etc.)
    async function fetchMealDetails(mealId) {
        try {
            const response = await fetch(mealDetailAPI + mealId);
            const data = await response.json();
            const mealInfo = data.meals[0];

            // Get ingredients and measurements
            let ingredientsList = "";
            let measuresList = "";
            for (let i = 1; i <= 20; i++) {
                const ingredient = mealInfo[`strIngredient${i}`]?.trim();
                const measure = mealInfo[`strMeasure${i}`]?.trim();
                if (ingredient) {
                    ingredientsList += `<li><span class="ingredients">${ingredient}</span></li>`;
                    measuresList += `<li>${measure || "None"}</li>`;
                }
            }

            mealDetails.innerHTML = `
                <h2>${mealInfo.strMeal}</h2>
                <img src="${mealInfo.strMealThumb}" alt="${mealInfo.strMeal}">
                <p><strong>Category:</strong> ${mealInfo.strCategory}</p>
                <p><strong>Source:</strong> 
                ${mealInfo.strSource ? `<a href="${mealInfo.strSource}" target="_blank">${mealInfo.strSource}</a>` : "Not Available"}
                </p>
                <p><strong>Tags:</strong> 
                ${mealInfo.strTags ? mealInfo.strTags : "N/A"}
                </p>
                <h3><strong>Ingredients:</strong></h3>
                <ul>${ingredientsList}</ul>
                <h3><strong>Measures:</strong></h3>
                <ul>${measuresList}</ul>
                <strong>Instructions:</strong> ${mealInfo.strInstructions}        
            `;
            mealDetails.style.display = "block";
        } catch (error) {
            console.error("Error fetching meal details:", error);
        }
    }

    // Fetch categories for homepage
    async function fetchCategories() {
        try {
            const response = await fetch(categoriesAPI);
            const data = await response.json();
            categoriesContainer.innerHTML = "";

            data.categories.forEach((category) => {
                const div = document.createElement("div");
                div.classList.add("category");
                div.innerHTML = `
                    <img src="${category.strCategoryThumb}" alt="${category.strCategory}">
                    <p>${category.strCategory}</p>
                `;

                div.addEventListener("click", () => fetchMealsByCategory(category, false));
                categoriesContainer.appendChild(div);
            });
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    fetchCategories();
});