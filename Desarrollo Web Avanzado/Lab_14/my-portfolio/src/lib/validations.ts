import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Por favor ingresa un correo electrónico válido"),
  subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres").max(200),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(1000),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
