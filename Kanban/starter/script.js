let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function openModal() {
  document.getElementById("task-modal").style.display = "flex";
  document.getElementById("task-title").focus();
}

function closeModal() {
  document.getElementById("task-modal").style.display = "none";
  document.getElementById("task-title").value = "";
  document.getElementById("task-desc").value = "";
  document.getElementById("task-status").value = "To-Do";
  document.getElementById("task-priority").value = "Low";
}

function saveTask() {
  const title = document.getElementById("task-title").value.trim();
  const desc = document.getElementById("task-desc").value.trim();
  const status = document.getElementById("task-status").value;
  const priority = document.getElementById("task-priority").value;

  if (!title) {
    alert("Task title is required!");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    desc,
    status,
    priority,
  };

  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  closeModal();
}

let currentEditId = null;
let draggedElement = null;

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  loadTasks();
  renderTasks();
  setupTabHandlers();
  setupKeyboardShortcuts();
  setupDragAndDrop();
});

function setupTabHandlers() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      filterTasks(this.dataset.filter);
    });
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
    }
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      openModal();
    }
  });
}

function setupDragAndDrop() {
  // Remove drag-over class when dragging leaves
  document.querySelectorAll(".task-list").forEach((list) => {
    list.addEventListener("dragleave", function (e) {
      if (!this.contains(e.relatedTarget)) {
        this.classList.remove("drag-over");
      }
    });
  });
}

function openModal(taskId = null) {
  const modal = document.getElementById("task-modal");
  const modalTitle = document.getElementById("modal-title");

  if (taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      modalTitle.textContent = "Edit Task";
      document.getElementById("task-title").value = task.title;
      document.getElementById("task-desc").value = task.description;
      document.getElementById("task-status").value = task.status;
      document.getElementById("task-priority").value = task.priority;
      currentEditId = taskId;
    }
  } else {
    modalTitle.textContent = "Add New Task";
    document.getElementById("task-title").value = "";
    document.getElementById("task-desc").value = "";
    document.getElementById("task-status").value = "To-Do";
    document.getElementById("task-priority").value = "medium";
    currentEditId = null;
  }

  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);
  document.getElementById("task-title").focus();
}

function closeModal() {
  const modal = document.getElementById("task-modal");
  modal.classList.remove("show");
  setTimeout(() => (modal.style.display = "none"), 300);
  currentEditId = null;
}

function saveTask() {
  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-desc").value.trim();
  const status = document.getElementById("task-status").value;
  const priority = document.getElementById("task-priority").value.toLowerCase();

  if (!title) {
    showNotification("Please enter a task title", "error");
    return;
  }

  const saveBtn = document.querySelector(".save-btn");
  saveBtn.classList.add("loading");

  setTimeout(() => {
    if (currentEditId) {
      const taskIndex = tasks.findIndex((t) => t.id === currentEditId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          title,
          description,
          status,
          priority,
        };
      }
    } else {
      const newTask = {
        id: Date.now(),
        title,
        description,
        status,
        priority,
        createdAt: new Date().toISOString(),
      };
      tasks.push(newTask);
    }

    saveTasks();
    renderTasks();
    closeModal();
    showNotification("Task saved successfully!", "success");
    saveBtn.classList.remove("loading");
  }, 500);
}

function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((t) => t.id !== taskId);
    saveTasks();
    renderTasks();
    showNotification("Task deleted successfully!", "success");
  }
}

function clearAllTasks() {
  if (
    confirm(
      "Are you sure you want to clear all tasks? This action cannot be undone."
    )
  ) {
    tasks = [];
    saveTasks();
    renderTasks();
    showNotification("All tasks cleared!", "success");
  }
}

function renderTasks() {
  const todoList = document.getElementById("todo-list");
  const inProgressList = document.getElementById("inprogress-list");
  const doneList = document.getElementById("done-list");

  todoList.innerHTML = "";
  inProgressList.innerHTML = "";
  doneList.innerHTML = "";

  const counts = { "To-Do": 0, "In Progress": 0, Done: 0 };

  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    counts[task.status]++;

    switch (task.status) {
      case "To-Do":
        todoList.appendChild(taskElement);
        break;
      case "In Progress":
        inProgressList.appendChild(taskElement);
        break;
      case "Done":
        doneList.appendChild(taskElement);
        break;
    }
  });

  document.getElementById("todo-count").textContent = counts["To-Do"];
  document.getElementById("inprogress-count").textContent =
    counts["In Progress"];
  document.getElementById("done-count").textContent = counts["Done"];
}

function createTaskElement(task) {
  const taskElement = document.createElement("div");
  taskElement.className = `task ${task.priority}`;
  taskElement.draggable = true;
  taskElement.dataset.taskId = task.id;
  taskElement.dataset.status = task.status;

  // Capitalize priority for display
  const priorityDisplay =
    task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  taskElement.innerHTML = `
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${
          task.description
            ? `<div class="task-desc">${escapeHtml(task.description)}</div>`
            : ""
        }
        <div class="task-meta">
            <span class="priority ${task.priority}">${priorityDisplay}</span>
            <div class="task-actions">
                <button class="task-action edit-task" onclick="openModal(${
                  task.id
                })" title="Edit task">✏️</button>
                <button class="task-action delete-task" onclick="deleteTask(${
                  task.id
                })" title="Delete task">🗑️</button>
            </div>
        </div>
    `;

  taskElement.addEventListener("dragstart", function (e) {
    draggedElement = this;
    this.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.outerHTML);
  });

  taskElement.addEventListener("dragend", function () {
    this.classList.remove("dragging");
    draggedElement = null;
  });

  return taskElement;
}

function allowDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function drop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");

  if (draggedElement) {
    const taskId = parseInt(draggedElement.dataset.taskId);
    const newStatus = event.currentTarget.parentElement.dataset.status;

    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].status = newStatus;
      saveTasks();
      renderTasks();
      showNotification(`Task moved to ${newStatus}!`, "success");
    }
  }
}

function filterTasks(filter) {
  const columns = document.querySelectorAll(".column");

  if (filter === "all") {
    columns.forEach((col) => (col.style.display = "block"));
  } else {
    columns.forEach((col) => {
      if (col.dataset.status === filter) {
        col.style.display = "block";
      } else {
        col.style.display = "none";
      }
    });
  }
}

function saveTasks() {
  // Store tasks in localStorage for persistence
  try {
    localStorage.setItem("kanban_tasks", JSON.stringify(tasks));
  } catch (e) {
    console.warn("Could not save tasks to localStorage:", e);
  }
}

function loadTasks() {
  // Load tasks from localStorage
  try {
    const savedTasks = localStorage.getItem("kanban_tasks");
    if (savedTasks) {
      tasks = JSON.parse(savedTasks);
    } else {
      // Initialize with sample tasks if no saved data
      tasks = [
        {
          id: 1,
          title: "Design new landing page",
          description:
            "Create a modern, responsive landing page for the product launch",
          status: "To-Do",
          priority: "high",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Implement user authentication",
          description:
            "Set up secure login and registration system with JWT tokens",
          status: "In Progress",
          priority: "high",
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: "Write project documentation",
          description:
            "Create comprehensive documentation for the API endpoints",
          status: "To-Do",
          priority: "medium",
          createdAt: new Date().toISOString(),
        },
        {
          id: 4,
          title: "Set up CI/CD pipeline",
          description: "Configure automated testing and deployment workflow",
          status: "Done",
          priority: "medium",
          createdAt: new Date().toISOString(),
        },
        {
          id: 5,
          title: "Database optimization",
          description: "Optimize database queries and add proper indexing",
          status: "In Progress",
          priority: "low",
          createdAt: new Date().toISOString(),
        },
      ];
      saveTasks();
    }
  } catch (e) {
    console.warn("Could not load tasks from localStorage:", e);
    // Fallback to sample data
    tasks = [];
  }
}

function showNotification(message, type = "success") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add styles
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 20px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "500",
    fontSize: "14px",
    zIndex: "10001",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease, opacity 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  });

  // Set background color based on type
  if (type === "success") {
    notification.style.background = "#10b981";
  } else if (type === "error") {
    notification.style.background = "#ef4444";
  } else {
    notification.style.background = "#3b82f6";
  }

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 10);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    notification.style.opacity = "0";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Handle modal clicks outside content
document.getElementById("task-modal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeModal();
  }
});

// Handle form submission with Enter key
document.getElementById("task-title").addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    saveTask();
  }
});

// Auto-resize textarea
document.getElementById("task-desc").addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// Add smooth scrolling for better UX
document.documentElement.style.scrollBehavior = "smooth";
