import { DynamicModule, Module } from "@nestjs/common";
import { PgKitModule } from "../../lib";

import { ALBUMS_NAMED_CLIENT } from "./albums/albums.di-tokens";
import { postgresConnectionUri } from "./albums/configs/database.config";

@Module({})
export class DatabaseModule {
  static async forRoot(): Promise<DynamicModule> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      module: DatabaseModule,
      imports: [
        PgKitModule.forRoot({
          connectionUri: postgresConnectionUri,
          retryAttempts: 2,
          retryDelay: 1000,
        }),
        PgKitModule.forRoot({
          name: ALBUMS_NAMED_CLIENT,
          connectionUri: postgresConnectionUri,
          retryAttempts: 2,
          retryDelay: 1000,
        }),
      ],
    };
  }
}
