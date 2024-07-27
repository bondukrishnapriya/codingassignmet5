const express = require('express')

const path = require('path')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let db = null

const initalizeDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB error: ${e.message}`)
    process.exit(1)
  }
}
initalizeDbandServer()

const convertMovieObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const convertDirectorObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
app.get('/movies/', async (request, response) => {
  const getSqlQuery = `SELECT
    movie_name
    FROM
    movie`
  const moviesArray = await db.all(getSqlQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `SELECT * FROM  movie
    WHERE movie_id=${movieId}`
  const movie = await db.get(getMovieQuery)
  response.send(convertMovieObjectToResponseObject(movie))
})
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body

  const postSqlQuery = `INSERT INTO
    movie(director_id, movie_name,lead_actor)
    VALUES
    (${directorId}, '${movieName}','${leadActor}')`
  await db.run(postSqlQuery)
  response.send('Movie Successfully Added')
})
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateSqlQuery = `UPDATE 
    movie
    SET
    director_id=${directorId},
    movie_name='${movieName}',
    lead-actor='${leadActor}'
    where 
    movie_id=${movieId}
    `
  await db.run(updateSqlQuery)
  response.send('Movie details updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteSqlQuery = `DELETE FROM
    movie
    WHERE
    movie_id=${movieId}`
  await db.run(deleteSqlQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getSqlQuery = `SELECT * FROM director
    `
  const directorsArray = await db.all(getSqlQuery)
  response.send(
    directorsArray.map(each => convertDirectorObjectToResponseObject(each)),
  )
})
app.get('/directors/:directorsId/movies/', (request, response) => {
  const {directorId} = request.body
  const getSqlQuery = `SELECT 
    movie_name From
    movie
    WHERE 
    director_id=${directorId}`
  const moviesArray = await db.all(getSqlQuery)
  response.send(
    moviesArray.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})
module.exports = app
