// =====================================================
// KALAKAR DASHBOARD - JAVASCRIPT
// Functionality: Actor and Director dashboards with Supabase
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
    // Check sessionStorage for user
    const userData = sessionStorage.getItem('kalakarUser');

    if (!userData) {
        // No user logged in, redirect to login
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
        console.error('Error parsing user data:', e);
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
    loadActorPortfolio(user.email);

    // Setup portfolio form
    const portfolioForm = document.getElementById('portfolioForm');
    if (portfolioForm) {
        portfolioForm.addEventListener('submit', function(e) {
            handlePortfolioSubmit(e, user.email);
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
    loadAvailableAuditions(user);

    // Setup modal
    setupApplyModal();

    // Load audition applications
    loadActorApplications(user.email);
}

async function handlePortfolioSubmit(e, userEmail) {
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
        try {
            // Check if portfolio already exists
            const { data: existingPortfolio } = await supabase
                .from('portfolios')
                .select('id')
                .eq('user_email', userEmail)
                .single();

            const portfolio = {
                user_email: userEmail,
                title: title,
                bio: bio,
                experience: experience,
                skills: skills,
                saved_date: new Date().toLocaleDateString()
            };

            let result;
            if (existingPortfolio) {
                // Update existing portfolio
                result = await supabase
                    .from('portfolios')
                    .update(portfolio)
                    .eq('user_email', userEmail)
                    .select();
            } else {
                // Insert new portfolio
                result = await supabase
                    .from('portfolios')
                    .insert([portfolio])
                    .select();
            }

            if (result.error) {
                console.error('Error saving portfolio:', result.error);
                alert('Error saving portfolio. Please try again.');
                return;
            }

            alert('Portfolio saved successfully!');
            displayActorPortfolio(portfolio);
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('An unexpected error occurred. Please try again.');
        }
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

async function loadActorPortfolio(userEmail) {
    try {
        const { data, error } = await supabase
            .from('portfolios')
            .select('*')
            .eq('user_email', userEmail)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error('Error loading portfolio:', error);
            }
            return;
        }

        if (data) {
            displayActorPortfolio(data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
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

async function loadAvailableAuditions(user) {
    const findAuditionsDiv = document.getElementById('findAuditions');

    try {
        const { data, error } = await supabase
            .from('auditions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading auditions:', error);
            findAuditionsDiv.innerHTML = '<p class="empty-message">Error loading auditions. Please refresh.</p>';
            return;
        }

        if (!data || data.length === 0) {
            findAuditionsDiv.innerHTML = '<p class="empty-message">No auditions available right now. Check back soon!</p>';
        } else {
            let html = '';
            data.forEach((audition) => {
                html += `
                    <div class="audition-card-with-apply">
                        <div class="audition-details">
                            <h4>${audition.project_title}</h4>
                            <p><strong>Role:</strong> ${audition.role_title}</p>
                            <p><strong>Description:</strong> ${audition.role_description}</p>
                            <p><strong>Location:</strong> ${audition.location}</p>
                            <p><strong>Deadline:</strong> ${audition.deadline}</p>
                        </div>
                        <button class="apply-btn-action" onclick="openApplyModal('${audition.id}', '${audition.project_title}', '${audition.role_title}', '${audition.location}')">Apply</button>
                    </div>
                `;
            });
            findAuditionsDiv.innerHTML = html;
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        findAuditionsDiv.innerHTML = '<p class="empty-message">Error loading auditions. Please refresh.</p>';
    }
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

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

async function openApplyModal(auditionId, projectTitle, roleTitle, location) {
    const modal = document.getElementById('applyModal');
    const userData = sessionStorage.getItem('kalakarUser');
    const user = JSON.parse(userData);

    try {
        // Get portfolio from Supabase
        const { data: portfolio, error } = await supabase
            .from('portfolios')
            .select('*')
            .eq('user_email', user.email)
            .single();

        if (error || !portfolio) {
            alert('Please save your portfolio first before applying to auditions!');
            return;
        }

        // Populate modal
        document.getElementById('modalProjectTitle').textContent = projectTitle;
        document.getElementById('modalRoleTitle').textContent = roleTitle;
        document.getElementById('modalLocation').textContent = location;

        const portfolioPreview = document.getElementById('portfolioToApply');
        portfolioPreview.innerHTML = `
            <p><strong>Title:</strong> ${portfolio.title}</p>
            <p><strong>Bio:</strong> ${portfolio.bio}</p>
            <p><strong>Experience:</strong> ${portfolio.experience || 'Not specified'}</p>
            <p><strong>Skills:</strong> ${portfolio.skills}</p>
        `;

        const confirmBtn = document.getElementById('confirmApplyBtn');
        confirmBtn.onclick = function() {
            confirmApplication(auditionId, projectTitle, roleTitle, location, portfolio);
        };

        modal.style.display = 'block';
    } catch (err) {
        console.error('Error loading portfolio:', err);
        alert('Error loading your portfolio. Please try again.');
    }
}

async function confirmApplication(auditionId, projectTitle, roleTitle, location, portfolio) {
    const userData = sessionStorage.getItem('kalakarUser');
    const user = JSON.parse(userData);

    try {
        const application = {
            audition_id: auditionId,
            actor_email: user.email,
            portfolio: portfolio,
            applied_date: new Date().toLocaleDateString(),
            status: 'pending'
        };

        const { error } = await supabase
            .from('applications')
            .insert([application]);

        if (error) {
            console.error('Error submitting application:', error);
            alert('Error submitting application. Please try again.');
            return;
        }

        alert('Application submitted successfully! Directors will review your portfolio.');
        document.getElementById('applyModal').style.display = 'none';
        loadActorApplications(user.email);
    } catch (err) {
        console.error('Unexpected error:', err);
        alert('An unexpected error occurred. Please try again.');
    }
}

async function loadActorApplications(userEmail) {
    const applicationsDiv = document.getElementById('applicationsStatus');

    try {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('actor_email', userEmail)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading applications:', error);
            applicationsDiv.innerHTML = '<p class="empty-message">Error loading applications. Please refresh.</p>';
            return;
        }

        if (!data || data.length === 0) {
            applicationsDiv.innerHTML = '<p class="empty-message">No audition applications yet. Check back soon!</p>';
        } else {
            let html = '';
            data.forEach((app) => {
                html += `
                    <div class="application-card">
                        <h4>Application Submitted</h4>
                        <p><strong>Status:</strong> <span class="status-${app.status}">${app.status.toUpperCase()}</span></p>
                        <p><strong>Applied on:</strong> ${app.applied_date}</p>
                    </div>
                `;
            });
            applicationsDiv.innerHTML = html;
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        applicationsDiv.innerHTML = '<p class="empty-message">Error loading applications. Please refresh.</p>';
    }
}

// ===== DIRECTOR DASHBOARD =====
function loadDirectorDashboard(user) {
    const directorDashboard = document.getElementById('directorDashboard');
    directorDashboard.style.display = 'block';

    document.getElementById('directorEmail').textContent = user.email;
    document.getElementById('directorJoinDate').textContent = user.joinDate;

    const auditionForm = document.getElementById('auditionForm');
    if (auditionForm) {
        auditionForm.addEventListener('submit', function(e) {
            handleAuditionSubmit(e, user.email);
        });
    }

    loadPostedAuditions(user.email);
    loadApplicationsForReview(user.email);
}

async function handleAuditionSubmit(e, userEmail) {
    e.preventDefault();

    const projectTitle = document.getElementById('projectTitle').value;
    const roleTitle = document.getElementById('roleTitle').value;
    const roleDescription = document.getElementById('roleDescription').value;
    const location = document.getElementById('auditionLocation').value;
    const deadline = document.getElementById('auditionDeadline').value;

    let isValid = true;
    isValid &= validateAuditionField(projectTitle, 'projectTitleError', 'Please enter project title');
    isValid &= validateAuditionField(roleTitle, 'roleTitleError', 'Please enter role title');
    isValid &= validateAuditionField(roleDescription, 'roleDescriptionError', 'Please enter role description');
    isValid &= validateAuditionField(location, 'auditionLocationError', 'Please enter audition location');
    isValid &= validateAuditionField(deadline, 'auditionDeadlineError', 'Please select a deadline');

    if (isValid) {
        try {
            const audition = {
                director_email: userEmail,
                project_title: projectTitle,
                role_title: roleTitle,
                role_description: roleDescription,
                location: location,
                deadline: deadline,
                posted_date: new Date().toLocaleDateString()
            };

            const { error } = await supabase
                .from('auditions')
                .insert([audition]);

            if (error) {
                console.error('Error posting audition:', error);
                alert('Error posting audition. Please try again.');
                return;
            }

            document.getElementById('auditionForm').reset();
            alert('Audition posted successfully!');
            loadPostedAuditions(userEmail);
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('An unexpected error occurred. Please try again.');
        }
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

async function loadPostedAuditions(userEmail) {
    const auditionsDiv = document.getElementById('postedAuditions');

    try {
        const { data, error } = await supabase
            .from('auditions')
            .select('*')
            .eq('director_email', userEmail)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading auditions:', error);
            auditionsDiv.innerHTML = '<p class="empty-message">Error loading auditions. Please refresh.</p>';
            return;
        }

        if (!data || data.length === 0) {
            auditionsDiv.innerHTML = '<p class="empty-message">You haven\'t posted any auditions yet.</p>';
        } else {
            let html = '';
            for (const audition of data) {
                // Count applications
                const { count } = await supabase
                    .from('applications')
                    .select('*', { count: 'exact', head: true })
                    .eq('audition_id', audition.id);

                html += `
                    <div class="audition-card">
                        <div class="audition-header">
                            <h4>${audition.project_title}</h4>
                            <span class="audition-role">${audition.role_title}</span>
                        </div>
                        <p><strong>Description:</strong> ${audition.role_description}</p>
                        <p><strong>Location:</strong> ${audition.location}</p>
                        <p><strong>Deadline:</strong> ${audition.deadline}</p>
                        <p><strong>Posted:</strong> ${audition.posted_date}</p>
                        <p><strong>Applications:</strong> <span class="app-count">${count || 0}</span></p>
                    </div>
                `;
            }
            auditionsDiv.innerHTML = html;
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        auditionsDiv.innerHTML = '<p class="empty-message">Error loading auditions. Please refresh.</p>';
    }
}

async function loadApplicationsForReview(userEmail) {
    const reviewDiv = document.getElementById('reviewApplications');

    try {
        // Get director's auditions
        const { data: auditions, error: audError } = await supabase
            .from('auditions')
            .select('*')
            .eq('director_email', userEmail);

        if (audError) {
            console.error('Error loading auditions:', audError);
            reviewDiv.innerHTML = '<p class="empty-message">Error loading applications. Please refresh.</p>';
            return;
        }

        if (!auditions || auditions.length === 0) {
            reviewDiv.innerHTML = '<p class="empty-message">No actor applications to review yet.</p>';
            return;
        }

        let html = '';
        let totalApps = 0;

        for (const audition of auditions) {
            const { data: apps, error: appError } = await supabase
                .from('applications')
                .select('*')
                .eq('audition_id', audition.id);

            if (appError) {
                console.error('Error loading applications:', appError);
                continue;
            }

            if (apps && apps.length > 0) {
                html += `
                    <div class="review-section">
                        <h4>${audition.project_title} - ${audition.role_title}</h4>
                        <div class="applications-to-review">
                `;

                apps.forEach((app) => {
                    totalApps++;
                    html += `
                        <div class="actor-portfolio">
                            <p><strong>Actor Email:</strong> ${app.actor_email}</p>
                            <p><strong>Portfolio Title:</strong> ${app.portfolio.title}</p>
                            <p><strong>Bio:</strong> ${app.portfolio.bio}</p>
                            <p><strong>Experience:</strong> ${app.portfolio.experience || 'Not specified'}</p>
                            <p><strong>Skills:</strong> ${app.portfolio.skills}</p>
                            <p><strong>Applied on:</strong> ${app.applied_date}</p>
                            <div class="action-buttons">
                                <button class="btn-select" onclick="selectActor('${app.actor_email}')">Select Actor</button>
                                <button class="btn-reject" onclick="rejectActor('${app.actor_email}')">Reject</button>
                            </div>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            }
        }

        if (totalApps === 0) {
            reviewDiv.innerHTML = '<p class="empty-message">No actor applications to review yet.</p>';
        } else {
            reviewDiv.innerHTML = html;
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        reviewDiv.innerHTML = '<p class="empty-message">Error loading applications. Please refresh.</p>';
    }
}

function selectActor(actorEmail) {
    alert(`${actorEmail} has been selected for this role!`);
}

function rejectActor(actorEmail) {
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
