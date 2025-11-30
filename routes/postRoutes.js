const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authRequired = require("../middleware/authRequired");


router.get("/all-posts", async (req, res) => {
  const Post = require("../models/postModel");
  const posts = await Post.find({})
    .populate("author", "username")
    .sort({ createdAt: -1 })
    .lean();
  res.render("index", { title: "All Posts", posts });
});


router.get("/posts", authRequired, postController.getPostsPage);


router.post("/posts/create", authRequired, postController.createPost);


router.get("/posts/edit/:id", authRequired, postController.getEditPost);
router.post("/posts/edit/:id", authRequired, postController.updatePost);

router.get("/search", async (req, res) => {
  const query = req.query.q || "";
  const Post = require("../models/postModel");

  try {
    const posts = await Post.find({ title: { $regex: query, $options: "i" } }) 
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .lean();

    res.render("index", { title: `Search: ${query}`, posts, session: req.session });
  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
});


router.post("/posts/delete/:id", authRequired, postController.deletePost);

module.exports = router;
