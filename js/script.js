// =====================================================
// KALAKAR LANDING PAGE - JAVASCRIPT
// Functionality: Hamburger menu, smooth scrolling
// =====================================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeHamburgerMenu();
    initializeSmoothScroll();
    initializeGetStartedButtons();
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
    const ctaButtons = document.querySelectorAll('.cta-button');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            // This will navigate to login page when implemented
            // For now, it's a placeholder that can be extended
            // Example: window.location.href = '/login';
            console.log('Get Started clicked - Navigate to login/signup page');

            // Placeholder for future login/signup page navigation
            // Uncomment when login page is ready:
            // window.location.href = '/login.html';
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
