import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

 const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { from, to, email } = req.body;

  // Backend validation
  if (!from || !to || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Save inquiry
  const { error } = await supabase
    .from("price_inquiries")
    .insert({
      from_address: from,
      to_address: to,
      email
    });

  if (error) {
    return res.status(500).json({ error: "Database error" });
  }
  // Send introductory pricing email
  try {
    const pdfPath = path.join(
      process.cwd(),
      "public",
      "documents",
      "pricing.pdf"
    );
    const pdfBuffer = fs.readFileSync(pdfPath);
    await resend.emails.send({
      from: `${process.env.FROM_EMAIL}`,
      to: [email],
      attachments: [
        {
          filename: "pricing.pdf",
          content: pdfBuffer,
        },
      ],
      subject: "Delivery Pricing – Luca Med Solutions",
      html: `
        <html>
  <head>
    <meta charset="UTF-8" />
    <title>Luca Med Solutions – Pricing</title>
  </head>
  <body style="margin:0; padding:0; background-color:#ffffff; font-family: Arial, Helvetica, sans-serif; color:#000000;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
      <tr>
        <td align="center" style="padding: 30px 15px;">
          <table width="600" cellpadding="0" cellspacing="0" style="border:1px solid #000000;">
            
            <!-- Header -->
            <tr>
              <td style="padding:20px; text-align:center; border-bottom:1px solid #000000;">
                <h1 style="margin:0; font-size:22px; font-weight:bold;">
                  Luca Med Solutions
                </h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:25px; font-size:14px; line-height:1.6;">
                <p>Thank you for contacting <strong>Luca Med Solutions</strong>.</p>

                <p>
                  We are currently offering <strong>introductory delivery rates</strong> for pharmacies:
                </p>

                <ul style="padding-left:20px;">
                  <li><strong>$4.50</strong> for deliveries in the same city</li>
                  <li><strong>$6.75</strong> for deliveries anywhere in the GTA</li>
                </ul>

                <p>
                  Our deliveries are <strong>PHIPA-compliant</strong>, secure, and handled by trained drivers.
                </p>

                <p>
                  Detailed information can be found in the <strong>attached PDF file</strong>.
                </p>

                <p>
                  Reply to this email if you’d like to get started or have any questions.
                </p>

                <p style="margin-top:30px;">
                  —<br />
                  <strong>Luca Med Solutions</strong>
                </p>
              </td>
            </tr>

            <!-- Sign Up Button -->
            <tr>
              <td align="center" style="padding:25px; border-top:1px solid #000000;">
                <a
                  href="https://www.lucamed.ca/#contact" target="_blank" rel="noopener noreferrer"
                  style="
                    display:inline-block;
                    padding:12px 28px;
                    border:2px solid #000000;
                    color:#000000;
                    text-decoration:none;
                    font-weight:bold;
                    font-size:14px;
                  "
                >
                  Sign Up
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
      `
    });
        
    await resend.emails.send({
      from: `${process.env.FROM_EMAIL}`,
      to: [`${process.env.LUCAMED_EMAIL}`],
      subject: "New Enquiry – Get Price",
      html: `
        <table cellpadding="8" cellspacing="0" style="border-collapse:collapse; border:1px solid #000000; font-family:Arial, Helvetica, sans-serif;">
        <tr>
          <th style="border:1px solid #000000;"><strong>Field Name</strong></th>
          <th style="border:1px solid #000000;">Value</th>
        </tr>
        <tr>
          <td style="border:1px solid #000000;"><strong>Email</strong></td>
          <td style="border:1px solid #000000;">${email}</td>
        </tr>
        <tr>
          <td style="border:1px solid #000000;"><strong>From Address</strong></td>
          <td style="border:1px solid #000000;">${from}</td>
        </tr>
        <tr>
          <td style="border:1px solid #000000;"><strong>To Address</strong></td>
          <td style="border:1px solid #000000;">${to}</td>
        </tr>
      </table>
      `
    });


  } catch (emailError) {
    // Email failure should not block submission
    console.error("Email failed:", emailError);
  }

  return res.status(200).json({ success: true });
}