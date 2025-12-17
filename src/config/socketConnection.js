const socketio = require('socket.io');
const { server } = require('../app');

const io = socketio(server,{
    cors: {
        origin: "http://localhost:3000"
    }
})

const socketConnection = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            io.on('connection', (socket) => {
                console.log('New connection in socket connection js')
                socket.on('current_player', (player)=>{
                    console.log("on current_player == ")
                    socket.emit('update_current_player', player);
                })
                resolve(socket)
            })
        }catch(err){
            reject(err);
        }
    })
}

module.exports = {
    socketConnection:socketConnection
}
    