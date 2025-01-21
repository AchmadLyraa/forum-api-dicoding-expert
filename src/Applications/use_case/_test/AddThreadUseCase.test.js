const AddThreadUseCase = require("../AddThreadUseCase");
const NewThread = require("../../../Domains/threads/entities/NewThread");

describe("AddThreadUseCase", () => {
	it("should orchestrate the add thread action correctly", async () => {
		// Arrange
		const useCasePayload = {
			title: "Thread Title",
			body: "Thread Body",
			owner: "user-123",
		};

		const expectedThread = {
			id: "thread-123",
			title: useCasePayload.title,
			body: useCasePayload.body,
			owner: useCasePayload.owner,
		};

		// Mocking dependencies
		const mockThreadRepository = {
			addThread: jest.fn(() => Promise.resolve(expectedThread)),
		};

		const addThreadUseCase = new AddThreadUseCase({
			threadRepository: mockThreadRepository,
		});

		// Action
		const result = await addThreadUseCase.execute(useCasePayload);

		// Assert
		expect(mockThreadRepository.addThread).toBeCalledWith(
			new NewThread(useCasePayload)
		);
		expect(result).toEqual(expectedThread);
	});

	it("should throw an error when useCasePayload is invalid", async () => {
		// Arrange
		const useCasePayload = {
			title: null, // Invalid title
			body: "Thread Body",
			owner: "user-123",
		};

		const mockThreadRepository = {
			addThread: jest.fn(),
		};

		const addThreadUseCase = new AddThreadUseCase({
			threadRepository: mockThreadRepository,
		});

		// Action and Assert
		await expect(addThreadUseCase.execute(useCasePayload)).rejects.toThrowError(
			"NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
		);
		expect(mockThreadRepository.addThread).not.toBeCalled();
	});
});
