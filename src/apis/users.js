import { Router } from 'express'
import sendMail from "../functions/email-sender"
import { User } from '../models'
import { join } from 'path'
import { DOMAIN } from "../constants"
import { randomBytes } from 'crypto'
import Validator from "..//middlewares/validator-middleware"
import { AuthenticateValidations, RegisterValidations } from '../validators'
const router = Router()

/**
 * @description To create a new User Account
 * @api /users/api/register
 * @access Public
 * @type POST
 */

router.post('/api/register', 
RegisterValidations,
Validator, 
async (req,res) => {
   try {
    let { username, email } = req.body
    // Check if the username is taken or not
    let user = await User.findOne({ username })
    if(user) {
        return res.status(400).json({
            success: false,
            message : "Username is already taken."
        })
    }
    // Check if the user exist with that email
    user = await User.findOne({ email })
    if(user) {
        return res.status(400).json({
            success: false,
            message : 
            "Email is already registered. Did you forget the password. Try resetting it.",

        })
    }
    user = new User({
        ... req.body,
        verificationCode: randomBytes(20).toString("hex")

    })
    await user.save()

    // Send the email to the user with a verification link
    let html = `
    <div>
        <h1> Hello, ${user.username} </h1>
        <p>Please click the following link to verify your account</p>
        <a href = "${DOMAIN}users/verify-now/${user.verificationCode}">Verify Now</a>
    </div>
    `
    await sendMail(
    user.email, 
    "Verify Account", 
    "Please verify your account", 
    html)
    return res.status(201).json({
        success: true,
        message: "Your account is created. Please verify your email address.",
    })
   } catch (error) {
       return res.status(500).json({
           success: false,
           message: "An error occurred."
       })
   }
})


/**
 * @description To verify a new user's account via email
 * @api /users/verify-now/:verificationCode
 * @access PUBLIC <Only Via Email></Only>
 * @type GET
 */

router.get('/verify-now/:verificationCode', async (req,res) => {
    try {
        let { verificationCode } = req.params
        let user = await User.findOne({verificationCode})
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Unauthorized access. Invalid verification code."
            })
        }
        user.verified = true
        user.verificationCode = undefined
        await user.save()
        return res.sendFile(join(__dirname, '../templates/verification-success.html'))
    } catch (err) {
        return res.sendFile(join(__dirname, '../templates/error.html'))
    }
})

/**
 * @description To authenticate an user and get auth token
 * @api /users/api/authenticate
 * @access PUBLIC
 * @type POST
 */

router.post('/api/authenticate', 
AuthenticateValidations, 
Validator,
async(req,res) => {
    try {
      let { username, password } = req.body
      let user = await User.findOne({ username })
      if(!user){
          return res.status(404).json({
              success: false,
              message : "Username not found."
          })
      }
      if(!await user.comparePassword(password)){
        return res.status(401).json({
            success: false,
            message : "Incorrect password."
        })
      }
      let token = await user.generateJWT()
      return res.status(200).json({
        success: true,
        user: user.getUserInfo(),
        token: `Bearer ${token}`,
        message : "You are now logged in.",
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "An error occurred."
        })
    }
})

export default router
