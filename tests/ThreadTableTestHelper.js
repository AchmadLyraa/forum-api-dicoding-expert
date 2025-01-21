/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const ThreadTableTestHelper = {
	// eslint-disable-next-line object-curly-newline
	async addThread({
		id = "thread-321",
		title = "Dicoding",
		body = "Dicoding is the best!",
		owner = "user-123",
		date = "NOW()",
	}) {
		const query = {
			text: "INSERT INTO threads VALUES($1, $2, $3, $4, $5)",
			values: [id, title, body, date, owner],
		};
		await pool.query(query);
	},

	async findThreadById(id) {
		const query = {
			text: "SELECT * FROM  threads WHERE id = $1",
			values: [id],
		};

		const result = await pool.query(query);
		return result.rows;
	},

	async cleanTable() {
		await pool.query("TRUNCATE TABLE threads CASCADE");
	},
};

module.exports = ThreadTableTestHelper;
