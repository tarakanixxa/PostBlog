const User = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const { username, password } = req.body;
  const exist = await User.findOne({ username });
  if (exist) return res.send("Username already taken");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashed });

  req.session.userId = user._id;
  req.session.username = user.username;

  res.redirect("/");
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.send("User not found");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.send("Wrong password");

  req.session.userId = user._id;
  req.session.username = user.username;

  res.redirect("/");
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.deleteAccount = async (req, res) => {
  if (!req.session.userId) return res.redirect("/");
  await User.findByIdAndDelete(req.session.userId);
  req.session.destroy(() => res.redirect("/"));
};
exports.editProfile = async (req, res) => {
  if (!req.session.userId) return res.status(401).send("Not logged in");

  const { username, password } = req.body;
  const updates = {};

  if (username && username.length > 0) updates.username = username;
  if (password && password.length > 0)
    updates.password = await bcrypt.hash(password, 10);

  try {
    if (Object.keys(updates).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        req.session.userId,
        updates,
        { new: true, runValidators: true }
      );

      req.session.username = updatedUser.username;
    }

    res.status(200).send("Profile updated");
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send("Username already taken");
    }

    console.error(err);
    res.status(500).send("Server error");
  }
};



exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.send("User not found");

    res.render("profile", { title: `${user.username}'s Profile`, user });
  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
};