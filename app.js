const express = require("express");
const connectDb = require("./config/dbConnection");
require("dotenv").config();
const cors = require('cors');

connectDb();
const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/todos", require("./src/routes/todoRoutes"));
app.use("/api/auth", require("./src/routes/userRoutes"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
