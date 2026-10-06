export const ErrorCode = {
  Validation: "validation_error",
  UnsupportedFormat: "unsupported_format",
  ImageTooLarge: "image_too_large",
  MalformedImage: "malformed_image",
  UnknownStyle: "unknown_style",
  InvalidApiKey: "invalid_api_key",
  PlanRequired: "plan_required",
  RateLimit: "rate_limit",
  Timeout: "timeout",
  ProviderUnavailable: "provider_unavailable",
  UnsupportedModel: "unsupported_model",
  NoImage: "no_image",
  MalformedResponse: "malformed_response",
  Internal: "internal_error",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

const PUBLIC_MESSAGES: Record<ErrorCode, string> = {
  validation_error: "We couldn't create your photo. Please try again.",
  unsupported_format: "That photo format is not supported. Please retake it and try again.",
  image_too_large: "That photo is too large. Please retake it and try again.",
  malformed_image: "We couldn't read that photo. Please retake it and try again.",
  unknown_style: "That style is not available. Please choose another one.",
  invalid_api_key: "We couldn't create your photo. Please try again.",
  plan_required: "Image generation isn't included in this API plan. Enable billing for the Gemini project, then try again.",
  rate_limit: "The booth is busy right now. Please wait a moment and try again.",
  timeout: "This portrait is taking too long. Please try again.",
  provider_unavailable: "We couldn't create your photo. Please try again.",
  unsupported_model: "We couldn't create your photo. Please try again.",
  no_image: "We couldn't create your photo. Please try again.",
  malformed_response: "We couldn't create your photo. Please try again.",
  internal_error: "We couldn't create your photo. Please try again.",
};

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly publicMessage: string;
  readonly detail: string;

  constructor(status: number, code: ErrorCode, detail: string) {
    super(detail);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.publicMessage = PUBLIC_MESSAGES[code];
  }
}
