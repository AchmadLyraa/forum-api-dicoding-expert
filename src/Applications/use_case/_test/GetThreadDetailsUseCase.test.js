const GetThreadDetailsUseCase = require("../GetThreadDetailsUseCase");
const ThreadDetails = require("../../../Domains/threads/entities/ThreadDetails");

describe("GetThreadDetailsUseCase", () => {
	it("should orchestrate getting thread details correctly", async () => {
		// Arrange
		const threadId = "thread-123";
		const mockThread = {
			id: "thread-123",
			title: "Thread Title",
			body: "Thread body content",
			date: new Date("2025-01-21T10:00:00Z"),
			username: "user123",
		};
		const mockComments = [
			{
				id: "comment-123",
				username: "userA",
				date: new Date("2025-01-21T11:00:00Z"),
				content: "First comment",
				is_delete: false,
			},
			{
				id: "comment-124",
				username: "userB",
				date: new Date("2025-01-21T12:00:00Z"),
				content: "Second comment",
				is_delete: true,
			},
		];

		const expectedFormattedComments = [
			{
				id: "comment-123",
				username: "userA",
				date: new Date("2025-01-21T11:00:00Z"),
				content: "First comment",
			},
			{
				id: "comment-124",
				username: "userB",
				date: new Date("2025-01-21T12:00:00Z"),
				content: "**komentar telah dihapus**",
			},
		];

		const mockThreadRepository = {
			getThreadById: jest.fn(() => Promise.resolve(mockThread)),
		};

		const mockCommentRepository = {
			getCommentsByThreadId: jest.fn(() => Promise.resolve(mockComments)),
		};

		const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
			threadRepository: mockThreadRepository,
			commentRepository: mockCommentRepository,
		});

		// Action
		const result = await getThreadDetailsUseCase.execute(threadId);

		// Assert
		expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
		expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
			threadId
		);
		expect(result).toEqual({
			...new ThreadDetails(mockThread),
			comments: expectedFormattedComments,
		});
	});

	it("should throw an error when thread is not found", async () => {
		// Arrange
		const threadId = "thread-123";
		const mockThreadRepository = {
			getThreadById: jest.fn(() => Promise.resolve(null)),
		};

		const mockCommentRepository = {
			getCommentsByThreadId: jest.fn(),
		};

		const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
			threadRepository: mockThreadRepository,
			commentRepository: mockCommentRepository,
		});

		// Action & Assert
		await expect(
			getThreadDetailsUseCase.execute(threadId)
		).rejects.toThrowError("THREAD_NOT_FOUND");
		expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
		expect(mockCommentRepository.getCommentsByThreadId).not.toBeCalled();
	});

	it("should return thread details with no comments when thread exists but no comments", async () => {
		// Arrange
		const threadId = "thread-123";
		const mockThread = {
			id: "thread-123",
			title: "Thread Title",
			body: "Thread body content",
			date: new Date("2025-01-21T10:00:00Z"),
			username: "user123",
		};

		const mockThreadRepository = {
			getThreadById: jest.fn(() => Promise.resolve(mockThread)),
		};

		const mockCommentRepository = {
			getCommentsByThreadId: jest.fn(() => Promise.resolve([])),
		};

		const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
			threadRepository: mockThreadRepository,
			commentRepository: mockCommentRepository,
		});

		// Action
		const result = await getThreadDetailsUseCase.execute(threadId);

		// Assert
		expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
		expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
			threadId
		);
		expect(result).toEqual({
			...new ThreadDetails(mockThread),
			comments: [],
		});
	});
});
