const { Pool } = require("pg");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");

jest.mock("pg"); // Mocking the pg module

describe("CommentRepositoryPostgres", () => {
	let commentRepository;
	let mockPool;
	let mockIdGenerator;

	beforeEach(() => {
		mockPool = {
			query: jest.fn(),
		};
		mockIdGenerator = jest.fn().mockReturnValue("123");
		commentRepository = new CommentRepositoryPostgres(
			mockPool,
			mockIdGenerator
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("addComment", () => {
		it("should add a new comment and return an AddedComment instance", async () => {
			// Arrange
			const newComment = {
				content: "This is a comment",
				owner: "user-1",
				threadId: "thread-1",
			};
			const mockResult = {
				rows: [
					{ id: "comment-123", content: "This is a comment", owner: "user-1" },
				],
			};
			mockPool.query.mockResolvedValue(mockResult);

			// Action
			const result = await commentRepository.addComment(newComment);

			// Assert
			expect(mockPool.query).toHaveBeenCalledWith(
				expect.objectContaining({
					text: "INSERT INTO comments VALUES($1, $2, NOW(), $3, $4, $5) RETURNING id, content, owner",
					values: [
						"comment-123",
						"user-1",
						"This is a comment",
						false,
						"thread-1",
					],
				})
			);
			expect(result).toBeInstanceOf(AddedComment);
			expect(result.id).toBe("comment-123");
			expect(result.content).toBe("This is a comment");
		});
	});

	describe("findCommentById", () => {
		it("should throw NotFoundError when comment is not found", async () => {
			// Arrange
			const commentId = "comment-123";
			mockPool.query.mockResolvedValue({ rowCount: 0 });

			// Action & Assert
			await expect(
				commentRepository.findCommentById(commentId)
			).rejects.toThrowError(NotFoundError);
			await expect(
				commentRepository.findCommentById(commentId)
			).rejects.toThrowError("Komentar tidak bisa ditemukan");
		});

		it("should not throw error when comment is found", async () => {
			// Arrange
			const commentId = "comment-123";
			const mockResult = { rowCount: 1 };
			mockPool.query.mockResolvedValue(mockResult);

			// Action & Assert
			await expect(
				commentRepository.findCommentById(commentId)
			).resolves.not.toThrow();
		});
	});

	describe("verifyCommentAccess", () => {
		it("should throw AuthorizationError if comment access is not authorized", async () => {
			// Arrange
			const commentId = "comment-123";
			const owner = "user-1";
			mockPool.query.mockResolvedValue({ rowCount: 0 });

			// Action & Assert
			await expect(
				commentRepository.verifyCommentAccess(commentId, owner)
			).rejects.toThrowError(AuthorizationError);
			await expect(
				commentRepository.verifyCommentAccess(commentId, owner)
			).rejects.toThrowError("User tidak dapat mengakses komentar");
		});

		it("should not throw error if comment access is authorized", async () => {
			// Arrange
			const commentId = "comment-123";
			const owner = "user-1";
			const mockResult = { rowCount: 1 };
			mockPool.query.mockResolvedValue(mockResult);

			// Action & Assert
			await expect(
				commentRepository.verifyCommentAccess(commentId, owner)
			).resolves.not.toThrow();
		});
	});

	describe("deleteComment", () => {
		it("should update comment as deleted", async () => {
			// Arrange
			const commentId = "comment-123";
			mockPool.query.mockResolvedValue({});

			// Action
			await commentRepository.deleteComment(commentId);

			// Assert
			expect(mockPool.query).toHaveBeenCalledWith({
				text: "UPDATE comments SET is_delete = true WHERE id = $1",
				values: [commentId],
			});
		});
	});

	describe("getCommentsByThreadId", () => {
		it("should return an array of comments", async () => {
			// Arrange
			const threadId = "thread-1";
			const mockResult = {
				rows: [
					{
						id: "comment-123",
						username: "user-1",
						date: "2025-01-21",
						content: "This is a comment",
						is_delete: false,
					},
				],
			};
			mockPool.query.mockResolvedValue(mockResult);

			// Action
			const result = await commentRepository.getCommentsByThreadId(threadId);

			// Assert
			expect(result).toEqual(mockResult.rows);
			expect(mockPool.query).toHaveBeenCalledWith({
				text: "SELECT c.id, u.username, c.date, c.content, c.is_delete FROM comments c INNER JOIN users u on c.owner = u.id WHERE c.thread_id = $1 ORDER BY c.date ASC",
				values: [threadId],
			});
		});
	});
});
