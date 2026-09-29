// 1. Force Node.js to use stable public DNS servers (fixes the network error)
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// 2. Load your environment variables BEFORE anything else
require("dotenv").config();

// 3. Import native Node HTTP and Socket modules
const http = require("http");
const { initSocket } = require("./sockets/visitorSocket");

// 4. Import cron job configuration 
const startAutoCheckoutJob = require('./cjobs/cronJobs.js'); 

// 5. Now it is safe to import express and your database module
const express = require("express");
const connectDB = require("./settings/db.js");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;

//Brand new security module
const auth = require("./authModule/authRoutes.js");

// 6. Import your modular route controllers
const visitors = require("./routes/visitors.js");
const dashboard = require("./dashboardmodule/dashboardRoutes.js"); // Your isolated module!

const app = express();

// 7. Create native Node HTTP Server wrapper around your Express app
const server = http.createServer(app);

// 8. Initialize the modular Socket.io WebSocket engine
initSocket(server);
console.log('⚡ WebSocket engine initialized (Dashboard Server Link Active).');

app.use(express.json());

// 9. Fire up the background task manager loop
startAutoCheckoutJob();
console.log('⚡ Background task manager initialized (Midnight Auto-Checkout Active).');

// 10. Mount your application API routes
app.use("/VMS/version1/visitors", visitors);
app.use("/VMS/version1/dashboard", dashboard); // Mounts your clean dashboard paths!
app.use("/VMS/version1/auth", auth); // NEW CODE: Mounts your clean authentication paths!
// 11. Connect to MongoDB and boot up the server via our HTTP wrapper
const startserver = async() => {
    await connectDB();
    // We update this line to use 'server.listen' instead of 'app.listen'
    server.listen(PORT, () => {
        console.log(`App Listening on Port ${PORT} and WebSockets are live!`);
    });
};

startserver();
