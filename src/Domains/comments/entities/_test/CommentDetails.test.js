const CommentDetails = require("../CommentDetails");

describe("CommentDetails", () => {
	it("should throw error if payload does not contain needed property", () => {
		const invalidPayload = [
			{ id: "1", username: "user1", date: new Date(), content: "Test content" }, // missing `is_delete`
		];

		expect(() => new CommentDetails(invalidPayload)).toThrowError(
			"COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY"
		);
	});

	it("should throw error if payload does not meet data type specification", () => {
		const invalidPayload = [
			{
				id: "1",
				username: "user1",
				date: "2022-01-01",
				content: "Test content",
				is_delete: "true",
			}, // `date` is not a Date object and `is_delete` is a string
		];

		expect(() => new CommentDetails(invalidPayload)).toThrowError(
			"COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION"
		);
	});

	it("should return comments in the correct format", () => {
		const validPayload = [
			{
				id: "1",
				username: "user1",
				date: new Date(),
				content: "Test content",
				is_delete: false,
			},
			{
				id: "2",
				username: "user2",
				date: new Date(),
				content: "Deleted comment",
				is_delete: true,
			},
		];

		const commentDetails = new CommentDetails(validPayload);

		expect(commentDetails.comments).toEqual([
			{
				id: "1",
				username: "user1",
				date: expect.any(Date),
				content: "Test content",
			},
			{
				id: "2",
				username: "user2",
				date: expect.any(Date),
				content: "**komentar telah dihapus**",
			},
		]);
	});
});
