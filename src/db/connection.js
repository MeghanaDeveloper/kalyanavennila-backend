

const mongoose = require("mongoose")

mongoose.connect(process.env.MONGOOSE_CONNECTION)
.then(() => {
    console.log("MongoDb Database connection is established")
})
.catch((err) => {
    console.log(`db error : ${err}`)
})