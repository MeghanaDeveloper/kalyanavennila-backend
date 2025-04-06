
require("dotenv").config();

const express = require("express")
const cors = require('cors')
const bodyParser = require('body-parser');

const app= express()

const port = process.env.PORT || 8800

//middleware    
app.use(bodyParser.json());
app.use(express.json());
app.use(cors())  

//db connection
require('./db/connection')

//routes
const authRoutes = require('./routes/authRoutes')
const profileRoutes = require('./routes/profileRoutes')
const adminRoutes = require('./routes/adminRoutes')

app.use('/api/auth', authRoutes )
app.use('/api/profile', profileRoutes )
app.use('/api/admin', adminRoutes)

app.get("/", (req,res) => {
    res.send('hello world')
})

app.listen(port, async () => {
    console.log(`server is running at port number ${port}`)
})