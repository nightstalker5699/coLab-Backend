import { Strategy as githubStrategy, Profile } from "passport-github2";
import { PrismaClient } from "@prisma/client";
const User = new PrismaClient().user;

const github = new githubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    callbackURL: process.env.GITHUB_REDIRECT_URI || "",
    passReqToCallback: true,
  },
  async (
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any
  ) => {
    try {
      console.log("GitHub profile:", profile);
      // Fetch user email from GitHub API
      let email = null;
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          userAgent: "CoLab",
        },
      });
      if (emailResponse.ok) {
        const emails: any[] = await emailResponse.json();
        email = emails.find((email) => {
          return email.primary && email.verified;
        });
      }
      const user = await User.findUnique({
        where: { email: email.email },
      });
      if (user) {
        if (!user.githubId) {
          await User.update({
            where: { id: user.id },
            data: {
              githubId: profile.id,
            },
          });
        }
        return done(null, user);
      } else {
        profile.username = profile.displayName.replace(/\s+/g, "-");
        const newUser = await User.create({
          data: {
            username: profile.username,
            email: email.email,
            githubId: profile.id,
            photo: profile.photos[0].value,
          },
        });
        return done(null, newUser);
      }
    } catch (error) {
      return done(error);
    }
  }
);

export default github;
