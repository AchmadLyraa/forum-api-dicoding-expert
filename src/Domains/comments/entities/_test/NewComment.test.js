const NewComment = require("../NewComment");

describe("NewComment", () => {
	it("should throw error if payload does not contain needed property", () => {
		const invalidPayload = {
			content: "This is a comment", // Missing `owner` and `threadId`
		};

		expect(() => new NewComment(invalidPayload)).toThrowError(
			"NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
		);
	});

	it("should throw error if payload does not meet data type specification", () => {
		const invalidPayload = {
			content: "This is a comment",
			owner: 123, // `owner` should be a string
			threadId: "thread-1",
		};

		expect(() => new NewComment(invalidPayload)).toThrowError(
			"NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
		);
	});

	it("should create instance successfully when payload meets the specification", () => {
		const validPayload = {
			content: "This is a comment",
			owner: "user1",
			threadId: "thread-1",
		};

		const newComment = new NewComment(validPayload);

		expect(newComment).toEqual({
			content: "This is a comment",
			owner: "user1",
			threadId: "thread-1",
		});
	});
});
