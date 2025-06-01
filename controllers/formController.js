const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  process.env.SENDGRID_API_KEY
);

class FormController {
  async submitForm(req, res) {
    const { to, subject, text } = req.body;

    const msg = {
      to,
      from: "transactions@expsouthafrica.co.za",
      subject,
      text,
    };

    console.log("Received form data:", to, subject, text);

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
