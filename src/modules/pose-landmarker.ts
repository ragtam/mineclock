import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils
} from "@mediapipe/tasks-vision";

const demosSection = document.getElementById("demos");

let runningMode = "IMAGE";
let enableWebcamButton: HTMLButtonElement;
let webcamRunning: Boolean = false;
const videoHeight = "360px";
const videoWidth = "480px";

// NEW: Variable to store the previous frame's data
let lastLandmarks: any[] = []; 

export async function landmarkPose(callback: ({ anyPoseVisible }: { anyPoseVisible: boolean }) => void) {
  const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
        delegate: "GPU"
      },
      runningMode: 'VIDEO',
      numPoses: 2
    });

    const video = document.getElementById("webcam") as HTMLVideoElement;
    const canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
    const canvasCtx = canvasElement.getContext("2d");

    const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

    if (hasGetUserMedia()) {
      enableWebcamButton = document.getElementById("webcamButton");
      enableWebcamButton.addEventListener("click", enableCam);
    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }

    function enableCam(event) {
      if (!poseLandmarker) {
        console.log("Wait! poseLandmaker not loaded yet.");
        return;
      }

      if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
      } else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
      }

      const constraints = {
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
      });
    }

    let lastVideoTime = -1;

    // --- NEW HELPER: Linear Interpolation ---
    // slightly moves 'start' towards 'end' by 'amount' (0.0 to 1.0)
    function lerp(start, end, amount) {
        return start + (end - start) * amount;
    }

    async function predictWebcam() {
      canvasElement.style.height = videoHeight;
      video.style.height = videoHeight;
      canvasElement.style.width = videoWidth;
      video.style.width = videoWidth;

      if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await poseLandmarker.setOptions({ runningMode: "VIDEO" });
      }

      let startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          
          callback({ anyPoseVisible: result.landmarks.length > 0 });

          if (result.landmarks.length > 0) {
            
            // --- SMOOTHING LOGIC START ---
            let currentLandmarks = result.landmarks[0]; // Assuming 1 person for simplicity

            if (lastLandmarks.length > 0) {
                // If we have history, blend the new data with the old data
                const smoothingFactor = 0.5; // ADJUST THIS: 0.1 (very smooth/slow) to 0.9 (jittery/fast)
                
                for (let i = 0; i < currentLandmarks.length; i++) {
                    currentLandmarks[i].x = lerp(lastLandmarks[i].x, currentLandmarks[i].x, smoothingFactor);
                    currentLandmarks[i].y = lerp(lastLandmarks[i].y, currentLandmarks[i].y, smoothingFactor);
                    currentLandmarks[i].z = lerp(lastLandmarks[i].z, currentLandmarks[i].z, smoothingFactor);
                }
            }
            // Save current frame as history for the next frame
            // We use JSON parse/stringify to deep copy the array values, not just the reference
            lastLandmarks = JSON.parse(JSON.stringify(currentLandmarks));
            // --- SMOOTHING LOGIC END ---


            // DRAWING (Using the smoothed 'currentLandmarks')
            canvasCtx.lineJoin = "round";
            canvasCtx.lineCap = "round";
            const bodyColor = "#FFD700"; 
            const clothingColor = "#00B3E6"; 

            // Helper for accessing smoothed points
            const p = (i) => ({ 
                x: currentLandmarks[i].x * canvasElement.width, 
                y: currentLandmarks[i].y * canvasElement.height 
            });

            // 1. Draw Legs
            canvasCtx.lineWidth = 40;
            canvasCtx.strokeStyle = clothingColor;
            
            // Left Leg
            canvasCtx.beginPath();
            canvasCtx.moveTo(p(23).x, p(23).y);
            canvasCtx.lineTo(p(25).x, p(25).y);
            canvasCtx.lineTo(p(27).x, p(27).y);
            canvasCtx.stroke();

            // Right Leg
            canvasCtx.beginPath();
            canvasCtx.moveTo(p(24).x, p(24).y);
            canvasCtx.lineTo(p(26).x, p(26).y);
            canvasCtx.lineTo(p(28).x, p(28).y);
            canvasCtx.stroke();

            // 2. Draw Torso
            canvasCtx.fillStyle = clothingColor;
            canvasCtx.beginPath();
            canvasCtx.moveTo(p(11).x, p(11).y);
            canvasCtx.lineTo(p(12).x, p(12).y);
            canvasCtx.lineTo(p(24).x, p(24).y);
            canvasCtx.lineTo(p(23).x, p(23).y);
            canvasCtx.closePath();
            canvasCtx.fill();

            // 3. Draw Arms
            canvasCtx.lineWidth = 30;
            canvasCtx.strokeStyle = bodyColor;

            // Left Arm
            canvasCtx.beginPath();
            canvasCtx.moveTo(p(11).x, p(11).y);
            canvasCtx.lineTo(p(13).x, p(13).y);
            canvasCtx.lineTo(p(15).x, p(15).y);
            canvasCtx.stroke();

            // Right Arm
            canvasCtx.beginPath();
            canvasCtx.moveTo(p(12).x, p(12).y);
            canvasCtx.lineTo(p(14).x, p(14).y);
            canvasCtx.lineTo(p(16).x, p(16).y);
            canvasCtx.stroke();

            // 4. Draw Head
            const nose = p(0);
            const leftEar = p(7);
            const rightEar = p(8);
            const earDist = Math.hypot(leftEar.x - rightEar.x, leftEar.y - rightEar.y);
            const radius = earDist * 1.5 || 30; 

            canvasCtx.fillStyle = bodyColor;
            canvasCtx.beginPath();
            canvasCtx.arc(nose.x, nose.y, radius, 0, 2 * Math.PI);
            canvasCtx.fill();

          } else {
              // If no person is seen, clear history so it doesn't "snap" when they return
              lastLandmarks = [];
          }

          canvasCtx.restore();
        });
      }

      if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
      }
    }
  };

  createPoseLandmarker();
}