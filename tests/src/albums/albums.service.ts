import { Injectable } from "@nestjs/common";
import { Client, sql } from "@pgkit/client";
import { InjectClient } from "../../../lib";

import { ALBUMS_NAMED_CLIENT } from "./albums.di-tokens";
import { Album, CreateAlbumProps } from "./albums.types";

@Injectable()
export class AlbumsService {
  constructor(
    @InjectClient()
    private readonly defaultClient: Client,
    @InjectClient(ALBUMS_NAMED_CLIENT)
    private readonly namedClient: Client,
  ) {}

  async findAll(): Promise<Album[]> {
    return await this.defaultClient.many<Album>(
      sql`
          SELECT *
          FROM albums;
      `,
    );
  }

  async create(props: CreateAlbumProps): Promise<Album> {
    return this.namedClient.one<Album>(
      sql`
          INSERT INTO albums ("title", "songs", "releasedAt")
          VALUES (${props.title}, ${props.songs}, ${props.releasedAt})
          RETURNING *;
      `,
    );
  }
}
