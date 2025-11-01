// =====================================================
// KALAKAR LANDING PAGE - JAVASCRIPT
// Functionality: Hamburger menu, smooth scrolling
// =====================================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeHamburgerMenu();
    initializeSmoothScroll();
    initializeGetStartedButtons();
    checkUserSession();
    initializeLogoutButtons();
});

// ===== HAMBURGER MENU FUNCTIONALITY =====
function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const mobileCta = document.querySelector('.mobile-cta');

    // Toggle menu when hamburger clicked
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    // Close menu when overlay clicked
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function() {
            closeMobileMenu();
        });
    }

    // Close menu when nav link clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    // Close menu when CTA button clicked (in mobile menu)
    if (mobileCta) {
        mobileCta.addEventListener('click', function() {
            closeMobileMenu();
        });
    }
}

// Toggle mobile menu open/close
function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const body = document.body;

    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    menuOverlay.classList.toggle('open');

    // Prevent body scroll when menu is open
    if (mobileMenu.classList.contains('open')) {
        body.classList.add('menu-open');
    } else {
        body.classList.remove('menu-open');
    }
}

// Close mobile menu
function closeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const body = document.body;

    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
    body.classList.remove('menu-open');
}

// ===== SMOOTH SCROLL NAVIGATION =====
function initializeSmoothScroll() {
    // Get all navigation links (both desktop and mobile)
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Check if it's an anchor link
            if (href.startsWith('#')) {
                e.preventDefault();

                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Use smooth scrolling
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Close mobile menu if open
                    closeMobileMenu();
                }
            }
        });
    });
}

// ===== GET STARTED BUTTON FUNCTIONALITY =====
function initializeGetStartedButtons() {
    // Only target buttons that are specifically for getting started (not back buttons)
    const ctaButtons = document.querySelectorAll('.cta-button:not([onclick])');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Check if button is inside a form (for login page form submission)
            if (this.closest('form')) {
                return;
            }

            // Navigate to login page
            e.preventDefault();
            window.location.href = 'login.html';
        });
    });
}

// ===== UTILITY: CLOSE MENU ON ESCAPE KEY =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

// ===== UTILITY: PREVENT MENU CLOSING ON INNER CLICK =====
const mobileMenu = document.querySelector('.mobile-menu');
if (mobileMenu) {
    mobileMenu.addEventListener('click', function(e) {
        // Prevent closing when clicking inside the menu itself
        e.stopPropagation();
    });
}

// ===== USER SESSION MANAGEMENT =====
function checkUserSession() {
    const userData = sessionStorage.getItem('kalakarUser');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const myAccountSection = document.getElementById('myAccountSection');
    const accountEmail = document.getElementById('accountEmail');

    const mobileGetStartedBtn = document.getElementById('mobileGetStartedBtn');
    const mobileMyAccountSection = document.getElementById('mobileMyAccountSection');
    const mobileAccountEmail = document.getElementById('mobileAccountEmail');

    // Hero section buttons
    const heroGetStarted = document.getElementById('heroGetStarted');
    const heroDashboard = document.getElementById('heroDashboard');

    if (userData) {
        try {
            const user = JSON.parse(userData);

            // Hide Get Started, show My Account (Header)
            if (getStartedBtn) getStartedBtn.style.display = 'none';
            if (myAccountSection) myAccountSection.style.display = 'flex';
            if (accountEmail) accountEmail.textContent = user.email;

            // Hide Get Started, show My Account (Mobile)
            if (mobileGetStartedBtn) mobileGetStartedBtn.style.display = 'none';
            if (mobileMyAccountSection) mobileMyAccountSection.style.display = 'block';
            if (mobileAccountEmail) mobileAccountEmail.textContent = user.email;

            // Hide Get Started, show Dashboard (Hero Section)
            if (heroGetStarted) heroGetStarted.style.display = 'none';
            if (heroDashboard) heroDashboard.style.display = 'inline-block';
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
}

// Initialize logout button functionality
function initializeLogoutButtons() {
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Handle logout
function handleLogout() {
    // Clear session storage
    sessionStorage.removeItem('kalakarUser');

    // Hide My Account, show Get Started (Desktop)
    const getStartedBtn = document.getElementById('getStartedBtn');
    const myAccountSection = document.getElementById('myAccountSection');
    if (getStartedBtn) getStartedBtn.style.display = 'block';
    if (myAccountSection) myAccountSection.style.display = 'none';

    // Hide My Account, show Get Started (Mobile)
    const mobileGetStartedBtn = document.getElementById('mobileGetStartedBtn');
    const mobileMyAccountSection = document.getElementById('mobileMyAccountSection');
    if (mobileGetStartedBtn) mobileGetStartedBtn.style.display = 'block';
    if (mobileMyAccountSection) mobileMyAccountSection.style.display = 'none';

    // Hide Dashboard, show Get Started (Hero Section)
    const heroGetStarted = document.getElementById('heroGetStarted');
    const heroDashboard = document.getElementById('heroDashboard');
    if (heroGetStarted) heroGetStarted.style.display = 'inline-block';
    if (heroDashboard) heroDashboard.style.display = 'none';

    // Close mobile menu if open
    closeMobileMenu();

    // Show alert
    alert('You have been logged out successfully!');
}
