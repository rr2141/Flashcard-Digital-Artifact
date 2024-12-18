const prisma = require('../prisma');

// Admin Dashboard
const getAdminDashboard = async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        const flashcardSetCount = await prisma.flashcardSet.count();
        const settings = await prisma.settings.findFirst();

        res.status(200).json({
            userCount,
            flashcardSetCount,
            dailyLimit: settings ? settings.dailyLimit : 20, 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete user by ID
const deleteUserById = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await prisma.user.delete({ where: { id: parseInt(userId) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Gets the limits of sets in the database
// Limit currently set to 20
const getSetLimit = async (req, res) => {
    try {
      const settings = await prisma.settings.findFirst(); 
  
      if (!settings) {
        return res.json({ dailyLimit: 20 });
      }
  
      res.json({ dailyLimit: settings.dailyLimit });
    } catch (error) {
      console.error("Error fetching set limit:", error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

// Updates the limit of sets in the database
// Limit currently set to 20
const updateSetLimit = async (req, res) => {
  const { dailyLimit } = req.body;

  if (typeof dailyLimit !== 'number' || dailyLimit < 0) {
    return res.status(400).json({ error: 'Invalid dailyLimit value' });
  }

  try {
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: { dailyLimit },
      create: { dailyLimit },
    });

    res.json({ dailyLimit: settings.dailyLimit });
  } catch (error) {
    console.error("Error updating set limit:", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
    getAdminDashboard,
    getAllUsers,
    deleteUserById,
    getSetLimit,
    updateSetLimit
};