import React, { useState, useEffect, useRef, useReducer, useMemo } from "react"
import XRButton from "./components/XRButton";
import * as THREE from "three";

function App() {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [isStarted, setIsStarted] = useState(false)
    const [isSupported, setIsSupported] = useState(false)
    const [session, setSession] = useState(null)
    const [hitTestSourceRequested, setHitTestSourceRequested] = useState(false)
    const [hitTestSource, setHitTestSource] = useState(null)
    const [floater, setFloater] = useState(null)
    const [refSpace, setRefSpace] = useState(null)

    const renderer = useMemo(() => new THREE.WebGLRenderer({ antialias: true, alpha: true }),[])

    useEffect(
        () => {
            console.log("useEffect renderer setup")
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.xr.enabled = true;
        },
        [renderer],
    )

    const containerRef = useRef(null)

    // SessionOptions
    const sessionOptions = {
        requiredFeatures: ["local", "hit-test"],
        optionalFeatures: ["dom-overlay"]
    }
    // Check for support
    useEffect(() => {
        const supportCheck = async () => {
            if ("xr" in navigator) {
                const response = await navigator.xr
                    .isSessionSupported("immersive-ar")
                if (response) {
                    setIsSupported(response)
                    console.log(`AR support is ${response}`)
                }

            }
        }
        supportCheck()
    }, [])

    const onSessionStarted = async(xrSession) => {
        if (isSupported) {
            const container = containerRef.current
            container.appendChild(renderer.domElement)
            console.log("canvas added to Dom")

            renderer.xr.setReferenceSpaceType("local");
            renderer.xr.setSession(xrSession)
            setIsStarted(true)
            console.log("scene started")

            const localSpace = await xrSession.requestReferenceSpace("local")
            setRefSpace(localSpace)

            if (!hitTestSourceRequested) {
                console.log("Requesting hit test")
                const viewerSpace = await xrSession.requestReferenceSpace("viewer")
                const requestHitTestSource = await xrSession.requestHitTestSource({ space: viewerSpace })
                setHitTestSource(requestHitTestSource)
                setHitTestSourceRequested(true)
            }
            
            setSession(xrSession)

        }
    }

    // Frame render
    useEffect(() => {     
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.01,
            20
        );

        // Light
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5);
        light.position.set(0.5, 1, 1);
        scene.add(light);

        // Reticle
        const reticle = new THREE.Mesh(
            new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial()
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;

        // Pointer
        const pointer = new THREE.Mesh(
            new THREE.SphereBufferGeometry(0.02),
            new THREE.MeshLambertMaterial({ color: 0xcccccc })
        );
        pointer.visible = false;

        scene.add(pointer);
        scene.add(reticle);

        console.log(renderer)
        const onXRFrame = (time, frame) => {

            if (!isStarted) {
                console.log("not started...")

                // if (floater !== null)
                //     // floater.rotation.set(
                //     //     deviceRotation.x * 0.02 - 45,
                //     //     (floater.rotation.y += 0.015),
                //     //     0
                //     // );
                //     console.log("some shit")
            } else {
                // if (floater !== null) {
                //     scene.remove(floater);
                //     camera.position.set(0, 0, 0);
                //     floater = null;
                // }
                if (frame) {
                    console.log("frame defined")
                    if (hitTestSource) {
                        const hitTestResults = frame.getHitTestResults(hitTestSource)
                        if (hitTestResults.length) {
                            const hit = hitTestResults[0];
                            reticle.visible = true;
                            pointer.visible = true;
                            reticle.matrix.fromArray(
                                hit.getPose(refSpace).transform.matrix
                            );

                            const reticlePos = new THREE.Vector3().setFromMatrixPosition(
                                reticle.matrix
                            );

                            const cameraPos = new THREE.Vector3().setFromMatrixPosition(
                                camera.matrixWorld
                            );
                            pointer.position.copy(reticlePos);
                            pointer.position.y = cameraPos.y;

                            // if (!isTracked) {
                            //     isTracked = true
                            // }
                        } else {
                            reticle.visible = false;
                            pointer.visible = false;
                            console.log("nothing false right?")
                        }
                    }
                }
            }
            renderer.render(scene, camera);
        }
        renderer.setAnimationLoop(onXRFrame)


    }, [renderer, isStarted, hitTestSource, refSpace])


    // useEffect(() => {
    //     if(isSupported){
    //         // Testing purposes only.
    //         console.log(`isStarted is ${isStarted}`)
    //         if (session) {
    //             setIsStarted(true)
    //         }
    //     }


        
    // }, [isStarted, session, isSupported])

    function handleClick() {
        forceUpdate();
    }

    console.log("render")

    return (
        <div>
            <XRButton sessionOptions={sessionOptions} onSessionStarted={onSessionStarted} btnTitle={"Start AR"} />
            <button onClick={handleClick}> Render Test </button>
            <div style={{ backgroundColor: "orange" }} ref={containerRef}></div>
        </div>
    );
}

export default App;
