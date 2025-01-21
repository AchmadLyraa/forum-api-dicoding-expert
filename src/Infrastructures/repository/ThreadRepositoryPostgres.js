const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");
const AddedThread = require("../../Domains/threads/entities/AddedThread");

class ThreadRepositoryPostgres extends ThreadRepository {
	constructor(pool, idGenerator) {
		super();
		this._pool = pool;
		this._idGenerator = idGenerator;
	}

	async addThread(newThread) {
		const { title, body, owner } = newThread;
		const id = `thread-${this._idGenerator()}`;

		const query = {
			text: "INSERT INTO threads VALUES($1, $2, $3, NOW(), $4) RETURNING id, title, owner",
			values: [id, title, body, owner],
		};

		const result = await this._pool.query(query);

		return new AddedThread(result.rows[0]);
	}

	async findThreadById(id) {
		const query = {
			text: "SELECT id, title FROM  threads WHERE id = $1",
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new NotFoundError("Thread tidak bisa ditemukan");
		}

		return result.rows[0];
	}

	async getThreadById(id) {
		const query = {
			text: "SELECT threads.id, threads.title, threads.body, threads.date, users.username FROM threads INNER JOIN users ON threads.owner = users.id WHERE threads.id = $1",
			// text: "SELECT id, title, body, date, username FROM threads WHERE id = $1",
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rowCount) {
			throw new NotFoundError("Thread tidak bisa ditemukan");
		}

		return result.rows[0];
	}
}

module.exports = ThreadRepositoryPostgres;
