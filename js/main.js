/**
 * ============================================================================
 * MAIN APPLICATION LOGIC - ASMUDIN PORTFOLIO
 * Features:
 * - Custom Cursor Tracking & Lerping
 * - Dynamic Role Typing Animation (Asmudin: CodeIgniter, MySQL, HTML, CSS, JS, SI)
 * - 3D Card Tilt with Specular Parallax
 * - Theme Switcher & 3D Synchronization
 * - Audio FX Integrations
 * - Interactive 3D Lab Controls
 * - Skills Filter & Metrics Counter
 * - Detailed Project Case Study Modal (Sistem Informasi & Web)
 * - Form Validation & Toast System
 * ============================================================================
 */

(function () {
  'use strict';

  // --- 1. CUSTOM CURSOR TRACKING ---
  function initCustomCursor() {
    const dot = document.getElementById('cursorDot');
    const outline = document.getElementById('cursorOutline');
    if (!dot || !outline) return;

    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Smooth lerp for outer cursor ring
    function renderCursor() {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;
      outline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Interactive element hover states
    const interactiveSelectors = 'a, button, input, select, textarea, .card-tilt, .theme-option';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        outline.classList.add('cursor-hover');
        if (window.AudioFX) window.AudioFX.hover();
      });
      el.addEventListener('mouseleave', () => {
        outline.classList.remove('cursor-hover');
      });
      el.addEventListener('click', () => {
        if (window.AudioFX) window.AudioFX.click();
      });
    });
  }

  // --- 2. DYNAMIC TYPING EFFECT (ASMUDIN) ---
  function initTypingEffect() {
    const textEl = document.getElementById('typingText');
    if (!textEl) return;

    const roles = [
      'Web Developer & Spesialis Sistem Informasi',
      'Pengembang CodeIgniter & MySQL',
      'Frontend HTML5, CSS3 & JavaScript',
      'Arsitek Basis Data & Sistem Terintegrasi',
      'Interactive 3D Web Creator'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function type() {
      const currentText = roles[roleIndex];

      if (isDeleting) {
        textEl.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 45;
      } else {
        textEl.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 85;
      }

      if (!isDeleting && charIndex === currentText.length) {
        typingSpeed = 2200; // Pause at end of text
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 350; // Pause before new word
      }

      setTimeout(type, typingSpeed);
    }

    type();
  }

  // --- 3. METRICS NUMBER COUNTER ---
  function initMetricsCounter() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = +counter.getAttribute('data-target');
          let current = 0;
          const stepTime = Math.max(15, Math.floor(1800 / target));

          const timer = setInterval(() => {
            current += 1;
            counter.textContent = current;
            if (current >= target) {
              counter.textContent = target;
              clearInterval(timer);
            }
          }, stepTime);

          obs.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  // --- 4. 3D CARD TILT EFFECT ---
  function initCardTilt() {
    const cards = document.querySelectorAll('.card-tilt');
    if (!cards.length) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = -((y - centerY) / centerY) * 10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // --- 5. THEME ACCENT SWITCHER ---
  function initThemeSwitcher() {
    const themeBtn = document.getElementById('themeBtn');
    const themeDropdown = document.querySelector('.theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');

    // Load saved theme
    const savedTheme = localStorage.getItem('portfolio_theme') || 'violet';
    applyTheme(savedTheme);

    if (themeBtn && themeDropdown) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle('open');
      });

      window.addEventListener('click', () => {
        themeDropdown.classList.remove('open');
      });
    }

    themeOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const themeColor = opt.getAttribute('data-color');
        applyTheme(themeColor);
        if (themeDropdown) themeDropdown.classList.remove('open');
      });
    });

    function applyTheme(themeName) {
      document.body.setAttribute('data-theme', themeName);
      localStorage.setItem('portfolio_theme', themeName);

      // Update Active class
      themeOptions.forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-color') === themeName);
      });

      // Synchronize with Three.js 3D Engine
      if (window.ThreeApp && typeof window.ThreeApp.setTheme === 'function') {
        window.ThreeApp.setTheme(themeName);
      }
    }
  }

  // --- 6. AUDIO FX TOGGLE ---
  function initAudioToggle() {
    const audioBtn = document.getElementById('audioToggle');
    const audioIcon = document.getElementById('audioIcon');
    if (!audioBtn || !audioIcon || !window.AudioFX) return;

    function updateAudioIcon() {
      const isMuted = window.AudioFX.isMuted();
      if (isMuted) {
        audioIcon.className = 'fa-solid fa-volume-xmark';
        audioBtn.classList.add('muted');
        audioBtn.setAttribute('title', 'Suara: Nonaktif (Klik untuk mengaktifkan)');
      } else {
        audioIcon.className = 'fa-solid fa-volume-high';
        audioBtn.classList.remove('muted');
        audioBtn.setAttribute('title', 'Suara: Aktif (Klik untuk mute)');
      }
    }

    updateAudioIcon();

    audioBtn.addEventListener('click', () => {
      const muted = window.AudioFX.toggleMute();
      updateAudioIcon();
      showToast(muted ? 'Efek audio dimatikan' : 'Efek audio diaktifkan');
    });
  }

  // --- 7. SKILL CATEGORY FILTER ---
  function initSkillsFilter() {
    const tabs = document.querySelectorAll('.skill-tab-btn');
    const cards = document.querySelectorAll('.skill-card');
    if (!tabs.length || !cards.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.getAttribute('data-filter');

        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --- 8. 3D LAB INTERACTIVE CONTROLS ---
  function init3DLabControls() {
    if (!window.ThreeApp) return;

    // Shape Switcher
    const shapeBtns = document.querySelectorAll('.lab-btn[data-shape]');
    shapeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        shapeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const shape = btn.getAttribute('data-shape');
        window.ThreeApp.setShape(shape);
        if (window.AudioFX) window.AudioFX.morph();
        showToast(`Geometri 3D diubah ke: ${shape.toUpperCase()}`);
      });
    });

    // Wireframe Toggle
    const btnWireframe = document.getElementById('btnToggleWireframe');
    if (btnWireframe) {
      btnWireframe.addEventListener('click', () => {
        const isWire = window.ThreeApp.toggleWireframe();
        btnWireframe.classList.toggle('active', isWire);
        btnWireframe.textContent = `Wireframe: ${isWire ? 'ON' : 'OFF'}`;
      });
    }

    // Rings Toggle
    const btnRings = document.getElementById('btnToggleOrbitRings');
    if (btnRings) {
      btnRings.addEventListener('click', () => {
        const isRings = window.ThreeApp.toggleRings();
        btnRings.classList.toggle('active', isRings);
        btnRings.textContent = `Orbit Rings: ${isRings ? 'ON' : 'OFF'}`;
      });
    }

    // Particles Toggle
    const btnParticles = document.getElementById('btnToggleParticles');
    if (btnParticles) {
      btnParticles.addEventListener('click', () => {
        const isParts = window.ThreeApp.toggleParticles();
        btnParticles.classList.toggle('active', isParts);
        btnParticles.textContent = `Starfield: ${isParts ? 'ON' : 'OFF'}`;
      });
    }

    // Rotation Speed Slider
    const speedRange = document.getElementById('speedRange');
    const speedVal = document.getElementById('speedVal');
    if (speedRange && speedVal) {
      speedRange.addEventListener('input', (e) => {
        const val = e.target.value;
        speedVal.textContent = `${parseFloat(val).toFixed(1)}x`;
        window.ThreeApp.setSpeed(val);
      });
    }

    // Particle Density Slider
    const particleRange = document.getElementById('particleRange');
    const particleVal = document.getElementById('particleVal');
    if (particleRange && particleVal) {
      particleRange.addEventListener('input', (e) => {
        const count = e.target.value;
        particleVal.textContent = count;
        window.ThreeApp.setParticleCount(count);
      });
    }

    // Reset Camera
    const btnReset = document.getElementById('btnReset3D');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        window.ThreeApp.resetCamera();
        showToast('Kamera 3D dikembalikan ke posisi awal');
      });
    }
  }

  // --- 9. CASE STUDY MODAL (ASMUDIN'S SISTEM INFORMASI & WEB) ---
  const caseStudies = [
    {
      title: "SIM-Aset 3D: Sistem Manajemen Inventaris Enterprise",
      category: "Sistem Informasi Manajemen & Visualisasi 3D",
      client: "Instansi Pemerintahan & Korporasi",
      timeline: "3 Bulan Pengerjaan",
      overview: "Sistem Informasi Manajemen Inventaris & Aset dirancang untuk mengatasi kompleksitas pencatatan ratusan aset kantor di multi-ruangan. Dilengkapi pemodelan 3D denah ruangan interaktif Three.js, pengguna dapat melihat posisi fisik aset, status kelayakan, mutasi barang antar divisi, dan mencetak stiker barcode QR secara terintegrasi.",
      challenge: "Memastikan sinkronisasi data relasional MySQL antara data inventaris, log perpindahan barang, dan posisi objek 3D di ruangan secara akurat tanpa menurunkan kecepatan aplikasi.",
      solution: "Mengembangkan backend MVC CodeIgniter 4 dengan relasi database Foreign Key yang ketat, indexing kolom pencarian, API JSON untuk visualisasi canvas 3D WebGL, serta optimasi query join kompleks.",
      metrics: [
        { label: "Waktu Pencarian Aset", value: "< 0.3 Detik" },
        { label: "Efisiensi Inventarisasi", value: "85% Lebih Cepat" },
        { label: "Akurasi Data Fisik", value: "99.9% Presisi" }
      ],
      stack: ["CodeIgniter 4", "MySQL", "Three.js 3D", "Bootstrap 5", "JavaScript AJAX", "QR Code Engine"],
      liveUrl: "#projects",
      githubUrl: "https://github.com"
    },
    {
      title: "SIP-Desa: Sistem Pelayanan Kependudukan Terpadu",
      category: "Sistem Informasi Pelayanan Publik & Arsip Digital",
      client: "Pemerintah Desa & Komunitas Warga",
      timeline: "2.5 Bulan Pengerjaan",
      overview: "Aplikasi pelayanan administrasi terpadu untuk mendigitalkan proses kependudukan, mulai dari permohonan surat keterangan domisili, surat pengantar nikah, kartu keluarga, hingga arsip digital warga yang aman dan cepat.",
      challenge: "Proses pembuatan surat manual sebelumnya memakan waktu berhari-hari dan sering terjadi duplikasi Nomor Induk Kependudukan (NIK) serta kesulitan pencarian berkas lama.",
      solution: "Merancang database MySQL dengan constraint unik pada NIK, implementasi AJAX DataTables untuk pencarian data instan ribuan warga, serta automasi pencetakan surat berkop dinas resmi via library DomPDF.",
      metrics: [
        { label: "Proses Pembuatan Surat", value: "< 2 Menit" },
        { label: "Arsip Terdigitalisasi", value: "10.000+ Warga" },
        { label: "Kepuasan Layanan", value: "98% Positif" }
      ],
      stack: ["CodeIgniter (PHP)", "MySQL Database", "JavaScript AJAX", "HTML5 & CSS3", "DomPDF", "DataTables"],
      liveUrl: "#projects",
      githubUrl: "https://github.com"
    },
    {
      title: "SIAKAD: Portal Akademik & Penilaian Terpadu",
      category: "Sistem Informasi Akademik & E-Learning Portal",
      client: "Institusi Pendidikan & Kampus",
      timeline: "4 Bulan Pengerjaan",
      overview: "Sistem informasi akademik terpadu yang memfasilitasi kebutuhan administrasi dosen, mahasiswa, dan staf akademik. Menyediakan modul pengisian Kartu Rencana Studi (KRS), absensi pertemuan, rekap nilai mutu otomatis, grafik IPK per semester, dan jadwal perkuliahan.",
      challenge: "Trafik lonjakan bersamaan saat masa pengisian KRS dan perhitungan otomatis transkrip nilai kumulatif dengan pembobotan SKS yang sangat kompleks.",
      solution: "Normalisasi database tingkat 3NF di MySQL, query transaction ACID untuk pencegahan bentrok kuota kelas saat KRS bersamaan, dan dashboard grafik statistik akademik menggunakan Chart.js.",
      metrics: [
        { label: "Kapasitas Concurrency", value: "1.000+ User/Menit" },
        { label: "Otomasi Transkrip", value: "100% Bebas Galat" },
        { label: "Multi-Level Auth", value: "Admin, Dosen, Mhs" }
      ],
      stack: ["PHP CodeIgniter", "MySQL", "JavaScript ES6+", "HTML5 Semantik", "CSS3 Responsive", "Chart.js"],
      liveUrl: "#projects",
      githubUrl: "https://github.com"
    },
    {
      title: "KlinikCare: Sistem Informasi Rekam Medis & Antrean",
      category: "Sistem Informasi Manajemen Klinik Kesehatan",
      client: "Klinik Pratama & Apotek Mandiri",
      timeline: "3 Bulan Pengerjaan",
      overview: "Sistem informasi operasional klinik kesehatan yang mengintegrasikan pendaftaran loket, panggilan suara nomor antrean poli otomatis berbasis web, rekam medis elektronik dokter, resep obat apotek, dan kasir pembayaran terpadu.",
      challenge: "Menghubungkan alur perpindahan status pasien secara real-time antar poli (Pendaftaran -> Poli Dokter -> Apotek -> Kasir) tanpa perlu refresh browser berkali-kali.",
      solution: "Menerapkan polling AJAX JavaScript asinkron, session multi-petugas dengan otentikasi ketat CodeIgniter, dan database MySQL terstruktur untuk histori riwayat diagnosis pasien.",
      metrics: [
        { label: "Waktu Tunggu Pasien", value: "-60% Lebih Ringkas" },
        { label: "Pencatatan Resep Obat", value: "Akurat & Real-Time" },
        { label: "Keamanan Rekam Medis", value: "Enkripsi Session" }
      ],
      stack: ["CodeIgniter", "MySQL", "JavaScript AJAX", "HTML5 & CSS Grid", "Web Speech API", "Bootstrap"],
      liveUrl: "#projects",
      githubUrl: "https://github.com"
    }
  ];

  function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const content = document.getElementById('modalDynamicContent');
    const detailBtns = document.querySelectorAll('.btn-proj-detail');

    if (!modal || !closeBtn || !content) return;

    detailBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const projIdx = parseInt(btn.getAttribute('data-proj'), 10);
        const data = caseStudies[projIdx];
        if (!data) return;

        let metricsHtml = data.metrics.map(m => `
          <div style="background: rgba(255,255,255,0.04); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass);">
            <div style="font-size: 0.78rem; color: var(--text-dim); text-transform: uppercase;">${m.label}</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-top: 0.25rem;">${m.value}</div>
          </div>
        `).join('');

        let tagsHtml = data.stack.map(t => `<span class="ptag">${t}</span>`).join(' ');

        content.innerHTML = `
          <div style="margin-bottom: 1.5rem;">
            <div class="section-tag" style="margin-bottom: 0.75rem;"><i class="fa-solid fa-folder-open"></i> ${data.category}</div>
            <h2 style="font-family: var(--font-display); font-size: 1.85rem; font-weight: 800; margin-bottom: 0.5rem; color: #fff;">${data.title}</h2>
            <div style="font-size: 0.88rem; color: var(--text-dim);">Target Pengguna: <strong style="color: #fff;">${data.client}</strong> &bull; Estimasi Waktu: ${data.timeline}</div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
            ${metricsHtml}
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;"><i class="fa-solid fa-align-left text-accent"></i> Gambaran Sistem</h4>
            <p style="color: var(--text-muted); line-height: 1.7; font-size: 0.92rem;">${data.overview}</p>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;"><i class="fa-solid fa-triangle-exclamation text-accent"></i> Tantangan & Kebutuhan Bisnis</h4>
            <p style="color: var(--text-muted); line-height: 1.7; font-size: 0.92rem;">${data.challenge}</p>
          </div>

          <div style="margin-bottom: 2rem;">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;"><i class="fa-solid fa-lightbulb text-accent"></i> Solusi Rekayasa & Arsitektur</h4>
            <p style="color: var(--text-muted); line-height: 1.7; font-size: 0.92rem;">${data.solution}</p>
          </div>

          <div style="margin-bottom: 2rem;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Stack Teknologi yang Digunakan:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">${tagsHtml}</div>
          </div>

          <div style="display: flex; gap: 1rem; border-top: 1px solid var(--border-glass); padding-top: 1.5rem;">
            <a href="#contact" class="btn-primary" style="padding: 0.75rem 1.5rem;" onclick="document.getElementById('projectModal').classList.remove('active'); document.body.style.overflow='';">
              <i class="fa-solid fa-paper-plane"></i> Konsultasi Pembuatan Sistem Serupa
            </a>
            <a href="https://github.com" target="_blank" rel="noopener" class="btn-secondary" style="padding: 0.75rem 1.5rem;">
              <i class="fa-brands fa-github"></i> Repository GitHub
            </a>
          </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // --- 10. CONTACT FORM & FAST COPY ---
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const copyBtn = document.getElementById('btnCopyEmail');
    const emailToCopy = document.getElementById('emailToCopy');

    // Email Copy to Clipboard
    if (copyBtn && emailToCopy) {
      copyBtn.addEventListener('click', () => {
        const text = emailToCopy.textContent.trim();
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Email ${text} berhasil disalin!`);
        }).catch(() => {
          showToast(`Email: ${text}`);
        });
      });
    }

    // Form Submit Simulator
    if (form && submitBtn) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();

        if (!name || !email || !message) {
          showToast('Harap lengkapi semua kolom wajib bertanda *', true);
          return;
        }

        // Email basic validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showToast('Format email tidak valid', true);
          return;
        }

        // Simulating high-tech sending animation
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim Enkripsi Pesan ke Asmudin...';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          form.reset();

          if (window.AudioFX) window.AudioFX.success();
          showToast(`Terima kasih ${name}! Pesan Anda telah terkirim kepada Asmudin.`);
        }, 1200);
      });
    }
  }

  // --- 11. NAVBAR SCROLL SPY & MOBILE MENU ---
  function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section[id]');

    // Navbar Scrolled Glass
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Scroll Spy
      let currentSection = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id');
        }
      });

      navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${currentSection}`) {
          item.classList.add('active');
        }
      });
    });

    // Mobile Menu Toggle
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });

      navItems.forEach(item => {
        item.addEventListener('click', () => {
          navLinks.classList.remove('open');
        });
      });
    }
  }

  // --- 12. TOAST NOTIFICATION HELPER ---
  function showToast(message, isError = false) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}" style="${isError ? 'color: #ef4444;' : ''}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s, transform 0.4s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 3500);
  }

  // --- INITIALIZE ALL MODULES ---
  function initApp() {
    initCustomCursor();
    initTypingEffect();
    initMetricsCounter();
    initCardTilt();
    initThemeSwitcher();
    initAudioToggle();
    initSkillsFilter();
    init3DLabControls();
    initProjectModal();
    initContactForm();
    initNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
