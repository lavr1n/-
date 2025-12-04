// DOM элементы
let currentUserElement, userNameElement, accessCodeElement;
let generateDateElement, expiryDateElement, generateButton, copyButton;
let codeHistoryElement, confirmModal, notification;

// Данные пользователя
let currentUser = null;
let currentSession = null;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    checkAuthorization();
    
    // Получение DOM элементов
    getDOMElements();
    
    // Настройка событий
    setupEventListeners();
    
    // Инициализация страницы
    initializePage();
    
    // Генерация начального кода
    generateNewCode();
});

// Проверка авторизации
function checkAuthorization() {
    currentSession = checkUserSession();
    
    if (!currentSession) {
        // Если нет активной сессии, перенаправляем на страницу входа
        window.location.href = 'index.html';
        return;
    }
    
    // Получаем данные пользователя из базы
    const userData = userDatabase[currentSession.username];
    if (!userData) {
        logoutUser();
        return;
    }
    
    currentUser = {
        username: currentSession.username,
        name: userData.name,
        role: userData.role,
        accessLevel: userData.accessLevel
    };
}

// Получение DOM элементов
function getDOMElements() {
    currentUserElement = document.getElementById('currentUser');
    userNameElement = document.getElementById('userName');
    accessCodeElement = document.getElementById('accessCode');
    generateDateElement = document.getElementById('generationDate');
    expiryDateElement = document.getElementById('expiryDate');
    generateButton = document.getElementById('generateCode');
    copyButton = document.getElementById('copyCode');
    codeHistoryElement = document.getElementById('codeHistory');
    confirmModal = document.getElementById('confirmModal');
    notification = document.getElementById('notification');
}

// Настройка событий
function setupEventListeners() {
    // Кнопка генерации нового кода
    generateButton.addEventListener('click', showConfirmModal);
    
    // Кнопка копирования кода
    copyButton.addEventListener('click', copyAccessCode);
    
    // Кнопки в модальном окне
    document.getElementById('confirmGenerate').addEventListener('click', confirmGenerateCode);
    document.getElementById('confirmCancel').addEventListener('click', closeModal);
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    
    // Закрытие модального окна при клике вне его
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            closeModal();
        }
    });
    
    // Кнопка выхода
    document.querySelector('.back-link').addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
    });
    
    // Обработка клавиши Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && confirmModal.style.display === 'flex') {
            closeModal();
        }
        
        // Быстрое копирование по Ctrl+C
        if (e.ctrlKey && e.key === 'c' && accessCodeElement.textContent !== '--- ---') {
            copyAccessCode();
        }
        
        // Быстрая генерация по Ctrl+G
        if (e.ctrlKey && e.key === 'g') {
            showConfirmModal();
        }
    });
}

// Инициализация страницы
function initializePage() {
    if (!currentUser) return;
    
    // Отображение информации о пользователе
    currentUserElement.textContent = currentUser.name;
    userNameElement.textContent = currentUser.name;
    
    // Загрузка истории кодов
    loadCodeHistory();
    
    // Установка текущей даты
    updateDates();
}

// Генерация нового кода
function generateNewCode() {
    if (!currentUser) return;
    
    // Генерация кода
    const code = generateAccessCode(currentUser);
    accessCodeElement.textContent = code;
    
    // Дата генерации
    const now = new Date();
    const generationDate = formatDateTime(now);
    generateDateElement.textContent = generationDate;
    
    // Дата истечения срока (24 часа)
    const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    expiryDateElement.textContent = formatDateTime(expiryDate);
    
    // Сохранение в историю
    const codeData = {
        code: code,
        generated: now.toISOString(),
        expires: expiryDate.toISOString(),
        user: currentUser.username
    };
    
    saveCodeHistory(codeData);
    
    // Обновление истории на странице
    loadCodeHistory();
    
    // Показать уведомление
    showNotification('Новый код сгенерирован');
}

// Показать модальное окно подтверждения
function showConfirmModal() {
    confirmModal.style.display = 'flex';
}

// Закрыть модальное окно
function closeModal() {
    confirmModal.style.display = 'none';
}

// Подтверждение генерации нового кода
function confirmGenerateCode() {
    closeModal();
    generateNewCode();
}

// Копирование кода в буфер обмена
function copyAccessCode() {
    const code = accessCodeElement.textContent;
    
    if (code === '--- ---') {
        showNotification('Сначала сгенерируйте код', 'error');
        return;
    }
    
    navigator.clipboard.writeText(code)
        .then(() => {
            showNotification('Код скопирован в буфер обмена');
            
            // Визуальная обратная связь
            copyButton.innerHTML = '<i class="fas fa-check"></i> Скопировано';
            copyButton.classList.add('copied');
            
            setTimeout(() => {
                copyButton.innerHTML = '<i class="fas fa-copy"></i> Копировать код';
                copyButton.classList.remove('copied');
            }, 2000);
        })
        .catch(err => {
            console.error('Ошибка копирования:', err);
            showNotification('Не удалось скопировать код', 'error');
        });
}

// Загрузка истории кодов
function loadCodeHistory() {
    const history = getCodeHistory();
    
    if (history.length === 0) {
        codeHistoryElement.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-code"></i>
                <p>Здесь будет отображаться история ваших кодов</p>
            </div>
        `;
        return;
    }
    
    // Фильтруем историю текущего пользователя
    const userHistory = history.filter(item => item.user === currentUser.username);
    
    if (userHistory.length === 0) {
        codeHistoryElement.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-history"></i>
                <p>История кодов пуста</p>
            </div>
        `;
        return;
    }
    
    // Создаем HTML для истории
    let historyHTML = '';
    
    userHistory.forEach((item, index) => {
        const generated = new Date(item.generated);
        const expires = new Date(item.expires);
        const now = new Date();
        const isActive = expires > now;
        
        historyHTML += `
            <div class="history-item ${isActive ? 'active' : 'expired'}">
                <div class="history-code">
                    <div class="code-value">${item.code}</div>
                    <div class="code-status">
                        <span class="status-badge ${isActive ? 'active' : 'expired'}">
                            ${isActive ? 'Активен' : 'Истек'}
                        </span>
                    </div>
                </div>
                <div class="history-dates">
                    <div class="history-date">
                        <i class="fas fa-calendar-plus"></i>
                        Создан: ${formatDateTime(generated)}
                    </div>
                    <div class="history-date">
                        <i class="fas fa-calendar-times"></i>
                        Истекает: ${formatDateTime(expires)}
                    </div>
                </div>
                <div class="history-actions">
                    <button class="btn-history-copy" data-code="${item.code}">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    codeHistoryElement.innerHTML = historyHTML;
    
    // Добавляем обработчики для кнопок копирования в истории
    document.querySelectorAll('.btn-history-copy').forEach(button => {
        button.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            navigator.clipboard.writeText(code)
                .then(() => {
                    showNotification(`Код ${code} скопирован`);
                })
                .catch(err => {
                    console.error('Ошибка копирования:', err);
                });
        });
    });
}

// Форматирование даты и времени
function formatDateTime(date) {
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Обновление дат
function updateDates() {
    const now = new Date();
    document.getElementById('generationDate').textContent = formatDateTime(now);
    
    const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    document.getElementById('expiryDate').textContent = formatDateTime(expiryDate);
}

// Показать уведомление
function showNotification(message, type = 'success') {
    const notificationElement = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');
    
    messageElement.textContent = message;
    
    // Устанавливаем класс в зависимости от типа
    const contentElement = notificationElement.querySelector('.notification-content');
    contentElement.className = `notification-content ${type}`;
    
    // Меняем иконку
    const iconElement = contentElement.querySelector('i');
    iconElement.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    
    // Показываем уведомление
    notificationElement.style.display = 'block';
    
    // Автоскрытие через 3 секунды
    setTimeout(() => {
        notificationElement.style.display = 'none';
    }, 3000);
    
    // Вибрация на мобильных
    if (navigator.vibrate) {
        navigator.vibrate(type === 'success' ? [100, 50, 100] : [200]);
    }
}

// Обновление страницы каждую минуту (для обновления статуса кодов)
setInterval(() => {
    updateDates();
    loadCodeHistory();
}, 60000);

// Демо информация в консоль
console.log('%c=== ВГУВТ - Личный кабинет ===', 'color: #0d68b5; font-weight: bold;');
console.log('%cДобро пожаловать в систему генерации кодов доступа', 'color: #4a5568;');
console.log('%cГенерируйте коды, копируйте их и отслеживайте историю', 'color: #4a5568;');