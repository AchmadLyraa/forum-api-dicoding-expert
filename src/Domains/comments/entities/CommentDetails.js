class CommentDetails {
	constructor(payload) {
		this.comments = payload.map((comment) => {
			this._verifyPayload(comment);

			const newComment = {
				id: comment.id,
				username: comment.username,
				date: comment.date,
				content: comment.content,
			};

			if (comment.is_delete) {
				newComment.content = "**komentar telah dihapus**";
			}

			return newComment;
		});
	}

	_verifyPayload({ id, username, date, content, is_delete }) {
		if (!id || !username || !date || !content || is_delete === undefined) {
			throw new Error("COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY");
		}

		if (
			typeof id !== "string" ||
			typeof username !== "string" ||
			typeof date !== "object" ||
			typeof content !== "string" ||
			typeof is_delete !== "boolean"
		) {
			throw new Error("COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION");
		}
	}
}

module.exports = CommentDetails;
