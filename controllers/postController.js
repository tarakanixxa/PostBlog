const Post = require("../models/postModel");
const mongoose = require("mongoose");

exports.getPostsPage = async (req, res) => {
  try {
    res.render("create", { title: "Create Post" });
  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
};


exports.createPost = async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) return res.send("Title and description required");

  try {
    await Post.create({
      title,
      description,
      author: new mongoose.Types.ObjectId(req.session.userId)
    });

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
};


exports.getEditPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.send("Post not found");
    if (post.author.toString() !== req.session.userId) return res.send("Not authorized");

    res.render("edit", { title: "Edit Post", post });
  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
};

exports.updatePost = async (req, res) => {
  const { title, description } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.send("Post not found");
    if (post.author.toString() !== req.session.userId) return res.send("Not authorized");

    post.title = title;
    post.description = description;
    await post.save();

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.send("Post not found");
    if (post.author.toString() !== req.session.userId) return res.send("Not authorized");
    await post.deleteOne();

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
};
