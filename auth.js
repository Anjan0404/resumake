/**
 * ResuMake - Authentication & Session Management Module
 */

// Helper to show custom toasts (will be connected to app.js toast UI)
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'danger') iconName = 'alert-triangle';

    toast.innerHTML = `
        <div class="toast-icon">
            <i data-lucide="${iconName}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);
    
    // Initialize icons for the toast
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Slide out and remove toast after 3.5s
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1)';
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3500);
}

// Add animation rule in stylesheet context dynamically if not present
if (!document.getElementById('toast-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-animation-styles';
    style.innerHTML = `
        @keyframes toast-out {
            to { transform: translateY(-20px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

const USERS_KEY = 'resumake_users';
const SESSION_KEY = 'resumake_current_user';

const Auth = {
    // Get all registered users from localStorage
    getUsers() {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    },

    // Save a new user
    register(name, email, password) {
        const users = this.getUsers();
        
        // Validation: email format verification
        const normalizedEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            showToast('Registration Failed', 'Please enter a valid email address.', 'danger');
            return false;
        }

        // Validation: email must be unique
        const userExists = users.some(u => u.email === normalizedEmail);
        
        if (userExists) {
            showToast('Registration Failed', 'Email address is already registered.', 'danger');
            return false;
        }

        // Validate password length
        if (password.length < 6) {
            showToast('Weak Password', 'Password must be at least 6 characters.', 'danger');
            return false;
        }

        const newUser = {
            id: 'usr_' + Math.random().toString(36).substring(2, 11),
            name: name.trim(),
            email: normalizedEmail,
            password: password, // Note: In a production app, never store plain text passwords.
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        showToast('Success!', 'Your account has been created. You can now login.', 'success');
        return true;
    },

    // Login an existing user
    login(email, password) {
        const users = this.getUsers();
        const normalizedEmail = email.toLowerCase().trim();

        // Validation: email format verification
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            showToast('Login Failed', 'Please enter a valid email address.', 'danger');
            return false;
        }
        
        const user = users.find(u => u.email === normalizedEmail && u.password === password);
        
        if (!user) {
            showToast('Login Failed', 'Invalid email or password.', 'danger');
            return false;
        }

        // Store active session in localStorage (persistent across browser restarts)
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email
        }));

        showToast('Welcome Back!', `Signed in as ${user.name}`, 'success');
        return true;
    },

    // Logout
    logout() {
        localStorage.removeItem(SESSION_KEY);
        showToast('Signed Out', 'You have been successfully logged out.', 'info');
        return true;
    },

    // Get current logged-in user
    getCurrentUser() {
        const userJson = localStorage.getItem(SESSION_KEY);
        return userJson ? JSON.parse(userJson) : null;
    },

    // Check if session is active
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }
};
