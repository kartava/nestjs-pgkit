import { Test } from "@nestjs/testing";

import { AppAuthenticateModule } from "../src/app-authenticate.module";

describe("PGKit (authenticate)", () => {
  it(`should throw error`, async () => {
    const module = Test.createTestingModule({
      imports: [AppAuthenticateModule],
    });

    await expect(module.compile()).rejects.toThrow(Error);
  });
});
