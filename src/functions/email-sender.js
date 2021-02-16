import sgMail from '@sendgrid/mail'
import { SENDGRID_API, HOST_EMAIL } from '../constants'

// Create send grid instance
sgMail.setApiKey(SENDGRID_API)

const sendMail = async (email,subject,text,html) => {
    try {
        const msg = {
            html,
            text,
            subject,
            to: email, 
            from: HOST_EMAIL,
        }
        await sgMail.send(msg)
        console.log("MAIL SENT")
    } catch (err) {
        console.log("ERROR_MAILING", err.message)
    } finally {
        return;
    }
}

export default sendMail;