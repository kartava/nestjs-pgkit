import { ModuleRef } from "@nestjs/core";
import {
  DynamicModule,
  Global,
  Inject,
  Logger,
  Module,
  OnApplicationShutdown,
} from "@nestjs/common";
import { defer, lastValueFrom } from "rxjs";

import { Client, createClient } from "@pgkit/client";

import { PGKitModuleOptions } from "./interfaces";
import { getClientName, getClientToken, handleRetry } from "./common";
import { LOGGER_CONTEXT, PG_KIT_MODULE_OPTIONS } from "./pgkit.constants";

@Global()
@Module({})
export class PGKitCoreModule implements OnApplicationShutdown {
  private readonly logger = new Logger(LOGGER_CONTEXT);

  constructor(
    @Inject(PG_KIT_MODULE_OPTIONS)
    private readonly options: PGKitModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    const dbClient = this.moduleRef.get<Client>(getClientToken(this.options));
    try {
      await dbClient?.end();
    } catch (error: any) {
      this.logger.error(error?.message);
    }
  }

  static forRoot(options: PGKitModuleOptions): DynamicModule {
    const pgKitOptions = {
      provide: PG_KIT_MODULE_OPTIONS,
      useValue: options,
    };
    const clientProvider = {
      provide: getClientToken(options),
      useFactory: async () => this.createClientFactory(options),
    };

    return {
      module: PGKitCoreModule,
      providers: [clientProvider, pgKitOptions],
      exports: [clientProvider],
    };
  }

  private static async createClientFactory(
    options: PGKitModuleOptions,
  ): Promise<Client> {
    const clientToken = getClientName(options);

    return await lastValueFrom(
      defer(async () => {
        const dbClient = createClient(options.connectionUri);

        // try to connect to database to catch errors if database is not reachable
        await dbClient.connect(() => Promise.resolve());
        return dbClient;
      }).pipe(
        handleRetry(
          options.retryAttempts,
          options.retryDelay,
          clientToken,
          options.verboseRetryLog,
          options.toRetry,
        ),
      ),
    );
  }
}
