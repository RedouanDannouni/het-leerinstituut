"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform vec3 u_flash0;
  uniform vec3 u_flash1;

  float clickFlash(vec2 uv, vec3 flash) {
    if (flash.z < 0.0) return 0.0;
    float age = flash.z;
    float dist = length(uv - flash.xy);
    return exp(-dist * 4.5) * exp(-age * 5.0);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect;

    vec3 mintSoft = vec3(0.561, 0.878, 0.8);

    vec3 col = vec3(0.082, 0.38, 0.533);

    vec2 mouseP = (u_mouse - 0.5) * aspect;
    float mouseDist = length(p - mouseP);
    float highlight = exp(-mouseDist * 5.5) * 0.2;
    col += mintSoft * highlight;

    float flash = clickFlash(uv, u_flash0) + clickFlash(uv, u_flash1);
    col += mintSoft * flash * 0.16;

    gl_FragColor = vec4(col, 1.0);
  }
`;

type Flash = { x: number; y: number; startedAt: number };

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("AuthAsideShader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("AuthAsideShader:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  return program;
}

type AuthAsideShaderProps = {
  containerRef: React.RefObject<HTMLElement | null>;
};

export function AuthAsideShader({ containerRef }: AuthAsideShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });
  const flashesRef = useRef<Flash[]>([]);
  const rafRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;

    const positionLoc = gl.getAttribLocation(program, "a_position");
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const flashLocs = [0, 1].map((index) => gl.getUniformLocation(program, `u_flash${index}`));

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      gl.viewport(0, 0, width, height);
    };

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      mouseRef.current.tx = (clientX - rect.left) / rect.width;
      mouseRef.current.ty = 1 - (clientY - rect.top) / rect.height;
    };

    const addFlash = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      flashesRef.current.unshift({
        x: (clientX - rect.left) / rect.width,
        y: 1 - (clientY - rect.top) / rect.height,
        startedAt: performance.now(),
      });
      flashesRef.current = flashesRef.current.slice(0, 2);
    };

    const onPointerMove = (event: PointerEvent) => updatePointer(event.clientX, event.clientY);
    const onPointerDown = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY);
      addFlash(event.clientX, event.clientY);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerdown", onPointerDown);
    resize();

    const start = performance.now();

    const render = (now: number) => {
      const mouse = mouseRef.current;
      const lerp = reducedMotionRef.current ? 1 : 0.1;
      mouse.x += (mouse.tx - mouse.x) * lerp;
      mouse.y += (mouse.ty - mouse.y) * lerp;

      const elapsed = (now - start) / 1000;
      const time = reducedMotionRef.current ? 0 : elapsed;

      gl.useProgram(program);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, mouse.x, mouse.y);
      gl.uniform1f(timeLoc, time);

      const activeFlashes = flashesRef.current.filter(
        (flash) => (now - flash.startedAt) / 1000 < 0.7,
      );
      flashesRef.current = activeFlashes;

      for (let index = 0; index < 2; index += 1) {
        const loc = flashLocs[index];
        const flash = activeFlashes[index];
        if (!loc) continue;
        if (!flash) {
          gl.uniform3f(loc, 0, 0, -1);
          continue;
        }
        const age = (now - flash.startedAt) / 1000;
        gl.uniform3f(loc, flash.x, flash.y, age);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerdown", onPointerDown);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [containerRef]);

  return (
    <div className="auth-aside-shader" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
