import { Type, ModuleMetadata } from "@nestjs/common";

export interface PgKitOptions {
  connectionUri: string;
}

export interface PgKitModuleOptions extends PgKitOptions {
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

export interface PgKitOptionsFactory {
  createPgKitOptions(
    clientName?: string,
  ): Promise<PgKitModuleOptions> | PgKitModuleOptions;
}

export interface PgKitModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  name?: string;
  useExisting?: Type<PgKitOptionsFactory>;
  useClass?: Type<PgKitOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<PgKitModuleOptions> | PgKitModuleOptions;
  inject?: any[];
}
