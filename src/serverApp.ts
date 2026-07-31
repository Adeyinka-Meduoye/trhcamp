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

// Helper function to generate SVG Digital Pass Card server-side
const generatePassSvg = (attendee: any, qrDataUri: string) => {
  const surname = (attendee.surname || '').toUpperCase();
  const firstName = attendee.firstName || '';
  const otherNames = attendee.otherNames || '';
  const regNumber = attendee.regNumber || 'TRH-2026-VC';
  const gender = attendee.gender || 'N/A';
  const phone = attendee.phone || 'N/A';
  const status = attendee.isMember ? 'TRH Member' : 'Guest / Visitor';
  const dept = (attendee.departmentInterest || 'General').slice(0, 20);
  const stay = attendee.sleepOver ? '🛌 Sleeping Over' : '🚌 Day Commuter';
  const payment = attendee.paymentStatus === 'Paid' ? 'Paid (₦1,000)' : 'Pending';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="480" viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#251464"/>
      <stop offset="50%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#251464"/>
    </linearGradient>
  </defs>

  <!-- Card Frame -->
  <rect width="800" height="480" rx="24" fill="url(#bgGrad)" stroke="#FF8A00" stroke-width="4"/>
  <rect x="16" y="16" width="768" height="448" rx="18" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,6"/>

  <!-- Top Header Branding -->
  <text x="40" y="52" fill="#FF8A00" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" letter-spacing="2">TRH MINISTRIES GLOBAL</text>
  <text x="40" y="80" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" letter-spacing="0.5">ANNUAL VICTORY CAMP 2026</text>
  <text x="40" y="102" fill="#94A3B8" font-family="Georgia, serif" font-size="12" font-style="italic">Theme: EVIDENCE — Proof of Victory (1 Cor 15:57 TPT)</text>

  <!-- Reg Number Badge -->
  <rect x="570" y="38" width="190" height="52" rx="12" fill="#FF8A00" fill-opacity="0.2" stroke="#FF8A00" stroke-width="2"/>
  <text x="665" y="56" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="800" text-anchor="middle" letter-spacing="1">REGISTRATION NO.</text>
  <text x="665" y="78" fill="#FF8A00" font-family="Consolas, monospace" font-size="16" font-weight="900" text-anchor="middle">${regNumber}</text>

  <!-- Header Separator -->
  <line x1="40" y1="120" x2="760" y2="120" stroke="#FF8A00" stroke-opacity="0.4" stroke-width="1.5"/>

  <!-- Participant Details -->
  <text x="40" y="150" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" letter-spacing="1">PARTICIPANT NAME</text>
  <text x="40" y="180" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900">${surname}, ${firstName} ${otherNames}</text>

  <!-- Detail Grid Cards -->
  <!-- Gender -->
  <rect x="40" y="200" width="160" height="48" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="52" y="218" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="9">GENDER</text>
  <text x="52" y="236" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold">${gender}</text>

  <!-- Phone -->
  <rect x="210" y="200" width="160" height="48" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="222" y="218" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="9">PHONE</text>
  <text x="222" y="236" fill="#F8FAFC" font-family="Consolas, monospace" font-size="12" font-weight="bold">${phone}</text>

  <!-- Church Status -->
  <rect x="40" y="258" width="160" height="48" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="52" y="276" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="9">CHURCH STATUS</text>
  <text x="52" y="294" fill="#FF8A00" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="bold">${status}</text>

  <!-- Committee -->
  <rect x="210" y="258" width="160" height="48" rx="8" fill="#1E293B" stroke="#334155"/>
  <text x="222" y="276" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="9">COMMITTEE</text>
  <text x="222" y="294" fill="#FF8A00" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="bold">${dept}</text>

  <!-- Status Badges -->
  <rect x="40" y="320" width="170" height="34" rx="8" fill="#334155"/>
  <text x="125" y="341" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">${stay}</text>

  <rect x="220" y="320" width="150" height="34" rx="8" fill="#065F46" stroke="#10B981"/>
  <text x="295" y="341" fill="#34D399" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Payment: ${payment}</text>

  <!-- QR Code Box Right -->
  <rect x="530" y="140" width="230" height="230" rx="16" fill="#1E293B" stroke="#FF8A00" stroke-width="2"/>
  <rect x="565" y="158" width="160" height="160" rx="10" fill="#FFFFFF"/>
  <image x="570" y="163" width="150" height="150" href="${qrDataUri}"/>
  <text x="645" y="338" fill="#FF8A00" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="900" text-anchor="middle" letter-spacing="1">SCAN TO VERIFY PASS</text>
  <text x="645" y="356" fill="#94A3B8" font-family="Consolas, monospace" font-size="12" font-weight="bold" text-anchor="middle">${regNumber}</text>

  <!-- Footer Info -->
  <line x1="40" y1="385" x2="760" y2="385" stroke="#334155" stroke-width="1"/>
  <text x="40" y="415" fill="#94A3B8" font-family="Consolas, monospace" font-size="11">📍 Venue: TRH Church Hall</text>
  <text x="320" y="415" fill="#94A3B8" font-family="Consolas, monospace" font-size="11">📅 Dates: 23rd – 30th August 2026</text>
  <text x="610" y="415" fill="#94A3B8" font-family="Consolas, monospace" font-size="11">⏰ Curfew: 6:00 PM</text>
  <text x="40" y="445" fill="#64748B" font-family="system-ui, -apple-system, sans-serif" font-size="10">TRH Victory Camp 2026 — Official Digital Pass &amp; Entry Badge</text>
</svg>`;
};

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

  // Construct Verification Link URL
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'trhvictorycamp.org';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
  const verificationUrl = `${baseUrl}/?verify=${encodeURIComponent(attendee.regNumber)}`;

  // Generate QR Code Buffer with full verification web link
  let qrCodeBuffer: Buffer | null = null;
  let qrCodeDataUri = '';
  try {
    qrCodeBuffer = await QRCode.toBuffer(verificationUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });
    qrCodeDataUri = await QRCode.toDataURL(verificationUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });
  } catch (qrErr) {
    console.error('Error generating QR code buffer for email:', qrErr);
  }

  // Handle Pass Card Image (from client canvas or generated SVG)
  let passBuffer: Buffer | null = null;
  let passContentType = 'image/png';
  let passFilename = `TRH_Camp_Pass_${attendee.regNumber}.png`;

  if (passImageBase64) {
    const base64Data = passImageBase64.replace(/^data:image\/\w+;base64,/, '');
    passBuffer = Buffer.from(base64Data, 'base64');
  } else {
    // Generate fallback SVG pass badge
    const passSvgString = generatePassSvg(attendee, qrCodeDataUri);
    passBuffer = Buffer.from(passSvgString, 'utf-8');
    passContentType = 'image/svg+xml';
    passFilename = `TRH_Camp_Pass_${attendee.regNumber}.svg`;
  }

  const emailSubject = `Your TRH Victory Camp 2026 Digital Pass — ${attendee.regNumber}`;

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0F172A; color: #F8FAFC; padding: 24px; border-radius: 16px; max-width: 620px; margin: 0 auto; border: 1px solid #334155;">
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
            <td style="padding: 8px 0; color: #94A3B8;">Dates &amp; Venue:</td>
            <td style="padding: 8px 0; font-weight: bold;">23rd – 30th August 2026 @ TRH Hall</td>
          </tr>
        </table>
      </div>

      <!-- DIGITAL ENTRY PASS BADGE IMAGE -->
      <div style="text-align: center; background-color: #1E293B; padding: 20px; border-radius: 12px; border: 1px solid #FF8A00; margin-bottom: 20px;">
        <h3 style="color: #FF8A00; font-size: 16px; margin: 0 0 12px 0; font-weight: 800; text-transform: uppercase;">
          🪪 Official Digital Entry Badge
        </h3>
        <p style="color: #CBD5E1; font-size: 13px; margin-bottom: 14px;">
          This is your official TRH Victory Camp Entry Badge containing your participant information and verification QR code.
        </p>
        <div style="text-align: center;">
          <img src="cid:digitalpass@trhvictorycamp" alt="TRH Camp Pass" style="max-width: 100%; height: auto; border-radius: 12px; border: 2px solid #FF8A00; box-shadow: 0 8px 24px rgba(0,0,0,0.6);" />
        </div>
      </div>

      <!-- SCAN & VERIFY QR LINK SECTION -->
      <div style="text-align: center; background-color: #1E293B; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 20px;">
        <h3 style="color: #FF8A00; font-size: 15px; margin: 0 0 8px 0; font-weight: 800; text-transform: uppercase;">
          ⚡ Verification QR Code
        </h3>
        <p style="color: #CBD5E1; font-size: 13px; margin-bottom: 14px; line-height: 1.4;">
          When scanned with any smartphone camera, this QR code opens your official live verification portal to confirm your attendance at check-in.
        </p>
        <div style="background-color: #FFFFFF; display: inline-block; padding: 12px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <img src="cid:qrcode@trhvictorycamp" alt="Entry QR Code" width="180" height="180" style="width: 180px; height: 180px; display: block; border-radius: 6px;" />
        </div>
        <div style="margin-top: 14px;">
          <a href="${verificationUrl}" target="_blank" style="display: inline-block; background-color: #FF8A00; color: #0F172A; font-weight: 800; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(255,138,0,0.3);">
            🌐 Open Online Verification Link
          </a>
        </div>
      </div>

      <!-- DOWNLOAD & SAVE SECTION -->
      <div style="background-color: #0F172A; border: 2px dashed #FF8A00; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
        <h4 style="color: #FF8A00; font-size: 15px; margin: 0 0 8px 0; font-weight: 800; letter-spacing: 0.5px;">
          📥 DOWNLOAD & SAVE YOUR PASS & QR CODE
        </h4>
        <p style="color: #CBD5E1; font-size: 13px; margin: 0 0 12px 0; line-height: 1.5;">
          Both your <strong>Entire Digital Entry Pass</strong> (<code style="color: #34D399;">${passFilename}</code>) and <strong>Verification QR Code</strong> (<code style="color: #34D399;">TRH_Camp_QR_${attendee.regNumber}.png</code>) are attached directly to this email for quick downloading!
        </p>
        <div style="padding: 10px; background-color: #1E293B; border-radius: 8px; color: #94A3B8; font-size: 12px; text-align: left;">
          💡 <strong>How to save to phone photo gallery:</strong>
          <ul style="margin: 6px 0 0 16px; padding: 0;">
            <li>In Gmail or Mail App: Scroll to the attachments at the bottom of this email.</li>
            <li>Tap on <strong>${passFilename}</strong>.</li>
            <li>Tap <strong>"Save Image"</strong> or <strong>"Download Attachment"</strong> to save to your photos.</li>
          </ul>
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

  // 2. Full Digital Pass Card Image
  if (passBuffer) {
    attachments.push({
      filename: passFilename,
      content: passBuffer,
      contentType: passContentType,
      cid: 'digitalpass@trhvictorycamp',
    });
  }

  // 3. Entry QR Code Image
  if (qrCodeBuffer) {
    attachments.push({
      filename: `TRH_Camp_QR_${attendee.regNumber}.png`,
      content: qrCodeBuffer,
      contentType: 'image/png',
      cid: 'qrcode@trhvictorycamp',
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
