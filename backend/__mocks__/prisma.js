//Jest will use this to mock prisma 
const { mockDeep, mockReset } = require('jest-mock-extended');

const prisma = mockDeep();

beforeEach(() => {
    mockReset(prisma);
});

module.exports = prisma;
