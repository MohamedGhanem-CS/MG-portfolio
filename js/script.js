/* ==========================================================================
   DEVELOPER PORTFOLIO - JAVASCRIPT SYSTEM
   Author: Mohamed Ghanem (AI Engineer & CS Student)
   Description: Seamless transitions, high-performance canvas systems, 
                typing interfaces, and interactive 3D-tilt effects.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Set dynamic footer year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ==========================================
    // 1. THEME MANAGER (DARK/LIGHT TOGGLE)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Dark mode is the permanent default.
    // Light mode only activates if the user explicitly switched to it before.
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
        htmlElement.classList.add('light-mode');
    } else {
        // Force remove light-mode to guarantee dark mode on first visit
        htmlElement.classList.remove('light-mode');
    }

    themeToggleBtn.addEventListener('click', () => {
        const isLight = htmlElement.classList.toggle('light-mode');
        localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
        
        // Dynamic reload particle configuration if canvas exists
        if (typeof window.updateCanvasTheme === 'function') {
            window.updateCanvasTheme(isLight);
        }
    });

    // ==========================================
    // 2. MOBILE MENU HAMBURGER CONTROLLER
    // ==========================================
    const hamburgerBtn = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link-item');

    const toggleMobileMenu = () => {
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    };

    const closeMobileMenu = () => {
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('active');
    };

    hamburgerBtn.addEventListener('click', toggleMobileMenu);
    navLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // ==========================================
    // 3. COLLAPSIBLE/SCROLLED NAVBAR AESTHETIC
    // ==========================================
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ==========================================
    // 4. ACTIVE SECTION OBSERVER (NAV INDICATORS)
    // ==========================================
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link-item');

    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies the mid-window core
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${activeId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // ==========================================
    // 5. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Reveal slightly before entering viewport
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Unobserve once revealed to maintain system cycles
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // Expose global observer register function to support dynamic CMS-loaded content
    window.reObserveScrollReveals = () => {
        const dynamicElements = document.querySelectorAll('.reveal-on-scroll:not(.revealed)');
        dynamicElements.forEach(el => revealObserver.observe(el));
    };

    // ==========================================
    // 6. HERO SUBTITLE AUTO-TYPING INTERFACE
    // ==========================================
    const subtitleEl = document.getElementById('typed-subtitle');
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    // Live getter: always returns the latest roles, supporting CMS dynamic injection
    const getRoles = () => window.portfolioRoles || [
        "Computer Science Student",
        "Aspiring AI Engineer",
        "LLMs & Prompt Engineer",
        "Python & C# Developer"
    ];

    const handleTyping = () => {
        // Always read the latest roles (supports CMS dynamic injection after page load)
        const roles = getRoles();
        const currentRole = roles[roleIndex % roles.length];
        
        if (isDeleting) {
            subtitleEl.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40; // Backspace faster
        } else {
            subtitleEl.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Type normally
        }

        if (!isDeleting && charIndex === currentRole.length) {
            // Pause at complete word
            isDeleting = true;
            typingSpeed = 2000; 
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500; // Wait before writing next word
        }

        setTimeout(handleTyping, typingSpeed);
    };

    // Trigger typing loop — delayed slightly to allow cms-loader.js to inject roles first
    setTimeout(handleTyping, 1200);

    // ==========================================
    // 7. HERO DASHBOARD MOUSE TILT (3D GLASS EFFECT)
    // ==========================================
    const dashboard = document.getElementById('interactive-dashboard');
    if (dashboard) {
        const container = dashboard.parentElement;
        
        container.addEventListener('mousemove', (e) => {
            const rect = dashboard.getBoundingClientRect();
            
            // Calculate cursor coordinates relative to dashboard center (normalized -1 to 1)
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const tiltX = (y / (rect.height / 2)) * -10; // Max 10 degrees tilt
            const tiltY = (x / (rect.width / 2)) * 10;
            
            dashboard.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
            dashboard.style.boxShadow = `${-tiltY * 1.5}px ${tiltX * 1.5}px 35px rgba(99, 102, 241, 0.25)`;
        });

        container.addEventListener('mouseleave', () => {
            dashboard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            dashboard.style.boxShadow = 'var(--shadow-premium)';
        });
    }

    // ==========================================
    // 8. TECHNICAL CORE TABS CONTROLLER
    // ==========================================
    const tabBtns = document.querySelectorAll('.skill-tab-btn');
    const panels = document.querySelectorAll('.skills-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Deactivate all buttons and panels
            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Activate current
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // ==========================================
    // 9. HIGH-PERFORMANCE NEURAL CANVAS
    // ==========================================
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let mouse = { x: null, y: null, radius: 140 };

        // Handle mouse tracking
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Theme-sensitive colors
        let particleColor = 'rgba(99, 102, 241, 0.45)'; // Indigo
        let secondaryColor = 'rgba(6, 182, 212, 0.4)';  // Cyan
        let lineColor = 'rgba(99, 102, 241, 0.08)';

        window.updateCanvasTheme = (isLightMode) => {
            if (isLightMode) {
                particleColor = 'rgba(79, 70, 229, 0.25)'; // Softer Indigo
                secondaryColor = 'rgba(8, 145, 178, 0.25)';  // Softer Cyan
                lineColor = 'rgba(79, 70, 229, 0.05)';
            } else {
                particleColor = 'rgba(99, 102, 241, 0.45)';
                secondaryColor = 'rgba(6, 182, 212, 0.4)';
                lineColor = 'rgba(99, 102, 241, 0.08)';
            }
        };

        // Initialize theme options
        window.updateCanvasTheme(htmlElement.classList.contains('light-mode'));

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2.5 + 1.2;
                this.speedX = Math.random() * 0.8 - 0.4;
                this.speedY = Math.random() * 0.8 - 0.4;
                this.density = (Math.random() * 20) + 10;
                this.isAlt = Math.random() > 0.6; // Mix secondary color nodes
            }

            update() {
                // Border collision
                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

                // Mouse interaction (repulsion)
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        let forceDirectionX = dx / distance;
                        let forceDirectionY = dy / distance;
                        let maxDistance = mouse.radius;
                        let force = (maxDistance - distance) / maxDistance;
                        let directionX = forceDirectionX * force * this.density * 0.4;
                        let directionY = forceDirectionY * force * this.density * 0.4;

                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }

                // Regular movement
                this.x += this.speedX;
                this.y += this.speedY;
            }

            draw() {
                ctx.fillStyle = this.isAlt ? secondaryColor : particleColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initCanvas = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            // Adjust particle density based on screen dimensions
            particles = [];
            const numParticles = Math.floor((canvas.width * canvas.height) / 11000);
            const cappedNum = Math.min(Math.max(numParticles, 35), 110); // Clamp between 35 and 110 for smooth render
            
            for (let i = 0; i < cappedNum; i++) {
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                particles.push(new Particle(x, y));
            }
        };

        const drawLines = () => {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 110) {
                        // Compute opacity based on proximity (closer = more opaque)
                        const proximity = 1 - (distance / 110);
                        const alpha = proximity * (htmlElement.classList.contains('light-mode') ? 0.06 : 0.12);
                        const baseRGB = htmlElement.classList.contains('light-mode') ? '79, 70, 229' : '99, 102, 241';
                        ctx.strokeStyle = `rgba(${baseRGB}, ${alpha.toFixed(3)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animateCanvas = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            drawLines();
            animationFrameId = requestAnimationFrame(animateCanvas);
        };

        initCanvas();
        animateCanvas();

        // Optimized resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                cancelAnimationFrame(animationFrameId);
                initCanvas();
                animateCanvas();
            }, 250);
        });
    }

    // ==========================================
    // 10. INTERACTIVE FORM MOCK DISPATCHER
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const formSuccessPopup = document.getElementById('form-success');
    const submitBtn = document.getElementById('btn-submit');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Visual submit state loading lock
            submitBtn.style.pointerEvents = 'none';
            submitBtn.style.opacity = '0.75';
            submitBtn.innerHTML = `
                Sending...
                <svg class="rotate" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.78" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
            `;

            const formData = new FormData(contactForm);
            
            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.status === 200 || result.success) {
                    // Clear fields
                    contactForm.reset();

                    // Revert submit button styling
                    submitBtn.style.pointerEvents = 'auto';
                    submitBtn.style.opacity = '1';
                    submitBtn.innerHTML = `
                        Message Sent
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    `;

                    // Display custom success alert
                    formSuccessPopup.style.display = 'block';
                    formSuccessPopup.textContent = "Success! Your message was sent to Mohamed's Gmail.";
                    formSuccessPopup.style.background = "rgba(16, 185, 129, 0.15)";
                    formSuccessPopup.style.borderColor = "rgba(16, 185, 129, 0.3)";
                } else {
                    throw new Error(result.message || "Failed to send");
                }
            } catch (error) {
                console.error("Error sending form:", error);
                
                // Show error state on button
                submitBtn.style.pointerEvents = 'auto';
                submitBtn.style.opacity = '1';
                submitBtn.innerHTML = `
                    Failed to Send
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                `;
                
                // Success popup used as message error alert
                formSuccessPopup.style.display = 'block';
                formSuccessPopup.textContent = "Please set a valid Web3Forms Access Key in index.html to receive emails!";
                formSuccessPopup.style.background = "rgba(239, 68, 68, 0.15)";
                formSuccessPopup.style.borderColor = "rgba(239, 68, 68, 0.3)";
            }

            // Automatically fade out message banner and restore button text after 6s
            setTimeout(() => {
                formSuccessPopup.style.display = 'none';
                submitBtn.innerHTML = `
                    Send Message
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                `;
            }, 6000);
        });
    }

    // ==========================================
    // 11. AI AGENT PORTFOLIO ASSISTANT CHAT LOGIC
    // ==========================================
    const widget = document.getElementById('ai-chat-widget');
    const toggle = document.getElementById('ai-chat-toggle');
    const closeBtn = document.getElementById('ai-chat-close');
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');
    const messagesContainer = document.getElementById('ai-chat-messages');

    if (widget && toggle && closeBtn && input && sendBtn && messagesContainer) {
        
        // Show/Hide Toggle
        toggle.addEventListener('click', () => {
            widget.classList.toggle('active');
            if (widget.classList.contains('active')) {
                input.focus();
                // Add minor pulsing toggle glow stop
                const pulse = toggle.querySelector('.pulse-ring');
                if (pulse) pulse.style.animation = 'none';
            }
        });

        closeBtn.addEventListener('click', () => {
            widget.classList.remove('active');
        });

        // Chat Context memory block
        const systemPrompt = `You are MG AI Assistant (Mohamed Ghanem's AI Assistant). You speak on behalf of Mohamed Ghanem to portfolio visitors. Keep your responses concise (under 3 sentences), highly engaging, friendly, and professional. 
Here are the facts about Mohamed:
- Name: Mohamed Ghanem
- Title: AI Engineer & Computer Science Student at El Shorouk Academy.
- Bio: Passionate CS student dedicated to Machine Learning, Large Language Models (LLMs), and prompt engineering. He doesn't just use AI; he aims to understand their core mechanisms and develop smart, practical applications.
- Skills: Python, Machine Learning, Deep Learning, LLM APIs, Prompt Engineering, C#, C, HTML, CSS, JavaScript, SQL.
- Projects:
  1. PromptCraft Studio: An interactive prompt playground and library.
  2. NeuralForge Simulator: A web-based visualizer for Neural Networks.
  3. LocalAgent Assistant: A local LLM agent manager powered by Ollama.
  4. PyStream Analytics: Real-time high-throughput Python streaming engine.
- Experience:
  1. Lead Academic Developer at El Shorouk Academy (designing project registration system, tutoring peers).
  2. Open-source contributor.
- Social Links:
  - LinkedIn: https://linkedin.com/in/mohamed-ghanem-cs
  - GitHub: https://github.com/MohamedGhanem-CS
  - Email: mohamed.ghanem.work@gmail.com
- Website Function/Purpose: This website is Mohamed Ghanem's premium single-page developer portfolio. It exists to showcase his skills as an AI Engineer, highlight his custom machine learning projects, share his academic leadership at El Shorouk Academy, and let recruiters, professors, or collaborators connect and build AI systems with him.
Only talk about Mohamed and this portfolio. If asked about unrelated things, politely steer the conversation back to Mohamed's portfolio, background, or how to contact him. Never invent details.`;

        const conversationHistory = [
            { role: "system", content: systemPrompt }
        ];

        // Scroll to bottom
        const scrollToBottom = () => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };

        // Render message to UI
        const appendMessage = (text, isOutgoing) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `ai-message ${isOutgoing ? 'outgoing' : 'incoming'}`;
            msgDiv.textContent = text;
            messagesContainer.appendChild(msgDiv);
            scrollToBottom();
        };

        // Render typing indicator
        let typingIndicator = null;
        const showTypingIndicator = () => {
            if (typingIndicator && messagesContainer.contains(typingIndicator)) return;
            
            if (typingIndicator) {
                try {
                    messagesContainer.removeChild(typingIndicator);
                } catch (e) {}
            }
            
            typingIndicator = document.createElement('div');
            typingIndicator.className = 'ai-typing-indicator';
            typingIndicator.innerHTML = `
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
            `;
            messagesContainer.appendChild(typingIndicator);
            scrollToBottom();
        };

        const removeTypingIndicator = () => {
            if (typingIndicator && messagesContainer.contains(typingIndicator)) {
                try {
                    messagesContainer.removeChild(typingIndicator);
                } catch (e) {
                    console.error("Error removing typing indicator:", e);
                }
                typingIndicator = null;
            }
        };

        // Local intelligent fallback response engine (handles CORS / offline / protocol restrictions)
        const triggerLocalResponse = (query) => {
            const q = query.toLowerCase();
            let responseText = "";

            if (q.includes("project") || q.includes("promptcraft") || q.includes("neuralforge") || q.includes("localagent") || q.includes("pystream")) {
                responseText = "Mohamed has engineered several custom AI projects! 1) PromptCraft Studio (an interactive prompt engineering playground), 2) NeuralForge Simulator (a beautiful visualizer for neural networks), 3) LocalAgent Assistant (powered by Ollama), and 4) PyStream Analytics (high-throughput Python streaming). Which of these would you like to explore?";
            } else if (q.includes("website") || q.includes("site") || q.includes("page") || q.includes("purpose") || q.includes("وظيفة") || q.includes("موقع") || q.includes("الموقع")) {
                responseText = "This website is Mohamed Ghanem's premium, custom-designed developer portfolio. Its purpose is to showcase his skills as an AI Engineer, highlight his advanced machine learning projects (like me!), timeline his academic achievements, and let you connect with him directly to collaborate!";
            } else if (q.includes("skill") || q.includes("program") || q.includes("python") || q.includes("c#") || q.includes("language") || q.includes("tech") || q.includes("code")) {
                responseText = "Mohamed's technical stack is highly specialized in AI: Python, C#, C, Machine Learning, Deep Learning (PyTorch/TensorFlow), LLMs, Prompt Engineering, SQL, and Web Technologies. He focuses heavily on LLM mechanisms!";
            } else if (q.includes("experience") || q.includes("academy") || q.includes("work") || q.includes("job") || q.includes("shorouk")) {
                responseText = "Mohamed has valuable leadership experience as the Lead Academic Developer at El Shorouk Academy, where he engineered direct student platforms. He is also a self-directed open-source contributor and ML researcher.";
            } else if (q.includes("contact") || q.includes("email") || q.includes("hire") || q.includes("reach") || q.includes("linkedin") || q.includes("github")) {
                responseText = "You can reach Mohamed directly via email at mohamed.ghanem.work@gmail.com. You can also inspect his code on GitHub (MohamedGhanem-CS) or connect on LinkedIn (mohamed-ghanem-cs)!";
            } else if (q.includes("who are you") || q.includes("about") || q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("introduce") || q.includes("help")) {
                responseText = "Hello! I am Mohamed's AI Assistant. Mohamed is an ambitious AI Engineer and Computer Science Student at El Shorouk Academy. I can guide you through his skills, custom projects, or help you contact him!";
            } else {
                responseText = "I'm specialized in explaining Mohamed Ghanem's background, skills, and AI engineering projects. For deep technical discussions or project collaboration, feel free to reach out to him directly at mohamed.ghanem.work@gmail.com!";
            }

            appendMessage(responseText, false);
            conversationHistory.push({ role: "assistant", content: responseText });
        };

        // Handle sending messages
        const handleSendMessage = async () => {
            const query = input.value.trim();
            if (!query) return;

            // Clear Input
            input.value = '';
            
            // Append User message
            appendMessage(query, true);
            conversationHistory.push({ role: "user", content: query });

            // Display typing indicator
            showTypingIndicator();

            try {
                // ✅ SECURE: Calls our Netlify Function proxy — API key lives on the server, never in the browser.
                // The proxy endpoint is created at: /netlify/functions/chat.js
                // Environment variable GROQ_API_KEY must be set in: Netlify Dashboard → Site Config → Env Vars
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: conversationHistory })
                });

                const data = await response.json();
                removeTypingIndicator();

                if (response.ok && data.reply) {
                    appendMessage(data.reply, false);
                    conversationHistory.push({ role: "assistant", content: data.reply });
                } else {
                    // If proxy returns an error, fall back to local response engine
                    console.warn("Proxy returned non-OK response, using local fallback:", data);
                    triggerLocalResponse(query);
                }

            } catch (err) {
                console.warn("Network issue or proxy unreachable. Launching local fallback...", err);
                // Graceful fallback simulation
                setTimeout(() => {
                    removeTypingIndicator();
                    triggerLocalResponse(query);
                }, 600);
            }
        };

        // Event triggers
        sendBtn.addEventListener('click', handleSendMessage);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });

        // Quick Suggestion Chips
        const chipsContainer = document.getElementById('ai-chips');
        if (chipsContainer) {
            const chips = chipsContainer.querySelectorAll('.ai-chip');
            chips.forEach(chip => {
                chip.addEventListener('click', () => {
                    const query = chip.getAttribute('data-query');
                    input.value = query;
                    // Hide chips after first use
                    chipsContainer.classList.add('hidden');
                    handleSendMessage();
                });
            });
        }
    }

});
