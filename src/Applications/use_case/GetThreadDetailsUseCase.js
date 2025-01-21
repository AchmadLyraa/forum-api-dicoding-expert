const ThreadDetails = require("../../Domains/threads/entities/ThreadDetails");
const CommentDetails = require("../../Domains/comments/entities/CommentDetails");

class GetThreadDetailsUseCase {
	constructor({ threadRepository, commentRepository }) {
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
	}

	async execute(threadId) {
		//Validasi keadaan thread
		const thread = await this._threadRepository.getThreadById(threadId);
		if (!thread) {
			throw new Error("THREAD_NOT_FOUND");
		}
		// Ambil komentar yang terkait
		const rawComments = await this._commentRepository.getCommentsByThreadId(
			threadId
		);

		// Mapping comments
		// const mappedComments = rawComments.map((comment) => {
		// 	return {
		// 		id: comment.id,
		// 		owner: comment.owner,
		// 		date: comment.date,
		// 		content: comment.content,
		// 	};
		// });

		// Format komentar
		const formattedComments = rawComments
			.map((comment) => ({
				id: comment.id,
				username: comment.username,
				date: comment.date,
				content: comment.is_delete
					? "**komentar telah dihapus**"
					: comment.content,
			}))
			.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort ascending

		// Buat instance ThreadDetails
		const threadDetails = new ThreadDetails({
			id: thread.id,
			title: thread.title,
			body: thread.body,
			date: thread.date,
			username: thread.username,
		});

		// Create comment details
		// const commentDetails = new CommentDetails(mappedComments);

		// Create the thread details
		// const threadDetails = new ThreadDetails({ ...thread });

		// Merge thread details with comments
		// const fullDetails = { ...threadDetails, ...commentDetails };
		// return fullDetails;
		// Gabungkan data thread dengan komentar
		return {
			...threadDetails,
			comments: formattedComments,
		};
	}
}

module.exports = GetThreadDetailsUseCase;
