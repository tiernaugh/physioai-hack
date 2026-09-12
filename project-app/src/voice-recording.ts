export const maxAudioBytes = 8 * 1024 * 1024;
// Leave one second for the final encoder chunk within the service's ten-minute limit.
const maxRecordingMs = 599_000;
const recordingTypes = [
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/webm",
];

export type RecordingState = "idle" | "requesting" | "recording" | "stopping";
type Callbacks = {
  onState: (state: RecordingState) => void;
  onTime: (seconds: number) => void;
  onComplete: (file: File, notice: string) => void;
  onError: (message: string) => void;
};

function microphoneError(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  if (["NotAllowedError", "PermissionDeniedError", "SecurityError"].includes(name))
    return "Microphone access was blocked. Allow microphone access in your browser and system settings, then try again. You can also upload an audio file.";
  if (["NotFoundError", "DevicesNotFoundError"].includes(name))
    return "No microphone was found. Connect a microphone and try again, or upload an audio file.";
  if (["NotReadableError", "TrackStartError", "AbortError"].includes(name))
    return "Your microphone could not be opened. Check that it is connected and available, then try again.";
  if (name === "NotSupportedError")
    return "This browser cannot record a supported audio format. Try another browser or upload an audio file.";
  return "Recording could not start. Check your microphone and try again, or upload an audio file.";
}

/** One recording attempt, including permission requests that outlive the page. */
export function createVoiceRecording(callbacks: Callbacks) {
  let stream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let chunks: Blob[] = [];
  let bytes = 0;
  let started = false;
  let finished = false;
  let stopping = false;
  let startedAt = 0;
  let notice = "Recording ready. Listen back, then transcribe when you’re ready.";

  function releaseMicrophone() {
    clearInterval(timer);
    clearTimeout(deadline);
    stream?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    stream = null;
  }

  function discard() {
    finished = true;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      if (recorder.state !== "inactive") {
        try { recorder.stop(); } catch { /* Tracks are still released below. */ }
      }
    }
    releaseMicrophone();
    chunks = [];
  }

  function fail(message: string) {
    if (finished) return;
    discard();
    callbacks.onState("idle");
    callbacks.onError(message);
  }

  function stop(message?: string) {
    if (finished || stopping || !recorder) return;
    stopping = true;
    if (message) notice = message;
    callbacks.onTime(Math.floor((performance.now() - startedAt) / 1000));
    callbacks.onState("stopping");
    clearInterval(timer);
    clearTimeout(deadline);
    try {
      if (recorder.state !== "inactive") recorder.stop();
      releaseMicrophone();
    } catch {
      fail("The recording could not be finished. Please try recording again.");
    }
  }

  return {
    async start() {
      if (started || finished) return;
      started = true;
      callbacks.onState("requesting");
      callbacks.onTime(0);
      if (!globalThis.isSecureContext) {
        fail("Microphone recording needs HTTPS or localhost. Open the app securely, or upload an audio file.");
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        fail("This browser does not support microphone recording. Try another browser or upload an audio file.");
        return;
      }
      try {
        const acquired = await navigator.mediaDevices.getUserMedia({ audio: true });
        // A cancelled permission prompt can still resolve later. Never keep its microphone.
        if (finished) {
          acquired.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = acquired;
        const mimeType = recordingTypes.find((type) => MediaRecorder.isTypeSupported(type));
        if (!mimeType) {
          fail("This browser cannot record a supported audio format. Try another browser or upload an audio file.");
          return;
        }
        recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 64_000 });
        recorder.ondataavailable = (event) => {
          if (finished || !event.data.size) return;
          chunks.push(event.data);
          bytes += event.data.size;
          if (bytes > maxAudioBytes) {
            fail("The recording exceeded 8 MiB. Please record a shorter note.");
          } else if (bytes >= maxAudioBytes - 128 * 1024) {
            stop("Recording stopped near the size limit. Listen back before transcribing.");
          }
        };
        recorder.onerror = () => fail("Recording was interrupted. Check your microphone and record the note again.");
        recorder.onstop = () => {
          if (finished) return;
          const type = recorder?.mimeType || chunks[0]?.type || mimeType;
          const audio = new Blob(chunks, { type });
          if (!audio.size) {
            fail("No audio was captured. Try again and speak before stopping.");
            return;
          }
          const extension = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
          const name = `voice-note-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`;
          const file = new File([audio], name, { type });
          discard();
          callbacks.onState("idle");
          callbacks.onComplete(file, notice);
        };
        stream.getAudioTracks().forEach((track) => {
          track.onended = () => stop("Microphone disconnected. Review the audio captured before it stopped.");
        });
        recorder.start(250);
        startedAt = performance.now();
        callbacks.onState("recording");
        timer = setInterval(() => {
          callbacks.onTime(Math.floor((performance.now() - startedAt) / 1000));
        }, 250);
        deadline = setTimeout(() => stop("Recording stopped at the ten-minute limit. Listen back before transcribing."), maxRecordingMs);
      } catch (error) {
        fail(microphoneError(error));
      }
    },
    stop: () => stop(),
    // Cancellation and unmount deliberately produce no completed file or callback.
    cancel: discard,
  };
}
