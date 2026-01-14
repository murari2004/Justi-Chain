const Case = require("../models/Case");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_courtroom", async (data) => {
      try {
        const { caseId, role, userId, opponentEmail } = data;

        const c = await Case.findOne({ caseId });
        if (!c || !c.courtroomOpen || !c.courtRoomId) {
          return socket.emit("join_error", "Courtroom is closed");
        }

        let allowed = false;

        if (role === "judge") allowed = true;

        if (
          role === "citizen" &&
          c.citizenId &&
          String(c.citizenId) === String(userId)
        ) {
          allowed = true;
        }

        if (
          role === "lawyer" &&
          c.lawyerId &&
          String(c.lawyerId) === String(userId)
        ) {
          allowed = true;
        }

        if (
          role === "police" &&
          c.policeId &&
          String(c.policeId) === String(userId)
        ) {
          allowed = true;
        }

        if (
          role === "opponent" &&
          c.opponent?.email === opponentEmail
        ) {
          allowed = true;
        }

        if (!allowed) {
          console.log("❌ Unauthorized:", {
            role,
            userId,
            citizenId: c.citizenId,
            lawyerId: c.lawyerId,
            policeId: c.policeId
          });
          return socket.emit("join_error", "Unauthorized access");
        }

        // ✅ JOIN SINGLE COURTROOM
        socket.join(c.courtRoomId);
        socket.roomId = c.courtRoomId;
        socket.role = role;

        io.to(c.courtRoomId).emit("system_message", {
          text: `${role.toUpperCase()} joined the courtroom`
        });

      } catch (err) {
        console.error(err);
        socket.emit("join_error", "Join failed");
      }
    });

    socket.on("send_message", ({ text }) => {
      if (!text || !socket.roomId) return;

      io.to(socket.roomId).emit("new_message", {
        sender: socket.role,
        text,
        time: new Date().toLocaleTimeString()
      });
    });

    socket.on("disconnect", () => {
      if (socket.roomId) {
        io.to(socket.roomId).emit("system_message", {
          text: `${socket.role?.toUpperCase()} left the courtroom`
        });
      }
    });
  });
};
