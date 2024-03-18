const ROOT_ENDPOINT = 'https://backend.taskmaster.michac789.com';
const LOGIN_ENDPOINT = `${ROOT_ENDPOINT}/login`;
const REGISTER_ENDPOINT = `${ROOT_ENDPOINT}/users`;
const PROFILE_ENDPOINT = `${ROOT_ENDPOINT}/me`;
const TASKS_ENDPOINT = `${ROOT_ENDPOINT}/tasks`;

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

const handleProfileClick = async () => {
  // get the user's profile data
  const data = await getProfile();

  // if user is not logged in, hide logout and change password buttons, add text gray
  if (!data) {
    const logoutButton = document.getElementById('profile-button-logout');
    logoutButton.style.display = 'none';
    const changePasswordButton = document.getElementById('profile-button-change-password');
    changePasswordButton.style.display = 'none';

    const loginButton = document.getElementById('profile-button-login');
    loginButton.style.display = 'block';
    const registerButton = document.getElementById('profile-button-register');
    registerButton.style.display = 'block';

    const profileIdSpan = document.getElementById('modal-profile-id');
    profileIdSpan.innerText = 'Not logged in';
    profileIdSpan.classList.add('text-gray');
    const profileUsernameSpan = document.getElementById('modal-profile-username');
    profileUsernameSpan.innerText = 'Not logged in';
    profileUsernameSpan.classList.add('text-gray');
  }

  // if logged in, display id and username, hide login and register buttons
  else {
    const profileIdSpan = document.getElementById('modal-profile-id');
    profileIdSpan.innerText = data.id;
    profileIdSpan.classList.remove('text-gray');
    const profileUsernameSpan = document.getElementById('modal-profile-username');
    profileUsernameSpan.innerText = data.username;
    profileUsernameSpan.classList.remove('text-gray');

    const loginButton = document.getElementById('profile-button-login');
    loginButton.style.display = 'none';
    const registerButton = document.getElementById('profile-button-register');
    registerButton.style.display = 'none';

    const changePasswordButton = document.getElementById('profile-button-change-password');
    changePasswordButton.style.display = 'block';
    const logoutButton = document.getElementById('profile-button-logout');
    logoutButton.style.display = 'block';
  }

  // open profile modal
  const profileModal = document.getElementById('modal-profile');
  profileModal.style.visibility = 'visible';
}

const closeProfileModal = () => {
  const profileModal = document.getElementById('modal-profile');
  profileModal.style.visibility = 'hidden';
}

const handleLogin = async () => {
  try {
    // get the input values (username and password)
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const data = { username, password };
    
    // call api to login with the given data
    const response = await fetch(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();

    // if successful, save the token to local storage and redirect to tasks page
    if (response.status === 200) {
      localStorage.setItem('jwtToken', responseData.token);
      handlePageChange('tasks');
    } else {

      // if unsuccessful, display the error message
      const error = await responseData['error']
      const errorDiv = document.getElementById('login-error');
      errorDiv.innerText = `Error: ${error}`;
    }
  } catch (error) {
    window.alert('Something went wrong. Please try again.');
  }
}

const handleRegister = async () => {
  try {
    // get the input values (username, email, and password)
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirmation = document.getElementById('register-password-confirm').value;
    const data = { username, password };

    // validate password and password confirmation match
    if (password !== passwordConfirmation) {
      const errorDiv = document.getElementById('register-error');
      errorDiv.innerText = 'Error: passwords do not match';
      return;
    }

    // call api to register with the given data
    const response = await fetch(REGISTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();

    // if successful, redirect to login page, else display the error message
    if (response.status === 201) {
      handlePageChange('login');
    } else {
      const error = await responseData['error']
      const errorDiv = document.getElementById('register-error');
      errorDiv.innerText = `Error: ${error}`;
    }
  }
  catch (error) {
    window.alert('Something went wrong. Please try again.');
  }
}

const handleLogout = () => {
  // close profile modal if open
  closeProfileModal();

  // remove the token from local storage and redirect to login page
  localStorage.removeItem('jwtToken');
  handlePageChange('login');
}

const handleLoginRedirect = () => {
  closeProfileModal();
  handlePageChange('login');
}

const handleRegisterRedirect = () => {
  closeProfileModal();
  handlePageChange('register');
}

const openChangePasswordModal = () => {
  // close profile modal, open change password modal
  closeProfileModal();
  const changePasswordModal = document.getElementById('modal-change-password');
  changePasswordModal.style.visibility = 'visible';
}

const closeChangePasswordModal = () => {
  const changePasswordModal = document.getElementById('modal-change-password');
  changePasswordModal.style.visibility = 'hidden';
}

const changePassword = async () => {
  // get the input values
  const currentPassword = document.getElementById('change-password-current').value;
  const newPassword = document.getElementById('change-password-new').value;
  const newPasswordConfirm = document.getElementById('change-password-confirm').value;
  const data = { current_password: currentPassword, new_password: newPassword };

  // validate new password and new password confirmation match
  if (newPassword !== newPasswordConfirm) {
    const errorDiv = document.getElementById('change-password-error');
    errorDiv.innerText = 'Error: new passwords do not match';
    return;
  }

  // call api to change password with the given data
  try {
    const response = await fetch(PROFILE_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('jwtToken')
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();

    // if successful, close change password modal, else display the error message
    if (response.status === 200) {
      closeChangePasswordModal();
    } else {
      const error = await responseData['error']
      const errorDiv = document.getElementById('change-password-error');
      errorDiv.innerText = `Error: ${error}`;
    }
  } catch (error) {
    window.alert('Something went wrong. Please try again.');
  }
}

const sanitizeInput = (input) => {
  const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return input.replace(reg, (match)=>(map[match]));
}

/**
 * Utility function to create read mode task card
 * @param {Object} task - task object with id, title, description, due_date, status
 * @returns {HTMLElement} - the task card div element
 */
const createReadableTaskCard = (task) => {
  const title = sanitizeInput(task.title);
  const description = sanitizeInput(task.description);
  const dueDate = sanitizeInput(task.due_date);
  const status = sanitizeInput(task.status);

  const taskcardContainer = document.createElement('div');
  taskcardContainer.classList.add('taskcard-container');
  taskcardContainer.id = `taskcard-${task.id}`;
  taskcardContainer.innerHTML = `
    <div class="taskcard-header">
      <div class="typography-title2">
        ${title}
      </div>
      <div class="typography-subtitle taskcard-badge
        ${status === 'Completed' ? 'bg-success' :
        status === 'In Progress' ? 'bg-primary' : 'bg-warning'}
      ">
        ${status.toUpperCase()}
      </div>
    </div>
    <div class="typography-overline">
      Due date: ${dueDate}
    </div>
    <div class="typography-body">
      ${description}
    </div>
    <div class="taskcard-actions">
      <button class="typography-button button-outline-danger button-sm"
          onclick="confirmDeleteTask(${task.id}, '${title}')">
        Delete
      </button>
      <button class="typography-button button-fill-primary button-sm"
          onclick="editTaskCard(${task.id}, '${title}', '${description}', '${dueDate}', '${status}')">
        Edit
      </button>
    </div>
  `;
  return taskcardContainer;
}

/**
 * Utility function to create edit mode task card
 * @param {Object} task - task object with id, title, description, due_date, status
 * @returns {HTMLElement} - the task card div element
 */
const createEditableTaskCard = (task, divId, title) => {
  const taskcardContainer = document.createElement('div');
  taskcardContainer.classList.add('taskcard-container');
  taskcardContainer.classList.add('taskcard-editable-identifier')
  taskcardContainer.id = divId;
  taskcardContainer.innerHTML = `
    <div class="typography-title2">
      ${title}
    </div>
    <input id="input-title" class="input-standard typography-body"
      type="text" placeholder="Enter title" value="${task.title}" />
    <textarea id="input-description" class="input-standard typography-body"
      type="text" placeholder="Enter description"
      rows="3">${task.description}</textarea>
    <div class="input-grid-row">
      <input id="input-duedate" class="input-standard typography-body"
        type="text" placeholder="Enter due date" value="${task.due_date}"
        onfocus="(this.type='date')" onblur="(this.type='text')" />
      <div class="input-select-wrapper">
        <label for="input-status" class="typography-subtitle">
          Status:
        </label>
        <select id="input-status" class="input-standard typography-body select-status">
          <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>TO DO</option>
          <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>IN PROGRESS</option>
          <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>COMPLETED</option>
        </select>
      </div>
    </div>
    <div class="typography-error" id="task-editable-error"></div>
  `;
  return taskcardContainer;
}

const getTasks = async () => {
  try {
    // fetch all tasks
    const response = await fetch(TASKS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('jwtToken')
      }
    });
    const data = await response.json();

    // render each task as a task card
    const taskcardsContainer = document.getElementById('taskcards-container');
    data.forEach(task => {
      const taskcardContainer = createReadableTaskCard(task);
      taskcardsContainer.appendChild(taskcardContainer);
    })
  } catch (error) {
    window.alert('Something went wrong. Please try again.');
  }
}

const addTaskCard = () => {
  // if there is another task in edit / create mode, show unsaved changes modal
  const editableTaskcard = document.querySelector('.taskcard-editable-identifier');
  if (editableTaskcard) {
    openUnsavedChangesModal(createTask);
    return;
  }

  // create a new task card
  const createTaskcardContainer = createEditableTaskCard({
    title: '',
    description: '',
    due_date: '',
    status: 'To Do'
  }, 'taskcard-create', 'Creating New Task...');
  const actionWrapper = document.createElement('div');
  actionWrapper.classList.add('taskcard-actions');
  actionWrapper.innerHTML = `
    <button class="typography-button button-outline-danger button-sm"
        id="button-editable-cancel"
        onclick="cancelCreateTask()">
      Cancel
    </button>
    <button class="typography-button button-fill-primary button-sm"
        onclick="createTask()">
      Create
    </button>
  `;
  createTaskcardContainer.appendChild(actionWrapper);

  // render the new task card
  const taskcardsContainer = document.getElementById('taskcards-container');
  if (taskcardsContainer.children.length > 1) {
    const firstTaskCard = taskcardsContainer.children[1];
    taskcardsContainer.insertBefore(createTaskcardContainer, firstTaskCard);
  } else {
    taskcardsContainer.appendChild(createTaskcardContainer);
  }

  // make the 'Add Task' button disappear
  const addTaskButton = document.getElementById('add-task-button');
  addTaskButton.style.display = 'none';
}

const cancelCreateTask = () => {
  // remove the create task card
  const createCardDiv = document.getElementById('taskcard-create');
  createCardDiv.remove();

  // make the 'Add Task' button reappear
  const addTaskButton = document.getElementById('add-task-button');
  addTaskButton.style.display = 'block';
}

const createTask = async () => {
  // get the input values
  const title = document.getElementById('input-title').value;
  const description = document.getElementById('input-description').value;
  const date = document.getElementById('input-duedate').value;
  const status = document.getElementById('input-status').value;
  const data = { title, description, due_date: date, status };

  try {
    // call api to create a new task with the given data
    response = await fetch(TASKS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('jwtToken')
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();

    // display error message if unsuccessful
    if (response.status !== 201) {
      const errorDiv = document.getElementById('task-editable-error');
      errorDiv.innerText = `Error: ${responseData['error']}`
      return;
    }
    
    // append the new task card to the task cards container
    data['id'] = responseData['id'];
    const taskcardsContainer = document.getElementById('taskcards-container');
    const taskcardContainer = createReadableTaskCard(data);
    taskcardsContainer.appendChild(taskcardContainer);
    cancelCreateTask();
  }
  catch (error) {
    window.alert('Something went wrong. Please try again.');
  }
}

const confirmDeleteTask = (id, title) => {
  // if there is another task in edit / create mode, show unsaved changes modal
  const editableTaskcard = document.querySelector('.taskcard-editable-identifier');
  if (editableTaskcard) {
    openUnsavedChangesModal(() => {
      confirmDeleteTask(id, title);
    });
    return;
  }

  // open delete confirmation modal
  const modalBackdrop = document.getElementById('modal-delete') 
  modalBackdrop.style.visibility = 'visible';

  // render task title in the modal
  const deleteTitleSpan = document.getElementById('delete-task-title');
  deleteTitleSpan.innerText = title;

  // set the delete button to delete the task with the given id
  const deleteButton = document.getElementById('delete-task-button');
  deleteButton.onclick = () => deleteTask(id);
}

const cancelDeleteTask = () => {
  // close delete confirmation modal
  const modalBackdrop = document.getElementById('modal-delete') 
  modalBackdrop.style.visibility = 'hidden';
}

const deleteTask = async (id) => {
  try {
    // call api to delete task with the given id
    await fetch(`${TASKS_ENDPOINT}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('jwtToken')
      }
    });

    // remove the task card from the task cards container
    const taskcardContainer = document.getElementById(`taskcard-${id}`);
    taskcardContainer.remove();

    // close delete confirmation modal
    cancelDeleteTask();
  }
  catch (error) {
    window.alert('Something went wrong. Please try again.');
  }
}

const editTaskCard = (id, title, description, date, status) => {
  // sanitize input values
  const sanitizedTitle = sanitizeInput(title);
  const sanitizedDescription = sanitizeInput(description);
  const sanitizedDate = sanitizeInput(date);
  const sanitizedStatus = sanitizeInput(status);

  // if there is another task in edit / create mode, show unsaved changes modal
  const editableTaskcard = document.querySelector('.taskcard-editable-identifier');
  if (editableTaskcard) {
    openUnsavedChangesModal(() => {
      editTaskCard(id, title, description, date, status);
    });
    return;
  }

  // create an editable task card with the given data
  const editableTaskcardContainer = createEditableTaskCard({
    title, sanitizedDescription, due_date: sanitizedDate, sanitizedStatus
  }, `taskcard-edit-${id}`, 'Edit Task');
  const actionWrapper = document.createElement('div');
  actionWrapper.classList.add('taskcard-actions');
  actionWrapper.innerHTML = `
    <button class="typography-button button-outline-danger button-sm"
        id="button-editable-cancel"
        onclick="cancelEditTask(${id}, '${sanitizedTitle}', '${sanitizedDescription}', '${sanitizedDate}', '${sanitizedStatus}')">
      Cancel
    </button>
    <button class="typography-button button-fill-primary button-sm"
        onclick="updateTask(${id})">
      Update
    </button>
  `;
  editableTaskcardContainer.appendChild(actionWrapper);

  // replace the read mode task card with the editable task card
  const taskcardContainer = document.getElementById(`taskcard-${id}`);
  taskcardContainer.replaceWith(editableTaskcardContainer);
}

const cancelEditTask = (id, title, description, date, status) => {
  // create a readable task card with the given data
  const readableTaskcardContainer = createReadableTaskCard({
    id, title, description, due_date: date, status
  });

  // replace the editable task card with the read mode task card
  const taskcardContainer = document.getElementById(`taskcard-edit-${id}`);
  taskcardContainer.replaceWith(readableTaskcardContainer);
}

const updateTask = async (id) => {
  // get the input values
  const title = document.getElementById('input-title').value;
  const description = document.getElementById('input-description').value;
  const date = document.getElementById('input-duedate').value;
  const status = document.getElementById('input-status').value;
  const data = { title, description, due_date: date, status };

  try {
    // call api to update the task with the given data
    const response = await fetch(`${TASKS_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('jwtToken')
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();

    // display error message if unsuccessful
    if (response.status !== 200) {
      const errorDiv = document.getElementById('task-editable-error');
      errorDiv.innerText = `Error: ${responseData['error']}`
      return;
    }

    // replace the editable task card with the read mode task card
    const taskcardContainer = document.getElementById(`taskcard-edit-${id}`);
    const taskcard = createReadableTaskCard({ id, title, description, due_date: date, status });
    taskcardContainer.replaceWith(taskcard);
  }
  catch (error) {
    window.alert('Something went wrong. Please try again.');
  }
}

const openUnsavedChangesModal = (fn) => {
  // open unsaved changes modal
  const modalBackdrop = document.getElementById('modal-unsaved-changes');
  modalBackdrop.style.visibility = 'visible';

  // set the discard button to call the given function
  const discardButton = document.getElementById('button-discard-changes');
  discardButton.addEventListener('click', () => {
    closeUnsavedChangesModal();
    const cancelButton = document.getElementById('button-editable-cancel');
    cancelButton.click();
    fn();
  });
}

const backToEditing = () => {
  // close unsaved changes modal
  closeUnsavedChangesModal();

  // scroll to the editable task card
  const editableTaskcard = document.querySelector('.taskcard-editable-identifier');
  editableTaskcard.scrollIntoView({ behavior: 'smooth' });
}

const closeUnsavedChangesModal = () => {
  // close unsaved changes modal
  const modalBackdrop = document.getElementById('modal-unsaved-changes');
  modalBackdrop.style.visibility = 'hidden';
}

const handleLogoClick = () => {
  // open source code (GitHub) in a new tab
  const GITHUB_LINK = 'https://github.com/michac789/TaskMaster';
  window.open(GITHUB_LINK, '_blank');
}
