"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormData } from "@/lib/validations";
import styles from "./ContactForm.module.scss";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactFormSchema) });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("success");
      reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.field}>
        <label htmlFor="name" className="mono">
          Nombre
        </label>
        <input id="name" {...register("name")} disabled={status === "loading"} />
        {errors.name && <span className={styles.err}>{errors.name.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className="mono">
          Correo
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          disabled={status === "loading"}
        />
        {errors.email && (
          <span className={styles.err}>{errors.email.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="subject" className="mono">
          Asunto
        </label>
        <input
          id="subject"
          {...register("subject")}
          disabled={status === "loading"}
        />
        {errors.subject && (
          <span className={styles.err}>{errors.subject.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className="mono">
          Mensaje
        </label>
        <textarea
          id="message"
          rows={5}
          {...register("message")}
          disabled={status === "loading"}
        />
        {errors.message && (
          <span className={styles.err}>{errors.message.message}</span>
        )}
      </div>

      <button
        type="submit"
        className={styles.submit}
        disabled={status === "loading"}
      >
        <span className="mono">
          {status === "loading" ? "Enviando…" : "Enviar mensaje →"}
        </span>
      </button>

      {status === "success" && (
        <p className={styles.ok}>Mensaje enviado. Te responderé pronto.</p>
      )}
      {status === "error" && (
        <p className={styles.err}>No se pudo enviar. Inténtalo de nuevo.</p>
      )}
    </form>
  );
}
