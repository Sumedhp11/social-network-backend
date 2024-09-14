import { z } from "zod";

export const userLoginValidation = z.object({
  username: z
    .string({ message: "Username is Required" })
    .min(3, { message: "Username should be atleast 3 characters" }),
  password: z
    .string({ message: "Password is Required" })
    .min(6, { message: "Password should be atleast 6 characters" }),
});
