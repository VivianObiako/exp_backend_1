const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class FormController {
  async submitForm(req, res) {
    const { to, subject, text, from } = req.body;

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

    console.log("Received form data:", {
      to,
      from: senderEmail,
      subject,
      text,
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
