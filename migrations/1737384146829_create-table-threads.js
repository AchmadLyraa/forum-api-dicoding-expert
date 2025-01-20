/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.createTable("threads", {
		id: {
			type: "VARCHAR(50)",
			primaryKey: true,
		},
		title: {
			type: "VARCHAR(60)",
			notNull: true,
		},
		body: {
			type: "TEXT",
			notNull: true,
		},
		date: {
			type: "TIMESTAMP WITH TIME ZONE", // Kolom tanggal dengan zona waktu
			notNull: true,
		},
		owner: {
			type: "VARCHAR(50)",
			notNull: true,
		},
	});

	// Menambahkan foreign key pada kolom 'owner' yang merujuk ke kolom 'id' di tabel 'users'
	pgm.addConstraint(
		"threads",
		"fk_threads.owner_users.id",
		"FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE"
	);
};

exports.down = (pgm) => {
	pgm.dropTable("threads");
};
