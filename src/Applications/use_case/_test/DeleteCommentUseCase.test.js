const DeleteCommentUseCase = require("../DeleteCommentUseCase");

describe("DeleteCommentUseCase", () => {
	it("should orchestrate the delete comment action correctly", async () => {
		// Arrange
		const useCasePayload = {
			threadId: "thread-123",
			commentId: "comment-123",
			owner: "user-123",
		};

		const mockThreadRepository = {
			findThreadById: jest.fn(() => Promise.resolve()),
		};

		const mockCommentRepository = {
			findCommentById: jest.fn(() => Promise.resolve()),
			verifyCommentAccess: jest.fn(() => Promise.resolve()),
			deleteComment: jest.fn(() => Promise.resolve()),
		};

		const deleteCommentUseCase = new DeleteCommentUseCase({
			commentRepository: mockCommentRepository,
			threadRepository: mockThreadRepository,
		});

		// Action
		await deleteCommentUseCase.execute(useCasePayload);

		// Assert
		expect(mockThreadRepository.findThreadById).toBeCalledWith("thread-123");
		expect(mockCommentRepository.findCommentById).toBeCalledWith("comment-123");
		expect(mockCommentRepository.verifyCommentAccess).toBeCalledWith(
			"comment-123",
			"user-123"
		);
		expect(mockCommentRepository.deleteComment).toBeCalledWith("comment-123");
	});

	it("should throw an error when thread does not exist", async () => {
		// Arrange
		const useCasePayload = {
			threadId: "thread-123",
			commentId: "comment-123",
			owner: "user-123",
		};

		const mockThreadRepository = {
			findThreadById: jest.fn(() =>
				Promise.reject(new Error("THREAD_NOT_FOUND"))
			),
		};

		const mockCommentRepository = {
			findCommentById: jest.fn(),
			verifyCommentAccess: jest.fn(),
			deleteComment: jest.fn(),
		};

		const deleteCommentUseCase = new DeleteCommentUseCase({
			commentRepository: mockCommentRepository,
			threadRepository: mockThreadRepository,
		});

		// Action and Assert
		await expect(
			deleteCommentUseCase.execute(useCasePayload)
		).rejects.toThrowError("THREAD_NOT_FOUND");
		expect(mockThreadRepository.findThreadById).toBeCalledWith("thread-123");
		expect(mockCommentRepository.findCommentById).not.toBeCalled();
		expect(mockCommentRepository.verifyCommentAccess).not.toBeCalled();
		expect(mockCommentRepository.deleteComment).not.toBeCalled();
	});

	it("should throw an error when comment does not exist", async () => {
		// Arrange
		const useCasePayload = {
			threadId: "thread-123",
			commentId: "comment-123",
			owner: "user-123",
		};

		const mockThreadRepository = {
			findThreadById: jest.fn(() => Promise.resolve()),
		};

		const mockCommentRepository = {
			findCommentById: jest.fn(() =>
				Promise.reject(new Error("COMMENT_NOT_FOUND"))
			),
			verifyCommentAccess: jest.fn(),
			deleteComment: jest.fn(),
		};

		const deleteCommentUseCase = new DeleteCommentUseCase({
			commentRepository: mockCommentRepository,
			threadRepository: mockThreadRepository,
		});

		// Action and Assert
		await expect(
			deleteCommentUseCase.execute(useCasePayload)
		).rejects.toThrowError("COMMENT_NOT_FOUND");
		expect(mockThreadRepository.findThreadById).toBeCalledWith("thread-123");
		expect(mockCommentRepository.findCommentById).toBeCalledWith("comment-123");
		expect(mockCommentRepository.verifyCommentAccess).not.toBeCalled();
		expect(mockCommentRepository.deleteComment).not.toBeCalled();
	});

	it("should throw an error when user does not have access to delete the comment", async () => {
		// Arrange
		const useCasePayload = {
			threadId: "thread-123",
			commentId: "comment-123",
			owner: "user-123",
		};

		const mockThreadRepository = {
			findThreadById: jest.fn(() => Promise.resolve()),
		};

		const mockCommentRepository = {
			findCommentById: jest.fn(() => Promise.resolve()),
			verifyCommentAccess: jest.fn(() =>
				Promise.reject(new Error("FORBIDDEN_ACCESS"))
			),
			deleteComment: jest.fn(),
		};

		const deleteCommentUseCase = new DeleteCommentUseCase({
			commentRepository: mockCommentRepository,
			threadRepository: mockThreadRepository,
		});

		// Action and Assert
		await expect(
			deleteCommentUseCase.execute(useCasePayload)
		).rejects.toThrowError("FORBIDDEN_ACCESS");
		expect(mockThreadRepository.findThreadById).toBeCalledWith("thread-123");
		expect(mockCommentRepository.findCommentById).toBeCalledWith("comment-123");
		expect(mockCommentRepository.verifyCommentAccess).toBeCalledWith(
			"comment-123",
			"user-123"
		);
		expect(mockCommentRepository.deleteComment).not.toBeCalled();
	});
});
