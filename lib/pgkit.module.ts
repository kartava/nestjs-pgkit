import { DynamicModule, Module } from "@nestjs/common";

import { PGKitModuleAsyncOptions, PGKitModuleOptions } from "./interfaces";
import { PGKitCoreModule } from "./pgkit-core.module";

@Module({})
export class PGKitModule {
  static forRoot(options: PGKitModuleOptions): DynamicModule {
    return {
      module: PGKitModule,
      imports: [PGKitCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: PGKitModuleAsyncOptions): DynamicModule {
    return {
      module: PGKitModule,
      imports: [PGKitCoreModule.forRootAsync(options)],
    };
  }
}
