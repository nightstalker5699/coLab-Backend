import { User } from "@prisma/client";
import { Profile, VerifyCallback } from "passport-google-oauth20";

export type googleVerifyFunction = (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: VerifyCallback
) => void;

export interface googleStrategyConfig {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  passReqToCallback?: boolean;
}

export interface AuthStrategy {
  verifyFunction: googleVerifyFunction;
  config: googleStrategyConfig;
}
