# Todo List Application

This is a simple Todo List application with a Python Flask backend and a plain HTML, CSS, and JavaScript frontend. It allows users to create, view, update (mark as completed/incomplete), and delete tasks.

## Project Structure

```
todo_app/
├── backend/
│   ├── app.py            # Flask application logic
│   ├── requirements.txt  # Python dependencies
│   └── tests/
│       └── test_app.py   # Backend unit tests
├── frontend/
│   ├── index.html        # Main HTML file
│   ├── script.js         # JavaScript for frontend logic
│   └── style.css         # CSS for styling
└── README.md             # This file
```

## Backend Setup and Run Instructions

The backend is a Flask application that serves a REST API for managing todos.

1.  **Navigate to the backend directory:**
    ```bash
    cd todo_app/backend
    ```

2.  **Create a virtual environment (recommended) and activate it:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Flask development server:**
    ```bash
    python app.py
    ```
    Alternatively, you can use the `flask` command (this might require setting `FLASK_APP=app.py` as an environment variable if not automatically detected):
    ```bash
    flask run
    ```

5.  The backend server will start, typically at `http://127.0.0.1:5000`. This is the API endpoint that the frontend will communicate with.

## Frontend Setup and Run Instructions

The frontend is built with HTML, CSS, and vanilla JavaScript.

1.  **Navigate to the frontend directory:**
    ```bash
    cd todo_app/frontend
    ```
    (If you are in the `todo_app/backend` directory, you would use `cd ../frontend`)

2.  **Open the `index.html` file in a web browser:**
    Simply open the `index.html` file directly with your preferred web browser (e.g., by double-clicking it or using "File > Open" in the browser menu). No build step or local server is strictly necessary for this simple frontend, as it relies on the backend server for data.

    Ensure the backend server is running so the frontend can fetch and manipulate todo items.

## Running Tests (Backend)

Unit tests are provided for the backend API.

1.  **Navigate to the backend directory:**
    (If you are not already there)
    ```bash
    cd todo_app/backend
    ```

2.  **Ensure dependencies are installed** (see Backend Setup). If you are using a virtual environment, make sure it's activated.

3.  **Run the unit tests:**
    From the `todo_app/backend` directory, execute:
    ```bash
    python -m unittest discover tests
    ```
    This command will discover and run all tests located in the `tests` subdirectory. You should see output indicating the number of tests run and their status (e.g., "OK" if all pass).
