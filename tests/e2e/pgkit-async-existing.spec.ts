import { Server } from "http";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";

import { routes } from "../src/albums/configs/app.routes";
import { AsyncOptionsExistingModule } from "../src/async-existing-options.module";
import { CreateAlbumProps } from "../src/albums/albums.types";

describe("PgKit (async configuration)", () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AsyncOptionsExistingModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it(`should return created entity`, async () => {
    const payload: CreateAlbumProps = {
      title: "Heathen",
      songs: 14,
      releasedAt: new Date("2002-06-10").toISOString(),
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
