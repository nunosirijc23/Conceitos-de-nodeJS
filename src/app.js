const express = require("express");
const cors = require("cors");
const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

function logRequest(request, response, next) {
  const { method, url } = request

  const logLabel = `[${method.toUpperCase()} ${url}]`

  console.time(logLabel)

  next()

  console.time(logLabel)
}

function validateID(request, response, next) {
  const id = request.params

  if(!isUuid(id))
    response.status(400).json({message: 'Bad Request'})
  
  next()
}

app.use(express.json());
app.use(cors());
app.use(logRequest)

const repositories = [];

app.get("/repositories", (request, response) => {
  const { title } = request.params

  const results = title ? repositories.filter( repository => repository.title.includes(title)) : repositories

  return response.json(results)
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body

  const repository = { id: uuid(), title, url, techs, likes: 0}

  repositories.push(repository)

  return response.json(repository)
});

app.put("/repositories/:id", validateID, (request, response) => {
  const id = request.params
  const { title, url, techs } = request.body

  const repositoryIndex = repositories.findIndex( repository => repository.id === id)

  if (repositoryIndex < 0)
    return response.status(400).json({message: 'Repository not found'})
  
  const repository = repositories.find( repository => repository.id === id)

  repository.title = title
  repository.url = url
  repository.techs = techs

  repositories[repositoryIndex] = repository

  return response.json(repository)
});

app.delete("/repositories/:id", (request, response) => {
  const id = request.params

  const repositoryIndex = repositories.findIndex( repository => repository.id === id)

  if (repositoryIndex < 0)
    return response.status(204).send()
  
  repositories.splice(repositoryIndex, 1)

  return response.status(202).send()
});

app.post("/repositories/:id/like", (request, response) => {
  const id = request.params

  const repository = repositories.find( repository => repository.id === id)

  if (!repository)
    response.status(400).send()

  repository.likes += 1
  let like = repository.likes

  return response.json(repository)
});

module.exports = app;
