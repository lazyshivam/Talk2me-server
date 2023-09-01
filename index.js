const express = require("express");
const connectToMongo = require('./db');
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
connectToMongo();
const httpServer = createServer(app);



app.use('/api/auth', require('./routes/auth'));

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"||"https://talk02me.netlify.app"],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 8080;
app.use("/", (req, res) => {
  res.send("server is running");
});

// Import the initializeSocket function from socketFunctions.js
const { initializeSocket } = require('./socketFunctions');
// Initialize socket functionality
initializeSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
