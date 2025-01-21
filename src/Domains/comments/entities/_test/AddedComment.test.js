const AddedComment = require("../AddedComment");

describe("AddedComment", () => {
	it("should create AddedComment object correctly when given valid payload", () => {
		// Arrange
		const payload = {
			id: "comment-123",
			content: "This is a comment",
			owner: "user-123",
		};

		// Act
		const addedComment = new AddedComment(payload);

		// Assert
		expect(addedComment.id).toEqual(payload.id);
		expect(addedComment.content).toEqual(payload.content);
		expect(addedComment.owner).toEqual(payload.owner);
	});

	it("should throw error when payload does not contain needed property", () => {
		// Arrange
		const payload = {
			id: "comment-123",
			content: "This is a comment",
		}; // missing owner

		// Action and Assert
		expect(() => new AddedComment(payload)).toThrowError(
			"ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
		);
	});

	it("should throw error when payload does not meet data type specification", () => {
		// Arrange
		const payload = {
			id: 123, // should be string
			content: "This is a comment",
			owner: true, // should be string
		};

		// Action and Assert
		expect(() => new AddedComment(payload)).toThrowError(
			"ADDED_COMMENT.NOT_MEET_DATA_SPECIFICATION"
		);
	});
});
