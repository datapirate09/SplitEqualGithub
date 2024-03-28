import React from "react";
import {Link} from "react-router-dom";
function LoginOption(){
    return (
        <div class="login-options">
            <button class="loginmethod"><Link to="/register" style={{ textDecoration: 'none', color: 'inherit' }}>Register</Link></button>
            <button class="loginmethod"><Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>Login</Link></button>
        </div>
    )
}
export default LoginOption;