const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class FormController {
  async submitForm(req, res) {
    const { to, subject, text, from, attachments } = req.body;

    // Use provided sender email or fall back to default for backward compatibility
    const senderEmail = from || "transactions@expsouthafrica.co.za";

    // Validate sender email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return res.status(400).json({
        message: "Invalid sender email format",
        error: "The sender email address is not valid",
      });
    }

    const msg = {
      to,
      from: senderEmail,
      subject,
      text,
    };

    // Add attachments if provided
    // Attachments should be an array of objects with: content (base64), filename, and optionally type (mime type)
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      msg.attachments = attachments.map((attachment) => ({
        content: attachment.content, // base64 encoded content
        filename: attachment.filename,
        type: attachment.type || "application/octet-stream",
        disposition: "attachment",
      }));
    }

    console.log("Received form data:", {
      to,
      from: senderEmail,
      subject,
      text,
      attachmentsCount: attachments ? attachments.length : 0,
    });

    sgMail.send(msg).then(
      () => {
        console.log("Email sent successfully");
        res.status(200).json({ message: "Email sent successfully" });
      },
      (error) => {
        console.error(error);

        if (error.response) {
          console.error(error.response.body);
        }
        res.status(500).json({ message: "Failed to send email" });
      }
    );
  }
}

module.exports = new FormController();
