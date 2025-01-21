const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ServerTestHelper = require("../../../../tests/ServerTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const container = require("../../container");
const pool = require("../../database/postgres/pool");
const createServer = require("../createServer");

describe("/threads endpoint", () => {
	afterAll(async () => {
		await pool.end();
	});

	afterEach(async () => {
		await ThreadTableTestHelper.cleanTable();
		await UsersTableTestHelper.cleanTable();
		await ServerTestHelper.cleanTable();
	});

	describe("when POST /threads", () => {
		it("should response 201 and persisted threads", async () => {
			const requestPayload = {
				title: "Dicoding",
				body: "Dicoding is the best!",
			};

			const accessToken = await ServerTestHelper.getAccessToken();
			const server = await createServer(container);

			const response = await server.inject({
				method: "POST",
				url: "/threads",
				payload: requestPayload,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(201);
			expect(responseJson.status).toEqual("success");
			expect(responseJson.data.addedThread).toBeDefined();
		});

		it("should response 400 when request payload not contain needed property", async () => {
			const requestPayload = {
				title: "Dicoding",
			};
			const server = await createServer(container);
			const accessToken = await ServerTestHelper.getAccessToken();

			const response = await server.inject({
				method: "POST",
				url: "/threads",
				payload: requestPayload,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(400);
			expect(responseJson.status).toEqual("fail");
			expect(responseJson.message).toEqual(
				"tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada"
			);
		});

		it("should response 400 when request payload did not meet data type specification", async () => {
			const requestPayload = {
				title: true,
				body: "Dicoding is the best!",
			};
			const accessToken = await ServerTestHelper.getAccessToken();
			const server = await createServer(container);

			const response = await server.inject({
				method: "POST",
				url: "/threads",
				payload: requestPayload,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(400);
			expect(responseJson.status).toEqual("fail");
			expect(responseJson.message).toEqual(
				"tidak dapat membuat thread baru karena tipe data tidak sesuai"
			);
		});

		it("should response 400 when title more than 60 character", async () => {
			const requestPayload = {
				title:
					"dicodingindonesiadicodingindonesiadicodingindonesiadicodingindonesia",
				body: "Dicoding is the best!",
			};
			const accessToken = await ServerTestHelper.getAccessToken();
			const server = await createServer(container);

			const response = await server.inject({
				method: "POST",
				url: "/threads",
				payload: requestPayload,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(400);
			expect(responseJson.status).toEqual("fail");
			expect(responseJson.message).toEqual(
				"tidak dapat membuat thread baru karena karakter title melebihi batas limit"
			);
		});
	});

	describe("when GET /threads", () => {
		it("should response 404 when thread could not be found", async () => {
			const server = await createServer(container);
			const response = await server.inject({
				method: "GET",
				url: "/threads/thread-321",
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(404);
			expect(responseJson.status).toEqual("fail");
			expect(responseJson.message).toEqual("Thread tidak bisa ditemukan");
		});

		it("should response 400 when thread is found", async () => {
			await UsersTableTestHelper.addUser({ id: "user-123" });
			await ThreadTableTestHelper.addThread({ id: "thread-321" });
			await CommentsTableTestHelper.addComment({ id: "comment01" });
			await CommentsTableTestHelper.addComment({
				id: "comment02",
				isDelete: true,
			});
			const server = await createServer(container);
			const response = await server.inject({
				method: "GET",
				url: "/threads/thread-321",
			});

			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(200);
			expect(responseJson.status).toEqual("success");
			expect(responseJson.message).toEqual(
				"gagal membuat detail thread baru karena tipe data tidak sesuai"
			);
		});
	});
});
