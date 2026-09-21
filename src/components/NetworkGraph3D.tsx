import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { NetworkNode, NetworkLink } from '../types';
import { Eye, RotateCw, ZoomIn, ZoomOut, Compass, Layers, ShieldAlert, Sparkles } from 'lucide-react';

interface NetworkGraph3DProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  activeFilter?: 'ALL' | 'SUSPICIOUS_ONLY' | 'DEVICE_LINKS';
}

export const NetworkGraph3D: React.FC<NetworkGraph3DProps> = ({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  activeFilter = 'ALL',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'3D_CLUSTER' | 'FUND_FLOW' | 'DEVICE_ORBIT'>('3D_CLUSTER');

  // Internal Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const particleSystemsRef = useRef<THREE.Points[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const mouseRef = useRef(new THREE.Vector2(1000, 1000));
  const raycasterRef = useRef(new THREE.Raycaster());
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));

  // Camera spherical coordinates for native smooth orbit controls
  const sphericalRef = useRef({ radius: 420, theta: Math.PI / 4, phi: Math.PI / 3 });
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712); // slate-950
    scene.fog = new THREE.FogExp2(0x030712, 0.0018);
    sceneRef.current = scene;

    // 2. Camera setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x38bdf8, 2.5, 800); // cyan
    pointLight1.position.set(200, 250, 200);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf59e0b, 2.0, 800); // amber
    pointLight2.position.set(-200, -150, -200);
    scene.add(pointLight2);

    // 5. Grid helper (stylized cybersecurity radar floor)
    const gridHelper = new THREE.GridHelper(600, 30, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -180;
    scene.add(gridHelper);

    // 6. Build Nodes & Links
    build3DScene(layoutMode);

    // 7. Animation Loop with Travelling Particles
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Auto rotation if enabled and not user dragging
      if (isAutoRotating && !isDraggingRef.current) {
        sphericalRef.current.theta += delta * 0.18;
        updateCameraPosition();
      }

      // Rotate nodes subtly and pulsate primary subject node
      nodeMeshesRef.current.forEach((group, id) => {
        if (id === 'ACC-1042') {
          const scale = 1 + Math.sin(elapsedTime * 3) * 0.08;
          group.scale.set(scale, scale, scale);
        }
        // Gentle ambient rotation of children rings
        const ring = group.getObjectByName('haloRing');
        if (ring) {
          ring.rotation.z += delta * 0.5;
        }
      });

      // Animate flowing particle pulses along links
      particleSystemsRef.current.forEach((points) => {
        const positions = points.geometry.attributes.position.array as Float32Array;
        const speeds = points.userData.speeds as number[];
        const origins = points.userData.origins as { x: number; y: number; z: number }[];
        const targets = points.userData.targets as { x: number; y: number; z: number }[];

        for (let i = 0; i < origins.length; i++) {
          let progress = points.userData.progresses[i] + speeds[i] * delta * 0.8;
          if (progress > 1) progress = 0;
          points.userData.progresses[i] = progress;

          const ox = origins[i].x;
          const oy = origins[i].y;
          const oz = origins[i].z;
          const tx = targets[i].x;
          const ty = targets[i].y;
          const tz = targets[i].z;

          // Interpolate with slight curved arc
          const arcLift = Math.sin(progress * Math.PI) * 20;
          positions[i * 3] = ox + (tx - ox) * progress;
          positions[i * 3 + 1] = oy + (ty - oy) * progress + arcLift;
          positions[i * 3 + 2] = oz + (tz - oz) * progress;
        }
        points.geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 8. ResizeObserver for robust layout changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newWidth / newHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // Clean up
    return () => {
      resizeObserver.disconnect();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.dispose();
    };
  }, []);

  // Helper to re-position camera from spherical coordinates
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(cameraTargetRef.current);
  };

  // Build/Rebuild 3D Scene Geometry
  const build3DScene = (mode: '3D_CLUSTER' | 'FUND_FLOW' | 'DEVICE_ORBIT') => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing node groups and particles
    nodeMeshesRef.current.forEach((group) => scene.remove(group));
    nodeMeshesRef.current.clear();
    particleSystemsRef.current.forEach((p) => scene.remove(p));
    particleSystemsRef.current = [];

    // Remove existing link lines
    const linkLines = scene.children.filter((c) => c.name === 'linkLine');
    linkLines.forEach((l) => scene.remove(l));

    // Calculate node coordinates according to layout mode
    const nodeCoords = new Map<string, { x: number; y: number; z: number }>();

    nodes.forEach((node, index) => {
      let x = node.x || 0;
      let y = node.y || 0;
      let z = node.z || 0;

      if (mode === 'FUND_FLOW') {
        // Linear pipeline from Cash Inflow -> Subject -> Outflow
        if (node.type === 'SUBJECT_ACCOUNT') {
          x = 0; y = 0; z = 0;
        } else if (node.id === 'CASH-VAULT-MUM') {
          x = -240; y = 60; z = 0;
        } else if (node.type === 'BENEFICIARY') {
          x = 240; y = (index - 4) * 90; z = (index % 2 === 0 ? 50 : -50);
        } else if (node.type === 'COUNTERPARTY') {
          x = 220; y = -120; z = 30;
        } else if (node.type === 'DEVICE') {
          x = 0; y = 140; z = -80;
        } else {
          x = -120; y = -80 + index * 40; z = -60;
        }
      } else if (mode === 'DEVICE_ORBIT') {
        // Center around device DEV-MUM-8842
        if (node.id === 'DEV-MUM-8842') {
          x = 0; y = 20; z = 0;
        } else {
          const angle = (index / nodes.length) * Math.PI * 2;
          const dist = node.type === 'SUBJECT_ACCOUNT' ? 140 : 190;
          x = Math.cos(angle) * dist;
          y = Math.sin(angle * 2) * 40;
          z = Math.sin(angle) * dist;
        }
      }

      nodeCoords.set(node.id, { x, y, z });

      // Create 3D Node Mesh
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.userData = { node };

      // Node color by role / risk
      let baseColor = 0x38bdf8; // default cyan
      let emissiveColor = 0x0284c7;
      let radius = 12;

      if (node.type === 'SUBJECT_ACCOUNT') {
        baseColor = 0xf59e0b; // amber
        emissiveColor = 0xb45309;
        radius = 20;
      } else if (node.riskLevel === 'CRITICAL') {
        baseColor = 0xef4444; // red
        emissiveColor = 0xb91c1c;
        radius = 16;
      } else if (node.riskLevel === 'HIGH') {
        baseColor = 0xf97316; // orange
        emissiveColor = 0xc2410c;
        radius = 14;
      } else if (node.type === 'DEVICE') {
        baseColor = 0xa855f7; // purple
        emissiveColor = 0x7e22ce;
        radius = 13;
      } else if (node.type === 'COUNTERPARTY' && node.riskLevel === 'LOW') {
        baseColor = 0x10b981; // emerald (legitimate vendor!)
        emissiveColor = 0x047857;
        radius = 13;
      }

      // Sphere body
      const sphereGeo = new THREE.SphereGeometry(radius, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: emissiveColor,
        emissiveIntensity: 0.5,
        roughness: 0.25,
        metalness: 0.7,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(sphereMesh);

      // Outer wireframe glowing halo
      const haloGeo = new THREE.RingGeometry(radius * 1.35, radius * 1.55, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: baseColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.name = 'haloRing';
      haloMesh.rotation.x = Math.PI / 2;
      group.add(haloMesh);

      scene.add(group);
      nodeMeshesRef.current.set(node.id, group);
    });

    // Create 3D Link Beams & Energy Particles
    const linkOrigins: { x: number; y: number; z: number }[] = [];
    const linkTargets: { x: number; y: number; z: number }[] = [];
    const speeds: number[] = [];
    const progresses: number[] = [];

    links.forEach((link) => {
      const sourceCoord = nodeCoords.get(link.source);
      const targetCoord = nodeCoords.get(link.target);
      if (!sourceCoord || !targetCoord) return;

      // Filter check
      if (activeFilter === 'SUSPICIOUS_ONLY' && link.source === 'ACC-B772') return;
      if (activeFilter === 'DEVICE_LINKS' && link.type !== 'SHARED_DEVICE') return;

      const p1 = new THREE.Vector3(sourceCoord.x, sourceCoord.y, sourceCoord.z);
      const p2 = new THREE.Vector3(targetCoord.x, targetCoord.y, targetCoord.z);

      // Curved midpoint
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += 20;

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(24);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      let lineColor = 0x38bdf8;
      if (link.type === 'SHARED_DEVICE') lineColor = 0xc084fc; // purple
      else if (link.source === 'ACC-1042' && link.target !== 'ACC-B772') lineColor = 0xf87171; // red outflow
      else if (link.target === 'ACC-1042') lineColor = 0xfbbf24; // gold inflow
      else if (link.target === 'ACC-B772') lineColor = 0x34d399; // green legitimate

      const lineMat = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.45,
      });

      const line = new THREE.Line(lineGeo, lineMat);
      line.name = 'linkLine';
      scene.add(line);

      // Create flowing particles along this link
      const particleCount = link.type === 'FUNDS_FLOW' ? 4 : 2;
      for (let p = 0; p < particleCount; p++) {
        linkOrigins.push(sourceCoord);
        linkTargets.push(targetCoord);
        speeds.push(0.4 + Math.random() * 0.3);
        progresses.push(p / particleCount);
      }
    });

    // Particle Geometry
    if (linkOrigins.length > 0) {
      const particleGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(linkOrigins.length * 3);
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 5,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });

      const particleSystem = new THREE.Points(particleGeo, particleMat);
      particleSystem.userData = {
        origins: linkOrigins,
        targets: linkTargets,
        speeds,
        progresses,
      };

      scene.add(particleSystem);
      particleSystemsRef.current.push(particleSystem);
    }
  };

  // Re-run layout change when layoutMode or activeFilter changes
  useEffect(() => {
    build3DScene(layoutMode);
  }, [layoutMode, activeFilter]);

  // Handle Mouse Hover & Click Raycasting
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    mouseRef.current.set(x, y);

    // If user is dragging with mouse button down
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      sphericalRef.current.theta -= deltaX * 0.008;
      sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - deltaY * 0.008));
      updateCameraPosition();

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Raycast hover
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const meshes: THREE.Object3D[] = [];
    nodeMeshesRef.current.forEach((group) => {
      const sphere = group.children[0];
      if (sphere) meshes.push(sphere);
    });

    const intersects = raycasterRef.current.intersectObjects(meshes);
    if (intersects.length > 0) {
      const parentGroup = intersects[0].object.parent;
      if (parentGroup && parentGroup.userData.node) {
        setHoveredNode(parentGroup.userData.node);
        setHoverPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        container.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredNode(null);
    container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;

    // Check if it was a quick click to select node
    const container = mountRef.current;
    if (!container || !cameraRef.current) return;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const meshes: THREE.Object3D[] = [];
    nodeMeshesRef.current.forEach((group) => {
      const sphere = group.children[0];
      if (sphere) meshes.push(sphere);
    });

    const intersects = raycasterRef.current.intersectObjects(meshes);
    if (intersects.length > 0) {
      const parentGroup = intersects[0].object.parent;
      if (parentGroup && parentGroup.userData.node) {
        const clickedNode = parentGroup.userData.node as NetworkNode;
        onSelectNode(clickedNode.id);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(160, Math.min(900, sphericalRef.current.radius + e.deltaY * 0.4));
    updateCameraPosition();
  };

  const zoomCamera = (delta: number) => {
    sphericalRef.current.radius = Math.max(160, Math.min(900, sphericalRef.current.radius + delta));
    updateCameraPosition();
  };

  const resetCamera = () => {
    sphericalRef.current = { radius: 420, theta: Math.PI / 4, phi: Math.PI / 3 };
    cameraTargetRef.current.set(0, 0, 0);
    updateCameraPosition();
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* Floating 3D Node Telemetry Tooltip */}
      {hoveredNode && hoverPosition && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 bg-slate-900/95 border border-cyan-500/50 rounded-lg shadow-xl backdrop-blur-md text-xs min-w-[210px] animate-in fade-in zoom-in-95 duration-150"
          style={{ left: hoverPosition.x, top: hoverPosition.y }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1.5 mb-1.5">
            <span className="font-mono font-semibold text-cyan-300">{hoveredNode.id}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                hoveredNode.riskLevel === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : hoveredNode.riskLevel === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : hoveredNode.riskLevel === 'MEDIUM'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {hoveredNode.riskLevel}
            </span>
          </div>
          <div className="text-slate-200 font-medium whitespace-pre-line mb-1">
            {hoveredNode.label}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Type: {hoveredNode.type.replace('_', ' ')}</span>
          </div>
          <div className="text-[10px] text-cyan-400/80 mt-1 font-mono">
            Click to isolate & inspect telemetry
          </div>
        </div>
      )}

      {/* 3D Canvas Header Controls HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200 tracking-wide font-mono">
            3D ENTITY & MONEY FLOW TOPOLOGY
          </span>
          <span className="text-[11px] text-slate-400 border-l border-slate-700 pl-2">
            WebGL Three.js Core
          </span>
        </div>

        {/* Layout Switcher & Actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-lg">
          <button
            onClick={() => setLayoutMode('3D_CLUSTER')}
            className={`px-2 py-1 text-xs rounded font-medium transition-all ${
              layoutMode === '3D_CLUSTER'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Force Cluster View"
          >
            Cluster
          </button>
          <button
            onClick={() => setLayoutMode('FUND_FLOW')}
            className={`px-2 py-1 text-xs rounded font-medium transition-all ${
              layoutMode === 'FUND_FLOW'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Linear Flow from Vault to Beneficiaries"
          >
            Flow Axis
          </button>
          <button
            onClick={() => setLayoutMode('DEVICE_ORBIT')}
            className={`px-2 py-1 text-xs rounded font-medium transition-all ${
              layoutMode === 'DEVICE_ORBIT'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Shared Device Orbit View"
          >
            Device Orbit
          </button>

          <div className="w-px h-4 bg-slate-700 mx-1" />

          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded transition-all ${
              isAutoRotating ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={isAutoRotating ? 'Pause Orbit Rotation' : 'Resume Orbit Rotation'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => zoomCamera(-50)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => zoomCamera(50)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetCamera}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Reset Perspective"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="absolute bottom-3 left-3 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-lg text-[11px] flex items-center gap-4 text-slate-300 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <span>Subject (ACC-1042)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          <span>Branch Device (DEV-MUM-8842)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span>Unverified Beneficiary</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span>Verified GST Counterparty</span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Sparkles className="w-3 h-3" />
          <span>Particles = Active Fund Flow Velocity</span>
        </div>
      </div>
    </div>
  );
};
