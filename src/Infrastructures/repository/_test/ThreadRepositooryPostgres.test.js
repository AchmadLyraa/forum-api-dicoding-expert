const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const { Pool } = require("pg");
const mockIdGenerator = jest.fn();
const pool = new Pool();

jest.mock("pg", () => ({
	Pool: jest.fn().mockImplementation(() => ({
		query: jest.fn(),
	})),
}));

describe("ThreadRepositoryPostgres", () => {
	let threadRepository;

	beforeEach(() => {
		threadRepository = new ThreadRepositoryPostgres(pool, mockIdGenerator);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("addThread", () => {
		it("should add a new thread and return AddedThread", async () => {
			const newThread = {
				title: "Thread Title",
				body: "Thread Body",
				owner: "user-1",
			};

			mockIdGenerator.mockReturnValueOnce("thread-123");
			pool.query.mockResolvedValueOnce({
				rows: [
					{
						id: "thread-123",
						title: "Thread Title",
						owner: "user-1",
					},
				],
			});

			const result = await threadRepository.addThread(newThread);

			expect(result).toEqual({
				id: "thread-123",
				title: "Thread Title",
				owner: "user-1",
			});
			expect(pool.query).toHaveBeenCalledWith({
				text: "INSERT INTO threads VALUES($1, $2, $3, NOW(), $4) RETURNING id, title, owner",
				values: ["thread-thread-123", "Thread Title", "Thread Body", "user-1"],
			});
		});
	});

	describe("findThreadById", () => {
		it("should return thread by ID", async () => {
			const threadId = "thread-123";
			pool.query.mockResolvedValueOnce({
				rowCount: 1,
				rows: [
					{
						id: "thread-123",
						title: "Thread Title",
					},
				],
			});

			const result = await threadRepository.findThreadById(threadId);

			expect(result).toEqual({
				id: "thread-123",
				title: "Thread Title",
			});
			expect(pool.query).toHaveBeenCalledWith({
				text: "SELECT id, title FROM  threads WHERE id = $1",
				values: [threadId],
			});
		});

		it("should throw NotFoundError if thread not found", async () => {
			const threadId = "thread-123";
			pool.query.mockResolvedValueOnce({
				rowCount: 0,
				rows: [],
			});

			await expect(threadRepository.findThreadById(threadId)).rejects.toThrow(
				NotFoundError
			);
		});
	});

	describe("getThreadById", () => {
		it("should return full thread details by ID", async () => {
			const threadId = "thread-123";
			pool.query.mockResolvedValueOnce({
				rowCount: 1,
				rows: [
					{
						id: "thread-123",
						title: "Thread Title",
						body: "Thread Body",
						date: "2025-01-01",
						username: "user1",
					},
				],
			});

			const result = await threadRepository.getThreadById(threadId);

			expect(result).toEqual({
				id: "thread-123",
				title: "Thread Title",
				body: "Thread Body",
				date: "2025-01-01",
				username: "user1",
			});
			expect(pool.query).toHaveBeenCalledWith({
				text: "SELECT threads.id, threads.title, threads.body, threads.date, users.username FROM threads INNER JOIN users ON threads.owner = users.id WHERE threads.id = $1",
				values: [threadId],
			});
		});

		it("should throw NotFoundError if thread not found", async () => {
			const threadId = "thread-123";
			pool.query.mockResolvedValueOnce({
				rowCount: 0,
				rows: [],
			});

			await expect(threadRepository.getThreadById(threadId)).rejects.toThrow(
				NotFoundError
			);
		});
	});
});
