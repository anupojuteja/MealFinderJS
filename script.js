document.addEventListener("DOMContentLoaded", () => {
    const navIcon = document.querySelector(".nav-icon");
    const sidebar = document.querySelector(".sidebar");
    const closeBtn = document.querySelector(".fa-circle-xmark");
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

    document.getElementById("homeLogo").addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default anchor behavior
        location.reload(); // Reload the page
    });
    
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
                listItem.addEventListener("click", () => {
                    fetchMealsByCategory(category);
                    sidebar.classList.remove("active"); // Close sidebar on meal click
                });
                mealList.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error fetching meals:", error);
        }
    }

    // Fetch and display meal images for a selected category
    async function fetchMealsByCategory(category) {
        mealDetails.innerHTML = `
            <div class="category-box">
                <h3>${category.strCategory}</h3>
                <p>${category.strCategoryDescription}</p>
            </div>
            <h2>MEALS</h2>
            <div id="relatedMeals" class="meal-container"></div>
        `;
        mealDetails.style.display = "block";

        try {
            const response = await fetch(mealByCategoryAPI + category.strCategory);
            const data = await response.json();

            const relatedMealsContainer = document.getElementById("relatedMeals");
            relatedMealsContainer.innerHTML = "";

            if (data.meals && data.meals.length > 0) {
                data.meals.forEach((meal) => {
                    const mealItem = document.createElement("div");
                    mealItem.classList.add("meal-item");
                    mealItem.innerHTML = `
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" data-id="${meal.idMeal}">
                        <h3>${meal.strMeal}</h3>
                    `;
                    relatedMealsContainer.appendChild(mealItem);

                    // Click to fetch full meal details
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

    // Search for meals
    searchBtn.addEventListener("click", async () => {
        sidebar.classList.remove("active");
        const query = searchInput.value.trim();
        if (query !== "") {
            try {
                const response = await fetch(mealSearchAPI + query);
                const data = await response.json();
                mealDetails.innerHTML = "";

                if (data.meals) {
                    data.meals.forEach((meal) => {
                        const mealItem = document.createElement("div");
                        mealItem.classList.add("meal-item");
                        mealItem.innerHTML = `
                            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" data-id="${meal.idMeal}">
                            <p>${meal.strMeal}</p>
                        `;
                        mealDetails.appendChild(mealItem);

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

    // Fetch full meal details
    async function fetchMealDetails(mealId) {
        try {
            const response = await fetch(mealDetailAPI + mealId);
            const data = await response.json();
            const mealInfo = data.meals[0];

            let ingredientsList = "";
            let measuresList = "";
            for (let i = 1; i <= 20; i++) {
                const ingredient = mealInfo[`strIngredient${i}`]?.trim();
                const measure = mealInfo[`strMeasure${i}`]?.trim();
                if (ingredient) {
                    ingredientsList += `<li class="circle"><i class="fa-solid fa-circle"></i> ${ingredient}</li>`;
                    measuresList += `<li  class="spoon"><i class="fa-solid fa-utensil-spoon"></i> ${measure || "None"}</li>`;
                }
            }

            const steps = mealInfo.strInstructions
                .split(". ")
                .map((step, index) => step ? `<li class="square"><i class="fa-solid fa-check-square"></i> Step ${index + 1}: ${step}.</li>` : "")
                .join(" ");

            mealDetails.innerHTML = `
                <h2 class="details">MEALS DETAILS</h2>
                <div class="meal-container1">
                    <div class="meal-main">
                        <img src="${mealInfo.strMealThumb}" alt="${mealInfo.strMeal}">
                        <div class="meal-info">
                            <h2>${mealInfo.strMeal}</h2>
                            <p><strong>Category:</strong> ${mealInfo.strCategory}</p>
                            <p><strong>Source:</strong> ${mealInfo.strSource ? `<a href="${mealInfo.strSource}" target="_blank">${mealInfo.strSource}</a>` : "Not Available"}</p>
                            <p class="tag"><strong>Tags:</strong><span> ${mealInfo.strTags ? mealInfo.strTags : "N/A"}</span></p>
                            <h3><strong>Ingredients:</strong></h3>
                            <ol class="ingredients">${ingredientsList}</ol
                        </div>
                    </div>
                    <div class="meal-extra">
                        <div class="measures">
                            <h3><strong>Measures:</strong></h3> <ol>${measuresList}</ol>
                        </div>
                        <div class="instructions">
                            <h3><strong>Instructions:</strong></h3>
                            <ol class="instructions">${steps}</ol>
                        </div>
                    </div>
                </div>
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

                div.addEventListener("click", () => fetchMealsByCategory(category));
                categoriesContainer.appendChild(div);
            });
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    fetchCategories();
});