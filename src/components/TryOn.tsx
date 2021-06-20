import React from 'react'
import { XRCanvas } from "../utils/XR";
import { ARButton } from '../utils/arButton'
import { Props as ContainerProps } from "@react-three/fiber/dist/declarations/src/web/Canvas";

const TryOn = ({ children, sessionInit, ...rest }: ContainerProps & { sessionInit?: any }) => {
    return (
        <XRCanvas onCreated={({ gl }) => void document.body.appendChild(ARButton.createButton(gl, sessionInit))} {...rest}>
            {children}
        </XRCanvas>
    )
}

export default TryOn
