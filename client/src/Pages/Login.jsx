import React,{useState} from "react";
import CreateArea from "../components/CreateArea.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Login(){
    let navigate = useNavigate();
    function handleForm(event) {
        event.preventDefault();
    }
    function handleDetail(event,inputName){
        const newVal = event.target.value;
        if (inputName === "username"){
            setLoginDetails({username:newVal,password:login_detail.password});
        }
        else if (inputName === "password"){
            setLoginDetails({username:login_detail.username,password:newVal});
        }
    }
    async function getNext(){
        console.log(login_detail);
        try{
            const res = await axios.post(`http://localhost:5000/loginUser`,{}, {
                    headers: {
                      'Content-Type': 'application/json',
                      'Access-Control-Allow-Origin': '*'
                    },
                    params: login_detail
            });
            console.log(res);
            //navigate("/splitequalhome");
            window.location.href = 'http://localhost:5000/splitequalhome';
        }
        catch(error){

        }
    }
    const [login_detail,setLoginDetails] = useState({
        username:"",
        password:"",
    });
    const customStyle={
        paddingBottom:"40px"
    }
    return (
        <div class="container">
            <Header visibility="1"/>
            <div class="register-container">
                
                <h1 id="homepage-subhead" style={customStyle}>Login to SplitEqual</h1>
                <form onSubmit={handleForm}>
                    <CreateArea name="username" placer="Username" changeDetector={handleDetail} value={login_detail.username} />
                    <CreateArea name="password" placer="Password" changeDetector={handleDetail} value={login_detail.password} />
                    <button class="submit" type="submit" onClick={getNext}>Submit</button>
                </form>
            </div>
            <Footer />
        </div>
    )
}
export default Login;