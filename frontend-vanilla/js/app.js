// Main App Initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize router with all pages
  const initialPage = Auth.isLoggedIn() ? 'student-dashboard' : 'login';
  await Router.navigate(initialPage);

  // Listen for navigation
  window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || initialPage;
    Router.navigate(page);
  });
});
