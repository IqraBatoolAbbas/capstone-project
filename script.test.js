// This test file uses a Jest-like syntax.
// To run, you would need a testing environment like Jest.

// Mocking the global window object to access the exported function
const { filterData } = require('./javascript'); // Assuming module export

describe('filterData', () => {
    const mockData = [
        { id: 1, date: '2026-07-22', region: 'north', amount: 100 }, // Today
        { id: 2, date: '2026-07-20', region: 'south', amount: 150 }, // 2 days ago
        { id: 3, date: '2026-07-10', region: 'north', amount: 200 }, // 12 days ago
        { id: 4, date: '2026-06-22', region: 'east', amount: 250 },  // 30 days ago
        { id: 5, date: '2026-04-22', region: 'west', amount: 300 },  // 91 days ago
    ];

    // Mock the current date to be 2026-07-22 for consistent testing
    beforeAll(() => {
        const mockDate = new Date('2026-07-22T12:00:00Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test('should filter data by the last 7 days', () => {
        const filtered = filterData(mockData, 7, 'all');
        expect(filtered.length).toBe(2);
        expect(filtered.map(item => item.id)).toEqual([1, 2]);
    });

    test('should filter data by the last 30 days', () => {
        const filtered = filterData(mockData, 30, 'all');
        expect(filtered.length).toBe(4);
        expect(filtered.map(item => item.id)).toEqual([1, 2, 3, 4]);
    });

    test('should filter data by region "north"', () => {
        const filtered = filterData(mockData, 90, 'north');
        expect(filtered.length).toBe(2);
        expect(filtered.map(item => item.id)).toEqual([1, 3]);
    });

    test('should filter by both time range and region', () => {
        const filtered = filterData(mockData, 7, 'north');
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe(1);
    });

    test('should return an empty array if no data matches', () => {
        const filtered = filterData(mockData, 7, 'west');
        expect(filtered.length).toBe(0);
    });
});