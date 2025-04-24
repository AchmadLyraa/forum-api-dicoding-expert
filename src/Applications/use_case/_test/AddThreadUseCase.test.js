// AddThreadUseCase.test.js
const AddThreadUseCase = require("../AddThreadUseCase");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");

describe("AddThreadUseCase", () => {
  it("should orchestrate the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "Thread Title",
      body: "Thread Body",
      owner: "user-123",
    };

    const mockAddedThread = new AddedThread({
      id: "thread-123",
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = {
      addThread: jest.fn(() => Promise.resolve(
        new AddedThread({
          id: "thread-123", 
          title: "Thread Title",
          owner: "user-123",
        })
      )),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const result = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.addThread).toBeCalledTimes(1);
    expect(mockThreadRepository.addThread).toBeCalledWith(
      expect.objectContaining({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      })
    );
    expect(result).toStrictEqual(mockAddedThread);
  });

  it("should throw an error when useCasePayload is invalid", async () => {
    // Arrange: invalid title
    const useCasePayload = {
      title: null,
      body: "Thread Body",
      owner: "user-123",
    };

    const mockThreadRepository = {
      addThread: jest.fn(),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrow("NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY");
    expect(mockThreadRepository.addThread).not.toBeCalled();
  });
});

