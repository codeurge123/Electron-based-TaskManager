import './index.css';


const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

// ---- UI add-ons: extra elements from index.html ----
const emptyState = document.getElementById('empty-state');
const countAll = document.getElementById('count-all');
const countActive = document.getElementById('count-active');
const countDone = document.getElementById('count-done');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedButton = document.getElementById('clear-completed-btn');

let currentFilter = 'all';
let latestTasks = [];

addTaskButton.addEventListener('click', async () => {
  const title = taskInput.value.trim();
  if (title) {
    await window.api.addTask(title);
    taskInput.value = '';
    renderTasks();
    taskInput.focus();
  }
});

async function renderTasks() {
  const tasks = await window.api.getAllTasks();

  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.textContent = task.title;
    li.appendChild(titleSpan);

    const checkbox = document.createElement('input');

    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.setAttribute('aria-label', `Mark "${task.title}" as done`);

    checkbox.checked = !!task.completed;

    checkbox.addEventListener('change', async () => {
      await window.api.markTaskCompleted(task.id, checkbox.checked ? 1 : 0);
      renderTasks();
    });
    li.appendChild(checkbox);


    if (task.completed) {
      li.style.textDecoration = 'line-through';
      li.classList.add('completed');
    }

    const timeEl = document.createElement('time');
    timeEl.className = 'task-time';
    timeEl.textContent = formatTaskTime(task.created_at);
    li.appendChild(timeEl);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-btn';
    deleteButton.addEventListener('click', async () => {
      await window.api.deleteTask(task.id);
      renderTasks();
    });

    li.appendChild(deleteButton);
    taskList.appendChild(li);
  });

  updateCounts(tasks);
}

renderTasks();

// =========================================================
// UI add-ons
// =========================================================

// SQLite CURRENT_TIMESTAMP is UTC "YYYY-MM-DD HH:MM:SS"
function formatTaskTime(value) {
  if (!value) return '';
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  if (Number.isNaN(date.getTime())) return '';

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 60 * 24) return `${Math.floor(diffMinutes / 60)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function updateCounts(tasks) {
  latestTasks = tasks;
  const done = tasks.filter(task => task.completed).length;

  countAll.textContent = tasks.length;
  countActive.textContent = tasks.length - done;
  countDone.textContent = done;
  clearCompletedButton.disabled = done === 0;
  updateEmptyState();
}

function updateEmptyState() {
  const done = latestTasks.filter(task => task.completed).length;
  const visible = {
    all: latestTasks.length,
    active: latestTasks.length - done,
    completed: done,
  }[currentFilter];

  emptyState.hidden = visible > 0;
  emptyState.textContent = {
    all: 'No tasks yet.',
    active: 'No active tasks.',
    completed: 'No completed tasks.',
  }[currentFilter];
}

// ---- Filters ----
taskList.dataset.filter = currentFilter;
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    taskList.dataset.filter = currentFilter;
    filterButtons.forEach(other => other.classList.toggle('active', other === button));
    updateEmptyState();
  });
});

// ---- Clear completed ----
clearCompletedButton.addEventListener('click', async () => {
  const completed = latestTasks.filter(task => task.completed);
  await Promise.all(completed.map(task => window.api.deleteTask(task.id)));
  renderTasks();
});

// ---- Keyboard: Enter adds, Escape clears ----
taskInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') addTaskButton.click();
  if (event.key === 'Escape') taskInput.value = '';
});

// ---- Header date ----
document.getElementById('today-date').textContent = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
});
