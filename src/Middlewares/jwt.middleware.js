const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const User = require("Models/user.model");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwtPayload, done) => {
      User.findById(jwtPayload.id)
        .then((user) => {
          if (user) return done(null, user);
          return done(null, false);
        })
        .catch((err) => done(err, false, { message: "Server Error" }));
    }),
  );
};
