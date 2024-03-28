import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import path from "path";
import {dirname} from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname=dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 5000;
const saltRounds=10;

env.config();

app.use(express.static(path.join(__dirname,'build')));
app.use(cors());
app.use(express.static("public"));
// Enable pre-flight requests for all routes
app.options("*", cors());
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000*60*60*24,
      },
    })
  );
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static("public"));
  
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cors());
  app.use(express.json());
  const db = new pg.Client({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
  });
  db.connect();

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,'build','index.html'));
});
app.get("/about",(req,res)=>{
    res.sendFile(path.join(__dirname,'build','index.html'));
});
app.get("/register",(req,res)=>{
    res.sendFile(path.join(__dirname,'build','index.html'));
})
app.get("/login",(req,res)=>{
    if (req.isAuthenticated()){
      res.redirect("/splitequalhome");
    }
    else{
      //res.render("login.ejs");
      res.sendFile(path.join(__dirname,'build','index.html'));
    }
});
app.get("/splitequalhome",(req,res)=>{
  if (req.isAuthenticated()){
    res.render("loginhome.ejs",{user:req.user});
  }
  else{
    res.redirect("/login");
  }
});
app.get("/groups", async (req, res) => {
  if (req.isAuthenticated()) {
      try {
          const result = await db.query("SELECT group_id FROM usergroup WHERE user_id=$1", [req.user.user_id]);
          let groupDetails = [];
          if (result.rows.length > 0) {
              for (let i = 0; i < result.rows.length; i++) {
                  const groupDetail = await db.query("SELECT * FROM groupinfo WHERE group_id=$1", [result.rows[i].group_id]);
                  const userDetail = await db.query("SELECT user_id FROM usergroup WHERE group_id=$1",[result.rows[i].group_id]);
                  const noOfUsers = userDetail.rows.length;
                  groupDetails.push({ groupDetail: groupDetail.rows[0], noOfUsers: noOfUsers });
              }
          }
          
          res.render("groups.ejs", { user: req.user, groupDetails: groupDetails });
      } catch (error) {
          console.log("Error:", error);
          res.redirect("splitequalhome");
      }
  } else {
      res.redirect("/login");
  }
});

app.get("/myAccount",async(req,res)=>{
  if (req.isAuthenticated()){
    console.log(req.user.user_id);
    const result = await db.query("SELECT * FROM userlist WHERE user_id=$1",[req.user.user_id]);
    res.render("account.ejs",{user:result.rows[0]});
  }
  else{
    res.redirect("/login");
  }
});

app.post("/createGroup/form", async (req, res) => {
  const groupName = req.body.groupname;
  const members = [];
  const keys = Object.keys(req.body);
  for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key.startsWith('member')) {
          members.push(req.body[key]);
      }
  }
  var check = 0;
  for(var i=0;i<members.length;i++){
    const result = await db.query("SELECT user_id FROM userlist where username=$1",[members[i]]);
    if (result.rows.length === 0){
      res.render("groupform.ejs",{notFound:members[i]});
      return;
    }
    
  }

  try {
      const result = await db.query("INSERT INTO groupinfo (group_name) VALUES($1) RETURNING group_id", [groupName]);
      const groupId = result.rows[0].group_id;
      await db.query("INSERT INTO usergroup (user_id,group_id) VALUES($1,$2)", [req.user.user_id, groupId]);

      for (let i = 0; i < members.length; i++) {
          const username = members[i];
          const userResult = await db.query("SELECT user_id FROM userlist WHERE username=$1", [username]);
          if (userResult.rows.length > 0) {
              const userId = userResult.rows[0].user_id;
              await db.query("INSERT INTO usergroup (user_id,group_id) VALUES($1,$2)", [userId, groupId]);
          } else {
              res.render("groupform.ejs", { notFound: username });
              return; // Stop execution here to avoid sending multiple responses
          }
      }

      console.log("Group Name:", groupName);
      console.log("Members:", members);

      // Redirect only once after all operations are complete
      res.redirect("/groups");
  } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).send("Internal Server Error");
  }
});

app.get("/createGroup",(req,res)=>{
  if (req.isAuthenticated()){
    res.render("groupform.ejs");
  }
  else{
    res.redirect("/login");
  }
});
app.post("/getUser",async(req,res)=>{
    const userData = req.query;
    const password = userData.password;
    try{
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
              console.error("Error hashing password:", err);
              res.send({created:0});
            } else {
                const result = await db.query("INSERT INTO userlist(fName,lName,email,username,password) VALUES ($1,$2,$3,$4,$5)",[userData.fName,userData.lName,userData.email,userData.username,hash]);
                res.send({created:1});
            }
          });
    }
    catch(error){
        console.log("Error");
    }
});
app.post("/changeDetails", async (req, res) => {
  const oldPassword = req.body.oldPassword;
  try {
    const result = await db.query("SELECT password FROM userlist WHERE user_id=$1", [req.user.user_id]);
    const passtoCheck = result.rows[0].password;
    bcrypt.compare(oldPassword, passtoCheck, async (err, valid) => {
      if (err) {
        console.log("Error comparing");
        // Handle error
        return res.status(500).send("Internal Server Error");
      }
      
      if (valid) {
        console.log("Pass bro");
        const newPassword = req.body.newPassword;
        try {
          bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
            if (err) {
              console.error("Error hashing password:", err);
              res.send({created:0});
            } else {
                const res1 = await db.query("UPDATE userlist SET password=$1 WHERE user_id=$2", [hash, req.user.user_id]);
                res.redirect("/splitequalhome");
            }
          });
          //await db.query("UPDATE userlist SET password=$1 WHERE user_id=$2", [newPassword, req.user.user_id]);
          //res.redirect("/splitequalhome");
        } catch (error) {
          console.log("Error updating password:", error);
          // Handle error
          return res.status(500).send("Internal Server Error");
        }
      } else {
        console.log("picha lite bro");
        const user = await db.query("SELECT * FROM userlist WHERE user_id=$1", [req.user.user_id]);
        res.render("account.ejs", { wrongAttempt: 1, user: user.rows[0] });
      }
    });
  } catch (error) {
    console.log("Error retrieving password:", error);
    // Handle error
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/checkAuth", (req, res) => {
    if (req.isAuthenticated()) {
        // User is authenticated
        res.send({ isAuthenticated: true, user: req.user });
    } else {
        // User is not authenticated
        res.send({ isAuthenticated: false });
    }
});
app.post("/loginUser", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: "Internal Server Error" });
        }
        if (!user) {
            // Authentication failed
            return res.send({ isAuthenticated: false });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ error: "Internal Server Error" });
            }
            return res.send({ isAuthenticated: true, user: req.user });
        });
    })(req, res, next);
});
app.get("/groups/:groupid",async(req,res)=>{
  if (req.isAuthenticated()){
    const groupid = req.params.groupid;
    console.log(groupid);
    try{
      const result = await db.query("SELECT user_id FROM usergroup WHERE group_id=$1 AND user_id!=$2",[groupid,req.user.user_id]);
      let userList = [];
      for(var i=0;i<result.rows.length;i++){
        const user = await db.query("SELECT * FROM userlist WHERE user_id=$1",[result.rows[i].user_id]);
        userList.push(user.rows[0]);
      }
      const transactions = await db.query("SELECT transaction_id FROM grouptransaction WHERE group_id=$1",[groupid]);
      let allTransactions = [];
      for (var i = 0; i < transactions.rows.length; i++) {
        const individualTransaction = await db.query("SELECT * FROM transactionuser WHERE transaction_id=$1", [transactions.rows[i].transaction_id]);
        if (individualTransaction.rows.length > 0) {
            const sender = await db.query("SELECT username FROM userlist WHERE user_id=$1", [individualTransaction.rows[0].sender_userid]);
            const name = sender.rows[0] ? sender.rows[0].username : "Unknown";
            var amount = 0;
            for (var j = 0; j < individualTransaction.rows.length; j++) {
                amount += individualTransaction.rows[j].senderamount;
                if (j === (individualTransaction.rows.length-1))
                  amount+= individualTransaction.rows[j].senderamount;
            }
            allTransactions.push({ name, amount });
        }
      } 
      let visited = [];
      const users = await db.query("SELECT * FROM transactionuser WHERE sender_userid=$1", [req.user.user_id]);
      for (var i = 0; i < users.rows.length; i++) {
          const receiver_id = users.rows[i].receiver_userid;
          let amount = 0;
          if (!visited.some(item => item.receiver_id === receiver_id)) {
              for (var j = 0; j < users.rows.length; j++) {
                  if (users.rows[j].receiver_userid === receiver_id) {
                      amount += users.rows[j].senderamount;
                  }
              }
              visited.push({receiver_id, amount});
              console.log(`Receiver ID: ${receiver_id}, Total Amount: ${amount}`);
          }
      }

      let visited2 = [];
      const users2 = await db.query("SELECT * FROM transactionuser WHERE receiver_userid=$1", [req.user.user_id]);
      for (var i = 0; i < users2.rows.length; i++) {
          const sender_id = users2.rows[i].sender_userid;
          let amount = 0;
          if (!visited2.some(item => item.sender_id === sender_id)) {
              for (var j = 0; j < users2.rows.length; j++) {
                  if (users2.rows[j].sender_userid === sender_id) {
                      amount += users2.rows[j].receiveramount; // Corrected typo
                  }
              }
              visited2.push({sender_id, amount});
              console.log(`Sender ID: ${sender_id}, Total Amount: ${amount}`);
          }
      }

      //



      let combinedList = [];

// Iterate over visited
visited.forEach(item1 => {
    // Check if receiver_id matches any sender_id in visited2
    const matchingItem = visited2.find(item2 => item2.sender_id === item1.receiver_id);
    if (matchingItem) {
        // If a match is found, add their amounts
        const combinedAmount = item1.amount + matchingItem.amount;
        combinedList.push({ id: item1.receiver_id, amount: combinedAmount });
    } else {
        // If no match is found, directly append to combinedList
        combinedList.push({ id: item1.receiver_id, amount: item1.amount });
    }
});

// Iterate over visited2
visited2.forEach(item2 => {
    // Check if sender_id matches any receiver_id in visited
    const matchingItem = visited.find(item1 => item1.receiver_id === item2.sender_id);
    if (!matchingItem) {
        // If no match is found, directly append to combinedList
        combinedList.push({ id: item2.sender_id, amount: item2.amount });
    }
});
// Assuming this code is inside an async function

let newCombinedList = [];

for (let i = 0; i < combinedList.length; i++) {
  const usernameQueryResult = await db.query("SELECT username FROM userlist WHERE user_id=$1", [combinedList[i].id]);
  const username = usernameQueryResult.rows[0].username;
  const amount = combinedList[i].amount;
  newCombinedList.push({ username: username, amount: amount });
}

console.log("Combined List:", combinedList);
console.log("New Combined List:", newCombinedList);
const userDetails = req.user.user_id;
      console.log(allTransactions);
      res.render("transaction.ejs",{userList,transactions,groupid,allTransactions,newCombinedList,userDetails});
    }
    catch(error){
      console.log(error);
    }
  }
  else{
    res.redirect("/login");
  }
});

app.post("/removeTransaction",async(req,res)=>{
  const usernametoRemove1 = req.body.username;
  const useridtoRemove1 = await db.query("SELECT user_id FROM userlist WHERE username=$1",[usernametoRemove1]);
  const useridtoRemove2 = req.body.userid;
  try{
    const result = await db.query("DELETE FROM transactionuser WHERE sender_userid=$1 AND receiver_userid=$2",[useridtoRemove1.rows[0].user_id,useridtoRemove2]);
    const result2 = await db.query("DELETE FROM transactionuser WHERE receiver_userid=$1 AND sender_userid=$2",[useridtoRemove1.rows[0].user_id,useridtoRemove2]);
    res.redirect("/groups");
  }
  catch(error){
    console.error(error);
  }
});
app.get("/logout",(req,res)=>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})
app.post("/addTransaction/:groupid",async(req,res)=>{
  console.log(req.body.amount);
  console.log(req.body.selectedUsers);
  const groupid = req.params.groupid;
  const amount = req.body.amount;
  var users = req.body.selectedUsers;
  if (!Array.isArray(users)) {
    users = [users]; // Convert to array if it's not already
  }
  console.log("USER LIST"+users[0]);
  const transaction = await db.query("INSERT INTO grouptransaction (group_id,amount) VALUES($1,$2) RETURNING transaction_id",[groupid,amount]);
  const transactionid = transaction.rows[0].transaction_id;
  var numberOfUsers = users.length;
  const senderMoney = amount/(numberOfUsers+1);
  const receiverMoney = -(amount/(numberOfUsers+1))
  for(var i=0;i<numberOfUsers;i++){
    const userDetail = await db.query("SELECT user_id FROM userlist WHERE username=$1",[users[i]]);
    const receiverid = userDetail.rows[0].user_id;
    const userTransaction = await db.query("INSERT INTO transactionuser (transaction_id,sender_userid,receiver_userid,senderamount,receiveramount) VALUES($1,$2,$3,$4,$5)",[transactionid,req.user.user_id,receiverid,senderMoney,receiverMoney]);
  }
  res.redirect("/groups");
});

app.post("/checkusername",async(req,res)=>{
    console.log(req.query);
    const username = req.query.username;
    try{
        const result = await db.query("SELECT user_id FROM userlist WHERE username=$1",[username]);
        const resultSize = result.rows.length;
        console.log("Result is "+resultSize);
        if (resultSize == 0){
            res.send({exists:0});
        }
        else 
        {
            res.send({exists:1});
        }
    }
    catch(error){
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
})
passport.use(
    new Strategy(async function verify(username, password, cb) {
        console.log(username);
        console.log(password);
      try {
        const result = await db.query("SELECT * FROM userlist WHERE username = $1 ", [
          username,
        ]);
        
        console.log(result.rows[0]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashedPassword = user.password;
          bcrypt.compare(password, storedHashedPassword, (err, valid) => {
            if (err) {
              //Error with password check
              console.error("Error comparing passwords:", err);
              return cb(err);
            } else {
              if (valid) {
                //Passed password check
                console.log("Pass");
                return cb(null, user);
              } else {
                console.log("fail");
                //Did not pass password check
                return cb(null, false);
              }
            }
          });
        } else {
          return cb("User not found");
        }
      } catch (err) {
        console.log(err);
      }
    })
  );
  

  
  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });




app.listen(port,()=>{
    console.log(`Server listening on port ${port}`);
});