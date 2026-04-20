const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGO_URI is not set. Add it to your .env file.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    security_question: { type: String, required: true },
    security_answer: { type: String, required: true }
  },
  { collection: 'users' }
);

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/home', (req, res) => {
  res.send('Welcome to the Authentication Panel API (MongoDB)!');
});

app.post('/login', async (req, res) => {
  try {
    const { username_or_email, password } = req.body;

    if (!username_or_email || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required!' });
    }

    const user = await User.findOne({
      $or: [{ email: username_or_email }, { username: username_or_email }],
      password
    }).lean();

    if (user) {
      return res.status(200).json({ message: 'Login successful!', name: user.name });
    }

    return res.status(401).json({ message: 'Invalid credentials!' });
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
});

app.post('/register', async (req, res) => {
  try {
    const requiredFields = [
      'email',
      'password',
      'name',
      'username',
      'security_question',
      'security_answer'
    ];

    const hasAllFields = requiredFields.every((field) => field in req.body);
    if (!hasAllFields) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }]
    }).lean();

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists!' });
    }

    await User.create({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      username: req.body.username,
      security_question: req.body.security_question,
      security_answer: req.body.security_answer
    });

    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
});

app.post('/validate', async (req, res) => {
  try {
    const { username_or_email, security_question, security_answer } = req.body;

    if (!username_or_email || !security_question || !security_answer) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const user = await User.findOne({
      $or: [{ email: username_or_email }, { username: username_or_email }],
      security_question,
      security_answer
    }).lean();

    if (user) {
      return res.status(200).json({ message: 'Account found', username: user.username });
    }

    return res.status(401).json({ message: 'Invalid credentials!' });
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
});

app.post('/reset', async (req, res) => {
  try {
    const { password, username } = req.body;

    if (!password || !username) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const result = await User.updateOne({ username }, { $set: { password } });

    if (result.modifiedCount > 0) {
      return res.status(200).json({ message: 'Password reset successfully!' });
    }

    return res.status(404).json({ message: 'User not found or password unchanged.' });
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
