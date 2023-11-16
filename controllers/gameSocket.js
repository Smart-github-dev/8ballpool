const Game = require("./Game");

const games = new Map();
const gameSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("createroom-req", (data) => {
      var roomid = socket.id;
      const keyExists = games.has(roomid);
      if (!keyExists) {
        games.set(roomid, new Game(io, roomid, data));
        games.get(roomid).joinroom(socket);

        socket.emit("createroom-res", {
          roomid,
          success: true,
        });
        if (!data.isPrivate) {
          io.emit("add-room", {
            roomid: roomid,
            players: [{ key: "player1", playerid: socket.id }],
            betamount: data.amount,
          });
        }
      } else {
        socket.emit("createroom-res", {
          msg: "already exists",
          success: false,
        });
      }
    });

    socket.on("joinroom-req", (id) => {
      if (!id) {
        games.forEach((r) => {
          if (!id && r.getPlayerCount() < 2) {
            id = r.getRoomId();
          }
        });
      }

      const keyExists = games.has(id);
      if (keyExists) {
        games.get(id).joinroom(socket);
      } else {
        socket.emit("joinroom-res", { msg: "not exists", success: false });
      }
    });

    socket.on("leaveroom-req", (id) => {
      id = id || socket.roomid;
      const keyExists = games.has(id);
      if (keyExists) {
        var room = games.get(id);
        room.leaveroom(socket, id);
        if (room.getPlayerCount() == 0) {
          games.delete(id);

          io.emit("remove-room", { roomid: id });
          console.log("del :---------------");
        }
      } else {
        socket.emit("leaveroom-res", "NOT EXISTS ROOM");
      }
    });

    socket.on("getall-room", () => {
      socket.emit(
        "setall-room",
        Array.from(games)
          .filter((room) => !room[1].getRoomPermission())
          .map((room) => {
            return {
              roomid: room[0],
              players: room[1].getPlayers(),
              betamount: room[1].getBetAmount(),
            };
          })
      );
    });

    socket.on("disconnect", function () {
      if (socket.roomid) {
        var room = games.get(socket.roomid);
        if (room) {
          room.leaveroom(socket, socket.roomid);
          if (room.getPlayerCount() == 0) {
            io.emit("remove-room", { roomid: socket.roomid });
            games.delete(socket.roomid);
            console.log("del :");
          }
        }
      }
    });
  });
};

module.exports = gameSocket;
