import { DynamicModule, Module } from "@nestjs/common";

import { PgKitModuleAsyncOptions, PgKitModuleOptions } from "./interfaces";
import { PgKitCoreModule } from "./pgkit-core.module";

@Module({})
export class PgKitModule {
  static forRoot(options: PgKitModuleOptions): DynamicModule {
    return {
      module: PgKitModule,
      imports: [PgKitCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: PgKitModuleAsyncOptions): DynamicModule {
    return {
      module: PgKitModule,
      imports: [PgKitCoreModule.forRootAsync(options)],
    };
  }
}
