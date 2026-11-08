declare module 'bwip-js' {
  export interface ToSVGOptions {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    width?: number;
    includetext?: boolean;
    textxalign?: string;
    barcolor?: string;
    backgroundcolor?: string;
    rotate?: 'N' | 'R' | 'L' | 'I';
    [key: string]: any;
  }

  export function toSVG(options: ToSVGOptions): string;
  export function toCanvas(
    canvas: HTMLCanvasElement | string,
    options: ToSVGOptions
  ): HTMLCanvasElement;

  const bwipjs: {
    toSVG: typeof toSVG;
    toCanvas: typeof toCanvas;
    [key: string]: any;
  };

  export default bwipjs;
}

