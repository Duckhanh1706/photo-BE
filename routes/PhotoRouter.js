const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");

const router = express.Router();

// 3. GET /photosOfUser/:id
router.get("/photosOfUser/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    // Check user existence
    const userExists = await User.exists({ _id: id });
    if (!userExists) {
      return res.status(400).json({ error: "User not found" });
    }

    // Find photos of the user
    const photos = await Photo.find({ user_id: id }).exec();

    // Collect user IDs from comments to fetch user info
    const userIdsSet = new Set();
    photos.forEach((photo) => {
      photo.comments.forEach((comment) => {
        if (comment.user_id) userIdsSet.add(comment.user_id.toString());
      });
    });
    const userIds = Array.from(userIdsSet);
    const users = await User.find(
      { _id: { $in: userIds } },
      "_id first_name last_name"
    ).exec();

    // Map user info for quick lookup
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id] = {
        _id: u._id,
        first_name: u.first_name,
        last_name: u.last_name,
      };
    });

    // Build response
    const photosResponse = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: photo.comments.map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: userMap[comment.user_id] || null,
      })),
    }));

    res.json(photosResponse);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
