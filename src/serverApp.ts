import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import QRCode from 'qrcode';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));

// Role to Env Var Mapping (Evaluates environment variables dynamically at request time)
const getExpectedAdminPassword = (username: string): string | undefined => {
  const envMap: Record<string, string | undefined> = {
    'Senior & Founding Pastor': process.env.ADMIN_PASS_PASTOR || 'trhPastor2026',
    'Director, Church Administration': process.env.ADMIN_PASS_CHURCH_ADMIN || 'trhAdmin2026',
    'Assistant Director, Church Administration': process.env.ADMIN_PASS_ASST_ADMIN || 'trhAsstAdmin2026',
    'Senate President': process.env.ADMIN_PASS_SENATE || 'trhSenate2026',
    'Innovation & Technology Lead': process.env.ADMIN_PASS_TECH || 'trhTech2026',
    'Camp Director': process.env.ADMIN_PASS_CAMP_DIR || 'trhCamp2026',
  };
  return envMap[username];
};

// API Route: Admin Authentication
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  const expectedPassword = getExpectedAdminPassword(username);

  if (!expectedPassword) {
    return res.status(400).json({ success: false, error: 'Invalid official title specified.' });
  }

  if (password.trim() === expectedPassword.trim()) {
    return res.json({
      success: true,
      role: username,
      canDelete: username === 'Innovation & Technology Lead',
    });
  } else {
    return res.status(401).json({
      success: false,
      error: `Incorrect password for ${username}. Access denied.`,
    });
  }
});

// API Route: Send Digital Pass via Gmail SMTP
app.post('/api/send-pass', async (req, res) => {
  const { attendee, passImageBase64 } = req.body;

  if (!attendee || !attendee.email) {
    return res.status(400).json({ success: false, error: 'Attendee data and email address are required.' });
  }

  const rawGmailUser = process.env.GMAIL_USER || 'trhministriesglobal@gmail.com';
  const rawGmailPass = process.env.GMAIL_APP_PASSWORD;

  const gmailUser = rawGmailUser ? rawGmailUser.trim() : '';
  const gmailPass = rawGmailPass ? rawGmailPass.replace(/\s+/g, '') : '';
  const isPassConfigured = gmailPass && gmailPass !== 'your_gmail_app_password';

  const logoPngPath = path.join(process.cwd(), 'src/assets/images/trh_camp_logo_1785335253249.png');
  const logoJpgPath = path.join(process.cwd(), 'src/assets/images/trh_camp_logo_1785335253249.jpg');
  const hasLogoPng = fs.existsSync(logoPngPath);
  const hasLogoJpg = fs.existsSync(logoJpgPath);
  const logoFilePath = hasLogoPng ? logoPngPath : (hasLogoJpg ? logoJpgPath : null);
  const hasLogoFile = !!logoFilePath;

  // Generate QR Code Buffer for verification
  let qrCodeBuffer: Buffer | null = null;
  try {
    const qrData = attendee.regNumber || 'TRH-2026-VC';
    qrCodeBuffer = await QRCode.toBuffer(qrData, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });
  } catch (qrErr) {
    console.error('Error generating QR code buffer for email:', qrErr);
  }

  const emailSubject = `Your TRH Victory Camp 2026 Digital Pass — ${attendee.regNumber}`;

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0F172A; color: #F8FAFC; padding: 24px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #334155;">
      <div style="text-align: center; border-bottom: 2px solid #FF8A00; padding-bottom: 16px; margin-bottom: 20px;">
        ${hasLogoFile ? `
          <div style="text-align: center; margin-bottom: 14px;">
            <img src="cid:camplogo@trhvictorycamp" alt="TRH Victory Camp Logo" width="90" height="90" style="width: 90px; height: 90px; object-fit: cover; border-radius: 50%; border: 3px solid #FF8A00; display: inline-block; margin: 0 auto; box-shadow: 0 4px 12px rgba(255,138,0,0.3);" />
          </div>
        ` : ''}
        <h1 style="color: #FF8A00; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: 0.5px;">TRH ANNUAL VICTORY CAMP 2026</h1>
        <p style="color: #94A3B8; font-size: 13px; margin-top: 6px; font-weight: 600;">Theme: EVIDENCE — Proof of Victory (1 Cor 15:57 TPT)</p>
      </div>

      <div style="background-color: #1E293B; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 20px;">
        <h2 style="color: #F8FAFC; font-size: 18px; margin-top: 0;">Congratulations, ${attendee.firstName} ${attendee.surname}!</h2>
        <p style="color: #CBD5E1; font-size: 14px; line-height: 1.5;">
          Your official registration for TRH Victory Camp 2026 has been successfully confirmed.
        </p>
        
        <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 16px; font-size: 14px; color: #F8FAFC;">
          <tr>
            <td style="padding: 8px 0; color: #94A3B8;">Registration No:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #FF8A00; font-family: monospace;">${attendee.regNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94A3B8;">Payment Status:</td>
            <td style="padding: 8px 0; font-weight: bold; color: ${attendee.paymentStatus === 'Paid' ? '#34D399' : '#FBBF24'};">${attendee.paymentStatus} (₦1,000)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94A3B8;">Committee / Dept:</td>
            <td style="padding: 8px 0; font-weight: bold;">${attendee.departmentInterest || 'General Participant'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94A3B8;">Accommodation:</td>
            <td style="padding: 8px 0; font-weight: bold;">${attendee.sleepOver ? 'Sleepover Reserved' : 'Day Participant'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94A3B8;">Dates:</td>
            <td style="padding: 8px 0; font-weight: bold;">23rd – 30th August 2026</td>
          </tr>
        </table>
      </div>

      <!-- ENTRY QR CODE SECTION -->
      <div style="text-align: center; background-color: #1E293B; padding: 20px; border-radius: 12px; border: 1px solid #FF8A00; margin-bottom: 20px;">
        <h3 style="color: #FF8A00; font-size: 16px; margin: 0 0 8px 0; font-weight: 800; text-transform: uppercase;">
          ⚡ Official Entry QR Code
        </h3>
        <p style="color: #CBD5E1; font-size: 13px; margin-bottom: 14px; line-height: 1.4;">
          Present this official QR Code at the camp check-in desk for fast instant verification.
        </p>
        <div style="background-color: #FFFFFF; display: inline-block; padding: 12px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <img src="cid:qrcode@trhvictorycamp" alt="Entry QR Code" width="180" height="180" style="width: 180px; height: 180px; display: block; border-radius: 6px;" />
        </div>
        <div style="color: #FF8A00; font-family: monospace; font-size: 16px; font-weight: 800; margin-top: 10px; letter-spacing: 1px;">
          ${attendee.regNumber}
        </div>
      </div>

      ${passImageBase64 ? `
        <!-- DIGITAL PASS IMAGE DISPLAY -->
        <div style="text-align: center; background-color: #1E293B; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 20px;">
          <h3 style="color: #F8FAFC; font-size: 15px; margin: 0 0 12px 0; font-weight: 700;">
            🪪 Digital Entry Badge
          </h3>
          <div style="text-align: center;">
            <img src="cid:digitalpass@trhvictorycamp" alt="TRH Camp Pass" style="max-width: 100%; height: auto; border-radius: 12px; border: 2px solid #FF8A00; box-shadow: 0 8px 24px rgba(0,0,0,0.6);" />
          </div>
        </div>
      ` : ''}

      <!-- DOWNLOAD & SAVE SECTION -->
      <div style="background-color: #0F172A; border: 2px dashed #FF8A00; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
        <h4 style="color: #FF8A00; font-size: 15px; margin: 0 0 8px 0; font-weight: 800; letter-spacing: 0.5px;">
          📥 DOWNLOAD & SAVE YOUR PASS & QR CODE
        </h4>
        <p style="color: #CBD5E1; font-size: 13px; margin: 0; line-height: 1.5;">
          We have attached your official high-resolution <strong>Verification QR Code</strong> (<code style="color: #34D399;">TRH_Camp_QR_${attendee.regNumber}.png</code>)${passImageBase64 ? ` and <strong>Digital Entry Badge</strong> (<code style="color: #34D399;">TRH_Camp_Pass_${attendee.regNumber}.png</code>)` : ''} directly to this email!
        </p>
        <div style="margin-top: 12px; padding: 10px; background-color: #1E293B; border-radius: 8px; color: #94A3B8; font-size: 12px;">
          💡 <strong>How to Download:</strong> Scroll to the bottom or top of this email in your Gmail or mail app, tap on the attached image files, and select <strong>"Save Image"</strong> or <strong>"Download Attachment"</strong> to store it in your phone's photo library.
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; color: #94A3B8; font-size: 12px;">
        Developed by <strong style="color: #FF8A00;">TRH Innovation & Technology Organisation</strong>
      </div>
    </div>
  `;

  // Attachments array
  const attachments: any[] = [];

  // 1. Logo
  if (hasLogoFile && logoFilePath) {
    attachments.push({
      filename: path.basename(logoFilePath),
      path: logoFilePath,
      cid: 'camplogo@trhvictorycamp',
    });
  }

  // 2. Entry QR Code Image
  if (qrCodeBuffer) {
    attachments.push({
      filename: `TRH_Camp_QR_${attendee.regNumber}.png`,
      content: qrCodeBuffer,
      contentType: 'image/png',
      cid: 'qrcode@trhvictorycamp',
    });
  }

  // 3. Digital Pass Image Card
  if (passImageBase64) {
    const base64Data = passImageBase64.replace(/^data:image\/\w+;base64,/, '');
    attachments.push({
      filename: `TRH_Camp_Pass_${attendee.regNumber}.png`,
      content: Buffer.from(base64Data, 'base64'),
      contentType: 'image/png',
      cid: 'digitalpass@trhvictorycamp',
    });
  }

  if (gmailUser && isPassConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.sendMail({
        from: `"TRH Victory Camp" <${gmailUser}>`,
        to: attendee.email,
        subject: emailSubject,
        html: emailHtml,
        attachments,
      });

      return res.json({
        success: true,
        message: `Official Digital Pass and Entry QR Code email dispatched to ${attendee.email} via Gmail SMTP.`,
      });
    } catch (err: any) {
      console.error('SMTP Email Error:', err);
      return res.status(500).json({
        success: false,
        error: `Failed to send email via Gmail SMTP: ${err.message || err}`,
      });
    }
  } else {
    // Graceful response when SMTP credentials aren't set in environment yet
    console.log(`[SMTP Not Configured] Simulating email delivery for ${attendee.email}`);
    return res.json({
      success: true,
      simulated: true,
      message: `Digital Pass generated! To enable real email delivery to ${attendee.email}, set GMAIL_USER and GMAIL_APP_PASSWORD in environment variables.`,
    });
  }
});

export default app;
