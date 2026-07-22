document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timeRangeFilter = document.getElementById('time-range-filter');
    const regionFilter = document.getElementById('region-filter');
    const chartCanvas = document.getElementById('sales-chart');
    const totalSalesEl = document.getElementById('total-sales');
    const totalOrdersEl = document.getElementById('total-orders');
    const avgOrderValueEl = document.getElementById('avg-order-value');
    const transactionsTableBody = document.getElementById('transactions-table-body');
    const paginationControls = document.getElementById('pagination-controls');

    // --- Chart Instance ---
    let salesChart;
    
    // --- State ---
    let currentPage = 1;
    const rowsPerPage = 5;

    // --- Mock Data ---
    // In a real application, this would come from an API.
    const salesData = generateMockData(200);

    // --- Event Listeners ---
    timeRangeFilter.addEventListener('change', updateDashboard);
    regionFilter.addEventListener('change', updateDashboard);

    // --- Expose for Testing ---
    window.testing = { filterData };

    // --- Functions ---

    /**
     * Generates an array of mock sales data points.
     * @param {number} count - The number of data points to generate.
     * @returns {Array<Object>} An array of sales records.
     */
    function generateMockData(count) {
        const data = [];
        const regions = ['north', 'south', 'east', 'west'];
        const statuses = ['Completed', 'Pending', 'Failed'];
        const firstNames = ['Ali', 'Sara', 'John', 'Jane', 'Mike', 'Emily'];
        const lastNames = ['K.', 'A.', 'D.', 'S.', 'M.', 'L.'];
        const today = new Date();

        for (let i = 0; i < count; i++) {
            const daysAgo = Math.floor(Math.random() * 90); // Data for the last 90 days
            const date = new Date(today);
            date.setDate(today.getDate() - daysAgo);

            const customerName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

            data.push({
                id: i + 1,
                date: date.toISOString().split('T')[0], // YYYY-MM-DD
                region: regions[Math.floor(Math.random() * regions.length)],
                amount: Math.floor(Math.random() * 1000) + 50, // Sales between $50 and $1050
                customer: customerName,
                status: statuses[Math.floor(Math.random() * statuses.length)],
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
        updateTransactionsTable(filteredData);
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
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        totalSalesEl.textContent = `$${totalSales.toLocaleString()}`;
        totalOrdersEl.textContent = totalOrders.toLocaleString();
        avgOrderValueEl.textContent = `$${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    /**
     * Renders a bar chart using Chart.js.
     * @param {Array<Object>} data - The filtered data.
     */
    function renderChart(data) {
        const chartArea = document.getElementById('chart-area');

        if (salesChart) {
            salesChart.destroy();
        }

        if (data.length === 0) {
            chartArea.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><span class="text-muted">No data available for the selected filters.</span></div>';
            return;
        }

        if (!document.getElementById('sales-chart')) {
            chartArea.innerHTML = '<canvas id="sales-chart"></canvas>';
        }
        const ctx = document.getElementById('sales-chart').getContext('2d');

        const labels = [...new Set(data.map(item => item.date))].sort();
        const chartData = labels.map(label => {
            return data.filter(item => item.date === label).reduce((sum, item) => sum + item.amount, 0);
        });

        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, 'rgba(13, 110, 253, 0.8)');
        gradient.addColorStop(1, 'rgba(13, 110, 253, 0.2)');

        salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales',
                    data: chartData,
                    backgroundColor: gradient,
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(13, 110, 253, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    },
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /**
     * Updates the entire transactions table section, including rows and pagination.
     * @param {Array<Object>} data - The filtered data.
     */
    function updateTransactionsTable(data) {
        renderTransactionRows(data);
        renderPagination(data);
    }

    /**
     * Renders the rows for the transactions table for the current page.
     * @param {Array<Object>} data - The filtered data.
     */
    function renderTransactionRows(data) {
        transactionsTableBody.innerHTML = ''; // Clear existing rows
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = data.slice(start, end);

        if (paginatedData.length === 0) {
            transactionsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No transactions found.</td></tr>`;
            return;
        }

        paginatedData.forEach(item => {
            const statusBadge = getStatusBadge(item.status);
            const row = `
                <tr>
                    <td>#${item.id}</td>
                    <td>${item.customer}</td>
                    <td>$${item.amount.toLocaleString()}</td>
                    <td>${statusBadge}</td>
                    <td>${item.date}</td>
                </tr>
            `;
            transactionsTableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    /**
     * Renders pagination controls based on the total data length.
     * @param {Array<Object>} data - The filtered data.
     */
    function renderPagination(data) {
        paginationControls.innerHTML = '';
        const pageCount = Math.ceil(data.length / rowsPerPage);
        if (pageCount <= 1) return;

        for (let i = 1; i <= pageCount; i++) {
            const liClass = (i === currentPage) ? 'page-item active' : 'page-item';
            const pageLink = `<li class="${liClass}"><a class="page-link" href="#">${i}</a></li>`;
            paginationControls.insertAdjacentHTML('beforeend', pageLink);
        }

        paginationControls.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                currentPage = parseInt(e.target.textContent, 10);
                updateTransactionsTable(filterData(salesData, parseInt(timeRangeFilter.value, 10), regionFilter.value));
            }
        });
    }

    /**
     * Returns an HTML string for a status badge based on the status text.
     * @param {string} status - The status text (e.g., 'Completed').
     * @returns {string} HTML for the badge.
     */
    function getStatusBadge(status) {
        const statusClasses = { 'Completed': 'bg-success', 'Pending': 'bg-warning text-dark', 'Failed': 'bg-danger' };
        return `<span class="badge ${statusClasses[status] || 'bg-secondary'}">${status}</span>`;
    }

    // --- Initial Load ---
    updateDashboard();
});
