const express = require("express");
const app = express();
require("dotenv").config();
require("./db/connect");
const Router = require("./routes/rootRouter");
const { default: helmet } = require("helmet");
app.use(helmet());
app.use(express.json());
app.use(express.static("public"));
app.use("/public", express.static("public"));
app.use("/api/v1", Router);

app.get("/", (req, res) => {
  res.send("hello planet");
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port 3000");
});
