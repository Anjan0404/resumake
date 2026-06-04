/**
 * ResuMake - Resume Template Rendering Module
 */

const ACCENTS = {
    indigo: { primary: '#6366f1', light: 'rgba(99, 102, 241, 0.12)' },
    violet: { primary: '#8b5cf6', light: 'rgba(139, 92, 246, 0.12)' },
    emerald: { primary: '#10b981', light: 'rgba(16, 185, 129, 0.12)' },
    amber: { primary: '#f59e0b', light: 'rgba(245, 158, 11, 0.12)' },
    crimson: { primary: '#e11d48', light: 'rgba(225, 29, 72, 0.12)' },
    slate: { primary: '#475569', light: 'rgba(71, 85, 105, 0.12)' },
    blue: { primary: '#0284c7', light: 'rgba(2, 132, 199, 0.12)' }
};

function getAccentStyles(accentName, defaultAccent = 'indigo') {
    const name = accentName || defaultAccent;
    const config = ACCENTS[name] || ACCENTS[defaultAccent] || ACCENTS.indigo;
    return `--tmpl-accent: ${config.primary}; --tmpl-accent-light: ${config.light};`;
}

// Helper to escape HTML to prevent XSS and formatting issues
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Helper to format descriptions with line breaks / bullet points
function formatDescription(desc) {
    if (!desc) return '';
    const escaped = escapeHTML(desc);
    // If it has bullet points (lines starting with - or *), wrap them in ul/li
    const lines = escaped.split('\n');
    if (lines.some(l => l.trim().startsWith('-') || l.trim().startsWith('*'))) {
        let inList = false;
        let html = '';
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${trimmed.substring(1).trim()}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (trimmed) {
                    html += `<p>${trimmed}</p>`;
                }
            }
        });
        if (inList) html += '</ul>';
        return html;
    }
    // Otherwise just return paragraphs
    return lines.map(line => line.trim() ? `<p>${line}</p>` : '').join('');
}
// Templates collection
const Templates = {

    atsClassic(data) {
        return `
        ...
        `;
    },

    modern(data) {
        ...
    },

    creative(data) {
        ...
    },

    executive(data) {
        ...
    }

};
    // --------------------------------------------------------------------------
    // 1. SLEEK MODERN TEMPLATE
    // --------------------------------------------------------------------------
  atsClassic(data) {
    return `
    <div style="padding:40px;font-family:Arial,sans-serif;color:#000;background:#fff;">
        <h1 style="margin:0;">${escapeHTML(data.fullName || 'Your Name')}</h1>
        <h3 style="margin:5px 0 15px 0;">${escapeHTML(data.jobTitle || '')}</h3>

        <p>
            ${escapeHTML(data.email || '')} |
            ${escapeHTML(data.phone || '')} |
            ${escapeHTML(data.location || '')}
        </p>

        <hr>

        <h2>Professional Summary</h2>
        <p>${escapeHTML(data.summary || '')}</p>

        <h2>Experience</h2>
        ${(data.experience || []).map(exp => `
            <div style="margin-bottom:15px;">
                <strong>${escapeHTML(exp.title)}</strong><br>
                ${escapeHTML(exp.company)}<br>
                ${escapeHTML(exp.start)} - ${escapeHTML(exp.end || 'Present')}
                <p>${escapeHTML(exp.desc || '')}</p>
            </div>
        `).join('')}

        <h2>Education</h2>
        ${(data.education || []).map(edu => `
            <div style="margin-bottom:15px;">
                <strong>${escapeHTML(edu.degree)}</strong><br>
                ${escapeHTML(edu.school)}
            </div>
        `).join('')}

        <h2>Skills</h2>
        <p>
            ${(data.skills || []).map(skill => escapeHTML(skill.name)).join(', ')}
        </p>
    </div>
    `;
},  
modern(data) {
        const photoHTML = data.photo ? `
            <div class="tmpl-modern-photo-wrap">
                <img src="${data.photo}" alt="Profile Photo">
            </div>
        ` : '';

        // Contact info elements
        const contactHTML = `
            <div class="tmpl-modern-contact-list">
                ${data.email ? `<div class="tmpl-contact-item"><i data-lucide="mail"></i><span>${escapeHTML(data.email)}</span></div>` : ''}
                ${data.phone ? `<div class="tmpl-contact-item"><i data-lucide="phone"></i><span>${escapeHTML(data.phone)}</span></div>` : ''}
                ${data.location ? `<div class="tmpl-contact-item"><i data-lucide="map-pin"></i><span>${escapeHTML(data.location)}</span></div>` : ''}
                ${data.website ? `<div class="tmpl-contact-item"><i data-lucide="globe"></i><span>${escapeHTML(data.website)}</span></div>` : ''}
            </div>
        `;

        // Skills section
        const skillsHTML = data.skills && data.skills.length > 0 ? `
            <div class="tmpl-modern-section">
                <h3 class="tmpl-modern-section-title">Skills</h3>
                <div class="tmpl-modern-skills-list">
                    ${data.skills.map(s => `
                        <span class="tmpl-modern-skill-tag">
                            ${escapeHTML(s.name)}${s.level ? ` (${escapeHTML(s.level)})` : ''}
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Languages section
        const languagesHTML = data.languages && data.languages.length > 0 ? `
            <div class="tmpl-modern-section">
                <h3 class="tmpl-modern-section-title">Languages</h3>
                <div class="tmpl-modern-skills-list">
                    ${data.languages.map(l => `
                        <span class="tmpl-modern-skill-tag" style="background-color: #eef2f6;">
                            ${escapeHTML(l.name)}${l.proficiency ? `: ${escapeHTML(l.proficiency)}` : ''}
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Experience items
        const experienceHTML = data.experience && data.experience.length > 0 ? `
            <div class="tmpl-modern-section">
                <h3 class="tmpl-modern-section-title">Experience</h3>
                <div>
                    ${data.experience.map(exp => `
                        <div class="tmpl-modern-item">
                            <div class="tmpl-modern-item-header">
                                <div>
                                    <div class="tmpl-modern-item-role">${escapeHTML(exp.title)}</div>
                                    <div class="tmpl-modern-item-comp">${escapeHTML(exp.company)}${exp.location ? `, ${escapeHTML(exp.location)}` : ''}</div>
                                </div>
                                <div class="tmpl-modern-item-date">${escapeHTML(exp.start)} - ${escapeHTML(exp.end || 'Present')}</div>
                            </div>
                            <div class="tmpl-modern-item-desc">${formatDescription(exp.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Education items
        const educationHTML = data.education && data.education.length > 0 ? `
            <div class="tmpl-modern-section">
                <h3 class="tmpl-modern-section-title">Education</h3>
                <div>
                    ${data.education.map(edu => `
                        <div class="tmpl-modern-item">
                            <div class="tmpl-modern-item-header">
                                <div>
                                    <div class="tmpl-modern-item-role">${escapeHTML(edu.degree)}</div>
                                    <div class="tmpl-modern-item-comp">${escapeHTML(edu.school)}${edu.location ? `, ${escapeHTML(edu.location)}` : ''}</div>
                                </div>
                                <div class="tmpl-modern-item-date">${escapeHTML(edu.start)} - ${escapeHTML(edu.end || 'Present')}</div>
                            </div>
                            <div class="tmpl-modern-item-desc">${formatDescription(edu.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Projects section
        const projectsHTML = data.projects && data.projects.length > 0 ? `
            <div class="tmpl-modern-section">
                <h3 class="tmpl-modern-section-title">Projects</h3>
                <div>
                    ${data.projects.map(proj => `
                        <div class="tmpl-modern-item">
                            <div class="tmpl-modern-item-header">
                                <div>
                                    <div class="tmpl-modern-item-role">${escapeHTML(proj.name)}</div>
                                    <div class="tmpl-modern-item-comp">${escapeHTML(proj.role)}</div>
                                </div>
                                ${proj.link ? `<div class="tmpl-modern-item-date"><a href="${escapeHTML(proj.link)}" target="_blank" style="color: var(--tmpl-accent); text-decoration: none;">View Project</a></div>` : ''}
                            </div>
                            <div class="tmpl-modern-item-desc">${formatDescription(proj.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return `
            <div class="tmpl-modern-wrapper" style="${getAccentStyles(data.accentColor, 'indigo')}">
                <!-- Sidebar -->
                <div class="tmpl-modern-sidebar">
                    <div>
                        ${photoHTML}
                        <h1 class="tmpl-modern-name">${escapeHTML(data.fullName || 'Your Name')}</h1>
                        <h2 class="tmpl-modern-title">${escapeHTML(data.jobTitle || 'Your Profession')}</h2>
                    </div>
                    
                    <div class="tmpl-modern-section">
                        <h3 class="tmpl-modern-section-title">Contact</h3>
                        ${contactHTML}
                    </div>

                    ${skillsHTML}
                    ${languagesHTML}
                </div>

                <!-- Main Content -->
                <div class="tmpl-modern-main">
                    ${data.summary ? `
                        <div class="tmpl-modern-section">
                            <h3 class="tmpl-modern-section-title">Summary</h3>
                            <div style="font-size: 0.8125rem; color: #4b5563; line-height: 1.5;">${escapeHTML(data.summary)}</div>
                        </div>
                    ` : ''}

                    ${experienceHTML}
                    ${educationHTML}
                    ${projectsHTML}
                </div>
            </div>
        `;
    },

    // --------------------------------------------------------------------------
    // 2. CREATIVE TIMELINE TEMPLATE
    // --------------------------------------------------------------------------
    creative(data) {
        const photoHTML = data.photo ? `
            <div class="tmpl-creative-photo">
                <img src="${data.photo}" alt="Profile Photo">
            </div>
        ` : '';

        // Contact info horizontal list
        const contactHTML = `
            <div class="tmpl-creative-contact">
                ${data.email ? `<span class="tmpl-contact-item"><i data-lucide="mail"></i>${escapeHTML(data.email)}</span>` : ''}
                ${data.phone ? `<span class="tmpl-contact-item"><i data-lucide="phone"></i>${escapeHTML(data.phone)}</span>` : ''}
                ${data.location ? `<span class="tmpl-contact-item"><i data-lucide="map-pin"></i>${escapeHTML(data.location)}</span>` : ''}
                ${data.website ? `<span class="tmpl-contact-item"><i data-lucide="globe"></i>${escapeHTML(data.website)}</span>` : ''}
            </div>
        `;

        // Skills pills
        const skillsHTML = data.skills && data.skills.length > 0 ? `
            <div class="tmpl-creative-section">
                <h3 class="tmpl-creative-section-title"><i data-lucide="star"></i>Skills</h3>
                <div class="tmpl-creative-skill-list">
                    ${data.skills.map(s => `
                        <span class="tmpl-creative-skill-pill">${escapeHTML(s.name)}${s.level ? ` • ${escapeHTML(s.level)}` : ''}</span>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Languages list
        const languagesHTML = data.languages && data.languages.length > 0 ? `
            <div class="tmpl-creative-section">
                <h3 class="tmpl-creative-section-title"><i data-lucide="languages"></i>Languages</h3>
                <div class="tmpl-creative-skill-list">
                    ${data.languages.map(l => `
                        <span class="tmpl-creative-skill-pill" style="background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.2); color: #047857;">
                            ${escapeHTML(l.name)}${l.proficiency ? ` (${escapeHTML(l.proficiency)})` : ''}
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Timeline Work Experience
        const experienceHTML = data.experience && data.experience.length > 0 ? `
            <div class="tmpl-creative-section">
                <h3 class="tmpl-creative-section-title"><i data-lucide="briefcase"></i>Work Experience</h3>
                <div class="tmpl-creative-timeline">
                    ${data.experience.map(exp => `
                        <div class="tmpl-creative-timeline-item">
                            <div class="tmpl-creative-item-role">${escapeHTML(exp.title)}</div>
                            <div class="tmpl-creative-item-meta">
                                <span class="tmpl-creative-item-comp">${escapeHTML(exp.company)}${exp.location ? `, ${escapeHTML(exp.location)}` : ''}</span>
                                <span class="tmpl-creative-item-date">${escapeHTML(exp.start)} - ${escapeHTML(exp.end || 'Present')}</span>
                            </div>
                            <div class="tmpl-creative-item-desc">${formatDescription(exp.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Timeline Education
        const educationHTML = data.education && data.education.length > 0 ? `
            <div class="tmpl-creative-section">
                <h3 class="tmpl-creative-section-title"><i data-lucide="graduation-cap"></i>Education</h3>
                <div class="tmpl-creative-timeline">
                    ${data.education.map(edu => `
                        <div class="tmpl-creative-timeline-item">
                            <div class="tmpl-creative-item-role">${escapeHTML(edu.degree)}</div>
                            <div class="tmpl-creative-item-meta">
                                <span class="tmpl-creative-item-comp">${escapeHTML(edu.school)}${edu.location ? `, ${escapeHTML(edu.location)}` : ''}</span>
                                <span class="tmpl-creative-item-date">${escapeHTML(edu.start)} - ${escapeHTML(edu.end || 'Present')}</span>
                            </div>
                            <div class="tmpl-creative-item-desc">${formatDescription(edu.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Projects list
        const projectsHTML = data.projects && data.projects.length > 0 ? `
            <div class="tmpl-creative-section">
                <h3 class="tmpl-creative-section-title"><i data-lucide="folder-git"></i>Featured Projects</h3>
                <div class="tmpl-creative-timeline">
                    ${data.projects.map(proj => `
                        <div class="tmpl-creative-timeline-item">
                            <div class="tmpl-creative-item-role">
                                ${escapeHTML(proj.name)}
                                ${proj.link ? `<a href="${escapeHTML(proj.link)}" target="_blank" style="margin-left: 8px; font-size: 0.75rem; color: var(--tmpl-accent); text-decoration: none;"><i data-lucide="external-link" style="display:inline-block; width:12px; height:12px; vertical-align:middle;"></i></a>` : ''}
                            </div>
                            <div class="tmpl-creative-item-meta">
                                <span class="tmpl-creative-item-comp">${escapeHTML(proj.role)}</span>
                            </div>
                            <div class="tmpl-creative-item-desc">${formatDescription(proj.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return `
            <div class="tmpl-creative-wrapper" style="${getAccentStyles(data.accentColor, 'violet')}">
                <!-- Header -->
                <div class="tmpl-creative-header">
                    ${photoHTML}
                    <div class="tmpl-creative-info">
                        <h1 class="tmpl-creative-name">${escapeHTML(data.fullName || 'Your Name')}</h1>
                        <h2 class="tmpl-creative-title">${escapeHTML(data.jobTitle || 'Your Profession')}</h2>
                        ${contactHTML}
                    </div>
                </div>

                <!-- Grid Body -->
                <div class="tmpl-creative-grid">
                    <!-- Left Side (Main Timeline) -->
                    <div>
                        ${experienceHTML}
                        ${educationHTML}
                    </div>

                    <!-- Right Side (Details summary & Skills) -->
                    <div>
                        ${data.summary ? `
                            <div class="tmpl-creative-section">
                                <h3 class="tmpl-creative-section-title"><i data-lucide="file-edit"></i>About Me</h3>
                                <p style="font-size: 0.8125rem; color: #4a5568; line-height: 1.5;">${escapeHTML(data.summary)}</p>
                            </div>
                        ` : ''}

                        ${skillsHTML}
                        ${languagesHTML}
                        ${projectsHTML}
                    </div>
                </div>
            </div>
        `;
    },

    // --------------------------------------------------------------------------
    // 3. EXECUTIVE ELITE TEMPLATE (Classic Elegant Formal)
    // --------------------------------------------------------------------------
    executive(data) {
        // Centered contact block
        const contactItems = [];
        if (data.email) contactItems.push(escapeHTML(data.email));
        if (data.phone) contactItems.push(escapeHTML(data.phone));
        if (data.location) contactItems.push(escapeHTML(data.location));
        if (data.website) contactItems.push(escapeHTML(data.website));

        const contactHTML = contactItems.length > 0 ? `
            <div class="tmpl-executive-contact">
                ${contactItems.join('  •  ')}
            </div>
        ` : '';

        // Skills block in a list
        const skillsHTML = data.skills && data.skills.length > 0 ? `
            <div class="tmpl-executive-section">
                <h3 class="tmpl-executive-section-title">Areas of Expertise</h3>
                <div class="tmpl-executive-skills">
                    <strong>Key Skills:</strong> 
                    ${data.skills.map(s => `${escapeHTML(s.name)}${s.level ? ` (${escapeHTML(s.level)})` : ''}`).join(', ')}
                </div>
            </div>
        ` : '';

        // Languages
        const languagesHTML = data.languages && data.languages.length > 0 ? `
            <div class="tmpl-executive-section">
                <h3 class="tmpl-executive-section-title">Languages</h3>
                <div class="tmpl-executive-skills">
                    ${data.languages.map(l => `<strong>${escapeHTML(l.name)}</strong>${l.proficiency ? ` (${escapeHTML(l.proficiency)})` : ''}`).join('  |  ')}
                </div>
            </div>
        ` : '';

        // Experience
        const experienceHTML = data.experience && data.experience.length > 0 ? `
            <div class="tmpl-executive-section">
                <h3 class="tmpl-executive-section-title">Professional Experience</h3>
                <div>
                    ${data.experience.map(exp => `
                        <div class="tmpl-executive-item">
                            <div class="tmpl-executive-item-top">
                                <div class="tmpl-executive-item-left">
                                    ${escapeHTML(exp.title)} — <span>${escapeHTML(exp.company)}</span>
                                </div>
                                <div class="tmpl-executive-item-date">${escapeHTML(exp.start)} - ${escapeHTML(exp.end || 'Present')}</div>
                            </div>
                            ${exp.location ? `<div style="font-size:0.75rem; color:#6b7280; font-style:italic; margin-bottom:0.25rem;">${escapeHTML(exp.location)}</div>` : ''}
                            <div class="tmpl-executive-item-desc">${formatDescription(exp.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Education
        const educationHTML = data.education && data.education.length > 0 ? `
            <div class="tmpl-executive-section">
                <h3 class="tmpl-executive-section-title">Education</h3>
                <div>
                    ${data.education.map(edu => `
                        <div class="tmpl-executive-item">
                            <div class="tmpl-executive-item-top">
                                <div class="tmpl-executive-item-left">
                                    ${escapeHTML(edu.degree)} — <span>${escapeHTML(edu.school)}</span>
                                </div>
                                <div class="tmpl-executive-item-date">${escapeHTML(edu.start)} - ${escapeHTML(edu.end || 'Present')}</div>
                            </div>
                            ${edu.location ? `<div style="font-size:0.75rem; color:#6b7280; font-style:italic; margin-bottom:0.25rem;">${escapeHTML(edu.location)}</div>` : ''}
                            <div class="tmpl-executive-item-desc">${formatDescription(edu.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Projects
        const projectsHTML = data.projects && data.projects.length > 0 ? `
            <div class="tmpl-executive-section">
                <h3 class="tmpl-executive-section-title">Key Projects</h3>
                <div>
                    ${data.projects.map(proj => `
                        <div class="tmpl-executive-item">
                            <div class="tmpl-executive-item-top">
                                <div class="tmpl-executive-item-left">
                                    ${escapeHTML(proj.name)} ${proj.link ? `<span style="font-weight:normal; font-size:0.75rem;">(<a href="${escapeHTML(proj.link)}" style="color: var(--tmpl-accent); text-decoration:underline;">link</a>)</span>` : ''}
                                </div>
                                <div class="tmpl-executive-item-date">${escapeHTML(proj.role)}</div>
                            </div>
                            <div class="tmpl-executive-item-desc">${formatDescription(proj.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return `
            <div class="tmpl-executive-wrapper" style="${getAccentStyles(data.accentColor, 'slate')}">
                <!-- Header -->
                <div class="tmpl-executive-header">
                    <h1 class="tmpl-executive-name">${escapeHTML(data.fullName || 'Your Name')}</h1>
                    <h2 class="tmpl-executive-title">${escapeHTML(data.jobTitle || 'Your Profession')}</h2>
                    ${contactHTML}
                </div>

                <!-- Summary -->
                ${data.summary ? `
                    <div class="tmpl-executive-section">
                        <h3 class="tmpl-executive-section-title">Executive Summary</h3>
                        <p style="font-size: 0.8125rem; line-height: 1.5; color:#374151; text-align:justify;">${escapeHTML(data.summary)}</p>
                    </div>
                ` : ''}

                ${experienceHTML}
                ${educationHTML}
                ${projectsHTML}
                ${skillsHTML}
                ${languagesHTML}
            </div>
        `;
    },

    // --------------------------------------------------------------------------
    // 4. TECH VANGUARD TEMPLATE (Clean Technical Developer layout)
    // --------------------------------------------------------------------------
    tech(data) {
        const photoHTML = data.photo ? `
            <div class="tmpl-tech-photo">
                <img src="${data.photo}" alt="Profile Photo">
            </div>
        ` : '';

        // Contact info column formatted
        const contactHTML = `
            <div class="tmpl-tech-contact">
                ${data.email ? `<div class="tmpl-contact-item"><span>${escapeHTML(data.email)}</span><i data-lucide="mail"></i></div>` : ''}
                ${data.phone ? `<div class="tmpl-contact-item"><span>${escapeHTML(data.phone)}</span><i data-lucide="phone"></i></div>` : ''}
                ${data.location ? `<div class="tmpl-contact-item"><span>${escapeHTML(data.location)}</span><i data-lucide="map-pin"></i></div>` : ''}
                ${data.website ? `<div class="tmpl-contact-item"><span><a href="${escapeHTML(data.website)}" style="color:#475569; text-decoration:none;">${escapeHTML(data.website.replace(/^https?:\/\//, ''))}</a></span><i data-lucide="globe"></i></div>` : ''}
            </div>
        `;

        // Skill Badges
        const skillsHTML = data.skills && data.skills.length > 0 ? `
            <div class="tmpl-tech-section">
                <h3 class="tmpl-tech-section-title">Technical Stack</h3>
                <div class="tmpl-tech-skills-box">
                    ${data.skills.map(s => `
                        <span class="tmpl-tech-skill-badge">${escapeHTML(s.name)}${s.level ? ` [${escapeHTML(s.level)}]` : ''}</span>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Languages
        const languagesHTML = data.languages && data.languages.length > 0 ? `
            <div class="tmpl-tech-section">
                <h3 class="tmpl-tech-section-title">Languages</h3>
                <div class="tmpl-tech-skills-box">
                    ${data.languages.map(l => `
                        <span class="tmpl-tech-skill-badge" style="background-color: #f8fafc; border-color: #cbd5e1;">
                            ${escapeHTML(l.name)}${l.proficiency ? ` (${escapeHTML(l.proficiency)})` : ''}
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Experience
        const experienceHTML = data.experience && data.experience.length > 0 ? `
            <div class="tmpl-tech-section">
                <h3 class="tmpl-tech-section-title">Experience</h3>
                <div>
                    ${data.experience.map(exp => `
                        <div class="tmpl-tech-item">
                            <div class="tmpl-tech-item-role">${escapeHTML(exp.title)}</div>
                            <div class="tmpl-tech-item-meta">
                                <span class="tmpl-tech-item-comp"><strong>${escapeHTML(exp.company)}</strong>${exp.location ? ` | ${escapeHTML(exp.location)}` : ''}</span>
                                <span>${escapeHTML(exp.start)} - ${escapeHTML(exp.end || 'Present')}</span>
                            </div>
                            <div class="tmpl-tech-item-desc">${formatDescription(exp.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Education
        const educationHTML = data.education && data.education.length > 0 ? `
            <div class="tmpl-tech-section">
                <h3 class="tmpl-tech-section-title">Education</h3>
                <div>
                    ${data.education.map(edu => `
                        <div class="tmpl-tech-item">
                            <div class="tmpl-tech-item-role">${escapeHTML(edu.degree)}</div>
                            <div class="tmpl-tech-item-meta">
                                <span class="tmpl-tech-item-comp"><strong>${escapeHTML(edu.school)}</strong>${edu.location ? ` | ${escapeHTML(edu.location)}` : ''}</span>
                                <span>${escapeHTML(edu.start)} - ${escapeHTML(edu.end || 'Present')}</span>
                            </div>
                            ${edu.desc ? `<div class="tmpl-tech-item-desc">${formatDescription(edu.desc)}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Projects
        const projectsHTML = data.projects && data.projects.length > 0 ? `
            <div class="tmpl-tech-section">
                <h3 class="tmpl-tech-section-title">Projects</h3>
                <div>
                    ${data.projects.map(proj => `
                        <div class="tmpl-tech-item">
                            <div class="tmpl-tech-item-role">
                                ${escapeHTML(proj.name)}
                                ${proj.link ? `<a href="${escapeHTML(proj.link)}" style="margin-left:5px; font-size:10px; font-weight:normal; color: var(--tmpl-accent); text-decoration:none;">git://</a>` : ''}
                            </div>
                            <div class="tmpl-tech-item-meta">
                                <span class="tmpl-tech-item-comp">${escapeHTML(proj.role)}</span>
                            </div>
                            <div class="tmpl-tech-item-desc">${formatDescription(proj.desc)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return `
            <div class="tmpl-tech-wrapper" style="${getAccentStyles(data.accentColor, 'blue')}">
                <!-- Header -->
                <div class="tmpl-tech-header">
                    <div class="tmpl-tech-header-left">
                        ${photoHTML}
                        <div>
                            <h1 class="tmpl-tech-name">${escapeHTML(data.fullName || 'Your Name')}</h1>
                            <div class="tmpl-tech-title">${escapeHTML(data.jobTitle || 'Your Profession')}</div>
                        </div>
                    </div>
                    ${contactHTML}
                </div>

                <!-- Grid layout -->
                <div class="tmpl-tech-grid">
                    <!-- Left Side -->
                    <div>
                        ${experienceHTML}
                        ${projectsHTML}
                    </div>
                    <!-- Right Side -->
                    <div>
                        ${data.summary ? `
                            <div class="tmpl-tech-section">
                                <h3 class="tmpl-tech-section-title">Summary</h3>
                                <p style="font-size: 0.8125rem; color:#334155; line-height:1.45;">${escapeHTML(data.summary)}</p>
                            </div>
                        ` : ''}
                        ${skillsHTML}
                        ${languagesHTML}
                        ${educationHTML}
                    </div>
                </div>
            </div>
        `;
    }
};

// Main entry point for rendering the templates
function renderResume(data, templateId) {
    const renderFn = Templates[templateId] || Templates.modern;
    const html = renderFn(data);
    
    // Inject and immediately process with Lucide Icons if available
    setTimeout(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, 10);
    
    return html;
}
