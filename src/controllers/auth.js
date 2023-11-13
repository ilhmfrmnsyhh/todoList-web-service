const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are mandatory!" });
    }

    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
      return res.status(400).json({ error: "User already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      return res.status(201).json({ _id: user.id, email: user.email });
    } else {
      return res.status(400).json({ error: "User data is not valid" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const signin = async (req, res) => {
  try {
    console.log('req.body')
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).send("Email or password is incorrect");
    }

    console.log('findone')

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Password is incorrect");
    }

    console.log('passinv')
    const token = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.SECRET_JWT,
      {
        expiresIn: 604800,
      }
    );

    res.status(200).send({
      token,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  signin,
  signup,
};
