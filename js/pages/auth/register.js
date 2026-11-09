import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { showToast } from '../../components/toast.js';

// Draft state preserved across wizard step transitions and back navigation
const registrationDraft = {
  // Step 1
  schoolId: '',
  fullName: '',
  // Step 2
  program: 'BS Information Technology',
  yearLevel: '1st Year',
  section: 'IT-1A',
  // Step 3
  password: '',
  confirmPassword: '',
  email: '',
  // Step 4
  agreedToPrivacy: false,
  agreedToTerms: false
};

const ACADEMIC_PROGRAMS = [
  { name: 'BS Information Technology', code: 'BSIT', years: 4, sectionPrefix: 'IT' },
  { name: 'BS Computer Science', code: 'BSCS', years: 4, sectionPrefix: 'CS' },
  { name: 'BS Agricultural and Biosystems Engineering', code: 'BSABE', years: 5, sectionPrefix: 'ABE' },
  { name: 'BS Agriculture', code: 'BSA', years: 4, sectionPrefix: 'BSA' },
  { name: 'BS Hospitality Management', code: 'BSHM', years: 4, sectionPrefix: 'HM' },
  { name: 'BS Business Administration', code: 'BSBA', years: 4, sectionPrefix: 'BA' },
  { name: 'Bachelor of Secondary Education', code: 'BSED', years: 4, sectionPrefix: 'BSED' },
  { name: 'Bachelor of Elementary Education', code: 'BEED', years: 4, sectionPrefix: 'BEED' },
  { name: 'BS Criminology', code: 'BSCrim', years: 4, sectionPrefix: 'CRIM' },
  { name: 'BS Nursing', code: 'BSN', years: 4, sectionPrefix: 'BSN' }
];

function getYearLevelsForProgram(programName) {
  const prog = ACADEMIC_PROGRAMS.find(p => p.name === programName) || ACADEMIC_PROGRAMS[0];
  const years = [];
  for (let i = 1; i <= prog.years; i++) {
    years.push(i === 1 ? '1st Year' : i === 2 ? '2nd Year' : i === 3 ? '3rd Year' : `${i}th Year`);
  }
  return years;
}

function getSectionsForProgramAndYear(programName, yearLevel) {
  const prog = ACADEMIC_PROGRAMS.find(p => p.name === programName) || ACADEMIC_PROGRAMS[0];
  const yrNum = parseInt(yearLevel, 10) || 1;
  return [
    `${prog.sectionPrefix}-${yrNum}A`,
    `${prog.sectionPrefix}-${yrNum}B`,
    `${prog.sectionPrefix}-${yrNum}C`
  ];
}

export const authRegisterPage = {
  currentStep: 1,

  render(container) {
    container.innerHTML = `
      <section class="screen active auth-screen" id="screen-auth-register">
        <div class="auth-page-container">
          
          <!-- Top Wizard Header with Back Arrow & Sapat Brand Lockup -->
          <div class="auth-wizard-top-nav">
            <button type="button" class="auth-back-nav-btn" id="btn-wizard-back" aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="auth-wizard-brand-pill">
              <img src="assets/sapat-icon.png" alt="Sapat" class="auth-wizard-brand-icon">
              <span class="auth-wizard-page-title">Create Account</span>
            </div>
            <button type="button" class="auth-top-guest-link" data-action="continue-guest">
              Guest
            </button>
          </div>

          <!-- 4-Segment Progress Indicator (Matching Minimalist Editorial Architecture) -->
          <div class="auth-segmented-progress" role="progressbar" aria-valuenow="${this.currentStep}" aria-valuemin="1" aria-valuemax="4">
            <div class="auth-prog-seg ${this.currentStep >= 1 ? 'active' : ''}"></div>
            <div class="auth-prog-seg ${this.currentStep >= 2 ? 'active' : ''}"></div>
            <div class="auth-prog-seg ${this.currentStep >= 3 ? 'active' : ''}"></div>
            <div class="auth-prog-seg ${this.currentStep >= 4 ? 'active' : ''}"></div>
          </div>

          <!-- Wizard Step Content -->
          <div class="auth-wizard-step-body" id="auth-step-container">
            ${this.renderStepContent()}
          </div>

        </div>
      </section>
    `;

    this.attachEvents(container);
  },

  renderStepContent() {
    switch (this.currentStep) {
      case 1:
        return this.renderStep1();
      case 2:
        return this.renderStep2();
      case 3:
        return this.renderStep3();
      case 4:
        return this.renderStep4();
      default:
        return this.renderStep1();
    }
  },

  // ==========================================
  // STEP 1: STUDENT IDENTITY
  // ==========================================
  renderStep1() {
    return `
      <!-- Editorial Headline -->
      <div class="auth-hero-block">
        <h1 class="auth-editorial-headline">
          Let's get to<br>
          <span class="auth-highlight-text">know you.</span>
        </h1>
        <p class="auth-editorial-desc">
          Use the information associated with your official university student record.
        </p>
      </div>

      <form id="form-step-1" class="auth-form" novalidate>
        <!-- School ID -->
        <div class="auth-field-group">
          <label for="reg-school-id" class="auth-field-label">School ID</label>
          <div class="auth-input-pill" id="wrap-reg-school-id">
            <span class="auth-field-icon" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            </span>
            <span class="auth-field-divider"></span>
            <input 
              type="text" 
              id="reg-school-id" 
              class="auth-text-input" 
              placeholder="e.g. 2026-0001" 
              autocomplete="username" 
              value="${registrationDraft.schoolId}"
              required
            >
          </div>
          <small class="auth-field-hint">Matches your university student ID card</small>
        </div>

        <!-- Full Legal Name -->
        <div class="auth-field-group">
          <label for="reg-full-name" class="auth-field-label">Full Name</label>
          <div class="auth-input-pill" id="wrap-reg-full-name">
            <span class="auth-field-icon" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>
            </span>
            <span class="auth-field-divider"></span>
            <input 
              type="text" 
              id="reg-full-name" 
              class="auth-text-input" 
              placeholder="e.g. Maria Santos" 
              autocomplete="name" 
              value="${registrationDraft.fullName}"
              required
            >
          </div>
          <small class="auth-field-hint">Enter your official name as enrolled with the university registrar</small>
        </div>

        <div class="auth-error-banner" id="step-error-banner" style="display: none;" role="alert"></div>

        <button type="submit" class="auth-cta-btn" id="btn-step1-continue">
          <span>Continue</span>
          <svg class="auth-btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </form>

      <div class="auth-secondary-actions">
        <p class="auth-switch-prompt">
          Already have an active account?
          <button type="button" class="auth-inline-link" data-action="go-to-login">Sign In</button>
        </p>
      </div>
    `;
  },

  // ==========================================
  // STEP 2: ACADEMIC DETAILS (CUSTOM DROPDOWNS)
  // ==========================================
  renderStep2() {
    const availableYears = getYearLevelsForProgram(registrationDraft.program);
    if (!availableYears.includes(registrationDraft.yearLevel)) {
      registrationDraft.yearLevel = availableYears[0];
    }

    const availableSections = getSectionsForProgramAndYear(registrationDraft.program, registrationDraft.yearLevel);
    if (!availableSections.includes(registrationDraft.section)) {
      registrationDraft.section = availableSections[0];
    }

    return `
      <!-- Editorial Headline -->
      <div class="auth-hero-block">
        <h1 class="auth-editorial-headline">
          Your campus<br>
          <span class="auth-highlight-text">details.</span>
        </h1>
        <p class="auth-editorial-desc">
          Helps canteen kitchens schedule exact cooking batches with your class schedule.
        </p>
      </div>

      <form id="form-step-2" class="auth-form" novalidate>
        
        <!-- Custom Dropdown: Degree Program -->
        <div class="auth-field-group">
          <label class="auth-field-label">Degree Program</label>
          <div class="custom-dropdown-container" id="dropdown-program-wrap">
            <button type="button" class="custom-dropdown-trigger" id="btn-dropdown-program" aria-haspopup="listbox" aria-expanded="false">
              <span class="custom-dropdown-lead-icon" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </span>
              <span class="custom-dropdown-divider"></span>
              <span class="custom-dropdown-selected-text" id="selected-program-label">${registrationDraft.program}</span>
              <span class="custom-dropdown-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </button>

            <!-- Searchable Dropdown Panel -->
            <div class="custom-dropdown-panel" id="panel-dropdown-program" role="listbox" aria-label="Degree Program">
              <div class="dropdown-search-box">
                <svg class="dropdown-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" class="dropdown-search-input" id="input-search-program" placeholder="Search program..." autocomplete="off">
              </div>
              <div class="dropdown-options-scroller" id="scroller-program-options">
                ${ACADEMIC_PROGRAMS.map(prog => `
                  <div 
                    class="custom-dropdown-option ${registrationDraft.program === prog.name ? 'selected' : ''}" 
                    data-dropdown-type="program" 
                    data-value="${prog.name}"
                    role="option"
                    tabindex="0"
                  >
                    <span class="dropdown-opt-label">${prog.name}</span>
                    <span class="dropdown-opt-badge">${prog.years} Yrs</span>
                    ${registrationDraft.program === prog.name ? `
                      <span class="dropdown-opt-check" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#005B36" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </span>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <small class="auth-field-hint">Your currently enrolled academic degree program</small>
        </div>

        <!-- Custom Dropdown: Year Level -->
        <div class="auth-field-group">
          <label class="auth-field-label">Year Level</label>
          <div class="custom-dropdown-container" id="dropdown-year-wrap">
            <button type="button" class="custom-dropdown-trigger" id="btn-dropdown-year" aria-haspopup="listbox" aria-expanded="false">
              <span class="custom-dropdown-lead-icon" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              </span>
              <span class="custom-dropdown-divider"></span>
              <span class="custom-dropdown-selected-text" id="selected-year-label">${registrationDraft.yearLevel}</span>
              <span class="custom-dropdown-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </button>

            <!-- Year Level Panel -->
            <div class="custom-dropdown-panel" id="panel-dropdown-year" role="listbox" aria-label="Year Level">
              <div class="dropdown-options-scroller" id="scroller-year-options">
                ${availableYears.map(yr => `
                  <div 
                    class="custom-dropdown-option ${registrationDraft.yearLevel === yr ? 'selected' : ''}" 
                    data-dropdown-type="yearLevel" 
                    data-value="${yr}"
                    role="option"
                    tabindex="0"
                  >
                    <span class="dropdown-opt-label">${yr}</span>
                    ${registrationDraft.yearLevel === yr ? `
                      <span class="dropdown-opt-check" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#005B36" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </span>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <small class="auth-field-hint">Academic year standing based on curriculum</small>
        </div>

        <!-- Custom Dropdown: Enrolled Section -->
        <div class="auth-field-group">
          <label class="auth-field-label">Enrolled Section</label>
          <div class="custom-dropdown-container" id="dropdown-section-wrap">
            <button type="button" class="custom-dropdown-trigger" id="btn-dropdown-section" aria-haspopup="listbox" aria-expanded="false">
              <span class="custom-dropdown-lead-icon" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </span>
              <span class="custom-dropdown-divider"></span>
              <span class="custom-dropdown-selected-text" id="selected-section-label">${registrationDraft.section}</span>
              <span class="custom-dropdown-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </button>

            <!-- Section Panel -->
            <div class="custom-dropdown-panel" id="panel-dropdown-section" role="listbox" aria-label="Enrolled Section">
              <div class="dropdown-options-scroller" id="scroller-section-options">
                ${availableSections.map(sec => `
                  <div 
                    class="custom-dropdown-option ${registrationDraft.section === sec ? 'selected' : ''}" 
                    data-dropdown-type="section" 
                    data-value="${sec}"
                    role="option"
                    tabindex="0"
                  >
                    <span class="dropdown-opt-label">${sec}</span>
                    ${registrationDraft.section === sec ? `
                      <span class="dropdown-opt-check" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#005B36" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </span>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <small class="auth-field-hint">Class block schedule for synchronized batch meal readiness</small>
        </div>

        <div class="auth-error-banner" id="step-error-banner" style="display: none;" role="alert"></div>

        <button type="submit" class="auth-cta-btn" id="btn-step2-continue">
          <span>Continue</span>
          <svg class="auth-btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </form>
    `;
  },

  // ==========================================
  // STEP 3: ACCOUNT SECURITY
  // ==========================================
  renderStep3() {
    return `
      <!-- Editorial Headline -->
      <div class="auth-hero-block">
        <h1 class="auth-editorial-headline">
          Secure your<br>
          <span class="auth-highlight-text">account.</span>
        </h1>
        <p class="auth-editorial-desc">
          Set a password to protect your meal reservations and pickup pass.
        </p>
      </div>

      <form id="form-step-3" class="auth-form" novalidate>
        <!-- Password -->
        <div class="auth-field-group">
          <label for="reg-password" class="auth-field-label">Password</label>
          <div class="auth-input-pill" id="wrap-reg-password">
            <span class="auth-field-icon" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
            <span class="auth-field-divider"></span>
            <input 
              type="password" 
              id="reg-password" 
              class="auth-text-input" 
              placeholder="At least 8 characters" 
              autocomplete="new-password"
              value="${registrationDraft.password}"
              required
            >
            <button type="button" class="auth-pwd-toggle-btn" data-toggle-target="reg-password" aria-label="Toggle password visibility">
              <svg class="pwd-eye-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span class="pwd-toggle-label">Show</span>
            </button>
          </div>
          <div class="auth-field-req-line" id="pwd-req-hint">
            <span class="req-dot" id="pwd-len-dot"></span>
            <span class="req-text">Minimum 8 characters</span>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="auth-field-group">
          <label for="reg-confirm-password" class="auth-field-label">Confirm Password</label>
          <div class="auth-input-pill" id="wrap-reg-confirm-password">
            <span class="auth-field-icon" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </span>
            <span class="auth-field-divider"></span>
            <input 
              type="password" 
              id="reg-confirm-password" 
              class="auth-text-input" 
              placeholder="Re-enter your password" 
              autocomplete="new-password"
              value="${registrationDraft.confirmPassword}"
              required
            >
            <button type="button" class="auth-pwd-toggle-btn" data-toggle-target="reg-confirm-password" aria-label="Toggle password visibility">
              <svg class="pwd-eye-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span class="pwd-toggle-label">Show</span>
            </button>
          </div>
          <small class="auth-field-hint" id="pwd-match-hint">Must match password above</small>
        </div>

        <!-- Optional Recovery Email -->
        <div class="auth-field-group">
          <label for="reg-email" class="auth-field-label">
            University or Personal Email <span class="auth-label-opt">(Optional)</span>
          </label>
          <div class="auth-input-pill">
            <span class="auth-field-icon" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </span>
            <span class="auth-field-divider"></span>
            <input 
              type="email" 
              id="reg-email" 
              class="auth-text-input" 
              placeholder="student@minsu.edu.ph" 
              autocomplete="email"
              value="${registrationDraft.email}"
            >
          </div>
          <small class="auth-field-hint">Optional: Used for password reset and reservation alerts</small>
        </div>

        <div class="auth-error-banner" id="step-error-banner" style="display: none;" role="alert"></div>

        <button type="submit" class="auth-cta-btn" id="btn-step3-continue">
          <span>Continue</span>
          <svg class="auth-btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </form>
    `;
  },

  // ==========================================
  // STEP 4: PRIVACY & TERMS
  // ==========================================
  renderStep4() {
    return `
      <!-- Editorial Headline -->
      <div class="auth-hero-block">
        <h1 class="auth-editorial-headline">
          One last<br>
          <span class="auth-highlight-text">step.</span>
        </h1>
        <p class="auth-editorial-desc">
          Please review student responsibilities and data protection guidelines before activating your account.
        </p>
      </div>

      <div class="auth-policy-doc-container">
        
        <!-- Document Section 1: Privacy Notice -->
        <div class="auth-policy-card">
          <div class="policy-card-header">
            <h3 class="policy-card-title">Privacy Notice</h3>
            <span class="policy-card-sub">Republic Act No. 10173 &bull; Philippine Data Privacy Act</span>
          </div>

          <div class="policy-points-stack">
            <div class="policy-point-row">
              <span class="policy-point-badge">1</span>
              <div class="policy-point-content">
                <strong>Personal Information We Collect</strong>
                <p>We collect only minimum required student records: School ID, full name, enrolled program/section, reservation timestamps, and payment transaction logs.</p>
              </div>
            </div>

            <div class="policy-point-row">
              <span class="policy-point-badge">2</span>
              <div class="policy-point-content">
                <strong>Purpose &amp; Student Accountability</strong>
                <p>Your records verify your digital pickup pass at canteen counters, protect kitchens from uncollected food preparation, and compute daily batch limits.</p>
              </div>
            </div>

            <div class="policy-point-row">
              <span class="policy-point-badge">3</span>
              <div class="policy-point-content">
                <strong>SAPAT Intelligence Aggregation</strong>
                <p>Meal reviews and seasoning ratings are anonymized and aggregated into culinary feedback so vendors can refine recipes and portion sizing.</p>
              </div>
            </div>

            <div class="policy-point-row">
              <span class="policy-point-badge">4</span>
              <div class="policy-point-content">
                <strong>Your Rights as a Student</strong>
                <p>You have the right to access your reservation history, correct profile inaccuracies, and lodge privacy inquiries under university guidelines.</p>
              </div>
            </div>
          </div>

          <!-- Acknowledgment Checkbox 1 -->
          <label class="auth-checkbox-card" id="wrap-ack-privacy">
            <input type="checkbox" id="ack-privacy-checkbox" class="auth-custom-checkbox" ${registrationDraft.agreedToPrivacy ? 'checked' : ''}>
            <span class="auth-checkbox-box" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span class="auth-checkbox-text">
              I have read and acknowledge the <strong>Privacy Notice</strong> under RA 10173.
            </span>
          </label>
        </div>

        <!-- Document Section 2: Terms of Use -->
        <div class="auth-policy-card">
          <div class="policy-card-header">
            <h3 class="policy-card-title">Terms of Use</h3>
            <span class="policy-card-sub">Responsible Pre-ordering &amp; Canteen Dining Code</span>
          </div>

          <div class="policy-points-stack">
            <div class="policy-point-row">
              <span class="policy-point-badge">1</span>
              <div class="policy-point-content">
                <strong>Student Pre-order Responsibility</strong>
                <p>Students are solely responsible for reservations placed through their School ID. Please reserve only meals you intend to collect.</p>
              </div>
            </div>

            <div class="policy-point-row">
              <span class="policy-point-badge">2</span>
              <div class="policy-point-content">
                <strong>Verified Payment &amp; Confirmation</strong>
                <p>Reservations require a verified online payment or confirmed cash counter payment before the digital QR pickup pass becomes unlocked.</p>
              </div>
            </div>

            <div class="policy-point-row">
              <span class="policy-point-badge">3</span>
              <div class="policy-point-content">
                <strong>Payment Cutoffs &amp; Expiration</strong>
                <p>Counter payments must be completed 20 minutes before lunch shift. Expired pre-orders automatically release food portions to other students.</p>
              </div>
            </div>

            <div class="policy-point-row">
              <span class="policy-point-badge">4</span>
              <div class="policy-point-content">
                <strong>No-Show Governance &amp; Fair Review</strong>
                <p>Failure to collect confirmed meals is documented in audit logs. Repeated unexcused no-shows are subject to fair review with the Office of Student Affairs and Services (OSAS).</p>
              </div>
            </div>
          </div>

          <!-- Acknowledgment Checkbox 2 -->
          <label class="auth-checkbox-card" id="wrap-ack-terms">
            <input type="checkbox" id="ack-terms-checkbox" class="auth-custom-checkbox" ${registrationDraft.agreedToTerms ? 'checked' : ''}>
            <span class="auth-checkbox-box" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span class="auth-checkbox-text">
              I accept the <strong>Terms of Use</strong> and agree to practice responsible campus dining.
            </span>
          </label>
        </div>

      </div>

      <div class="auth-error-banner" id="step-error-banner" style="display: none;" role="alert"></div>

      <!-- Final Submit CTA Button -->
      <button 
        type="button" 
        class="auth-cta-btn ${(!registrationDraft.agreedToPrivacy || !registrationDraft.agreedToTerms) ? 'disabled' : ''}" 
        id="btn-submit-registration"
        ${(!registrationDraft.agreedToPrivacy || !registrationDraft.agreedToTerms) ? 'disabled' : ''}
      >
        <span>Create Account</span>
        <svg class="auth-btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    `;
  },

  attachEvents(container) {
    // 1. Wizard Back button
    const backBtn = container.querySelector('#btn-wizard-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.currentStep > 1) {
          this.currentStep--;
          this.render(container);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          router.navigate('#/auth/login');
        }
      });
    }

    // 2. Switch to Sign In / Guest
    container.addEventListener('click', (e) => {
      const loginLink = e.target.closest('[data-action="go-to-login"]');
      if (loginLink) {
        router.navigate('#/auth/login');
        return;
      }

      const guestBtn = e.target.closest('[data-action="continue-guest"]');
      if (guestBtn) {
        showToast('Browsing as Guest. You can explore menus and prepare your order.', 'info');
        router.navigate('#/student/home');
        return;
      }
    });

    // 3. Step 1 Submit
    const formStep1 = container.querySelector('#form-step-1');
    if (formStep1) {
      formStep1.addEventListener('submit', (e) => {
        e.preventDefault();
        const schoolId = container.querySelector('#reg-school-id')?.value.trim();
        const fullName = container.querySelector('#reg-full-name')?.value.trim();
        const errorBanner = container.querySelector('#step-error-banner');

        if (!schoolId || schoolId.length < 4) {
          this.showError(errorBanner, 'Please enter a valid School ID (minimum 4 characters).');
          return;
        }

        const existing = SapatStorage.getStudentBySchoolId(schoolId);
        if (existing) {
          this.showError(errorBanner, `School ID "${schoolId}" is already registered. Please sign in instead.`);
          return;
        }

        if (!fullName || fullName.length < 3) {
          this.showError(errorBanner, 'Please provide your full legal name.');
          return;
        }

        registrationDraft.schoolId = schoolId;
        registrationDraft.fullName = fullName;
        this.currentStep = 2;
        this.render(container);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 4. Step 2 Submit & Custom Dropdowns Handling
    if (this.currentStep === 2) {
      this.attachCustomDropdowns(container);

      const formStep2 = container.querySelector('#form-step-2');
      if (formStep2) {
        formStep2.addEventListener('submit', (e) => {
          e.preventDefault();
          const errorBanner = container.querySelector('#step-error-banner');

          if (!registrationDraft.program) {
            this.showError(errorBanner, 'Please select your degree program.');
            return;
          }

          if (!registrationDraft.yearLevel) {
            this.showError(errorBanner, 'Please select your current year level.');
            return;
          }

          if (!registrationDraft.section) {
            this.showError(errorBanner, 'Please select your enrolled section.');
            return;
          }

          this.currentStep = 3;
          this.render(container);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    }

    // 5. Step 3 Submit & Password handling
    const formStep3 = container.querySelector('#form-step-3');
    if (formStep3) {
      const pwdInput = container.querySelector('#reg-password');
      const confirmPwdInput = container.querySelector('#reg-confirm-password');
      const emailInput = container.querySelector('#reg-email');
      const lenDot = container.querySelector('#pwd-len-dot');
      const matchHint = container.querySelector('#pwd-match-hint');

      // Password toggle buttons
      container.querySelectorAll('.auth-pwd-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-toggle-target');
          const targetInput = container.querySelector('#' + targetId);
          if (targetInput) {
            const isPassword = targetInput.getAttribute('type') === 'password';
            targetInput.setAttribute('type', isPassword ? 'text' : 'password');
            const label = btn.querySelector('.pwd-toggle-label');
            if (label) label.textContent = isPassword ? 'Hide' : 'Show';
          }
        });
      });

      // Realtime validation
      const checkRealtime = () => {
        const p1 = pwdInput?.value || '';
        const p2 = confirmPwdInput?.value || '';

        if (lenDot) {
          lenDot.className = 'req-dot ' + (p1.length >= 8 ? 'valid' : '');
        }

        if (matchHint && p2.length > 0) {
          if (p1 === p2) {
            matchHint.textContent = 'Passwords match ✓';
            matchHint.style.color = '#005B36';
          } else {
            matchHint.textContent = 'Passwords do not match';
            matchHint.style.color = '#DC2626';
          }
        }
      };

      pwdInput?.addEventListener('input', checkRealtime);
      confirmPwdInput?.addEventListener('input', checkRealtime);

      formStep3.addEventListener('submit', (e) => {
        e.preventDefault();
        const p1 = pwdInput?.value || '';
        const p2 = confirmPwdInput?.value || '';
        const email = emailInput?.value.trim() || '';
        const errorBanner = container.querySelector('#step-error-banner');

        if (p1.length < 8) {
          this.showError(errorBanner, 'Password must be at least 8 characters long.');
          return;
        }

        if (p1 !== p2) {
          this.showError(errorBanner, 'Passwords do not match. Please re-enter.');
          return;
        }

        registrationDraft.password = p1;
        registrationDraft.confirmPassword = p2;
        registrationDraft.email = email;
        this.currentStep = 4;
        this.render(container);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 6. Step 4 Submit & Checkboxes
    const ackPrivacy = container.querySelector('#ack-privacy-checkbox');
    const ackTerms = container.querySelector('#ack-terms-checkbox');
    const submitBtn = container.querySelector('#btn-submit-registration');

    const updateSubmitState = () => {
      const ready = !!(ackPrivacy?.checked && ackTerms?.checked);
      registrationDraft.agreedToPrivacy = !!ackPrivacy?.checked;
      registrationDraft.agreedToTerms = !!ackTerms?.checked;

      if (submitBtn) {
        if (ready) {
          submitBtn.classList.remove('disabled');
          submitBtn.removeAttribute('disabled');
        } else {
          submitBtn.classList.add('disabled');
          submitBtn.setAttribute('disabled', 'true');
        }
      }
    };

    ackPrivacy?.addEventListener('change', updateSubmitState);
    ackTerms?.addEventListener('change', updateSubmitState);

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const errorBanner = container.querySelector('#step-error-banner');
        if (!ackPrivacy?.checked || !ackTerms?.checked) {
          this.showError(errorBanner, 'Please check both boxes to acknowledge the Privacy Notice and Terms of Use.');
          return;
        }

        const res = SapatStorage.registerStudent({
          schoolId: registrationDraft.schoolId,
          fullName: registrationDraft.fullName,
          program: registrationDraft.program,
          yearLevel: registrationDraft.yearLevel,
          section: registrationDraft.section,
          password: registrationDraft.password,
          email: registrationDraft.email,
          agreedToPrivacy: true,
          agreedToTerms: true
        });

        if (res.success) {
          state.loginStudent(res.student);
          state.setRole('student');
          showToast(`Account registered successfully! Welcome to SAPAT, ${res.student.fullName}.`, 'success');

          // Reset wizard state
          this.currentStep = 1;

          // Check if there was a saved redirect intent
          let redirectTarget = '#/student/home';
          if (typeof sessionStorage !== 'undefined') {
            const savedRedirect = sessionStorage.getItem('sapat_auth_redirect');
            if (savedRedirect) {
              redirectTarget = savedRedirect;
              sessionStorage.removeItem('sapat_auth_redirect');
            }
          }
          router.navigate(redirectTarget);
        } else {
          this.showError(errorBanner, res.message || 'Failed to complete registration.');
        }
      });
    }
  },

  // ==========================================
  // CUSTOM DROPDOWNS CONTROLLER (NO NATIVE SELECTS)
  // ==========================================
  attachCustomDropdowns(container) {
    const wrapProgram = container.querySelector('#dropdown-program-wrap');
    const wrapYear = container.querySelector('#dropdown-year-wrap');
    const wrapSection = container.querySelector('#dropdown-section-wrap');

    const btnProgram = container.querySelector('#btn-dropdown-program');
    const btnYear = container.querySelector('#btn-dropdown-year');
    const btnSection = container.querySelector('#btn-dropdown-section');

    const searchInput = container.querySelector('#input-search-program');

    const closeAllDropdowns = () => {
      [wrapProgram, wrapYear, wrapSection].forEach(wrap => {
        if (wrap) {
          wrap.classList.remove('open');
          const trigger = wrap.querySelector('.custom-dropdown-trigger');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
      });
    };

    const toggleDropdown = (wrap, btn) => {
      if (!wrap || !btn) return;
      const isOpen = wrap.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        wrap.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        // If program dropdown, focus search
        if (wrap === wrapProgram && searchInput) {
          setTimeout(() => searchInput.focus(), 60);
        }
      }
    };

    // Toggle click listeners
    btnProgram?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(wrapProgram, btnProgram);
    });

    btnYear?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(wrapYear, btnYear);
    });

    btnSection?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(wrapSection, btnSection);
    });

    // Program live search filter
    if (searchInput) {
      searchInput.addEventListener('click', (e) => e.stopPropagation());
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const scroller = container.querySelector('#scroller-program-options');
        if (!scroller) return;

        const options = scroller.querySelectorAll('.custom-dropdown-option');
        let matched = 0;
        options.forEach(opt => {
          const val = opt.getAttribute('data-value').toLowerCase();
          if (val.includes(query)) {
            opt.style.display = 'flex';
            matched++;
          } else {
            opt.style.display = 'none';
          }
        });

        let emptyMsg = scroller.querySelector('.dropdown-empty-message');
        if (matched === 0) {
          if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.className = 'dropdown-empty-message';
            emptyMsg.textContent = 'No matching degree program found';
            scroller.appendChild(emptyMsg);
          }
        } else if (emptyMsg) {
          emptyMsg.remove();
        }
      });
    }

    // Refresh Year Level options DOM dynamically
    const updateYearDropdownDOM = () => {
      const scroller = container.querySelector('#scroller-year-options');
      const selectedLabel = container.querySelector('#selected-year-label');
      if (!scroller) return;

      const years = getYearLevelsForProgram(registrationDraft.program);
      if (!years.includes(registrationDraft.yearLevel)) {
        registrationDraft.yearLevel = years[0];
      }
      if (selectedLabel) selectedLabel.textContent = registrationDraft.yearLevel;

      scroller.innerHTML = years.map(yr => `
        <div 
          class="custom-dropdown-option ${registrationDraft.yearLevel === yr ? 'selected' : ''}" 
          data-dropdown-type="yearLevel" 
          data-value="${yr}"
          role="option"
          tabindex="0"
        >
          <span class="dropdown-opt-label">${yr}</span>
          ${registrationDraft.yearLevel === yr ? `
            <span class="dropdown-opt-check" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#005B36" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
          ` : ''}
        </div>
      `).join('');
    };

    // Refresh Section options DOM dynamically
    const updateSectionDropdownDOM = () => {
      const scroller = container.querySelector('#scroller-section-options');
      const selectedLabel = container.querySelector('#selected-section-label');
      if (!scroller) return;

      const sections = getSectionsForProgramAndYear(registrationDraft.program, registrationDraft.yearLevel);
      if (!sections.includes(registrationDraft.section)) {
        registrationDraft.section = sections[0];
      }
      if (selectedLabel) selectedLabel.textContent = registrationDraft.section;

      scroller.innerHTML = sections.map(sec => `
        <div 
          class="custom-dropdown-option ${registrationDraft.section === sec ? 'selected' : ''}" 
          data-dropdown-type="section" 
          data-value="${sec}"
          role="option"
          tabindex="0"
        >
          <span class="dropdown-opt-label">${sec}</span>
          ${registrationDraft.section === sec ? `
            <span class="dropdown-opt-check" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#005B36" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
          ` : ''}
        </div>
      `).join('');
    };

    // Option selection delegation
    container.addEventListener('click', (e) => {
      const opt = e.target.closest('.custom-dropdown-option');
      if (!opt) return;

      const type = opt.getAttribute('data-dropdown-type');
      const val = opt.getAttribute('data-value');
      if (!type || !val) return;

      if (type === 'program') {
        registrationDraft.program = val;
        const progLabel = container.querySelector('#selected-program-label');
        if (progLabel) progLabel.textContent = val;

        // Update selected state in program list
        container.querySelectorAll('#scroller-program-options .custom-dropdown-option').forEach(el => {
          el.classList.toggle('selected', el.getAttribute('data-value') === val);
          const check = el.querySelector('.dropdown-opt-check');
          if (el.getAttribute('data-value') === val) {
            if (!check) {
              const checkSpan = document.createElement('span');
              checkSpan.className = 'dropdown-opt-check';
              checkSpan.setAttribute('aria-hidden', 'true');
              checkSpan.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#005B36" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
              el.appendChild(checkSpan);
            }
          } else if (check) {
            check.remove();
          }
        });

        // Recalculate dependent year and section dropdowns
        updateYearDropdownDOM();
        updateSectionDropdownDOM();
        closeAllDropdowns();
      } else if (type === 'yearLevel') {
        registrationDraft.yearLevel = val;
        const yearLabel = container.querySelector('#selected-year-label');
        if (yearLabel) yearLabel.textContent = val;

        container.querySelectorAll('#scroller-year-options .custom-dropdown-option').forEach(el => {
          el.classList.toggle('selected', el.getAttribute('data-value') === val);
        });

        // Recalculate dependent sections
        updateSectionDropdownDOM();
        closeAllDropdowns();
      } else if (type === 'section') {
        registrationDraft.section = val;
        const secLabel = container.querySelector('#selected-section-label');
        if (secLabel) secLabel.textContent = val;

        container.querySelectorAll('#scroller-section-options .custom-dropdown-option').forEach(el => {
          el.classList.toggle('selected', el.getAttribute('data-value') === val);
        });

        closeAllDropdowns();
      }
    });

    // Dismiss dropdown on outside click
    const handleOutsideClick = (e) => {
      if (!e.target.closest || !e.target.closest('.custom-dropdown-container')) {
        closeAllDropdowns();
      }
    };
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('click', handleOutsideClick);
    }

    // Escape key dismissal & keyboard navigation
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
      }
    };
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('keydown', handleKeydown);
    }
  },

  showError(banner, message) {
    if (!banner) return;
    banner.textContent = message;
    banner.style.display = 'block';
  }
};
