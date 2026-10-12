declare module "spark-md5" {
  interface SparkArrayBuffer {
    append(buffer: ArrayBuffer): void;
    end(raw?: boolean): string;
  }

  interface SparkMD5Static {
    ArrayBuffer: {
      new (): SparkArrayBuffer;
      hash(buffer: ArrayBuffer, raw?: boolean): string;
    };
  }

  const SparkMD5: SparkMD5Static;
  export default SparkMD5;
}
