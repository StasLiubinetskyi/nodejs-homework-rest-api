const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/api/authRoutes");
const contactsRouter = require("./routes/api/contactsRoutes");
const errorHandler = require("./helpers/errorHandler");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use("/api/auth", authRouter);


app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
  next();
});

app.use(errorHandler);

module.exports = app;
