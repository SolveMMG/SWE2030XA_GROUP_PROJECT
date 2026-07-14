require('dotenv').config();
const pool = require('./pool');

const CATEGORIES = ['design','programming','writing','tutoring','music','photography','other'];

const USERS = Array.from({ length: 10 }, (_, i) => ({
  google_id: `google_seed_${i + 1}`,
  name: ['Alice Mwangi','Bob Otieno','Carol Njeri','David Kamau','Eve Wanjiku',
         'Frank Ochieng','Grace Akinyi','Henry Mutua','Ivy Chebet','James Limo'][i],
  email: [`alice${i}@university.ac.ke`,`bob${i}@university.ac.ke`,`carol${i}@university.ac.ke`,
          `david${i}@university.ac.ke`,`eve${i}@university.ac.ke`,`frank${i}@university.ac.ke`,
          `grace${i}@university.ac.ke`,`henry${i}@university.ac.ke`,`ivy${i}@university.ac.ke`,
          `james${i}@university.ac.ke`][i],
  bio: `Hi, I\'m a university student passionate about sharing my skills.`,
  skills: [CATEGORIES[i % CATEGORIES.length], CATEGORIES[(i + 1) % CATEGORIES.length]],
}));

const LISTING_TEMPLATES = [
  { title: 'Logo Design', description: 'Professional logo design for your brand or project.', category: 'design', price: 1500 },
  { title: 'UI Mockups', description: 'Clean Figma mockups for web or mobile apps.', category: 'design', price: 2000 },
  { title: 'React Development', description: 'Build React components or full SPA for you.', category: 'programming', price: 3000 },
  { title: 'Python Scripting', description: 'Automate tasks or build data pipelines.', category: 'programming', price: 2500 },
  { title: 'Essay Proofreading', description: 'Thorough proofreading and grammar correction.', category: 'writing', price: 500 },
  { title: 'Blog Post Writing', description: 'SEO-friendly blog posts on any topic.', category: 'writing', price: 800 },
  { title: 'Math Tutoring', description: 'Calculus, algebra, and statistics help.', category: 'tutoring', price: 600 },
  { title: 'English Tutoring', description: 'Grammar, composition, and literature.', category: 'tutoring', price: 500 },
  { title: 'Guitar Lessons', description: 'Beginner to intermediate guitar lessons.', category: 'music', price: 700 },
  { title: 'Piano Lessons', description: 'Learn classical or contemporary piano.', category: 'music', price: 700 },
  { title: 'Portrait Photography', description: 'Professional portrait session on campus.', category: 'photography', price: 1200 },
  { title: 'Event Photography', description: 'Cover your event with quality photos.', category: 'photography', price: 2000 },
  { title: 'Data Entry', description: 'Fast and accurate data entry services.', category: 'other', price: 400 },
  { title: 'Video Editing', description: 'Edit and export your videos professionally.', category: 'other', price: 1800 },
  { title: 'Social Media Graphics', description: 'Eye-catching graphics for Instagram and Twitter.', category: 'design', price: 900 },
  { title: 'Node.js API', description: 'REST API with authentication and database.', category: 'programming', price: 3500 },
  { title: 'Research Paper Help', description: 'APA/MLA formatting and citation guidance.', category: 'writing', price: 600 },
  { title: 'Physics Tutoring', description: 'Mechanics, electricity, and waves.', category: 'tutoring', price: 650 },
  { title: 'Beat Production', description: 'Custom beats for your music project.', category: 'music', price: 1500 },
  { title: 'Product Photography', description: 'High-quality product shots with editing.', category: 'photography', price: 1500 },
  { title: 'CV/Resume Writing', description: 'Professional CV tailored to your field.', category: 'writing', price: 700 },
  { title: 'Chemistry Tutoring', description: 'Organic, inorganic, and physical chemistry.', category: 'tutoring', price: 600 },
  { title: 'WordPress Site', description: 'Set up and customise your WordPress site.', category: 'programming', price: 2800 },
  { title: 'Poster Design', description: 'Event and academic poster design.', category: 'design', price: 800 },
  { title: 'Voice Over', description: 'Clear and professional voice recordings.', category: 'other', price: 500 },
  { title: 'Infographic Design', description: 'Visual infographics for reports and presentations.', category: 'design', price: 1000 },
  { title: 'SQL Database Help', description: 'Schema design and query optimisation.', category: 'programming', price: 1200 },
  { title: 'Transcription', description: 'Audio to text transcription, fast turnaround.', category: 'other', price: 300 },
  { title: 'Violin Lessons', description: 'Beginner violin lessons, all ages welcome.', category: 'music', price: 800 },
  { title: 'Wedding Photography', description: 'Capture your special day beautifully.', category: 'photography', price: 5000 },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear data
    await client.query('DELETE FROM reviews');
    await client.query('DELETE FROM inquiries');
    await client.query('DELETE FROM listings');
    await client.query('DELETE FROM auth_tokens');
    await client.query("DELETE FROM users WHERE google_id LIKE 'google_seed_%'");

    // Insert users
    const userIds = [];
    for (const u of USERS) {
      const { rows } = await client.query(
        `INSERT INTO users (google_id, name, email, bio, skills)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [u.google_id, u.name, u.email, u.bio, u.skills]
      );
      userIds.push(rows[0].id);
    }

    // Insert listings (30 total, each assigned to a user)
    const listingIds = [];
    for (let i = 0; i < 30; i++) {
      const t = LISTING_TEMPLATES[i];
      const sellerId = userIds[i % userIds.length];
      const { rows } = await client.query(
        `INSERT INTO listings (seller_id, title, description, category, price)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [sellerId, t.title, t.description, t.category, t.price]
      );
      listingIds.push({ id: rows[0].id, sellerId });
    }

    // Insert inquiries in all three statuses
    const statuses = ['pending','accepted','declined'];
    const inquiryIds = [];
    for (let i = 0; i < 15; i++) {
      const listing = listingIds[i];
      const buyerId = userIds[(i + 3) % userIds.length];
      if (buyerId === listing.sellerId) continue;
      const status = statuses[i % 3];
      const { rows } = await client.query(
        `INSERT INTO inquiries (listing_id, buyer_id, message, status)
         VALUES ($1,$2,$3,$4) RETURNING id`,
        [listing.id, buyerId, `Hi, I\'m interested in your service. Can we discuss?`, status]
      );
      inquiryIds.push({ id: rows[0].id, buyerId, sellerId: listing.sellerId, status });
    }

    // Insert reviews on accepted inquiries
    for (const inq of inquiryIds.filter(i => i.status === 'accepted')) {
      await client.query(
        `INSERT INTO reviews (inquiry_id, reviewer_id, seller_id, rating, comment)
         VALUES ($1,$2,$3,$4,$5)`,
        [inq.id, inq.buyerId, inq.sellerId, Math.floor(Math.random() * 3) + 3, 'Great service, highly recommend!']
      );
    }

    await client.query('COMMIT');
    console.log('Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
