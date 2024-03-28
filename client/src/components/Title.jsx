import React from "react";
function Title(props){
    return (
        <div class="titleandsubtitle">
            <h1 id="homepage-head">{props.heading}</h1>
            <h2 id="homepage-subhead">{props.subheading}</h2>
        </div>
    )
}
export default Title;