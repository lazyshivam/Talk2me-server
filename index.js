const express = require("express");
const connectToMongo=require('./db')
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { URLSearchParams } = require("url");
require('dotenv').config();

const app=express();
app.use(cors());
app.use(express.json());
connectToMongo();
const httpServer = createServer(app);

// Initialize PeerJS server

app.use('/api/auth',require('./routes/auth'));

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
  socket.emit('me', socket.id);
   socket.on("new-user-joined", (user) => {{
         users[user.email] =user;
         console.log("user joined ",users[user.email]);
        socket.broadcast.emit("user-joined",users);
   }});
  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
  });
  

  // ################for video call################
   // Join a room

   // Handle call requests
   socket.on('callUser', ({userToCall,signalData,from,name}) => {
    console.log("Call received from",userToCall);
     io.to(userToCall).emit('calluser', { signal: signalData, from,name });
   });
 
   // Handle call acceptance
   socket.on('answercall', (data) => {
     io.to(data.to).emit('callaccepted', data.signal);
   });


   socket.on("disconnect", () => {
     socket.broadcast.emit("User disconnected")
    console.log("User disconnected:",socket.id);
    // else the socket will automatically try to reconnect
  });
  
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

