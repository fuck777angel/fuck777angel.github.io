const USERS_AUTH = {
    'Admin': 'Admin4179900',
    'root': 'Root3509900'
};

document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
});

function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');

    if (isLoggedIn === 'true' && currentUser) {
        showMainApp(currentUser);
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp(username) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('currentUser').textContent = username;

    initApp();
}

function login(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    if (USERS_AUTH[username] && USERS_AUTH[username] === password) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', username);
        errorDiv.style.display = 'none';
        showMainApp(username);
    } else {
        errorDiv.textContent = '❌ Неверный логин или пароль';
        errorDiv.style.display = 'block';
    }
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        showLoginPage();
    }
}

class LocalDB {
    constructor(key) {
        this.key = key;
    }

    getAll() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    saveAll(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    add(item) {
        const data = this.getAll();
        item.id = Date.now();
        data.push(item);
        this.saveAll(data);
        return item;
    }

    update(id, updatedItem) {
        const data = this.getAll();
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updatedItem };
            this.saveAll(data);
            return data[index];
        }
        return null;
    }

    delete(ids) {
        const data = this.getAll();
        const filtered = data.filter(item => !ids.includes(item.id));
        this.saveAll(filtered);
        return true;
    }

    clear() {
        localStorage.removeItem(this.key);
    }
}

const db = new LocalDB('greenfoodUsers');
let users = [];
let selectedUsers = new Set();

const PRICES = {
    'Standart': 100000,
    'Balance Lite': 115000,
    'Energy Sport': 150000,
    'Power Sport': 210000,
    'Power XL': 250000,
    'Power 2XL': 300000,
    'Power 3XL': 350000,
    'Power 4XL': 400000
};

function initApp() {
    loadTheme();
    
    const orderDateInput = document.getElementById('orderDate');
    if (orderDateInput) {
        orderDateInput.valueAsDate = new Date();
    }

    loadUsers();
    updateDailyCountdown();

    setInterval(updateDailyCountdown, 60000);

    document.getElementById('addModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

function loadUsers() {
    users = db.getAll();
    renderUsers();
    updateStatistics();
}

function saveUser(user) {
    return db.add(user);
}

function updateUser(id, updatedData) {
    return db.update(id, updatedData);
}

function deleteUsers(ids) {
    return db.delete(ids);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function exportData() {
    const data = {
        users: db.getAll(),
        exportDate: new Date().toISOString(),
        version: '2.0'
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

function importData() {
    document.getElementById('importFile').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm(`Импортировать ${data.users?.length || 0} пользователей? Текущие данные будут заменены!`)) {
                db.saveAll(data.users || []);
                loadUsers();
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

function formatTelegram(input) {
    let value = input.value.trim();
    value = value.replace(/[^a-zA-Z0-9_@]/g, '');
    
    if (value && !value.startsWith('@')) {
        value = '@' + value;
    }
    
    input.value = value;
}

function calculatePrice() {
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
    if (days === 26) {
        bonusRow.style.display = 'flex';
    } else {
        bonusRow.style.display = 'none';
    }

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

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(pageId).classList.add('active');
    event.target.classList.add('active');

    if (pageId === 'users') {
        renderUsersPage();
    } else if (pageId === 'statistics') {
        updateStatistics();
    } else if (pageId === 'expired') {
        renderExpiredPage();
    }
}

function openModal() {
    document.getElementById('addModal').classList.add('active');
    calculatePrice();
}

function closeModal() {
    document.getElementById('addModal').classList.remove('active');
    document.getElementById('addUserForm').reset();
    document.getElementById('orderDate').valueAsDate = new Date();
    document.getElementById('priceCalculation').style.display = 'none';
}

function addUser(e) {
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

    saveUser(user);
    loadUsers();
    closeModal();
}

function toggleUserSelection(userId) {
    const card = document.querySelector(`[data-user-id="${userId}"]`);

    if (selectedUsers.has(userId)) {
        selectedUsers.delete(userId);
        card.classList.remove('selected');
    } else {
        selectedUsers.add(userId);
        card.classList.add('selected');
    }
}

function deleteSelected() {
    if (selectedUsers.size === 0) {
        alert('Выберите пользователей для удаления');
        return;
    }

    if (confirm(`Удалить выбранных пользователей (${selectedUsers.size})?`)) {
        const userIds = Array.from(selectedUsers);
        deleteUsers(userIds);
        selectedUsers.clear();
        loadUsers();
    }
}

function togglePause(userId) {
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

    updateUser(user.id, user);
    loadUsers();

    if (document.getElementById('users').classList.contains('active')) {
        renderUsersPage();
    }
}

function calculateDaysRemaining(user) {
    if (user.paused) {
        return user.pausedDaysRemaining || 0;
    }

    const start = new Date(user.startDate);
    start.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffTime = now - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = user.totalDays - diffDays;

    return remaining; 
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
    if (user.paused) {
        return 'Приостановлено';
    }

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

function openTelegram(username) {
    const cleanUsername = username.replace('@', '');
    window.open(`https://t.me/${cleanUsername}`, '_blank');
}

function archiveExpired() {
    const expiredUsers = users.filter(u => {
        const remaining = calculateDaysRemaining(u);
        return remaining < 0 && !u.archived;
    });

    if (expiredUsers.length === 0) {
        alert('Нет просроченных подписок для архивации');
        return;
    }

    if (confirm(`Архивировать ${expiredUsers.length} просроченных подписок?`)) {
        expiredUsers.forEach(user => {
            user.archived = true;
            updateUser(user.id, user);
        });
        loadUsers();
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
    }
}
