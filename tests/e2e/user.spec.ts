import request from "supertest";
import app from "../../app";
import { redisClient } from "../../middlewares/Session";
import setupDatabase from "../../helpers/databaseSetup";
import { execSync } from "child_process";
describe("create user and login", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL_PRO = process.env.DATABASE_URL_TEST;

    // Run migrations
    execSync("npx prisma db push", {
      env: { ...process.env, NODE_ENV: "test" },
    });
  });
  it("should create the user", async () => {
    const res = await request(app).post("/api/signup").send({
      username: "test_user",
      email: "test@gmail.com",
      password: "test1234",
    });
    console.log(res.body);
    expect(res.status).toBe(201);
  });

  afterAll(async () => {
    await redisClient.close();
  });
});
