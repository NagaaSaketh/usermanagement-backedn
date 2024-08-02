const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const JWT_SECRET = "MYASSESMENT123";
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb+srv://saketh:saketh%40123@saketh.5jhgvil.mongodb.net/?retryWrites=true&w=majority&appName=Saketh/users",
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: false },
    bio: { type: String, required: false },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, age, bio } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const user = new User({ name, email, password, age, bio });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.status(200).json({ token, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/users", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.userId;
    // Exclude the current user
    const users = await User.find({ _id: { $ne: userId } });
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
