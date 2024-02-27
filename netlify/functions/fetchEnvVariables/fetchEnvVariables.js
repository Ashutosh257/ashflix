
const apiKey = process.env.MY_API_KEY

async function getMoreInfo(allMovies, limit=10){

  const finalMovies = await Promise.all(allMovies.slice(0, limit).map(async (movie) => {
      const response = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`)
      const data = await response.json()
      return data
  }))

  // console.log(finalMovies)
  return finalMovies
}

const handler = async (event) => {

  console.log(event)

  try {
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${event.queryStringParameters.title}`
    const res = await fetch(url)
    const data = await res.json()

    if(data.Response === "False"){
        return {
          statusCode: 404,
          body: JSON.stringify({ 
            statusCode: 404,
            message: "No Movies Found!" 
          })
        }
    }else{
        
        const allMovies = await getMoreInfo(data.Search)
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            statusCode: 200,
            allMovies: allMovies 
          })
        }
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }