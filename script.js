const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDateInput = document.getElementById('task-date');
const taskTimeInput = document.getElementById('task-time');
const taskPrioritySelect = document.getElementById('task-priority');
const taskList = document.getElementById('task-list');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

let tasks = [];

// Load tasks from localStorage
function loadTasks() {
  const saved = localStorage.getItem('tasks');
  if (saved) tasks = JSON.parse(saved);
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Format date
function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Format time
function formatTime(timeStr) {
  const [hour, minute] = timeStr.split(':');
  return `${hour}:${minute}`;
}

// Render tasks
function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<li class="task-empty">No tasks added yet.</li>';
    updateProgress();
    return;
  }

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.priority}`;
    if (task.completed) li.classList.add('completed');

    li.innerHTML = `
      <div class="task-info">
        <span class="task-title">${task.title}</span>
        <span class="task-date">${formatDate(task.date)} at ${formatTime(task.time)}</span>
      </div>
      <div class="task-actions">
        <button class="complete-btn" title="Toggle Complete">&#10003;</button>
        <button class="delete-btn" title="Delete Task">&times;</button>
      </div>
    `;

    li.querySelector('.complete-btn').addEventListener('click', () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    li.querySelector('.delete-btn').addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });

  updateProgress();
}

// Update progress
function updateProgress() {
  if (tasks.length === 0) {
    progressBar.value = 0;
    progressText.textContent = '0%';
    return;
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const percent = Math.round((completedCount / tasks.length) * 100);
  progressBar.value = percent;
  progressText.textContent = `${percent}%`;
}

// Request permission for notifications
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Check for due tasks every minute
setInterval(() => {
  const now = new Date();
  const nowDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const nowTime = now.toTimeString().slice(0, 5);   // HH:MM

  tasks.forEach(task => {
    if (
      !task.completed &&
      !task.notified &&
      task.date === nowDate &&
      task.time === nowTime
    ) {
      notifyUser(task.title);
      task.notified = true;
      saveTasks();
    }
  });
}, 60000); // check every minute

function notifyUser(message) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("⏰ Task Reminder", {
      body: `It's time for: ${message}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/484/484167.png' // optional icon
    });
  } else {
    alert(`Reminder: ${message}`);
  }
}

// Handle form submit
taskForm.addEventListener('submit', e => {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  const date = taskDateInput.value;
  const time = taskTimeInput.value;
  const priority = taskPrioritySelect.value;

  const newTask = {
    id: Date.now(),
    title,
    date,
    time,
    priority,
    completed: false,
    notified: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  taskForm.reset();
});

// Initialize
loadTasks();
renderTasks();
