// =====================================================
// KALAKAR DASHBOARD - JAVASCRIPT
// Functionality: Actor and Director dashboards
// =====================================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeHamburgerMenuForDashboard();
    loadDashboard();
    initializeLogoutForDashboard();
});

// ===== HAMBURGER MENU FUNCTIONALITY =====
function initializeHamburgerMenuForDashboard() {
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

// ===== MAIN DASHBOARD LOGIC =====
function loadDashboard() {
    const userData = sessionStorage.getItem('kalakarUser');

    if (!userData) {
        // No user session, redirect to login
        window.location.href = 'login.html';
        return;
    }

    try {
        const user = JSON.parse(userData);
        const userInfo = document.getElementById('userInfo');

        // Display user info
        if (userInfo) {
            userInfo.textContent = `Welcome, ${user.email}!`;
        }

        // Load appropriate dashboard based on role
        if (user.role === 'actor') {
            loadActorDashboard(user);
        } else if (user.role === 'director') {
            loadDirectorDashboard(user);
        }
    } catch (e) {
        console.error('Error loading dashboard:', e);
        window.location.href = 'login.html';
    }
}

// ===== ACTOR DASHBOARD =====
function loadActorDashboard(user) {
    const actorDashboard = document.getElementById('actorDashboard');
    actorDashboard.style.display = 'block';

    // Set profile information
    document.getElementById('actorEmail').textContent = user.email;
    document.getElementById('actorJoinDate').textContent = user.joinDate;

    // Load portfolio if it exists
    loadActorPortfolio();

    // Setup portfolio form
    const portfolioForm = document.getElementById('portfolioForm');
    if (portfolioForm) {
        portfolioForm.addEventListener('submit', handlePortfolioSubmit);
    }

    // Setup edit button
    const editBtn = document.getElementById('editPortfolioBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            document.getElementById('portfolioForm').style.display = 'block';
            document.getElementById('savedPortfolio').style.display = 'none';
        });
    }

    // Load audition applications
    loadActorApplications();
}

function handlePortfolioSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('portfolioTitle').value;
    const bio = document.getElementById('portfolioBio').value;
    const experience = document.getElementById('portfolioExperience').value;
    const skills = document.getElementById('portfolioSkills').value;

    // Validate
    let isValid = true;
    isValid &= validatePortfolioField(title, 'portfolioTitleError', 'Please enter a portfolio title');
    isValid &= validatePortfolioField(bio, 'portfolioBioError', 'Please enter your bio');
    isValid &= validatePortfolioField(skills, 'portfolioSkillsError', 'Please enter your skills');

    if (isValid) {
        // Save to localStorage
        const portfolio = {
            title: title,
            bio: bio,
            experience: experience,
            skills: skills,
            savedDate: new Date().toLocaleDateString()
        };
        localStorage.setItem('actorPortfolio', JSON.stringify(portfolio));

        // Show success message
        alert('Portfolio saved successfully!');

        // Display saved portfolio
        displayActorPortfolio(portfolio);
    }
}

function validatePortfolioField(value, errorElementId, errorMessage) {
    const errorElement = document.getElementById(errorElementId);
    if (!value || value.trim() === '') {
        errorElement.textContent = errorMessage;
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

function loadActorPortfolio() {
    const savedPortfolio = localStorage.getItem('actorPortfolio');
    if (savedPortfolio) {
        try {
            const portfolio = JSON.parse(savedPortfolio);
            displayActorPortfolio(portfolio);
        } catch (e) {
            console.error('Error loading portfolio:', e);
        }
    }
}

function displayActorPortfolio(portfolio) {
    document.getElementById('portfolioForm').style.display = 'none';
    document.getElementById('savedPortfolio').style.display = 'block';
    document.getElementById('displayPortfolioTitle').textContent = portfolio.title;
    document.getElementById('displayPortfolioBio').textContent = portfolio.bio;
    document.getElementById('displayPortfolioExperience').textContent = portfolio.experience || 'Not specified';
    document.getElementById('displayPortfolioSkills').textContent = portfolio.skills;
}

function loadActorApplications() {
    const applications = JSON.parse(localStorage.getItem('actorApplications') || '[]');
    const applicationsDiv = document.getElementById('applicationsStatus');

    if (applications.length === 0) {
        applicationsDiv.innerHTML = '<p class="empty-message">No audition applications yet. Check back soon!</p>';
    } else {
        let html = '';
        applications.forEach((app, index) => {
            html += `
                <div class="application-card">
                    <h4>${app.projectTitle}</h4>
                    <p><strong>Role:</strong> ${app.roleTitle}</p>
                    <p><strong>Location:</strong> ${app.location}</p>
                    <p><strong>Status:</strong> <span class="status-${app.status}">${app.status.toUpperCase()}</span></p>
                    <p><strong>Applied on:</strong> ${app.appliedDate}</p>
                </div>
            `;
        });
        applicationsDiv.innerHTML = html;
    }
}

// ===== DIRECTOR DASHBOARD =====
function loadDirectorDashboard(user) {
    const directorDashboard = document.getElementById('directorDashboard');
    directorDashboard.style.display = 'block';

    // Set profile information
    document.getElementById('directorEmail').textContent = user.email;
    document.getElementById('directorJoinDate').textContent = user.joinDate;

    // Setup audition form
    const auditionForm = document.getElementById('auditionForm');
    if (auditionForm) {
        auditionForm.addEventListener('submit', handleAuditionSubmit);
    }

    // Load posted auditions
    loadPostedAuditions();

    // Load applications for review
    loadApplicationsForReview();
}

function handleAuditionSubmit(e) {
    e.preventDefault();

    const projectTitle = document.getElementById('projectTitle').value;
    const roleTitle = document.getElementById('roleTitle').value;
    const roleDescription = document.getElementById('roleDescription').value;
    const location = document.getElementById('auditionLocation').value;
    const deadline = document.getElementById('auditionDeadline').value;

    // Validate
    let isValid = true;
    isValid &= validateAuditionField(projectTitle, 'projectTitleError', 'Please enter project title');
    isValid &= validateAuditionField(roleTitle, 'roleTitleError', 'Please enter role title');
    isValid &= validateAuditionField(roleDescription, 'roleDescriptionError', 'Please enter role description');
    isValid &= validateAuditionField(location, 'auditionLocationError', 'Please enter audition location');
    isValid &= validateAuditionField(deadline, 'auditionDeadlineError', 'Please select a deadline');

    if (isValid) {
        // Create audition object
        const audition = {
            id: Date.now(),
            projectTitle: projectTitle,
            roleTitle: roleTitle,
            roleDescription: roleDescription,
            location: location,
            deadline: deadline,
            postedDate: new Date().toLocaleDateString(),
            applications: []
        };

        // Save to localStorage
        const auditions = JSON.parse(localStorage.getItem('directorAuditions') || '[]');
        auditions.push(audition);
        localStorage.setItem('directorAuditions', JSON.stringify(auditions));

        // Reset form
        document.getElementById('auditionForm').reset();

        // Show success message
        alert('Audition posted successfully!');

        // Reload auditions list
        loadPostedAuditions();
    }
}

function validateAuditionField(value, errorElementId, errorMessage) {
    const errorElement = document.getElementById(errorElementId);
    if (!value || value.trim() === '') {
        errorElement.textContent = errorMessage;
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

function loadPostedAuditions() {
    const auditions = JSON.parse(localStorage.getItem('directorAuditions') || '[]');
    const auditionsDiv = document.getElementById('postedAuditions');

    if (auditions.length === 0) {
        auditionsDiv.innerHTML = '<p class="empty-message">You haven\'t posted any auditions yet.</p>';
    } else {
        let html = '';
        auditions.forEach((audition) => {
            html += `
                <div class="audition-card">
                    <div class="audition-header">
                        <h4>${audition.projectTitle}</h4>
                        <span class="audition-role">${audition.roleTitle}</span>
                    </div>
                    <p><strong>Description:</strong> ${audition.roleDescription}</p>
                    <p><strong>Location:</strong> ${audition.location}</p>
                    <p><strong>Deadline:</strong> ${audition.deadline}</p>
                    <p><strong>Posted:</strong> ${audition.postedDate}</p>
                    <p><strong>Applications:</strong> <span class="app-count">${audition.applications.length}</span></p>
                </div>
            `;
        });
        auditionsDiv.innerHTML = html;
    }
}

function loadApplicationsForReview() {
    const auditions = JSON.parse(localStorage.getItem('directorAuditions') || '[]');
    const reviewDiv = document.getElementById('reviewApplications');

    let totalApplications = 0;
    let html = '';

    auditions.forEach((audition) => {
        if (audition.applications.length > 0) {
            html += `
                <div class="review-section">
                    <h4>${audition.projectTitle} - ${audition.roleTitle}</h4>
                    <div class="applications-to-review">
            `;

            audition.applications.forEach((app) => {
                html += `
                    <div class="actor-portfolio">
                        <p><strong>Actor Email:</strong> ${app.actorEmail}</p>
                        <p><strong>Portfolio Title:</strong> ${app.portfolio.title}</p>
                        <p><strong>Bio:</strong> ${app.portfolio.bio}</p>
                        <p><strong>Skills:</strong> ${app.portfolio.skills}</p>
                        <div class="action-buttons">
                            <button class="btn-select" onclick="selectActor('${audition.id}', '${app.actorEmail}')">Select Actor</button>
                            <button class="btn-reject" onclick="rejectActor('${audition.id}', '${app.actorEmail}')">Reject</button>
                        </div>
                    </div>
                `;
                totalApplications++;
            });

            html += `
                    </div>
                </div>
            `;
        }
    });

    if (totalApplications === 0) {
        reviewDiv.innerHTML = '<p class="empty-message">No actor applications to review yet.</p>';
    } else {
        reviewDiv.innerHTML = html;
    }
}

function selectActor(auditionId, actorEmail) {
    alert(`${actorEmail} has been selected for this role!`);
}

function rejectActor(auditionId, actorEmail) {
    alert(`${actorEmail} has been rejected for this role.`);
}

// ===== LOGOUT =====
function initializeLogoutForDashboard() {
    const logoutBtn = document.getElementById('logoutBtnDashboard');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleDashboardLogout();
        });
    }
}

function handleDashboardLogout() {
    sessionStorage.removeItem('kalakarUser');
    alert('You have been logged out successfully!');
    window.location.href = 'index.html';
}
