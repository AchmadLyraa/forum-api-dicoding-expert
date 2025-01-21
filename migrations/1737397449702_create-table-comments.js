exports.shorthands = undefined;

exports.up = (pgm) => {
	// Create the 'comments' table
	pgm.createTable("comments", {
		id: {
			type: "VARCHAR(50)",
			primaryKey: true,
		},
		owner: {
			type: "VARCHAR(50)",
			notNull: true,
		},
		date: {
			type: "TIMESTAMP WITH TIME ZONE",
			notNull: true,
		},
		content: {
			type: "TEXT",
			notNull: true,
		},
		is_delete: {
			type: "BOOLEAN",
			notNull: true,
		},
	});

	// Add foreign key constraint for owner referencing users table
	pgm.addConstraint(
		"comments",
		"fk_comments.owner_users.id",
		"FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE"
	);

	// Add thread_id column and foreign key constraint
	pgm.addColumn("comments", {
		thread_id: {
			type: "VARCHAR(50)",
		},
	});

	pgm.addConstraint(
		"comments",
		"fk_comments.thread_id_threads.id",
		"FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE"
	);
};

exports.down = (pgm) => {
	// Drop the 'comments' table
	pgm.dropTable("comments");
};
