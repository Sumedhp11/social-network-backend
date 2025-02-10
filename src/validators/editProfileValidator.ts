import { z } from "zod";

const editProfileSchema = z.object({
  email: z
    .string({ message: "Email is Required" })
    .email({ message: "Incorrect Email Format" })
    .optional(),
  username: z
    .string({
      message: "Username is Required",
    })
    .min(3, "Username Should more than 3 characters")
    .optional(),
  bio: z
    .string()
    .min(3, { message: "Bio should be more than 3 characters" })
    .optional(),
});

export default editProfileSchema;
