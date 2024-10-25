import { ModuleRef } from "@nestjs/core";
import {
  DynamicModule,
  Global,
  Inject,
  Logger,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from "@nestjs/common";
import { defer, lastValueFrom } from "rxjs";

import { Client, createClient } from "@pgkit/client";

import {
  PGKitModuleAsyncOptions,
  PGKitModuleOptions,
  PGKitOptionsFactory,
} from "./interfaces";
import {
  generateRandomString,
  getClientName,
  getClientToken,
  handleRetry,
} from "./common";
import {
  LOGGER_CONTEXT,
  PG_KIT_MODULE_ID,
  PG_KIT_MODULE_OPTIONS,
} from "./pgkit.constants";

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

  static forRootAsync(options: PGKitModuleAsyncOptions): DynamicModule {
    const clientProvider = {
      provide: getClientToken(options as PGKitModuleOptions),
      useFactory: async (pgKitOptions: PGKitModuleOptions) => {
        if (options.name) {
          return this.createClientFactory({
            ...pgKitOptions,
            name: options.name,
          });
        }
        return this.createClientFactory(pgKitOptions);
      },
      inject: [PG_KIT_MODULE_OPTIONS],
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: PGKitCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        clientProvider,
        {
          provide: PG_KIT_MODULE_ID,
          useValue: generateRandomString(),
        },
      ],
      exports: [clientProvider],
    };
  }

  private static createAsyncProviders(
    options: PGKitModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<PGKitOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: PGKitModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: PG_KIT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<TypeOrmOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<PGKitOptionsFactory>,
    ];
    return {
      provide: PG_KIT_MODULE_OPTIONS,
      useFactory: async (optionsFactory: PGKitOptionsFactory) =>
        optionsFactory.createPgKitOptions(options.name),
      inject,
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
