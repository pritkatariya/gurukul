/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';
import { useRef, useState, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useFBO, MeshTransmissionMaterial, useTexture } from '@react-three/drei';
import Logo from '../assets/gurukul logo.png'; // 💡 લોગો ઇમ્પોર્ટ

export default function FluidGlass() {
  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true, antialias: true }}>
      <LensScene />
    </Canvas>
  );
}

const LensScene = memo(function LensScene() {
  const ref = useRef<THREE.Mesh>(null!);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());

  // લોગો ટેક્સચર લોડ કર્યું
  const texture = useTexture(Logo);

  useFrame((state) => {
    const { gl, camera } = state;

    // 💡 એનિમેશન સંપૂર્ણ બંધ: બબલ હંમેશા સેન્ટરમાં (0, 0) ફિક્સ રહેશે
    if (ref.current) {
      ref.current.position.set(0, 0, 15);
      ref.current.rotation.set(0, 0, 0);
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0x000000, 0); 
  });

  return (
    <>
      {/* 🖼️ ફિક્સ 3D બેકગ્રાઉન્ડ લોગો */}
      <mesh scale={[vp.width * 0.95, vp.height * 0.95, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={texture} transparent opacity={1} />
      </mesh>
      
      {/* 🔮 ફિક્સ 3D ગ્લાસ સ્ફીયર (૦% બ્લર - ૧૦૦% ક્રિસ્ટલ ક્લિયર કાચ) */}
      <mesh ref={ref} scale={1.45}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={1.15}                     // React Bits Default Props
          thickness={2}                  // React Bits Default Props
          anisotropy={0.01}              // React Bits Default Props
          chromaticAberration={0.05}     // React Bits Default Props
          roughness={0}                  // બ્લર = 0 (૧૦૦% ક્લિયર લુક)
          transmission={1}               // પ્યોર ટ્રાન્સપરન્ટ
          distortion={0}                 // કોઈ હલનચલન કે વેવ્ઝ નહીં
        />
      </mesh>
    </>
  );
});