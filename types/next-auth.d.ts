import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "member" | "artist" | "admin";
    } & DefaultSession["user"];
  }
}
