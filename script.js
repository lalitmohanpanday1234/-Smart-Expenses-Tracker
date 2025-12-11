// Global variables
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};
let customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
let editingId = null;
let charts = {
  chart1: null,
  chart2: null,
  chart3: null
};

// Default categories with emojis
const defaultCategories = [
  { id: 'food', name: '🍔 Food and Groceries', emoji: '🍔' },
  { id: 'transport', name: '🚗 Transportation', emoji: '🚗' },
  { id: 'rent', name: '🏠 Rent and Household', emoji: '🏠' },
  { id: 'utilities', name: '🧾 Utilities and Bills', emoji: '🧾' },
  { id: 'phone', name: '📱 Phone Recharge and Internet', emoji: '📱' },
  { id: 'education', name: '🎓 Education Fees and Books', emoji: '🎓' },
  { id: 'stationery', name: '🖊️ Stationery and Supplies', emoji: '🖊️' },
  { id: 'healthcare', name: '💊 Healthcare and Medicines', emoji: '💊' },
  { id: 'personalcare', name: '🪒 Personal Care and Grooming', emoji: '🪒' },
  { id: 'clothing', name: '👕 Clothing and Accessories', emoji: '👕' },
  { id: 'entertainment', name: '🎬 Entertainment and Subscriptions', emoji: '🎬' },
  { id: 'gifts', name: '🎁 Gifts and Donations', emoji: '🎁' },
  { id: 'savings', name: '💰 Savings and Investments', emoji: '💰' },
  { id: 'miscellaneous', name: '🤷‍♂️ Miscellaneous/Others', emoji: '🤷‍♂️' }
];

// Month mapping for display
const monthMap = {
  january: 'January',
  february: 'February',
  march: 'March',
  april: 'April',
  may: 'May',
  june: 'June',
  july: 'July',
  august: 'August',
  september: 'September',
  october: 'October',
  november: 'November',
  december: 'December'
};

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
  initializeCategories();
  updateUI();
  setupTheme();
  setCurrentMonth();
  setCurrentDate();
});

// Initialize categories dropdown
function initializeCategories() {
  const categorySelect = document.getElementById('category');
  categorySelect.innerHTML = '';
  
  // Add default categories
  defaultCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
  
  // Add custom categories
  customCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.emoji + ' ' + cat.name;
    categorySelect.appendChild(option);
  });
  
  updateCustomCategoriesList();
}

// Update month from date input
function updateMonthFromDate() {
  const dateInput = document.getElementById('date').value;
  if (!dateInput) return;
  
  const date = new Date(dateInput);
  const monthNumber = date.getMonth(); // 0-11
  
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  document.getElementById('month').value = monthNames[monthNumber];
}

// Add/Edit Expense
function addExpense() {
  const item = document.getElementById('item').value.trim();
  const category = document.getElementById('category').value;
  const price = parseFloat(document.getElementById('price').value);
  const date = document.getElementById('date').value;
  const month = document.getElementById('month').value;
  const remarks = document.getElementById('remarks').value.trim();

  if (!item || !price || price <= 0 || !month) {
    showToast('Please enter valid item name, price and select month!', 'warning');
    return;
  }

  if (editingId) {
    // Update existing expense
    const index = expenses.findIndex(exp => exp.id === editingId);
    if (index !== -1) {
      expenses[index] = {
        ...expenses[index],
        item,
        category,
        price,
        date: date || null,
        month: month,
        remarks,
        updated: new Date().toISOString()
      };
      showToast('Expense updated successfully!', 'success');
    }
    editingId = null;
    document.getElementById('add-btn').innerHTML = '<span>💾</span> Add Expense';
    document.getElementById('cancel-edit-btn').style.display = 'none';
  } else {
    // Add new expense
    const newExpense = {
      id: Date.now(),
      item,
      category,
      price,
      date: date || null,
      month: month,
      remarks,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    expenses.push(newExpense);
    showToast('Expense added successfully!', 'success');
  }

  saveData();
  updateUI();
  clearForm();
}

// Edit Expense
function editExpense(id) {
  const expense = expenses.find(exp => exp.id === id);
  if (expense) {
    document.getElementById('item').value = expense.item;
    document.getElementById('category').value = expense.category;
    document.getElementById('price').value = expense.price;
    document.getElementById('date').value = expense.date || '';
    document.getElementById('month').value = expense.month;
    document.getElementById('remarks').value = expense.remarks || '';
    
    editingId = id;
    document.getElementById('add-btn').innerHTML = '<span>✏️</span> Update Expense';
    document.getElementById('cancel-edit-btn').style.display = 'flex';
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
  }
}

// Delete Expense
function deleteExpense(id) {
  if (confirm('Are you sure you want to delete this expense?')) {
    expenses = expenses.filter(expense => expense.id !== id);
    saveData();
    updateUI();
    showToast('Expense deleted!', 'danger');
  }
}

// Clear form
function clearForm() {
  document.getElementById('item').value = '';
  document.getElementById('price').value = '';
  document.getElementById('date').value = '';
  document.getElementById('remarks').value = '';
  editingId = null;
  document.getElementById('add-btn').innerHTML = '<span>💾</span> Add Expense';
  document.getElementById('cancel-edit-btn').style.display = 'none';
}

// Cancel edit
function cancelEdit() {
  clearForm();
  showToast('Edit cancelled', 'info');
}

// Save all data
function saveData() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('budgets', JSON.stringify(budgets));
  localStorage.setItem('customCategories', JSON.stringify(customCategories));
}

// Get filtered expenses based on current filters
function getFilteredExpenses() {
  const filterMonth = document.getElementById('filter-month').value;
  const searchTerm = document.getElementById('search').value.toLowerCase();
  const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
  const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;

  return expenses.filter(expense => {
    const monthMatch = filterMonth === 'all' || expense.month === filterMonth;
    const searchMatch = !searchTerm || 
      expense.item.toLowerCase().includes(searchTerm) ||
      (expense.remarks && expense.remarks.toLowerCase().includes(searchTerm));
    const priceMatch = expense.price >= minPrice && expense.price <= maxPrice;
    
    return monthMatch && searchMatch && priceMatch;
  });
}

// Update table
function updateTable() {
  const tableBody = document.getElementById('table-body');
  const filtered = getFilteredExpenses();
  
  tableBody.innerHTML = '';
  
  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
          📭 No expenses found. Add your first expense!
        </td>
      </tr>`;
    return;
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.created) - new Date(a.created));

  filtered.forEach(expense => {
    const row = document.createElement('tr');
    
    // Find category name
    const allCategories = [...defaultCategories, ...customCategories];
    const categoryInfo = allCategories.find(cat => cat.id === expense.category) || 
                       { name: expense.category, emoji: '📌' };
    
    // Format date for display
    let displayDate = '-';
    if (expense.date) {
      const date = new Date(expense.date);
      displayDate = date.toLocaleDateString('en-IN');
    }
    
    row.innerHTML = `
      <td>${displayDate}</td>
      <td>${monthMap[expense.month] || expense.month}</td>
      <td>${categoryInfo.emoji} ${categoryInfo.name}</td>
      <td>${expense.item}</td>
      <td style="font-weight: 600;">₹${expense.price.toFixed(2)}</td>
      <td class="remarks-cell" title="${expense.remarks || 'No remarks'}">
        ${expense.remarks || '-'}
      </td>
      <td>
        <div class="action-buttons">
          <button class="edit-btn" onclick="editExpense(${expense.id})">Edit</button>
          <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
  
  // Update expense count
  document.getElementById('expense-count').textContent = `${filtered.length} expenses`;
}

// Update charts
function updateChart() {
  const ctx = document.getElementById('expenses-chart').getContext('2d');
  const filtered = getFilteredExpenses();
  
  // Destroy existing chart
  if (charts.chart1) {
    charts.chart1.destroy();
  }

  // Calculate category totals
  const categoryTotals = {};
  filtered.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.price;
  });

  // Prepare data
  const allCategories = [...defaultCategories, ...customCategories];
  const categories = Object.keys(categoryTotals);
  const totals = Object.values(categoryTotals);
  
  const categoryNames = categories.map(cat => {
    const category = allCategories.find(c => c.id === cat);
    return category ? category.name : cat;
  });

  // Get chart type from button state
  const chartType = document.querySelector('#charts-tab .chart-type-toggle .tab-btn.active')?.textContent.toLowerCase() || 'pie';

  // Create chart
  charts.chart1 = new Chart(ctx, {
    type: chartType,
    data: {
      labels: categoryNames,
      datasets: [{
        data: totals,
        backgroundColor: generateColors(categories.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ₹${value.toFixed(2)} (${percentage}%)`;
            }
          }
        },
        datalabels: {
          color: '#fff',
          font: {
            weight: 'bold',
            size: 12
          },
          formatter: (value, ctx) => {
            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return percentage > 5 ? `${percentage}%` : '';
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    },
    plugins: [ChartDataLabels]
  });
}

// Update monthly chart
function updateMonthlyChart() {
  const ctx = document.getElementById('monthly-chart').getContext('2d');
  const filtered = getFilteredExpenses();
  
  if (charts.chart2) {
    charts.chart2.destroy();
  }

  // Calculate monthly totals
  const monthlyTotals = {};
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
                 'july', 'august', 'september', 'october', 'november', 'december'];
  
  months.forEach(month => {
    monthlyTotals[month] = filtered
      .filter(exp => exp.month === month)
      .reduce((sum, exp) => sum + exp.price, 0);
  });

  // Get chart type
  const chartType = document.querySelectorAll('#charts-tab .chart-type-toggle')[1]?.querySelector('.tab-btn.active')?.textContent.toLowerCase() || 'line';

  // Create chart
  charts.chart2 = new Chart(ctx, {
    type: chartType,
    data: {
      labels: months.map(m => monthMap[m]),
      datasets: [{
        label: 'Monthly Expenses',
        data: months.map(m => monthlyTotals[m]),
        backgroundColor: chartType === 'bar' ? '#667eea' : 'transparent',
        borderColor: '#667eea',
        borderWidth: 3,
        fill: chartType === 'line',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `₹${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value;
            }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  });
}

// Update trend chart
function updateTrendChart() {
  const ctx = document.getElementById('trend-chart').getContext('2d');
  const trendType = document.getElementById('trend-type').value;
  
  if (charts.chart3) {
    charts.chart3.destroy();
  }

  let data, options;

  if (trendType === 'monthly') {
    // Monthly overview
    const monthlyData = calculateMonthlyData();
    data = {
      labels: Object.keys(monthlyData),
      datasets: [{
        label: 'Monthly Expenses',
        data: Object.values(monthlyData),
        backgroundColor: '#667eea',
        borderColor: '#667eea',
        borderWidth: 2
      }]
    };
    options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => '₹' + value
          }
        }
      }
    };
  } else if (trendType === 'category-trend') {
    // Category trends
    const categoryTrends = calculateCategoryTrends();
    data = {
      labels: Object.keys(categoryTrends),
      datasets: [{
        label: 'Category Spending',
        data: Object.values(categoryTrends),
        backgroundColor: generateColors(Object.keys(categoryTrends).length)
      }]
    };
    options = {
      responsive: true,
      maintainAspectRatio: false
    };
  }

  charts.chart3 = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
  });
}

// Update totals at the bottom
function updateTotals() {
  const filtered = getFilteredExpenses();
  const filterMonth = document.getElementById('filter-month').value;
  
  // 1. Total Expenses (All Time) - Always show all expenses
  const totalAllTime = expenses.reduce((sum, expense) => sum + expense.price, 0);
  document.getElementById('total-amount').textContent = totalAllTime.toFixed(2);
  
  // 2. Selected Month Total
  let selectedMonthTotal = 0;
  let selectedMonthLabel = 'Selected Month';
  
  if (filterMonth === 'all') {
    // If "All" is selected, show current month
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase();
    selectedMonthTotal = expenses
      .filter(exp => exp.month === currentMonth)
      .reduce((sum, exp) => sum + exp.price, 0);
    selectedMonthLabel = 'Current Month';
  } else {
    // Show selected month
    selectedMonthTotal = filtered.reduce((sum, expense) => sum + expense.price, 0);
    selectedMonthLabel = monthMap[filterMonth] + ' Total';
  }
  
  document.getElementById('selected-month-total').textContent = selectedMonthTotal.toFixed(2);
  document.getElementById('selected-month-label').textContent = selectedMonthLabel;
  
  // 3. Average per Expense
  const averageExpense = filtered.length > 0 ? selectedMonthTotal / filtered.length : 0;
  document.getElementById('average-expense').textContent = averageExpense.toFixed(2);
  
  // Update stats text for average per expense
  const statsText = document.getElementById('expense-stats');
  if (filtered.length > 0) {
    const maxExpense = Math.max(...filtered.map(e => e.price));
    const minExpense = Math.min(...filtered.map(e => e.price));
    statsText.textContent = `Range: ₹${minExpense.toFixed(2)} - ₹${maxExpense.toFixed(2)}`;
  } else {
    statsText.textContent = '';
  }
  
  // 4. Average Daily
  const daysInMonth = getDaysInMonth(filterMonth);
  const averageDaily = selectedMonthTotal / daysInMonth;
  document.getElementById('average-daily').textContent = averageDaily.toFixed(2);
  
  // Update stats text for average daily
  const dailyStats = document.getElementById('daily-stats');
  dailyStats.textContent = `Based on ${daysInMonth} days`;
  
  // Update budget status based on selected month
  updateBudgetStatus();
}

// Get days in month based on filter
function getDaysInMonth(month) {
  if (month === 'all') {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    return new Date(currentYear, currentMonth, 0).getDate();
  }
  
  const monthMap = {
    january: 31, february: 28, march: 31, april: 30, may: 31, june: 30,
    july: 31, august: 31, september: 30, october: 31, november: 30, december: 31
  };
  
  return monthMap[month] || 30;
}

// Update budget status
function updateBudgetStatus() {
  const filterMonth = document.getElementById('filter-month').value;
  let monthToCheck = filterMonth;
  
  if (filterMonth === 'all') {
    monthToCheck = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase();
  }
  
  const monthTotal = expenses
    .filter(exp => exp.month === monthToCheck)
    .reduce((sum, exp) => sum + exp.price, 0);
  
  const budget = budgets[monthToCheck] || 0;
  const remaining = budget - monthTotal;
  const percentage = budget > 0 ? (monthTotal / budget) * 100 : 0;
  
  // Update budget section
  document.getElementById('budget-spent').textContent = `₹${monthTotal.toFixed(2)}`;
  document.getElementById('budget-remaining').textContent = `₹${remaining.toFixed(2)}`;
  document.getElementById('budget-progress-bar').style.width = `${Math.min(percentage, 100)}%`;
  
  // Update progress bar class
  const progressBar = document.querySelector('.budget-progress');
  progressBar.classList.remove('budget-warning', 'budget-danger');
  
  if (percentage >= 100) {
    progressBar.classList.add('budget-danger');
    document.getElementById('budget-status').textContent = 'Over Budget!';
    document.getElementById('budget-status').className = 'budget-status budget-danger';
  } else if (percentage >= 80) {
    progressBar.classList.add('budget-warning');
    document.getElementById('budget-status').textContent = 'Almost There';
    document.getElementById('budget-status').className = 'budget-status budget-warning';
  } else {
    document.getElementById('budget-status').textContent = 'Within Budget';
    document.getElementById('budget-status').className = 'budget-status budget-good';
  }
  
  // Update status text
  const statusText = document.getElementById('budget-status-text');
  if (budget > 0) {
    statusText.textContent = `${percentage.toFixed(1)}% of budget used`;
    statusText.style.color = percentage >= 100 ? '#e74c3c' : percentage >= 80 ? '#f39c12' : '#27ae60';
  } else {
    statusText.textContent = 'Set a budget to track spending';
    statusText.style.color = '#7f8c8d';
  }
}

// Update budget
function updateBudget() {
  const budgetInput = document.getElementById('monthly-budget');
  const budgetValue = parseFloat(budgetInput.value);
  const filterMonth = document.getElementById('filter-month').value;
  let monthToSet = filterMonth;
  
  if (filterMonth === 'all') {
    monthToSet = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase();
  }
  
  if (budgetValue && budgetValue > 0) {
    budgets[monthToSet] = budgetValue;
    saveData();
    updateBudgetStatus();
    showToast('Budget updated!', 'success');
  }
}

// Add custom category
function addCustomCategory() {
  const input = document.getElementById('new-category');
  const name = input.value.trim();
  
  if (!name) {
    showToast('Please enter category name', 'warning');
    return;
  }
  
  const newCategory = {
    id: 'custom_' + Date.now(),
    name: name,
    emoji: '🏷️'
  };
  
  customCategories.push(newCategory);
  saveData();
  initializeCategories();
  input.value = '';
  showToast('Category added!', 'success');
}

// Delete custom category
function deleteCustomCategory(id) {
  customCategories = customCategories.filter(cat => cat.id !== id);
  saveData();
  initializeCategories();
  showToast('Category deleted', 'danger');
}

// Update custom categories list
function updateCustomCategoriesList() {
  const container = document.getElementById('custom-categories');
  container.innerHTML = '';
  
  if (customCategories.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666; padding: 10px;">No custom categories yet</p>';
    return;
  }
  
  customCategories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.innerHTML = `
      <span>${cat.emoji} ${cat.name}</span>
      <button class="delete-btn" onclick="deleteCustomCategory('${cat.id}')" 
              style="padding: 3px 8px; font-size: 12px;">
        Delete
      </button>
    `;
    container.appendChild(div);
  });
}

// Tab navigation
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Remove active class from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName + '-tab').style.display = 'block';
  
  // Add active class to clicked button
  event.target.classList.add('active');
  
  // Update charts if showing charts tab
  if (tabName === 'charts') {
    setTimeout(() => {
      updateChart();
      updateMonthlyChart();
    }, 100);
  } else if (tabName === 'trends') {
    setTimeout(() => {
      updateTrendChart();
    }, 100);
  }
}

// Change chart type
function changeChartType(type, chartId) {
  // Update button states
  const buttons = event.target.parentElement.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Update the chart
  if (chartId === 'chart1') {
    updateChart();
  } else if (chartId === 'chart2') {
    updateMonthlyChart();
  }
}

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const icon = document.getElementById('theme-icon');
  const isDark = document.body.classList.contains('dark-mode');
  icon.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Setup theme
function setupTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('theme-icon').textContent = '☀️';
  }
}

// Set current month in form
function setCurrentMonth() {
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
                 'july', 'august', 'september', 'october', 'november', 'december'];
  const currentMonth = months[new Date().getMonth()];
  document.getElementById('month').value = currentMonth;
}

// Set current date in form
function setCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  document.getElementById('date').value = `${year}-${month}-${day}`;
}

// Export functions
function showExportModal() {
  document.getElementById('export-modal').style.display = 'flex';
}

function closeExportModal() {
  document.getElementById('export-modal').style.display = 'none';
}

function exportToCSV() {
  const filtered = getFilteredExpenses();
  const headers = ['Date', 'Month', 'Category', 'Item', 'Price', 'Remarks'];
  const csvContent = [
    headers.join(','),
    ...filtered.map(exp => [
      exp.date || '',
      monthMap[exp.month] || exp.month,
      exp.category,
      `"${exp.item}"`,
      exp.price,
      `"${exp.remarks || ''}"`
    ].join(','))
  ].join('\n');
  
  downloadFile(csvContent, 'expenses.csv', 'text/csv');
  closeExportModal();
  showToast('Exported to CSV!', 'success');
}

function exportToJSON() {
  const data = {
    expenses: expenses,
    budgets: budgets,
    customCategories: customCategories,
    exportedAt: new Date().toISOString()
  };
  
  downloadFile(JSON.stringify(data, null, 2), 'expenses_backup.json', 'application/json');
  closeExportModal();
  showToast('Data backup exported!', 'success');
}

function exportToPDF() {
  // Simple PDF generation using print
  window.print();
  closeExportModal();
  showToast('Use browser print to save as PDF', 'info');
}

function exportToText() {
  const filtered = getFilteredExpenses();
  const total = filtered.reduce((sum, exp) => sum + exp.price, 0);
  
  let text = `=== Expenses Report ===\n`;
  text += `Generated: ${new Date().toLocaleString()}\n`;
  text += `Total Expenses: ₹${total.toFixed(2)}\n`;
  text += `Number of Items: ${filtered.length}\n\n`;
  text += `=== Expenses List ===\n\n`;
  
  filtered.forEach((exp, index) => {
    text += `${index + 1}. ${exp.item}\n`;
    text += `   Price: ₹${exp.price.toFixed(2)}\n`;
    text += `   Category: ${exp.category}\n`;
    text += `   Month: ${monthMap[exp.month] || exp.month}\n`;
    if (exp.date) text += `   Date: ${new Date(exp.date).toLocaleDateString()}\n`;
    if (exp.remarks) text += `   Remarks: ${exp.remarks}\n`;
    text += `\n`;
  });
  
  downloadFile(text, 'expenses_report.txt', 'text/plain');
  closeExportModal();
  showToast('Text report exported!', 'success');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import CSV functionality
function triggerImport() {
  document.getElementById('csv-import-input').click();
}

function handleCSVImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const csvContent = e.target.result;
      const importedExpenses = parseCSV(csvContent);
      
      if (importedExpenses.length > 0) {
        // Add imported expenses to existing ones
        expenses = [...expenses, ...importedExpenses];
        saveData();
        updateUI();
        showToast(`Successfully imported ${importedExpenses.length} expenses!`, 'success');
      } else {
        showToast('No valid expenses found in CSV file', 'warning');
      }
    } catch (error) {
      showToast(`Error importing CSV: ${error.message}`, 'danger');
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  reader.readAsText(file);
}

function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const importedExpenses = [];
  
  // Check if CSV has headers
  const hasHeaders = lines[0].toLowerCase().includes('date') || 
                     lines[0].toLowerCase().includes('item') ||
                     lines[0].toLowerCase().includes('category');
  
  const startIndex = hasHeaders ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      // Handle CSV with quotes and commas
      const cells = parseCSVLine(line);
      
      if (cells.length >= 4) {
        let dateStr, month, item, category, price, remarks;
        
        // Try to auto-detect column order
        if (hasHeaders) {
          // Use first line to determine column order
          const headers = parseCSVLine(lines[0].toLowerCase());
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            if (header.includes('date')) dateStr = cells[j];
            else if (header.includes('month')) month = cells[j].toLowerCase();
            else if (header.includes('item')) item = cells[j];
            else if (header.includes('category')) category = cells[j].toLowerCase();
            else if (header.includes('price')) price = parseFloat(cells[j]);
            else if (header.includes('remark')) remarks = cells[j];
          }
        } else {
          // Assume order: Date, Month, Item, Category, Price, Remarks
          dateStr = cells[0];
          month = cells[1] ? cells[1].toLowerCase() : 'january';
          item = cells[2];
          category = cells[3] ? cells[3].toLowerCase() : 'miscellaneous';
          price = parseFloat(cells[4]);
          remarks = cells[5] || '';
        }
        
        if (item && category && price && !isNaN(price) && month) {
          // Validate month
          const validMonths = ['january', 'february', 'march', 'april', 'may', 'june',
                              'july', 'august', 'september', 'october', 'november', 'december'];
          
          if (!validMonths.includes(month)) {
            month = 'january'; // Default to January if invalid
          }
          
          const newExpense = {
            id: Date.now() + i, // Unique ID
            item: item.trim(),
            category: category.trim(),
            price: price,
            date: dateStr ? new Date(dateStr).toISOString().split('T')[0] : null,
            month: month,
            remarks: remarks ? remarks.trim() : '',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          };
          
          importedExpenses.push(newExpense);
        }
      }
    } catch (error) {
      console.warn(`Skipping line ${i + 1}: ${error.message}`);
    }
  }
  
  return importedExpenses;
}

function parseCSVLine(line) {
  const cells = [];
  let currentCell = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        // Escaped quote
        currentCell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      cells.push(currentCell);
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  
  cells.push(currentCell);
  return cells;
}

// Share report
function shareReport() {
  const filtered = getFilteredExpenses();
  const total = filtered.reduce((sum, exp) => sum + exp.price, 0);
  const filterMonth = document.getElementById('filter-month').value;
  
  let monthText = 'All Months';
  if (filterMonth !== 'all') {
    monthText = monthMap[filterMonth];
  }
  
  let text = `My ${monthText} Expenses Summary:\n`;
  text += `Total: ₹${total.toFixed(2)}\n`;
  text += `Items: ${filtered.length}\n\n`;
  text += `Top 5 Expenses:\n`;
  
  // Get top 5 expenses
  const top5 = [...filtered]
    .sort((a, b) => b.price - a.price)
    .slice(0, 5);
  
  top5.forEach((exp, i) => {
    text += `${i + 1}. ${exp.item}: ₹${exp.price.toFixed(2)}\n`;
  });
  
  text += `\nTracked using Smart Expenses Tracker`;
  
  // Try Web Share API
  if (navigator.share) {
    navigator.share({
      title: 'My Expenses Summary',
      text: text,
      url: window.location.href
    });
  } else {
    // Fallback to clipboard
    navigator.clipboard.writeText(text)
      .then(() => showToast('Report copied to clipboard!', 'success'))
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Report copied to clipboard!', 'success');
      });
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast';
  
  // Add type class
  toast.classList.add('show');
  
  if (type === 'success') toast.style.background = '#28a745';
  else if (type === 'warning') toast.style.background = '#ffc107';
  else if (type === 'danger') toast.style.background = '#e74c3c';
  else toast.style.background = '#2c3e50';
  
  // Auto hide
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Generate colors for charts
function generateColors(count) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
    '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56',
    '#9966FF', '#FF9F40', '#7CBF4B', '#E377C2'
  ];
  
  // Repeat colors if needed
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
}

// Calculate monthly data for trends
function calculateMonthlyData() {
  const monthlyData = {};
  expenses.forEach(exp => {
    monthlyData[exp.month] = (monthlyData[exp.month] || 0) + exp.price;
  });
  return monthlyData;
}

// Calculate category trends
function calculateCategoryTrends() {
  const categoryData = {};
  expenses.forEach(exp => {
    categoryData[exp.category] = (categoryData[exp.category] || 0) + exp.price;
  });
  return categoryData;
}

// Main update function
function updateUI() {
  updateTable();
  updateChart();
  updateMonthlyChart();
  updateTotals();
}
