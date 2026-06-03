/**
 * ResuMake - Application Controller
 */

// Application State
let activeResume = null;
let zoomLevel = 100;
let autosaveTimeout = null;

// Default Starter Data for a Premium Resume Template
const DEFAULT_RESUME_DATA = {
    fullName: "Alex Rivera",
    jobTitle: "Senior Full-Stack Engineer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 234-5678",
    location: "Austin, TX",
    website: "github.com/alexrivera",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop", // Elegant profile placeholder
    summary: "Dynamic and quality-driven software engineer with 6+ years of experience designing, architecting, and launching web-scale software applications. Passionate about clean code, performance tuning, and leading collaborative engineering squads.",
    experience: [
        {
            title: "Lead Software Architect",
            company: "Apex Tech Labs",
            location: "Austin, TX",
            start: "2023-03",
            end: "",
            desc: "- Led migration from legacy monolith architecture to scalable Node/React microservices, reducing AWS infrastructure costs by 22%.\n- Supervised a team of 6 engineers implementing CI/CD pipelines, increasing deployment frequency by 300%.\n- Engineered core analytics engine handling over 5 million incoming requests daily."
        },
        {
            title: "Software Engineer III",
            company: "CloudBound Systems",
            location: "Denver, CO",
            start: "2020-08",
            end: "2023-02",
            desc: "- Designed and deployed multiple high-traffic React dashboard portals utilizing GraphQL APIs.\n- Improved overall SQL query efficiency in PostgreSQL databases by 35% through custom indexing schemas.\n- Partnered with design leaders to construct a unified Figma-to-code UI component library."
        }
    ],
    education: [
        {
            degree: "M.S. in Software Engineering",
            school: "University of Texas at Austin",
            location: "Austin, TX",
            start: "2018-09",
            end: "2020-05",
            desc: "Specialized in Distributed Computing and Database Systems design."
        },
        {
            degree: "B.S. in Computer Science",
            school: "Texas A&M University",
            location: "College Station, TX",
            start: "2014-09",
            end: "2018-05",
            desc: "Graduated Magna Cum Laude. President of the Association for Computing Machinery (ACM) Student Chapter."
        }
    ],
    skills: [
        { name: "JavaScript/TypeScript", level: "Expert" },
        { name: "React & Next.js", level: "Expert" },
        { name: "Node.js & Express", level: "Expert" },
        { name: "PostgreSQL & Redis", level: "Advanced" },
        { name: "AWS Cloud (EC2, Lambda, S3)", level: "Advanced" },
        { name: "Docker & Kubernetes", level: "Intermediate" }
    ],
    projects: [
        {
            name: "Serverless SaaS Boilerplate",
            role: "Lead Creator",
            link: "https://github.com/alexrivera/saas-boilerplate",
            desc: "Open-source codebase featuring fully integrated stripe payments, Auth0 logic, and tailwind dashboard elements. Acquired 1,200+ stars on GitHub."
        }
    ],
    languages: [
        { name: "English", proficiency: "Native" },
        { name: "Spanish", proficiency: "Conversational" }
    ]
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    setupThemeToggle();
});

   function initApp() {
    switchView('dashboard-section');
    loadUserResumes();
}

// Global View Switcher
function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(viewId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Reparse Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Global auth form switcher
window.switchAuthTab = function(tabName) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('login-form');
    const formRegister = document.getElementById('register-form');

    if (tabName === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.classList.add('active');
        formRegister.classList.remove('active');
    } else {
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
        formLogin.classList.remove('active');
        formRegister.classList.add('active');
    }
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
};

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
    // 1. Auth Forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);

    // 2. Dashboard Actions
    document.getElementById('btn-new-resume').addEventListener('click', () => createNewResume());

    // 3. Editor Header Actions
    document.getElementById('btn-back-dashboard').addEventListener('click', () => {
        saveResumeImmediately();
        switchView('dashboard-section');
        loadUserResumes();
    });
    
    document.getElementById('resume-title-input').addEventListener('input', (e) => {
        if (activeResume) {
            activeResume.title = e.target.value || 'Untitled Resume';
            triggerAutosave();
        }
    });

    document.getElementById('template-select').addEventListener('change', (e) => {
        if (activeResume) {
            activeResume.template = e.target.value;
            renderLivePreview();
            triggerAutosave();
        }
    });

    document.getElementById('btn-download-pdf').addEventListener('click', handlePdfDownload);

    // Accent Selector Event Listeners
    document.querySelectorAll('.accent-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            if (activeResume) {
                const accent = pill.getAttribute('data-accent');
                activeResume.data.accentColor = accent;
                setActiveAccentPill(accent);
                renderLivePreview();
                triggerAutosave();
            }
        });
    });

    // Backup & Restore Action Listeners
    document.getElementById('btn-backup-json').addEventListener('click', handleExportBackup);
    document.getElementById('input-import-backup').addEventListener('change', handleImportBackup);

    // 4. Accordion Toggle
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close other accordion items
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // 5. Personal Details Form Fields
    const personalInputs = [
        'fullName', 'jobTitle', 'email', 'phone', 'location', 'website'
    ];
    personalInputs.forEach(id => {
        document.getElementById(`input-${id}`).addEventListener('input', (e) => {
            if (activeResume) {
                activeResume.data[id] = e.target.value;
                renderLivePreview();
                triggerAutosave();
            }
        });
    });

    // Professional Summary Field
    document.getElementById('input-summary').addEventListener('input', (e) => {
        if (activeResume) {
            activeResume.data.summary = e.target.value;
            renderLivePreview();
            triggerAutosave();
        }
    });

    // 6. Photo Upload Controls
    document.getElementById('photo-upload').addEventListener('change', handlePhotoUpload);
    document.getElementById('btn-remove-photo').addEventListener('click', handlePhotoRemove);

    // 7. Repeater Add Buttons
    document.getElementById('btn-add-experience').addEventListener('click', () => addRepeaterItem('experience'));
    document.getElementById('btn-add-education').addEventListener('click', () => addRepeaterItem('education'));
    document.getElementById('btn-add-skill').addEventListener('click', () => addRepeaterItem('skills'));
    document.getElementById('btn-add-project').addEventListener('click', () => addRepeaterItem('projects'));
    document.getElementById('btn-add-language').addEventListener('click', () => addRepeaterItem('languages'));

    // 8. Zoom Controls
    document.getElementById('btn-zoom-in').addEventListener('click', () => adjustZoom(10));
    document.getElementById('btn-zoom-out').addEventListener('click', () => adjustZoom(-10));
}

// ==========================================================================
// THEME MANAGEMENT (LIGHT & DARK MODE toggling UI elements)
// ==========================================================================
function setupThemeToggle() {
    const btnToggleDash = document.getElementById('btn-theme-toggle-dash');
    const btnToggleEdit = document.getElementById('btn-theme-toggle-edit');
    
    // Read local preference
    const savedTheme = localStorage.getItem('resumake_theme') || 'dark';
    applyTheme(savedTheme);

    const toggleFn = () => {
        const isLight = document.body.classList.contains('light-theme');
        const newTheme = isLight ? 'dark' : 'light';
        applyTheme(newTheme);
    };

    if (btnToggleDash) btnToggleDash.addEventListener('click', toggleFn);
    if (btnToggleEdit) btnToggleEdit.addEventListener('click', toggleFn);
}

function applyTheme(theme) {
    localStorage.setItem('resumake_theme', theme);
    const icons = ['btn-theme-toggle-dash', 'btn-theme-toggle-edit'];
    
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        icons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.innerHTML = '<i data-lucide="moon"></i>';
        });
    } else {
        document.body.classList.remove('light-theme');
        icons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.innerHTML = '<i data-lucide="sun"></i>';
        });
    }
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// ==========================================================================
// AUTHENTICATION LOGIC
// ==========================================================================
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const success = Auth.register(name, email, password);
    if (success) {
        document.getElementById('register-form').reset();
        window.switchAuthTab('login');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const success = Auth.login(email, password);
    if (success) {
        document.getElementById('login-form').reset();
        const user = Auth.getCurrentUser();
        document.getElementById('user-display-name').textContent = user.name;
        switchView('dashboard-section');
        loadUserResumes();
    }
}

function handleLogout() {
    activeResume = null;
}

// ==========================================================================
// DASHBOARD LOGIC (RESUMES CRUD)
// ==========================================================================
function getUserResumesKey() {
    return 'resumake_resumes';
}

function loadUserResumes() {
    const storageKey = getUserResumesKey();
    if (!storageKey) return;

    const resumesJson = localStorage.getItem(storageKey);
    const resumes = resumesJson ? JSON.parse(resumesJson) : [];

    const grid = document.getElementById('resumes-grid');
    const emptyState = document.getElementById('empty-state');

    grid.innerHTML = '';

    if (resumes.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    resumes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    resumes.forEach(resume => {
        const card = document.createElement('div');
        card.className = 'resume-card';
        
        const date = new Date(resume.lastModified).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        // Template label mapping
        const templateLabels = {
            modern: 'Sleek Modern',
            creative: 'Creative Timeline',
            executive: 'Executive Elite',
            tech: 'Tech Vanguard'
        };
        const templateLabel = templateLabels[resume.template] || 'Modern';

        card.innerHTML = `
            <div class="resume-card-thumb">
                <i data-lucide="file-text"></i>
            </div>
            <div class="resume-card-details">
                <h3 class="resume-card-title">${escapeHTML(resume.title)}</h3>
                <div class="resume-card-meta">
                    <i data-lucide="layout"></i>
                    <span>${templateLabel}</span>
                    <span>•</span>
                    <i data-lucide="calendar"></i>
                    <span>${date}</span>
                </div>
                <div class="resume-card-actions">
                    <button class="btn btn-outline btn-sm btn-edit" data-id="${resume.id}">
                        <i data-lucide="edit-3"></i>
                        <span>Edit</span>
                    </button>
                    <button class="btn btn-outline btn-sm btn-duplicate" data-id="${resume.id}" title="Duplicate">
                        <i data-lucide="copy"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm btn-delete" data-id="${resume.id}" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Attach card event listeners
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openResumeEditor(btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.btn-duplicate').forEach(btn => {
        btn.addEventListener('click', () => duplicateResume(btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteResume(btn.getAttribute('data-id')));
    });
}

function createNewResume() {
    const storageKey = getUserResumesKey();
    if (!storageKey) return;

    const resumesJson = localStorage.getItem(storageKey);
    const resumes = resumesJson ? JSON.parse(resumesJson) : [];

    const newResume = {
        id: 'res_' + Math.random().toString(36).substring(2, 11),
        title: `My Resume (${resumes.length + 1})`,
        template: 'modern',
        lastModified: new Date().toISOString(),
        data: JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA)) // Deep clone default starter data
    };

    resumes.push(newResume);
    localStorage.setItem(storageKey, JSON.stringify(resumes));
    
    showToast('Resume Created', `"${newResume.title}" is ready for editing!`, 'success');
    
    openResumeEditor(newResume.id);
}

window.createNewResume = createNewResume; // Expose to HTML inline button

function duplicateResume(id) {
    const storageKey = getUserResumesKey();
    const resumesJson = localStorage.getItem(storageKey);
    if (!resumesJson) return;

    let resumes = JSON.parse(resumesJson);
    const sourceResume = resumes.find(r => r.id === id);
    if (!sourceResume) return;

    const clone = JSON.parse(JSON.stringify(sourceResume));
    clone.id = 'res_' + Math.random().toString(36).substring(2, 11);
    clone.title = `${clone.title} Copy`;
    clone.lastModified = new Date().toISOString();

    resumes.push(clone);
    localStorage.setItem(storageKey, JSON.stringify(resumes));
    
    showToast('Resume Cloned', `Created duplicate "${clone.title}"`, 'success');
    loadUserResumes();
}

function deleteResume(id) {
    const storageKey = getUserResumesKey();
    const resumesJson = localStorage.getItem(storageKey);
    if (!resumesJson) return;

    let resumes = JSON.parse(resumesJson);
    const resume = resumes.find(r => r.id === id);
    if (!resume) return;

    if (confirm(`Are you sure you want to delete "${resume.title}"?`)) {
        resumes = resumes.filter(r => r.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(resumes));
        
        showToast('Resume Deleted', `Removed "${resume.title}"`, 'info');
        loadUserResumes();
    }
}

// ==========================================================================
// EDITOR ENGINE & DATA BINDING
// ==========================================================================
function openResumeEditor(id) {
    const storageKey = getUserResumesKey();
    const resumesJson = localStorage.getItem(storageKey);
    if (!resumesJson) return;

    const resumes = JSON.parse(resumesJson);
    const resume = resumes.find(r => r.id === id);
    if (!resume) return;

    activeResume = resume;
    
    // Set view elements
    document.getElementById('resume-title-input').value = resume.title;
    document.getElementById('template-select').value = resume.template;

    // Set active accent color selection in UI
    const activeAccent = resume.data.accentColor || 'indigo';
    setActiveAccentPill(activeAccent);

    // Fill personal form fields
    const personalFields = ['fullName', 'jobTitle', 'email', 'phone', 'location', 'website'];
    personalFields.forEach(field => {
        document.getElementById(`input-${field}`).value = resume.data[field] || '';
    });

    // Professional Summary
    document.getElementById('input-summary').value = resume.data.summary || '';

    // Handle Photo preview binding
    const photoPreview = document.getElementById('photo-preview');
    if (resume.data.photo) {
        photoPreview.src = resume.data.photo;
        document.getElementById('btn-remove-photo').classList.remove('hidden');
    } else {
        photoPreview.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop';
        document.getElementById('btn-remove-photo').classList.add('hidden');
    }

    // Render Dynamic Repeaters
    renderRepeaterList('experience');
    renderRepeaterList('education');
    renderRepeaterList('skills');
    renderRepeaterList('projects');
    renderRepeaterList('languages');

    // Switch view to editor
    switchView('editor-section');
    
    // Adjust Zoom Default
    resetZoom();

    // Render Preview canvas
    renderLivePreview();
}

// Render dynamic forms lists
function renderRepeaterList(sectionType) {
    const container = document.getElementById(`${sectionType}-list`);
    if (!container || !activeResume) return;

    container.innerHTML = '';
    const items = activeResume.data[sectionType] || [];

    items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'repeater-item';
        row.setAttribute('data-index', index);

        let fieldsHTML = '';
        
        if (sectionType === 'experience') {
            fieldsHTML = `
                <div class="repeater-item-header">
                    <span class="repeater-item-title">Job #${index + 1}</span>
                    <button type="button" class="btn-delete-repeater" data-section="experience" data-index="${index}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="form-grid">
                    <div class="form-group col-6">
                        <label>Job Title</label>
                        <input type="text" class="form-control rep-input" data-field="title" value="${escapeHTML(item.title)}" placeholder="e.g. Senior Product Designer">
                    </div>
                    <div class="form-group col-6">
                        <label>Company</label>
                        <input type="text" class="form-control rep-input" data-field="company" value="${escapeHTML(item.company)}" placeholder="e.g. Google Inc.">
                    </div>
                    <div class="form-group col-6">
                        <label>Location</label>
                        <input type="text" class="form-control rep-input" data-field="location" value="${escapeHTML(item.location || '')}" placeholder="e.g. New York, NY">
                    </div>
                    <div class="form-group col-6">
                        <div class="form-grid">
                            <div class="form-group col-6">
                                <label>Start Date</label>
                                <input type="month" class="form-control rep-input" data-field="start" value="${escapeHTML(item.start)}">
                            </div>
                            <div class="form-group col-6">
                                <label>End Date</label>
                                <input type="month" class="form-control rep-input" data-field="end" value="${escapeHTML(item.end || '')}">
                            </div>
                        </div>
                    </div>
                    <div class="form-group col-12">
                        <label>Responsibilities & Achievements</label>
                        <textarea rows="3" class="form-control rep-input textarea" data-field="desc" placeholder="Provide description. Use bullet points starting with '-'">${escapeHTML(item.desc)}</textarea>
                    </div>
                </div>
            `;
        } else if (sectionType === 'education') {
            fieldsHTML = `
                <div class="repeater-item-header">
                    <span class="repeater-item-title">Education #${index + 1}</span>
                    <button type="button" class="btn-delete-repeater" data-section="education" data-index="${index}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="form-grid">
                    <div class="form-group col-6">
                        <label>Degree/Certification</label>
                        <input type="text" class="form-control rep-input" data-field="degree" value="${escapeHTML(item.degree)}" placeholder="e.g. B.S. in Computer Science">
                    </div>
                    <div class="form-group col-6">
                        <label>School/University</label>
                        <input type="text" class="form-control rep-input" data-field="school" value="${escapeHTML(item.school)}" placeholder="e.g. Harvard University">
                    </div>
                    <div class="form-group col-6">
                        <label>Location</label>
                        <input type="text" class="form-control rep-input" data-field="location" value="${escapeHTML(item.location || '')}" placeholder="e.g. Cambridge, MA">
                    </div>
                    <div class="form-group col-6">
                        <div class="form-grid">
                            <div class="form-group col-6">
                                <label>Start Date</label>
                                <input type="month" class="form-control rep-input" data-field="start" value="${escapeHTML(item.start)}">
                            </div>
                            <div class="form-group col-6">
                                <label>End Date</label>
                                <input type="month" class="form-control rep-input" data-field="end" value="${escapeHTML(item.end || '')}">
                            </div>
                        </div>
                    </div>
                    <div class="form-group col-12">
                        <label>Description/Honors (Optional)</label>
                        <textarea rows="2" class="form-control rep-input textarea" data-field="desc" placeholder="GPA 3.8. Core projects...">${escapeHTML(item.desc || '')}</textarea>
                    </div>
                </div>
            `;
        } else if (sectionType === 'skills') {
            fieldsHTML = `
                <div class="repeater-item-header" style="border:none; padding:0; margin:0;">
                    <span class="repeater-item-title">Skill #${index + 1}</span>
                    <button type="button" class="btn-delete-repeater" data-section="skills" data-index="${index}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="form-grid">
                    <div class="form-group col-6">
                        <label>Skill Name</label>
                        <input type="text" class="form-control rep-input" data-field="name" value="${escapeHTML(item.name)}" placeholder="e.g. Python, Agile Management">
                    </div>
                    <div class="form-group col-6">
                        <label>Level/Proficiency (Optional)</label>
                        <input type="text" class="form-control rep-input" data-field="level" value="${escapeHTML(item.level || '')}" placeholder="e.g. Expert, Intermediate">
                    </div>
                </div>
            `;
        } else if (sectionType === 'projects') {
            fieldsHTML = `
                <div class="repeater-item-header">
                    <span class="repeater-item-title">Project #${index + 1}</span>
                    <button type="button" class="btn-delete-repeater" data-section="projects" data-index="${index}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="form-grid">
                    <div class="form-group col-6">
                        <label>Project Name</label>
                        <input type="text" class="form-control rep-input" data-field="name" value="${escapeHTML(item.name)}" placeholder="e.g. AI Chatbot">
                    </div>
                    <div class="form-group col-6">
                        <label>Role/Contribution</label>
                        <input type="text" class="form-control rep-input" data-field="role" value="${escapeHTML(item.role)}" placeholder="e.g. Lead Frontend Engineer">
                    </div>
                    <div class="form-group col-12">
                        <label>Project URL (Optional)</label>
                        <input type="url" class="form-control rep-input" data-field="link" value="${escapeHTML(item.link || '')}" placeholder="e.g. github.com/project">
                    </div>
                    <div class="form-group col-12">
                        <label>Description</label>
                        <textarea rows="2" class="form-control rep-input textarea" data-field="desc" placeholder="Details of the project...">${escapeHTML(item.desc)}</textarea>
                    </div>
                </div>
            `;
        } else if (sectionType === 'languages') {
            fieldsHTML = `
                <div class="repeater-item-header" style="border:none; padding:0; margin:0;">
                    <span class="repeater-item-title">Language #${index + 1}</span>
                    <button type="button" class="btn-delete-repeater" data-section="languages" data-index="${index}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="form-grid">
                    <div class="form-group col-6">
                        <label>Language</label>
                        <input type="text" class="form-control rep-input" data-field="name" value="${escapeHTML(item.name)}" placeholder="e.g. French, Japanese">
                    </div>
                    <div class="form-group col-6">
                        <label>Proficiency</label>
                        <input type="text" class="form-control rep-input" data-field="proficiency" value="${escapeHTML(item.proficiency || '')}" placeholder="e.g. Native, Fluent">
                    </div>
                </div>
            `;
        }

        row.innerHTML = fieldsHTML;
        container.appendChild(row);
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Attach listeners to input fields of this repeater
    container.querySelectorAll('.rep-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const rowNode = e.target.closest('.repeater-item');
            const idx = parseInt(rowNode.getAttribute('data-index'));
            const field = e.target.getAttribute('data-field');
            
            if (activeResume && activeResume.data[sectionType][idx]) {
                activeResume.data[sectionType][idx][field] = e.target.value;
                renderLivePreview();
                triggerAutosave();
            }
        });
    });

    // Attach listeners to delete buttons
    container.querySelectorAll('.btn-delete-repeater').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnNode = e.target.closest('.btn-delete-repeater');
            const idx = parseInt(btnNode.getAttribute('data-index'));
            removeRepeaterItem(sectionType, idx);
        });
    });
}

function addRepeaterItem(sectionType) {
    if (!activeResume) return;

    if (!activeResume.data[sectionType]) {
        activeResume.data[sectionType] = [];
    }

    let newItem = {};
    if (sectionType === 'experience') {
        newItem = { title: '', company: '', location: '', start: '', end: '', desc: '' };
    } else if (sectionType === 'education') {
        newItem = { degree: '', school: '', location: '', start: '', end: '', desc: '' };
    } else if (sectionType === 'skills') {
        newItem = { name: '', level: '' };
    } else if (sectionType === 'projects') {
        newItem = { name: '', role: '', link: '', desc: '' };
    } else if (sectionType === 'languages') {
        newItem = { name: '', proficiency: '' };
    }

    activeResume.data[sectionType].push(newItem);
    renderRepeaterList(sectionType);
    renderLivePreview();
    triggerAutosave();
    
    // Focus the first field of the new item for smooth UX
    const list = document.getElementById(`${sectionType}-list`);
    const lastItem = list.lastElementChild;
    if (lastItem) {
        const firstInput = lastItem.querySelector('input');
        if (firstInput) firstInput.focus();
    }
}

function removeRepeaterItem(sectionType, index) {
    if (!activeResume) return;

    activeResume.data[sectionType].splice(index, 1);
    renderRepeaterList(sectionType);
    renderLivePreview();
    triggerAutosave();
}

// ==========================================================================
// PHOTO UPLOAD ENGINE
// ==========================================================================
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file || !activeResume) return;

    // File validation: check if file is an image
    if (!file.type.startsWith('image/')) {
        showToast('Invalid File', 'Please upload an image file.', 'danger');
        return;
    }

    // File validation: warn if file is very large
    if (file.size > 10 * 1024 * 1024) {
        showToast('File Too Large', 'Maximum image size is 10MB.', 'danger');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Standard profile dimensions (square 256x256 is perfect)
            const max_size = 256;
            if (width > height) {
                if (width > max_size) {
                    height *= max_size / width;
                    width = max_size;
                }
            } else {
                if (height > max_size) {
                    width *= max_size / height;
                    height = max_size;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Export as compressed jpeg (highly compressed and compact)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            activeResume.data.photo = compressedBase64;
            
            // Update Form UI
            const photoPreview = document.getElementById('photo-preview');
            photoPreview.src = compressedBase64;
            document.getElementById('btn-remove-photo').classList.remove('hidden');

            // Update preview canvas and save
            renderLivePreview();
            triggerAutosave();
            
            showToast('Photo Uploaded', 'Your profile image has been compressed and imported.', 'success');
        };
        img.onerror = function() {
            showToast('Upload Error', 'Failed to read image file.', 'danger');
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

function handlePhotoRemove() {
    if (!activeResume) return;

    activeResume.data.photo = '';
    
    // Reset Form UI
    const photoPreview = document.getElementById('photo-preview');
    photoPreview.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop';
    document.getElementById('btn-remove-photo').classList.add('hidden');
    document.getElementById('photo-upload').value = '';

    // Update preview canvas and save
    renderLivePreview();
    triggerAutosave();
    
    showToast('Photo Removed', 'Profile photo removed from resume.', 'info');
}

// ==========================================================================
// ZOOM ENGINE
// ==========================================================================
function adjustZoom(amount) {
    zoomLevel = Math.max(50, Math.min(150, zoomLevel + amount));
    applyZoom();
}

function resetZoom() {
    zoomLevel = 100;
    applyZoom();
}

function applyZoom() {
    const page = document.getElementById('resume-page-a4');
    const zoomVal = document.getElementById('zoom-value');
    
    if (page && zoomVal) {
        page.style.transform = `scale(${zoomLevel / 100})`;
        zoomVal.textContent = `${zoomLevel}%`;
        
        // Adjust the height of the scroll wrapper dynamically if zoomed in, to avoid clipping
        const scrollContainer = page.parentElement;
        if (scrollContainer && zoomLevel > 100) {
            scrollContainer.style.alignItems = 'flex-start';
        } else if (scrollContainer) {
            scrollContainer.style.alignItems = 'center';
        }
    }
}

// ==========================================================================
// LIVE PREVIEW GENERATION
// ==========================================================================
function renderLivePreview() {
    if (!activeResume) return;

    const previewContainer = document.getElementById('resume-preview-container');
    if (!previewContainer) return;

    try {
        const html = renderResume(activeResume.data, activeResume.template);
        previewContainer.innerHTML = html;
    } catch (e) {
        console.error('Error rendering preview: ', e);
    }
}

// ==========================================================================
// AUTOSAVE CONTROLLERS
// ==========================================================================
function triggerAutosave() {
    if (autosaveTimeout) {
        clearTimeout(autosaveTimeout);
    }
    autosaveTimeout = setTimeout(() => {
        saveResumeImmediately();
    }, 400); // 400ms debounce
}

function saveResumeImmediately() {
    if (!activeResume) return;

    const storageKey = getUserResumesKey();
    if (!storageKey) return;

    const resumesJson = localStorage.getItem(storageKey);
    if (!resumesJson) return;

    let resumes = JSON.parse(resumesJson);
    const idx = resumes.findIndex(r => r.id === activeResume.id);
    
    if (idx !== -1) {
        activeResume.lastModified = new Date().toISOString();
        resumes[idx] = activeResume;
        localStorage.setItem(storageKey, JSON.stringify(resumes));
        console.log('Resume autosaved successfully.');
    }
}

// ==========================================================================
// PDF EXPORT
// ==========================================================================
function handlePdfDownload() {
    if (!activeResume) return;

    const page = document.getElementById('resume-page-a4');
    if (!page) return;

    // 1. Temporarily clear zoom transform to avoid html2canvas scale compilation errors
    const prevTransform = page.style.transform;
    page.style.transform = 'none';

    // 2. Add temporary export borders override (so it renders in crisp light theme for printing)
    const wasLightTheme = document.body.classList.contains('light-theme');
    if (!wasLightTheme) {
        // Ensure printing takes place under standardized light-color configurations
        document.body.classList.add('light-theme');
    }

    // 3. Trigger PDF generation (uses html2pdf which clones elements internally)
    // We send a small delay before capturing, to let the CSS theme apply
    setTimeout(() => {
        downloadPDF(page, activeResume.title);

        // 4. Restore original layout view zoom scaling & dark theme state
        setTimeout(() => {
            page.style.transform = prevTransform;
            if (!wasLightTheme) {
                document.body.classList.remove('light-theme');
            }
        }, 500);
    }, 100);
}

// Helper to escape HTML tags in JSON bindings
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Set active accent color selection in UI
function setActiveAccentPill(accentName) {
    document.querySelectorAll('.accent-pill').forEach(pill => {
        if (pill.getAttribute('data-accent') === accentName) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
}

// Backup & Restore Actions
function handleExportBackup() {
    if (!activeResume) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeResume, null, 2));
    const downloadAnchor = document.createElement('a');
    
    const safeTitle = (activeResume.title || 'resume_backup').toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `resumake_backup_${safeTitle}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    showToast('Backup Created', 'Your resume backup JSON has been downloaded.', 'success');
}

function handleImportBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        showToast('Invalid File Type', 'Please select a valid .json backup file.', 'danger');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const imported = JSON.parse(evt.target.result);
            
            // Validate basic structure
            if (!imported.title || !imported.template || !imported.data || !imported.data.fullName) {
                showToast('Import Failed', 'Invalid backup format. Missing core properties.', 'danger');
                return;
            }
            
            const storageKey = getUserResumesKey();
            if (!storageKey) {
                showToast('Import Failed', 'No authenticated user session found.', 'danger');
                return;
            }
            
            const resumesJson = localStorage.getItem(storageKey);
            const resumes = resumesJson ? JSON.parse(resumesJson) : [];
            
            // Re-generate ID & modify fields
            imported.id = 'res_' + Math.random().toString(36).substring(2, 11);
            imported.lastModified = new Date().toISOString();
            imported.title = imported.title + ' (Imported)';
            
            resumes.push(imported);
            localStorage.setItem(storageKey, JSON.stringify(resumes));
            
            showToast('Success!', `Imported resume: "${imported.title}"`, 'success');
            
            e.target.value = '';
            loadUserResumes();
        } catch (err) {
            console.error('Error parsing JSON backup: ', err);
            showToast('Import Failed', 'Failed to parse JSON file.', 'danger');
        }
    };
    reader.readAsText(file);
}
