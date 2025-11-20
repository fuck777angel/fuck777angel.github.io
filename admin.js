const JSONBIN_CONFIG = {
    API_KEY: '$2a$10$UJIWAm1R9zG.bfrGrfHUfuvZEkCXvtnBLKf70M7spW3yaR3XXMu0a', // Замени на свой API ключ
    BIN_ID: '691f09a0d0ea881f40f46c5c', // Замени на свой BIN ID
    BASE_URL: 'https://api.jsonbin.io/v3'
};

// Переменные
let users = [];
let expenses = [];
let selectedUsers = new Set();

const PRICES = {
    'Standart': 100000,
    'Balance Lite': 120000,
    'Диабет': 145000,
    'Energy Sport': 150000,
    'Power Sport': 210000,
    'Power XL': 250000,
    'Power 2XL': 300000,
    'Power 3XL': 350000,
    'Power 4XL': 400000
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

// ========== JSONBIN ФУНКЦИИ ==========
async function loadData() {
    try {
        const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/b/${JSONBIN_CONFIG.BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }

        const data = await response.json();
        users = data.record.users || [];
        expenses = data.record.expenses || [];

        renderUsers();
        updateStatistics();
        renderBazaarPage();
        
        // ДОБАВЬ ЭТУ СТРОКУ:
        renderPackageFilter();

        console.log('✅ Данные загружены:', { users: users.length, expenses: expenses.length });
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        alert('❌ Ошибка загрузки данных! Проверь API ключ и BIN ID');
    }
}

async function saveData() {
    try {
        const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/b/${JSONBIN_CONFIG.BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_CONFIG.API_KEY
            },
            body: JSON.stringify({
                users: users,
                expenses: expenses
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка сохранения данных');
        }

        console.log('✅ Данные сохранены');
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        alert('❌ Ошибка сохранения данных!');
    }
}
function getPackageStats() {
    const stats = {};
    
    // Считаем активных пользователей по пакетам
    users.filter(u => {
        const remaining = calculateDaysRemaining(u);
        return remaining >= 0 && !u.archived;
    }).forEach(user => {
        if (!stats[user.package]) {
            stats[user.package] = 0;
        }
        stats[user.package]++;
    });
    
    return stats;
}

function renderPackageFilter() {
    const stats = getPackageStats();
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    const filterSelect = document.getElementById('filterPackage');
    
    filterSelect.innerHTML = `
        <option value="">Все пакеты (${total})</option>
        <option value="Standart">Standart ${stats['Standart'] ? `(${stats['Standart']})` : '(0)'}</option>
        <option value="Balance Lite">Balance Lite ${stats['Balance Lite'] ? `(${stats['Balance Lite']})` : '(0)'}</option>
        <option value="Диабет">Диабет ${stats['Диабет'] ? `(${stats['Диабет']})` : '(0)'}</option>
        <option value="Energy Sport">Energy Sport ${stats['Energy Sport'] ? `(${stats['Energy Sport']})` : '(0)'}</option>
        <option value="Power Sport">Power Sport ${stats['Power Sport'] ? `(${stats['Power Sport']})` : '(0)'}</option>
        <option value="Power XL">Power XL ${stats['Power XL'] ? `(${stats['Power XL']})` : '(0)'}</option>
        <option value="Power 2XL">Power 2XL ${stats['Power 2XL'] ? `(${stats['Power 2XL']})` : '(0)'}</option>
        <option value="Power 3XL">Power 3XL ${stats['Power 3XL'] ? `(${stats['Power 3XL']})` : '(0)'}</option>
        <option value="Power 4XL">Power 4XL ${stats['Power 4XL'] ? `(${stats['Power 4XL']})` : '(0)'}</option>
    `;
}
// Автообновление данных каждые 5 секунд
setInterval(async () => {
    await loadData();
}, 5000);

function initApp() {
    loadTheme();
    
    const orderDateInput = document.getElementById('orderDate');
    if (orderDateInput) {
        orderDateInput.valueAsDate = new Date();
    }

    const expenseDateInput = document.getElementById('expenseDate');
    if (expenseDateInput) {
        expenseDateInput.valueAsDate = new Date();
    }

    loadData();
    updateDailyCountdown();
    setInterval(updateDailyCountdown, 60000);

    document.getElementById('addModal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    document.getElementById('expenseModal').addEventListener('click', function (e) {
        if (e.target === this) closeExpenseModal();
    });
}

// ========== ОСТАЛЬНЫЕ ФУНКЦИИ (БЕЗ ИЗМЕНЕНИЙ) ==========

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

window.toggleTheme = function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

window.exportData = function() {
    const data = {
        users: users,
        expenses: expenses,
        exportDate: new Date().toISOString(),
        version: '2.1'
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `greenfood-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('✅ Данные экспортированы!');
}

window.importData = function() {
    document.getElementById('importFile').click();
}

window.handleImport = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm(`Импортировать ${data.users?.length || 0} пользователей и ${data.expenses?.length || 0} расходов?`)) {
                users = data.users || [];
                expenses = data.expenses || [];
                await saveData();
                await loadData();
                alert('✅ Данные успешно импортированы!');
            }
        } catch (error) {
            alert('❌ Ошибка чтения файла!');
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

window.formatTelegram = function(input) {
    let value = input.value.trim();
    value = value.replace(/[^a-zA-Z0-9_@]/g, '');
    if (value && !value.startsWith('@')) value = '@' + value;
    input.value = value;
}

window.calculatePrice = function() {
    const packageSelect = document.getElementById('package');
    const daysInput = document.getElementById('days');
    const priceCalc = document.getElementById('priceCalculation');

    if (!packageSelect.value || !daysInput.value) {
        priceCalc.style.display = 'none';
        return;
    }

    const packageType = packageSelect.value;
    const days = parseInt(daysInput.value);
    const pricePerDay = PRICES[packageType];
    const basePrice = pricePerDay * days;

    let discount = 0;
    let discountPercent = 0;
    let discountLabel = '';

    if (days === 1) {
        discountPercent = 10;
        discountLabel = 'Скидка 10% (пробный день):';
    } else if (days >= 26) {
        discountPercent = 20;
        discountLabel = 'Скидка 20% (26 дней):';
    } else if (days >= 10) {
        discountPercent = 10;
        discountLabel = 'Скидка 10% (10+ дней):';
    }

    discount = (basePrice * discountPercent) / 100;
    const totalPrice = basePrice - discount;

    priceCalc.style.display = 'block';
    document.getElementById('basePrice').textContent = formatPrice(basePrice);
    document.getElementById('totalPrice').textContent = formatPrice(totalPrice);

    const discountRow = document.getElementById('discountRow');
    if (discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('discountLabel').textContent = discountLabel;
        document.getElementById('discountAmount').textContent = '-' + formatPrice(discount);
    } else {
        discountRow.style.display = 'none';
    }

    const bonusRow = document.getElementById('bonusRow');
    bonusRow.style.display = days === 26 ? 'flex' : 'none';

    return {
        basePrice,
        discount,
        discountPercent,
        totalPrice,
        days: days === 26 ? 30 : days,
        pricePerDay
    };
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price) + ' сум';
}
function renderPackageStatsCards() {
    const stats = getPackageStats();
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    const packages = [
        { name: 'Standart', color: '#3498db', icon: '📦' },
        { name: 'Balance Lite', color: '#9b59b6', icon: '⚖️' },
        { name: 'Диабет', color: '#e74c3c', icon: '💉' },
        { name: 'Energy Sport', color: '#f39c12', icon: '⚡' },
        { name: 'Power Sport', color: '#e67e22', icon: '💪' },
        { name: 'Power XL', color: '#1abc9c', icon: '🔥' },
        { name: 'Power 2XL', color: '#16a085', icon: '🚀' },
        { name: 'Power 3XL', color: '#27ae60', icon: '⭐' },
        { name: 'Power 4XL', color: '#2ecc71', icon: '👑' }
    ];
    
    const container = document.getElementById('packageStatsCards');
    if (!container) return;
    
    container.innerHTML = `
        <div class="package-stat-card total">
            <div class="stat-card-icon">👥</div>
            <div class="stat-card-info">
                <div class="stat-card-label">Всего активных</div>
                <div class="stat-card-value">${total}</div>
            </div>
        </div>
        ${packages.map(pkg => `
            <div class="package-stat-card" style="border-left-color: ${pkg.color};" onclick="filterByPackage('${pkg.name}')">
                <div class="stat-card-icon">${pkg.icon}</div>
                <div class="stat-card-info">
                    <div class="stat-card-label">${pkg.name}</div>
                    <div class="stat-card-value">${stats[pkg.name] || 0}</div>
                </div>
            </div>
        `).join('')}
    `;
}

window.filterByPackage = function(packageName) {
    document.getElementById('filterPackage').value = packageName;
    filterUsers();
}
window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    event.target.classList.add('active');

    if (pageId === 'users') {
        renderPackageStatsCards(); // ДОБАВЬ ЭТО
        renderUsersPage();
    }
    else if (pageId === 'statistics') updateStatistics();
    else if (pageId === 'expired') renderExpiredPage();
    else if (pageId === 'bazaar') renderBazaarPage();
}

window.openModal = function() {
    document.getElementById('addModal').classList.add('active');
    calculatePrice();
}

window.closeModal = function() {
    document.getElementById('addModal').classList.remove('active');
    document.getElementById('addUserForm').reset();
    document.getElementById('orderDate').valueAsDate = new Date();
    document.getElementById('priceCalculation').style.display = 'none';
}

window.openExpenseModal = function() {
    document.getElementById('expenseModal').classList.add('active');
}

window.closeExpenseModal = function() {
    document.getElementById('expenseModal').classList.remove('active');
    document.getElementById('addExpenseForm').reset();
    document.getElementById('expenseDate').valueAsDate = new Date();
}

window.addUser = async function(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const telegram = document.getElementById('telegram').value.trim();
    const packageType = document.getElementById('package').value;
    let days = parseInt(document.getElementById('days').value);
    const orderDate = document.getElementById('orderDate').value;

    const priceData = calculatePrice();

    const user = {
        id: Date.now(),
        firstName,
        lastName,
        phone,
        telegram: telegram || null,
        package: packageType,
        totalDays: priceData.days,
        orderedDays: days,
        orderDate,
        startDate: orderDate,
        paused: false,
        pausedDaysRemaining: null,
        archived: false,
        price: {
            basePrice: priceData.basePrice,
            discount: priceData.discount,
            discountPercent: priceData.discountPercent,
            totalPrice: priceData.totalPrice,
            pricePerDay: priceData.pricePerDay
        }
    };

    users.push(user);
    await saveData();
    await loadData();
    closeModal();
    alert('✅ Пользователь добавлен!');
}

window.addExpense = async function(e) {
    e.preventDefault();

    const description = document.getElementById('expenseDescription').value;
    const amount = parseInt(document.getElementById('expenseAmount').value);
    const date = document.getElementById('expenseDate').value;

    const expense = {
        id: Date.now(),
        description,
        amount,
        date,
        createdAt: new Date().toISOString()
    };

    expenses.push(expense);
    await saveData();
    await loadData();
    closeExpenseModal();
    alert('✅ Расход добавлен!');
}

window.deleteExpense = async function(expenseId) {
    if (confirm('Удалить этот расход?')) {
        expenses = expenses.filter(e => e.id !== expenseId);
        await saveData();
        await loadData();
    }
}

window.toggleUserSelection = function(userId) {
    const card = document.querySelector(`[data-user-id="${userId}"]`);
    if (selectedUsers.has(userId)) {
        selectedUsers.delete(userId);
        card.classList.remove('selected');
    } else {
        selectedUsers.add(userId);
        card.classList.add('selected');
    }
}

window.deleteSelected = async function() {
    if (selectedUsers.size === 0) {
        alert('Выберите пользователей для удаления');
        return;
    }

    if (confirm(`Удалить выбранных пользователей (${selectedUsers.size})?`)) {
        const userIds = Array.from(selectedUsers);
        users = users.filter(u => !userIds.includes(u.id));
        selectedUsers.clear();
        await saveData();
        await loadData();
    }
}

window.togglePause = async function(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (user.paused) {
        user.paused = false;
        if (user.originalStartDate && user.originalTotalDays) {
            user.startDate = user.originalStartDate;
            user.totalDays = user.originalTotalDays;
        } else {
            user.startDate = new Date().toISOString().split('T')[0];
            user.totalDays = user.pausedDaysRemaining;
        }
        user.pausedDaysRemaining = null;
        user.pausedDate = null;
    } else {
        const daysRemaining = calculateDaysRemaining(user);
        user.paused = true;
        user.pausedDaysRemaining = daysRemaining;
        user.pausedDate = new Date().toISOString().split('T')[0];
        if (!user.originalStartDate) {
            user.originalStartDate = user.startDate;
            user.originalTotalDays = user.totalDays;
        }
    }

    await saveData();
    await loadData();
}

function calculateDaysRemaining(user) {
    if (user.paused) return user.pausedDaysRemaining || 0;

    const start = new Date(user.startDate);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = now - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return user.totalDays - diffDays;
}

function getOverdueDays(user) {
    const remaining = calculateDaysRemaining(user);
    return remaining < 0 ? Math.abs(remaining) : 0;
}

function getOverdueAmount(user) {
    const overdueDays = getOverdueDays(user);
    if (overdueDays === 0) return 0;
    const pricePerDay = user.price?.pricePerDay || PRICES[user.package] || 0;
    return overdueDays * pricePerDay;
}

function calculateEndDate(user) {
    if (user.paused) return 'Приостановлено';
    const start = new Date(user.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + user.totalDays);
    return end.toLocaleDateString('ru-RU');
}

function getDaysRemainingClass(days) {
    if (days < 0) return 'expired';
    if (days <= 3) return 'danger';
    if (days <= 7) return 'warning';
    return '';
}

window.openTelegram = function(username) {
    const cleanUsername = username.replace('@', '');
    window.open(`https://t.me/${cleanUsername}`, '_blank');
}

window.archiveExpired = async function() {
    const expiredUsers = users.filter(u => {
        const remaining = calculateDaysRemaining(u);
        return remaining < 0 && !u.archived;
    });

    if (expiredUsers.length === 0) {
        alert('Нет просроченных подписок для архивации');
        return;
    }

    if (confirm(`Архивировать ${expiredUsers.length} просроченных подписок?`)) {
        expiredUsers.forEach(user => user.archived = true);
        await saveData();
        await loadData();
        alert('✅ Просроченные подписки архивированы!');
    }
}


function renderUsers() {
    const container = document.getElementById('mainUsersList');

    const activeUsers = users.filter(u => {
        const remaining = calculateDaysRemaining(u);
        return remaining >= 0 && !u.archived;
    });

    if (activeUsers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <p>Активных пользователей нет</p>
            </div>
        `;
        return;
    }

    container.innerHTML = activeUsers.map(user => createUserCardHTML(user, true)).join('');

    renderPackageFilter();
}

function renderExpiredPage() {
    const container = document.getElementById('expiredList');

    const expiredUsers = users.filter(u => {
        const remaining = calculateDaysRemaining(u);
        return remaining < 0 && !u.archived;
    });

    if (expiredUsers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>✅ Нет просроченных подписок</p>
            </div>
        `;
        return;
    }

    container.innerHTML = expiredUsers.map(user => createExpiredUserCardHTML(user)).join('');
}

function renderBazaarPage() {
    // Подсчет общего дохода
    const totalRevenue = users.reduce((sum, u) => sum + (u.price?.totalPrice || 0), 0);
    
    // Подсчет расходов
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Чистая прибыль
    const profit = totalRevenue - totalExpenses;

    document.getElementById('bazaarTotalRevenue').textContent = formatPrice(totalRevenue);
    document.getElementById('bazaarTotalExpenses').textContent = formatPrice(totalExpenses);
    document.getElementById('bazaarProfit').textContent = formatPrice(profit);

    // Отображение списка расходов
    const expensesList = document.getElementById('expensesList');
    
    if (expenses.length === 0) {
        expensesList.innerHTML = `
            <div class="empty-state">
                <p>📝 Расходов пока нет</p>
            </div>
        `;
        return;
    }

    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    expensesList.innerHTML = sortedExpenses.map(expense => `
        <div class="expense-card">
            <div class="expense-header">
                <div class="expense-description">${expense.description}</div>
                <button class="btn-delete-expense" onclick="deleteExpense(${expense.id})" title="Удалить">🗑️</button>
            </div>
            <div class="expense-info">
                <div class="info-row">
                    <span class="info-label">Дата:</span>
                    <span class="info-value">${new Date(expense.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Сумма:</span>
                    <span class="expense-amount">${formatPrice(expense.amount)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function createExpiredUserCardHTML(user) {
    const overdueDays = getOverdueDays(user);
    const overdueAmount = getOverdueAmount(user);

    return `
        <div class="user-card">
            <div class="status-paused" style="background: rgba(231, 76, 60, 0.1); border-left-color: #e74c3c;">
                ⚠️ Просрочено ${overdueDays} ${getDaysWord(overdueDays)}
            </div>
            
            <div class="user-header">
                <div class="user-name">${user.firstName} ${user.lastName}</div>
            </div>

            <div class="user-info">
                ${user.phone ? `
                <div class="info-row">
                    <span class="info-label">Телефон:</span>
                    <span class="info-value">
                        <a href="tel:${user.phone}" style="color: var(--text-primary); text-decoration: none;">
                            ${user.phone}
                        </a>
                    </span>
                </div>
                ` : ''}
                ${user.telegram ? `
                <div class="info-row">
                    <span class="info-label">Telegram:</span>
                    <a href="#" class="telegram-link" onclick="openTelegram('${user.telegram}'); return false;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.08 13.73l-2.97-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.827z"/>
                        </svg>
                        ${user.telegram}
                    </a>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-label">Пакет:</span>
                    <span class="package-badge">${user.package}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Дата окончания:</span>
                    <span class="info-value">${calculateEndDate(user)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Просрочено:</span>
                    <span class="overdue-badge">${overdueDays} ${getDaysWord(overdueDays)}</span>
                </div>
            </div>

            <div class="overdue-amount">
                <div class="overdue-amount-label">К оплате за просрочку:</div>
                <div class="overdue-amount-value">${formatPrice(overdueAmount)}</div>
            </div>

            ${user.telegram ? `
                <div class="user-actions" style="margin-top: 12px;">
                    <button class="btn btn-small btn-telegram" onclick="openTelegram('${user.telegram}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.08 13.73l-2.97-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.827z"/>
                        </svg>
                        Написать
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

function createUserCardHTML(user, withCheckbox = false) {
    const daysRemaining = calculateDaysRemaining(user);
    const endDate = calculateEndDate(user);
    const daysClass = getDaysRemainingClass(daysRemaining);
    const isExpired = daysRemaining < 0;

    let pauseInfo = '';
    if (user.paused && user.pausedDate) {
        const pausedDate = new Date(user.pausedDate).toLocaleDateString('ru-RU');
        pauseInfo = `⏸️ Подписка заморожена с ${pausedDate}`;
    }

    return `
        <div class="user-card ${selectedUsers.has(user.id) ? 'selected' : ''}" data-user-id="${user.id}">
            ${user.paused ? `<div class="status-paused">${pauseInfo}</div>` : ''}
            
            <div class="user-header">
                <div class="user-name">${user.firstName} ${user.lastName}</div>
                ${withCheckbox ? `
                <div class="checkbox-wrapper">
                    <input type="checkbox" ${selectedUsers.has(user.id) ? 'checked' : ''} 
                           onchange="toggleUserSelection(${user.id})">
                </div>
                ` : ''}
            </div>

            <div class="user-info">
                ${user.phone ? `
                <div class="info-row">
                    <span class="info-label">Телефон:</span>
                    <span class="info-value">
                        <a href="tel:${user.phone}" style="color: var(--text-primary); text-decoration: none;">
                            ${user.phone}
                        </a>
                    </span>
                </div>
                ` : ''}
                ${user.telegram ? `
                <div class="info-row">
                    <span class="info-label">Telegram:</span>
                    <a href="#" class="telegram-link" onclick="openTelegram('${user.telegram}'); return false;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.08 13.73l-2.97-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.827z"/>
                        </svg>
                        ${user.telegram}
                    </a>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-label">Пакет:</span>
                    <span class="package-badge">${user.package}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Заказано:</span>
                    <span class="info-value">${user.orderedDays} дней${user.orderedDays === 26 ? ' (+4 🎁)' : ''}</span>
                </div>
                ${user.price ? `
                <div class="info-row">
                    <span class="info-label">Стоимость:</span>
                    <span class="price-badge">${formatPrice(user.price.totalPrice)}</span>
                </div>
                ${user.price.discount > 0 ? `
                <div class="info-row">
                    <span class="info-label">Скидка:</span>
                    <span class="info-value" style="color: var(--accent-orange);">${user.price.discountPercent}% (-${formatPrice(user.price.discount)})</span>
                </div>
                ` : ''}
                ` : ''}
                <div class="info-row">
                    <span class="info-label">Дата заказа:</span>
                    <span class="info-value">${new Date(user.orderDate).toLocaleDateString('ru-RU')}</span>
                </div>
                ${!user.paused ? `
                <div class="info-row">
                    <span class="info-label">Начало подписки:</span>
                    <span class="info-value">${new Date(user.startDate).toLocaleDateString('ru-RU')}</span>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-label">Окончание:</span>
                    <span class="info-value ${user.paused ? 'paused-text' : ''}">${endDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Осталось:</span>
                    <span class="days-remaining ${user.paused ? '' : daysClass}">
                        ${isExpired ? `Просрочено ${Math.abs(daysRemaining)} ${getDaysWord(Math.abs(daysRemaining))}` : `${daysRemaining} ${getDaysWord(daysRemaining)}`}
                    </span>
                </div>
                ${user.paused ? `
                <div class="info-row">
                    <span class="info-label">Статус:</span>
                    <span class="info-value" style="color: var(--accent-orange); font-weight: 600;">
                        ❄️ Заморожено
                    </span>
                </div>
                ` : ''}
            </div>

            <div class="user-actions">
                ${user.telegram ? `
                    <button class="btn btn-small btn-telegram" onclick="openTelegram('${user.telegram}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.08 13.73l-2.97-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.827z"/>
                        </svg>
                        Перейти
                    </button>
                ` : ''}
                <button class="btn btn-small ${user.paused ? 'btn-resume' : 'btn-pause'}" 
                        onclick="togglePause(${user.id})">
                    ${user.paused ? '▶️ Продолжить' : '⏸️ Взять отгул'}
                </button>
            </div>
        </div>
    `;
}

function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const packageFilter = document.getElementById('filterPackage').value;

    const filtered = users.filter(user => {
        const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm);
        const matchesPackage = !packageFilter || user.package === packageFilter;
        const remaining = calculateDaysRemaining(user);
        return matchesSearch && matchesPackage && remaining >= 0 && !user.archived;
    });

    renderFilteredUsers(filtered);

    renderPackageFilter();

}

function renderFilteredUsers(filteredUsers) {
    const container = document.getElementById('usersList');

    if (filteredUsers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Пользователи не найдены</p>
            </div>
        `;
        return;
    }

    const activeUsers = filteredUsers.filter(u => !u.paused);
    const pausedUsers = filteredUsers.filter(u => u.paused);

    container.innerHTML = `
        ${activeUsers.length > 0 ? `
            <h2 style="margin-bottom: 16px; color: var(--accent-green);">Активные (${activeUsers.length})</h2>
            ${activeUsers.map(user => createUserCardHTML(user)).join('')}
        ` : ''}
        
        ${pausedUsers.length > 0 ? `
            <h2 style="margin: 24px 0 16px; color: var(--accent-orange);">На паузе (${pausedUsers.length})</h2>
            ${pausedUsers.map(user => createUserCardHTML(user)).join('')}
        ` : ''}
    `;
}

function renderUsersPage() {
    renderPackageStatsCards(); // ДОБАВЬ ЭТО
    renderFilteredUsers(users.filter(u => {
        const remaining = calculateDaysRemaining(u);
        return remaining >= 0 && !u.archived;
    }));
}

function getDaysWord(days) {
    days = Math.abs(days);
    if (days === 1 || (days > 20 && days % 10 === 1)) return 'день';
    if ((days > 1 && days < 5) || (days > 20 && days % 10 > 1 && days % 10 < 5)) return 'дня';
    return 'дней';
}

function updateStatistics() {
    const activeUsers = users.filter(u => {
        const remaining = calculateDaysRemaining(u);
        return remaining > 0 && !u.paused && !u.archived;
    }).length;

    const pausedUsers = users.filter(u => u.paused && !u.archived).length;

    const expiredUsersCount = users.filter(u => {
        const remaining = calculateDaysRemaining(u);
        return remaining < 0 && !u.archived;
    }).length;

    const totalRevenue = users.reduce((sum, u) => sum + (u.price?.totalPrice || 0), 0);

    const overdueRevenue = users.reduce((sum, u) => {
        return sum + getOverdueAmount(u);
    }, 0);

    document.getElementById('totalUsers').textContent = users.filter(u => !u.archived).length;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('pausedUsers').textContent = pausedUsers;
    document.getElementById('expiredUsersCount').textContent = expiredUsersCount;
    document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue);
    document.getElementById('overdueRevenue').textContent = formatPrice(overdueRevenue);

    const packageCounts = {};
    users.filter(u => !u.archived).forEach(u => {
        packageCounts[u.package] = (packageCounts[u.package] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(packageCounts), 1);
    const packageStatsHTML = Object.entries(packageCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([pkg, count]) => {
            const percentage = (count / maxCount) * 100;
            return `
                <div class="package-stat-item">
                    <div>
                        <strong>${pkg}</strong>
                        <div class="package-stat-bar" style="width: ${percentage}%; max-width: 200px;"></div>
                    </div>
                    <span>${count} шт</span>
                </div>
            `;
        }).join('');

    document.getElementById('packageStats').innerHTML = packageStatsHTML || '<p>Нет данных</p>';
}

function updateDailyCountdown() {
    renderUsers();
    
    const currentPage = document.querySelector('.page.active').id;
    if (currentPage === 'users') {
        renderUsersPage();
    } else if (currentPage === 'statistics') {
        updateStatistics();
    } else if (currentPage === 'expired') {
        renderExpiredPage();
    } else if (currentPage === 'bazaar') {
        renderBazaarPage();
    }
}
