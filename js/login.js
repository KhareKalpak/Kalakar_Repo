// =====================================================
// KALAKAR LOGIN PAGE - JAVASCRIPT
// Functionality: Form toggle, validation, submission
// =====================================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFormValidation();
    initializeHamburgerMenuForLogin();
    setupMobileMenuEventHandlers();
});

// ===== HAMBURGER MENU FUNCTIONALITY =====
function initializeHamburgerMenuForLogin() {
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

    // Close menu when CTA button clicked
    if (mobileCta) {
        mobileCta.addEventListener('click', function() {
            closeMobileMenu();
        });
    }
}

// Setup additional mobile menu event handlers
function setupMobileMenuEventHandlers() {
    const menuElement = document.querySelector('.mobile-menu');
    if (menuElement) {
        menuElement.addEventListener('click', function(e) {
            e.stopPropagation();
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

// Close menu on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

// ===== FORM VALIDATION =====
function initializeFormValidation() {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);

        // Add blur event listeners for real-time validation
        const signupEmail = document.getElementById('signupEmail');
        const contactNumber = document.getElementById('contactNumber');
        const age = document.getElementById('age');
        const signupPassword = document.getElementById('signupPassword');

        if (signupEmail) {
            signupEmail.addEventListener('blur', function() {
                validateEmail(this.value, 'signupEmailError');
            });
        }

        if (contactNumber) {
            contactNumber.addEventListener('blur', function() {
                validateContactNumber(this.value, 'contactNumberError');
            });
        }

        if (age) {
            age.addEventListener('blur', function() {
                validateAge(this.value, 'ageError');
            });
        }

        if (signupPassword) {
            signupPassword.addEventListener('blur', function() {
                validatePassword(this.value, 'signupPasswordError');
            });
        }
    }
}

// Validate email format
function validateEmail(email, errorElementId) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errorElement = document.getElementById(errorElementId);

    if (!email) {
        errorElement.textContent = 'Please enter a valid email address';
        return false;
    } else if (!emailRegex.test(email)) {
        errorElement.textContent = 'Please enter a valid email address';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

// Validate password (minimum 6 characters)
function validatePassword(password, errorElementId) {
    const errorElement = document.getElementById(errorElementId);

    if (!password) {
        errorElement.textContent = 'Password must be at least 6 characters';
        return false;
    } else if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

// Validate Indian phone number
function validateContactNumber(contactNumber, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    // Indian phone number: +91 followed by 10 digits (spaces optional)
    const phoneRegex = /^\+91\s?\d{5}\s?\d{5}$|^\+91\d{10}$/;

    if (!contactNumber) {
        errorElement.textContent = 'Please enter a valid Indian phone number (+91 XXXXXXXXXX)';
        return false;
    } else if (!phoneRegex.test(contactNumber.replace(/\s/g, ''))) {
        errorElement.textContent = 'Please enter a valid Indian phone number (+91 XXXXXXXXXX)';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

// Validate age (minimum 18)
function validateAge(age, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    const ageNum = parseInt(age, 10);

    if (!age) {
        errorElement.textContent = 'You must be at least 18 years old';
        return false;
    } else if (isNaN(ageNum) || ageNum < 18) {
        errorElement.textContent = 'You must be at least 18 years old';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

// Validate role selection
function validateRole(selectedRole) {
    const errorElement = document.getElementById('roleError');

    if (!selectedRole) {
        errorElement.textContent = 'Please select a role (Actor or Director/Producer)';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

// Handle signup form submission
function handleSignupSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const contactNumber = document.getElementById('contactNumber').value;
    const age = document.getElementById('age').value;
    const password = document.getElementById('signupPassword').value;
    const selectedRole = document.querySelector('input[name="userRole"]:checked');

    // Validate all fields
    const emailValid = validateEmail(email, 'signupEmailError');
    const contactValid = validateContactNumber(contactNumber, 'contactNumberError');
    const ageValid = validateAge(age, 'ageError');
    const passwordValid = validatePassword(password, 'signupPasswordError');
    const roleValid = validateRole(selectedRole);

    if (emailValid && contactValid && ageValid && passwordValid && roleValid) {
        // Store user data in sessionStorage
        const userData = {
            email: email,
            role: selectedRole.value,
            joinDate: new Date().toLocaleDateString()
        };
        sessionStorage.setItem('kalakarUser', JSON.stringify(userData));

        showSuccessMessage('Account created successfully!');
        disableSubmitButton(document.getElementById('signupForm').querySelector('.form-submit-btn'));
    }
}

// Show success message and redirect
function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.style.display = 'block';

    // Redirect to homepage after 2 seconds
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 2000);
}

// Disable submit button and show loading state
function disableSubmitButton(button) {
    button.disabled = true;
    button.textContent = 'Processing...';
}
