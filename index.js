const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
// const CommentRouter = require("./routes/CommentRouter");

// Kết nối database
dbConnect();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
// app.use("/api/comment", CommentRouter); // nếu có comment router

// Route test root
app.get("/", (req, res) => {
  res.send({ message: "Hello from photo-sharing app API!" });
});

// Bắt đầu server
const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
