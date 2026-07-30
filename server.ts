import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

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

      <p style="color: #CBD5E1; font-size: 13px; text-align: center;">
        Your official high-resolution Digital Entry Badge is attached to this email. Please present your pass image or Reg Number at the venue check-in desk.
      </p>

      <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; color: #94A3B8; font-size: 12px;">
        Developed by <strong style="color: #FF8A00;">TRH Innovation & Technology Organisation</strong>
      </div>
    </div>
  `;

  // Attachments array
  const attachments: any[] = [];
  if (hasLogoFile && logoFilePath) {
    attachments.push({
      filename: path.basename(logoFilePath),
      path: logoFilePath,
      cid: 'camplogo@trhvictorycamp',
    });
  }

  if (passImageBase64) {
    const base64Data = passImageBase64.replace(/^data:image\/\w+;base64,/, '');
    attachments.push({
      filename: `TRH_Camp_Pass_${attendee.regNumber}.png`,
      content: Buffer.from(base64Data, 'base64'),
      contentType: 'image/png',
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
        message: `Official Digital Pass email dispatched to ${attendee.email} via Gmail SMTP.`,
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

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}

