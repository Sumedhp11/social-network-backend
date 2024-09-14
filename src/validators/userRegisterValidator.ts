import { z } from "zod";

const registerSchema = z.object({
  email: z
    .string({ message: "Email is Required" })
    .email({ message: "Incorrect Email Format" }),
  username: z
    .string({
      message: "Username is Required",
    })
    .min(3, "Username Should more than 3 characters"),
  password: z.string({ message: "Password is Required" }),
});

export default registerSchema;
