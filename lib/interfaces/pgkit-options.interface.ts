import { Type, ModuleMetadata } from "@nestjs/common";

export interface PGKitOptions {
  connectionUri: string;
}

export interface PGKitModuleOptions extends PGKitOptions {
  /**
   * Connection client name
   */
  name?: string;

  /**
   * Function that determines whether the module should
   * attempt to connect upon failure.
   *
   * @param err error that was thrown
   * @returns whether to retry connection or not
   */
  toRetry?: (err: any) => boolean;
  /**
   * If `true`, will show verbose error messages on each connection retry.
   */
  verboseRetryLog?: boolean;
  /**
   * Number of times to retry connecting
   * Default: 10
   */
  retryAttempts?: number;
  /**
   * Delay between connection retry attempts (ms)
   * Default: 3000
   */
  retryDelay?: number;
}

export interface PGKitOptionsFactory {
  createPgKitOptions(
    clientName?: string,
  ): Promise<PGKitModuleOptions> | PGKitModuleOptions;
}

export interface PGKitModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  name?: string;
  useExisting?: Type<PGKitOptionsFactory>;
  useClass?: Type<PGKitOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<PGKitModuleOptions> | PGKitModuleOptions;
  inject?: any[];
}
