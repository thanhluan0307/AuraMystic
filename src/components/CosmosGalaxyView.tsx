import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { NebulaThemeKey } from '../types/cosmos3DTypes';
import { NEBULA_THEMES } from '../data/celestialBodies';
import { createThreeRenderer, renderFrame, disposeThreeScene, ExpoGLContext } from '../services/threeRenderer';

interface CosmosGalaxyViewProps {
  themeKey: NebulaThemeKey;
  warpSpeed: boolean;
  autoRotate: boolean;
}

export function CosmosGalaxyView({
  themeKey,
  warpSpeed,
  autoRotate,
}: CosmosGalaxyViewProps) {
  const animFrameIdRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const galaxyPointsRef = useRef<THREE.Points | null>(null);
  const warpStarsRef = useRef<THREE.Points | null>(null);
  const warpPositionsRef = useRef<Float32Array | null>(null);

  const autoRotateRef = useRef<boolean>(autoRotate);
  const warpSpeedRef = useRef<boolean>(warpSpeed);
  const themeKeyRef = useRef<NebulaThemeKey>(themeKey);

  const rotYRef = useRef<number>(0);
  const rotXRef = useRef<number>(0.55);
  const targetRotYRef = useRef<number>(0);
  const targetRotXRef = useRef<number>(0.55);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    warpSpeedRef.current = warpSpeed;
  }, [warpSpeed]);

  useEffect(() => {
    themeKeyRef.current = themeKey;
    if (galaxyPointsRef.current) {
      updateGalaxyColors(galaxyPointsRef.current, themeKey);
    }
  }, [themeKey]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        targetRotYRef.current += gestureState.vx * 0.08;
        targetRotXRef.current += gestureState.vy * 0.08;
        targetRotXRef.current = Math.max(-1.3, Math.min(1.3, targetRotXRef.current));
      },
    })
  ).current;

  const updateGalaxyColors = (points: THREE.Points, currentThemeKey: NebulaThemeKey) => {
    const theme = NEBULA_THEMES[currentThemeKey] || NEBULA_THEMES.purple;
    const geometry = points.geometry as THREE.BufferGeometry;
    const colors = geometry.attributes.color.array as Float32Array;
    const count = colors.length / 3;

    const coreCol = new THREE.Color(theme.coreHex);
    const armCol = new THREE.Color(theme.armHex);
    const dustCol = new THREE.Color(theme.dustHex);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const ratio = i / count;
      let c: THREE.Color;
      if (ratio < 0.2) {
        c = coreCol.clone().lerp(armCol, ratio * 5);
      } else if (ratio < 0.7) {
        c = armCol.clone().lerp(dustCol, (ratio - 0.2) * 2);
      } else {
        c = dustCol.clone();
      }
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    geometry.attributes.color.needsUpdate = true;
  };

  const onContextCreate = (gl: ExpoGLContext) => {
    const width = gl.drawingBufferWidth || 400;
    const height = gl.drawingBufferHeight || 700;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1200);
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 0, 0);

    const renderer = createThreeRenderer(gl, width, height);
    rendererRef.current = renderer;

    const starCount = 3600;
    const arms = 3;
    const radius = 16;
    const spin = 1.3;

    const galaxyGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const theme = NEBULA_THEMES[themeKeyRef.current] || NEBULA_THEMES.purple;
    const coreCol = new THREE.Color(theme.coreHex);
    const armCol = new THREE.Color(theme.armHex);
    const dustCol = new THREE.Color(theme.dustHex);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 1.8) * radius;
      const spinAngle = r * spin;
      const armAngle = ((i % arms) * (2 * Math.PI)) / arms;

      const spread = Math.pow(Math.random(), 2) * (r * 0.18 + 0.3);
      const randomX = (Math.random() - 0.5) * spread;
      const randomY = (Math.random() - 0.5) * (spread * 0.45);
      const randomZ = (Math.random() - 0.5) * spread;

      positions[i3] = Math.cos(armAngle + spinAngle) * r + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(armAngle + spinAngle) * r + randomZ;

      const distRatio = r / radius;
      let c: THREE.Color;
      if (distRatio < 0.25) {
        c = coreCol.clone().lerp(armCol, distRatio * 4);
      } else {
        c = armCol.clone().lerp(dustCol, (distRatio - 0.25) * 1.33);
      }
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const galaxyMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const galaxyPoints = new THREE.Points(galaxyGeo, galaxyMat);
    scene.add(galaxyPoints);
    galaxyPointsRef.current = galaxyPoints;

    const coreGeo = new THREE.SphereGeometry(1.0, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: theme.coreHex,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    galaxyPoints.add(coreMesh);

    const warpCount = 1200;
    const warpGeo = new THREE.BufferGeometry();
    const warpPositions = new Float32Array(warpCount * 3);

    for (let i = 0; i < warpCount; i++) {
      const i3 = i * 3;
      warpPositions[i3] = (Math.random() - 0.5) * 80;
      warpPositions[i3 + 1] = (Math.random() - 0.5) * 80;
      warpPositions[i3 + 2] = -Math.random() * 200;
    }

    warpPositionsRef.current = warpPositions;
    warpGeo.setAttribute('position', new THREE.BufferAttribute(warpPositions, 3));

    const warpMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const warpStars = new THREE.Points(warpGeo, warpMat);
    scene.add(warpStars);
    warpStarsRef.current = warpStars;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      rotYRef.current += (targetRotYRef.current - rotYRef.current) * 0.08;
      rotXRef.current += (targetRotXRef.current - rotXRef.current) * 0.08;

      if (autoRotateRef.current) {
        targetRotYRef.current += 0.0035;
      }

      if (galaxyPointsRef.current) {
        galaxyPointsRef.current.rotation.y = rotYRef.current;
        galaxyPointsRef.current.rotation.x = rotXRef.current;
      }

      if (warpStarsRef.current && warpPositionsRef.current) {
        const isWarp = warpSpeedRef.current;
        const speed = isWarp ? 4.2 : 0.25;
        const warpPos = warpPositionsRef.current;
        const geo = warpStarsRef.current.geometry as THREE.BufferGeometry;

        for (let i = 0; i < warpCount; i++) {
          const i3 = i * 3 + 2;
          warpPos[i3] += speed;

          if (warpPos[i3] > 30) {
            warpPos[i3] = -180;
            warpPos[i * 3] = (Math.random() - 0.5) * 80;
            warpPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
          }
        }
        geo.attributes.position.needsUpdate = true;
        (warpStarsRef.current.material as THREE.PointsMaterial).size = isWarp ? 0.35 : 0.18;
      }

      renderFrame(renderer, scene, camera, gl);
    };

    animate();
  };

  useEffect(() => {
    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (sceneRef.current) {
        disposeThreeScene(sceneRef.current, rendererRef.current || undefined);
      }
    };
  }, []);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030008',
  },
});
