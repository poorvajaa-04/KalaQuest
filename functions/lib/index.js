"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLoginEmail = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const nodemailer_1 = __importDefault(require("nodemailer"));
admin.initializeApp();
const getRequiredEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};
exports.sendLoginEmail = functions.firestore
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
    const transporter = nodemailer_1.default.createTransport({
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
