const CommentRepository = require("../CommentRepository");

describe("CommentRepository interface", () => {
	it("should throw error when invoke unimplemented method", async () => {
		// Arrange
		const commentRepository = new CommentRepository();

		// Action & Assert
		await expect(commentRepository.addComment({})).rejects.toThrowError(
			"COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
		);
		await expect(commentRepository.deleteComment("")).rejects.toThrowError(
			"COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
		);
		await expect(
			commentRepository.verifyCommentAccess("", "")
		).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
		await expect(commentRepository.findCommentById("")).rejects.toThrowError(
			"COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
		);
		await expect(
			commentRepository.getCommentsByThreadId("")
		).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
	});
});
