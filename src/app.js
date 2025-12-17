const http = require('http');
const path = require('path');
const cors = require('cors')
var express = require('express');
const routes = require('./routes');
const bodyParser = require('body-parser');
var app = express();
const models = require('./models');


require('./config/db_connection');

app.use(cors());
// app.options('*', cors());
const ALLOWED_ORIGINS="https://n05-sports.vercel.app,http://localhost:3000";

const allowedOrigins = ALLOWED_ORIGINS ? ALLOWED_ORIGINS.split(',') : [];
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(
  cors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  }),
);


app.use(routes);
app.disable("x-powered-by");
app.use(express.json());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    limit: "10240000mb",
    extended: true,
    parameterLimit: 22064900,
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use(express.static('public'))
// app.use('./public', express.static(path.join(__dirname, 'public')));




app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.send(`Server is up with base URL: ${baseUrl}`);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({error: 'an error occurred'});
});

const PORT = process.env.PORT || 8443;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const socketio = require('socket.io');

const io = socketio(server,{
  cors: {
      origin: allowedOrigins
  }
})
// let roomId = 'auctionLive'
// io.on('connection', (socket) => {
//   console.log('New connection in app js')
//   global.socket = socket;

//   console.log('Connected:', socket.id);

//   socket.join(roomId);
//   console.log(`${socket.id} joined room ${roomId}`);

//   // socket.on('join-room', () => {
//   //   socket.join(roomId);
//   //   console.log(`${socket.id} joined room ${roomId}`);
//   // });


// })
global.io = io;
io.on("connection", async (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join-room", async (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);

    let selectedPlayer = await models.players.findOne({
  where: { profile_link: "1" },
  order: [['updatedAt', 'DESC']]
});

    global.io.to(roomId).emit('current_player', JSON.stringify(selectedPlayer));

  });

  
});



module.exports = { app,server,io};