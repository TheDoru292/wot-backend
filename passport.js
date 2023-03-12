const passport = require("passport");
const passportJWT = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrpyt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/user");

passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    function (username, password, cb) {
      return User.findOne({ username }, (err, user) => {
        if (err) {
          return cb(err);
        }

        if (!user) {
          console.log(password);
          return cb(null, false, { message: "Incorrect email or password." });
        }

        bcrpyt.compare(password, user.password, (err, success) => {
          if (err) {
            return cb(err);
          }

          if (success == false) {
            return cb(null, false, { message: "Incorrect email or password." });
          }

          return cb(null, user, { message: "Logged in successfully." });
        });
      });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, cb) => {
      return User.findOneById(jwtPayload._id, (err, user) => {
        if (err) {
          return cb(err);
        }

        return cb(null, user);
      });
    }
  )
);
