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
  PgKitModuleAsyncOptions,
  PgKitModuleOptions,
  PgKitOptionsFactory,
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
export class PgKitCoreModule implements OnApplicationShutdown {
  private readonly logger = new Logger(LOGGER_CONTEXT);

  constructor(
    @Inject(PG_KIT_MODULE_OPTIONS)
    private readonly options: PgKitModuleOptions,
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

  static forRoot(options: PgKitModuleOptions): DynamicModule {
    const pgKitOptions = {
      provide: PG_KIT_MODULE_OPTIONS,
      useValue: options,
    };
    const clientProvider = {
      provide: getClientToken(options),
      useFactory: async () => this.createClientFactory(options),
    };

    return {
      module: PgKitCoreModule,
      providers: [clientProvider, pgKitOptions],
      exports: [clientProvider],
    };
  }

  static forRootAsync(options: PgKitModuleAsyncOptions): DynamicModule {
    const clientProvider = {
      provide: getClientToken(options as PgKitModuleOptions),
      useFactory: async (pgKitOptions: PgKitModuleOptions) => {
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
      module: PgKitCoreModule,
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
    options: PgKitModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<PgKitOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: PgKitModuleAsyncOptions,
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
      (options.useClass || options.useExisting) as Type<PgKitOptionsFactory>,
    ];
    return {
      provide: PG_KIT_MODULE_OPTIONS,
      useFactory: async (optionsFactory: PgKitOptionsFactory) =>
        optionsFactory.createPgKitOptions(options.name),
      inject,
    };
  }

  private static async createClientFactory(
    options: PgKitModuleOptions,
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
