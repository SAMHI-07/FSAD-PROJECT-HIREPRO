const Professional = require('../models/Professional');

// Get all professionals with optional filtering
exports.getProfessionals = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const professionals = await Professional.find(query).populate('user', 'email role');

    res.json(professionals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create professional profile (protected route)
exports.createProfessional = async (req, res) => {
  try {
    const professionalData = { ...req.body, user: req.user.userId };
    const professional = new Professional(professionalData);
    await professional.save();

    res.status(201).json(professional);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};