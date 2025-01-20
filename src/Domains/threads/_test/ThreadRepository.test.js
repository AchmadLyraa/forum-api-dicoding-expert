const ThreadRepository = require("../ThreadRepository");

describe("ThreadRepository", () => {
	it("should throw error when invoking unimplemented addThread method", async () => {
		// Arrange
		const threadRepository = new ThreadRepository();

		// Action & Assert
		await expect(threadRepository.addThread({})).rejects.toThrowError(
			"THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED"
		);
	});

	it("should throw error when invoking unimplemented findThreadById method", async () => {
		// Arrange
		const threadRepository = new ThreadRepository();

		// Action & Assert
		await expect(
			threadRepository.findThreadById("thread-123")
		).rejects.toThrowError("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
	});

	it("should throw error when invoking unimplemented getThreadById method", async () => {
		// Arrange
		const threadRepository = new ThreadRepository();

		// Action & Assert
		await expect(
			threadRepository.getThreadById("thread-123")
		).rejects.toThrowError("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
	});
});
