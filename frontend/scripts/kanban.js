
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
      return data;
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
  }

  async init() {
    const tasks = await TaskAPI.getTasks();
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
    this.render();
  }

  getGapComponent(pos, index) {
    const gap = document.createElement('div');
    gap.className = 'kanban-gap';
    gap.style.backgroundColor = 'lightblue';
    gap.style.width = '100%';
    gap.style.minHeight = '8px';
    gap.classList.add('kanban-gap');
    gap.id = `kanban-gap-${pos}-${index}`;
    return gap;
  }

  render() {
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

    this.leftColDiv.innerHTML = '';
    this.middleColDiv.innerHTML = '';
    this.rightColDiv.innerHTML = '';
    this.leftColDiv.appendChild(this.getGapComponent('left', 0));
    this.leftCol.forEach((kanbanItem, index) => {
      this.leftColDiv.appendChild(kanbanItem.getElement('left', index + 1));
      this.leftColDiv.appendChild(this.getGapComponent('left', index + 1));
    });
    this.middleColDiv.appendChild(this.getGapComponent('middle', 0));
    this.middleCol.forEach((kanbanItem, index) => {
      this.middleColDiv.appendChild(kanbanItem.getElement('middle', index + 1));
      this.middleColDiv.appendChild(this.getGapComponent('middle', index + 1));
    });
    this.rightColDiv.appendChild(this.getGapComponent('right', 0));
    this.rightCol.forEach((kanbanItem, index) => {
      this.rightColDiv.appendChild(kanbanItem.getElement('right', index + 1));
      this.rightColDiv.appendChild(this.getGapComponent('right', index + 1));
    });
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

  getElement() {
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
        <button class="typography-button button-outline-danger button-sm"
            onclick="confirmDeleteTask(${this.id}, '${this.title}')">
          Delete
        </button>
        <button class="typography-button button-fill-primary button-sm"
            onclick="editTaskCard(${this.id}, '${this.title}', '${this.description}', '${this.dueDate}', '${this.status}')">
          Edit
        </button>
      </div>
    `;
    this.element = kanbanItem;
    this.createDraggable();
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
      e.preventDefault();
      const { left, top, height, width } = el.getBoundingClientRect();

      // create a temporary div to hold the space
      const newDiv = document.createElement('div');
      newDiv.id='kanban-temporary';
      newDiv.style.minHeight = `${height}px`
      newDiv.style.width = '100px';
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

      // TODO - check if the element is within the boundaries of the kanban gap
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
          gap.style.backgroundColor = 'green';
        } else {
          gap.style.backgroundColor = 'lightblue';
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

        if (
          cursorX >= gapX &&
          cursorX <= gapX + gapWidth &&
          cursorY >= gapY - BUFFER_Y &&
          cursorY <= gapY + gapHeight + BUFFER_Y
        ) {
          const [_, __, targetPos, targetIndex] = gap.id.split('-');
          board.modifyPosition(initialPos, initialIndex, targetPos, targetIndex);
          // move the element to the new position
          // gap.insertAdjacentElement('beforebegin', el);
          return;
        }
      }

      // go back to original position, remove temporary div
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
}

const createKanbanBoard = () => {
  const kanbanBoard = new KanbanBoard();
  kanbanBoard.init();
}
