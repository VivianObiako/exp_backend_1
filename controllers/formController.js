const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class FormController {
    async submitForm(req, res) {
        const { to, subject, text } = req.body;

        const msg = {
            to,
            from: 'transactions@expsouthafrica.co.za',
            subject,
            text,
        };

        console.log('Received form data:', to, subject, text);

        try {
            await sgMail.send(msg);
            res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error sending email', error: error.message });
        }
    }
}

module.exports = new FormController();