import supertest from "supertest";
import { after, afterEach, before, describe, test } from "node:test";
import { db, redis } from "./managers";
import app from "./app";
import assert from "node:assert";

describe("User API introduction", () => {
  let request: any;
  before(async () => {
    request = supertest(app);
    await db.connect(true);
    await redis.connect(true);
  });

  after(async () => {
    await db.disconnect();
    await redis.disconnect();
  });

  afterEach(async () => {
    await db.clearTable();
  });

  const userData = {
    name: "John Doe",
    email: "jdoe@mail.com",
  };

  const createUser = async () => {
    return request.post("/users").send(userData);
  };

  test("POST /users should create a new user", async () => {
    const response = await createUser();

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.type, "application/json");

    assert.strictEqual(response.body.name, userData.name);
    assert.strictEqual(response.body.email, userData.email);
    assert.ok(response.body.id);
    assert.ok(response.body.created_at);
  });

  test("GET /users/:id should return the user", async () => {
    const createUserResponse = await createUser();

    assert.strictEqual(createUserResponse.status, 201);
    assert.strictEqual(createUserResponse.type, "application/json");

    const response = await request
      .get(`/users/${createUserResponse.body.id}`)
      .expect(200)
      .expect("Content-Type", /json/);

    assert.strictEqual(response.body.name, userData.name);
    assert.strictEqual(response.body.email, userData.email);
    assert.ok(response.body.id);
    assert.ok(response.body.created_at);
  });

  test("GET /users/:id should cache the user data", async () => {
    const createUserResponse = await createUser();

    const redisClient = redis.getClient();

    assert.strictEqual(createUserResponse.status, 201);
    assert.strictEqual(createUserResponse.type, "application/json");

    const response = await request
      .get(`/users/${createUserResponse.body.id}`)
      .expect(200)
      .expect("Content-Type", /json/);

    const cached = await redisClient.get(`user:${createUserResponse.body.id}`);

    assert.ok(cached);
    assert.strictEqual(response.body.name, userData.name);
  });

  test("GET /users should return a list of users", async () => {
    await Promise.all([createUser(), createUser(), createUser()]);

    const response = await request
      .get("/users")
      .expect(200)
      .expect("Content-Type", /json/);

    assert.ok(Array.isArray(response.body));
    assert.ok(response.body.length > 0);
  });

  test("GET /users/:id should return 404 if user not found", async () => {
    const response = await request.get("/users/100").expect(404);
    assert.strictEqual(response.body.error, "User not found");
  });

  test("PUT /users/:id should update the user", async () => {
    const createUserResponse = await createUser();

    const updatedUserData = {
      name: "Jane Doe",
      email: "update@gmail.com",
    };

    const response = await request
      .put(`/users/${createUserResponse.body.id}`)
      .send(updatedUserData)
      .expect(200)
      .expect("Content-Type", /json/);

    assert.notEqual(response.body.name, userData.name);
    assert.strictEqual(response.body.name, updatedUserData.name);
    assert.strictEqual(response.body.email, updatedUserData.email);
  });

  test("DELETE /users/:id should delete the user", async () => {
    const createUserResponse = await createUser();

    await request.delete(`/users/${createUserResponse.body.id}`).expect(204);

    const response = await request
      .get(`/users/${createUserResponse.body.id}`)
      .expect(404);
  });
});
