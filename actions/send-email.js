import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  console.log("Sending email to:", to);
  try {
    const { data, error } = await resend.emails.send({
      from: "Finanace App <onboarding@resend.dev>",
      to,
      subject,
      react,
    });
    return { success, data };
  } catch (error) {
    console.log("Failed to send email:", error);
    return { success: false, error };
  }
}
