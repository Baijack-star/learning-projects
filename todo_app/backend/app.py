from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes and origins

# In-memory database for todos
todos_db = []
next_id = 1

@app.route('/todos', methods=['GET'])
def get_todos():
    return jsonify(todos_db), 200

@app.route('/todos', methods=['POST'])
def add_todo():
    global next_id
    data = request.get_json()
    if not data or 'task' not in data:
        return jsonify({"error": "Task is required"}), 400

    new_todo = {
        "id": next_id,
        "task": data['task'],
        "completed": False
    }
    todos_db.append(new_todo)
    next_id += 1
    return jsonify(new_todo), 201

@app.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    todo_to_update = None
    for todo in todos_db:
        if todo['id'] == id:
            todo_to_update = todo
            break

    if not todo_to_update:
        return jsonify({"error": "Todo not found"}), 404

    if 'task' in data:
        todo_to_update['task'] = data['task']
    if 'completed' in data:
        todo_to_update['completed'] = data['completed']

    return jsonify(todo_to_update), 200

@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    global todos_db
    todo_to_delete = None
    for todo in todos_db:
        if todo['id'] == id:
            todo_to_delete = todo
            break

    if not todo_to_delete:
        return jsonify({"error": "Todo not found"}), 404

    todos_db = [todo for todo in todos_db if todo['id'] != id]
    return jsonify({"message": "Todo deleted successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)
