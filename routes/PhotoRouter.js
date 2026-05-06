const express = require("express");
const router = express.Router();
const Photo = require("../db/photoModel");
const User = require("../db/userModel");

// photos of user
router.get("/photosOfUser/:id", async (req, res) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id }).lean();

    const result = await Promise.all(
      photos.map(async (photo) => {
        const comments = await Promise.all(
          (photo.comments || []).map(async (c) => {
            const user = await User.findById(
              c.user_id,
              "_id first_name last_name"
            ).lean();

            return {
              _id: c._id,
              comment: c.comment,
              date_time: c.date_time,
              user,
            };
          })
        );

        return {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(400).send("Error");
  }
});

module.exports = router;
