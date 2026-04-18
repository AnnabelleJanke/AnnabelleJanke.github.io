(function () {
  const startTime = Date.now();
  const pageName = document.body.dataset.page || document.title || 'unknown-page';

  function gtagAvailable() {
    return typeof window.gtag === 'function';
  }

  function logLocal(eventName, params) {
    const logs = JSON.parse(localStorage.getItem('siteAnalyticsLogs') || '[]');
    logs.push({
      event: eventName,
      params,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('siteAnalyticsLogs', JSON.stringify(logs));
    console.log('[Tracked]', eventName, params);
  }

  function track(eventName, params = {}) {
    const payload = {
      page_name: pageName,
      page_path: location.pathname,
      ...params
    };

    if (gtagAvailable()) {
      window.gtag('event', eventName, payload);
    }
    logLocal(eventName, payload);
  }

  window.trackSiteEvent = track;

  document.addEventListener('DOMContentLoaded', function () {
    track('page_loaded', { title: document.title });

    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', function () {
        track('navigation_click', {
          link_text: this.textContent.trim(),
          destination: this.getAttribute('href')
        });
      });
    });

    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const formName = this.dataset.formName || this.getAttribute('id') || 'unnamed-form';
        track('form_submit', { form_name: formName });
        alert('Form action tracked for "' + formName + '".');
        this.reset();
      });
    });

    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', function () {
        track('button_click', {
          button_text: this.textContent.trim(),
          button_id: this.id || 'no-id'
        });
      });
    });
  });

  window.addEventListener('beforeunload', function () {
    const secondsOnPage = Math.round((Date.now() - startTime) / 1000);
    track('time_on_page', { seconds_spent: secondsOnPage });
  });
})();
