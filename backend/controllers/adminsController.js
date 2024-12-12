const prisma = require('../prisma');

// Admin Dashboard
const getAdminDashboard = async (req, res) => {
    try {
        const data = await prisma.someModel.findMany();
        res.status(200).json(data);
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

module.exports = {
    getAdminDashboard,
    getAllUsers,
    deleteUserById
};