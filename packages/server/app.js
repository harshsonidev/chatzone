const express = require("express");
const path = require("path");
const morgan = require("morgan");
const app = express();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const socket = require("socket.io");
const mongoose = require("mongoose");

// Routers
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const appRouter = require("./routes");

dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 4000;

const DB =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE
    : process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log(`App connected with ${res.connection.name} database`);
  });

const server = app.listen(port, () => {
  console.log(
    `App running in ${app.get("env")} mode on ${`http://127.0.0.1:${port}`}`
  );
});

// socket.io
const io = socket(server, {
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
});

const onlineUsers = {};

io.on("connection", (socket) => {
  socket.on("add-new-user", (userId) => {
    onlineUsers[userId] = socket.id;
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers[data.to];
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieved", {
        sender: data.from,
        reciever: data.to,
        message: data.message,
      });
    }
  });

  socket.on("typing-msg", (data) => {
    const sendUserSocket = onlineUsers[data.to];
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("typing-msg", {
        sender: data.from,
        reciever: data.to,
      });
    }
  });

  socket.on("typing-stopped", (data) => {
    const sendUserSocket = onlineUsers[data.to];
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("typing-stopped", {
        sender: data.from,
        reciever: data.to,
      });
    }
  });

  socket.on("disconnect", function () {
    Object.keys(onlineUsers).find((userId) => {
      if (onlineUsers[userId] === socket.id) {
        console.log("User Disconnected:", userId);
        delete onlineUsers[userId];
      }
    });
  });
});

// Global Middlewares
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "..", "client", "build")));

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 40,
  windowMs: 60 * 1000,
  message: "Too many requests from this IP, please try again after a minute.",
});

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Routes(Middlewares)
app.use("/api", limiter);
app.use("/api/v1", appRouter);

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

app.use("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION 😑. Shutting down...");
  console.log(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
