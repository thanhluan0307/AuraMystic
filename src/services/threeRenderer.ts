import * as THREE from 'three';
import { PixelRatio, Platform } from 'react-native';

export interface ExpoGLContext {
  drawingBufferWidth: number;
  drawingBufferHeight: number;
  canvas?: any;
  endFrameEXP?: () => void;
  viewport?: (x: number, y: number, width: number, height: number) => void;
  clearColor?: (r: number, g: number, b: number, a: number) => void;
  clear?: (mask: number) => void;
  COLOR_BUFFER_BIT?: number;
  DEPTH_BUFFER_BIT?: number;
}

/**
 * Polyfill WebGL2 environment for React Native / Expo GL if needed
 */
if (typeof global !== 'undefined') {
  const g = global as any;
  if (!g.WebGL2RenderingContext) {
    g.WebGL2RenderingContext = class WebGL2RenderingContext {};
  }
}

/**
 * Creates a robust THREE.WebGLRenderer bound to an expo-gl WebGL context.
 * Works seamlessly across iOS, Android, and Web.
 */
export function createThreeRenderer(gl: ExpoGLContext, width: number, height: number): THREE.WebGLRenderer {
  const actualWidth = gl.drawingBufferWidth || width;
  const actualHeight = gl.drawingBufferHeight || height;

  // Ensure gl satisfies WebGL2 instanceof check in React Native runtime
  if (typeof global !== 'undefined' && (global as any).WebGL2RenderingContext) {
    try {
      if (!(gl instanceof (global as any).WebGL2RenderingContext)) {
        Object.setPrototypeOf(gl, (global as any).WebGL2RenderingContext.prototype);
      }
    } catch {
      // Ignore if prototype is frozen
    }
  }

  // Patch getParameter to return WebGL 2.0 string if Three.js inspects VERSION
  const anyGl = gl as any;
  if (typeof anyGl.getParameter === 'function') {
    const origGetParam = anyGl.getParameter.bind(anyGl);
    anyGl.getParameter = (param: number) => {
      const result = origGetParam(param);
      if (param === anyGl.VERSION && typeof result === 'string') {
        if (!result.includes('WebGL 2.0')) {
          return `WebGL 2.0 (${result})`;
        }
      }
      return result;
    };
  }

  const mockCanvas = gl.canvas || {
    width: actualWidth,
    height: actualHeight,
    style: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    clientHeight: actualHeight,
    clientWidth: actualWidth,
  };

  const renderer = new THREE.WebGLRenderer({
    context: gl as any,
    canvas: mockCanvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });

  const pixelRatio = Platform.OS === 'web' ? 1 : Math.min(PixelRatio.get(), 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(actualWidth, actualHeight, false);

  return renderer;
}

/**
 * Safe render frame helper that also triggers expo-gl endFrameEXP on native.
 */
export function renderFrame(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  gl: ExpoGLContext
) {
  renderer.render(scene, camera);
  if (typeof gl.endFrameEXP === 'function') {
    gl.endFrameEXP();
  }
}

/**
 * Deep dispose utility to prevent WebGL GPU memory leaks.
 */
export function disposeThreeScene(scene: THREE.Scene, renderer?: THREE.WebGLRenderer) {
  scene.traverse((obj) => {
    if ((obj as any).isMesh || (obj as any).isPoints || (obj as any).isLine) {
      const renderable = obj as THREE.Mesh | THREE.Points | THREE.Line;
      if (renderable.geometry) {
        renderable.geometry.dispose();
      }
      if (renderable.material) {
        if (Array.isArray(renderable.material)) {
          renderable.material.forEach((mat) => mat.dispose());
        } else {
          renderable.material.dispose();
        }
      }
    }
  });

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }
}
