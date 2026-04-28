const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');
const { loadEnv } = require('./src/config');
const {
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
} = require('./src/database');
const {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
} = require('./src/auth');

loadEnv(path.join(__dirname, '.env'));
initializeDatabase();

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '127.0.0.1';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const body = Buffer.concat(chunks).toString('utf8');
  return body ? JSON.parse(body) : {};
}

function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length);
  return verifyToken(token);
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName ?? user.full_name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    location: user.location || '',
    company: user.company || '',
    industry: user.industry || '',
    createdAt: user.createdAt ?? user.created_at,
  };
}

async function handleRegister(req, res) {
  const body = await readJsonBody(req);
  const {
    fullName,
    email,
    password,
    role,
    phone = '',
    location = '',
    professionalTitle = '',
    category = '',
    hourlyRate = '',
    experience = '',
    bio = '',
    skills = '',
    portfolio = '',
    company = '',
    industry = '',
  } = body;

  if (!fullName || !email || !password || !role) {
    return sendJson(res, 400, { message: 'Full name, email, password, and role are required.' });
  }

  if (!['client', 'professional'].includes(role)) {
    return sendJson(res, 400, { message: 'Role must be client or professional.' });
  }

  if (password.length < 8) {
    return sendJson(res, 400, { message: 'Password must be at least 8 characters.' });
  }

  if (findUserByEmail(email)) {
    return sendJson(res, 409, { message: 'An account with this email already exists.' });
  }

  if (role === 'professional' && (!professionalTitle || !category || !hourlyRate || !bio)) {
    return sendJson(res, 400, { message: 'Professional accounts need title, category, hourly rate, and bio.' });
  }

  const passwordHash = hashPassword(password);
  const user = createUser({
    fullName,
    email,
    passwordHash,
    role,
    phone,
    location,
    company,
    industry,
  });

  if (role === 'professional') {
    createProfessionalProfile({
      userId: user.id,
      fullName,
      title: professionalTitle,
      category,
      location,
      hourlyRate: Number(hourlyRate),
      bio,
      experience,
      skills,
      portfolio,
    });
  }

  const token = createToken(user);
  const professionalProfile = getProfessionalByUserId(user.id);

  return sendJson(res, 201, {
    message: 'Account created successfully.',
    token,
    user: sanitizeUser(user),
    professionalProfile,
  });
}

async function handleLogin(req, res) {
  const body = await readJsonBody(req);
  const { email, password } = body;

  if (!email || !password) {
    return sendJson(res, 400, { message: 'Email and password are required.' });
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return sendJson(res, 401, { message: 'Invalid email or password.' });
  }

  const token = createToken(user);
  const professionalProfile = getProfessionalByUserId(user.id);

  return sendJson(res, 200, {
    token,
    user: sanitizeUser(user),
    professionalProfile,
  });
}

function handleUsersList(res) {
  return sendJson(res, 200, { users: listUsers().map(sanitizeUser) });
}

function handleUserDetails(res, id) {
  const user = getUserById(id);
  if (!user) {
    return sendJson(res, 404, { message: 'User not found.' });
  }

  return sendJson(res, 200, { user: sanitizeUser(user) });
}

async function handleCreateUser(req, res) {
  return handleRegister(req, res);
}

async function handleUpdateUser(req, res, id) {
  const existingUser = getUserById(id);
  if (!existingUser) {
    return sendJson(res, 404, { message: 'User not found.' });
  }

  const body = await readJsonBody(req);
  if (body.email && body.email !== existingUser.email) {
    const duplicate = findUserByEmail(body.email);
    if (duplicate && duplicate.id !== Number(id)) {
      return sendJson(res, 409, { message: 'Another account already uses this email.' });
    }
  }

  const user = updateUser(id, body);

  if (body.role === 'professional' && body.professionalProfile && !getProfessionalByUserId(id)) {
    createProfessionalProfile({
      userId: Number(id),
      fullName: body.fullName || existingUser.fullName,
      title: body.professionalProfile.title,
      category: body.professionalProfile.category,
      location: body.location || existingUser.location,
      hourlyRate: Number(body.professionalProfile.hourlyRate),
      bio: body.professionalProfile.bio,
      experience: body.professionalProfile.experience || '',
      skills: body.professionalProfile.skills || '',
      portfolio: body.professionalProfile.portfolio || '',
    });
  }

  return sendJson(res, 200, {
    message: 'User updated successfully.',
    user: sanitizeUser(user),
    professionalProfile: getProfessionalByUserId(id),
  });
}

function handleDeleteUser(res, id) {
  const deleted = deleteUser(id);
  if (!deleted) {
    return sendJson(res, 404, { message: 'User not found.' });
  }

  return sendJson(res, 200, { message: 'User deleted successfully.' });
}

function handleProfessionalsList(res, requestUrl) {
  const professionals = listProfessionals({
    search: requestUrl.searchParams.get('search') || '',
    category: requestUrl.searchParams.get('category') || '',
    maxRate: requestUrl.searchParams.get('maxRate') || '',
    minRating: requestUrl.searchParams.get('minRating') || '',
  });

  return sendJson(res, 200, { professionals });
}

function handleProfessionalDetails(res, id) {
  const professional = getProfessionalById(id);
  if (!professional) {
    return sendJson(res, 404, { message: 'Professional not found.' });
  }

  return sendJson(res, 200, professional);
}

async function handleCreateProfessional(req, res) {
  const body = await readJsonBody(req);
  const userId = Number(body.userId || getAuthenticatedUser(req)?.id);

  if (!userId) {
    return sendJson(res, 400, { message: 'A valid userId is required.' });
  }

  const user = getUserById(userId);
  if (!user) {
    return sendJson(res, 404, { message: 'User not found for this professional profile.' });
  }

  const existing = getProfessionalByUserId(userId);
  if (existing) {
    return sendJson(res, 409, { message: 'Professional profile already exists.' });
  }

  updateUser(userId, { role: 'professional', fullName: body.fullName || user.fullName, location: body.location || user.location });

  const profile = createProfessionalProfile({
    userId,
    fullName: body.fullName || user.fullName || 'Professional',
    title: body.professionalTitle || body.title,
    category: body.category,
    location: body.location || '',
    hourlyRate: Number(body.hourlyRate),
    bio: body.bio,
    experience: body.experience || '',
    skills: body.skills || '',
    portfolio: body.portfolio || '',
  });

  return sendJson(res, 201, profile);
}

async function handleUpdateProfessional(req, res, id) {
  const existing = getProfessionalById(id);
  if (!existing) {
    return sendJson(res, 404, { message: 'Professional not found.' });
  }

  const body = await readJsonBody(req);
  const profile = updateProfessional(id, body);
  return sendJson(res, 200, {
    message: 'Professional updated successfully.',
    professional: profile,
  });
}

function handleDeleteProfessional(res, id) {
  const deleted = deleteProfessional(id);
  if (!deleted) {
    return sendJson(res, 404, { message: 'Professional not found.' });
  }

  return sendJson(res, 200, { message: 'Professional deleted successfully.' });
}

async function requestListener(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'GET' && requestUrl.pathname === '/api/health') {
      return sendJson(res, 200, { status: 'ok', database: 'hirepro.db' });
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/auth/register') {
      return handleRegister(req, res);
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/auth/login') {
      return handleLogin(req, res);
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/users/register') {
      return handleRegister(req, res);
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/users/login') {
      return handleLogin(req, res);
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/users') {
      return handleUsersList(res);
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/users') {
      return handleCreateUser(req, res);
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/professionals') {
      return handleProfessionalsList(res, requestUrl);
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/professionals') {
      return handleCreateProfessional(req, res);
    }

    if (requestUrl.pathname.startsWith('/api/users/')) {
      const id = requestUrl.pathname.split('/').pop();

      if (req.method === 'GET') {
        return handleUserDetails(res, id);
      }

      if (req.method === 'PUT') {
        return handleUpdateUser(req, res, id);
      }

      if (req.method === 'DELETE') {
        return handleDeleteUser(res, id);
      }
    }

    if (req.method === 'GET' && requestUrl.pathname.startsWith('/api/professionals/')) {
      const id = requestUrl.pathname.split('/').pop();
      return handleProfessionalDetails(res, id);
    }

    if (requestUrl.pathname.startsWith('/api/professionals/')) {
      const id = requestUrl.pathname.split('/').pop();

      if (req.method === 'PUT') {
        return handleUpdateProfessional(req, res, id);
      }

      if (req.method === 'DELETE') {
        return handleDeleteProfessional(res, id);
      }
    }

    return sendJson(res, 404, { message: 'Route not found.' });
  } catch (error) {
    return sendJson(res, 500, { message: error.message || 'Internal server error.' });
  }
}

if (require.main === module) {
  const server = http.createServer(requestListener);

  server.listen(PORT, HOST, () => {
    console.log(`HirePro backend running at http://${HOST}:${PORT}`);
  });
}

module.exports = {
  requestListener,
};
