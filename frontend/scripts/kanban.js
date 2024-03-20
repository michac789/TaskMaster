
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
    return kanbanItem;
  }
}

const kanbanTrial = async () => {
  const kanbanBoard = new KanbanBoard();
  await kanbanBoard.init();
  kanbanBoard.render();

  const kanbanItems = document.querySelectorAll('.kanban-item');
  kanbanItems.forEach((kanbanItem) => {

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    // if (document.getElementById(elmnt.id + "header")) {
    //   // if present, the header is where you move the DIV from:
    //   document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    // } else {
    //   // otherwise, move the DIV from anywhere inside the DIV:
    //   elmnt.onmousedown = dragMouseDown;
    // }
    kanbanItem.onmousedown = dragMouseDown;
  
    function dragMouseDown(e) {
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      console.log('x:', e.clientX, 'y:', e.clientY)
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      kanbanItem.style.position = "absolute";
      kanbanItem.style.top = (kanbanItem.offsetTop - pos2) + "px";
      kanbanItem.style.left = (kanbanItem.offsetLeft - pos1) + "px";
    }
  
    function closeDragElement() {
      console.log('close drag element')
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  });
}
