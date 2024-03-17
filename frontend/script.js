const ROOT_ENDPOINT = 'https://backend.taskmaster.michac789.com';
// TODO - remove this token later, create real authentication
const temp_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3MTA3NDg2MDN9.3ohsdxrWx_mZ_q-UErEcs6R6iR2sPgH3IU8iyCZzzW0';

const ALL_TASKS_ENDPOINT = `${ROOT_ENDPOINT}/tasks`;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded with JavaScript!')
  getTasks();
});

/**
 * Utility function to create a task card
 * @param {Object} task - task object with title, description, due_date, status
 * @returns {HTMLElement} - the task card div element
 */
const createTaskCard = (task) => {
  const taskcardContainer = document.createElement('div');
  taskcardContainer.classList.add('taskcard-container');
  taskcardContainer.innerHTML = `
    <div class="taskcard-header">
      <div class="typography-title2">
        ${task.title}
      </div>
      <div class="typography-subtitle taskcard-badge
        ${task.status === 'Completed' ? 'bg-success' :
        task.status === 'In Progress' ? 'bg-primary' : 'bg-warning'}
      ">
        ${task.status.toUpperCase()}
      </div>
    </div>
    <div class="typography-overline">
      Due date: ${task.due_date}
    </div>
    <div class="typography-body">
      ${task.description}
    </div>
    <div class="taskcard-actions">
      <button class="typography-button button-secondary button-width-small">
        Delete
      </button>
      <button class="typography-button button-primary button-width-small">
        Edit
      </button>
    </div>
  `;
  return taskcardContainer;
}

const getTasks = async () => {
  try {
    // fetch all tasks
    const response = await fetch(ALL_TASKS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': temp_token
      }
    });
    const data = await response.json();

    // render each task as a task card
    const taskcardsContainer = document.getElementById('taskcards-container');
    data.forEach(task => {
      const taskcardContainer = createTaskCard(task);
      taskcardsContainer.appendChild(taskcardContainer);
    })
  } catch (error) {
    console.error('Error fetching tasks:', error); // TODO - handle error
  }
}

const addTaskCard = () => {
  // create a new task card
  const createTaskcardContainer = document.createElement('div');
  createTaskcardContainer.classList.add('taskcard-container');
  createTaskcardContainer.id = 'taskcard-create';
  createTaskcardContainer.innerHTML = `
    <div class="typography-title2">
      New Task - TODO
    </div>
    <input id="input-title" type="text" placeholder="Title" />
    <input id="input-description" type="text" placeholder="Description" />
    <input id="input-duedate" type="date" />
    <select id="input-status">
      <option value="To Do">TO DO</option>
      <option value="In Progress">IN PROGRESS</option>
      <option value="Completed">COMPLETED</option>
    </select>
    <div class="taskcard-actions">
      <button class="typography-button button-secondary button-width-small"
          onclick="cancelCreateTask()">
        Cancel
      </button>
      <button class="typography-button button-primary button-width-small"
          onclick="createTask()">
        Create
      </button>
    </div>
  `;

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
  const due_date = document.getElementById('input-duedate').value;
  const status = document.getElementById('input-status').value;
  const data = { title, description, due_date, status };

  try {
    // post request to create a new task
    await fetch(ALL_TASKS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': temp_token
      },
      body: JSON.stringify(data)
    });

    // append the new task card to the task cards container
    const taskcardsContainer = document.getElementById('taskcards-container');
    const taskcardContainer = createTaskCard(data);
    taskcardsContainer.appendChild(taskcardContainer);
    // TODO - handle date format conversion!
    // TODO - handle order of tasks! (try to make new one appear on top)

    // remove the create task card and make the 'Add Task' button reappear
    cancelCreateTask();
  }
  catch (error) {
    console.error('Error creating task:', error); // TODO - handle error
  }
}
