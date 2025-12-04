// База данных пользователей (в реальном приложении должна быть на сервере)
const userDatabase = {
    'admin': {
        password: 'admin123',
        name: 'Администратор',
        role: 'admin',
        accessLevel: 3
    },
    'student': {
        password: 'student123',
        name: 'Студент Иванов',
        role: 'student',
        accessLevel: 1
    },
    'teacher': {
        password: 'teacher123',
        name: 'Преподаватель Петрова',
        role: 'teacher',
        accessLevel: 2
    },
    'user': {
        password: 'password123',
        name: 'Пользователь Сидоров',
        role: 'user',
        accessLevel: 1
    },
    'test': {
        password: 'test123',
        name: 'Тестовый Аккаунт',
        role: 'student',
        accessLevel: 1
    }
};

// Функция проверки логина и пароля
function authenticateUser(username, password) {
    const user = userDatabase[username.toLowerCase()];
    
    if (user && user.password === password) {
        return {
            success: true,
            user: {
                username: username.toLowerCase(),
                name: user.name,
                role: user.role,
                accessLevel: user.accessLevel
            }
        };
    }
    
    return {
        success: false,
        error: 'Неверный логин или пароль'
    };
}

// Функция сохранения сессии
function saveUserSession(userData) {
    const sessionData = {
        username: userData.username,
        name: userData.name,
        role: userData.role,
        accessLevel: userData.accessLevel,
        timestamp: Date.now(),
        sessionId: generateSessionId()
    };
    
    localStorage.setItem('vguvt_session', JSON.stringify(sessionData));
    return sessionData.sessionId;
}

// Функция проверки сессии
function checkUserSession() {
    const sessionData = localStorage.getItem('vguvt_session');
    
    if (!sessionData) {
        return null;
    }
    
    try {
        const session = JSON.parse(sessionData);
        const sessionAge = Date.now() - session.timestamp;
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 часа
        
        if (sessionAge > maxSessionAge) {
            localStorage.removeItem('vguvt_session');
            return null;
        }
        
        return session;
    } catch (error) {
        localStorage.removeItem('vguvt_session');
        return null;
    }
}

// Функция выхода из системы
function logoutUser() {
    localStorage.removeItem('vguvt_session');
    localStorage.removeItem('vguvt_codes');
    window.location.href = 'index.html';
}

// Генерация ID сессии
function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Генерация кода доступа
function generateAccessCode(userData) {
    const prefix = getCodePrefix(userData.role);
    const timestamp = Date.now().toString().substr(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    return `${prefix}-${timestamp}-${random}`;
}

// Префикс кода в зависимости от роли
function getCodePrefix(role) {
    const prefixes = {
        'admin': 'ADM',
        'teacher': 'TCH',
        'student': 'STU',
        'user': 'USR'
    };
    
    return prefixes[role] || 'GEN';
}

// Сохранение истории кодов
function saveCodeHistory(codeData) {
    let history = JSON.parse(localStorage.getItem('vguvt_codes') || '[]');
    
    // Добавляем новый код в начало массива
    history.unshift(codeData);
    
    // Ограничиваем историю последними 10 кодами
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem('vguvt_codes', JSON.stringify(history));
    return history;
}

// Получение истории кодов
function getCodeHistory() {
    return JSON.parse(localStorage.getItem('vguvt_codes') || '[]');
}

// Экспорт функций для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authenticateUser,
        saveUserSession,
        checkUserSession,
        logoutUser,
        generateAccessCode,
        saveCodeHistory,
        getCodeHistory
    };
}