const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(400).json({ error: "User not found!" });
  }

  req.user = user;

  return next();
}

app.post("/users", (req, res) => {
  const { name, username } = req.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return res.status(400).json({ error: "Username already exists!" });
  }

  const userToAdd = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(userToAdd);

  return res.status(201).json(userToAdd);
});

app.get("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.status(200).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;

  const { user } = req;

  const todoToAdd = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todoToAdd);

  return res.status(201).json(todoToAdd);
});

app.put("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { title, deadline } = req.body;
  const { user } = req;

  const rightTodo = user.todos.find((todo) => todo.id === id);

  if (!rightTodo) {
    return res.status(404).json({ error: "Not Found" });
  }

  rightTodo.title = title;
  rightTodo.deadline = new Date(deadline);

  return res.status(200).json(rightTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (req, res) => {
  const { id } = req.params;

  const { user } = req;

  const rightTodo = user.todos.find((todo) => todo.id === id);

  if (!rightTodo) {
    return res.status(404).json({ error: "Not Found" });
  }

  rightTodo.done = true;

  return res.status(200).json(rightTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const rightTodo = user.todos.find((todo) => todo.id === id);

  if (!rightTodo) {
    return res.status(404).json({ error: "Not Found" });
  }

  user.todos.splice(rightTodo, 1);

  return res.status(204).send();
});

module.exports = app;
