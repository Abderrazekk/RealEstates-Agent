import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter with Office 365/Gmail configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.MAILING_EMAIL, // Changed from EMAIL_USER
      pass: process.env.MAILING_PASSWORD, // Changed from EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false, // For development only
    },
  });
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    console.log("🔧 Testing email configuration...");
    console.log("📧 Using email:", process.env.MAILING_EMAIL);
    console.log(
      "🔑 Password set:",
      process.env.MAILING_PASSWORD ? "Yes" : "No"
    );
    console.log("🏠 Host:", process.env.EMAIL_HOST || "smtp.gmail.com");

    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email server is ready to take our messages");
    return { success: true, message: "Email server is ready" };
  } catch (error) {
    console.error("❌ Email configuration error:", error.message);
    console.error("🔍 Error details:", error);
    return { success: false, error: error.message };
  }
};

// Send meeting acceptance email TO USER
export const sendMeetingAcceptanceEmail = async (userEmail, data) => {
  try {
    const { userName, propertyTitle, meetingDate, adminResponse, agentName } =
      data;

    const transporter = createTransporter();

    const formattedDate = new Date(meetingDate).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });

    const mailOptions = {
      from: `"SandraImmobiliere" <${process.env.MAILING_EMAIL}>`, // Use MAILING_EMAIL
      to: userEmail, // To user's registered email
      subject: `✅ Meeting Confirmed: ${propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Meeting Confirmed</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px;
            }
            .details-card {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid #10b981;
            }
            .detail-item {
              margin: 12px 0;
              display: flex;
              align-items: flex-start;
            }
            .detail-label {
              font-weight: bold;
              color: #555;
              min-width: 120px;
            }
            .status-badge {
              background: #10b981;
              color: white;
              padding: 8px 20px;
              border-radius: 20px;
              display: inline-block;
              font-weight: bold;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              background: #f8f9fa;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #e9ecef;
            }
            .button {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 15px 0;
              font-weight: bold;
            }
            .instructions {
              background: #e8f4fd;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Meeting Confirmed!</h1>
              <p>Your property viewing has been approved</p>
              <div class="status-badge">ACCEPTED</div>
            </div>
            
            <div class="content">
              <p>Dear <strong>${userName}</strong>,</p>
              
              <p>We're pleased to inform you that your meeting request has been accepted.</p>
              
              <div class="details-card">
                <div class="detail-item">
                  <span class="detail-label">Property:</span>
                  <span>${propertyTitle}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Date & Time:</span>
                  <span><strong>${formattedDate}</strong> (UTC)</span>
                </div>
                ${
                  agentName
                    ? `
                <div class="detail-item">
                  <span class="detail-label">Agent:</span>
                  <span>${agentName}</span>
                </div>
                `
                    : ""
                }
                ${
                  adminResponse
                    ? `
                <div class="detail-item">
                  <span class="detail-label">Agent's Note:</span>
                  <span>"${adminResponse}"</span>
                </div>
                `
                    : ""
                }
              </div>
              
              <div class="instructions">
                <h3>📋 Important Information:</h3>
                <ul>
                  <li>Please arrive 10-15 minutes before the scheduled time</li>
                  <li>Bring a valid government-issued photo ID</li>
                  <li>Parking information will be provided by the agent</li>
                  <li>Wear comfortable shoes for property viewing</li>
                  <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="mailto:${
                  process.env.EMAIL_USER
                }" class="button">Contact Agent</a>
              </p>
              
              <p>Best regards,<br>
              <strong>SandraImmobiliere Agency Team</strong></p>
              
              <p><small>This is an automated message. Please do not reply to this email.</small></p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} SandraImmobiliere Agency. All rights reserved.</p>
              <p>Kalaat-el-Andalous, Ariana, Tunisia</p>
              <p>Contact: ${process.env.EMAIL_USER} | Phone: +216 22-222-222</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
MEETING CONFIRMED - SandraImmobiliere

Dear ${userName},

Your meeting request has been ACCEPTED.

PROPERTY DETAILS:
Property: ${propertyTitle}
Date & Time: ${formattedDate} (UTC)
${agentName ? `Agent: ${agentName}` : ""}
${adminResponse ? `Agent's Note: "${adminResponse}"` : ""}

IMPORTANT INFORMATION:
• Please arrive 10-15 minutes before the scheduled time
• Bring a valid government-issued photo ID
• Parking information will be provided by the agent
• Wear comfortable shoes for property viewing
• If you need to reschedule, contact us at least 24 hours in advance

Best regards,
SandraImmobiliere Agency Team

---
This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} SandraImmobiliere. All rights reserved.
Kalaat-el-Andalous, Ariana, Tunisia
Contact: ${process.env.EMAIL_USER} | Phone: +216 22-222-222
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Meeting acceptance email sent to: ${userEmail}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      `❌ Error sending acceptance email to ${userEmail}:`,
      error.message
    );
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

// Send meeting rejection email TO USER
export const sendMeetingRejectionEmail = async (userEmail, data) => {
  try {
    const { userName, propertyTitle, adminResponse } = data;

    const transporter = createTransporter();

    const mailOptions = {
      from: `"SandraImmobiliere" <${process.env.EMAIL_USER}>`, // From system email
      to: userEmail, // To user's registered email
      subject: `❌ Meeting Update: ${propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Meeting Update</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .status-badge {
              background: #ef4444;
              color: white;
              padding: 8px 20px;
              border-radius: 20px;
              display: inline-block;
              font-weight: bold;
              margin: 10px 0;
            }
            .content {
              padding: 30px;
            }
            .details-card {
              background: #fef2f2;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid #ef4444;
            }
            .suggestion {
              background: #e8f4fd;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Meeting Update</h1>
              <p>Regarding your property viewing request</p>
              <div class="status-badge">REJECTED</div>
            </div>
            
            <div class="content">
              <p>Dear <strong>${userName}</strong>,</p>
              
              <p>We regret to inform you that your meeting request has been rejected.</p>
              
              <div class="details-card">
                <p><strong>Property:</strong> ${propertyTitle}</p>
                ${
                  adminResponse
                    ? `
                <p><strong>Reason:</strong> "${adminResponse}"</p>
                `
                    : `
                <p>The requested time was not available or conflicts with existing appointments.</p>
                `
                }
              </div>
              
              <div class="suggestion">
                <h3>💡 What You Can Do Next:</h3>
                <ul>
                  <li>Browse our other available properties</li>
                  <li>Request a different time for this property</li>
                  <li>Schedule a virtual tour if available</li>
                  <li>Contact our agents for personalized assistance</li>
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="mailto:${
                  process.env.EMAIL_USER
                }" class="button" style="
                  display: inline-block;
                  background: #3b82f6;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 6px;
                  margin: 15px 0;
                  font-weight: bold;
                ">Contact Agent</a>
              </p>
              
              <p>Thank you for your interest in our properties.</p>
              
              <p>Best regards,<br>
              <strong>SandraImmobiliere Agency Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
MEETING UPDATE - SANDRAIMMOBILIERE AGENCY

Dear ${userName},

We regret to inform you that your meeting request has been REJECTED.

PROPERTY: ${propertyTitle}
${
  adminResponse
    ? `REASON: "${adminResponse}"`
    : "The requested time was not available."
}

WHAT YOU CAN DO NEXT:
• Browse our other available properties
• Request a different time for this property
• Schedule a virtual tour if available
• Contact our agents for personalized assistance

Thank you for your interest in our properties.

Best regards,
 SandraImmobiliere Agency Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Meeting rejection email sent to: ${userEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      `❌ Error sending rejection email to ${userEmail}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
};

// Send meeting request notification to ADMIN
export const sendMeetingRequestNotification = async (adminEmail, data) => {
  try {
    const {
      userName,
      userEmail,
      userPhone,
      propertyTitle,
      meetingDate,
      notes,
    } = data;

    const transporter = createTransporter();

    const formattedDate = new Date(meetingDate).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });

    const mailOptions = {
      from: `"Real Estate System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `📅 New Meeting Request: ${propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 25px; }
            .details { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Meeting Request</h2>
              <p>A client has requested to view a property</p>
            </div>
            
            <div class="content">
              <p>Hello Admin,</p>
              
              <p>You have received a new meeting request. Here are the details:</p>
              
              <div class="details">
                <p><strong>Client:</strong> ${userName}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Phone:</strong> ${userPhone}</p>
                <p><strong>Property:</strong> ${propertyTitle}</p>
                <p><strong>Requested Date:</strong> ${formattedDate}</p>
                ${
                  notes
                    ? `<p><strong>Client Notes:</strong> "${notes}"</p>`
                    : ""
                }
              </div>
              
              <p>Please log in to the admin dashboard to respond to this request.</p>
              
              <p><a href="${
                process.env.CLIENT_URL || "http://localhost:3000"
              }/admin/meetings" class="button">Go to Admin Dashboard</a></p>
              
              <p>Best regards,<br>
              <strong>SandraImmobiliere Agency System</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Meeting request notification sent to admin: ${adminEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      "❌ Error sending meeting request notification:",
      error.message
    );
    return { success: false, error: error.message };
  }
};

// Send meeting cancellation email (Optional)
export const sendMeetingCancellationEmail = async (userEmail, data) => {
  try {
    const { userName, propertyTitle, meetingDate } = data;

    const transporter = createTransporter();

    const formattedDate = new Date(meetingDate).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const mailOptions = {
      from: `"SandraImmobiliere" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `❌ Meeting Cancelled: ${propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6b7280; color: white; padding: 20px; text-align: center; }
            .content { padding: 25px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Meeting Cancelled</h2>
            </div>
            
            <div class="content">
              <p>Dear ${userName},</p>
              
              <p>Your meeting for <strong>${propertyTitle}</strong> scheduled for <strong>${formattedDate}</strong> has been cancelled.</p>
              
              <p>If you have any questions or would like to reschedule, please contact us.</p>
              
              <p>Best regards,<br>
              <strong>SandraImmobiliere Agency Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Meeting cancellation email sent to: ${userEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      `❌ Error sending cancellation email to ${userEmail}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
};
