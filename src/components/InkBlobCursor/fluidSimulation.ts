/**
 * WebGL Fluid Simulation Engine
 * Based on Pavel Dobryakov's WebGL-Fluid-Simulation (MIT License)
 * Adapted for React/Next.js integration as an ink blob cursor trail effect.
 *
 * Technique: Navier-Stokes fluid dynamics solved via WebGL shaders.
 * - Advection moves dye and velocity fields
 * - Pressure solver ensures incompressibility
 * - Vorticity confinement adds swirl
 * - Bloom post-processing for glow
 * - Cursor movement creates "splats" of colored dye
 */

export interface FluidConfig {
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE: number;
  PRESSURE_ITERATIONS: number;
  CURL: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
  SHADING: boolean;
  COLORFUL: boolean;
  COLOR_UPDATE_SPEED: number;
  BACK_COLOR: { r: number; g: number; b: number };
  TRANSPARENT: boolean;
  BLOOM: boolean;
  BLOOM_ITERATIONS: number;
  BLOOM_RESOLUTION: number;
  BLOOM_INTENSITY: number;
  BLOOM_THRESHOLD: number;
  BLOOM_SOFT_KNEE: number;
  SUNRAYS: boolean;
  SUNRAYS_RESOLUTION: number;
  SUNRAYS_WEIGHT: number;
  AUTO_SPLATS: boolean;
  SPLAT_ON_MOVE_ONLY: boolean;
  COLOR_PALETTE: [number, number, number][] | null;
}

export const DEFAULT_CONFIG: FluidConfig = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  DENSITY_DISSIPATION: 1.5,
  VELOCITY_DISSIPATION: 0.4,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 30,
  SPLAT_RADIUS: 0.15,
  SPLAT_FORCE: 6000,
  SHADING: true,
  COLORFUL: true,
  COLOR_UPDATE_SPEED: 10,
  BACK_COLOR: { r: 0, g: 0, b: 0 },
  TRANSPARENT: true,
  BLOOM: true,
  BLOOM_ITERATIONS: 8,
  BLOOM_RESOLUTION: 256,
  BLOOM_INTENSITY: 0.6,
  BLOOM_THRESHOLD: 0.6,
  BLOOM_SOFT_KNEE: 0.7,
  SUNRAYS: false,
  SUNRAYS_RESOLUTION: 196,
  SUNRAYS_WEIGHT: 1.0,
  AUTO_SPLATS: false,
  SPLAT_ON_MOVE_ONLY: true,
  COLOR_PALETTE: null,
};

// --- Shader Sources ---

const baseVertexShaderSource = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;

  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const blurVertexShaderSource = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  uniform vec2 texelSize;

  void main () {
    vUv = aPosition * 0.5 + 0.5;
    float offset = 1.33333333;
    vL = vUv - texelSize * offset;
    vR = vUv + texelSize * offset;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const blurShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  uniform sampler2D uTexture;

  void main () {
    vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
    sum += texture2D(uTexture, vL) * 0.35294117;
    sum += texture2D(uTexture, vR) * 0.35294117;
    gl_FragColor = sum;
  }
`;

const copyShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  uniform sampler2D uTexture;

  void main () {
    gl_FragColor = texture2D(uTexture, vUv);
  }
`;

const clearShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;

  void main () {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

const colorShaderSource = `
  precision mediump float;
  uniform vec4 color;

  void main () {
    gl_FragColor = color;
  }
`;

const displayShaderSource = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uTexture;
  uniform sampler2D uBloom;
  uniform sampler2D uDithering;
  uniform vec2 ditherScale;
  uniform vec2 texelSize;

  vec3 linearToGamma (vec3 color) {
    color = max(color, vec3(0));
    return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
  }

  void main () {
    vec3 c = texture2D(uTexture, vUv).rgb;

    #ifdef SHADING
      vec3 lc = texture2D(uTexture, vL).rgb;
      vec3 rc = texture2D(uTexture, vR).rgb;
      vec3 tc = texture2D(uTexture, vT).rgb;
      vec3 bc = texture2D(uTexture, vB).rgb;
      float dx = length(rc) - length(lc);
      float dy = length(tc) - length(bc);
      vec3 n = normalize(vec3(dx, dy, length(texelSize)));
      vec3 l = vec3(0.0, 0.0, 1.0);
      float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
      c *= diffuse;
    #endif

    #ifdef BLOOM
      vec3 bloom = texture2D(uBloom, vUv).rgb;
    #endif

    #ifdef BLOOM
      float noise = texture2D(uDithering, vUv * ditherScale).r;
      noise = noise * 2.0 - 1.0;
      bloom += noise / 255.0;
      bloom = linearToGamma(bloom);
      c += bloom;
    #endif

    float intensity = max(c.r, max(c.g, c.b));
    // Black ink mode: dye intensity drives alpha, color is always black
    gl_FragColor = vec4(0.0, 0.0, 0.0, intensity * 0.012);
  }
`;

const bloomPrefilterShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform vec3 curve;
  uniform float threshold;

  void main () {
    vec3 c = texture2D(uTexture, vUv).rgb;
    float br = max(c.r, max(c.g, c.b));
    float rq = clamp(br - curve.x, 0.0, curve.y);
    rq = curve.z * rq * rq;
    c *= max(rq, br - threshold) / max(br, 0.0001);
    gl_FragColor = vec4(c, 0.0);
  }
`;

const bloomBlurShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uTexture;

  void main () {
    vec4 sum = vec4(0.0);
    sum += texture2D(uTexture, vL);
    sum += texture2D(uTexture, vR);
    sum += texture2D(uTexture, vT);
    sum += texture2D(uTexture, vB);
    sum *= 0.25;
    gl_FragColor = sum;
  }
`;

const bloomFinalShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uTexture;
  uniform float intensity;

  void main () {
    vec4 sum = vec4(0.0);
    sum += texture2D(uTexture, vL);
    sum += texture2D(uTexture, vR);
    sum += texture2D(uTexture, vT);
    sum += texture2D(uTexture, vB);
    sum *= 0.25;
    gl_FragColor = sum * intensity;
  }
`;

const splatShaderSource = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;

  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

const advectionShaderSource = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform vec2 dyeTexelSize;
  uniform float dt;
  uniform float dissipation;

  vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
  }

  void main () {
    #ifdef MANUAL_FILTERING
      vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
      vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      vec4 result = texture2D(uSource, coord);
    #endif
    float decay = 1.0 + dissipation * dt;
    gl_FragColor = result / decay;
  }
`;

const divergenceShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uVelocity;

  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const curlShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uVelocity;

  void main () {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`;

const vorticityShaderSource = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;

  void main () {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity += force * dt;
    velocity = min(max(velocity, -1000.0), 1000.0);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const pressureShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;

  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const gradientSubtractShaderSource = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;

  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

// --- WebGL Helpers ---

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

interface GLProgram {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation>;
  bind: () => void;
}

interface MaterialInstance {
  vertexShader: WebGLShader;
  fragmentShaderSource: string;
  programs: Record<number, WebGLProgram>;
  activeProgram: WebGLProgram | null;
  uniforms: Record<string, WebGLUniformLocation>;
  setKeywords: (keywords: string[]) => void;
  bind: () => void;
}

interface Pointer {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: [number, number, number];
}

function createPointer(): Pointer {
  return {
    id: -1,
    texcoordX: 0,
    texcoordY: 0,
    prevTexcoordX: 0,
    prevTexcoordY: 0,
    deltaX: 0,
    deltaY: 0,
    down: false,
    moved: false,
    color: [1.5, 1.5, 1.5],
  };
}

function hashCode(s: string): number {
  if (s.length === 0) return 0;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function generateColor(config: FluidConfig): [number, number, number] {
  if (config.COLOR_PALETTE && config.COLOR_PALETTE.length > 0) {
    const c = config.COLOR_PALETTE[Math.floor(Math.random() * config.COLOR_PALETTE.length)];
    return [c[0] * 0.15, c[1] * 0.15, c[2] * 0.15];
  }
  const c = HSVtoRGB(Math.random(), 1.0, 1.0);
  c.r *= 0.15;
  c.g *= 0.15;
  c.b *= 0.15;
  return [c.r, c.g, c.b];
}

function HSVtoRGB(h: number, s: number, v: number) {
  let r: number, g: number, b: number;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = 0; g = 0; b = 0;
  }
  return { r, g, b };
}

// --- Main Engine ---

export class FluidSimulation {
  private canvas: HTMLCanvasElement;
  private config: FluidConfig;
  private gl!: WebGLRenderingContext | WebGL2RenderingContext;
  private ext!: {
    formatRGBA: { internalFormat: number; format: number } | null;
    formatRG: { internalFormat: number; format: number } | null;
    formatR: { internalFormat: number; format: number } | null;
    halfFloatTexType: number;
    supportLinearFiltering: boolean;
  };

  private pointers: Pointer[] = [];
  private splatStack: number[] = [];

  // Shader programs
  private blurProgram!: GLProgram;
  private copyProgram!: GLProgram;
  private clearProgram!: GLProgram;
  private colorProgram!: GLProgram;
  private bloomPrefilterProgram!: GLProgram;
  private bloomBlurProgram!: GLProgram;
  private bloomFinalProgram!: GLProgram;
  private splatProgram!: GLProgram;
  private advectionProgram!: GLProgram;
  private divergenceProgram!: GLProgram;
  private curlProgram!: GLProgram;
  private vorticityProgram!: GLProgram;
  private pressureProgram!: GLProgram;
  private gradientSubtractProgram!: GLProgram;
  private displayMaterial!: MaterialInstance;

  // Framebuffers
  private dye!: DoubleFBO;
  private velocity!: DoubleFBO;
  private divergenceFBO!: FBO;
  private curlFBO!: FBO;
  private pressureFBO!: DoubleFBO;
  private bloom!: FBO;
  private bloomFramebuffers: FBO[] = [];
  private ditheringTexture!: { texture: WebGLTexture; width: number; height: number };

  private animationId: number = 0;
  private lastUpdateTime: number = 0;
  private colorUpdateTimer: number = 0;
  private destroyed = false;

  constructor(canvas: HTMLCanvasElement, config?: Partial<FluidConfig>) {
    this.canvas = canvas;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.pointers.push(createPointer());

    this.initWebGL();
    this.initShaders();
    this.initFramebuffers();
    this.initDitheringTexture();
    this.lastUpdateTime = Date.now();

    if (this.config.AUTO_SPLATS) {
      this.multipleSplats(Math.floor(Math.random() * 5) + 5);
    }
  }

  private initWebGL() {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = this.canvas.getContext('webgl2', params) as WebGL2RenderingContext | null;
    const isWebGL2 = !!gl;
    if (!isWebGL2) {
      gl = (this.canvas.getContext('webgl', params) || this.canvas.getContext('experimental-webgl', params)) as WebGL2RenderingContext | null;
    }
    if (!gl) throw new Error('WebGL not supported');
    this.gl = gl;

    let halfFloat: any;
    let supportLinearFiltering: any;
    if (isWebGL2) {
      (gl as WebGL2RenderingContext).getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const halfFloatTexType = isWebGL2 ? (gl as WebGL2RenderingContext).HALF_FLOAT : (halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE);

    let formatRGBA: { internalFormat: number; format: number } | null;
    let formatRG: { internalFormat: number; format: number } | null;
    let formatR: { internalFormat: number; format: number } | null;

    if (isWebGL2) {
      const gl2 = gl as WebGL2RenderingContext;
      formatRGBA = this.getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, halfFloatTexType);
      formatRG = this.getSupportedFormat(gl2, gl2.RG16F, gl2.RG, halfFloatTexType);
      formatR = this.getSupportedFormat(gl2, gl2.R16F, gl2.RED, halfFloatTexType);
    } else {
      formatRGBA = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    this.ext = {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering: !!supportLinearFiltering,
    };

    if (!this.ext.supportLinearFiltering) {
      this.config.DYE_RESOLUTION = 512;
      this.config.SHADING = false;
      this.config.BLOOM = false;
      this.config.SUNRAYS = false;
    }
  }

  private getSupportedFormat(gl: WebGLRenderingContext | WebGL2RenderingContext, internalFormat: number, format: number, type: number): { internalFormat: number; format: number } | null {
    if (!this.supportRenderTextureFormat(gl, internalFormat, format, type)) {
      const gl2 = gl as WebGL2RenderingContext;
      switch (internalFormat) {
        case gl2.R16F: return this.getSupportedFormat(gl, gl2.RG16F, gl2.RG, type);
        case gl2.RG16F: return this.getSupportedFormat(gl, gl2.RGBA16F, gl2.RGBA, type);
        default: return null;
      }
    }
    return { internalFormat, format };
  }

  private supportRenderTextureFormat(gl: WebGLRenderingContext | WebGL2RenderingContext, internalFormat: number, format: number, type: number): boolean {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return status === gl.FRAMEBUFFER_COMPLETE;
  }

  private compileShader(type: number, source: string, keywords?: string[]): WebGLShader {
    const gl = this.gl;
    if (keywords) {
      let keywordsString = '';
      keywords.forEach(k => { keywordsString += '#define ' + k + '\n'; });
      source = keywordsString + source;
    }
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const gl = this.gl;
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }
    return program;
  }

  private getUniforms(program: WebGLProgram): Record<string, WebGLUniformLocation> {
    const gl = this.gl;
    const uniforms: Record<string, WebGLUniformLocation> = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i)!;
      const loc = gl.getUniformLocation(program, info.name);
      if (loc) uniforms[info.name] = loc;
    }
    return uniforms;
  }

  private createGLProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): GLProgram {
    const program = this.createProgram(vertexShader, fragmentShader);
    const uniforms = this.getUniforms(program);
    return {
      program,
      uniforms,
      bind: () => this.gl.useProgram(program),
    };
  }

  private createMaterial(vertexShader: WebGLShader, fragmentShaderSource: string): MaterialInstance {
    const self = this;
    const material: MaterialInstance = {
      vertexShader,
      fragmentShaderSource,
      programs: {},
      activeProgram: null,
      uniforms: {},
      setKeywords(keywords: string[]) {
        let hash = 0;
        for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);
        let program = this.programs[hash];
        if (!program) {
          const fragmentShader = self.compileShader(self.gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
          program = self.createProgram(this.vertexShader, fragmentShader);
          this.programs[hash] = program;
        }
        if (program === this.activeProgram) return;
        this.uniforms = self.getUniforms(program);
        this.activeProgram = program;
      },
      bind() {
        self.gl.useProgram(this.activeProgram);
      },
    };
    return material;
  }

  private initShaders() {
    const gl = this.gl;
    const baseVertexShader = this.compileShader(gl.VERTEX_SHADER, baseVertexShaderSource);
    const blurVertexShader = this.compileShader(gl.VERTEX_SHADER, blurVertexShaderSource);

    this.blurProgram = this.createGLProgram(blurVertexShader, this.compileShader(gl.FRAGMENT_SHADER, blurShaderSource));
    this.copyProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, copyShaderSource));
    this.clearProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, clearShaderSource));
    this.colorProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, colorShaderSource));
    this.bloomPrefilterProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, bloomPrefilterShaderSource));
    this.bloomBlurProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, bloomBlurShaderSource));
    this.bloomFinalProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, bloomFinalShaderSource));
    this.splatProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, splatShaderSource));
    this.advectionProgram = this.createGLProgram(
      baseVertexShader,
      this.compileShader(gl.FRAGMENT_SHADER, advectionShaderSource, this.ext.supportLinearFiltering ? undefined : ['MANUAL_FILTERING'])
    );
    this.divergenceProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, divergenceShaderSource));
    this.curlProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, curlShaderSource));
    this.vorticityProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, vorticityShaderSource));
    this.pressureProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, pressureShaderSource));
    this.gradientSubtractProgram = this.createGLProgram(baseVertexShader, this.compileShader(gl.FRAGMENT_SHADER, gradientSubtractShaderSource));
    this.displayMaterial = this.createMaterial(baseVertexShader, displayShaderSource);

    this.initBlit();
  }

  private blit!: (target: FBO | null, clear?: boolean) => void;

  private initBlit() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    this.blit = (target: FBO | null, clear = false) => {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      if (clear) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  }

  private getResolution(resolution: number): { width: number; height: number } {
    const gl = this.gl;
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);
    if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min };
    return { width: min, height: max };
  }

  private createFBO(w: number, h: number, internalFormat: number, format: number, type: number, filter: number): FBO {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const texelSizeX = 1.0 / w;
    const texelSizeY = 1.0 / h;
    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX,
      texelSizeY,
      attach: (id: number) => {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  private createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, filter: number): DoubleFBO {
    let fbo1 = this.createFBO(w, h, internalFormat, format, type, filter);
    let fbo2 = this.createFBO(w, h, internalFormat, format, type, filter);
    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() { return fbo1; },
      set read(v) { fbo1 = v; },
      get write() { return fbo2; },
      set write(v) { fbo2 = v; },
      swap() { const temp = fbo1; fbo1 = fbo2; fbo2 = temp; },
    };
  }

  private resizeFBO(target: FBO, w: number, h: number, internalFormat: number, format: number, type: number, filter: number): FBO {
    const newFBO = this.createFBO(w, h, internalFormat, format, type, filter);
    this.copyProgram.bind();
    this.gl.uniform1i(this.copyProgram.uniforms.uTexture, target.attach(0));
    this.blit(newFBO);
    return newFBO;
  }

  private resizeDoubleFBO(target: DoubleFBO, w: number, h: number, internalFormat: number, format: number, type: number, filter: number): DoubleFBO {
    if (target.width === w && target.height === h) return target;
    target.read = this.resizeFBO(target.read, w, h, internalFormat, format, type, filter);
    target.write = this.createFBO(w, h, internalFormat, format, type, filter);
    target.width = w;
    target.height = h;
    target.texelSizeX = 1.0 / w;
    target.texelSizeY = 1.0 / h;
    return target;
  }

  private initFramebuffers() {
    const gl = this.gl;
    const simRes = this.getResolution(this.config.SIM_RESOLUTION);
    const dyeRes = this.getResolution(this.config.DYE_RESOLUTION);
    const texType = this.ext.halfFloatTexType;
    const rgba = this.ext.formatRGBA!;
    const rg = this.ext.formatRG!;
    const r = this.ext.formatR!;
    const filtering = this.ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    gl.disable(gl.BLEND);

    if (!this.dye) {
      this.dye = this.createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    } else {
      this.dye = this.resizeDoubleFBO(this.dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    }

    if (!this.velocity) {
      this.velocity = this.createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    } else {
      this.velocity = this.resizeDoubleFBO(this.velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    }

    this.divergenceFBO = this.createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    this.curlFBO = this.createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    this.pressureFBO = this.createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);

    this.initBloomFramebuffers();
  }

  private initBloomFramebuffers() {
    const gl = this.gl;
    const res = this.getResolution(this.config.BLOOM_RESOLUTION);
    const texType = this.ext.halfFloatTexType;
    const rgba = this.ext.formatRGBA!;
    const filtering = this.ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    this.bloom = this.createFBO(res.width, res.height, rgba.internalFormat, rgba.format, texType, filtering);
    this.bloomFramebuffers = [];
    for (let i = 0; i < this.config.BLOOM_ITERATIONS; i++) {
      const w = res.width >> (i + 1);
      const h = res.height >> (i + 1);
      if (w < 2 || h < 2) break;
      const fbo = this.createFBO(w, h, rgba.internalFormat, rgba.format, texType, filtering);
      this.bloomFramebuffers.push(fbo);
    }
  }

  private initDitheringTexture() {
    // Create a simple noise texture for dithering
    const gl = this.gl;
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const val = Math.floor(Math.random() * 256);
      data[i * 4] = val;
      data[i * 4 + 1] = val;
      data[i * 4 + 2] = val;
      data[i * 4 + 3] = 255;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    this.ditheringTexture = { texture, width: size, height: size };
  }

  private updateKeywords() {
    const keywords: string[] = [];
    if (this.config.SHADING) keywords.push('SHADING');
    if (this.config.BLOOM) keywords.push('BLOOM');
    this.displayMaterial.setKeywords(keywords);
  }

  // --- Public API ---

  start() {
    this.resize();
    this.updateKeywords();
    const step = () => {
      if (this.destroyed) return;
      this.update();
      this.animationId = requestAnimationFrame(step);
    };
    this.animationId = requestAnimationFrame(step);
  }

  stop() {
    cancelAnimationFrame(this.animationId);
  }

  destroy() {
    this.destroyed = true;
    this.stop();
  }

  resize() {
    const { width, height } = this.canvas.getBoundingClientRect();
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.initFramebuffers();
    }
  }

  // Called with pre-normalized 0-1 texcoords
  updatePointerMoveDataNormalized(id: number, texX: number, texY: number) {
    const pointer = this.pointers[0];
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = texX;
    pointer.texcoordY = texY;
    pointer.deltaX = this.correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = this.correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    pointer.down = true;
  }

  // Called on pointer/mouse move
  updatePointerMoveData(id: number, posX: number, posY: number) {
    const pointer = this.pointers[0];
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / this.canvas.clientWidth;
    pointer.texcoordY = 1.0 - posY / this.canvas.clientHeight;
    pointer.deltaX = this.correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = this.correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    pointer.down = true;
  }

  updatePointerUpData() {
    this.pointers[0].down = false;
  }

  splatAtPoint(x: number, y: number, dx: number, dy: number, color?: [number, number, number]) {
    const c = color || generateColor(this.config);
    this.splat(x, y, dx, dy, c);
  }

  addRandomSplats(count: number) {
    this.multipleSplats(count);
  }

  private correctDeltaX(delta: number): number {
    const aspectRatio = this.canvas.width / this.canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
  }

  private correctDeltaY(delta: number): number {
    const aspectRatio = this.canvas.width / this.canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
  }

  // --- Simulation Step ---

  private update() {
    const dt = this.calcDeltaTime();
    if (this.resizeCanvas()) this.initFramebuffers();

    this.updateColors(dt);
    this.applyInputs();
    this.step(dt);
    this.render(null);
  }

  private calcDeltaTime(): number {
    const now = Date.now();
    let dt = (now - this.lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    this.lastUpdateTime = now;
    return dt;
  }

  private resizeCanvas(): boolean {
    const w = this.scaleByPixelRatio(this.canvas.clientWidth);
    const h = this.scaleByPixelRatio(this.canvas.clientHeight);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      return true;
    }
    return false;
  }

  private scaleByPixelRatio(input: number): number {
    const pixelRatio = window.devicePixelRatio || 1;
    return Math.floor(input * pixelRatio);
  }

  private updateColors(dt: number) {
    if (!this.config.COLORFUL) return;
    this.colorUpdateTimer += dt * this.config.COLOR_UPDATE_SPEED;
    if (this.colorUpdateTimer >= 1) {
      this.colorUpdateTimer = this.wrap(this.colorUpdateTimer, 0, 1);
      this.pointers.forEach(p => {
        p.color = generateColor(this.config);
      });
    }
  }

  private wrap(value: number, min: number, max: number): number {
    const range = max - min;
    if (range === 0) return min;
    return ((value - min) % range) + min;
  }

  private applyInputs() {
    if (this.splatStack.length > 0) {
      this.multipleSplats(this.splatStack.pop()!);
    }

    this.pointers.forEach(p => {
      if (p.moved) {
        p.moved = false;
        this.splatPointer(p);
      }
    });
  }

  private splatPointer(pointer: Pointer) {
    const dx = pointer.deltaX * this.config.SPLAT_FORCE;
    const dy = pointer.deltaY * this.config.SPLAT_FORCE;
    const color = generateColor(this.config);
    this.splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
  }

  private multipleSplats(amount: number) {
    for (let i = 0; i < amount; i++) {
      const color = generateColor(this.config);
      const x = Math.random();
      const y = Math.random();
      const dx = 1000 * (Math.random() - 0.5);
      const dy = 1000 * (Math.random() - 0.5);
      this.splat(x, y, dx, dy, color);
    }
  }

  private splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
    const gl = this.gl;
    this.splatProgram.bind();
    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(this.splatProgram.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(this.splatProgram.uniforms.point, x, y);
    gl.uniform3f(this.splatProgram.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(this.splatProgram.uniforms.radius, this.correctRadius(this.config.SPLAT_RADIUS / 100.0));
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform3f(this.splatProgram.uniforms.color, color[0], color[1], color[2]);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  private correctRadius(radius: number): number {
    const aspectRatio = this.canvas.width / this.canvas.height;
    if (aspectRatio > 1) radius *= aspectRatio;
    return radius;
  }

  private step(dt: number) {
    const gl = this.gl;
    gl.disable(gl.BLEND);

    // Curl
    this.curlProgram.bind();
    gl.uniform2f(this.curlProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.curlProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.curlFBO);

    // Vorticity
    this.vorticityProgram.bind();
    gl.uniform2f(this.vorticityProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.vorticityProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.vorticityProgram.uniforms.uCurl, this.curlFBO.attach(1));
    gl.uniform1f(this.vorticityProgram.uniforms.curl, this.config.CURL);
    gl.uniform1f(this.vorticityProgram.uniforms.dt, dt);
    this.blit(this.velocity.write);
    this.velocity.swap();

    // Divergence
    this.divergenceProgram.bind();
    gl.uniform2f(this.divergenceProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.divergenceProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.divergenceFBO);

    // Pressure clear
    this.clearProgram.bind();
    gl.uniform1i(this.clearProgram.uniforms.uTexture, this.pressureFBO.read.attach(0));
    gl.uniform1f(this.clearProgram.uniforms.value, this.config.PRESSURE);
    this.blit(this.pressureFBO.write);
    this.pressureFBO.swap();

    // Pressure solve
    this.pressureProgram.bind();
    gl.uniform2f(this.pressureProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.pressureProgram.uniforms.uDivergence, this.divergenceFBO.attach(0));
    for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(this.pressureProgram.uniforms.uPressure, this.pressureFBO.read.attach(1));
      this.blit(this.pressureFBO.write);
      this.pressureFBO.swap();
    }

    // Gradient subtract
    this.gradientSubtractProgram.bind();
    gl.uniform2f(this.gradientSubtractProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.gradientSubtractProgram.uniforms.uPressure, this.pressureFBO.read.attach(0));
    gl.uniform1i(this.gradientSubtractProgram.uniforms.uVelocity, this.velocity.read.attach(1));
    this.blit(this.velocity.write);
    this.velocity.swap();

    // Advection velocity
    this.advectionProgram.bind();
    gl.uniform2f(this.advectionProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    if (!this.ext.supportLinearFiltering) {
      gl.uniform2f(this.advectionProgram.uniforms.dyeTexelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    }
    const velocityId = this.velocity.read.attach(0);
    gl.uniform1i(this.advectionProgram.uniforms.uVelocity, velocityId);
    gl.uniform1i(this.advectionProgram.uniforms.uSource, velocityId);
    gl.uniform1f(this.advectionProgram.uniforms.dt, dt);
    gl.uniform1f(this.advectionProgram.uniforms.dissipation, this.config.VELOCITY_DISSIPATION);
    this.blit(this.velocity.write);
    this.velocity.swap();

    // Advection dye
    gl.uniform2f(this.advectionProgram.uniforms.dyeTexelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(this.advectionProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.advectionProgram.uniforms.uSource, this.dye.read.attach(1));
    gl.uniform1f(this.advectionProgram.uniforms.dissipation, this.config.DENSITY_DISSIPATION);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  private render(target: FBO | null) {
    const gl = this.gl;

    if (this.config.BLOOM) this.applyBloom(this.dye.read, this.bloom);

    if (target == null || !this.config.TRANSPARENT) {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
    } else {
      gl.disable(gl.BLEND);
    }

    if (!this.config.TRANSPARENT) {
      this.drawColor(target, this.normalizeColor(this.config.BACK_COLOR));
    }

    this.drawDisplay(target);
  }

  private drawColor(target: FBO | null, color: { r: number; g: number; b: number; a: number }) {
    this.colorProgram.bind();
    this.gl.uniform4f(this.colorProgram.uniforms.color, color.r, color.g, color.b, color.a);
    this.blit(target);
  }

  private normalizeColor(input: { r: number; g: number; b: number }) {
    return { r: input.r / 255, g: input.g / 255, b: input.b / 255, a: 1 };
  }

  private drawDisplay(target: FBO | null) {
    const gl = this.gl;
    const width = target == null ? gl.drawingBufferWidth : target.width;
    const height = target == null ? gl.drawingBufferHeight : target.height;

    this.displayMaterial.bind();
    if (this.config.SHADING) {
      gl.uniform2f(this.displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
    }
    gl.uniform1i(this.displayMaterial.uniforms.uTexture, this.dye.read.attach(0));
    if (this.config.BLOOM) {
      gl.uniform1i(this.displayMaterial.uniforms.uBloom, this.bloom.attach(1));
      gl.uniform1i(this.displayMaterial.uniforms.uDithering, this.ditheringTexture.texture as unknown as number);
      const gl2 = gl;
      gl2.activeTexture(gl2.TEXTURE2);
      gl2.bindTexture(gl2.TEXTURE_2D, this.ditheringTexture.texture);
      gl.uniform1i(this.displayMaterial.uniforms.uDithering, 2);
      gl.uniform2f(this.displayMaterial.uniforms.ditherScale, width / this.ditheringTexture.width, height / this.ditheringTexture.height);
    }
    this.blit(target);
  }

  private applyBloom(source: FBO, destination: FBO) {
    if (this.bloomFramebuffers.length < 2) return;
    const gl = this.gl;

    let last = destination;

    gl.disable(gl.BLEND);
    this.bloomPrefilterProgram.bind();
    const knee = this.config.BLOOM_THRESHOLD * this.config.BLOOM_SOFT_KNEE + 0.0001;
    const curve0 = this.config.BLOOM_THRESHOLD - knee;
    const curve1 = knee * 2;
    const curve2 = 0.25 / knee;
    gl.uniform3f(this.bloomPrefilterProgram.uniforms.curve, curve0, curve1, curve2);
    gl.uniform1f(this.bloomPrefilterProgram.uniforms.threshold, this.config.BLOOM_THRESHOLD);
    gl.uniform1i(this.bloomPrefilterProgram.uniforms.uTexture, source.attach(0));
    this.blit(last);

    this.bloomBlurProgram.bind();
    for (let i = 0; i < this.bloomFramebuffers.length; i++) {
      const dest = this.bloomFramebuffers[i];
      gl.uniform2f(this.bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
      gl.uniform1i(this.bloomBlurProgram.uniforms.uTexture, last.attach(0));
      this.blit(dest);
      last = dest;
    }

    gl.blendFunc(gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    for (let i = this.bloomFramebuffers.length - 2; i >= 0; i--) {
      const baseTex = this.bloomFramebuffers[i];
      gl.uniform2f(this.bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
      gl.uniform1i(this.bloomBlurProgram.uniforms.uTexture, last.attach(0));
      gl.viewport(0, 0, baseTex.width, baseTex.height);
      this.blit(baseTex);
      last = baseTex;
    }

    gl.disable(gl.BLEND);
    this.bloomFinalProgram.bind();
    gl.uniform2f(this.bloomFinalProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
    gl.uniform1i(this.bloomFinalProgram.uniforms.uTexture, last.attach(0));
    gl.uniform1f(this.bloomFinalProgram.uniforms.intensity, this.config.BLOOM_INTENSITY);
    this.blit(destination);
  }
}
