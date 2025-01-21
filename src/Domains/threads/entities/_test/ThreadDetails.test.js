const ThreadDetails = require("../ThreadDetails");

describe("ThreadDetails", () => {
	it("should throw error if payload does not contain needed property", () => {
		const invalidPayload = {
			id: "thread-1",
			title: "Thread title",
			body: "Thread body",
			// Missing `username`
			date: new Date("2025-01-21"),
		};

		expect(() => new ThreadDetails(invalidPayload)).toThrowError(
			"THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY"
		);
	});

	it("should throw error if payload does not meet data type specification", () => {
		const invalidPayload = {
			id: "thread-1",
			title: "Thread title",
			body: "Thread body",
			date: "invalid-date", // Invalid date
			username: 123, // `username` should be a string
		};

		expect(() => new ThreadDetails(invalidPayload)).toThrowError(
			"THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION"
		);
	});

	it("should create instance successfully when payload meets the specification", () => {
		const validPayload = {
			id: "thread-1",
			title: "Thread title",
			body: "Thread body",
			date: new Date("2025-01-21"), // Date object
			username: "user1",
		};

		const threadDetails = new ThreadDetails(validPayload);

		expect(threadDetails).toEqual({
			id: "thread-1",
			title: "Thread title",
			body: "Thread body",
			date: new Date("2025-01-21"), // Validate Date object
			username: "user1",
		});
	});
});
