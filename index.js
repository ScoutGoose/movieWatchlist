// OMDB API KEY
const apiKey = config.API_KEY;

// GLOBAL EVENT LISTENERS
document.addEventListener("click", (event) => {
  if (event.target.dataset.addMovieId || event.target.dataset.addMovieIdIcon) {
    const movieId =
      event.target.dataset.addMovieId || event.target.dataset.addMovieIdIcon;
    addToWatchlist(movieId);
  } else if (event.target.className === "submit-btn") {
    searchAndRender(event);
  }
});

// SEND GET REQUEST TO GET PROMISE WITH MOVIE LIST THAT WE ARE LOOKING FOR (SHORT VERSION)
async function getMovieList(movieTitle) {
  const res = await fetch(
    `http://www.omdbapi.com/?apikey=${apiKey}&s=${movieTitle}`
  );
  const data = await res.json();
  return data;
}

// SENT GET REQUEST USING MOVIE ID TO GET EXPANDED VERSION OF MOVIE DESCRIPTION
async function getSingleMovieExpandedDetails(movieId) {
  const res = await fetch(
    `http://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}`
  );
  const data = await res.json();
  return data;
}

// CHECK IF MOVIE IS RATED BY THREE MOVIE AGGREGATORS OR ONLY ONE AND RETURNS A PART OF HTML LAYOUT
function checkForRatings(movie) {
  if (movie.Ratings.length > 1) {
    return `
      <p class="movie-rating">
      <span class="imdb-rating">
      <img src="./icons/Imdb_logo.svg.png" alt="Imdb logo" />
      ${movie.Ratings[0].Value}
      </span>
      <span class="mc-rating">
      <img src="./icons/Metacritic_logo.svg.png" alt="Metacritic logo" />
      ${movie.Ratings[2].Value}
      </span>
      <span class="rt-rating">
      <img
      src="./icons/Rotten_Tomatoes_logo.svg.png"
      alt="Rotten Tomatoes logo"
      />
      ${movie.Ratings[1].Value}
      </span>
      </p>
      `;
  }
  return `
    <p class="movie-rating">
    <span class="imdb-rating">
    <img src="./icons/Imdb_logo.svg.png" alt="Imdb logo" />
    ${movie.Ratings[0].Value}
    </span>
    </p>
    `;
}

// RETURN COMPLETED LAYOUT FOR SINGLE MOVIE CARD
function getSingleMovieLayout(movie) {
  return `
    <section class="single-movie">
    <div class="poster">
    <img
    src="${movie.Poster}"
    alt="${movie.Title} movie poster"
    />
    </div>
    <div class="movie-info">
    <h3 class="movie-title">${movie.Title}</h3>
    ${checkForRatings(movie)}
    <div class="length-and-genre">
    <p class="length">${movie.Runtime}</p>
    <p class="genre">${movie.Genre.split(",").splice(0, 2).join(", ")}</p>
    <button class="add-btn" data-add-movie-id = ${movie.imdbID}>
    <i class="fa-solid fa-square-plus" data-add-movie-id-icon = ${
      movie.imdbID
    }></i>
    Watchlist
    </button>
    </div>
    <p class="movie-description">
    ${movie.Plot.length <= 135 ? movie.Plot : movie.Plot.slice(0, 136) + "..."}
    </p>
    </div>
    </section>
    `;
}

// SEARCH AND RENDER SEARCHED MOVIES TO A USER
async function searchAndRender(event) {
  const movieTitle = document.querySelector(".search-bar").value;
  // CHECK FOR AN EMPTY INPUT
  if (!movieTitle) {
    document
      .querySelector(".search-bar")
      .setCustomValidity("Please enter movie title");
  } else {
    event.preventDefault();
    try {
      // REMOVE WHITESPACES IN THE BEGINNING AND END, REPLACE SPACES WITH + SIGNS FOR CORRECT GET REQUEST
      const movieList = await getMovieList(
        movieTitle.trim().replaceAll(" ", "+")
      );
      const promiseArr = movieList.Search.map((movie) =>
        getSingleMovieExpandedDetails(movie.imdbID)
      );
      const movieDetails = await Promise.all(promiseArr);
      const moviesLayout = movieDetails.map(getSingleMovieLayout).join("");
      document.querySelector(".results-placeholder").classList.add("hidden");
      document.querySelector(".search-results").innerHTML = moviesLayout;
    } catch (error) {
      document.querySelector(
        ".results-placeholder"
      ).lastElementChild.textContent = "No matches found";
    }
  }
}

// ADD MOVIE TO A WATCHLIST STORED IN LOCAL STORAGE
async function addToWatchlist(movieId) {
  try {
    if (checkForDuplicates(movieId)) {
      throw new Error("Movie is already in the list");
    }
    const movie = await getSingleMovieExpandedDetails(movieId);
    const movieList = JSON.parse(localStorage.getItem("myOMDBWatchlist")) || [];
    localStorage.setItem(
      "myOMDBWatchlist",
      JSON.stringify([...movieList, movie])
    );
  } catch (error) {
    console.error(error);
  }
}

// CHECK LOCAL STORAGE FOR DUPLICATES
function checkForDuplicates(movieId) {
  const watchlist = JSON.parse(localStorage.getItem("myOMDBWatchlist")) || [];
  return watchlist.find((movie) => movie.imdbID === movieId);
}

export { getSingleMovieLayout, checkForRatings };
