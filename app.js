const debug = require("debug");
const http = require("http");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const indexRouter = require("./routes/index");

const corsOptions = {
  origin: "http://localhost:3002",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api", indexRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.json({
    success: false,
    code: err.status || 500,
    status: err.status == 404 ? "Not found" : "Internal server error",
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3002", credentials: true },
});

io.sockets.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.join(room);

    const clients = io.sockets.adapter.rooms.get(room);

    console.log("users ", clients);

    console.log(`${socket.id} joined ${room}`);
  });
});

const Messages = require("./models/message");

Messages.watch().on("change", (data) => {
  if (data.operationType == "insert") {
    delete data.fullDocument.__v;
    console.log(data.fullDocument.conversation.toString());

    io.to(data.fullDocument.conversation.toString()).emit(
      "new-message",
      data.fullDocument
    );
  }
});

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

module.exports = app;
