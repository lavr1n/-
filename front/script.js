// DOM элементы
let loginForm, usernameInput, passwordInput, togglePasswordBtn;
let notification, errorNotification, errorMessage;

// Демо учетные данные (в реальном приложении будут проверяться на сервере)
const demoAccounts = {
    'admin': 'admin123',
    'student': 'student123',
    'teacher': 'teacher123',
    'user': 'password123',
    'test': 'test123'
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Получение DOM элементов
    loginForm = document.getElementById('loginForm');
    usernameInput = document.getElementById('username');
    passwordInput = document.getElementById('password');
    togglePasswordBtn = document.getElementById('togglePassword');
    notification = document.getElementById('notification');
    errorNotification = document.getElementById('errorNotification');
    errorMessage = document.getElementById('errorMessage');

    // Настройка событий
    setupEventListeners();

    // Автофокус на поле логина
    setTimeout(() => usernameInput.focus(), 300);

    // Вывод демо-данных в консоль для тестирования
    consoleDemoAccounts();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение видимости пароля
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    
    // Обработка отправки формы
    loginForm.addEventListener('submit', handleLoginSubmit);
    
    // Быстрый вход по Enter
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
    
    // Оптимизация для мобильных
    setupMobileOptimizations();
}

// Переключение видимости пароля
function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Изменение иконки
    const icon = togglePasswordBtn.querySelector('i');
    if (type === 'text') {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
    
    // Вибрация на мобильных устройствах
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
}

// Обработка входа
function handleLoginSubmit(e) {
    e.preventDefault();
    
    // Получение данных формы
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Валидация
    if (!validateForm(username, password)) {
        return;
    }
    
    // Показать индикатор загрузки
    showLoading(true);
    
    // Имитация запроса к серверу
    setTimeout(() => {
        processLogin(username, password);
        showLoading(false);
    }, 1200);
}

// Валидация формы
function validateForm(username, password) {
    if (!username) {
        showError('Введите логин', usernameInput);
        return false;
    }
    
    if (!password) {
        showError('Введите пароль', passwordInput);
        return false;
    }
    
    if (password.length < 6) {
        showError('Пароль должен содержать минимум 6 символов', passwordInput);
        return false;
    }
    
    return true;
}

// Обработка логина
function processLogin(username, password) {
    const normalizedUsername = username.toLowerCase();
    
    // Проверка демо-аккаунтов
    if (demoAccounts[normalizedUsername] === password) {
        // Успешный вход
        showSuccess();
        
        // Перенаправление (имитация)
        setTimeout(() => {
            simulateRedirect(username);
        }, 1500);
        
    } else {
        // Неверные учетные данные
        showError('Неверный логин или пароль');
        highlightInvalidFields();
    }
}

// Показать/скрыть индикатор загрузки
function showLoading(show) {
    const submitButton = loginForm.querySelector('.btn-login');
    
    if (show) {
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        submitButton.disabled = true;
    } else {
        submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
        submitButton.disabled = false;
    }
}

// Показать уведомление об успехе
function showSuccess() {
    notification.style.display = 'block';
    errorNotification.style.display = 'none';
    
    // Автоскрытие
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
    
    // Вибрация успеха
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Показать уведомление об ошибке
function showError(message, element = null) {
    errorMessage.textContent = message;
    errorNotification.style.display = 'block';
    notification.style.display = 'none';
    
    // Автоскрытие
    setTimeout(() => {
        errorNotification.style.display = 'none';
    }, 4000);
    
    // Вибрация ошибки
    if (navigator.vibrate) {
        navigator.vibrate([200]);
    }
    
    // Фокус на ошибочном поле
    if (element) {
        element.focus();
    }
}

// Подсветка неверных полей
function highlightInvalidFields() {
    usernameInput.style.borderColor = '#e53e3e';
    passwordInput.style.borderColor = '#e53e3e';
    
    setTimeout(() => {
        usernameInput.style.borderColor = '';
        passwordInput.style.borderColor = '';
    }, 3000);
}

// Имитация перенаправления
function simulateRedirect(username) {
    // В реальном приложении здесь будет window.location.href
    alert(`Добро пожаловать, ${username}! Вход выполнен успешно.`);
    
    // Сброс формы (для демо)
    setTimeout(() => {
        loginForm.reset();
        usernameInput.focus();
    }, 2000);
}

// Оптимизации для мобильных
function setupMobileOptimizations() {
    // Предотвращение масштабирования при фокусе
    const inputs = [usernameInput, passwordInput];
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            document.querySelector('meta[name="viewport"]').content = 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0';
        });
        
        input.addEventListener('blur', function() {
            document.querySelector('meta[name="viewport"]').content = 
                'width=device-width, initial-scale=1.0';
        });
    });
    
    // Оптимизация ввода
    usernameInput.setAttribute('autocapitalize', 'none');
    usernameInput.setAttribute('autocorrect', 'off');
    usernameInput.setAttribute('spellcheck', 'false');
}

// Вывод демо-аккаунтов в консоль
function consoleDemoAccounts() {
    console.log('%c=== ВГУВТ - Демо аккаунты 2025 ===', 'color: #0d68b5; font-weight: bold; font-size: 14px;');
    console.log('%cДля тестирования системы используйте:', 'color: #4a5568;');
    console.log('%c• Логин: admin, Пароль: admin123', 'color: #2d3748;');
    console.log('%c• Логин: student, Пароль: student123', 'color: #2d3748;');
    console.log('%c• Логин: teacher, Пароль: teacher123', 'color: #2d3748;');
    console.log('%c• Логин: user, Пароль: password123', 'color: #2d3748;');
    console.log('%c• Логин: test, Пароль: test123', 'color: #2d3748;');
    console.log('%c================================', 'color: #0d68b5; font-weight: bold;');
}

// Обработка изменения ориентации
window.addEventListener('orientationchange', function() {
    // Небольшая задержка для стабилизации
    setTimeout(() => {
        if (window.visualViewport) {
            const isLandscape = window.innerWidth > window.innerHeight;
            
            if (isLandscape && window.innerHeight < 500) {
                document.body.classList.add('landscape-mode');
            } else {
                document.body.classList.remove('landscape-mode');
            }
        }
    }, 100);
});

// PWA функциональность (опционально)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').catch(function(error) {
            console.log('Service Worker registration failed:', error);
        });
    });
}
// Обновляем файл script.js для работы с системой авторизации

// В начало файла добавляем импорт auth.js (если используется модули)
// или добавляем функции прямо в файл

// Добавляем в начало файла перед DOMContentLoaded:
const userDatabase = {
    'admin': { password: 'admin123', name: 'Администратор', role: 'admin' },
    'student': { password: 'student123', name: 'Студент Иванов', role: 'student' },
    'teacher': { password: 'teacher123', name: 'Преподаватель Петрова', role: 'teacher' },
    'user': { password: 'password123', name: 'Пользователь Сидоров', role: 'user' },
    'test': { password: 'test123', name: 'Тестовый Аккаунт', role: 'student' }
};

// Обновляем функцию processLogin в script.js:
function processLogin(username, password) {
    const normalizedUsername = username.toLowerCase();
    
    // Проверка в базе данных
    if (userDatabase[normalizedUsername] && userDatabase[normalizedUsername].password === password) {
        // Успешный вход
        showSuccess();
        
        // Сохраняем сессию
        const userData = {
            username: normalizedUsername,
            name: userDatabase[normalizedUsername].name,
            role: userDatabase[normalizedUsername].role
        };
        
        // Сохраняем в localStorage
        localStorage.setItem('vguvt_session', JSON.stringify({
            ...userData,
            timestamp: Date.now(),
            sessionId: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        }));
        
        // Перенаправление на dashboard.html через 1.5 секунды
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } else {
        // Неверные учетные данные
        showError('Неверный логин или пароль');
        highlightInvalidFields();
    }
}