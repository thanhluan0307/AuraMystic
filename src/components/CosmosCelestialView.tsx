import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { CelestialBody } from '../types/cosmos3DTypes';
import { CELESTIAL_BODIES, ZODIAC_SIGNS_3D } from '../data/celestialBodies';
import { createThreeRenderer, renderFrame, disposeThreeScene, ExpoGLContext } from '../services/threeRenderer';

interface CosmosCelestialViewProps {
  autoRotate: boolean;
  selectedPlanetId: string | null;
  onSelectPlanet: (planet: CelestialBody) => void;
}

interface PlanetMeshNode {
  data: CelestialBody;
  mesh: THREE.Mesh;
  orbitGroup: THREE.Group;
  currentAngle: number;
}

export function CosmosCelestialView({
  autoRotate,
  selectedPlanetId,
  onSelectPlanet,
}: CosmosCelestialViewProps) {
  const animFrameIdRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planetNodesRef = useRef<PlanetMeshNode[]>([]);
  const selectionRingRef = useRef<THREE.Mesh | null>(null);

  const autoRotateRef = useRef<boolean>(autoRotate);
  const selectedPlanetIdRef = useRef<string | null>(selectedPlanetId);

  const radiusRef = useRef<number>(34);
  const thetaRef = useRef<number>(0.2);
  const phiRef = useRef<number>(1.1);
  const targetThetaRef = useRef<number>(0.2);
  const targetPhiRef = useRef<number>(1.1);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    selectedPlanetIdRef.current = selectedPlanetId;
    if (selectionRingRef.current && selectedPlanetId) {
      const targetNode = planetNodesRef.current.find((n) => n.data.id === selectedPlanetId);
      if (targetNode) {
        selectionRingRef.current.visible = true;
        selectionRingRef.current.scale.set(targetNode.data.size * 1.8, targetNode.data.size * 1.8, targetNode.data.size * 1.8);
      }
    } else if (selectionRingRef.current && !selectedPlanetId) {
      selectionRingRef.current.visible = false;
    }
  }, [selectedPlanetId]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        targetThetaRef.current -= gestureState.vx * 0.08;
        targetPhiRef.current -= gestureState.vy * 0.06;
        targetPhiRef.current = Math.max(0.2, Math.min(Math.PI - 0.2, targetPhiRef.current));
      },
    })
  ).current;

  const onContextCreate = (gl: ExpoGLContext) => {
    const width = gl.drawingBufferWidth || 400;
    const height = gl.drawingBufferHeight || 700;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = createThreeRenderer(gl, width, height);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x334155, 1.2);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xfffbeb, 3.2, 80, 0.8);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000 * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 160;
      starPos[i] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xc4b5fd,
      size: 0.25,
      transparent: true,
      opacity: 0.75,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    const zodiacRingRadius = 24.5;
    const zodiacRingPoints: THREE.Vector3[] = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      zodiacRingPoints.push(new THREE.Vector3(Math.cos(a) * zodiacRingRadius, 0, Math.sin(a) * zodiacRingRadius));
    }
    const zodiacLineGeo = new THREE.BufferGeometry().setFromPoints(zodiacRingPoints);
    const zodiacLineMat = new THREE.LineBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.5,
    });
    scene.add(new THREE.Line(zodiacLineGeo, zodiacLineMat));

    ZODIAC_SIGNS_3D.forEach((z) => {
      const x = Math.cos(z.angle) * zodiacRingRadius;
      const zPos = Math.sin(z.angle) * zodiacRingRadius;
      const nodeGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const nodeMat = new THREE.MeshBasicMaterial({ color: z.colorHex });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, 0, zPos);
      scene.add(nodeMesh);
    });

    const sphereGeo = new THREE.IcosahedronGeometry(25.5, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    scene.add(new THREE.Mesh(sphereGeo, sphereMat));

    const planetNodes: PlanetMeshNode[] = [];

    CELESTIAL_BODIES.forEach((body, idx) => {
      const orbitGroup = new THREE.Group();
      scene.add(orbitGroup);

      if (body.distance > 0) {
        const orbitPts: THREE.Vector3[] = [];
        const orbitSegments = 90;
        for (let i = 0; i <= orbitSegments; i++) {
          const a = (i / orbitSegments) * Math.PI * 2;
          orbitPts.push(new THREE.Vector3(Math.cos(a) * body.distance, 0, Math.sin(a) * body.distance));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
        const orbitMat = new THREE.LineBasicMaterial({
          color: body.colorHex,
          transparent: true,
          opacity: 0.25,
        });
        scene.add(new THREE.Line(orbitGeo, orbitMat));
      }

      const isSun = body.id === 'sun';
      const planetGeo = new THREE.SphereGeometry(body.size, 24, 24);
      let planetMat: THREE.Material;

      if (isSun) {
        planetMat = new THREE.MeshBasicMaterial({ color: body.colorHex });
      } else {
        planetMat = new THREE.MeshStandardMaterial({
          color: body.colorHex,
          roughness: 0.4,
          metalness: 0.2,
        });
      }

      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      const initialAngle = (idx * (Math.PI * 2)) / CELESTIAL_BODIES.length;
      planetMesh.position.set(
        Math.cos(initialAngle) * body.distance,
        0,
        Math.sin(initialAngle) * body.distance
      );
      orbitGroup.add(planetMesh);

      if (isSun) {
        const coronaGeo = new THREE.SphereGeometry(body.size * 1.35, 20, 20);
        const coronaMat = new THREE.MeshBasicMaterial({
          color: 0xfde047,
          transparent: true,
          opacity: 0.28,
        });
        planetMesh.add(new THREE.Mesh(coronaGeo, coronaMat));
      }

      if (body.hasRings && body.ringInnerRadius && body.ringOuterRadius) {
        const ringGeo = new THREE.RingGeometry(body.ringInnerRadius, body.ringOuterRadius, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: body.ringColorHex || 0xd97706,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 3;
        planetMesh.add(ringMesh);
      }

      planetNodes.push({
        data: body,
        mesh: planetMesh,
        orbitGroup,
        currentAngle: initialAngle,
      });
    });

    planetNodesRef.current = planetNodes;

    const selGeo = new THREE.RingGeometry(1.2, 1.35, 32);
    const selMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const selectionRing = new THREE.Mesh(selGeo, selMat);
    selectionRing.rotation.x = Math.PI / 2;
    selectionRing.visible = false;
    scene.add(selectionRing);
    selectionRingRef.current = selectionRing;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      thetaRef.current += (targetThetaRef.current - thetaRef.current) * 0.08;
      phiRef.current += (targetPhiRef.current - phiRef.current) * 0.08;

      if (autoRotateRef.current) {
        targetThetaRef.current += 0.0025;
      }

      const r = radiusRef.current;
      const x = r * Math.sin(phiRef.current) * Math.sin(thetaRef.current);
      const y = r * Math.cos(phiRef.current);
      const z = r * Math.sin(phiRef.current) * Math.cos(thetaRef.current);

      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);

      planetNodesRef.current.forEach((node) => {
        node.mesh.rotation.y += node.data.rotationSpeed;

        if (node.data.distance > 0) {
          node.currentAngle += node.data.orbitSpeed * 0.45;
          const px = Math.cos(node.currentAngle) * node.data.distance;
          const pz = Math.sin(node.currentAngle) * node.data.distance;
          node.mesh.position.set(px, 0, pz);

          if (selectedPlanetIdRef.current === node.data.id && selectionRingRef.current) {
            selectionRingRef.current.position.set(px, 0, pz);
          }
        } else if (selectedPlanetIdRef.current === node.data.id && selectionRingRef.current) {
          selectionRingRef.current.position.set(0, 0, 0);
        }
      });

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
    backgroundColor: '#020008',
  },
});
