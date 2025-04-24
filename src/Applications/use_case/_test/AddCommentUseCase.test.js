const AddCommentUseCase = require("../AddCommentUseCase");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");

describe("AddCommentUseCase", () => {
  it("should orchestrate the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      content: "This is a comment",
      owner: "user-123",
    };

    // Expected result - what we expect to get back after processing
    const expectedComment = {
      id: "comment-123",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    // Mocking dependencies - different object from expectedComment
    const mockCommentRepository = {
      addComment: jest.fn(() => Promise.resolve(
        new AddedComment({
          id: "comment-123", 
          content: "This is a comment", 
          owner: "user-123"
        })
      )),
    };

    const mockThreadRepository = {
      findThreadById: jest.fn(() => Promise.resolve({
        id: "thread-123",
        title: "Thread Title"
      })),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const result = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.findThreadById).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new NewComment(useCasePayload)
    );
    expect(result).toEqual(expectedComment);
  });

  it("should throw an error when the thread is not found", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      content: "This is a comment",
      owner: "user-123",
    };

    const mockCommentRepository = {
      addComment: jest.fn(),
    };

    const mockThreadRepository = {
      findThreadById: jest.fn(() =>
        Promise.reject(new Error("Thread not found"))
      ),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(
      addCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError("Thread not found");
    expect(mockThreadRepository.findThreadById).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.addComment).not.toBeCalled();
  });
});