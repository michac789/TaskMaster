/**
 * All js functions related to 'My Tasks' page
 */

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
  const dayDiff = Math.floor((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24)) + 1;

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
      ${dayDiff < 0 ? '<span style="color: #db4634;">(Overdue)</span>' : ''}
      ${dayDiff === 0 ? '<span style="color: #c5802e;">(Due today)</span>' : ''}
      ${dayDiff === 1 ? '<span style="color: #c5802e;">(Due tomorrow)</span>' : ''}
      ${dayDiff <= 7 && dayDiff >= 2 ? `<span style="color: #c5802e;">(Due in ${dayDiff} days)</span>` : ''}
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

    // render empty state if there is no task
    if (data.length === 0) {
      const emptyState = document.getElementById('task-empty');
      emptyState.style.visibility = 'visible';
    }
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
  const requestBody = { title, description, due_date: date, status };

  const { data, responseStatus } = await TaskAPI.createTask(...Object.values(requestBody));

  // display error message if unsuccessful
  if (responseStatus !== 201) {
    const errorDiv = document.getElementById('task-editable-error');
    errorDiv.innerText = `Error: ${data['error']}`
    return;
  }
    
  // append the new task card (at the top, below the 'Add Task' button)
  requestBody['id'] = data['id'];
  const taskcardsContainer = document.getElementById('taskcards-container');
  const taskcardContainer = createReadableTaskCard(requestBody);
  if (taskcardsContainer.children.length > 1) {
    const firstChild = taskcardsContainer.children[1];
    taskcardsContainer.insertBefore(taskcardContainer, firstChild.nextSibling);
  } else {
    taskcardsContainer.appendChild(taskcardContainer);
  }
  cancelCreateTask();

  // remove empty state (if present)
  const emptyState = document.getElementById('task-empty');
  emptyState.style.visibility = 'hidden';
  window.alert('Task created successfully.');
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
  // call api to delete the task with the given id
  await TaskAPI.deleteTask(id);

  // remove the task card from the task cards container
  const taskcardContainer = document.getElementById(`taskcard-${id}`);
  taskcardContainer.remove();

  // if no task card left, show empty state
  const taskcardsContainer = document.getElementById('taskcards-container');
  if (taskcardsContainer.children.length === 1) {
    const emptyState = document.getElementById('task-empty');
    emptyState.style.visibility = 'visible';
  }

  // close delete confirmation modal
  cancelDeleteTask();
  window.alert('Task deleted successfully.');
}

const editTaskCard = (id, title, description, date, status) => {
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
    title, description, due_date: date, status
  }, `taskcard-edit-${id}`, 'Edit Task');
  const actionWrapper = document.createElement('div');
  actionWrapper.classList.add('taskcard-actions');
  actionWrapper.innerHTML = `
    <button class="typography-button button-outline-danger button-sm"
        id="button-editable-cancel"
        onclick="cancelEditTask(${id}, '${title}', '${description}', '${date}', '${status}')">
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

  // call api to update the task with the given data
  const requestBody = { id, title, description, due_date: date, status };
  const { data, responseStatus } = await TaskAPI.editTask(...Object.values(requestBody));

  // display error message if unsuccessful
  if (responseStatus !== 200) {
    const errorDiv = document.getElementById('task-editable-error');
    errorDiv.innerText = `Error: ${data['error']}`
    return;
  }

  // replace the editable task card with the read mode task card
  const taskcardContainer = document.getElementById(`taskcard-edit-${id}`);
  const taskcard = createReadableTaskCard({ id, title, description, due_date: date, status });
  taskcardContainer.replaceWith(taskcard);
  window.alert('Task updated successfully.');
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
