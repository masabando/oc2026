import { init } from "@masabando/easy-three";
import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export default function Canvas() {
  const [detectFlag, setDetectFlag] = useState(false);
  const ref = useRef();
  const camRef = useRef();
  const handLandmarkerRef = useRef();
  const [ok, setOk] = useState(false);
  const canvasRef = useRef();
  const ctxRef = useRef();
  const drawingUtilsRef = useRef();
  const msgRef = useRef();
  const [msg, setMsg] = useState("test");
  const [camReady, setCamReady] = useState(false);
  const mode = useRef("front");

  useEffect(() => {
    if (!camReady) return;
    const createHandLandmarker = async () => {
      setMsg("Loading hand landmarker model...");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
      );
      setMsg("Creating hand landmarker...");
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "./model/hand_landmarker.task",
          // delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      setMsg("Hand landmarker created.");
      handLandmarkerRef.current = handLandmarker;
      setOk(true);
    };
    createHandLandmarker();

    const {
      // helper,
      load,
      create,
      camera,
      animate,
      controls,
      destroy,
      THREE,
    } = init(ref.current);
    controls.connect();
    controls.enablePan = false;
    camera.position.set(0, 0, 4);
    create.ambientLight({ intensity: 0.5 });
    const dlight = create.directionalLight({
      intensity: 1.2,
      position: [10, 10, -10],
    });
    dlight.shadow.bias = -0.001;
    // const dlight2 = create.directionalLight({
    //   intensity: 0.5,
    //   position: [10, 10, -10],
    // });
    // dlight2.shadow.bias = -0.001;

    // helper.axes()

    // sky
    const sky = create.sky();
    sky.visible = false;

    // ocean
    const ocean = create.ocean("./texture/NormalMap-1.jpg", {
      position: [0, -1, 0],
    });
    ocean.mesh.visible = false;

    // human
    let girl;
    load
      .vrm("./model/ktc-uniform_female_v5.vrm", {
        bvh: "./motion/motion_mm04.bvh",
      })
      .then((vrm) => {
        girl = vrm;
        girl.scene.visible = false;
        girl.scene.position.set(0, -1.5, -1);
      });

    // text
    const text = create.text("Welcome to 近大高専！", {
      fontSize: 27,
      position: [0, 1.5, -0.5],
      size: [3, 0.5],
      rotation: [0, Math.PI, 0],
      color: "blue",
    });
    text.visible = false;

    // flakes
    const range = 5;
    const groupPos = [0, 1, 0];
    const flakes = [
      create.group({
        position: groupPos,
      }),
      create.group({
        position: groupPos,
      }),
      create.group({
        position: groupPos,
      }),
    ];
    const cube = create.cube({
      size: 0.2,
      radius: 0.05,
      segments: 16,
      rounded: true,
      autoAdd: false,
      option: {
        color: "hotpink",
      },
    });
    const cone = create.cone({
      size: [0.1, 0.2],
      option: {
        color: "springgreen",
      },
      autoAdd: false,
    });
    const torus = create.torus({
      size: 0.1,
      tube: 0.03,
      option: {
        color: "cyan",
      },
      autoAdd: false,
    });

    function randomPositions() {
      const r = Math.random() * (range - 1) + 1;
      const theta = Math.random() * Math.PI;
      const phi = Math.random() * Math.PI * 2;
      return [
        r * Math.sin(theta) * Math.cos(phi),
        r * Math.cos(theta),
        r * Math.sin(theta) * Math.sin(phi),
      ];
    }
    function randomRotations() {
      return {
        x: (Math.random() * 0.04 - 0.02) * (Math.random() < 0.5 ? -1 : 1),
        y: (Math.random() * 0.04 - 0.02) * (Math.random() < 0.5 ? -1 : 1),
      };
    }
    for (let i = 0; i < flakes.length; i++) {
      for (let n = 0; n < 3; n++) {
        const c = cube.clone();
        c.scale.setScalar(Math.random() * 0.8 + 0.4);
        c.position.set(...randomPositions());
        c.userData = { rotation: randomRotations() };
        const cn = cone.clone();
        cn.scale.setScalar(Math.random() * 0.8 + 0.4);
        cn.position.set(...randomPositions());
        cn.userData = { rotation: randomRotations() };
        const t = torus.clone();
        t.scale.setScalar(Math.random() * 0.8 + 0.4);
        t.position.set(...randomPositions());
        t.userData = { rotation: randomRotations() };
        flakes[i].add(c, cn, t);
      }
      flakes[i].visible = false;
    }

    // const video = camRef.current?.video;
    // const videoTexture = new THREE.VideoTexture(video);
    // videoTexture.colorSpace = THREE.SRGBColorSpace;
    // videoTexture.repeat.x = -1;
    // videoTexture.wrapS = THREE.RepeatWrapping;
    const tex = new THREE.CanvasTexture(canvasRef.current);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.repeat.x = -1;
    tex.wrapS = THREE.RepeatWrapping;

    const plane = create.plane({
      size: 3,
      material: "Basic",
      option: {
        // map: videoTexture,
        map: tex,
        side: THREE.DoubleSide,
      },
    });

    plane.material.needsUpdate = true;

    // octahedron group
    const ktc = create.plane({
      position: [-1.3, 0, -1],
      option: {
        map: load.texture("./kindai-logo.png"),
        side: THREE.DoubleSide,
        transparent: true,
      },
    });
    ktc.visible = false;

    animate(({ delta, time }) => {
      tex.needsUpdate = true;
      // console.log(camera.rotation.y);
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      if (dir.z < 0) {
        // front
        if (mode.current !== "front") {
          mode.current = "front";
          // hidden sky
          sky.visible = false;
          // hidden ocean
          ocean.mesh.visible = false;
          // hidden girl
          if (girl) {
            girl.scene.visible = false;
          }
          // hidden text
          text.visible = false;
          // hidden flakes
          flakes.forEach((group) => {
            group.visible = false;
          });
          // hidden ktc logo
          ktc.visible = false;
        }
      } else {
        // back
        if (mode.current !== "back") {
          mode.current = "back";
          // show sky
          sky.visible = true;
          // show ocean
          ocean.mesh.visible = true;
          // show girl
          if (girl) {
            girl.scene.visible = true;
          }
          // show text
          text.visible = true;
          // show flakes
          flakes.forEach((group) => {
            group.visible = true;
          });
          // show ktc logo
          ktc.visible = true;
        }
        ocean.update(delta);
        text.position.y = Math.sin(time) * 0.5 + 1.5;
        flakes.forEach((group) => {
          group.children.forEach((c) => {
            c.rotation.x += c.userData.rotation.x;
            c.rotation.y += c.userData.rotation.y;
          });
        });
        flakes[0].rotation.y += delta * 0.2;
        flakes[1].rotation.x += delta * 0.3;
        flakes[2].rotation.z += delta * 0.4;
        if (girl) {
          girl.updateWithAnimation(delta);
        }
        ktc.rotation.y += delta * 0.8;
      }
    });
    return () => {
      // videoTexture.dispose();
      handLandmarkerRef.current?.close();
      tex.dispose();
      destroy();
    };
  }, [camReady]);

  function loop() {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
    // draw camera image to canvas for debug
    ctxRef.current.drawImage(
      camRef.current.video,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
    const timestamp = performance.now();
    const detections = handLandmarkerRef.current.detectForVideo(
      camRef.current.video,
      timestamp,
    );
    for (const land of detections.landmarks) {
      drawingUtilsRef.current.drawConnectors(
        land,
        HandLandmarker.HAND_CONNECTIONS,
        {
          color: "white",
          lineWidth: 5,
        },
      );
      drawingUtilsRef.current.drawLandmarks(land, {
        color: "hotpink",
        radius: 4,
      });
    }
    requestAnimationFrame(loop);
  }

  useEffect(() => {
    if (detectFlag) {
      // canvasRef.current.width = camRef.current.video.videoWidth;
      // canvasRef.current.height = camRef.current.video.videoHeight;
      ctxRef.current = canvasRef.current.getContext("2d");
      drawingUtilsRef.current = new DrawingUtils(ctxRef.current);
      loop();
    }
  }, [detectFlag]);

  return (
    <>
      <div className="w-full h-[calc(100dvh-65px)]" ref={ref}></div>
      <button
        className="btn btn-primary absolute bottom-4 right-4 z-10"
        onClick={() => setDetectFlag((prev) => !prev)}
        disabled={!ok || detectFlag}
      >
        {detectFlag ? "Detecting..." : ok ? "Start Detection" : "Loading..."}
      </button>
      <div ref={msgRef} className="fixed top-20 left-3 text-base-content">
        {msg}
      </div>
      <Webcam
        className="fixed w-5 h-5 top-0 left-0"
        ref={camRef}
        mirrored={false}
        videoConstraints={{
          facingMode: "user",
          width: 320,
          height: 320,
        }}
        onUserMedia={() => setCamReady(true)}
      />
      <canvas
        width="320"
        height="320"
        className="fixed w-[320px] h-[320px] bottom-0 left-[-9999px] z-9999 pointer-events-none"
        ref={canvasRef}
      />
    </>
  );
}
