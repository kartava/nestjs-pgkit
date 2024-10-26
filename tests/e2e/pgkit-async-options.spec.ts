import { Server } from "http";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";

import { routes } from "../src/albums/configs/app.routes";
import { AsyncOptionsFactoryModule } from "../src/async-options.module";
import { CreateAlbumProps } from "../src/albums/albums.types";

describe("PGKit (async configuration)", () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AsyncOptionsFactoryModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it(`should return created entity`, async () => {
    const payload: CreateAlbumProps = {
      title: "Never Let Me Down",
      songs: 10,
      releasedAt: new Date("1987-04-20").toISOString(),
    };
    return request(server)
      .post(routes.albums.root)
      .send(payload)
      .expect(201)
      .then((response) => expect(response.body).toMatchObject(payload));
  });

  afterEach(async () => {
    await app.close();
  });
});
