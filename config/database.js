const mongoose=require('mongoose');
require("dotenv").config();

const databaseConnection = ()=>{
    mongoose.connect(process.env.DATABASE_URL)
    .then(()=>{console.log("Database connected succesfully")})
    .catch((err)=>{
        console.error(err);
        console.log("Issue in Database Connection")
        process.exit(1);
    })
}
module.exports =databaseConnection;