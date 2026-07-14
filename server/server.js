require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").MongoStore || require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const connectDB = require("./config/db");
const User = require("./models/user");
const routes = require("./routes");
const { startDailySyncCron } = require("./services/hotelService");
const { errorHandler, ExpressError } = require("./middlewares/errorMiddleware");

// Database Connection
connectDB()
  .then(() => {
    // Start Daily Sync Cron Job
    startDailySyncCron();
  })
  .catch((err) => {
    console.error("DB Connection Error:", err);
  });

// View Engine & Static Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Session Storage
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/StayVerse";
const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SECRET || "thisshouldbeabettersecret!"
  },
  touchAfter: 24 * 3600
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET || "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Config
app.use(passport.initialize());
app.use(passport.session());

passport.use('local-user', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: new RegExp('^' + cleanEmail + '$', 'i') });
    if (!user) return done(null, false, { message: 'Incorrect email or password.' });
    if (user.role !== 'user') return done(null, false, { message: 'This email is registered as a Host. Please login via the Host portal.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: 'Incorrect email or password.' });
    return done(null, user);
  } catch (e) {
    return done(e);
  }
}));

passport.use('local-host', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: new RegExp('^' + cleanEmail + '$', 'i') });
    if (!user) return done(null, false, { message: 'Incorrect email or password.' });
    if (user.role !== 'host') return done(null, false, { message: 'This email is registered as a User. Please login via the User portal.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: 'Incorrect email or password.' });
    return done(null, user);
  } catch (e) {
    return done(e);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e);
  }
});

// Locals Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// Default Redirect Routes
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.get("/login", (req, res) => {
  res.redirect("/auth/login-user");
});

// Mount Routes
app.use("/", routes);

// 404 Handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found."));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`server is listening to port ${PORT}`);
});
