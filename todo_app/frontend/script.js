const API_BASE_URL = 'http://127.0.0.1:5000';
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

async function fetchTodos() {
    try {
        const response = await fetch(`${API_BASE_URL}/todos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const todos = await response.json();
        renderTodos(todos);
    } catch (error) {
        console.error("Failed to fetch todos:", error);
        taskList.innerHTML = '<li>Error loading todos. Is the backend running?</li>';
    }
}

function renderTodos(todos) {
    taskList.innerHTML = ''; // Clear current list

    if (todos.length === 0) {
        taskList.innerHTML = '<li>No tasks yet!</li>';
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.textContent = todo.task;
        li.dataset.id = todo.id;
        if (todo.completed) {
            li.classList.add('completed');
        }

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => {
            updateTodoStatus(todo.id, checkbox.checked);
        });

        // Delete button
        const taskTextSpan = document.createElement('span');
        taskTextSpan.classList.add('task-text');
        taskTextSpan.textContent = todo.task;

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => {
            updateTodoStatus(todo.id, checkbox.checked);
        });

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => {
            enableEditMode(li, todo.id, todo.task);
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTodo(todo.id);
        });

        li.appendChild(checkbox);
        li.appendChild(taskTextSpan); // Add task text span
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

function enableEditMode(liElement, todoId, currentTaskText) {
    const taskTextSpan = liElement.querySelector('.task-text');
    const editButton = liElement.querySelector('.edit-btn');

    // Hide original text and edit button
    taskTextSpan.style.display = 'none';
    if (editButton) editButton.style.display = 'none'; // Edit button might be already removed if save/cancel were created

    // Create input field
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = currentTaskText;
    inputField.classList.add('edit-task-input');

    // Create Save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('save-btn');
    saveButton.addEventListener('click', () => {
        const newDescription = inputField.value.trim();
        if (newDescription && newDescription !== currentTaskText) {
            updateTaskDescription(todoId, newDescription);
        } else {
            // If no change or empty, just revert to display mode
            disableEditMode(liElement, currentTaskText, true); // true to signal original text
        }
    });

    // Create Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('cancel-btn');
    cancelButton.addEventListener('click', () => {
        disableEditMode(liElement, currentTaskText, true); // true to signal original text
    });

    // Insert input and buttons before where edit button was (or delete button if edit already gone)
    const deleteButton = liElement.querySelector('.delete-btn');
    liElement.insertBefore(inputField, deleteButton);
    liElement.insertBefore(saveButton, deleteButton);
    liElement.insertBefore(cancelButton, deleteButton);
    inputField.focus(); // Focus on the input field
}

function disableEditMode(liElement, originalTaskText, useOriginalText = false) {
    const taskTextSpan = liElement.querySelector('.task-text');
    const editButton = liElement.querySelector('.edit-btn');
    const inputField = liElement.querySelector('.edit-task-input');
    const saveButton = liElement.querySelector('.save-btn');
    const cancelButton = liElement.querySelector('.cancel-btn');

    // Remove edit mode elements
    if (inputField) inputField.remove();
    if (saveButton) saveButton.remove();
    if (cancelButton) cancelButton.remove();

    // Restore original text display and edit button
    taskTextSpan.style.display = '';
    if (useOriginalText) { // Used by cancel or no-change save
        taskTextSpan.textContent = originalTaskText;
    }
    // If editButton was hidden, show it. If it was replaced, it won't exist here.
    // It will be re-added when renderTodos is called after a successful save.
    // For cancel, we need to ensure it's visible if it exists.
    if (editButton) {
       editButton.style.display = '';
    } else {
        // If the edit button is gone (e.g. after a save, then cancel),
        // it means fetchTodos will re-render, so no need to recreate it here.
        // However, if we are just canceling an edit before any save,
        // we might need to re-add it if it was removed completely.
        // For simplicity, fetchTodos will handle re-rendering the edit button correctly.
    }
    // If a successful save happened, fetchTodos will be called and re-render the whole item.
}


async function addTask() {
    const taskDescription = taskInput.value.trim();
    if (!taskDescription) {
        alert("Task description cannot be empty.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task: taskDescription }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        taskInput.value = ''; // Clear input
        fetchTodos(); // Refresh list
    } catch (error) {
        console.error("Failed to add todo:", error);
        alert("Failed to add task. See console for details.");
    }
}

async function updateTaskDescription(id, newDescription) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task: newDescription }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // On successful update, disable edit mode and refresh list
        // The fetchTodos will call renderTodos which rebuilds the li from scratch
        fetchTodos();
    } catch (error) {
        console.error(`Failed to update task description for todo ${id}:`, error);
        alert(`Failed to update task ${id}. See console for details.`);
        // Potentially revert UI or leave in edit mode for user to retry
        // For now, fetchTodos will refresh and show the old state if update failed.
    }
}

async function updateTodoStatus(id, completed) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: completed }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchTodos(); // Refresh list
    } catch (error) {
        console.error(`Failed to update todo ${id}:`, error);
        alert(`Failed to update task ${id}. See console for details.`);
    }
}

async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchTodos(); // Refresh list
    } catch (error) {
        console.error(`Failed to delete todo ${id}:`, error);
        alert(`Failed to delete task ${id}. See console for details.`);
    }
}

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Initial fetch
fetchTodos();
