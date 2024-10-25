import { DynamicModule, Module } from "@nestjs/common";
import { PGKitModule } from "../../lib";
import { postgresConnectionUri } from "./albums/configs/database.config";

@Module({})
export class DatabaseModule {
  static async forRoot(): Promise<DynamicModule> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      module: DatabaseModule,
      imports: [
        PGKitModule.forRoot({
          connectionUri: postgresConnectionUri,
          retryAttempts: 2,
          retryDelay: 1000,
        }),
        PGKitModule.forRoot({
          name: "connection_2",
          connectionUri: postgresConnectionUri,
          retryAttempts: 2,
          retryDelay: 1000,
        }),
      ],
    };
  }
}
