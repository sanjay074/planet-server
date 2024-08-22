const express = require("express");
const cors  =require("cors") 
const app = express();
require("dotenv").config();
require("./db/connect");
const Router = require("./routes/rootRouter");
const { default: helmet } = require("helmet");
app.get("/", (req, res) => {
  res.send("hello planet");
});
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use("/public", express.static("public"));
app.use("/api/v1", Router);
app.use((req, res, next) => {
  res.status(404).json({
      status:false,
      error: 'API URL not found',
      message: `The requested URL ${req.originalUrl} was not found on this server.`,
  });
});

const Port = process.env.PORT||3000

app.listen(process.env.PORT,() => {
  console.log(`Server running on port ${Port}`);
});
