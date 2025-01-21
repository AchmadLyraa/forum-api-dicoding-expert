const ServerTestHelper = require("../../../../tests/ServerTestHelper");
const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const pool = require("../../database/postgres/pool");
const createServer = require("../createServer");

describe("/comments endpoint", () => {
	afterAll(async () => {
		await pool.end();
	});

	afterEach(async () => {
		await UsersTableTestHelper.cleanTable();
		await ThreadTableTestHelper.cleanTable();
		await ServerTestHelper.cleanTable();
	});

	describe("when POST /comments", () => {
		it("should response 404 when thread could not be found", async () => {
			const accessToken = await ServerTestHelper.getAccessToken();
			await ThreadTableTestHelper.addThread({ id: "thread-321" });
			const server = await createServer(container);

			const requestPayload = {
				content: "this is a comment",
			};

			const response = await server.inject({
				method: "POST",
				url: "/threads/thread999/comments",
				payload: requestPayload,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(404);
			expect(responseJson.status).toEqual("fail");
			expect(responseJson.message).toEqual("Thread tidak bisa ditemukan");
		});

		it("should response 201 and persisted comments", async () => {
			const requestPayload = {
				content: "this is a comment",
			};

			const accessToken = await ServerTestHelper.getAccessToken();
			await ThreadTableTestHelper.addThread({ id: "thread-321" });
			const server = await createServer(container);

			const response = await server.inject({
				method: "POST",
				url: "/threads/thread-321/comments",
				payload: requestPayload,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(201);
			expect(responseJson.status).toEqual("success");
			expect(responseJson.data.addedComment).toBeDefined();
		});

		it("should response 400 when request payload not contain needed property", async () => {
			const requestPayload = {};

			const accessToken = await ServerTestHelper.getAccessToken();
			await ThreadTableTestHelper.addThread({ id: "thread-321" });
			const server = await createServer(container);

			const response = await server.inject({
				method: "POST",
				url: "/threads/thread-321/comments",
				payload: requestPayload,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(400);
			expect(responseJson.status).toEqual("fail");
			expect(responseJson.message).toEqual(
				"tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada"
			);
		});

		it("should response 400 when request payload did not meet data type specification", async () => {
			const requestPayload = {
				content: [],
			};

			const accessToken = await ServerTestHelper.getAccessToken();
			await ThreadTableTestHelper.addThread({ id: "thread-321" });
			const server = await createServer(container);

			const response = await server.inject({
				method: "POST",
				url: "/threads/thread-321/comments",
				payload: requestPayload,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(400);
			expect(responseJson.status).toEqual("fail");
			expect(responseJson.message).toEqual(
				"tidak dapat membuat comment baru karena tipe data tidak sesuai"
			);
		});
	});

	describe("when DELETE /comments", () => {
		it("should response 404 when thread could not be found", async () => {
			const accessToken = await ServerTestHelper.getAccessToken();
			await ThreadTableTestHelper.addThread({ id: "thread-321" });
			await ServerTestHelper.addComment({ id: "comment-321" });
			const server = await createServer(container);

			const response = await server.inject({
				method: "DELETE",
				url: "/threads/thread999/comments/comment-321",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(404);
			expect(responseJson.status).toEqual("fail");
			expect(responseJson.message).toEqual("Thread tidak bisa ditemukan");
		});

		it("should response 404 when comment could not be found", async () => {
			const accessToken = await ServerTestHelper.getAccessToken();
			await ThreadTableTestHelper.addThread({ id: "thread-321" });
			const server = await createServer(container);

			const response = await server.inject({
				method: "DELETE",
				url: "/threads/thread-321/comments/comment999",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(404);
			expect(responseJson.status).toEqual("fail");
			expect(responseJson.message).toEqual("Komentar tidak bisa ditemukan");
		});

		it("should response 403 when user does not have access to the comment", async () => {
			const accessToken = await ServerTestHelper.getAccessToken();
			await ThreadTableTestHelper.addThread({ id: "thread-321" });
			await UsersTableTestHelper.addUser({
				id: "kamal-098",
				username: "kamal",
			});
			await ServerTestHelper.addComment({
				id: "comment-321",
				owner: "kamal-098",
			});
			const server = await createServer(container);

			const response = await server.inject({
				method: "DELETE",
				url: "/threads/thread-321/comments/comment-321",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(403);
			expect(responseJson.status).toEqual("fail");
			expect(responseJson.message).toEqual(
				"User tidak dapat mengakses komentar"
			);
		});

		it("should response 200 and return success status", async () => {
			const accessToken = await ServerTestHelper.getAccessToken();
			await ThreadTableTestHelper.addThread({ id: "thread-321" });
			await ServerTestHelper.addComment({ id: "comment-321" });
			const server = await createServer(container);

			const response = await server.inject({
				method: "DELETE",
				url: "/threads/thread-321/comments/comment-321",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(200);
			expect(responseJson.status).toEqual("success");
		});
	});
});
