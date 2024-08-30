import nodeMailer from 'nodemailer';

const transporter = nodeMailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 587,
    secure: false,
    auth: {
        user: '4eb8a29d7af3f2',
        pass: '630624c7caddee',
    }
});

export {transporter};
