const express = require('express');
const router = express.Router();
const { getProfessionals, createProfessional } = require('../controllers/professionals');
const auth = require('../middleware/auth');

router.get('/', getProfessionals);
router.post('/', auth, createProfessional);

module.exports = router;