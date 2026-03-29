import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Text, Float, PresentationControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

const FridgeModel = ({ status, doorOpen }) => {
    const doorRef = useRef();
    
    // Animation for door
    useFrame((state) => {
        const targetRotation = doorOpen ? -Math.PI / 2 : 0;
        if (doorRef.current) {
            doorRef.current.rotation.y = THREE.MathUtils.lerp(
                doorRef.current.rotation.y,
                targetRotation,
                0.1
            );
        }
    });

    if (!status) return null;

    return (
        <group>
            {/* Main Body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2, 4, 1.8]} />
                <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Top Accents */}
            <mesh position={[0, 2, 0]}>
                <boxGeometry args={[2.1, 0.1, 1.9]} />
                <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} />
            </mesh>

            {/* Door Pivot Group */}
            <group ref={doorRef} position={[1, 0, 0.9]}>
                <mesh position={[-1, 0, 0.05]}>
                    <boxGeometry args={[2, 4, 0.1]} />
                    <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Door Display Screen with Refined Border Glow */}
                <lineSegments position={[-1, 0.5, 0.105]}>
                    <edgesGeometry args={[new THREE.PlaneGeometry(1.22, 0.82)]} />
                    <lineBasicMaterial color="#00f0ff" transparent opacity={0.9} linewidth={2} />
                </lineSegments>
                <mesh position={[-1, 0.5, 0.11]}>
                    <planeGeometry args={[1.2, 0.8]} />
                    <meshStandardMaterial color="#050a12" roughness={0.1} metalness={0.8} />
                </mesh>

                {/* Live Stats on Screen (Perfectly Aligned) */}
                <group position={[-1, 0.5, 0.12]}>
                    <Text
                        position={[-0.45, 0.25, 0]}
                        fontSize={0.12}
                        font="https://cdn.jsdelivr.net/npm/@fontsource/anta/files/anta-latin-400-normal.woff"
                        color="#00f0ff"
                        anchorX="left"
                    >
                        {status.temperature}°C
                    </Text>
                    <Text
                        position={[-0.45, 0.05, 0]}
                        fontSize={0.07}
                        color="#00ff9d"
                        anchorX="left"
                    >
                        FRESHNESS: {status.freshnessPercentage}%
                    </Text>
                    <Text
                        position={[-0.45, -0.15, 0]}
                        fontSize={0.07}
                        color="#aaa"
                        anchorX="left"
                    >
                        GAS: {status.gasLevel} PPM
                    </Text>
                </group>

                {/* Handle */}
                <mesh position={[-1.8, 0, 0.15]}>
                    <boxGeometry args={[0.05, 1, 0.1]} />
                    <meshStandardMaterial color="#00f0ff" />
                </mesh>
            </group>

            {/* Internal Shelves (visible when open) */}
            {doorOpen && (
                <group position={[0, 0, 0]}>
                    <mesh position={[0, 0.5, 0]}>
                        <boxGeometry args={[1.8, 0.05, 1.6]} />
                        <meshStandardMaterial color="#00f0ff" transparent opacity={0.3} />
                    </mesh>
                    <mesh position={[0, -0.5, 0]}>
                        <boxGeometry args={[1.8, 0.05, 1.6]} />
                        <meshStandardMaterial color="#00f0ff" transparent opacity={0.3} />
                    </mesh>
                </group>
            )}
        </group>
    );
};

const Fridge3D = ({ status }) => {
    return (
        <div style={{ width: '100%', height: '400px', background: 'radial-gradient(circle, #0b1120 0%, #05050a 100%)', borderRadius: '16px', overflow: 'hidden' }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <PresentationControls
                    global
                    config={{ mass: 2, tension: 500 }}
                    snap={{ mass: 4, tension: 1500 }}
                    rotation={[0, 0.3, 0]}
                    polar={[-Math.PI / 3, Math.PI / 3]}
                    azimuth={[-Math.PI / 1.4, Math.PI / 2]}
                >
                    <Float rotationIntensity={0.5}>
                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
                        <pointLight position={[-10, -10, -10]} color="#7000ff" intensity={1} />
                        
                        <FridgeModel status={status} doorOpen={status?.doorStatus === 'open'} />
                        
                        <ContactShadows position={[0, -2.1, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
                    </Float>
                </PresentationControls>
            </Canvas>
        </div>
    );
};

export default Fridge3D;
