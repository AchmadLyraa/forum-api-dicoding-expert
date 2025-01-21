const DeleteComment = require("../DeleteComment");

describe("DeleteComment", () => {
	it("should throw error if payload does not contain needed property", () => {
		const invalidPayload = {
			threadId: "thread-1", // Missing `commentId` and `owner`
		};

		expect(() => new DeleteComment(invalidPayload)).toThrowError(
			"DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
		);
	});

	it("should throw error if payload does not meet data type specification", () => {
		const invalidPayload = {
			threadId: "thread-1",
			commentId: "comment-1",
			owner: 123, // `owner` should be a string
		};

		expect(() => new DeleteComment(invalidPayload)).toThrowError(
			"DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
		);
	});

	it("should create instance successfully when payload meets the specification", () => {
		const validPayload = {
			threadId: "thread-1",
			commentId: "comment-1",
			owner: "user1",
		};

		const deleteComment = new DeleteComment(validPayload);

		expect(deleteComment).toEqual({
			threadId: "thread-1",
			commentId: "comment-1",
			owner: "user1",
		});
	});
});
