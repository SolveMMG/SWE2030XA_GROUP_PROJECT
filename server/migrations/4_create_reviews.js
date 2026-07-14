exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('reviews', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    reviewer_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    reviewee_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    listing_id: {
      type: 'uuid',
      notNull: false,
      references: '"listings"',
      onDelete: 'SET NULL',
    },
    rating: {
      type: 'smallint',
      notNull: true,
    },
    comment: {
      type: 'text',
      notNull: false,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // Enforce rating range 1–5
  pgm.addConstraint('reviews', 'reviews_rating_range', 'CHECK (rating >= 1 AND rating <= 5)');

  // A user cannot review the same person more than once per listing
  pgm.addConstraint(
    'reviews',
    'reviews_unique_per_listing',
    'UNIQUE (reviewer_id, reviewee_id, listing_id)'
  );

  pgm.createIndex('reviews', 'reviewee_id');
  pgm.createIndex('reviews', 'reviewer_id');
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('reviews');
};
