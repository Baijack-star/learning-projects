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
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent li click event if any
            deleteTodo(todo.id);
        });

        li.prepend(checkbox); // Add checkbox before the text
        li.appendChild(deleteBtn); // Add delete button after the text
        taskList.appendChild(li);
    });
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
