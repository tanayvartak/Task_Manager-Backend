const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to:email,
        from:'tanayvartak633@gmail.com',
        subject:'Welcome Email',
        text:`Welcome dear ${name} to the Task manager application. We are happy to help  you!`
    })
}

const sendGoodByeEmail = (email, name) => {
    sgMail.send({
        to:email,
        from:'tanayvartak633@gmail.com',
        subject:'Account Closed',
        text:`Dear ${name}, As per your request your account for Task manager application is successfully deleted. Please let us know the reason for closing the account so that we can improve our service to  help you. Thank  you for using our application. Have a  good day!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodByeEmail
}