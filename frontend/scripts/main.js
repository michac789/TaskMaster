/**
 * Main js file, contains single page application page change logic
 */
const ROOT_ENDPOINT = 'https://taskmasterbackend.michac789.com';

document.addEventListener('DOMContentLoaded', () => {
  handlePageChange('tasks');
});

const handlePageChange = async (pageName) => {
  const tasksPage = document.getElementById('page-tasks');
  const loginPage = document.getElementById('page-login');
  const registerPage = document.getElementById('page-register');
  const aboutPage = document.getElementById('page-about');
  tasksPage.style.display = 'none';
  loginPage.style.display = 'none';
  registerPage.style.display = 'none';
  aboutPage.style.display = 'none';
  switch (pageName) {
    case 'tasks':
      // if no token or invalid token, redirect to login page
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const { username } = await getProfile();
        if (username) {
          resetTaskPage(username);
          tasksPage.style.display = 'block';
          getTasks();
        } else {
          handlePageChange('login');
        }
      } else {
        handlePageChange('login');
      }
      break;
    case 'login':
      loginPage.style.display = 'block';
      resetLoginPage();
      break;
    case 'register':
      registerPage.style.display = 'block';
      resetRegisterPage();
      break;
    case 'about':
      aboutPage.style.display = 'block';
      resetAboutPage();
      break;
  }
}

const getProfile = async () => {
  try {
    // call api to get user profile
    const response = await fetch(PROFILE_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('jwtToken')
      }
    });
    const data = await response.json();
    if (response.status === 200) {
      return data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

const resetTaskPage = (username) => {
  // clear all task cards, leaving only the 'Add Task' button
  const taskcardsContainer = document.getElementById('taskcards-container');
  while (taskcardsContainer.children.length > 1) {
    taskcardsContainer.removeChild(taskcardsContainer.lastChild);
  }

  // handle navbar option change
  const navbarOptionTasks = document.getElementById('navbar-option-tasks');
  const navbarOptionAbout = document.getElementById('navbar-option-about');
  navbarOptionTasks.classList.add('navbar-selected');
  navbarOptionAbout.classList.remove('navbar-selected');

  // show username in the navbar
  const usernameDiv = document.getElementById('navbar-username');
  usernameDiv.classList.remove('text-gray');
  usernameDiv.innerText = username;
}

const resetLoginPage = () => {
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
        handlePageChange('register');
      } else {
        handleLogin();
      }
    }
  });

  // handle navbar option change
  const navbarOptionTasks = document.getElementById('navbar-option-tasks');
  const navbarOptionAbout = document.getElementById('navbar-option-about');
  navbarOptionTasks.classList.add('navbar-selected');
  navbarOptionAbout.classList.remove('navbar-selected');

  // username in navbar changed to 'Not Logged In'
  const usernameDiv = document.getElementById('navbar-username');
  usernameDiv.classList.add('text-gray');
  usernameDiv.innerText = 'Not Logged In';
}

const resetRegisterPage = () => {
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
        handlePageChange('login');
      } else {
        handleRegister();
      }
    }
  });
}

const resetAboutPage = () => {
  // handle navbar option change
  const navbarOptionTasks = document.getElementById('navbar-option-tasks');
  const navbarOptionAbout = document.getElementById('navbar-option-about');
  navbarOptionTasks.classList.remove('navbar-selected');
  navbarOptionAbout.classList.add('navbar-selected');
}
