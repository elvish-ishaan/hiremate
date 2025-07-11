import { z } from "zod";

//user schema
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const UserSchema = z.infer<typeof userSchema>;