const express = require("express");
const connectToMongo=require('./db')
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { URLSearchParams } = require("url");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
connectToMongo();

app.use('/api/auth',require('./routes/auth'));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 8080;
app.use("/", (req, res) => {
  res.send("server is running");
});

const users={};
console.log(Object.keys(users).length);
/*socket releted stuff*/
io.on("connection", (socket) => {
   socket.on("new-user-joined", (user) => {{
         users[user.email] =user;
         console.log("user joined ",users[user.email]);
        socket.broadcast.emit("user-joined",users);
   }});
  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
    console.log("Send message: " + data);
  });
  
  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
      
    }
    console.log("User disconnected:",socket.id);
    // else the socket will automatically try to reconnect
  });

  socket.on('error', (error) => {
    console.error(`Socket error: ${error}`);
  });
  
  
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


// setInterval(()=>{
  // if (Object.keys(users).length !== 0) {
    // console.log('The object is empty');
    console.log(users)
  // } 
  // console.log("hi there")

// },5000)
