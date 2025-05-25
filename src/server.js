
require("dotenv").config();

const express = require("express")
const cors = require('cors')
const bodyParser = require('body-parser');

const app= express()

const port = process.env.PORT

//middleware    
app.use(bodyParser.json());
app.use(express.json());
app.use(cors(
//     {
//     origin: ["http://localhost:5173", "http://localhost:5174"],
//     credentials: true, // allow cookies and headers
//   }
));

//db connection
require('./db/connection')

//routes
const authRoutes = require('./routes/authRoutes')
const profileRoutes = require('./routes/profileRoutes')
const adminRoutes = require('./routes/adminRoutes')
const tickerRoutes = require('./routes/tickerRoutes');

app.use('/api/auth', authRoutes )
app.use('/api/profile', profileRoutes )
app.use('/api/admin', adminRoutes)
app.use('/api', tickerRoutes)

app.get("/", (req,res) => {
    res.send('hello world!!!')
})

app.listen(port, async () => {
    console.log(`server is running at port number ${port}`)
})