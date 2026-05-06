const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");

const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");

dbConnect();

app.use(cors());
app.use(express.json());

// ✔ đúng requirement
app.use("/user", UserRouter);
app.use("/", PhotoRouter);

app.listen(8081, () => console.log("Server running"));
