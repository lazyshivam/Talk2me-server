const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI=`${process.env.Mongo_URI}`;

//connecting with the mangodb database
const connectToMongo= ()=>{
          mongoose.set('strictQuery', false);
          mongoose.connect(mongoURI
          ).then(()=>{
              console.log("Database connected succesfully.");}).catch((err)=>{console.log("no connection"+err)});
        
}
module.exports=connectToMongo;