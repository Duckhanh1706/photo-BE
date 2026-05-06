const express = require("express");
const router = express.Router();
const User = require("../db/userModel");
const Photo = require("../db/photoModel");

router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name").lean();
    const photos = await Photo.find({}, "user_id comments").lean();

    const result = users.map((u) => {
      const uid = u._id.toString();

      // 📷 photo count
      const photoCount = photos.filter(
        (p) => p.user_id?.toString() === uid
      ).length;

      // 💬 comment count
      let commentCount = 0;

      photos.forEach((p) => {
        (p.comments || []).forEach((c) => {
          if (c.user_id?.toString() === uid) {
            commentCount++;
          }
        });
      });

      return {
        ...u,
        photoCount,
        commentCount,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

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
