class DeleteCommentUseCase {
	constructor({ commentRepository, threadRepository }) {
		this._commentRepository = commentRepository;
		this._threadRepository = threadRepository;
	}

	async execute(useCasePayload) {
		const { threadId, commentId, owner } = useCasePayload;
		await this._threadRepository.findThreadById(threadId);
		await this._commentRepository.findCommentById(commentId);
		await this._commentRepository.verifyCommentAccess(commentId, owner);
		await this._commentRepository.deleteComment(commentId);
	}
}

module.exports = DeleteCommentUseCase;
