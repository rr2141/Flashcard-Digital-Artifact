const prisma = require('../prisma');

//Directs to admin dashboard after logging in
//If user has admin role
const getAdminDashboard = async (req,res) =>
{
    try{
        res.json({message: 'Welcome to the admin dashboard!'})

    }
    catch (error){
        console.error('Error fetching admin dashboard:', error);
        res.status(500).json({ message: 'Error fetching admin dashboard' });
    }
};

//Can view all users that are using the flashcard application
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                admin: true,
            },
        });
        console.log('All users:', users);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//deletes user by their ID
const deleteUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await prisma.user.delete({
            where: { id: parseInt(userId) },
        });

        res.status(204).send(); // No content response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAdminDashboard,
    getAllUsers,
    deleteUserById
};