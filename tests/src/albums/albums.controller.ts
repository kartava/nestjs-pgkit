import { Body, Controller, Get, Post } from "@nestjs/common";

import { routes } from "./configs/app.routes";
import { AlbumsService } from "./albums.service";
import { Album, CreateAlbumProps } from "./albums.types";

@Controller(routes.albums.root)
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  async findAll(): Promise<Album[]> {
    return await this.albumsService.findAll();
  }

  @Post()
  async create(@Body() payload: CreateAlbumProps): Promise<Album> {
    return await this.albumsService.create(payload);
  }
}
