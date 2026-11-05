const express =require("express");
const db=require("./db");
const cors= require("cors");
const bcrypt=require("bcryptjs");
const app=express();
const PORT =5000;
app.use(express.json());
app.use(cors());
app.get("/api/test",(req,res)=>{
  res.json({
    message:"Backend is working!"
  });
});
app.get("/api/hello",(req,res)=>{
  res.json({
    message:"Hello from Sahayog backend!"
  });
});
app.post("/api/test", (req,res) =>{
  console.log(req.body);
  res.json({
    message: "Data received successfully!",
    receivedData: req.body
  });
});
app.post("/api/ngos/register", async(req,res) => {
  console.log("Ngo registration request recieved!");
  console.log(req.body);
  const{
    ngo_name,
    registration_number,
    darpan_id,
    address,
    cause,
    city,
    description,
    email,
    phone,
    website,
    password
  }=req.body;
  console.log("City recieved:",city);
  if(!ngo_name || !registration_number || !darpan_id || !address || !description || !email || !phone || !password){
    return res.status(400).json({
      message: "All required NGO fields must be filled"
    });
  }
  try{
    const hashedPassword= await bcrypt.hash(password,10);
    const ngoSql=`
    INSERT INTO ngos
    (ngo_name, registration_number, darpan_id, address,cause,city,description,email,phone,website)
    VALUES(?,?,?,?,?,?,?,?,?,?)
    `;
    const ngoValues=[
      ngo_name,
      registration_number,
      darpan_id,
      address,
      cause,
      city,
      description,
      email,
      phone,
      website
    ];
    db.query(ngoSql,ngoValues,(err,ngoResult) =>{
      if(err){
        console.log("Error inserting Ngo:", err);
        if(err.code === "ER_DUP_ENTRY"){
          return res.status(409).json({
            message:"Registration number or DARPAN ID already exists"
          });
        }
        return res.status(500).json({
          message:"Failed to register NGO"
        });
      }
      const ngoId=ngoResult.insertId;
      const userSql=`
      INSERT INTO users
      (name,email,password,role,ngo_id)
      VALUES(?,?,?,?,?)
      `;
      const userValues= [
        ngo_name,
        email,
        hashedPassword,
        "ngo",
        ngoId
      ];
      db.query(userSql, userValues, (userErr, userResult) =>{
        if(userErr){
          console.log("Error creating NGO account:",userErr);
          return res.status(500).json({
            message:"NGO was registered but login account could not be created"
          });
        }
        res.status(201).json({
          message: "NGO registered successfully!",
          ngo_id:ngoId,
          user_id: userResult.insertId
        });
      });
    });

  }
  catch(error){
    console.log("Password hashing error:",error);
    return res.status(500).json({
      message:"Failed to register NGO"
    });
  }
});
//donor registration
app.post("/api/users/register",async(req,res) =>{
  const{
    name, 
    phone,
    email,
    password
  }= req.body;
  if(!name || !email || !password){
    return res.status(400).json({
      message:"Name, email and password are required"
    });
  }
  try{
    const hashedPassword = await bcrypt.hash(password,10);
    const sql=`
    INSERT INTO users
    (name, email, password, role)
    VALUES(?,?,?,?)
    `;
    const values=[
      name,
      email,
      hashedPassword,
      "donor"
    ];
    db.query(sql, values, (err,result)=>{
      if(err){
        console.log("Error registering donor:",err);
        if(err.code === "ER_DUP_ENTRY"){
          return res.status(409).json({
            message:"Email is already registered"
          });
        }
        return res.status(500).json({
          message:"Failed to register donor"
        });
      }
      res.status(201).json({
        messsage:"donor registered successfully",
        user_id:result.insertId
      });
    });
  }catch(error){
    console.log("Password hashing error:",error);
    res.status(500).json({
      message:"Failed to register donor"
    });
  }
});
//login api
app.post("/api/login",async (req,res)=>{
  const{email, password, role}=req.body;
  if(!email || !password || !role){
    return res.status(400).json({
      success:false,
      message:"Email,passowrd and role are required."
    });

  }
  const sql= "SELECT * FROM users WHERE email = ? LIMIT 1";
  db.query(sql,[email],async(err,results)=>{
    if(err){
      console.error("Login database error:",err);
      return res.status(500).json({
        success:false,
        message: "Server error during login."
      });
    }
    if(results.length === 0){
      return res.status(401).json({
        success:false,
        message:"Invalid email or password."
      });
    }
    const user= results[0];
    try{
      const passwordMatches= await bcrypt.compare(
        password,
        user.password
      );
      if(!passwordMatches || user.role !== role){
        return res.status(401).json({
          success:false,
          message:"Invalid email,password, or accound type."
        });
      }
      //Ngo accoundts must be verified before login.
      if(user.role === "ngo"){
        const ngoSql=
        "SELECT is_verified FROM ngos WHERE ngo_id =?  LIMIT 1";
        db.query(ngoSql, [user.ngo_id],(ngoErr, ngoResults)=>{
          if(ngoErr){
            console.log("Ngo verification error:", ngoErr);
            return res.status(500).json({
              success:false,
              message:"Unable to verify NGO account."
            });
          }
          if(
            ngoResults.length === 0 || 
            Number(ngoResults[0].is_verified) !== 1

          ){
            return res.status(403).json({
              success:false,
              message:"Your NGO account is awaiting admin approval."
            });
          }
          return res.json({
            success:true,
            message:"Login Successful.",
            role:user.role,
            user_id: user.user_id,
            ngo_id: user.ngo_id
          });
        });
        return;
      }
      //Donor or admin login
      return res.json({
        success:true,
        message:"Login successful.",
        role:user.role,
        user_id:user.user_id
      });
    }
    catch(comapreError){
      console.error("Password comaprision error:", comapreError);
      return res.status(500).json({
        success:false,
        message:"Server error during login."
      });
    }
  });
});

app.get("/api/ngos/:id",(req,res)=>{
  const ngoId=req.params.id;
  const sql="SELECT * FROM ngos WHERE ngo_id=?";
  db.query(sql,[ngoId],(err,results)=>{
    if(err){
      console.log("Error fetching NGO:", err);
      return res.status(500).json({
        message:"Failed to fetch NGO"
      });
    }
    if(results.length === 0){
      return res.status(404).json({
        message:"NGO not found"

      });
     }
     res.json(results[0]);
  });
});
app.get("/api/ngos",(req,res)=>{
  const sql="SELECT * FROM ngos";
  db.query(sql,(err,results)=>{
    if(err){
      console,log("Error fetching NGOs:",err);
      return res.status(500).json({
        message:"Failed to fetch NGOs"
      });
    }
    res.json(results);
  });
});
app.put("/api/ngos/:id/verify", (req, res) => {

  const ngoId = req.params.id;

  const sql = `
    UPDATE ngos
    SET is_verified = 1
    WHERE ngo_id = ?
  `;

  db.query(sql, [ngoId], (err, result) => {

    if (err) {
      console.log("Error verifying NGO:", err);

      return res.status(500).json({
        message: "Failed to verify NGO"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "NGO not found"
      });
    }

    res.json({
      message: "NGO verified successfully"
    });

  });

});
app.listen(PORT,()=>{
  console.log(`Backend server is running at http://localhost:${PORT}`);
});