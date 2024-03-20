
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
      return new KanbanItem(task);
    });
    this.middleCol = tasks['In Progress'].map((task) => {
      return new KanbanItem(task);
    });
    this.rightCol = tasks['Completed'].map((task) => {
      return new KanbanItem(task);
    });
    this.leftColDiv.innerHTML = '';
    this.middleColDiv.innerHTML = '';
    this.rightColDiv.innerHTML = '';
  }

  render() {
    this.leftCol.forEach((kanbanItem) => {
      this.leftColDiv.appendChild(kanbanItem.getElement());
    });
    this.middleCol.forEach((kanbanItem) => {
      this.middleColDiv.appendChild(kanbanItem.getElement());
    });
    this.rightCol.forEach((kanbanItem) => {
      this.rightColDiv.appendChild(kanbanItem.getElement());
    });
  }
}

class KanbanItem {
  constructor(task) {
    const { id, title, description, due_date: dueDate, status } = task;
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.status = status;
    this.element = null;
  }

  getElement() {
    const kanbanItem = document.createElement('div');
    kanbanItem.classList.add('kanban-item');
    kanbanItem.id = `kanban-item-${this.id}`;
    kanbanItem.innerHTML = `
      <div class="kanban-item-header">
        <h3>${this.title}</h3>
        <p>${this.dueDate}</p>
      </div>
      <div class="kanban-item-body">
        <p>${this.description}</p>
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

    function dragMouseDown(e) {
      e.preventDefault();
      const { left, top, height } = el.getBoundingClientRect();

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
    }
  
    function closeDragElement() {
      // go back to original position, remove temporary div
      const kanbanTemporary = document.getElementById('kanban-temporary');
      el.style.position = "initial";
      kanbanTemporary.insertAdjacentElement('afterend', el);
      kanbanTemporary.remove();

      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
}

const createKanbanBoard = async () => {
  const kanbanBoard = new KanbanBoard();
  await kanbanBoard.init();
  kanbanBoard.render();
}
