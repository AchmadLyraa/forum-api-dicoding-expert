const DeleteCommentUseCase = require("../DeleteCommentUseCase");

describe("DeleteCommentUseCase", () => {
  describe("execute", () => {
    it("should orchestrate the delete comment action correctly", async () => {
      // Arrange
      const useCasePayload = {
        threadId: "thread-123",
        commentId: "comment-123",
        owner: "user-123",
      };

      // Stub tracking variables
      let threadIdArg;
      let commentIdArg;
      let accessArgs;
      let deletedId;
      
      const threadRepositoryStub = {
        async findThreadById(id) {
          threadIdArg = id;
          return { id, title: "dummy" };
        }
      };
      const commentRepositoryStub = {
        async findCommentById(id) {
          commentIdArg = id;
          return {
            id,
            owner: "user-123",
            date: "2021-01-01T00:00:00.000Z",
            content: "some comment",
            is_delete: false,
            thread_id: "thread-123",
          };
        },
        async verifyCommentAccess(commentId, owner) {
          accessArgs = { commentId, owner };
        },
        async deleteComment(id) {
          deletedId = id;
        }
      };

      const useCase = new DeleteCommentUseCase({
        commentRepository: commentRepositoryStub,
        threadRepository: threadRepositoryStub,
      });

      // Action
      await useCase.execute(useCasePayload);

      // Assert
      expect(threadIdArg).toBe(useCasePayload.threadId);
      expect(commentIdArg).toBe(useCasePayload.commentId);
      expect(accessArgs).toEqual({
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      });
      expect(deletedId).toBe(useCasePayload.commentId);
    });

    it("should throw an error when thread does not exist", async () => {
      // Arrange
      const useCasePayload = {
        threadId: "thread-123",
        commentId: "comment-123",
        owner: "user-123",
      };

      const threadRepositoryStub = {
        async findThreadById() {
          throw new Error("Thread tidak bisa ditemukan");
        }
      };
      let commentCalled = false;
      let accessCalled = false;
      let deleteCalled = false;
      const commentRepositoryStub = {
        async findCommentById() { commentCalled = true; },
        async verifyCommentAccess() { accessCalled = true; },
        async deleteComment() { deleteCalled = true; }
      };

      const useCase = new DeleteCommentUseCase({
        commentRepository: commentRepositoryStub,
        threadRepository: threadRepositoryStub,
      });

      // Action & Assert
      await expect(useCase.execute(useCasePayload))
        .rejects.toThrow("Thread tidak bisa ditemukan");
      expect(commentCalled).toBe(false);
      expect(accessCalled).toBe(false);
      expect(deleteCalled).toBe(false);
    });

    it("should throw an error when comment does not exist", async () => {
      // Arrange
      const useCasePayload = {
        threadId: "thread-123",
        commentId: "comment-123",
        owner: "user-123",
      };

      let threadCalled = false;
      const threadRepositoryStub = {
        async findThreadById() { 
          threadCalled = true; 
          return { id: "thread-123", title: "dummy" };
        }
      };
      let commentCalled = false;
      const commentRepositoryStub = {
        async findCommentById() {
          commentCalled = true;
          throw new Error("Komentar tidak bisa ditemukan");
        },
        async verifyCommentAccess() {},
        async deleteComment() {}
      };

      const useCase = new DeleteCommentUseCase({
        commentRepository: commentRepositoryStub,
        threadRepository: threadRepositoryStub,
      });

      // Action & Assert
      await expect(useCase.execute(useCasePayload))
        .rejects.toThrow("Komentar tidak bisa ditemukan");
      expect(threadCalled).toBe(true);
      expect(commentCalled).toBe(true);
    });

    it("should throw an error when user does not have access to delete the comment", async () => {
      // Arrange
      const useCasePayload = {
        threadId: "thread-123",
        commentId: "comment-123",
        owner: "user-123",
      };

      let threadCalled = false;
      const threadRepositoryStub = {
        async findThreadById() { 
          threadCalled = true; 
          return { id: "thread-123", title: "dummy" };
        }
      };
      let commentCalled = false;
      const commentRepositoryStub = {
        async findCommentById() { 
          commentCalled = true; 
          return {
            id: "comment-123",
            owner: "user-123",
            date: "2021-01-01T00:00:00.000Z",
            content: "some comment",
            is_delete: false,
            thread_id: "thread-123",
          };
        },
        async verifyCommentAccess() {
          throw new Error("User tidak dapat mengakses komentar");
        },
        async deleteComment() {}
      };

      const useCase = new DeleteCommentUseCase({
        commentRepository: commentRepositoryStub,
        threadRepository: threadRepositoryStub,
      });

      // Action & Assert
      await expect(useCase.execute(useCasePayload))
        .rejects.toThrow("User tidak dapat mengakses komentar");
      expect(threadCalled).toBe(true);
      expect(commentCalled).toBe(true);
    });
  });
});