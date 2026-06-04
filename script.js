const storageKey = "portfolio-study-tasks";

const defaultTasks = [
  { id: createId(), title: "Criar README do projeto", priority: "alta", done: false },
  { id: createId(), title: "Publicar no GitHub Pages", priority: "media", done: false },
  { id: createId(), title: "Revisar responsividade mobile", priority: "baixa", done: true },
];

let tasks = loadTasks();
let currentFilter = "all";

const elements = {
  form: document.querySelector("#taskForm"),
  taskInput: document.querySelector("#taskInput"),
  priorityInput: document.querySelector("#priorityInput"),
  taskList: document.querySelector("#taskList"),
  totalCount: document.querySelector("#totalCount"),
  pendingCount: document.querySelector("#pendingCount"),
  doneCount: document.querySelector("#doneCount"),
  filters: document.querySelectorAll(".filter"),
};

function createId() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function loadTasks() {
  const savedTasks = localStorage.getItem(storageKey);
  return savedTasks ? JSON.parse(savedTasks) : defaultTasks;
}

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function getVisibleTasks() {
  if (currentFilter === "pending") {
    return tasks.filter((task) => !task.done);
  }

  if (currentFilter === "done") {
    return tasks.filter((task) => task.done);
  }

  return tasks;
}

function renderCounters() {
  elements.totalCount.textContent = tasks.length;
  elements.pendingCount.textContent = tasks.filter((task) => !task.done).length;
  elements.doneCount.textContent = tasks.filter((task) => task.done).length;
}

function renderFilters() {
  elements.filters.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();

  if (visibleTasks.length === 0) {
    elements.taskList.innerHTML = `
      <li class="empty-state">
        Nenhuma tarefa encontrada para este filtro.
      </li>
    `;
    return;
  }

  elements.taskList.innerHTML = visibleTasks
    .map(
      (task) => `
        <li class="task-item ${task.done ? "done" : ""}">
          <input type="checkbox" ${task.done ? "checked" : ""} data-toggle="${task.id}" aria-label="Concluir tarefa" />
          <div>
            <span class="task-title">${task.title}</span>
            <span class="priority ${task.priority}">${task.priority}</span>
          </div>
          <button class="remove-button" type="button" data-remove="${task.id}">Remover</button>
        </li>
      `,
    )
    .join("");
}

function render() {
  renderCounters();
  renderFilters();
  renderTasks();
}

function addTask(event) {
  event.preventDefault();

  const title = elements.taskInput.value.trim();

  if (!title) {
    return;
  }

  tasks = [
    {
      id: createId(),
      title,
      priority: elements.priorityInput.value,
      done: false,
    },
    ...tasks,
  ];

  saveTasks();
  elements.form.reset();
  render();
}

function handleTaskAction(event) {
  const toggle = event.target.closest("[data-toggle]");
  const remove = event.target.closest("[data-remove]");

  if (toggle) {
    tasks = tasks.map((task) =>
      task.id === toggle.dataset.toggle ? { ...task, done: toggle.checked } : task,
    );
  }

  if (remove) {
    tasks = tasks.filter((task) => task.id !== remove.dataset.remove);
  }

  saveTasks();
  render();
}

function changeFilter(event) {
  const button = event.target.closest("[data-filter]");

  if (!button) {
    return;
  }

  currentFilter = button.dataset.filter;
  render();
}

elements.form.addEventListener("submit", addTask);
elements.taskList.addEventListener("click", handleTaskAction);
document.addEventListener("click", changeFilter);

render();
