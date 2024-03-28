import React from "react";
import {Link} from "react-router-dom";
//replace register and login by my expenses if user is authenticated.
function Header(props){
    const customStyle={
        opacity : props.visibility
    }
    return (
        <div class="header-content" style={customStyle}>        
            <h3 class="headpart"><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link></h3>
            <h3 class="headpart"><Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>About-Us</Link></h3>
            <h3 class="headpart"><Link to="/register" style={{ textDecoration: 'none', color: 'inherit' }}>Register</Link></h3>   
            <h3 class="headpart"><Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>Login</Link></h3>
        </div>
    )
}
export default Header;