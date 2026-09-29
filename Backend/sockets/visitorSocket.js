const { Server } = require('socket.io');

let ioInstance = null;

/**
 * Initializes the Socket.io server engine
 * @param {Object} httpServer - The native Node.js HTTP server instance
 */
const initSocket = (httpServer) => {
    // Attach Socket.io to the server and set up open CORS configurations
    const io = new Server(httpServer, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST", "PATCH"]
        }
    });

    // Handle initial client application dashboard connections
    io.on('connection', (socket) => {
        console.log(`🔌 A security/admin dashboard screen connected: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`❌ Dashboard screen disconnected: ${socket.id}`);
        });
    });

    // Save the instance locally inside this file so our controllers can use it
    ioInstance = io;
    return io;
};

/**
 * Utility function to access the active socket server from anywhere in the app
 */
const getSocketIO = () => {
    if (!ioInstance) {
        throw new Error("Socket.io has not been initialized yet!");
    }
    return ioInstance;
};

module.exports = {
    initSocket,
    getSocketIO
};
