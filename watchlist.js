import { checkForRatings } from "./index.js";

// GLOBAL EVENT LISTENER
document.addEventListener("click", (event) => {
  if (
    event.target.dataset.removeMovieId ||
    event.target.dataset.removeMovieIdIcon
  ) {
    const movieId =
      event.target.dataset.removeMovieId ||
      event.target.dataset.removeMovieIdIcon;
    removeFromList(movieId);
  }
});

// CHECK LOCAL STORAGE FOR EXISTING WATCHLIST AND RENDER IT IF IT EXISTS
function renderWatchlist() {
  document.querySelector(".watchlist-placeholder").classList.remove("hidden");
  const watchlist = JSON.parse(localStorage.getItem("myOMDBWatchlist"));
  document.querySelector(".watchlist").innerHTML =
    createWatchlistLayout(watchlist);
  if (watchlist.length) {
    document.querySelector(".watchlist-placeholder").classList.add("hidden");
  }
}

// CREATE LAYOUT FOR SINGLE MOVIE IN THE WATCHLIST
function createWatchlistLayout(watchlistArr) {
  return watchlistArr
    .map(
      (movie) => `
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
    <button class="add-btn" data-remove-movie-id = ${movie.imdbID}>
    <i class="fa-solid fa-square-minus" data-remove-movie-id-icon = ${
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
    `
    )
    .join("");
}

// REMOVE MOVIE FROM WATCHLIST
function removeFromList(movieId) {
  const watchlist = JSON.parse(localStorage.getItem("myOMDBWatchlist"));
  const filtered = watchlist.filter((movie) => movie.imdbID !== movieId);
  localStorage.setItem("myOMDBWatchlist", JSON.stringify(filtered));
  renderWatchlist();
}

// INITIAL RENDER
renderWatchlist();
