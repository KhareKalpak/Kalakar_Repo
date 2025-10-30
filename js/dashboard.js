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
    // Check Firebase authentication state
    firebase.auth().onAuthStateChanged(function(firebaseUser) {
        if (!firebaseUser) {
            // No user logged in, redirect to login
            window.location.href = 'login.html';
            return;
        }

        // Get user data from Firestore
        db.collection('users').doc(firebaseUser.uid).get()
            .then(function(doc) {
                if (doc.exists) {
                    const user = doc.data();
                    const userInfo = document.getElementById('userInfo');

                    // Display user info
                    if (userInfo) {
                        userInfo.textContent = `Welcome, ${user.email}!`;
                    }

                    // Store in sessionStorage for quick access
                    sessionStorage.setItem('kalakarUser', JSON.stringify({
                        email: user.email,
                        role: user.role,
                        joinDate: user.joinDate,
                        uid: firebaseUser.uid
                    }));

                    // Load appropriate dashboard based on role
                    if (user.role === 'actor') {
                        loadActorDashboard(user, firebaseUser.uid);
                    } else if (user.role === 'director') {
                        loadDirectorDashboard(user, firebaseUser.uid);
                    }
                } else {
                    console.error('User document not found in Firestore');
                    window.location.href = 'login.html';
                }
            })
            .catch(function(error) {
                console.error('Error loading user data from Firestore:', error);
                window.location.href = 'login.html';
            });
    });
}

// ===== ACTOR DASHBOARD =====
function loadActorDashboard(user, userId) {
    const actorDashboard = document.getElementById('actorDashboard');
    actorDashboard.style.display = 'block';

    // Set profile information
    document.getElementById('actorEmail').textContent = user.email;
    document.getElementById('actorJoinDate').textContent = user.joinDate;

    // Load portfolio if it exists
    loadActorPortfolio(userId);

    // Setup portfolio form
    const portfolioForm = document.getElementById('portfolioForm');
    if (portfolioForm) {
        portfolioForm.addEventListener('submit', function(e) {
            handlePortfolioSubmit(e, userId);
        });
    }

    // Setup edit button
    const editBtn = document.getElementById('editPortfolioBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            document.getElementById('portfolioForm').style.display = 'block';
            document.getElementById('savedPortfolio').style.display = 'none';
        });
    }

    // Load available auditions
    loadAvailableAuditions(user, userId);

    // Setup modal
    setupApplyModal();

    // Load audition applications
    loadActorApplications(userId);
}

function handlePortfolioSubmit(e, userId) {
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
        // Create portfolio object
        const portfolio = {
            userId: userId,
            title: title,
            bio: bio,
            experience: experience,
            skills: skills,
            savedDate: new Date().toLocaleDateString(),
            updatedAt: new Date().toISOString()
        };

        // Save to Firestore
        db.collection('portfolios').doc(userId).set(portfolio)
            .then(function() {
                // Also save to localStorage for backward compatibility
                localStorage.setItem('actorPortfolio', JSON.stringify(portfolio));

                // Show success message
                alert('Portfolio saved successfully!');

                // Display saved portfolio
                displayActorPortfolio(portfolio);
            })
            .catch(function(error) {
                console.error('Error saving portfolio to Firestore:', error);
                alert('Error saving portfolio. Please try again.');
            });
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

function loadActorPortfolio(userId) {
    // Load from Firestore
    db.collection('portfolios').doc(userId).get()
        .then(function(doc) {
            if (doc.exists) {
                const portfolio = doc.data();
                // Also save to localStorage for backward compatibility
                localStorage.setItem('actorPortfolio', JSON.stringify(portfolio));
                displayActorPortfolio(portfolio);
            }
        })
        .catch(function(error) {
            console.error('Error loading portfolio from Firestore:', error);
            // Fall back to localStorage
            const savedPortfolio = localStorage.getItem('actorPortfolio');
            if (savedPortfolio) {
                try {
                    const portfolio = JSON.parse(savedPortfolio);
                    displayActorPortfolio(portfolio);
                } catch (e) {
                    console.error('Error loading portfolio from localStorage:', e);
                }
            }
        });
}

function displayActorPortfolio(portfolio) {
    document.getElementById('portfolioForm').style.display = 'none';
    document.getElementById('savedPortfolio').style.display = 'block';
    document.getElementById('displayPortfolioTitle').textContent = portfolio.title;
    document.getElementById('displayPortfolioBio').textContent = portfolio.bio;
    document.getElementById('displayPortfolioExperience').textContent = portfolio.experience || 'Not specified';
    document.getElementById('displayPortfolioSkills').textContent = portfolio.skills;
}

function loadAvailableAuditions(user, userId) {
    const findAuditionsDiv = document.getElementById('findAuditions');

    // Load auditions from Firestore
    db.collection('auditions').get()
        .then(function(querySnapshot) {
            if (querySnapshot.empty) {
                findAuditionsDiv.innerHTML = '<p class="empty-message">No auditions available right now. Check back soon!</p>';
            } else {
                let html = '';
                querySnapshot.forEach(function(doc) {
                    const audition = doc.data();
                    const auditionId = doc.id;
                    html += `
                        <div class="audition-card-with-apply">
                            <div class="audition-details">
                                <h4>${audition.projectTitle}</h4>
                                <p><strong>Role:</strong> ${audition.roleTitle}</p>
                                <p><strong>Description:</strong> ${audition.roleDescription}</p>
                                <p><strong>Location:</strong> ${audition.location}</p>
                                <p><strong>Deadline:</strong> ${audition.deadline}</p>
                            </div>
                            <button class="apply-btn-action" onclick="openApplyModal('${auditionId}', '${audition.projectTitle}', '${audition.roleTitle}', '${audition.location}')">Apply</button>
                        </div>
                    `;
                });
                findAuditionsDiv.innerHTML = html;
            }
        })
        .catch(function(error) {
            console.error('Error loading auditions from Firestore:', error);
            // Fall back to localStorage
            const auditions = JSON.parse(localStorage.getItem('directorAuditions') || '[]');
            if (auditions.length === 0) {
                findAuditionsDiv.innerHTML = '<p class="empty-message">No auditions available right now. Check back soon!</p>';
            } else {
                let html = '';
                auditions.forEach((audition) => {
                    html += `
                        <div class="audition-card-with-apply">
                            <div class="audition-details">
                                <h4>${audition.projectTitle}</h4>
                                <p><strong>Role:</strong> ${audition.roleTitle}</p>
                                <p><strong>Description:</strong> ${audition.roleDescription}</p>
                                <p><strong>Location:</strong> ${audition.location}</p>
                                <p><strong>Deadline:</strong> ${audition.deadline}</p>
                            </div>
                            <button class="apply-btn-action" onclick="openApplyModal('${audition.id}', '${audition.projectTitle}', '${audition.roleTitle}', '${audition.location}')">Apply</button>
                        </div>
                    `;
                });
                findAuditionsDiv.innerHTML = html;
            }
        });
}

function setupApplyModal() {
    const modal = document.getElementById('applyModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelApplyBtn');

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function openApplyModal(auditionId, projectTitle, roleTitle, location) {
    const modal = document.getElementById('applyModal');
    const portfolio = JSON.parse(localStorage.getItem('actorPortfolio'));

    // Check if portfolio exists
    if (!portfolio) {
        alert('Please save your portfolio first before applying to auditions!');
        return;
    }

    // Populate modal with audition details
    document.getElementById('modalProjectTitle').textContent = projectTitle;
    document.getElementById('modalRoleTitle').textContent = roleTitle;
    document.getElementById('modalLocation').textContent = location;

    // Display portfolio
    const portfolioPreview = document.getElementById('portfolioToApply');
    portfolioPreview.innerHTML = `
        <p><strong>Title:</strong> ${portfolio.title}</p>
        <p><strong>Bio:</strong> ${portfolio.bio}</p>
        <p><strong>Experience:</strong> ${portfolio.experience || 'Not specified'}</p>
        <p><strong>Skills:</strong> ${portfolio.skills}</p>
    `;

    // Setup confirm button
    const confirmBtn = document.getElementById('confirmApplyBtn');
    confirmBtn.onclick = function() {
        confirmApplication(auditionId, projectTitle, roleTitle, location, portfolio);
    };

    // Show modal
    modal.style.display = 'block';
}

function confirmApplication(auditionId, projectTitle, roleTitle, location, portfolio) {
    const userData = sessionStorage.getItem('kalakarUser');
    const user = JSON.parse(userData);

    // Create application object
    const application = {
        auditionId: auditionId,
        projectTitle: projectTitle,
        roleTitle: roleTitle,
        location: location,
        actorEmail: user.email,
        actorId: user.uid,
        portfolio: portfolio,
        appliedDate: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString(),
        status: 'pending'
    };

    // Save application to Firestore
    db.collection('applications').add(application)
        .then(function(docRef) {
            // Also save to localStorage for backward compatibility
            const applications = JSON.parse(localStorage.getItem('actorApplications') || '[]');
            applications.push(application);
            localStorage.setItem('actorApplications', JSON.stringify(applications));

            // Show success message
            alert('Application submitted successfully! Directors will review your portfolio.');

            // Close modal
            document.getElementById('applyModal').style.display = 'none';

            // Reload applications
            loadActorApplications(user.uid);
        })
        .catch(function(error) {
            console.error('Error saving application to Firestore:', error);
            alert('Error submitting application. Please try again.');
        });
}

function loadActorApplications(userId) {
    const applicationsDiv = document.getElementById('applicationsStatus');

    // Load applications from Firestore
    db.collection('applications').where('actorId', '==', userId).get()
        .then(function(querySnapshot) {
            if (querySnapshot.empty) {
                applicationsDiv.innerHTML = '<p class="empty-message">No audition applications yet. Check back soon!</p>';
            } else {
                let html = '';
                querySnapshot.forEach(function(doc) {
                    const app = doc.data();
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
        })
        .catch(function(error) {
            console.error('Error loading applications from Firestore:', error);
            // Fall back to localStorage
            const applications = JSON.parse(localStorage.getItem('actorApplications') || '[]');
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
        });
}

// ===== DIRECTOR DASHBOARD =====
function loadDirectorDashboard(user, userId) {
    const directorDashboard = document.getElementById('directorDashboard');
    directorDashboard.style.display = 'block';

    // Set profile information
    document.getElementById('directorEmail').textContent = user.email;
    document.getElementById('directorJoinDate').textContent = user.joinDate;

    // Setup audition form
    const auditionForm = document.getElementById('auditionForm');
    if (auditionForm) {
        auditionForm.addEventListener('submit', function(e) {
            handleAuditionSubmit(e, userId);
        });
    }

    // Load posted auditions
    loadPostedAuditions(userId);

    // Load applications for review
    loadApplicationsForReview(userId);
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
