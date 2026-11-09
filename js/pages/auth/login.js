import { state } from '../../state.js';
import { SapatStorage } from '../../storage.js';
import { router } from '../../router.js';
import { showToast } from '../../components/toast.js';

export const authLoginPage = {
  render(container) {
    const currentStudent = SapatStorage.getCurrentStudent();
    const savedSchoolId = currentStudent ? currentStudent.schoolId : '';

    container.innerHTML = `
      <section class="screen active auth-screen" id="screen-auth-login" style="display: flex; flex-direction: column; min-height: calc(100vh - 56px); flex: 1;">
        <div class="auth-page-container" style="display: flex; flex-direction: column; flex: 1; min-height: 100%;">
          
          <!-- Top Navigation / Official Brand Lockup -->
          <div class="auth-top-bar" style="flex-shrink: 0;">
            <div class="auth-brand-lockup">
              <img src="assets/sapat-login-logo.png" alt="Sapat Logo" class="auth-brand-logo-img">
              <div class="auth-brand-meta">
                <span class="auth-brand-name">Sapat</span>
                <span class="auth-brand-sub">Exact portions. Zero waste.</span>
              </div>
            </div>
          </div>

          <!-- Vertically Centered Main Body -->
          <div class="auth-body-center" style="flex: 1; display: flex; flex-direction: column; justify-content: center; margin: auto 0; width: 100%;">
            <!-- Editorial Hero Headline -->
            <div class="auth-hero-block">
              <h1 class="auth-editorial-headline">
                Your next meal,<br>
                <span class="auth-highlight-text">ready when you are.</span>
              </h1>
              <p class="auth-editorial-desc">
                Sign in to reserve your favorite campus meals and skip the canteen queues.
              </p>
            </div>

            <!-- Login Form -->
            <form id="auth-login-form" class="auth-form" novalidate>
              <!-- School ID Field -->
              <div class="auth-field-group">
                <label for="login-school-id" class="auth-field-label">School ID</label>
                <div class="auth-input-pill" id="wrap-login-school-id">
                  <span class="auth-field-icon" aria-hidden="true">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="8" y1="2" x2="8" y2="6"></line><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="10" x2="16" y2="10"></line><circle cx="8" cy="15" r="1"></circle><line x1="12" y1="15" x2="16" y2="15"></line></svg>
                  </span>
                  <span class="auth-field-divider"></span>
                  <input 
                    type="text" 
                    id="login-school-id" 
                    class="auth-text-input" 
                    placeholder="e.g. 2026-0001" 
                    autocomplete="username" 
                    value="${savedSchoolId}"
                    required
                  >
                </div>
                <small class="auth-field-hint">Matches your university student ID card</small>
              </div>

              <!-- Password Field -->
              <div class="auth-field-group">
                <label for="login-password" class="auth-field-label">Password</label>
                <div class="auth-input-pill" id="wrap-login-password">
                  <span class="auth-field-icon" aria-hidden="true">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </span>
                  <span class="auth-field-divider"></span>
                  <input 
                    type="password" 
                    id="login-password" 
                    class="auth-text-input" 
                    placeholder="••••••••••••" 
                    autocomplete="current-password" 
                    required
                  >
                  <button type="button" class="auth-pwd-toggle-btn" id="login-pwd-toggle" aria-label="Toggle password visibility">
                    <svg class="pwd-eye-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <span class="pwd-toggle-label">Show</span>
                  </button>
                </div>
              </div>

              <!-- Error Banner -->
              <div class="auth-error-banner" id="login-error-banner" style="display: none;" role="alert"></div>

              <!-- Submit CTA Button -->
              <button type="submit" class="auth-cta-btn" id="btn-login-submit">
                <span>Sign In</span>
                <svg class="auth-btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </form>

            <!-- Secondary Links & Navigation -->
            <div class="auth-secondary-actions">
              <p class="auth-switch-prompt">
                Don't have an active account?
                <button type="button" class="auth-inline-link" data-action="go-to-register">Create Account</button>
              </p>

              <div class="auth-actions-separator">
                <span>or</span>
              </div>

              <button type="button" class="auth-guest-cta-btn" data-action="continue-guest">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                <span>Continue as Guest</span>
              </button>

              <button type="button" class="auth-forgot-link" data-action="forgot-password">
                Forgot your password?
              </button>
            </div>
          </div>

        </div>
      </section>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    const form = container.querySelector('#auth-login-form');
    const schoolIdInput = container.querySelector('#login-school-id');
    const passwordInput = container.querySelector('#login-password');
    const errorBanner = container.querySelector('#login-error-banner');
    const pwdToggleBtn = container.querySelector('#login-pwd-toggle');

    // Password visibility toggle
    if (pwdToggleBtn && passwordInput) {
      pwdToggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        const label = pwdToggleBtn.querySelector('.pwd-toggle-label');
        if (label) label.textContent = isPassword ? 'Hide' : 'Show';
      });
    }

    // Form submission
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const schoolId = schoolIdInput ? schoolIdInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!schoolId) {
          this.showError(errorBanner, 'Please enter your School ID.');
          schoolIdInput?.focus();
          return;
        }

        if (!password) {
          this.showError(errorBanner, 'Please enter your password.');
          passwordInput?.focus();
          return;
        }

        const res = SapatStorage.authenticateStudent(schoolId, password);
        if (res.success) {
          state.loginStudent(res.student);
          state.setRole('student');
          showToast(`Welcome back, ${res.student.fullName}!`, 'success');

          // Check if there was a preserved redirect target
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
          this.showError(errorBanner, res.message || 'Invalid School ID or password.');
        }
      });
    }

    // Guest browsing & Secondary actions
    container.addEventListener('click', (e) => {
      const guestBtn = e.target.closest('[data-action="continue-guest"]');
      if (guestBtn) {
        showToast('Browsing as Guest. You can explore menus and prepare your order.', 'info');
        router.navigate('#/student/home');
        return;
      }

      const registerBtn = e.target.closest('[data-action="go-to-register"]');
      if (registerBtn) {
        router.navigate('#/auth/register');
        return;
      }

      const forgotBtn = e.target.closest('[data-action="forgot-password"]');
      if (forgotBtn) {
        alert('Password Recovery Notice:\n\nPlease contact your campus Office of Student Affairs and Services (OSAS) or visit the University Registrar with your student ID card to reset your Sapat credentials.');
      }
    });
  },

  showError(banner, message) {
    if (!banner) return;
    banner.textContent = message;
    banner.style.display = 'block';
  }
};
