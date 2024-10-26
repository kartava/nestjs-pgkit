import { Server } from "http";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";

import * as request from "supertest";

import { ApplicationModule } from "../src/app.module";
import { routes } from "../src/albums/configs/app.routes";
import { CreateAlbumProps } from "../src/albums/albums.types";

describe("PgKit", () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it(`should return created entity`, async () => {
    const payload: CreateAlbumProps = {
      title: "Blackstar",
      songs: 7,
      releasedAt: new Date("2016-01-08").toISOString(),
    };
    const response = await request(server)
      .post(routes.albums.root)
      .send(payload)
      .expect(201);
    return expect(response.body).toMatchObject(payload);
  });

  it(`should return non empty response`, async () => {
    const response = await request(server).get(routes.albums.root).expect(200);
    return expect(response.body).not.toHaveLength(0);
  });

  afterEach(async () => {
    await app.close();
  });
});
