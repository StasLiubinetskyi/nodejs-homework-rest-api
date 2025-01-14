const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const usersRouter = require("./routes/api/usersRoutes");
const contactsRouter = require("./routes/api/contactsRoutes");
const errorHandler = require("./helpers/errorHandler");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);

app.use(express.static("public"));

app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
  next();
});

app.use(errorHandler);

module.exports = app;
