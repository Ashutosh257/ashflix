
const backCoverEl = document.getElementById("back-cover")
const movieContainerEl = document.getElementById("movie-container")
const watchlistContainerEl = document.getElementById("watchlist-container")
const searchBtn = document.getElementById("search-btn") 
const switchBtn = document.getElementById("switcher") 

// copy of local storage
let watchlist = []

// Check if watchlist exists in local storage
if(!localStorage.getItem("watchlist")){
    localStorage.setItem("watchlist", JSON.stringify([]))
}else{
    watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
}

// render page based on watchlist or search
function renderPage(page){
    let html = ""
    if(page === "watchlist"){
        html = `
            <button class="my-search-btn" id="view-search">
                Search Movies
            </button>
        `

        // remove the search form from the back cover
        backCoverEl.innerHTML = `
            <p class="text-logo">
                ASHFLIX
            </p>
        `

        // render watchlist if the watchlist exists and is not empty
        watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
        if (watchlist.length === 0){
            watchlistContainerEl.innerHTML = `
                <div class="no-movies">
                    <h3>No movies in your watchlist</h3>
                </div>
            `
        }else{
            watchlistContainerEl.innerHTML = renderMovies(watchlist, "watchlist")
        }

        // clear the movie container if the page is watchlist
        movieContainerEl.innerHTML = ""

    }else{
        html = `
            <button class="watchlist-btn" id="view-watchlist">
                My Watchlist
            </button>
        `
        
        backCoverEl.innerHTML = `
            <p class="text-logo">
                ASHFLIX
            </p>
            <form>
                <input type="text" id="input" placeholder="Search Movie Title"/>
                <button id="search-btn" class="search-btn">Search</button>
            </form>
        `

        movieContainerEl.innerHTML = `
            <div class="no-movies">
                <h3>Start searching for movies...</h3>
            </div>
        `

        // clear the watchlist container if the page is search
        watchlistContainerEl.innerHTML = ""
    }
    // render the switch button based on the page parameter
    switchBtn.innerHTML = html
}

// add to watchlist
function addToWatchlist(e, movie){
    // change button text and class to remove-watchlist
    e.target.classList.remove("add-watchlist")
    e.target.classList.add("remove-watchlist")
    e.target.textContent = "Remove from Watchlist"
    e.target.id = "remove-from-watchlist"

    // add movie to watchlist
    watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    watchlist.push(movie)
    localStorage.setItem("watchlist", JSON.stringify(watchlist))
}

// remove from watchlist
function removeFromWatchlist(e, movie) {

    // change button text and class to add-watchlist
    e.target.classList.remove("remove-watchlist")
    e.target.classList.add("add-watchlist")
    e.target.textContent = "Add to Watchlist"
    e.target.id = "add-to-watchlist"

    // remove movie from watchlist
    watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    const newWatchlist = watchlist.filter((watchlistMovie) => watchlistMovie.imdbID !== movie.imdbID)
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    
    // render watchlist if the page is watchlist
    if(e.target.dataset.page === "watchlist"){
        if(newWatchlist.length === 0){
            watchlistContainerEl.innerHTML = `
                <div class="no-movies">
                    <h3>No movies in your watchlist</h3>
                </div>
            `
        }else{
            watchlistContainerEl.innerHTML = renderMovies(newWatchlist, "watchlist")
        }
    }
}

/* 
    1. check if movie is in watchlist, 
    2. if it is, add a watchlist property to the movie object with a value of true
    3. if it's not, add a watchlist property to the movie object with a value of false
*/
function checkWithWatchlist(allMovies){
    watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    return allMovies.map((movie) => {
        const found = watchlist.find((watchlistMovie) => watchlistMovie.imdbID === movie.imdbID)
        if(found){
            return {
                ...movie,
                watchlist: true
            }
        }else{
            return {
                ...movie,
                watchlist: false
            }
        }
    })
}

// render movies for search and watchlist both based on the page parameter
function renderMovies(movies, page="search"){
    let html = ""
    movies.forEach((movie) => {
        const jsonMovieObj = JSON.stringify(movie)
        html += `
            <div class="card">
                <img class="image-poster" src="${movie.Poster}" alt="${movie.Title}" />
                <div class="movie-details">
                    <h2>${movie.Title}</h2>
                    <div class="movie-info">
                        <div class="movie-ratings">
                            <p>
                                <img src="./assets/star.svg" alt="star"/>
                                ${movie.imdbRating}/10
                            </p>
                            <p>
                                <img src="./assets/timer.svg" alt="timer"/>
                                ${movie.Runtime}
                            </p>
                            <p>
                                <span class="bold">
                                    Year:
                                </span>
                                ${movie.Year}
                            </p>
                        </div>
                        <div class="movie-genre">
                            <p>
                                <span class="bold">
                                    Genre: 
                                </span>
                                ${movie.Genre}
                            </p>
                            <p>
                                <span class="bold">
                                    Language: 
                                </span>
                                ${movie.Language}
                            </p>
                        </div>
                    </div>
                    <p class="movie-plot">${movie.Plot}</p>
                    <div class="movie-cta">
                    ${
                            movie.watchlist ?
                            `<button 
                                class="btn remove-watchlist" 
                                id="remove-from-watchlist" 
                                data-page="${page}"
                                data-movie="${encodeURIComponent(jsonMovieObj)}"
                            >
                                Remove from Watchlist
                            </button>`
                            :
                            `<button 
                                class="btn add-watchlist" 
                                id="add-to-watchlist" 
                                data-page="${page}"
                                data-movie="${encodeURIComponent(jsonMovieObj)}"
                            >
                                Add to Watchlist
                            </button>`
                    }
                    </div>
                </div>

            </div>
        `
    })
    return html
}

// fetch movies from the serverless function
async function fetchMovies(e){
    const inputEl = document.getElementById("input") 
    const url = `https://ashflix.netlify.app//.netlify/functions/fetchEnvVariables/?title=${inputEl.value}`
    const response = await fetch(url)
    const data = await response.json()
    
    if(data.statusCode === 404){
        let html = `
            <div class="no-movies">
                <h3>No movies found</h3>
            </div>
        `
        movieContainerEl.innerHTML = html
        
    }else{
        const moviesCheckedWithWatchList = checkWithWatchlist(data.allMovies)
        movieContainerEl.innerHTML = renderMovies(moviesCheckedWithWatchList)
    }

}

// add event listeners for the buttons
document.addEventListener("click", (e) => {

    if(e.target.id === "search-btn"){
        e.preventDefault()
        fetchMovies(e)
    }else if(e.target.id === "add-to-watchlist"){
        const movie = JSON.parse(decodeURIComponent(e.target.dataset.movie))
        let newMovieObj = {
            ...movie,
            watchlist: true
        }

        addToWatchlist(e, newMovieObj)

    }else if(e.target.id === "remove-from-watchlist"){
        const movie = JSON.parse(decodeURIComponent(e.target.dataset.movie))
        let newMovieObj = {
            ...movie,
            watchlist: false
        }

        removeFromWatchlist(e, newMovieObj)
       
    }else if(e.target.id === "view-watchlist"){
        renderPage("watchlist")
    }else if(e.target.id === "view-search"){
        renderPage("search")
    }
})










