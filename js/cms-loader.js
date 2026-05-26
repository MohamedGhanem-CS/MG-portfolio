/* ==========================================================================
   DEVELOPER PORTFOLIO - DYNAMIC CMS CONTENT LOADER
   Author: Mohamed Ghanem (AI Engineer & CS Student)
   Description: Fetches CMS-managed JSON data files and dynamically updates
                the DOM, maintaining pre-rendered static content as an SEO fallback.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are running in local backend mode or on production
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Helper to sanitize HTML to prevent Cross-Site Scripting (XSS)
    const sanitize = (str) => {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    // We fetch JSON resources asynchronously
    const loadCMSContent = async () => {
        try {
            // Load Profile Data
            const profileRes = await fetch('/content/profile.json');
            if (profileRes.ok) {
                const profile = await profileRes.json();
                updateProfile(profile);
            }
            
            // Load About & Skills Data
            const aboutRes = await fetch('/content/about.json');
            if (aboutRes.ok) {
                const about = await aboutRes.json();
                updateAbout(about);
            }

            // Load Projects Data
            const projectsRes = await fetch('/content/projects.json');
            if (projectsRes.ok) {
                const projects = await projectsRes.json();
                updateProjects(projects);
            }

            // Load Experience Data
            const experienceRes = await fetch('/content/experience.json');
            if (experienceRes.ok) {
                const experience = await experienceRes.json();
                updateExperience(experience);
            }
            
        } catch (error) {
            console.warn('CMS Loader: Gracefully fell back to static pre-rendered HTML content.', error);
        }
    };

    // 1. UPDATE PROFILE & HERO
    const updateProfile = (data) => {
        if (!data) return;

        // Update Badge
        const badgeEl = document.querySelector('.hero-badge');
        if (badgeEl && data.badge) {
            badgeEl.innerHTML = `<span></span> ${sanitize(data.badge)}`;
        }

        // Update Name
        const nameEl = document.querySelector('.hero-title span.name');
        if (nameEl && data.name) {
            nameEl.textContent = data.name;
        }

        // Expose subtitles globally for script.js auto-typing mechanism
        if (data.subtitles && Array.isArray(data.subtitles)) {
            window.portfolioRoles = data.subtitles.map(s => s.subtitle);
            // If typing animation is already active, we can trigger an event or let it run
        }

        // Update Description
        const descEl = document.querySelector('.hero-desc');
        if (descEl && data.description) {
            descEl.textContent = data.description;
        }

        // Update Profile Avatar
        const avatarEl = document.querySelector('.profile-img');
        if (avatarEl && data.profile_image) {
            avatarEl.src = data.profile_image;
        }

        // Update Social Links
        const githubLinks = document.querySelectorAll('a[href*="github.com"]');
        if (githubLinks && data.github) {
            githubLinks.forEach(link => {
                if (!link.classList.contains('project-link')) {
                    link.href = data.github;
                }
            });
        }

        const linkedinLinks = document.querySelectorAll('a[href*="linkedin.com"]');
        if (linkedinLinks && data.linkedin) {
            linkedinLinks.forEach(link => link.href = data.linkedin);
        }

        // Update Gmail composits
        if (data.gmail) {
            const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${data.gmail}`;
            const gmailLinks = document.querySelectorAll('.social-icon.gmail, .btn-nav-contact, #hero-btn-contact');
            gmailLinks.forEach(link => {
                if (link.tagName === 'A' && (link.href.includes('mailto:') || link.href.includes('mail.google.com'))) {
                    link.href = gmailComposeUrl;
                }
            });
        }
    };

    // 2. UPDATE ABOUT & SKILLS
    const updateAbout = (data) => {
        if (!data) return;

        // Update Biography paragraphs
        const bioContainer = document.querySelector('.about-content');
        if (bioContainer && data.bio) {
            // Keep the header <h3> and stats, only replace paragraphs
            const paragraphs = bioContainer.querySelectorAll('p');
            const bioTexts = data.bio.split('\n\n');
            
            paragraphs.forEach((p, idx) => {
                if (bioTexts[idx]) {
                    p.textContent = bioTexts[idx];
                }
            });
        }

        // Update Skills Lists
        const skillIcons = {
            "python": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
            "c#": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
            "c# (c-sharp)": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
            "c language": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`,
            "c": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`,
            "html5 & css3": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
            "html & css": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
            "javascript": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`,
            "sql & databases": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`,
            "sql": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`,
            "prompt engineering": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="6" r="3"></circle><line x1="6" y1="9" x2="6" y2="21"></line><path d="M9 6h9M6 15h9"/></svg>`,
            "llm api orchestration": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
            "llm api": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
            "rag & vector search": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zM6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/></svg>`,
            "rag": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zM6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/></svg>`,
            "model inference evaluation": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
            "ollama & local llms": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg>`,
            "ollama": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg>`,
            "git & github": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
            "git": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
            "vs code": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
            "jupyter notebooks": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
            "docker": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="5" ry="5"></ellipse><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
            "scratch coding": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-9M12 8V2M5 12h14"/></svg>`,
            "scratch": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-9M12 8V2M5 12h14"/></svg>`
        };

        const defaultIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 22 22 22 12 2"></polygon></svg>`;
        
        // Define subtexts map for fallback when CMS has no subtitle field yet
        const subtexts = {
            "python": "Object Oriented & ML",
            "c# (c-sharp)": "Enterprise Systems & OOP",
            "c language": "Low-Level Logic & Memory",
            "html5 & css3": "Modern Layouts & System",
            "javascript": "Dynamic Interactions",
            "sql & databases": "Structured Queries",
            "prompt engineering": "System prompts & Contexts",
            "llm api orchestration": "OpenAI, Claude & DeepSeek",
            "rag & vector search": "Context retrieval tools",
            "model inference evaluation": "Latency & Token diagnostics",
            "ollama & local llms": "System deployment",
            "git & github": "Version control & Collab",
            "vs code": "Advanced IDE workflows",
            "jupyter notebooks": "Data analysis & Prototyping",
            "docker": "Containerization Basics",
            "scratch coding": "Logical systems foundation"
        };

        const buildSkillPanel = (skillsArray, panelId) => {
            const panel = document.getElementById(panelId);
            if (!panel) return;

            let html = '';
            skillsArray.forEach(skill => {
                const nameClean = skill.name.toLowerCase().trim();
                const iconSVG = skillIcons[nameClean] || defaultIcon;
                const subtext = skill.desc || subtexts[nameClean] || "Professional Skill";
                
                html += `
                    <div class="skill-card">
                        <div class="skill-icon-wrap">
                            ${iconSVG}
                        </div>
                        <div class="skill-info">
                            <h4>${sanitize(skill.name)}</h4>
                            <span>${sanitize(subtext)}</span>
                        </div>
                    </div>
                `;
            });
            panel.innerHTML = html;
        };

        if (data.languages) buildSkillPanel(data.languages, 'tab-languages');
        if (data.ai_skills) buildSkillPanel(data.ai_skills, 'tab-ai');
        if (data.dev_tools) buildSkillPanel(data.dev_tools, 'tab-tools');
    };

    // 3. UPDATE PROJECTS GRID
    const updateProjects = (data) => {
        const grid = document.querySelector('.projects-grid');
        if (!grid || !data.items || !Array.isArray(data.items)) return;

        const projectBanners = {
            "promptcraft": `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="9" y1="9" x2="21" y2="9"></line></svg>`,
            "neuralforge": `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"></circle><circle cx="5" cy="19" r="3"></circle><circle cx="19" cy="19" r="3"></circle><line x1="12" y1="8" x2="5" y2="16"></line><line x1="12" y1="8" x2="19" y2="16"></line></svg>`,
            "localagent": `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
            "pystream": `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
            "default": `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`
        };

        let html = '';
        data.items.forEach(project => {
            const bannerSVG = projectBanners[project.image_key] || projectBanners["default"];
            
            // Build tags list HTML
            let tagsHtml = '';
            if (project.tags && Array.isArray(project.tags)) {
                project.tags.forEach(t => {
                    tagsHtml += `<span class="project-tag">${sanitize(t.tag)}</span>`;
                });
            }

            // Build external link HTML
            let linksHtml = `
                <a href="${sanitize(project.github_url)}" class="project-link" target="_blank" rel="noopener noreferrer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                    Codebase
                </a>
            `;

            if (project.demo_url) {
                linksHtml += `
                    <a href="${sanitize(project.demo_url)}" class="project-link demo" target="_blank" rel="noopener noreferrer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        Live Demo
                    </a>
                `;
            }

            html += `
                <div class="project-card reveal-on-scroll">
                    <div class="project-banner">
                        <div class="project-banner-icon">
                            ${bannerSVG}
                        </div>
                    </div>
                    <div class="project-body">
                        <div class="project-tags">
                            ${tagsHtml}
                        </div>
                        <h3 class="project-title">${sanitize(project.title)}</h3>
                        <p class="project-desc">${sanitize(project.description)}</p>
                        <div class="project-links">
                            ${linksHtml}
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;

        // Re-observe scroll reveals since we added new elements to the DOM
        if (typeof window.reObserveScrollReveals === 'function') {
            window.reObserveScrollReveals();
        }
    };

    // 4. UPDATE EXPERIENCE JOURNEY
    const updateExperience = (data) => {
        const timeline = document.querySelector('.experience-timeline');
        if (!timeline || !data.items || !Array.isArray(data.items)) return;

        const timelineBadges = {
            "education": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`,
            "work": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
            "certification": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><polyline points="12 6 12 12 16 14"/></svg>`
        };

        let html = '';
        data.items.forEach(event => {
            const badgeSVG = timelineBadges[event.type] || timelineBadges["education"];
            
            // Build bullet points HTML
            let bulletsHtml = '';
            if (event.bullets && Array.isArray(event.bullets)) {
                event.bullets.forEach(b => {
                    bulletsHtml += `<li>${sanitize(b.bullet)}</li>`;
                });
            }

            html += `
                <div class="timeline-item reveal-on-scroll">
                    <div class="timeline-badge">
                        ${badgeSVG}
                    </div>
                    <div class="timeline-card">
                        <div class="timeline-header">
                            <div class="timeline-title">
                                <h3>${sanitize(event.title)}</h3>
                                <div class="company">${sanitize(event.organization)}</div>
                            </div>
                            <div class="timeline-meta">
                                <span class="timeline-date">${sanitize(event.date)}</span>
                                <div class="timeline-location">${sanitize(event.location || 'Remote')}</div>
                            </div>
                        </div>
                        <div class="timeline-body">
                            <ul>
                                ${bulletsHtml}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        });

        timeline.innerHTML = html;

        // Re-observe scroll reveals since we added new elements to the DOM
        if (typeof window.reObserveScrollReveals === 'function') {
            window.reObserveScrollReveals();
        }
    };

    // Initialize content load
    loadCMSContent();
});
