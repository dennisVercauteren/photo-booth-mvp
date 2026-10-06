import { FlowStep, stepAfterStyle } from "../config/flow";
import type { CapturedPhoto, GeneratedPhoto } from "../types";

export type Screen = "start" | "style" | "camera" | "review" | "generating" | "result";

export interface SessionState {
  screen: Screen;
  sessionId: string;
  startedAt: string;
  styleId: string | null;
  photo: CapturedPhoto | null;
  options: GeneratedPhoto[];
  selectedOption: number;
  upscales: Record<number, GeneratedPhoto>;
  errorMessage: string | null;
  restyle: boolean;
  generationAttempt: number;
}

export type SessionAction =
  | { type: "begin" }
  | { type: "new-session" }
  | { type: "choose-style"; styleId: string }
  | { type: "open-styles"; restyle: boolean }
  | { type: "open-camera" }
  | { type: "photo-ready"; photo: CapturedPhoto }
  | { type: "retake" }
  | { type: "confirm-photo" }
  | { type: "generation-succeeded"; options: GeneratedPhoto[] }
  | { type: "generation-failed"; message: string }
  | { type: "retry-generation" }
  | { type: "select-option"; index: number }
  | { type: "upscale-ready"; variant: number; photo: GeneratedPhoto }
  | { type: "back" };

export function createSessionState(): SessionState {
  return {
    screen: "start",
    sessionId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    styleId: null,
    photo: null,
    options: [],
    selectedOption: 0,
    upscales: {},
    errorMessage: null,
    restyle: false,
    generationAttempt: 0,
  };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "begin":
      return {
        ...state,
        screen: "style",
        errorMessage: null,
        restyle: false,
      };
    case "new-session":
      return createSessionState();
    case "choose-style":
      if (state.photo && state.restyle) {
        return {
          ...state,
          styleId: action.styleId,
          screen: "generating",
          options: [],
          selectedOption: 0,
          upscales: {},
          errorMessage: null,
          generationAttempt: state.generationAttempt + 1,
        };
      }
      return chooseFreshStyle(state, action.styleId);
    case "open-styles":
      return {
        ...state,
        screen: "style",
        restyle: action.restyle,
        errorMessage: null,
      };
    case "open-camera":
      return {
        ...state,
        screen: "camera",
        errorMessage: null,
      };
    case "photo-ready":
      return {
        ...state,
        photo: action.photo,
        options: [],
        selectedOption: 0,
        upscales: {},
        screen: "review",
        errorMessage: null,
        restyle: false,
      };
    case "retake":
      return {
        ...state,
        screen: "camera",
        errorMessage: null,
      };
    case "confirm-photo":
      if (!state.photo || !state.styleId) {
        return state;
      }
      return {
        ...state,
        screen: "generating",
        errorMessage: null,
        generationAttempt: state.generationAttempt + 1,
      };
    case "generation-succeeded":
      if (action.options.length === 0) {
        return state;
      }
      return {
        ...state,
        options: action.options,
        selectedOption: 0,
        upscales: {},
        screen: "result",
        errorMessage: null,
        restyle: false,
      };
    case "select-option":
      if (action.index < 0 || action.index >= state.options.length) {
        return state;
      }
      return {
        ...state,
        selectedOption: action.index,
      };
    case "upscale-ready":
      return {
        ...state,
        upscales: {
          ...state.upscales,
          [action.variant]: action.photo,
        },
      };
    case "generation-failed":
      return {
        ...state,
        screen: "generating",
        errorMessage: action.message,
      };
    case "retry-generation":
      if (!state.photo || !state.styleId) {
        return state;
      }
      return {
        ...state,
        screen: "generating",
        errorMessage: null,
        generationAttempt: state.generationAttempt + 1,
      };
    case "back":
      return goBack(state);
    default: {
      const _never: never = action;
      return _never;
    }
  }
}

function chooseFreshStyle(state: SessionState, styleId: string): SessionState {
  const destination = stepAfterStyle();
  switch (destination) {
    case FlowStep.Camera:
      return {
        ...state,
        styleId,
        screen: "camera",
        errorMessage: null,
        restyle: false,
      };
    case FlowStep.Payment:
      return {
        ...state,
        styleId,
        screen: "camera",
        errorMessage: null,
        restyle: false,
      };
    default: {
      const _never: never = destination;
      return _never;
    }
  }
}

function goBack(state: SessionState): SessionState {
  switch (state.screen) {
    case "start":
      return state;
    case "style":
      if (state.restyle && state.options.length > 0) {
        return { ...state, screen: "result", errorMessage: null };
      }
      return { ...state, screen: "start", errorMessage: null, restyle: false };
    case "camera":
      if (state.options.length > 0) {
        return { ...state, screen: "result", errorMessage: null };
      }
      if (state.photo) {
        return { ...state, screen: "review", errorMessage: null };
      }
      return { ...state, screen: "style", errorMessage: null };
    case "review":
      return { ...state, screen: "camera", errorMessage: null };
    case "generating":
      return state;
    case "result":
      return state;
    default: {
      const _never: never = state.screen;
      return _never;
    }
  }
}
