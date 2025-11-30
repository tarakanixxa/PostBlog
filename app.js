const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/postBlog";

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, 
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, 
    },
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "public")));


app.use("/", authRoutes);
app.use("/", postRoutes);


app.get("/", async (req, res) => {
  try {
    const Post = require("./models/postModel");

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "username")
      .lean();

    res.render("index", { title: "Home Page", posts });
  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
});

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
