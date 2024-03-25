/**
 * Main js file, contains single page application navigation logic
 */
const ROOT_ENDPOINT = 'https://taskmasterbackend.michac789.com';
const LOGIN_ENDPOINT = `${ROOT_ENDPOINT}/login`;
const REGISTER_ENDPOINT = `${ROOT_ENDPOINT}/users`;
const PROFILE_ENDPOINT = `${ROOT_ENDPOINT}/me`;
const TASKS_ENDPOINT = `${ROOT_ENDPOINT}/tasks`;

const INITIAL_PAGE = 'kanban';

document.addEventListener('DOMContentLoaded', () => {
  handlePageChange(INITIAL_PAGE);
});

const handlePageChange = async (pageName, ...args) => {
  const tasksPage = document.getElementById('page-tasks');
  const loginPage = document.getElementById('page-login');
  const registerPage = document.getElementById('page-register');
  const aboutPage = document.getElementById('page-about');
  const kanbanPage = document.getElementById('page-kanban');
  const ganttPage = document.getElementById('page-gantt');

  tasksPage.style.display = 'none';
  loginPage.style.display = 'none';
  registerPage.style.display = 'none';
  aboutPage.style.display = 'none';
  kanbanPage.style.display = 'none';
  ganttPage.style.display = 'none';

  // some cleanup before navigating to a new page
  const mainContainer = document.getElementById('main-container');
  mainContainer.style.overflowY = 'auto';
  window.removeEventListener('resize', ganttWindowResize);

  switch (pageName) {
    case 'tasks':
      setActiveMenu('tasks');
      loginRequired(() => navigateTasksPage(tasksPage), 'tasks');
      break;
    case 'login':
      navigateLoginPage(loginPage, args[0] || INITIAL_PAGE);
      break;
    case 'register':
      navigateRegisterPage(registerPage, args[0] || INITIAL_PAGE);
      break;
    case 'about':
      setActiveMenu('about');
      navigateAboutPage(aboutPage);
      break;
    case 'kanban':
      setActiveMenu('kanban');
      loginRequired(() => navigateKanbanPage(kanbanPage), 'kanban');
      break;
    case 'gantt':
      setActiveMenu('gantt');
      loginRequired(() => navigateGanttPage(ganttPage), 'gantt');
      break;
  }
}

/**
 * Set the active menu in the navbar based on the given menu name
 * @param {string} menu (tasks, kanban, about)
 */
const setActiveMenu = (menu) => {
  const navbarOptionTasks = document.getElementById('navbar-option-tasks');
  const navbarOptionKanban = document.getElementById('navbar-option-kanban');
  const navbarOptionGantt = document.getElementById('navbar-option-gantt');
  const navbarOptionAbout = document.getElementById('navbar-option-about');
  navbarOptionTasks.classList.remove('navbar-selected');
  navbarOptionKanban.classList.remove('navbar-selected');
  navbarOptionGantt.classList.remove('navbar-selected');
  navbarOptionAbout.classList.remove('navbar-selected');
  switch (menu) {
    case 'tasks':
      navbarOptionTasks.classList.add('navbar-selected');
      break;
    case 'kanban':
      navbarOptionKanban.classList.add('navbar-selected');
      break;
    case 'gantt':
      navbarOptionGantt.classList.add('navbar-selected');
      break;
    case 'about':
      navbarOptionAbout.classList.add('navbar-selected');
      break;
  }
}

/**
 * Wrapper function to check if user is logged in
 * If not, redirect to login page
 * If yes, call the given function fn
 * @param {function} fn (callback function) 
 * @param {string} pageName (optional, the page to redirect after login)
 }} fn 
 */
const loginRequired = async (fn, pageName=INITIAL_PAGE) => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    // if no token, redirect to login page
    handlePageChange('login', pageName);
  } else {
    const profile = await getProfile();
    if (profile) {
      // token is valid, set username in navbar and call fn
      const usernameDiv = document.getElementById('navbar-username');
      usernameDiv.classList.remove('text-gray');
      usernameDiv.innerText = profile.username;
      fn();
    } else {
      // if token is invalid / expired, redirect to login page
      handlePageChange('login', pageName);
    }
  }
}

const navigateTasksPage = (page) => {
  // render the tasks page, call getTasks to fetch all tasks
  page.style.display = 'block';
  getTasks();

  // clear all task cards, leaving only the 'Add Task' button
  const taskcardsContainer = document.getElementById('taskcards-container');
  while (taskcardsContainer.children.length > 1) {
    taskcardsContainer.removeChild(taskcardsContainer.lastChild);
  }
}

const navigateLoginPage = (page, targetPage) => {
  // change username in navbar to 'Not Logged In'
  const usernameDiv = document.getElementById('navbar-username');
  usernameDiv.classList.add('text-gray');
  usernameDiv.innerText = 'Not Logged In';

  // render the login page
  page.style.display = 'block';

  // auto-focus on the username input field
  const usernameInput = document.getElementById('login-username');
  usernameInput.focus();

  // clear the error message
  const loginError = document.getElementById('login-error');
  loginError.innerText = '';

  // handle enter key press to login
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const registerLink = document.getElementById('register-link');
      if (document.activeElement === registerLink) {
        handlePageChange('register', pageName);
      } else {
        handleLogin(targetPage);
      }
    }
  });
}

const navigateRegisterPage = (page, targetPage) => {
  page.style.display = 'block';

  // auto-focus on the username input field
  const usernameInput = document.getElementById('register-username');
  usernameInput.focus();

  // clear the error message
  const registerError = document.getElementById('register-error');
  registerError.innerText = '';

  // handle enter key press to register
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const loginLink = document.getElementById('login-link');
      if (document.activeElement === loginLink) {
        handlePageChange('login', targetPage);
      } else {
        handleRegister(targetPage);
      }
    }
  });
}

const navigateAboutPage = (page) => {
  page.style.display = 'block';
}

const navigateKanbanPage = async (page) => {
  const mainContainer = document.getElementById('main-container');
  mainContainer.style.overflowY = 'hidden';
  page.style.display = 'flex';
  createKanbanBoard();
}

const navigateGanttPage = async (page) => {
  page.style.display = 'flex';
  createGanttChart(reset=true);
}
