import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import nodemailer from 'nodemailer';

admin.initializeApp();

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const sendLoginEmail = functions.firestore
  .document('login_events/{eventId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data();
    const recipient = String(data?.email || '').trim();
    const role = String(data?.role || 'user');

    if (!recipient) {
      console.warn('Login email skipped: missing recipient email.');
      return;
    }

    const gmailUser = getRequiredEnv('GMAIL_USER');
    const gmailAppPassword = getRequiredEnv('GMAIL_APP_PASSWORD');
    const fromName = process.env.FROM_NAME || 'Kala Quest';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const subject = 'Login Successful - Kala Quest';
    const text = `Congrats! You are logged in as ${role}.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">Congrats!</h2>
        <p style="margin: 0 0 8px;">You are logged in as <strong>${role}</strong>.</p>
        <p style="margin: 0;">Thanks for using Kala Quest.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${gmailUser}>`,
      to: recipient,
      subject,
      text,
      html,
    });
  });
