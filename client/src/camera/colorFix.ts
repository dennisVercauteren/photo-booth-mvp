/**
 * Colour fix for the NoIR camera (no infrared filter). Infrared light adds red, so dark blue
 * and black clothing look purple and the auto white balance leaves whites teal. This shader
 * evens out the white balance and turns purple/magenta tones back to blue. Skin tones
 * (orange, hue ~5-40 degrees) are outside the band and stay as they are.
 *
 * Stopgap until the booth gets a camera with an IR filter; switch it off in the staff settings.
 */

/** Per-channel gains that undo the teal cast. */
const WHITE_BALANCE = [1.12, 1.0, 0.97] as const;
/** Hue band (degrees) treated as IR purple: fades in from START, full from START+FADE_IN, out at END. */
const PURPLE_START = 245;
const PURPLE_FADE_IN = 20;
const PURPLE_END = 358;
const PURPLE_FADE_OUT = 18;
/** Hue the purple is moved to (navy blue) and how far (0-1). */
const TARGET_HUE = 228;
const HUE_SHIFT = 0.9;
/** Fixed tones get a bit more saturation and are darkened, as IR also makes them too light. */
const SATURATION_BOOST = 0.3;
const DARKEN = 0.35;

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec2 uv;
uniform sampler2D frame;

vec3 rgbToHsv(vec3 c) {
  float mx = max(c.r, max(c.g, c.b));
  float mn = min(c.r, min(c.g, c.b));
  float d = mx - mn;
  float h = 0.0;
  if (d > 0.00001) {
    if (mx == c.r) {
      h = mod((c.g - c.b) / d, 6.0);
    } else if (mx == c.g) {
      h = (c.b - c.r) / d + 2.0;
    } else {
      h = (c.r - c.g) / d + 4.0;
    }
  }
  return vec3(h * 60.0, mx > 0.0 ? d / mx : 0.0, mx);
}

vec3 hsvToRgb(vec3 c) {
  vec3 k = mod(vec3(5.0, 3.0, 1.0) + c.x / 60.0, 6.0);
  return c.z - c.z * c.y * clamp(min(k, 4.0 - k), 0.0, 1.0);
}

void main() {
  vec3 rgb = clamp(texture2D(frame, uv).rgb * vec3(${glFloat(WHITE_BALANCE[0])}, ${glFloat(WHITE_BALANCE[1])}, ${glFloat(WHITE_BALANCE[2])}), 0.0, 1.0);
  vec3 hsv = rgbToHsv(rgb);
  float band = clamp(min((hsv.x - ${glFloat(PURPLE_START)}) / ${glFloat(PURPLE_FADE_IN)}, (${glFloat(PURPLE_END)} - hsv.x) / ${glFloat(PURPLE_FADE_OUT)}), 0.0, 1.0);
  float weight = band * clamp((hsv.y - 0.04) / 0.08, 0.0, 1.0);
  hsv.x += (${glFloat(TARGET_HUE)} - hsv.x) * weight * ${glFloat(HUE_SHIFT)};
  hsv.y = clamp(hsv.y * (1.0 + ${glFloat(SATURATION_BOOST)} * weight), 0.0, 1.0);
  hsv.z *= 1.0 - ${glFloat(DARKEN)} * weight;
  gl_FragColor = vec4(hsvToRgb(hsv), 1.0);
}`;

function glFloat(value: number): string {
  return Number.isInteger(value) ? `${value}.0` : String(value);
}

/** Draws colour-fixed video frames onto a canvas with WebGL. */
export class ColorFixRenderer {
  private readonly gl: WebGLRenderingContext;
  private readonly texture: WebGLTexture;

  constructor(readonly canvas: HTMLCanvasElement) {
    // preserveDrawingBuffer lets the capture code read the last frame with drawImage.
    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, alpha: false });
    if (!gl) {
      throw new Error("WebGL is not available.");
    }
    this.gl = gl;

    const program = gl.createProgram();
    const texture = gl.createTexture();
    const buffer = gl.createBuffer();
    if (!program || !texture || !buffer) {
      throw new Error("WebGL setup failed.");
    }
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Colour fix shader did not link: ${gl.getProgramInfoLog(program) ?? ""}`);
    }
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    this.texture = texture;
  }

  /** Draws the current video frame. Returns false while the video has no frame yet. */
  draw(video: HTMLVideoElement): boolean {
    const { videoWidth, videoHeight } = video;
    if (!videoWidth || !videoHeight) {
      return false;
    }
    if (this.canvas.width !== videoWidth || this.canvas.height !== videoHeight) {
      this.canvas.width = videoWidth;
      this.canvas.height = videoHeight;
    }
    const gl = this.gl;
    gl.viewport(0, 0, videoWidth, videoHeight);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  }
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("WebGL setup failed.");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Colour fix shader did not compile: ${gl.getShaderInfoLog(shader) ?? ""}`);
  }
  return shader;
}
