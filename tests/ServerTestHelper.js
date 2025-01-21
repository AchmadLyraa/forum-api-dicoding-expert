/* istanbul ignore file */

const Jwt = require("@hapi/jwt");
const UsersTableTestHelper = require("./UsersTableTestHelper");
const pool = require("../src/Infrastructures/database/postgres/pool");
const ServerTestHelper = {
	async getAccessToken() {
		const payload = {
			id: "user-123",
			username: "dicoding",
			password: "secret",
			fullname: "Dicoding Indonesia",
		};

		await UsersTableTestHelper.addUser(payload);
		return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
	},

	async addComment({
		id = "comment-123",
		content = "A comment",
		owner = "user-123",
		threadId = "thread-123",
		is_delete = false,
	}) {
		// Insert a thread if it doesn't exist
		await pool.query(
			`INSERT INTO threads (id, title, body, owner, date) 
         VALUES ($1, $2, $3, $4, NOW()) 
         ON CONFLICT (id) DO NOTHING`,
			[threadId, "Sample Title", "Sample Body", owner]
		);

		// Insert the comment
		await pool.query(
			`INSERT INTO comments (id, content, owner, thread_id, is_delete, date) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
			[id, content, owner, threadId, is_delete]
		);
	},

	async cleanTable() {
		await pool.query(
			"TRUNCATE TABLE users, authentications, threads, comments CASCADE"
		);
	},
};

module.exports = ServerTestHelper;
