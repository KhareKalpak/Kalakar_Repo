// =====================================================
// KALAKAR PROMOTIONS - JAVASCRIPT
// Functionality: Event promotions for directors/producers
// =====================================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeHamburgerMenuForPromotions();
    loadPromotionsPage();
});

// ===== HAMBURGER MENU FUNCTIONALITY =====
function initializeHamburgerMenuForPromotions() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const mobileCta = document.querySelector('.mobile-cta');

    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', function() {
            closeMobileMenu();
        });
    }

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    if (mobileCta) {
        mobileCta.addEventListener('click', function() {
            closeMobileMenu();
        });
    }
}

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

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

// ===== MAIN PROMOTIONS PAGE LOGIC =====
function loadPromotionsPage() {
    // Check if user is logged in
    const userData = sessionStorage.getItem('kalakarUser');
    const userRoleInfo = document.getElementById('userRoleInfo');
    const postPromotionSection = document.getElementById('postPromotionSection');

    if (!userData) {
        // User not logged in
        userRoleInfo.textContent = 'You are viewing as a guest. Please login to post promotions.';
        postPromotionSection.style.display = 'none';
    } else {
        try {
            const user = JSON.parse(userData);

            if (user.role === 'director') {
                // Director/Producer - can post promotions
                userRoleInfo.textContent = `Welcome, ${user.email}! As a Director/Producer, you can post event promotions below.`;
                postPromotionSection.style.display = 'block';

                // Setup form submission
                const promotionForm = document.getElementById('promotionForm');
                if (promotionForm) {
                    promotionForm.addEventListener('submit', function(e) {
                        handlePromotionSubmit(e, user.email);
                    });
                }
            } else if (user.role === 'actor') {
                // Actor - can only view
                userRoleInfo.textContent = `Welcome, ${user.email}! As an Actor, you can browse event promotions but cannot post.`;
                postPromotionSection.style.display = 'none';
            } else {
                userRoleInfo.textContent = 'You are viewing as a guest.';
                postPromotionSection.style.display = 'none';
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
            userRoleInfo.textContent = 'Error loading user information.';
            postPromotionSection.style.display = 'none';
        }
    }

    // Load all promotions (everyone can view)
    loadAllPromotions();
}

// ===== HANDLE PROMOTION FORM SUBMISSION =====
function handlePromotionSubmit(e, userEmail) {
    e.preventDefault();

    const eventTitle = document.getElementById('eventTitle').value;
    const eventType = document.getElementById('eventType').value;
    const eventDescription = document.getElementById('eventDescription').value;
    const eventVenue = document.getElementById('eventVenue').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const ticketInfo = document.getElementById('ticketInfo').value;
    const contactInfo = document.getElementById('contactInfo').value;

    // Validate
    let isValid = true;
    isValid &= validatePromotionField(eventTitle, 'eventTitleError', 'Please enter event title');
    isValid &= validatePromotionField(eventType, 'eventTypeError', 'Please select event type');
    isValid &= validatePromotionField(eventDescription, 'eventDescriptionError', 'Please enter event description');
    isValid &= validatePromotionField(eventVenue, 'eventVenueError', 'Please enter venue');
    isValid &= validatePromotionField(eventDate, 'eventDateError', 'Please select event date');
    isValid &= validatePromotionField(eventTime, 'eventTimeError', 'Please select event time');
    isValid &= validatePromotionField(contactInfo, 'contactInfoError', 'Please enter contact information');

    if (isValid) {
        // Create promotion object
        const promotion = {
            id: Date.now(), // Simple unique ID
            postedBy: userEmail,
            eventTitle: eventTitle,
            eventType: eventType,
            eventDescription: eventDescription,
            eventVenue: eventVenue,
            eventDate: eventDate,
            eventTime: eventTime,
            ticketInfo: ticketInfo || 'Not specified',
            contactInfo: contactInfo,
            postedDate: new Date().toLocaleDateString(),
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        const promotions = JSON.parse(localStorage.getItem('eventPromotions') || '[]');
        promotions.push(promotion);
        localStorage.setItem('eventPromotions', JSON.stringify(promotions));

        // Reset form
        document.getElementById('promotionForm').reset();

        // Clear error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        // Show success message
        alert('Promotion posted successfully!');

        // Reload promotions list
        loadAllPromotions();
    }
}

// ===== VALIDATE PROMOTION FIELDS =====
function validatePromotionField(value, errorElementId, errorMessage) {
    const errorElement = document.getElementById(errorElementId);
    if (!value || value.trim() === '') {
        errorElement.textContent = errorMessage;
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

// ===== LOAD AND DISPLAY ALL PROMOTIONS =====
function loadAllPromotions() {
    const promotionsDiv = document.getElementById('allPromotions');

    // Load promotions from localStorage
    const promotions = JSON.parse(localStorage.getItem('eventPromotions') || '[]');

    // Sort by date (newest first)
    promotions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (promotions.length === 0) {
        promotionsDiv.innerHTML = '<p class="empty-message">No promotions available right now. Check back soon!</p>';
    } else {
        let html = '';
        promotions.forEach((promo) => {
            html += `
                <div class="promotion-card">
                    <div class="promotion-header">
                        <h3>${promo.eventTitle}</h3>
                        <span class="promotion-type">${promo.eventType}</span>
                    </div>
                    <div class="promotion-details">
                        <p class="promotion-description">${promo.eventDescription}</p>
                        <div class="promotion-info-grid">
                            <p><strong>📍 Venue:</strong> ${promo.eventVenue}</p>
                            <p><strong>📅 Date:</strong> ${formatDate(promo.eventDate)}</p>
                            <p><strong>🕐 Time:</strong> ${formatTime(promo.eventTime)}</p>
                            <p><strong>🎫 Tickets:</strong> ${promo.ticketInfo}</p>
                            <p><strong>📞 Contact:</strong> ${promo.contactInfo}</p>
                            <p><strong>Posted by:</strong> ${promo.postedBy}</p>
                        </div>
                        <p class="promotion-posted-date">Posted on: ${promo.postedDate}</p>
                    </div>
                </div>
            `;
        });
        promotionsDiv.innerHTML = html;
    }
}

// ===== HELPER FUNCTIONS =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatTime(timeString) {
    if (!timeString) return 'Not specified';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}
