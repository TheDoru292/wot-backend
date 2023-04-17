const passport = require("passport");
const passportJWT = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrpyt = require("bcryptjs");
const AnonymousStrategy = require("passport-anonymous");
require("dotenv").config();

const User = require("./models/user");

passport.use(
  new LocalStrategy(
    { usernameField: "handle", passwordField: "password" },
    function (handle, password, cb) {
      return User.findOne({ handle }, (err, user) => {
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
    function (jwtPayload, cb) {
      console.log(jwtPayload);

      return User.findOne({ _id: jwtPayload._id }, "_id", (err, user) => {
        if (err) {
          return cb(err);
        }

        return cb(null, user);
      });
    }
  )
);

passport.use(new AnonymousStrategy());
