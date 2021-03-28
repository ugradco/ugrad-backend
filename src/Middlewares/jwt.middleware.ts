import passportJwt from "passport-jwt";
import User from "Models/user.model";

const { Strategy: JwtStrategy, ExtractJwt } = passportJwt;

console.log("process.env.JWT_SECRET", process.env.MONGO_CONN_URL, process.env.JWT_SECRET, process.env);
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const JWTMiddleware: any = (passport: any) => {
  passport.use(
    new JwtStrategy(opts, (jwtPayload, done) => {
      User.findById(jwtPayload.id)
        .then((user: any) => {
          if (user) return done(null, user);
          return done(null, false);
        })
        .catch((err: any) => done(err, false, { message: "Server Error" }));
    }),
  );
};

export default JWTMiddleware;
