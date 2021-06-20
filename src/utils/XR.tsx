import * as React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Props as ContainerProps } from "@react-three/fiber/dist/declarations/src/web/Canvas";


const XRContext = React.createContext({});

export function XR(props: { children: React.ReactNode }) {
    const { gl, camera } = useThree();
    const [isPresenting, setIsPresenting] = React.useState(
        () => gl.xr.isPresenting
    );

    React.useEffect(() => {
        const xr = gl.xr;
        const handleSessionChange = () => setIsPresenting(xr.isPresenting);

        xr.addEventListener("sessionstart", handleSessionChange);
        xr.addEventListener("sessionend", handleSessionChange);

        return () => {
            xr.removeEventListener("sessionstart", handleSessionChange);
            xr.removeEventListener("sessionend", handleSessionChange);
        };
    }, [gl]);

    const value = React.useMemo(() => ({ isPresenting }), [isPresenting]);

    return (
        <XRContext.Provider value={value}>
            <primitive object={camera} dispose={null} />
            {props.children}
        </XRContext.Provider>
    );
}

export function XRCanvas({ children, ...rest }: ContainerProps) {
    return (
        <Canvas {...rest}>
            <XR>{children}</XR>
        </Canvas>
    );
}
