const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')
const app = express()
app.use(express.json())
let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()

const covertMovieNameIntoPascalCase = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}
app.get('/movies/', async (request, response) => {
  const getAllMovieQuery = `
    SELECT 
    movie_name
    FROM 
    movie;`
  const movieArray = await db.all(getAllMovieQuery)
  response.send(
    movieArray.map((each) => covertMovieNameIntoPascalCase(movieArray)),
  )
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
    INSERT INTO 
    movie (director_id,movie_name,lead_actor)
    VALUES
    ('${directorId}', '${movieName}', '${leadActor}');`
  const dbResponse = await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

const covertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT
    *
    FROM 
    movie
    WHERE
    movie_id = ${movieId}`

  const movie = await db.get(getMovieQuery)
  response.send(covertDbObjectToResponseObject(movie))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuerry = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name = ${movieName},
    lead_actor = ${leadActor}
    WHERE
    movie_id = ${movieId}`
  await db.run(updateMovieQuerry)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE 
    movie
    WHERE
    movie_id = ${movieId}`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

const covertDirectorDetailsIntoPascalCase = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/directors/', async (request, response) => {
  const getAllDirectorQuery = `
    SELECT
    *
    FROM 
    director;`
  const movieArray = await db.all(getAllDirectorQuery)
  response.send(
    movieArray.map((each) => covertDirectorDetailsIntoPascalCase(each)),
  )
})

const covertMovieNamePascalCase = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `
    SELECT
    movie_name
    FROM 
    director INNER JOIN movie
    ON director.director_id = movie.director_id
    WHERE
    director.director_id = ${directorId}`
  const movie = await db.all(getDirectorMoviesQuery)
  response.send(movie.map((each) => covertMovieNamePascalCase(each)))
})

module.exports = app;
