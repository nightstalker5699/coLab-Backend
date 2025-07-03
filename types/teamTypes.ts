import { z } from "zod";

export const CreateTeamSchema = z.object({
  teamName: z.string().max(25, "team name can't be more than 25 characters"),
  teamLogo: z.string().optional(),
  theme: z.string().max(20, "theme can't be more than 20 characters"),
  joinCode: z
    .string()
    .max(10, "join code can't be more than 10 characters")
    .optional(),
  members: z
    .string()
    .refine((val) => {
      const arr = JSON.parse(val);
      const isArr = z
        .array(z.string().uuid("the members contain non id"))
        .safeParse(arr).success;
      return isArr;
    })
    .optional(),
});

export const changeRoleSchema = z.object({
  role: z.enum(["MEMBER", "LEADER"], {
    message: "you can use only MEMBER and LEADER",
  }),
  relationId: z.string().uuid(),
});

export const updateTeamSchema = z.object({
  teamName: z
    .string()
    .max(25, "team name can't be more than 25 characters")
    .optional(),
  teamLogo: z.string().optional(),
  theme: z
    .string()
    .max(20, "theme can't be more than 20 characters")
    .optional(),
});

export type updateTeamType = z.infer<typeof updateTeamSchema>;

export type CreateTeamType = z.infer<typeof CreateTeamSchema>;

export type changeRoleInputType = z.infer<typeof changeRoleSchema>;

export const default_teamLogo = `${process.env.R2_BUCKET_PUBLIC_URL}/teamLogos/default.png`;
