const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");

class CommentRepositoryPostgres extends CommentRepository {
	constructor(pool, idGenerator) {
		super();
		this._pool = pool;
		this._idGenerator = idGenerator;
	}

	async addComment(newComment) {
		const { content, owner, threadId } = newComment;
		const id = `comment-${this._idGenerator()}`;

		const query = {
			text: "INSERT INTO comments VALUES($1, $2, NOW(), $3, $4, $5) RETURNING id, content, owner",
			values: [id, owner, content, false, threadId],
		};

		const result = await this._pool.query(query);

		return new AddedComment({ ...result.rows[0] });
	}

	async findCommentById(id) {
		const query = {
			text: "SELECT * FROM  comments WHERE id = $1",
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new NotFoundError("Komentar tidak bisa ditemukan");
		}
	}

	async verifyCommentAccess(id, owner) {
		const query = {
			text: "SELECT id, owner FROM  comments WHERE id = $1 AND owner = $2",
			values: [id, owner],
		};

		const result = await this._pool.query(query);
		if (!result.rowCount) {
			throw new AuthorizationError("User tidak dapat mengakses komentar");
		}
	}

	async deleteComment(id) {
		const query = {
			text: "UPDATE comments SET is_delete = true WHERE id = $1",
			values: [id],
		};

		await this._pool.query(query);
	}

	async getCommentsByThreadId(id) {
		const query = {
			text: "SELECT c.id, u.username, c.date, c.content, c.is_delete FROM comments c INNER JOIN users u on c.owner = u.id WHERE c.thread_id = $1 ORDER BY c.date ASC",
			// text: 'SELECT id, username, date, content, is_delete AS "isDelete" FROM comments WHERE thread_id = $1',
			values: [id],
		};

		const result = await this._pool.query(query);

		return result.rows;
	}
}

module.exports = CommentRepositoryPostgres;
