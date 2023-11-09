const express = require("express");
const router = express.Router();
const {
  getAllTodo,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodoById,
  deleteAllTodo,
} = require("../controllers/todo");
const validateToken = require("../middleware/validateTokenHandler");

router.use(validateToken);
router.get("/", getAllTodo);
router.get("/:id", getTodoById);
router.post("/", createTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodoById);
router.delete("/", deleteAllTodo);
module.exports = router;
