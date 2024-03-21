
class TaskAPI {
  static async getTasks() {
    try {
      const response = await fetch(`${TASKS_ENDPOINT}?format=per_status`, {
        method: 'GET',
        headers: {
          'Authorization': localStorage.getItem('jwtToken')
        }
      });
      const data = await response.json();
      return {data, responseStatus: response.status};
    } catch {
      window.alert('Something went wrong. Please try again later.');
    }
  }

  static async editTask(taskId, title, description, dueDate) {
    try {
      const response = await fetch(`${TASKS_ENDPOINT}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('jwtToken')
        },
        body: JSON.stringify({
          title,
          description,
          due_date: dueDate
        })
      });
      const data = await response.json();
      return {data, responseStatus: response.status};
    } catch {
      window.alert('Something went wrong. Please try again later.');
    }
  }

  static async deleteTask(taskId) {
    try {
      const response = await fetch(`${TASKS_ENDPOINT}/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': localStorage.getItem('jwtToken')
        }
      });
      return {data: {}, responseStatus: response.status};
    } catch {
      window.alert('Something went wrong. Please try again later.');
    }
  }

  static async createTask(title, description, dueDate, status) {
    try {
      const response = await fetch(`${TASKS_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('jwtToken')
        },
        body: JSON.stringify({
          title,
          description,
          due_date: dueDate,
          status
        })
      });
      const data = await response.json();
      return {data, responseStatus: response.status};
    } catch {
      window.alert('Something went wrong. Please try again later.');
    }
  }
}

class KanbanBoard {
  constructor() {
    this.leftColDiv = document.getElementById('kanban-left');
    this.middleColDiv = document.getElementById('kanban-middle');
    this.rightColDiv = document.getElementById('kanban-right');
    this.leftCol = []
    this.middleCol = []
    this.rightCol = []
    this.isEditMode = false;
  }

  async init() {
    const {data: tasks} = await TaskAPI.getTasks();
    this.leftCol = tasks['To Do'].map((task) => {
      return new KanbanItem(this, task);
    });
    this.middleCol = tasks['In Progress'].map((task) => {
      return new KanbanItem(this, task);
    });
    this.rightCol = tasks['Completed'].map((task) => {
      return new KanbanItem(this, task);
    });
    this.render();
  }

  modifyPosition(initialPos, initialIndex, targetPos, targetIndex) {
    if (initialPos === targetPos) {
      if (initialIndex === targetIndex || initialIndex === targetIndex - 1) {
        this.render();
        return;
      }
    }
    
    let initialItem = null;
    if (initialPos === 'left') {
      initialItem = this.leftCol.splice(initialIndex, 1)[0];
    } else if (initialPos === 'middle') {
      initialItem = this.middleCol.splice(initialIndex, 1)[0];
    } else if (initialPos === 'right') {
      initialItem = this.rightCol.splice(initialIndex, 1)[0];
    }
    
    const itemId = initialItem.id;
    if (initialPos === targetPos && initialIndex < targetIndex) {
      targetIndex -= 1;
    }

    if (targetPos === 'left') {
      this.leftCol.splice(targetIndex, 0, initialItem);
    } else if (targetPos === 'middle') {
      this.middleCol.splice(targetIndex, 0, initialItem);
    } else if (targetPos === 'right') {
      this.rightCol.splice(targetIndex, 0, initialItem);
    }

    this.render(itemId, initialPos, initialIndex);
  }

  getGapComponent(pos, index) {
    const gap = document.createElement('div');
    gap.classList.add('kanban-gap');
    gap.id = `kanban-gap-${pos}-${index}`;
    return gap;
  }

  getCreateTaskButton(status) {
    const createTaskButton = document.createElement('button');
    createTaskButton.classList.add('typography-button', 'button-fill-primary', 'button-sm-long');
    createTaskButton.id = `create-task-${status}`
    createTaskButton.innerText = 'Create Task ';
    createTaskButton.innerHTML += '<i class="ri-add-line"></i>';
    createTaskButton.onclick = this.handleCreate.bind(this, status);
    return createTaskButton;
  }

  render(itemId=null, initialPos=null, initialIndex=null) {
    KanbanBoard.enableDraggingHover();

    this.leftCol.forEach((kanbanItem, index) => {
      kanbanItem.itemIndex = index;
      kanbanItem.itemPos = 'left';
    });
    this.middleCol.forEach((kanbanItem, index) => {
      kanbanItem.itemIndex = index;
      kanbanItem.itemPos = 'middle';
    });
    this.rightCol.forEach((kanbanItem, index) => {
      kanbanItem.itemIndex = index;
      kanbanItem.itemPos = 'right';
    });

    // temporary div to shrink the item that was moved
    let item = document.getElementById(`kanban-item-${itemId}`);
    let shrinkDiv = document.createElement('div');
    if (item) {
      const itemHeight = item.getBoundingClientRect().height;
      shrinkDiv.style.height = `${itemHeight}px`;
      shrinkDiv.style.width = '100%';
      shrinkDiv.style.transition = 'height 0.3s';
    }

    this.leftColDiv.innerHTML = '';
    this.middleColDiv.innerHTML = '';
    this.rightColDiv.innerHTML = '';
    this.leftColDiv.appendChild(this.getCreateTaskButton('To Do'));
    this.leftColDiv.appendChild(this.getGapComponent('left', 0));
    this.leftCol.forEach((kanbanItem, index) => {
      if (initialPos === 'left' && initialIndex === index) {
        this.leftColDiv.appendChild(shrinkDiv);
      }
      this.leftColDiv.appendChild(kanbanItem.getReadableElement('left', index + 1));
      this.leftColDiv.appendChild(this.getGapComponent('left', index + 1));
    });
    this.middleColDiv.appendChild(this.getCreateTaskButton('In Progress'));
    this.middleColDiv.appendChild(this.getGapComponent('middle', 0));
    this.middleCol.forEach((kanbanItem, index) => {
      if (initialPos === 'middle' && initialIndex === index) {
        this.middleColDiv.appendChild(shrinkDiv);
      }
      this.middleColDiv.appendChild(kanbanItem.getReadableElement('middle', index + 1));
      this.middleColDiv.appendChild(this.getGapComponent('middle', index + 1));
    });
    this.rightColDiv.appendChild(this.getCreateTaskButton('Completed'));
    this.rightColDiv.appendChild(this.getGapComponent('right', 0));
    this.rightCol.forEach((kanbanItem, index) => {
      if (initialPos === 'right' && initialIndex === index) {
        this.rightColDiv.appendChild(shrinkDiv);
      }
      this.rightColDiv.appendChild(kanbanItem.getReadableElement('right', index + 1));
      this.rightColDiv.appendChild(this.getGapComponent('right', index + 1));
    });

    // expand & collapse animation for the item that was moved
    item = document.getElementById(`kanban-item-${itemId}`);
    if (item) {
      item.style.maxHeight = '100px';
      setTimeout(() => {
        item.style.maxHeight = '1000px';
        shrinkDiv.style.height = '0px';
        setTimeout(() => {
          shrinkDiv.remove();
        }, 300);
      }, 10);
    }
  }
  
  handleCreate(status) {
    // alert if edit mode is on
    if (this.isEditMode) {
      window.alert('You have unsaved changes. Please save or cancel the changes before performing another action.');
      return;
    }

    // render empty task card
    this.isEditMode = true;
    KanbanBoard.disableDraggingHover();
    const button = document.getElementById(`create-task-${status}`);
    button.insertAdjacentHTML('beforebegin', `
      <div class="taskcard-container kanban-item">
        <div class="typography-title2">
          New Task (Status: ${status})
        </div>
        <input id="input-title" class="input-standard typography-body"
          type="text" placeholder="Enter title" />
        <textarea id="input-description" class="input-standard typography-body"
          type="text" placeholder="Enter description"
          rows="3"></textarea>
        <div>
          <label for="input-duedate" class="typography-body">Due date:</label>
          <input id="input-duedate" class="input-standard typography-body"
            type="text" placeholder="Enter due date"
            onfocus="(this.type='date')" onblur="(this.type='text')" />
        </div>
        <div class="typography-error" id="task-editable-error"></div>
        <div class="taskcard-actions">
          <button class="typography-button button-outline-danger button-sm
              cancel-create-button">
            Cancel
          </button>
          <button class="typography-button button-fill-primary button-sm
              confirm-create-button">
            Create
          </button>
        </div>
      </div>
    `);
    button.style.display = 'none';
    const cancelCreateButton = document.querySelector('.cancel-create-button');
    const confirmCreateButton = document.querySelector('.confirm-create-button');
    cancelCreateButton.addEventListener('click', this.handleCancelCreate.bind(this));
    confirmCreateButton.addEventListener('click', this.handleConfirmCreate.bind(this, status));
  }

  handleCancelCreate() {
    this.isEditMode = false;
    this.render();
  }

  async handleConfirmCreate(status) {
    // get the values from the input fields
    const title = document.getElementById('input-title').value;
    const description = document.getElementById('input-description').value;
    const dueDate = document.getElementById('input-duedate').value;

    // call api to create the task, if error show the error message
    const {data, responseStatus} = await TaskAPI.createTask(title, description, dueDate, status);
    if (responseStatus !== 201) {
      const errorDiv = document.getElementById('task-editable-error');
      errorDiv.innerHTML = `Error: ${data.error}`;
      return;
    }

    // update the task and render the board if successful
    this.isEditMode = false;
    this.init();
  }

  static disableDraggingHover() {
    const cards = document.querySelectorAll('.kanban-item');
    for (const card of cards) {
      card.style.cursor = 'not-allowed';
    }
  }
  static enableDraggingHover() {
    const cards = document.querySelectorAll('.kanban-item');
    for (const card of cards) {
      card.style.cursor = 'grab';
    }
  }
}

class KanbanItem {
  constructor(board, task, pos='left', index=0) {
    const { id, title, description, due_date: dueDate, status } = task;
    this.board = board;
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.status = status;
    this.element = null;
    this.itemPos = pos;
    this.itemIndex = index;
  }

  getReadableElement() {
    const kanbanItem = document.createElement('div');
    kanbanItem.classList.add('taskcard-container', 'kanban-item');
    kanbanItem.id = `kanban-item-${this.id}`;
    kanbanItem.innerHTML = `
      <div class="taskcard-header">
        <div class="typography-subtitle">
          ${this.title}
        </div>
      </div>
      <div class="typography-overline">
        Due date: ${this.dueDate}
      </div>
      <div class="typography-body">
        ${this.description}
      </div>
      <div class="taskcard-actions">
        <button class="typography-button button-outline-danger button-sm
            delete-button">
          Delete
        </button>
        <button class="typography-button button-outline-warning button-sm
            edit-button">
          Edit
        </button>
      </div>
    `;
    this.element = kanbanItem;
    this.createDraggable();

    const deleteButton = kanbanItem.querySelector('.delete-button');
    const editButton = kanbanItem.querySelector('.edit-button');
    deleteButton.addEventListener('click', this.handleDelete.bind(this));
    editButton.addEventListener('click', this.handleEdit.bind(this));

    return kanbanItem;
  }

  createDraggable() {
    // make the kanban item draggable
    const el = this.element;
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    el.onmousedown = dragMouseDown;

    const initialPos = this.itemPos;
    const initialIndex = this.itemIndex;
    const board = this.board;

    function dragMouseDown(e) {
      // do not drag when clicking on the button or when edit mode
      if (e.target.tagName === 'BUTTON') return;
      if (board.isEditMode) return;

      // get the position of the element
      e.preventDefault();
      const { left, top, height, width } = el.getBoundingClientRect();

      // create a temporary invisible div to hold the space
      const newDiv = document.createElement('div');
      newDiv.id='kanban-temporary';
      newDiv.style.minHeight = `${height}px`
      newDiv.style.opacity = '0';
      newDiv.style.backgroundColor = 'aqua';
      el.insertAdjacentElement('afterend', newDiv);

      // mouse position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;

      // initial position relative to the viewport
      const NAVBAR_HEIGHT = 50;
      el.style.transition = "none";
      el.style.position = "fixed";
      el.style.top = top - NAVBAR_HEIGHT + "px";
      el.style.left = left + "px";
      el.style.width = `${width}px`;

      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e.preventDefault();

      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      // set the element's new position
      el.style.position = "fixed";
      el.style.top = (el.offsetTop - pos2) + "px";
      el.style.left = (el.offsetLeft - pos1) + "px";

      // check if the element is within the boundaries of the kanban gap
      // if yes, provide visual feedback to the user
      const cursorX = e.clientX;
      const cursorY = e.clientY;
      const kanbanGaps = document.querySelectorAll('.kanban-gap');
      for (const gap of kanbanGaps) {
        const gapRect = gap.getBoundingClientRect();
        const gapX = gapRect.left;
        const gapY = gapRect.top;
        const gapWidth = gapRect.width;
        const gapHeight = gapRect.height;
        const BUFFER_Y = 24;
        if (
          cursorX >= gapX &&
          cursorX <= gapX + gapWidth &&
          cursorY >= gapY - BUFFER_Y &&
          cursorY <= gapY + gapHeight + BUFFER_Y
        ) {
          // styles when hovering over the gap while dragging
          gap.style.height = '100px';
          gap.style.margin = '8px 0';
          gap.style.backgroundColor = '#d4d6da';
        } else {
          // reset styles when not hovering over the gap
          gap.style.height = '8px';
          gap.style.margin = '0';
          gap.style.backgroundColor = 'transparent';
        }
      }
    }
  
    function closeDragElement(e) {
      // get the position of the cursor
      const cursorX = e.clientX;
      const cursorY = e.clientY;

      // check if dropped element is within the boundaries of the kanban gap
      const kanbanGaps = document.querySelectorAll('.kanban-gap');
      for (const gap of kanbanGaps) {
        const gapRect = gap.getBoundingClientRect();
        const gapX = gapRect.left;
        const gapY = gapRect.top;
        const gapWidth = gapRect.width;
        const gapHeight = gapRect.height;
        const BUFFER_Y = 24;

        // move element to the new position if it is within the buffer zone
        if (
          cursorX >= gapX &&
          cursorX <= gapX + gapWidth &&
          cursorY >= gapY - BUFFER_Y &&
          cursorY <= gapY + gapHeight + BUFFER_Y
        ) {
          const [_, __, targetPos, targetIndex] = gap.id.split('-');
          board.modifyPosition(initialPos, initialIndex, targetPos, targetIndex);
          document.onmouseup = null;
          document.onmousemove = null;
          return;
        }
      }

      // if not, go back to original position, remove temporary div
      const kanbanTemporary = document.getElementById('kanban-temporary');
      if (kanbanTemporary) {
        el.style.position = "initial";
        kanbanTemporary.insertAdjacentElement('afterend', el);
        kanbanTemporary.remove();
      }

      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  handleEdit() {
    // if edit mode is on, open unsaved changes modal
    if (this.board.isEditMode) {
      window.alert('You have unsaved changes. Please save or cancel the changes before performing another action.');
      return;
    }
    
    this.board.isEditMode = true;
    KanbanBoard.disableDraggingHover();
    this.element.innerHTML = `
      <div class="typography-title2">
        ${this.title}
      </div>
      <input id="input-title" class="input-standard typography-body"
        type="text" placeholder="Enter title" value="${this.title}" />
      <textarea id="input-description" class="input-standard typography-body"
        type="text" placeholder="Enter description"
        rows="3">${this.description}</textarea>
      <div>
        <label for="input-duedate" class="typography-body">Due date:</label>
        <input id="input-duedate" class="input-standard typography-body"
          type="text" placeholder="Enter due date" value="${this.dueDate}"
          onfocus="(this.type='date')" onblur="(this.type='text')" />
      </div>
      <div class="typography-error" id="task-editable-error"></div>
      <div class="taskcard-actions">
        <button class="typography-button button-outline-danger button-sm
            cancel-button">
          Cancel
        </button>
        <button class="typography-button button-fill-primary button-sm
            save-button">
          Save
        </button>
      </div>
    `;
    const cancelButton = this.element.querySelector('.cancel-button');
    const saveButton = this.element.querySelector('.save-button');
    cancelButton.addEventListener('click', this.handleCancelEdit.bind(this));
    saveButton.addEventListener('click', this.handleSaveEdit.bind(this));
  }

  handleCancelEdit() {
    this.board.isEditMode = false;
    this.element = null;
    this.board.render();
  }

  async handleSaveEdit() {
    // get the values from the input fields
    const title = document.getElementById('input-title').value;
    const description = document.getElementById('input-description').value;
    const dueDate = document.getElementById('input-duedate').value;
    
    // call api to edit the task, if error show the error message
    const {data, responseStatus} = await TaskAPI.editTask(this.id, title, description, dueDate);
    if (responseStatus !== 200) {
      const errorDiv = document.getElementById('task-editable-error');
      errorDiv.innerHTML = data.message;
      return;
    }

    // update the task and render the board if successful
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.board.isEditMode = false;
    this.element = null;
    this.board.render();
  }

  handleDelete() {
    // if edit mode is on, open unsaved changes modal
    if (this.board.isEditMode) {
      window.alert('You have unsaved changes. Please save or cancel the changes before performing another action.');
      return;
    }

    // open delete confirmation modal
    const modalBackdrop = document.getElementById('modal-delete') 
    modalBackdrop.style.visibility = 'visible';

    // render task title in the modal
    const deleteTitleSpan = document.getElementById('delete-task-title');
    deleteTitleSpan.innerText = this.title;

    // set the delete button to delete the task with the given id
    const deleteButton = document.getElementById('delete-task-button');
    deleteButton.onclick = this.handlePerformDelete.bind(this);
  }

  async handlePerformDelete() {
    await TaskAPI.deleteTask(this.id);
    this.board.init();
    cancelDeleteTask();
  }
}

const createKanbanBoard = () => {
  const kanbanBoard = new KanbanBoard();
  kanbanBoard.init();
}
