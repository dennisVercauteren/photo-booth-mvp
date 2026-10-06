import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { fetchBoothMeta, fetchStyleIds, friendlyGenerateMessage, GenerateClientError, requestPortraits, upscalePortrait } from "./api/client";
import { CameraScreen } from "./components/CameraScreen";
import { DeveloperPanel } from "./components/DeveloperPanel";
import { GeneratingScreen } from "./components/GeneratingScreen";
import { ResultScreen } from "./components/ResultScreen";
import { ReviewScreen } from "./components/ReviewScreen";
import { StartScreen } from "./components/StartScreen";
import { StyleScreen } from "./components/StyleScreen";
import { CAMERA_STORAGE_KEY, CLIENT_GENERATE_TIMEOUT_MS, DEVELOPER_MODE } from "./config/developer";
import { getStyleById, PHOTO_STYLES } from "./config/styles";
import type { LiveCamera } from "./camera/useCamera";
import { createSessionState, sessionReducer } from "./session/reducer";
import type { BoothMeta } from "./types";

export function App() {
  const [state, dispatch] = useReducer(sessionReducer, undefined, createSessionState);
  const [deviceId, setDeviceId] = useState(() => window.localStorage.getItem(CAMERA_STORAGE_KEY) ?? "");
  const [cameraRetry, setCameraRetry] = useState(0);
  const [cameraLive, setCameraLive] = useState<LiveCamera | null>(null);
  const [meta, setMeta] = useState<BoothMeta | null>(null);

  const onLiveChange = useCallback((live: LiveCamera | null) => {
    setCameraLive(live);
  }, []);
  const photoRef = useRef(state.photo);
  const styleIdRef = useRef(state.styleId);
  const sessionIdRef = useRef(state.sessionId);
  photoRef.current = state.photo;
  styleIdRef.current = state.styleId;
  sessionIdRef.current = state.sessionId;

  useEffect(() => {
    const controller = new AbortController();
    void fetchBoothMeta(controller.signal)
      .then((next) => {
        setMeta(next);
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }
        console.error("[meta]", error instanceof Error ? error.message : error);
      });
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!DEVELOPER_MODE) {
      return;
    }
    const controller = new AbortController();
    void fetchStyleIds(controller.signal)
      .then((ids) => {
        const serverIds = [...ids].sort().join(",");
        const clientIds = PHOTO_STYLES.map((style) => style.id).sort().join(",");
        if (serverIds !== clientIds) {
          console.warn("[styles] Client and server style ids differ.", { serverIds, clientIds });
        }
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }
        console.warn("[styles] Could not compare style ids.");
      });
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const photo = photoRef.current;
    const styleId = styleIdRef.current;
    const sessionId = sessionIdRef.current;
    if (state.screen !== "generating" || state.errorMessage || !photo || !styleId) {
      return;
    }

    const controller = new AbortController();
    let timedOut = false;
    let active = true;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, CLIENT_GENERATE_TIMEOUT_MS);

    void requestPortraits({
      image: photo.blob,
      styleId,
      sessionId,
      signal: controller.signal,
    })
      .then((options) => {
        if (!active) {
          return;
        }
        dispatch({ type: "generation-succeeded", options });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        const code = isAbortError(error)
          ? timedOut ? "timeout" : "provider_unavailable"
          : error instanceof GenerateClientError
            ? error.code
            : "provider_unavailable";
        console.error("[generate]", error instanceof Error ? error.message : code);
        dispatch({ type: "generation-failed", message: friendlyGenerateMessage(code) });
      });

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [state.errorMessage, state.generationAttempt, state.screen]);

  useEffect(() => {
    const photo = state.options[state.selectedOption];
    if (state.screen !== "result" || !photo || state.upscales[photo.metadata.variant]) {
      return;
    }

    const variant = photo.metadata.variant;
    const controller = new AbortController();
    let active = true;
    void upscalePortrait(photo, controller.signal)
      .then((enlarged) => {
        if (!active) {
          return;
        }
        dispatch({ type: "upscale-ready", variant, photo: enlarged });
      })
      .catch((error: unknown) => {
        if (!active || isAbortError(error)) {
          return;
        }
        console.error("[upscale]", error instanceof Error ? error.message : error);
        dispatch({ type: "upscale-ready", variant, photo });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [state.options, state.screen, state.selectedOption, state.upscales]);

  const selectedStyle = state.styleId ? getStyleById(state.styleId) : undefined;
  const selectedPortrait = state.options[state.selectedOption];
  const displayPortrait = selectedPortrait
    ? (state.upscales[selectedPortrait.metadata.variant] ?? selectedPortrait)
    : undefined;

  function selectCamera(nextDeviceId: string): void {
    window.localStorage.setItem(CAMERA_STORAGE_KEY, nextDeviceId);
    setDeviceId(nextDeviceId);
  }

  let screen;
  switch (state.screen) {
    case "start":
      screen = <StartScreen onStart={() => dispatch({ type: "begin" })} />;
      break;
    case "style":
      screen = (
        <StyleScreen
          restyle={state.restyle}
          onBack={() => dispatch({ type: "back" })}
          onChoose={(style) => dispatch({ type: "choose-style", styleId: style.id })}
        />
      );
      break;
    case "camera":
      screen = (
        <CameraScreen
          style={selectedStyle}
          deviceId={deviceId}
          retryToken={cameraRetry}
          onLiveChange={onLiveChange}
          onBack={() => dispatch({ type: "back" })}
          onCaptured={(photo) => dispatch({ type: "photo-ready", photo })}
          onRetryCamera={() => setCameraRetry((value) => value + 1)}
        />
      );
      break;
    case "review":
      screen = state.photo ? (
        <ReviewScreen
          photo={state.photo}
          style={selectedStyle}
          onUse={() => dispatch({ type: "confirm-photo" })}
          onRetake={() => dispatch({ type: "retake" })}
        />
      ) : (
        <StartScreen onStart={() => dispatch({ type: "begin" })} />
      );
      break;
    case "generating":
      screen = state.photo ? (
        <GeneratingScreen
          photo={state.photo}
          errorMessage={state.errorMessage}
          onRetry={() => dispatch({ type: "retry-generation" })}
          onRetake={() => dispatch({ type: "retake" })}
          onNewSession={() => dispatch({ type: "new-session" })}
        />
      ) : (
        <StartScreen onStart={() => dispatch({ type: "begin" })} />
      );
      break;
    case "result":
      screen = selectedPortrait ? (
        <ResultScreen
          options={state.options}
          selected={displayPortrait ?? selectedPortrait}
          selectedIndex={state.selectedOption}
          onSelect={(index) => dispatch({ type: "select-option", index })}
          onRestyle={() => dispatch({ type: "open-styles", restyle: true })}
          onRetake={() => dispatch({ type: "retake" })}
          onNewSession={() => dispatch({ type: "new-session" })}
        />
      ) : (
        <StartScreen onStart={() => dispatch({ type: "begin" })} />
      );
      break;
    default: {
      const _never: never = state.screen;
      screen = _never;
    }
  }

  return (
    <div className="booth">
      {screen}
      {DEVELOPER_MODE ? (
        <DeveloperPanel
          sessionId={state.sessionId}
          cameraLabel={cameraLive?.label ?? "—"}
          resolution={cameraLive ? `${cameraLive.width}×${cameraLive.height}` : "—"}
          model={meta?.model ?? "—"}
          styleName={selectedStyle?.displayName ?? "—"}
          durationMs={selectedPortrait?.metadata.durationMs ?? null}
          devices={cameraLive?.devices ?? []}
          selectedDeviceId={deviceId || cameraLive?.deviceId || ""}
          onSelectCamera={selectCamera}
        />
      ) : null}
    </div>
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
