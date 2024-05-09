require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
const path = require('path');
const Sentry = require('./libs/sentry');
const http = require('http');
const server = http.createServer(app);

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// handle routes backend
const authRoutes = require('./routes/auth.routes');
app.use('/api/v1', authRoutes);

// handle routes frontend
const viewRoutes = require('./routes/view.routes');
app.use('/', viewRoutes);

// setting ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// handle socket.io (server)
const { Server } = require("socket.io");
const io = new Server(server);

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// 500 error handler
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        status: false,
        message: err.message,
        data: null
    });
});

// 404 error handler
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        message: `are you lost? ${req.method} ${req.url} is not registered!`,
        data: null
    });
});

module.exports = app;
