const mysql= require("mysql2");
const db=mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"Suhani19!",
  database:"SahayogDB",
});
db.connect((err)=>{
  if(err){
    console.log("Database connection failed:", err.message);
    return;
  }
  console.log("MYSQL database connected successfully!");
});
module.exports=db;