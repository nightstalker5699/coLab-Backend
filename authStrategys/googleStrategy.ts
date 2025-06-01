import {
  Strategy as GoogleStrategy,
  StrategyOptionsWithRequest,
  VerifyCallback,
} from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
const User = new PrismaClient().user;

const googleStrategy: StrategyOptionsWithRequest = {
  clientID: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  callbackURL: process.env.GOOGLE_REDIRECT_URI || "",
  passReqToCallback: true,
};
const googleVerify = async (
  req: any,
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: VerifyCallback
) => {
  try {
    console.log("Google profile:", profile);
    const user = await User.findUnique({
      where: { email: profile.emails[0].value },
    });
    if (user) {
      if (!user.googleId) {
        await User.update({
          where: { id: user.id },
          data: {
            googleId: profile.id,
          },
        });
      }
      return done(null, user);
    } else {
      profile.username = profile.displayName.replace(/\s+/g, "-");
      const newUser = await User.create({
        data: {
          username: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          photo: profile.photos[0].value,
        },
      });
      return done(null, newUser);
    }
  } catch (error) {
    return done(error);
  }
};

const strategy = new GoogleStrategy(googleStrategy, googleVerify);
export default strategy;
