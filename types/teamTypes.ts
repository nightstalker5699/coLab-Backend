import { z } from "zod";

export const CreateTeamSchema = z.object({
  teamData: z.object({
    teamName: z.string().max(25, "team name can't be more than 25 characters"),
    teamLogo: z.string().url().optional(),
    theme: z.string().max(20, "theme can't be more than 20 characters"),
    joinCode: z
      .string()
      .max(10, "join code can't be more than 10 characters")
      .optional(),
  }),
  members: z.array(z.string().uuid("the members contain non id")),
});

export const changeRoleSchema = z.object({
  role: z.enum(["MEMBER", "LEADER"], {
    message: "you can use only MEMBER and LEADER",
  }),
  relationId: z.string().uuid(),
});
