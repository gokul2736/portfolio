/* ==========================================================================
   MINIMALIST BENTO RESUME CORE LOGIC
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initThemeSwitcher();
    initFreelanceDrawer();
    initAiAssistant();
    initScrollReveal();
});

/* ==========================================================================
   NAVIGATION DRAWER TOGGLES & HIGHLIGHTS
   ========================================================================== */
function initNavbar() {
    const mobileToggle = document.getElementById("mobileToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section");

    // Smooth navigation links highlighting based on viewport scroll position
    window.addEventListener("scroll", () => {
        let current = "";
        const scrollPos = window.scrollY + 100; // scroll offset padding

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute("id") || "";
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });

    // Mobile Navigation Drawer Toggle
    mobileToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        mobileToggle.classList.toggle("active");
    });

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            mobileToggle.classList.remove("active");
        });
    });
}

/* ==========================================================================
   THEME MANAGER (TUGGABLE LIGHT BULB MECHANICS)
   ========================================================================== */
function initThemeSwitcher() {
    const { gsap: { registerPlugin, set, to, timeline }, MorphSVGPlugin, Draggable } = window;
    
    // Register GSAP plugins if loaded
    if (typeof MorphSVGPlugin !== "undefined") {
        registerPlugin(MorphSVGPlugin);
    }
    if (typeof Draggable !== "undefined") {
        registerPlugin(Draggable);
    }

    let startX;
    let startY;

    const AUDIO = {
        CLICK: new Audio('https://assets.codepen.io/605876/click.mp3')
    };

    const STATE = {
        ON: false
    };

    const CORD_DURATION = 0.1;
    const CORDS = document.querySelectorAll('.toggle-scene__cord');
    const HIT = document.querySelector('.toggle-scene__hit-spot');
    const DUMMY = document.querySelector('.toggle-scene__dummy-cord');
    const DUMMY_CORD = document.querySelector('.toggle-scene__dummy-cord line');
    
    if (!DUMMY_CORD) return; // safeguard if element not rendered

    const PROXY = document.createElement('div');
    const ENDX = DUMMY_CORD.getAttribute('x2');
    const ENDY = DUMMY_CORD.getAttribute('y2');

    const RESET = () => {
        set(PROXY, { x: ENDX, y: ENDY });
    };

    RESET();

    // Check localStorage initial theme preference
    const savedTheme = localStorage.getItem("markandeyan-theme") || "dark";
    if (savedTheme === "light") {
        STATE.ON = true;
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        set(document.documentElement, { '--on': 1 });
    } else {
        STATE.ON = false;
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
        set(document.documentElement, { '--on': 0 });
    }

    // GSAP Cord pulling morphing timelines
    const CORD_TL = timeline({
        paused: true,
        onStart: () => {
            STATE.ON = !STATE.ON;
            set(document.documentElement, { '--on': STATE.ON ? 1 : 0 });
            
            // Toggle body class themes
            if (STATE.ON) {
                document.body.classList.remove("dark-theme");
                document.body.classList.add("light-theme");
                localStorage.setItem("markandeyan-theme", "light");
            } else {
                document.body.classList.remove("light-theme");
                document.body.classList.add("dark-theme");
                localStorage.setItem("markandeyan-theme", "dark");
            }

            set([DUMMY, HIT], { display: 'none' });
            set(CORDS[0], { display: 'block' });
            
            // Play click audio with fallback
            try {
                AUDIO.CLICK.play();
            } catch (e) {
                console.log("Audio autoplay blocked by browser policy.");
            }
        },
        onComplete: () => {
            set([DUMMY, HIT], { display: 'block' });
            set(CORDS[0], { display: 'none' });
            RESET();
        }
    });

    // Morph the cord if MorphSVGPlugin exists
    if (typeof MorphSVGPlugin !== "undefined") {
        for (let i = 1; i < CORDS.length; i++) {
            CORD_TL.add(
                to(CORDS[0], {
                    morphSVG: CORDS[i],
                    duration: CORD_DURATION,
                    repeat: 1,
                    yoyo: true
                })
            );
        }
    }

    // Wire up Draggable handling triggers
    Draggable.create(PROXY, {
        trigger: HIT,
        type: 'x,y',
        onPress: (e) => {
            startX = e.x;
            startY = e.y;
        },
        onDrag: function () {
            set(DUMMY_CORD, {
                attr: {
                    x2: this.x,
                    y2: this.y
                }
            });
        },
        onRelease: function (e) {
            const DISTX = Math.abs(e.x - startX);
            const DISTY = Math.abs(e.y - startY);
            const TRAVELLED = Math.sqrt(DISTX * DISTX + DISTY * DISTY);
            
            to(DUMMY_CORD, {
                attr: { x2: ENDX, y2: ENDY },
                duration: CORD_DURATION,
                onComplete: () => {
                    if (TRAVELLED > 40) {
                        CORD_TL.restart();
                    } else {
                        RESET();
                    }
                }
            });
        }
    });
}

/* ==========================================================================
   FREELANCE DRAWER CONTROLLER
   ========================================================================== */
function initFreelanceDrawer() {
    const link = document.getElementById("freelanceLink");
    const overlay = document.getElementById("freelanceOverlay");
    const drawer = document.getElementById("freelanceDrawer");
    const closeBtn = document.getElementById("freelanceCloseBtn");
    const ctaBtn = document.getElementById("drawerCtaBtn");

    if (!link || !drawer) return;

    const openDrawer = (e) => {
        if (e) e.preventDefault();
        drawer.classList.add("active");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden"; // lock page scroll
    };

    const closeDrawer = () => {
        drawer.classList.remove("active");
        overlay.classList.remove("active");
        document.body.style.overflow = ""; // restore page scroll
    };

    link.addEventListener("click", openDrawer);
    closeBtn.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);
    
    // Close drawer, scroll to contact form, and focus name input
    ctaBtn.addEventListener("click", () => {
        closeDrawer();
        setTimeout(() => {
            const contactSection = document.getElementById("contact");
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                const nameInput = document.getElementById("name");
                if (nameInput) nameInput.focus();
            }
        }, 300);
    });
}

/* ==========================================================================
   AI ASSISTANT CHAT CONTROLLER
   ========================================================================== */
function initAiAssistant() {
    const container = document.getElementById("aiWidgetContainer");
    const toggleBtn = document.getElementById("aiToggleBtn");
    const closeBtn = document.getElementById("aiChatCloseBtn");
    const chatPanel = document.getElementById("aiChatPanel");
    const chatInputForm = document.getElementById("chatInputForm");
    const chatInput = document.getElementById("chatInput");
    const chatBody = document.getElementById("chatBody");
    const suggestions = document.getElementById("chatSuggestions");

    if (!toggleBtn || !chatPanel) return;

    // Toggle expand/collapse
    toggleBtn.addEventListener("click", () => {
        chatPanel.classList.toggle("active");
        if (chatPanel.classList.contains("active")) {
            chatInput.focus();
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    });

    closeBtn.addEventListener("click", () => {
        chatPanel.classList.remove("active");
    });

    // Keyword Replies Database
    const REPLIES = {
        senseflow: "SenseFlow is a phishing and social engineering detector Gokul built. Traditional signature tools fail against Business Email Compromise (BEC), so SenseFlow uses semantic analysis (with a RoBERTa model) to spot psychological triggers like urgency or authority. It includes LIME explainability and is built with PyTorch and Streamlit.",
        ecosync: "EcoSync is an agricultural time-series forecasting system. It analyzes telemetry datasets collected from multiple environmental IoT sensors on the farm and predicts future soil and crop states using TensorFlow models.",
        freelance: "Gokul does freelance projects! He builds custom AI agents and n8n automations, trains/fine-tunes ML models, codes backend REST APIs (Django/Flask), designs 3D CAD models (Autodesk Fusion 360), handles Dolby audio mixing, and integrates hardware IoT prototypes. Reach out using the form below to chat!",
        skills: "Gokul works extensively with Python. His main toolkit includes PyTorch, TensorFlow, Hugging Face, Django, Flask, n8n orchestrations, AWS cloud configurations, and Git/GitHub.",
        college: "Gokul is an AI/ML Computer Science Engineering student pursuing a Bachelor of Engineering degree.",
        aws: "He holds the AWS Certified Cloud Practitioner credential, validating his foundation in secure cloud architecture, infrastructure services, and billing practices.",
        opensource: "Gokul is a big advocate for open-source software! He loves collaborating on GitHub, sharing ML datasets, contributing to developer packages, and building community-focused agent integrations. If you'd like to work together on an open-source project, just let him know in the form below!",
        coffee: "You can support Gokul's open-source projects by <a href='https://buymeacoffee.com/gokulm2732t' target='_blank' style='color:#6366f1; text-decoration: underline; font-weight: 600;'>buying him a coffee here</a>! It is highly appreciated. ☕",
        greetings: "Hello! I'm Maya, Gokul's assistant. How can I help you today? You can ask me about his projects, skills, open-source work, or freelance options.",
        manners: "I am doing well, thank you for asking! I'm here to help you learn more about Gokul's development journey. How can I assist you?",
        aitraining: "Gokul trains and fine-tunes custom AI models, including classification networks (Hugging Face / PyTorch) and time-series forecasting algorithms (TensorFlow).",
        cad3d: "He does 3D modeling and mechanical component prototyping in Autodesk Fusion 360, designing custom enclosures for IoT microcontrollers and hardware.",
        dolby: "Gokul offers professional Dolby audio mixing, spatial sound layouts, and premium audio design for media productions.",
        typing: "Gokul is highly proficient in fast typing, holding a professional Fast Typing Certification certified by the Board of Technical Education, Andhra Pradesh.",
        about_gokul: "Gokul is an AI/ML Computer Science Engineering student specializing in building intelligent LLM workflows, time-series telemetry forecasts, neural networks, and explainable NLP models.",
        
        // Telugu Indic Translation Database (Sarvam AI Inspired Integration)
        telugu_greetings: "నమస్కారం! నేను మాయను, గోకుల్ యొక్క AI సహాయకురాలిని (Sarvam AI నమూనాల ప్రేరణతో). మీకు ఎలా సహాయపడగలను? 🇮🇳",
        telugu_manners: "నేను చాలా బాగున్నాను, అడిగినందుకు ధన్యవాదాలు! గోకుల్ గురించి మీకు ఏ సమాచారం కావాలి?",
        telugu_senseflow: "SenseFlow అనేది గోకుల్ అభివృద్ధి చేసిన NLP సాఫ్ట్‌వేర్. ఇది ఇమెయిల్‌లలోని మోసపూరిత ట్రిగ్గర్లను (urgency & authority) RoBERTa మోడల్ ద్వారా గుర్తిస్తుంది.",
        telugu_ecosync: "EcoSync అనేది వ్యవసాయ డేటా ఆధారంగా పనిచేసే టైమ్-సిరీస్ ప్రాజెక్ట్. ఇది IoT సెన్సార్ల సహాయంతో వాతావరణ మార్పులను అంచనా వేస్తుంది.",
        telugu_skills: "గోకుల్ పైథాన్ (Python), PyTorch, Django, n8n ఆటోమేషన్, మరియు AWS క్లౌడ్ టెక్నాలజీలలో నైపుణ్యం కలిగి ఉన్నారు.",
        telugu_freelance: "గోకుల్ AI మోడల్స్ శిక్షణ (AI Training), 3D క్యాడ్ డిజైన్ (Autodesk Fusion 360), డాల్బీ ఆడియో మిక్సింగ్ (Dolby Atmos), n8n ఏజెంట్ ఆటోమేషన్, మరియు వెబ్‌సైట్స్ వంటి ఫ్రీలాన్స్ ప్రాజెక్ట్‌లను చేస్తారు.",
        telugu_opensource: "గోకుల్ గిట్‌హబ్ (GitHub) మరియు ఓపెన్ సోర్స్ డెవలప్‌మెంట్‌లో భాగస్వామ్యాన్ని ఇష్టపడతారు. కలిసి పనిచేయడానికి కింద కాంటాక్ట్ ఫారమ్ ఉపయోగించండి!",
        telugu_aitraining: "గోకుల్ AI మోడల్స్ శిక్షణ మరియు ఫైన్-ట్యూనింగ్ చేస్తారు. PyTorch మరియు TensorFlow ద్వారా నమూనాలను అభివృద్ధి చేస్తారు.",
        telugu_cad3d: "ఆటోడెస్క్ ఫ్యూజన్ 360 ఉపయోగించి గోకుల్ 3D డిజైనింగ్ మరియు క్యాడ్ ప్రొటోటైపింగ్ చేస్తారు. IoT పరికరాలకు కేసింగ్‌లను తయారుచేస్తారు.",
        telugu_dolby: "డాల్బీ ఆడియో మిక్సింగ్ మరియు స్పేషియల్ సౌండ్ డిజైన్ గోకుల్ అందించే ప్రత్యేక సేవలు.",
        telugu_typing: "గోకుల్ బోర్డ్ ఆఫ్ టెక్నికల్ ఎడ్యుకేషన్, ఆంధ్రప్రదేశ్ నుండి ఫాస్ట్ టైపింగ్ సర్టిఫికేట్ పొందారు, ఇది అతని వేగం మరియు ఖచ్చితత్వాన్ని నిరూపిస్తుంది.",
        telugu_about_gokul: "గోకుల్ AI/ML కంప్యూటర్ సైన్స్ ఇంజనీరింగ్ విద్యార్థి. అతను AI ఏజెంట్లు, NLP మోడల్స్, న్యూరల్ నెట్‌వర్క్‌లు, మరియు LLM అప్లికేషన్లను తయారుచేస్తారు.",

        // Recruiter FAQ Database
        recruiter_internship: "Gokul is actively looking for AI/ML or Backend Developer internship opportunities starting immediately! He can work remotely or relocate if needed. You can download his resume from the top of the page. Feel free to drop a message in the contact form below to discuss options!",
        recruiter_resume: "You can view and download Gokul's resume directly by clicking the 'View Resume' button in the hero section at the top of the page! Let him know if you need any other credentials.",
        recruiter_graduation: "Gokul is a Computer Science undergraduate engineering student, specializing in Artificial Intelligence and Machine Learning, graduating in 2027.",
        recruiter_roles: "Gokul is primarily targeting roles such as AI/ML Developer, Python Backend Developer, and technical developer internships.",

        telugu_recruiter_internship: "గోకుల్ ప్రస్తుతం ఇంటర్న్‌షిప్ (AI/ML లేదా బ్యాకెండ్ డెవలపర్) అవకాశాల కోసం చూస్తున్నారు. అతను వెంటనే చేరడానికి సిద్ధంగా ఉన్నాడు. కింద ఉన్న కాంటాక్ట్ ఫారమ్ ఉపయోగించి అతనిని సంప్రదించవచ్చు.",
        telugu_recruiter_resume: "మీరు పేజీ పైభాగంలో ఉన్న 'View Resume' బటన్ ద్వారా గోకుల్ యొక్క రెజ్యూమెను డౌన్‌లోడ్ చేసుకోవచ్చు.",
        telugu_recruiter_graduation: "గోకుల్ కంప్యూటర్ సైన్స్ ఇంజనీరింగ్ (AI/ML) చదువుతున్నారు, అతను 2027లో గ్రాడ్యుయేట్ అవుతారు.",
        telugu_recruiter_roles: "గోకుల్ ప్రధానంగా AI/ML డెవలపర్, పైథాన్ బ్యాకెండ్ డెవలపర్, మరియు డెవలపర్ ఇంటర్న్‌షిప్స్ కోసం చూస్తున్నారు."
    };

    // Chat reply process
    window.processQuery = (queryText) => {
        // Append user bubble
        appendMsg(queryText, "user");
        chatBody.scrollTop = chatBody.scrollHeight;

        // Show typing dots
        const typingBubble = appendTypingIndicator();
        chatBody.scrollTop = chatBody.scrollHeight;

        // Formulate response
        const clean = queryText.toLowerCase().trim();
        let reply = "I'm not completely sure about that, but I'd be happy to find out! Gokul works with Python, AI agents, backend APIs, and IoT. You can reach out to him directly using the contact form at the bottom of the page.";

        // Check if query is in Telugu Script (Unicode range U+0C00 - U+0C7F) or contains common Telugu transliterations
        const isTeluguScript = /[\u0C00-\u0C7F]/.test(clean);
        const isTeluguTranslit = clean.includes("namaskaram") || clean.includes("namaskar") || clean.includes("ela unnavu") || clean.includes("ela unnav") || clean.includes("emiti") || clean.includes("telugu") || clean.includes("bagunnara") || clean.includes("savam") || clean.includes("sarvam");

        if (isTeluguScript || isTeluguTranslit) {
            // Reply in Telugu
            reply = REPLIES.telugu_greetings;
            if (clean.includes("senseflow") || clean.includes("phishing") || clean.includes("roberta") || clean.includes("bert")) {
                reply = REPLIES.telugu_senseflow;
            } else if (clean.includes("ecosync") || clean.includes("time") || clean.includes("forecast") || clean.includes("farm")) {
                reply = REPLIES.telugu_ecosync;
            } else if (clean.includes("freelance") || clean.includes("hire") || clean.includes("work") || clean.includes("panulu")) {
                reply = REPLIES.telugu_freelance;
            } else if (clean.includes("django") || clean.includes("flask") || clean.includes("api") || clean.includes("backend")) {
                reply = REPLIES.telugu_skills;
            } else if (clean.includes("pytorch") || clean.includes("tensorflow") || clean.includes("hugging") || clean.includes("transformer") || clean.includes("ai") || clean.includes("ml")) {
                reply = REPLIES.telugu_skills;
            } else if (clean.includes("skills") || clean.includes("stack") || clean.includes("python") || clean.includes("nypunyalu")) {
                reply = REPLIES.telugu_skills;
            } else if (clean.includes("typing") || clean.includes("speed") || clean.includes("andhra") || clean.includes("board")) {
                reply = REPLIES.telugu_typing;
            } else if (clean.includes("gokul") || clean.includes("markandeyan") || clean.includes("profile") || clean.includes("evaru")) {
                reply = REPLIES.telugu_about_gokul;
            } else if (clean.includes("open") || clean.includes("collab") || clean.includes("github") || clean.includes("sahakaram")) {
                reply = REPLIES.telugu_opensource;
            } else if (clean.includes("train") || clean.includes("model") || clean.includes("shikshana")) {
                reply = REPLIES.telugu_aitraining;
            } else if (clean.includes("3d") || clean.includes("cad") || clean.includes("fusion") || clean.includes("design")) {
                reply = REPLIES.telugu_cad3d;
            } else if (clean.includes("audio") || clean.includes("dolby") || clean.includes("atmos") || clean.includes("mix")) {
                reply = REPLIES.telugu_dolby;
            } else if (clean.includes("internship") || clean.includes("hiring") || clean.includes("available") || clean.includes("u ఉద్యోగం") || clean.includes("pani")) {
                reply = REPLIES.telugu_recruiter_internship;
            } else if (clean.includes("resume") || clean.includes("cv") || clean.includes("download") || clean.includes("pdf")) {
                reply = REPLIES.telugu_recruiter_resume;
            } else if (clean.includes("graduation") || clean.includes("graduating") || clean.includes("year") || clean.includes("college")) {
                reply = REPLIES.telugu_recruiter_graduation;
            } else if (clean.includes("roles") || clean.includes("position") || clean.includes("job") || clean.includes("career")) {
                reply = REPLIES.telugu_recruiter_roles;
            } else if (clean.includes("ela unnavu") || clean.includes("ela unnav") || clean.includes("bagunnara") || clean.includes("బాగున్నా")) {
                reply = REPLIES.telugu_manners;
            }
        } else {
            // Standard English Replies
            if (clean.includes("senseflow") || clean.includes("phishing") || clean.includes("bert") || clean.includes("roberta")) {
                reply = REPLIES.senseflow;
            } else if (clean.includes("ecosync") || clean.includes("time") || clean.includes("forecast") || clean.includes("farm")) {
                reply = REPLIES.ecosync;
            } else if (clean.includes("freelance") || clean.includes("hire") || clean.includes("work") || clean.includes("consult")) {
                reply = REPLIES.freelance;
            } else if (clean.includes("django") || clean.includes("flask") || clean.includes("api") || clean.includes("backend")) {
                reply = REPLIES.skills;
            } else if (clean.includes("pytorch") || clean.includes("tensorflow") || clean.includes("hugging") || clean.includes("transformer") || clean.includes("ai") || clean.includes("ml")) {
                reply = REPLIES.skills;
            } else if (clean.includes("skills") || clean.includes("stack") || clean.includes("languages") || clean.includes("python")) {
                reply = REPLIES.skills;
            } else if (clean.includes("typing") || clean.includes("speed") || clean.includes("andhra") || clean.includes("board")) {
                reply = REPLIES.typing;
            } else if (clean.includes("college") || clean.includes("education") || clean.includes("student")) {
                reply = REPLIES.college;
            } else if (clean.includes("gokul") || clean.includes("markandeyan") || clean.includes("profile") || clean.includes("who is")) {
                reply = REPLIES.about_gokul;
            } else if (clean.includes("aws") || clean.includes("cloud") || clean.includes("cert")) {
                reply = REPLIES.aws;
            } else if (clean.includes("open source") || clean.includes("collab") || clean.includes("contribute") || clean.includes("github")) {
                reply = REPLIES.opensource;
            } else if (clean.includes("coffee") || clean.includes("support") || clean.includes("buy") || clean.includes("donate")) {
                reply = REPLIES.coffee;
            } else if (clean.includes("train") || clean.includes("model") || clean.includes("fine-tune") || clean.includes("network")) {
                reply = REPLIES.aitraining;
            } else if (clean.includes("3d") || clean.includes("cad") || clean.includes("design") || clean.includes("fusion")) {
                reply = REPLIES.cad3d;
            } else if (clean.includes("audio") || clean.includes("dolby") || clean.includes("atmos") || clean.includes("mix")) {
                reply = REPLIES.dolby;
            } else if (clean.includes("internship") || clean.includes("hiring") || clean.includes("available") || clean.includes("hire") || clean.includes("availability")) {
                reply = REPLIES.recruiter_internship;
            } else if (clean.includes("resume") || clean.includes("cv") || clean.includes("download") || clean.includes("pdf")) {
                reply = REPLIES.recruiter_resume;
            } else if (clean.includes("graduation") || clean.includes("graduating") || clean.includes("year")) {
                reply = REPLIES.recruiter_graduation;
            } else if (clean.includes("roles") || clean.includes("position") || clean.includes("job") || clean.includes("career") || clean.includes("hiring for")) {
                reply = REPLIES.recruiter_roles;
            } else if (clean.includes("hello") || clean.includes("hi") || clean.includes("hey") || clean.includes("greetings")) {
                reply = REPLIES.greetings;
            } else if (clean.includes("how are you") || clean.includes("how is it going") || clean.includes("who are you") || clean.includes("maya")) {
                reply = REPLIES.manners;
            }
        }

        // Display reply after delay
        setTimeout(() => {
            typingBubble.remove();
            appendMsg(reply, "assistant");
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000);
    };

    // Message helpers
    function appendMsg(text, sender) {
        const bubble = document.createElement("div");
        bubble.className = `chat-msg msg-${sender}`;
        bubble.innerHTML = text;
        chatBody.appendChild(bubble);
        return bubble;
    }

    function appendTypingIndicator() {
        const bubble = document.createElement("div");
        bubble.className = "chat-msg msg-assistant";
        bubble.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatBody.appendChild(bubble);
        return bubble;
    }

    // Hook suggestions buttons
    suggestions.addEventListener("click", (e) => {
        const button = e.target.closest(".suggestion-pill");
        if (!button) return;
        const query = button.dataset.query;
        if (query) {
            let userPrompt = button.innerText;
            window.processQuery(userPrompt);
        }
    });
}

// Global scope hook for input form
window.handleChatSubmit = (event) => {
    event.preventDefault();
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (text) {
        window.processQuery(text);
        input.value = "";
    }
};

/* ==========================================================================
   MINIMALIST CONTACT FORM SUBMISSION HOOK
   ========================================================================== */
function submitForm(event) {
    event.preventDefault();
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
    const submitBtn = document.getElementById("submitBtn");

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending...`;

    // TO ENABLE LIVE EMAIL SUBMISSIONS:
    // 1. Go to https://web3forms.com and request a free Access Key.
    // 2. Put both of your emails (gokulm2732006@gmail.com and gokulm27.dev@gmail.com) in your Web3Forms settings.
    // 3. Enable Web3Forms "Auto-Responder" and add your digital signature message.
    // 4. Paste your Web3Forms Access Key inside the quotes below:
    const accessKey = "c2ff0468-78f7-4f4c-9681-675e924f774c";

    // Demo/mock fallback if key is not configured
    if (accessKey === "YOUR_WEB3FORMS_ACCESS_KEY_HERE") {
        setTimeout(() => {
            alert(`[Demo Mode] Message logged successfully!\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}\n\nTo make this live and route emails to gokulm2732006@gmail.com & gokulm27.dev@gmail.com, configure your Web3Forms Access Key in script.js.`);
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Send Message <i class="fa-solid fa-arrow-right"></i>`;
            document.getElementById("contactForm").reset();
        }, 1200);
        return;
    }

    const formData = {
        access_key: accessKey,
        name: name,
        email: email,
        message: message,
        subject: "New Portfolio Submission from " + name,
        from_name: "Markandeyan Gokul Portfolio",
        replyto: email
    };

    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
            alert(`Thank you, ${name}!\nYour message has been sent successfully.\n\nAn auto-reply has been triggered to your email (${email}).`);
            document.getElementById("contactForm").reset();
        } else {
            console.log(response);
            alert("Oops! Something went wrong: " + json.message);
        }
    })
    .catch((error) => {
        console.log(error);
        alert("Oops! An error occurred while sending your message.");
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Send Message <i class="fa-solid fa-arrow-right"></i>`;
    });
}

/* ==========================================================================
   STAGGERED SCROLL ENTRANCE REVEALS
   ========================================================================== */
function initScrollReveal() {
    const cards = document.querySelectorAll(".bento-card");
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    cards.forEach(card => observer.observe(card));
}
