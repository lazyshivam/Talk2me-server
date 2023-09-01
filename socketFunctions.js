const users = {};
const formatTime = (date) => {
  return `${date.getHours()}:${date.getMinutes()}`;
}
const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    socket.emit("me", socket.id);

    socket.on("new-user-joined", (user) => {
      users[socket.id] = user;
      console.log("user joined ", users);
      const messageData = {
        content: user.name+" "+"joined",
        time: formatTime(new Date()),
        sender: {name:user.name, email:user.email},
        type:'alert'
    };
      socket.broadcast.emit("user_joined", messageData);
    });

    socket.on("send_message", (data) => {
      socket.broadcast.emit("receive_message", data);
    });

    // ################for video call################
    // Handle call requests
    socket.on('callUser', ({ userToCall, signalData, from, name }) => {
      console.log("Call received from", userToCall);
      io.to(userToCall).emit('calluser', { signal: signalData, from, name });
    });

    // Handle call acceptance
    socket.on('answercall', (data) => {
      io.to(data.to).emit('callaccepted', data.signal);
    });

    socket.on("disconnect", () => {
      if (users[socket.id]) {
        const disconnectedUser = users[socket.id];
        const messageData = {
          content: disconnectedUser.name+" "+"left",
          time: formatTime(new Date()),
          sender: {name:disconnectedUser.name, email:disconnectedUser.email},
          type:'alert'
      };
        delete users[socket.id];
        socket.broadcast.emit("user_left", messageData);
        console.log("User disconnected:", socket.id);
      }
    });
  });
};

module.exports = { initializeSocket };
