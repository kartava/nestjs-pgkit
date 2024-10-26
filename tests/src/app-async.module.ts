import { Module } from "@nestjs/common";

import { DatabaseModule } from "./database.module";
import { AlbumsModule } from "./albums/albums.module";

@Module({
  imports: [DatabaseModule.forRoot(), AlbumsModule],
})
export class AsyncApplicationModule {}
