const AddedThread = require("../AddedThread");

describe("a AddedThread entities", () => {
	it("should throw error when payload did not contain needed properties", () => {
		const payload = {
			title: "abc",
			owner: "user-123",
		};

		expect(() => new AddedThread(payload)).toThrowError(
			"ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
		);
	});

	it("should throw error when payload did not meet data type specification", () => {
		const payload = {
			id: "thread-h_W1Plfpj0TY7wyT2PUPX",
			title: true,
			owner: "user-123",
		};

		expect(() => new AddedThread(payload)).toThrowError(
			"ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
		);
	});

	it("should create AddedThread object correctly", () => {
		const payload = {
			id: "thread-h_W1Plfpj0TY7wyT2PUPX",
			title: "Dicoding",
			owner: "user-123",
		};

		const addedThread = new AddedThread(payload);

		expect(addedThread.id).toEqual(payload.id);
		expect(addedThread.title).toEqual(payload.title);
		expect(addedThread.owner).toEqual(payload.owner);
	});
});
