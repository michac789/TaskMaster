const ROOT_ENDPOINT = 'https://backend.taskmaster.michac789.com';
// TODO - remove this token later, create real authentication
const temp_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3MTA3NDMyMjJ9.ZkdJfFOjTSyHIdvSGvzTByFCz2DcbXGJRmAddvvG5os'

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded with JavaScript!')
  getTasks();
});

const getTasks = async () => {
  const ALL_TASKS_ENDPOINT = `${ROOT_ENDPOINT}/tasks`;

  try {
    const response = await fetch(ALL_TASKS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': temp_token
      }
    });
    const data = await response.json();

    const taskcardsContainer = document.getElementById('taskcards-container');
    data.forEach(task => {
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
            ${task.status}
          </div>
        </div>
        <div class="typography-overline">
          Due date: ${task.due_date}
        </div>
        <div class="typography-body">
          ${task.description}
        </div>
        <div class="taskcard-actions">
          <button class="typography-button button-primary">Edit</button>
          <button class="typography-button button-secondary">Delete</button>
        </div>
      `;
      taskcardsContainer.appendChild(taskcardContainer);
    })
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}
