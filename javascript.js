document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timeRangeFilter = document.getElementById('time-range-filter');
    const regionFilter = document.getElementById('region-filter');
    const chartArea = document.getElementById('chart-area');
    const totalSalesEl = document.getElementById('total-sales');
    const totalOrdersEl = document.getElementById('total-orders');

    // --- Mock Data ---
    // In a real application, this would come from an API.
    const salesData = generateMockData(200);

    // --- Event Listeners ---
    timeRangeFilter.addEventListener('change', updateDashboard);
    regionFilter.addEventListener('change', updateDashboard);

    // --- Functions ---

    /**
     * Generates an array of mock sales data points.
     * @param {number} count - The number of data points to generate.
     * @returns {Array<Object>} An array of sales records.
     */
    function generateMockData(count) {
        const data = [];
        const regions = ['north', 'south', 'east', 'west'];
        const today = new Date();
        for (let i = 0; i < count; i++) {
            const daysAgo = Math.floor(Math.random() * 90); // Data for the last 90 days
            const date = new Date(today);
            date.setDate(today.getDate() - daysAgo);

            data.push({
                id: i + 1,
                date: date.toISOString().split('T')[0], // YYYY-MM-DD
                region: regions[Math.floor(Math.random() * regions.length)],
                amount: Math.floor(Math.random() * 1000) + 50, // Sales between $50 and $1050
            });
        }
        return data;
    }

    /**
     * Main function to update the dashboard based on filter values.
     */
    function updateDashboard() {
        const timeRange = parseInt(timeRangeFilter.value, 10);
        const region = regionFilter.value;

        const filteredData = filterData(salesData, timeRange, region);
        
        renderChart(filteredData);
        updateMetrics(filteredData);
    }

    /**
     * Filters the raw data based on selected time range and region.
     * @param {Array<Object>} data - The complete dataset.
     * @param {number} timeRangeDays - The number of days to look back.
     * @param {string} region - The selected region ('all' for no filter).
     * @returns {Array<Object>} The filtered data.
     */
    function filterData(data, timeRangeDays, region) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeRangeDays);

        return data.filter(item => {
            const itemDate = new Date(item.date);
            const isWithinTime = itemDate >= cutoffDate;
            const isMatchingRegion = region === 'all' || item.region === region;
            return isWithinTime && isMatchingRegion;
        });
    }

    /**
     * Updates the key metrics in the card footer.
     * @param {Array<Object>} data - The filtered data.
     */
    function updateMetrics(data) {
        const totalSales = data.reduce((sum, item) => sum + item.amount, 0);
        const totalOrders = data.length;

        totalSalesEl.textContent = `$${totalSales.toLocaleString()}`;
        totalOrdersEl.textContent = totalOrders.toLocaleString();
    }

    /**
     * Renders a simple representation of the data in the chart area.
     * @param {Array<Object>} data - The filtered data.
     */
    function renderChart(data) {
        if (data.length === 0) {
            chartArea.innerHTML = '<span>No data available for the selected filters.</span>';
            return;
        }
        // This is a simple text representation. A real-world scenario would
        // use a charting library (e.g., Chart.js, D3.js) to draw a visual chart.
        const summary = `Displaying ${data.length} orders.`;
        chartArea.innerHTML = `<span>${summary}</span><br><span style="font-size:12px;">(Chart visualization would go here)</span>`;
    }

    // --- Initial Load ---
    updateDashboard();
});
