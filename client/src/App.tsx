import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { fetchBoothMeta, fetchSettings, fetchStyleIds, friendlyGenerateMessage, GenerateClientError, requestPortraits, upscalePortrait } from "./api/client";
import { playError, playSelect, playTada, playTap, playWhoosh, setSoundTheme, startMusic, stopMusic } from "./audio/sound";
import { CameraScreen } from "./components/CameraScreen";
import { DeveloperPanel } from "./components/DeveloperPanel";
import { GeneratingScreen } from "./components/GeneratingScreen";
import { ResultScreen } from "./components/ResultScreen";
import { ReviewScreen } from "./components/ReviewScreen";
import { SettingsMenu } from "./components/SettingsMenu";
import { StartScreen } from "./components/StartScreen";
import { StyleScreen } from "./components/StyleScreen";
import { CAMERA_STORAGE_KEY, CLIENT_GENERATE_TIMEOUT_MS, DEFAULT_IMAGE_COUNT, DEVELOPER_MODE } from "./config/developer";
import { getStyleById, PHOTO_STYLES } from "./config/styles";
import type { LiveCamera } from "./camera/useCamera";
import { createSessionState, sessionReducer } from "./session/reducer";
import type { BoothMeta, BoothSettingsResponse } from "./types";

const MUSIC_IDLE_MS = 120_000;

export function App() {
  const [state, dispatch] = useReducer(sessionReducer, undefined, createSessionState);
  const [deviceId, setDeviceId] = useState(() => window.localStorage.getItem(CAMERA_STORAGE_KEY) ?? "");
  const [cameraRetry, setCameraRetry] = useState(0);
  const [cameraLive, setCameraLive] = useState<LiveCamera | null>(null);
  const [meta, setMeta] = useState<BoothMeta | null>(null);
  const [settings, setSettings] = useState<BoothSettingsResponse | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  // Reload on every return to the start screen so the count shown matches what the server will make.
  useEffect(() => {
    if (state.screen !== "start") {
      return;
    }
    const controller = new AbortController();
    void fetchSettings(controller.signal)
      .then(setSettings)
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }
        console.error("[settings]", error instanceof Error ? error.message : error);
      });
    return () => {
      controller.abort();
    };
  }, [state.screen]);

  // Visual and sound theme from the staff settings. The settings menu previews themes the same way.
  const visualTheme = settings?.settings.visualTheme ?? "carnival";
  const soundTheme = settings?.settings.soundTheme ?? "carnival";
  useEffect(() => {
    document.documentElement.dataset.theme = visualTheme;
  }, [visualTheme]);
  useEffect(() => {
    setSoundTheme(soundTheme);
  }, [soundTheme]);
  const hiddenStyles = settings?.settings.hiddenStyles ?? [];

  // Music plays for the whole session and fades out on the start screen; each step gets its own effect.
  const previousScreenRef = useRef(state.screen);
  useEffect(() => {
    const previous = previousScreenRef.current;
    previousScreenRef.current = state.screen;
    if (state.screen === "start") {
      stopMusic();
      return;
    }
    startMusic();
    if (previous === state.screen) {
      return;
    }
    if (state.screen === "camera" && previous === "style") {
      playSelect();
    } else if (state.screen === "generating") {
      playWhoosh();
    } else if (state.screen === "result") {
      playTada();
    }
  }, [state.screen]);

  useEffect(() => {
    if (state.errorMessage) {
      playError();
    }
  }, [state.errorMessage]);

  // Taps click; the music stops when nobody has touched the screen for a while and comes back on the next tap.
  const screenRef = useRef(state.screen);
  screenRef.current = state.screen;
  useEffect(() => {
    let quietTimer = window.setTimeout(stopMusic, MUSIC_IDLE_MS);
    function onPointerDown(event: PointerEvent): void {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (button && !button.disabled) {
        playTap();
      }
      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(stopMusic, MUSIC_IDLE_MS);
      if (screenRef.current !== "start") {
        startMusic();
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.clearTimeout(quietTimer);
      window.removeEventListener("pointerdown", onPointerDown);
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
      screen = (
        <StartScreen
          hiddenStyles={hiddenStyles}
          onStart={() => dispatch({ type: "begin" })}
          onOpenSettings={settings ? () => setSettingsOpen(true) : undefined}
        />
      );
      break;
    case "style":
      screen = (
        <StyleScreen
          restyle={state.restyle}
          hiddenStyles={hiddenStyles}
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
          colorFix={settings?.settings.colorFix ?? true}
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
          imageCount={settings?.settings.imageCount ?? DEFAULT_IMAGE_COUNT}
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
      {settingsOpen && settings && state.screen === "start" ? (
        <SettingsMenu
          current={settings}
          onSaved={setSettings}
          onClose={() => {
            // Drop any theme preview that was not saved.
            document.documentElement.dataset.theme = visualTheme;
            setSoundTheme(soundTheme);
            setSettingsOpen(false);
          }}
        />
      ) : null}
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
