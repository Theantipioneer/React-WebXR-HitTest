import React from 'react'

const XRButton = ({ sessionOptions, onSessionStarted }) => {

    let arSession = null
    
    const onStartSelected = () => {
        if (!arSession) {
            navigator.xr
                .requestSession("immersive-ar", sessionOptions).then(onSessionStarted)
        } else {
            console.log("i don know");
        }
    }

    return (
        <button onClick={onStartSelected} style={{backgroundColor: "blue", color: "white", border: "none", borderRadius: "5px", padding: 5}}> Start AR </button>
    )
}

export default XRButton
