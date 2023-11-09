const Todo = require("../models/todo");
const User = require("../models/user");
const mongoose = require("mongoose");

const getAllTodo = async (req, res) => {
  const user = await User.findById(req.user.id).populate("todos");
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  res.status(200).json(user.todos);
};

const getTodoById = async (req, res) => {
  try {
    const todoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return res.status(400).json({ error: "ID Todo tidak valid" });
    }

    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.status(404).json({ error: "Todo tidak ditemukan" });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil Todo" });
  }
};

const createTodo = async (req, res) => {
  try {
    const { title, description, progress, completed } = req.body;

    const newTodo = new Todo({
      createdBy: req.user.id,
      title,
      progress,
      description,
      completed,
    });

    const savedTodo = await newTodo.save();

    const todoId = savedTodo._id;

    const user = await User.findById(req.user.id);

    if (user) {
      user.todos.push(todoId);
      await user.save();
    }

    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ error: "Gagal membuat todo" });
  }
};

const updateTodo = async (req, res) => {
  try {
    const todoId = req.params.id;
    const { title, progress, completed } = req.body;

    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return res.status(400).json({ error: "ID Todo tidak valid" });
    }

    const todo = await Todo.findById(todoId);

    if (req.user.id != todo.createdBy) {
      return res.status(400).json({ error: "Anda bukan pemilik todo" });
    }

    if (!todo) {
      return res.status(404).json({ error: "Todo tidak ditemukan" });
    }

    if (title) {
      todo.title = title;
    }
    if (progress !== undefined) {
      todo.progress = progress;
    }
    if (completed !== undefined) {
      todo.completed = completed;
    }

    todo.updatedAt = new Date();

    const updatedTodo = await todo.save();

    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui Todo" });
  }
};

const deleteTodoById = async (req, res) => {
  try {
    const todoId = req.params.id;
    const todo = await Todo.findById(todoId);

    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return res.status(400).json({ error: "ID Todo tidak valid" });
    }
    if (!todo) {
      return res.status(404).json({ error: "Todo tidak ditemukan" });
    }

    if (req.user.id != todo.createdBy.toString()) {
      return res.status(400).json({ error: "Anda bukan pemilik todo" });
    }

    const deletedTodo = await Todo.findOneAndDelete({ _id: todoId });

    const user = await User.findById(req.user.id);
    if (user) {
      user.todos = user.todos.filter((todo) => todo._id.toString() !== todoId);
      await user.save();
    }

    res.status(200).json({ message: "Todo berhasil dihapus", deletedTodo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Gagal menghapus Todo" });
  }
};

const deleteAllTodo = async (req, res) => {
  try {
    const userId = req.user.id;

    const deleteResult = await Todo.deleteMany({ createdBy: userId });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Tidak ada Todo yang dihapus" });
    }

    const user = await User.findById(userId);
    if (user) {
      user.todos = [];
      await user.save();
    }

    res.status(200).json({ message: "Semua Todo pengguna berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal menghapus Todo atau referensi pada pengguna" });
  }
};

module.exports = {
  getAllTodo,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodoById,
  deleteAllTodo,
};
