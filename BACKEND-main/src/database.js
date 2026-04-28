const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { hashPassword } = require('./auth');

const dataDir = path.join(os.tmpdir(), 'hirepro-backend');
const dbPath = path.join(dataDir, 'hirepro.db');

let database;

function getDatabase() {
  if (!database) {
    fs.mkdirSync(dataDir, { recursive: true });
    database = new DatabaseSync(dbPath);
    database.exec('PRAGMA foreign_keys = ON;');
    database.exec(fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8'));
  }

  return database;
}

function initializeDatabase() {
  const db = getDatabase();
  seedUsers(db);
  seedProfessionals(db);
  seedReviews(db);
}

function seedUsers(db) {
  const count = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (count > 0) {
    return;
  }

  const insertUser = db.prepare(`
    INSERT INTO users (full_name, email, password_hash, role, phone, location, company, industry)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'Demo Client',
    'client@hirepro.com',
    hashPassword('demo12345'),
    'client',
    '+91 90000 00000',
    'Hyderabad, India',
    'HirePro Labs',
    'Technology'
  );
}

function seedProfessionals(db) {
  const count = db.prepare('SELECT COUNT(*) AS count FROM professionals').get().count;
  if (count > 0) {
    return;
  }

  const professionals = [
    {
      fullName: 'Sarah Johnson',
      email: 'sarah@hirepro.com',
      title: 'Full Stack Developer',
      category: 'Web Development',
      location: 'San Francisco, CA',
      hourlyRate: 85,
      rating: 4.9,
      reviewCount: 127,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      bio: 'Experienced full-stack developer specializing in React, Node.js, and cloud infrastructure.',
      skills: 'React, Node.js, TypeScript, AWS, SQL',
      experience: '8 years',
      availability: 'available',
      completedJobs: 245,
      responseTime: '2 hours',
      portfolioUrl: 'https://portfolio.example.com/sarah',
    },
    {
      fullName: 'Michael Chen',
      email: 'michael@hirepro.com',
      title: 'UI/UX Designer',
      category: 'Design',
      location: 'New York, NY',
      hourlyRate: 75,
      rating: 4.8,
      reviewCount: 93,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      bio: 'Creative designer crafting beautiful, user-centered digital experiences for web and mobile.',
      skills: 'Figma, Adobe XD, Design Systems, Prototyping',
      experience: '6 years',
      availability: 'available',
      completedJobs: 178,
      responseTime: '1 hour',
      portfolioUrl: 'https://portfolio.example.com/michael',
    },
    {
      fullName: 'Emily Rodriguez',
      email: 'emily@hirepro.com',
      title: 'Digital Marketing Specialist',
      category: 'Marketing',
      location: 'Austin, TX',
      hourlyRate: 65,
      rating: 4.9,
      reviewCount: 156,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      bio: 'Results-driven marketer helping businesses grow through SEO, paid campaigns, and social media.',
      skills: 'SEO, PPC, Analytics, Social Media, Content Strategy',
      experience: '7 years',
      availability: 'busy',
      completedJobs: 312,
      responseTime: '4 hours',
      portfolioUrl: 'https://portfolio.example.com/emily',
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (full_name, email, password_hash, role, phone, location)
    VALUES (?, ?, ?, 'professional', '', ?)
  `);

  const insertProfessional = db.prepare(`
    INSERT INTO professionals (
      user_id, full_name, title, category, location, hourly_rate, rating, review_count,
      avatar_url, bio, skills, experience, availability, completed_jobs, response_time, portfolio_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const professional of professionals) {
    const userResult = insertUser.run(
      professional.fullName,
      professional.email,
      hashPassword('demo12345'),
      professional.location
    );

    insertProfessional.run(
      userResult.lastInsertRowid,
      professional.fullName,
      professional.title,
      professional.category,
      professional.location,
      professional.hourlyRate,
      professional.rating,
      professional.reviewCount,
      professional.avatarUrl,
      professional.bio,
      professional.skills,
      professional.experience,
      professional.availability,
      professional.completedJobs,
      professional.responseTime,
      professional.portfolioUrl
    );
  }
}

function seedReviews(db) {
  const count = db.prepare('SELECT COUNT(*) AS count FROM reviews').get().count;
  if (count > 0) {
    return;
  }

  const insertReview = db.prepare(`
    INSERT INTO reviews (professional_id, user_name, rating, comment, review_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertReview.run(1, 'Lisa Anderson', 5, 'Excellent developer with strong communication and delivery.', '2026-02-10');
  insertReview.run(1, 'John Davis', 5, 'Delivered our project on time and exceeded expectations.', '2026-02-15');
  insertReview.run(2, 'Mark Thompson', 5, 'The UI refresh was polished and easy to implement.', '2026-02-12');
}

function mapProfessional(row) {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    userId: row.user_id,
    name: row.full_name,
    title: row.title,
    category: row.category,
    description: row.bio,
    bio: row.bio,
    hourlyRate: row.hourly_rate,
    rating: row.rating,
    reviewCount: row.review_count,
    location: row.location,
    avatar: row.avatar_url,
    skills: row.skills ? row.skills.split(',').map((skill) => skill.trim()).filter(Boolean) : [],
    experience: row.experience || '',
    availability: row.availability,
    completedJobs: row.completed_jobs,
    responseTime: row.response_time,
    portfolio: row.portfolio_url || '',
  };
}

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    phone: row.phone || '',
    location: row.location || '',
    company: row.company || '',
    industry: row.industry || '',
    createdAt: row.created_at,
  };
}

function listUsers() {
  const db = getDatabase();
  return db
    .prepare('SELECT * FROM users ORDER BY id DESC')
    .all()
    .map(mapUser);
}

function getUserById(id) {
  const db = getDatabase();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(id));
  return mapUser(user);
}

function listProfessionals(filters = {}) {
  const db = getDatabase();
  let query = 'SELECT * FROM professionals WHERE 1 = 1';
  const params = [];

  if (filters.search) {
    query += ' AND (LOWER(full_name) LIKE ? OR LOWER(title) LIKE ? OR LOWER(bio) LIKE ? OR LOWER(skills) LIKE ?)';
    const likeValue = `%${String(filters.search).toLowerCase()}%`;
    params.push(likeValue, likeValue, likeValue, likeValue);
  }

  if (filters.category && filters.category !== 'all') {
    query += ' AND LOWER(category) = ?';
    params.push(String(filters.category).toLowerCase());
  }

  if (filters.maxRate) {
    query += ' AND hourly_rate <= ?';
    params.push(Number(filters.maxRate));
  }

  if (filters.minRating) {
    query += ' AND rating >= ?';
    params.push(Number(filters.minRating));
  }

  query += ' ORDER BY rating DESC, review_count DESC';

  return db.prepare(query).all(...params).map(mapProfessional);
}

function getProfessionalById(id) {
  const db = getDatabase();
  const professional = db.prepare('SELECT * FROM professionals WHERE id = ?').get(Number(id));

  if (!professional) {
    return null;
  }

  const reviews = db
    .prepare(`
      SELECT id, user_name, rating, comment, review_date
      FROM reviews
      WHERE professional_id = ?
      ORDER BY review_date DESC
    `)
    .all(Number(id))
    .map((review) => ({
      id: String(review.id),
      userName: review.user_name,
      rating: review.rating,
      comment: review.comment,
      date: `${review.review_date}T00:00:00Z`,
    }));

  return {
    ...mapProfessional(professional),
    reviews,
  };
}

function findUserByEmail(email) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
}

function createUser(user) {
  const db = getDatabase();
  const result = db
    .prepare(`
      INSERT INTO users (full_name, email, password_hash, role, phone, location, company, industry)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      user.fullName,
      String(user.email).trim().toLowerCase(),
      user.passwordHash,
      user.role,
      user.phone || '',
      user.location || '',
      user.company || '',
      user.industry || ''
    );

  return db.prepare('SELECT * FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
}

function updateUser(id, updates) {
  const db = getDatabase();
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(id));

  if (!current) {
    return null;
  }

  const fullName = updates.fullName ?? current.full_name;
  const email = updates.email ? String(updates.email).trim().toLowerCase() : current.email;
  const role = updates.role ?? current.role;
  const phone = updates.phone ?? current.phone;
  const location = updates.location ?? current.location;
  const company = updates.company ?? current.company;
  const industry = updates.industry ?? current.industry;
  const passwordHash = updates.password ? hashPassword(updates.password) : current.password_hash;

  db.prepare(`
    UPDATE users
    SET full_name = ?, email = ?, password_hash = ?, role = ?, phone = ?, location = ?, company = ?, industry = ?
    WHERE id = ?
  `).run(fullName, email, passwordHash, role, phone, location, company, industry, Number(id));

  if (role === 'professional') {
    const professional = db.prepare('SELECT id FROM professionals WHERE user_id = ?').get(Number(id));
    if (professional) {
      db.prepare('UPDATE professionals SET full_name = ?, location = ? WHERE user_id = ?').run(fullName, location, Number(id));
    }
  } else {
    db.prepare('DELETE FROM professionals WHERE user_id = ?').run(Number(id));
  }

  return getUserById(id);
}

function deleteUser(id) {
  const db = getDatabase();
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(id));
  if (!current) {
    return false;
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(Number(id));
  return true;
}

function createProfessionalProfile(profile) {
  const db = getDatabase();
  const result = db
    .prepare(`
      INSERT INTO professionals (
        user_id, full_name, title, category, location, hourly_rate, rating, review_count,
        avatar_url, bio, skills, experience, availability, completed_jobs, response_time, portfolio_url
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, 'available', 0, 'New', ?)
    `)
    .run(
      profile.userId,
      profile.fullName,
      profile.title,
      profile.category,
      profile.location || '',
      Number(profile.hourlyRate),
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      profile.bio,
      profile.skills || '',
      profile.experience || '',
      profile.portfolio || ''
    );

  return getProfessionalById(Number(result.lastInsertRowid));
}

function getProfessionalByUserId(userId) {
  const db = getDatabase();
  const professional = db.prepare('SELECT * FROM professionals WHERE user_id = ?').get(Number(userId));
  return professional ? mapProfessional(professional) : null;
}

function updateProfessional(id, updates) {
  const db = getDatabase();
  const current = db.prepare('SELECT * FROM professionals WHERE id = ?').get(Number(id));

  if (!current) {
    return null;
  }

  const fullName = updates.fullName ?? current.full_name;
  const title = updates.title ?? current.title;
  const category = updates.category ?? current.category;
  const location = updates.location ?? current.location;
  const hourlyRate = updates.hourlyRate ?? current.hourly_rate;
  const bio = updates.bio ?? current.bio;
  const skills = Array.isArray(updates.skills)
    ? updates.skills.join(', ')
    : (updates.skills ?? current.skills);
  const experience = updates.experience ?? current.experience;
  const availability = updates.availability ?? current.availability;
  const completedJobs = updates.completedJobs ?? current.completed_jobs;
  const responseTime = updates.responseTime ?? current.response_time;
  const avatarUrl = updates.avatar ?? current.avatar_url;
  const portfolioUrl = updates.portfolio ?? current.portfolio_url;

  db.prepare(`
    UPDATE professionals
    SET full_name = ?, title = ?, category = ?, location = ?, hourly_rate = ?, bio = ?, skills = ?,
        experience = ?, availability = ?, completed_jobs = ?, response_time = ?, avatar_url = ?, portfolio_url = ?
    WHERE id = ?
  `).run(
    fullName,
    title,
    category,
    location,
    Number(hourlyRate),
    bio,
    skills,
    experience,
    availability,
    Number(completedJobs),
    responseTime,
    avatarUrl,
    portfolioUrl,
    Number(id)
  );

  db.prepare('UPDATE users SET full_name = ?, location = ?, role = ? WHERE id = ?').run(
    fullName,
    location,
    'professional',
    current.user_id
  );

  return getProfessionalById(id);
}

function deleteProfessional(id) {
  const db = getDatabase();
  const current = db.prepare('SELECT * FROM professionals WHERE id = ?').get(Number(id));
  if (!current) {
    return false;
  }

  db.prepare('DELETE FROM professionals WHERE id = ?').run(Number(id));
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run('client', current.user_id);
  return true;
}

module.exports = {
  dbPath,
  initializeDatabase,
  listUsers,
  getUserById,
  listProfessionals,
  getProfessionalById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  createProfessionalProfile,
  getProfessionalByUserId,
  updateProfessional,
  deleteProfessional,
};
