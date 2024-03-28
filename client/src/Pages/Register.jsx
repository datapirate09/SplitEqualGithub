import React,{useState} from "react";
import CreateArea from "../components/CreateArea.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register(){
    let navigate = useNavigate();
    const [userData,setData] = useState({
        fName:"",
        lName:"",
        email:"",
        username:"",
        password:"",
    });
    const [fullname,setFullName] = useState({
        fName:"",
        lName:"",
    });
    const [email,setEmail] = useState("");
    const [username,setUserName] = useState("");
    const [password,setPassword] = useState("");
    const [confirmPassWord,setConfirm] = useState("");
    var [ele,setEle] = useState(0);
    function handleChangeName(event,inputName){
        const newVal = event.target.value;
        if (inputName === "fname") {
        setFullName({ fName: newVal, lName: fullname.lName });
        } else {
        setFullName({ fName: fullname.fName, lName: newVal });
        }
        console.log(inputName);
    }
    function handleForm(event) {
        event.preventDefault();

        // Send a POST request to the server
        
        ///should do something over here 
        
    }
    async function getNext(){
        if (ele === 0){
            console.log(fullname);
            setData({fName:fullname.fName,lName:fullname.lName});
            setEle(++ele);
        }
        else if (ele === 1){
            console.log(email);
            if (email.search("@gmail.com") === -1){
                setEle(ele);
                setEmail("");
            }
            else{
                setData({fName:userData.fName,lName:userData.lName,email:email});
                setEle(++ele);
            }
        }  
        else if (ele === 2){
            try{
                const result = await axios.post(`http://localhost:5000/checkusername`,{},{
                    headers: {
                      'Content-Type': 'application/json',
                      'Access-Control-Allow-Origin': '*'
                    },
                    params: {username}
                });
                const { exists } = result.data;
                console.log(exists);
                if (exists === 0) {
                    console.log("Username does not exist.");
                    setData({fName:userData.fName,lName:userData.lName,email:email,username:username});
                    console.log(username);
                    setEle(++ele);
                } else {
                    console.log("Username exists.");
                    setUserName("");
                }
            }
            catch(error){
                console.error("Error:", error);
            }
            
        }
        else if (ele === 3){
            console.log(password);
            console.log(confirmPassWord);
            if (password !== confirmPassWord){
                setPassword("");
                setConfirm("");
            }
            else{
                setData({fName:userData.fName,lName:userData.lName,email:email,username:username,password:password});
                console.log(userData);
                setEle(++ele);
            }
        }
        else if (ele === 4){
            console.log("here");
            try{
                const result = await axios.post(`http://localhost:5000/getUser`,{}, {
                    headers: {
                      'Content-Type': 'application/json',
                      'Access-Control-Allow-Origin': '*'
                    },
                    params: userData
                });
                const {created} = result.data;
                if (created === 1){
                    navigate("/login");
                }
                setEle(++ele);
            }
            catch(error){
                console.log("Dont know man");
            }
            
                
            //by here user data is ready
            console.log(userData);
        }
    }
    function handleChangeEmail(event){
        const val = event.target.value;
        setEmail(val);
    }
    function handleChangeUserName(event){
        const val = event.target.value;
        setUserName(val);
    }
    function handleChangePassword(event){
        const val = event.target.value;
        setPassword(val);
    }
    function handleChangeConfirm(event){
        const val = event.target.value;
        setConfirm(val); 
    }
    const customStyle={
        paddingBottom:"40px"
    }


    return (
        
        <div class="container">
            <Header visibility="1"/>
            <div class="register-container">
                
                <h1 id="homepage-subhead" style={customStyle}>Welcome to SplitEqual</h1>
                <h1>Hello {fullname.fName} {fullname.lName}</h1>
                
                <form onSubmit={handleForm}>
                    {ele === 0 &&  (<>          
                        <CreateArea name="fname" placer="First Name" changeDetector={handleChangeName} value={fullname.fName}/>
                        <CreateArea name="lname" placer="Last Name" changeDetector={handleChangeName} value={fullname.lName} />
                    </>
                    )}
                    {ele === 1 && (<>
                        <CreateArea name="email" placer="Email-ID" changeDetector={handleChangeEmail} value={email}/>
                    </>)
                    }
                    {ele === 2 && (<>
                        <CreateArea name="username" placer="UserName" changeDetector={handleChangeUserName} value={username}/>
                    </>)
                    }
                    {ele === 3 &&(<>
                        <CreateArea name="password" placer="Password" changeDetector={handleChangePassword} value={password} type="password"/>
                        <CreateArea name="password" placer="Confirm-Password" changeDetector={handleChangeConfirm} value={confirmPassWord} type="password" />
                    </>)
                    }
                    <button class="submit" type="submit" onClick={getNext}>Submit</button>
                </form>
            </div>
            <Footer />
        </div>
    )
}
export default Register;


//The values of user to store are in