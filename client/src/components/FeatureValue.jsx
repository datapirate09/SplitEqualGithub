import React from "react";
function FeatureValue(props){
    const customStyle={
        width: "130px",
        height:"130px",
        paddingBottom:"30px"
    }
    const contentStyle={
        textAlign:"center",
        fontSize:"1.2rem",
        fontFamily:"Libre Baskerville, serif"
    }
    return (
        <div>
            <img src={props.imgsrc} style={customStyle} />
            <h3 style={contentStyle}>{props.content}</h3>
        </div>
    )
}
export default FeatureValue;