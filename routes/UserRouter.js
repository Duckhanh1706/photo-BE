const express = require("express");
const router = express.Router();
const User = require("../db/userModel");

// 1. user list
router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    res.json(users);
  } catch (err) {
    res.status(500).send(err);
  }
});

// 2. user detail
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
      "_id first_name last_name location description occupation"
    );

    if (!user) return res.status(400).send("Invalid user id");

    res.json(user);
  } catch (err) {
    res.status(400).send("Invalid id");
  }
});

module.exports = router;
