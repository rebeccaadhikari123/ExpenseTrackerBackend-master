const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB,{
    useNewUrlParser:true,
    // useCreateIndex:true,
    // useFindAndModify:true,
    useUnifiedTopology:true
}).
then(()=>{
    console.log('DB Connection Sucessfull')
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server Started at port " + PORT);
  });
  
