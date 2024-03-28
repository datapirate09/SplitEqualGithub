import React from "react";
import FeatureValue from "./FeatureValue.jsx";
function Feature(){
    const customStyle={
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        textAlign: "center",
        alignItems: "center",
        gap: "120px",
        paddingTop:"80px",
        paddingBottom:"100px"
    }
    const headStyle={
        textAlign:"center",
        fontSize:"2.5rem",
        fontFamily:"Source Code Pro, monospace"
    }
    const headerStyle={
        backgroundColor:"#f8c291",
        paddingTop:"120px",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"center",
        paddingLeft:"30px",
        paddingRight:"30px"
    }
    return (
        <div style={headerStyle}>
            <h2 style={headStyle}>SplitFeatures Crafted Specially For SplitUsers</h2>
            <div className="flexcontainer" style={customStyle}>
                <FeatureValue imgsrc="../../free.svg" content="Add unlimited number of expenses for free"/>
                <FeatureValue imgsrc="../../friends.svg" content="Create a SplitGroup to add group expenses"/>
                <FeatureValue imgsrc="../../money.svg" content="Complete Transactions on the go"/>
            </div>
        </div>
        
    )
}
export default Feature;