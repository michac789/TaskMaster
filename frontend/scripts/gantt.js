
const createGanttChart = async (reset=false) => {
  // show loading state and hide contents
  const loadingDiv = document.getElementById('gantt-loading');
  const contentDiv = document.getElementById('gantt-content');
  loadingDiv.style.display = 'block';
  contentDiv.style.display = 'none';

  // if reset is true, back to default state
  if (reset) {
    document.getElementById('gantt-todo').checked = true;
    document.getElementById('gantt-progress').checked = true;
    document.getElementById('gantt-completed').checked = false;
    document.getElementById('gantt-sort').value = '-due_date';
  }

  // get all input elements (for filter & sort), set query parameters
  const checkboxTodo = document.getElementById('gantt-todo');
  const checkboxProgress = document.getElementById('gantt-progress');
  const checkboxCompleted = document.getElementById('gantt-completed');
  const selectSort = document.getElementById('gantt-sort');
  
  const filteredStatus = [];
  if (checkboxTodo.checked) filteredStatus.push(checkboxTodo.value);
  if (checkboxProgress.checked) filteredStatus.push(checkboxProgress.value);
  if (checkboxCompleted.checked) filteredStatus.push(checkboxCompleted.value);

  const queryParams = [];
  if (filteredStatus.length > 0) queryParams.push(`filter=${filteredStatus.join(',')}`);
  if (selectSort.value) queryParams.push(`sort=${selectSort.value}`);
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  
  // call api to get all tasks
  try {
    const response = await fetch(`${TASKS_ENDPOINT}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('jwtToken')
      }
    });
    const tasks = await response.json();
    // console.log(tasks)

    // hide loading state and show contents
    loadingDiv.style.display = 'none';
    contentDiv.style.display = 'block';

    const newDiv = document.createElement('div');
    tasks.forEach(task => {
      const taskDiv = document.createElement('div');
      taskDiv.innerHTML = task.id + ' ' + task.title + ' ' + task.order + ' ' + task.status;
      newDiv.appendChild(taskDiv);
    })
    contentDiv.innerHTML = '';
    contentDiv.appendChild(newDiv);

    // TODO - continue here!

  } catch {
    window.alert('Something went wrong. Please try again.');
  }
}
