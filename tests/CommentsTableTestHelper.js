/* istanbul ignore file */

/* eslint-disable object-curly-newline */
const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentsTableTestHelper = {
	async addComment({
		id = "comment-123",
		owner = "user-123",
		content = "this is a comment!",
		threadId = "thread-321",
		isDelete = false,
		date = "NOW()",
	}) {
		const query = {
			text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)",
			values: [id, owner, date, content, isDelete, threadId],
		};

		await pool.query(query);
	},

	async findCommentById(id) {
		const query = {
			text: "SELECT * FROM  comments WHERE id = $1",
			values: [id],
		};

		const result = await pool.query(query);
		return result.rows;
	},

	async getLikeCount(id) {
		const query = {
			text: "SELECT * FROM comments WHERE id = $1",
			values: [id],
		};

		const result = await pool.query(query);

		return result.rows[0].like_count;
	},

	async cleanTable() {
		await pool.query("TRUNCATE TABLE comments CASCADE");
	},
};

module.exports = CommentsTableTestHelper;
