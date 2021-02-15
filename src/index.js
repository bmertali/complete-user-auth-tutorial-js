import cors from 'cors'
import { json } from 'body-parser'
import express from 'express'
import mongoose from 'mongoose'
import consola from 'consola'

// Import Application Constants
import { DB, PORT} from './constants'


// Router exports
import userApis from './apis/users'

// Initialize express application
const app = express()

// Apply Apllication Middlewares
app.use(cors())
app.use(json())

// Inject Sub router and apis
app.use('./users', userApis)

const main = async () => {
    try{
        // Connect with the database
        await mongoose.connect(DB, { 
            useUnifiedTopology : true,
            useFindAndModify : false,
            useNewUrlParser: true})
            consola.success("DATABASE CONNECTED...")
        // Start application listening for request on server
        app.listen(PORT, () => consola.success(`Server started on port ${PORT}`))
    } catch (err){
        consola.error(`Unable to start the server \n${err.message}`)
    }
}

main()