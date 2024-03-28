import React from "react";
function CreateArea(props){
    function callChange(event){
        props.changeDetector(event,props.name);
    }
    return (<div>
        <input placeholder={props.placer} onChange={callChange} value={props.value} type={props.type} />
    </div>)
}
export default CreateArea;