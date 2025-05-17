const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const Photo = require("../db/photoModel"); // import model Photo
const Comment = require("../db/commentModel"); // import model Comment

const router = express.Router();

// GET /api/user/list
// Trả về danh sách user + số lượng photos và comments
router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name").exec();

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const photoCount = await Photo.countDocuments({ user_id: user._id });
        const commentCount = await Comment.countDocuments({
          user_id: user._id,
        });
        return {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          photoCount,
          commentCount,
        };
      })
    );

    res.json(usersWithCounts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/user/:id
// Trả về thông tin chi tiết user
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const user = await User.findById(
      id,
      "_id first_name last_name location description occupation"
    ).exec();
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/user/:id/comments
// Trả về danh sách comment của user kèm thumbnail của photo
router.get("/:id/comments", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const comments = await Comment.find({ user_id: id }).exec();

    // map thêm thumbnail photo
    const detailedComments = await Promise.all(
      comments.map(async (comment) => {
        const photo = comment.photo_id
          ? await Photo.findById(comment.photo_id).exec()
          : null;

        return {
          comment_id: comment._id,
          photo_id: photo ? photo._id : null,
          photo_thumbnail_url: photo ? photo.thumbnail_url : null,
          comment_text: comment.text,
          photo_detail_url: `/photos/photosOfUser/${photo ? photo._id : ""}`,
        };
      })
    );

    res.json(detailedComments);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
