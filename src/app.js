const http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");
const models = require("./models");

require("./config/db_connection");

const app = express();

/* =======================
   CORS (SINGLE SOURCE)
   ======================= */
const ALLOWED_ORIGINS =
  "https://gpt-premier-league-204746249106.europe-west1.run.app,http://localhost:3000";

const allowedOrigins = ALLOWED_ORIGINS.split(",");

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

/* =======================
   MIDDLEWARE
   ======================= */
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(routes);
app.disable("x-powered-by");

/* =======================
   HEALTH CHECK
   ======================= */
app.get("/", (req, res) => {
  res.send("Server is up");
});

/* =======================
   HTTP SERVER (IMPORTANT)
   ======================= */
const server = http.createServer(app);

/* =======================
   SOCKET.IO
   ======================= */
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

global.io = io;

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join-room", async (roomId) => {
    socket.join(roomId);

    const selectedPlayer = await models.players.findOne({
      where: { profile_link: "1" },
      order: [["updatedAt", "DESC"]],
    });

    io.to(roomId).emit("current_player", JSON.stringify(selectedPlayer));
  });
});

/* =======================
   START SERVER
   ======================= */
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
