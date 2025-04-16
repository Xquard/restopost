// Function to toggle between light and dark mode
export function toggleDarkMode(): boolean {
  const root = document.documentElement;
  const isDarkMode = root.classList.contains('dark');
  
  if (isDarkMode) {
    root.classList.remove('dark');
    localStorage.setItem('dark-mode', 'false');
    return false;
  } else {
    root.classList.add('dark');
    localStorage.setItem('dark-mode', 'true');
    return true;
  }
}

// Function to initialize theme based on localStorage or system preference
export function initializeTheme(): boolean {
  const root = document.documentElement;
  const isDarkMode = localStorage.getItem('dark-mode') === 'true';
  
  if (isDarkMode) {
    root.classList.add('dark');
    return true;
  } else {
    root.classList.remove('dark');
    return false;
  }
}
