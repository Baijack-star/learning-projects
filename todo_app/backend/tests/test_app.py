import unittest
import json
# Import the app module itself to modify its global variables directly
from todo_app.backend import app as main_app

class TestTodoApp(unittest.TestCase):

    def setUp(self):
        """Set up a test client and initialize/reset the in-memory database."""
        self.app = main_app.app.test_client()
        self.app.testing = True

        # Reset the in-memory database before each test
        # by directly modifying the variables in the imported app module
        main_app.todos_db.clear()
        main_app.next_id = 1

    def tearDown(self):
        """Clean up after each test."""
        pass

    def test_get_todos_initially_empty(self):
        """Test GET /todos when no todos have been added."""
        response = self.app.get('/todos')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, [])

    def test_post_todo(self):
        """Test POST /todos to add a new todo."""
        payload = {"task": "Test task"}
        response = self.app.post('/todos',
                                  data=json.dumps(payload),
                                  content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json
        self.assertIn('id', data)
        self.assertEqual(data['id'], 1)
        self.assertEqual(data['task'], "Test task")
        self.assertEqual(data['completed'], False)

        # Check if it's in the list
        response_get = self.app.get('/todos')
        self.assertEqual(response_get.status_code, 200)
        self.assertEqual(len(response_get.json), 1)
        self.assertEqual(response_get.json[0]['task'], "Test task")

    def test_post_todo_missing_task(self):
        """Test POST /todos with missing task field."""
        payload = {"description": "Another task"} # Incorrect field name
        response = self.app.post('/todos',
                                  data=json.dumps(payload),
                                  content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Task is required")


    def test_update_todo_status(self):
        """Test PUT /todos/<id> to update a todo's completed status."""
        # First, add a todo
        add_payload = {"task": "Task to update"}
        add_response = self.app.post('/todos',
                                     data=json.dumps(add_payload),
                                     content_type='application/json')
        self.assertEqual(add_response.status_code, 201) # Ensure task was added
        todo_id = add_response.json['id']

        # Now, update it
        update_payload = {"completed": True}
        response = self.app.put(f'/todos/{todo_id}',
                                data=json.dumps(update_payload),
                                content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json
        self.assertEqual(data['id'], todo_id)
        self.assertEqual(data['task'], "Task to update")
        self.assertEqual(data['completed'], True)

        # Verify with GET
        get_response = self.app.get(f'/todos')
        self.assertEqual(get_response.json[0]['completed'], True)


    def test_update_todo_task_description(self):
        """Test PUT /todos/<id> to update a todo's task description."""
        # First, add a todo
        add_payload = {"task": "Original Task Name"}
        add_response = self.app.post('/todos',
                                     data=json.dumps(add_payload),
                                     content_type='application/json')
        self.assertEqual(add_response.status_code, 201) # Ensure task was added
        todo_id = add_response.json['id']

        # Now, update its name
        update_payload = {"task": "Updated Task Name"}
        response = self.app.put(f'/todos/{todo_id}',
                                data=json.dumps(update_payload),
                                content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json
        self.assertEqual(data['id'], todo_id)
        self.assertEqual(data['task'], "Updated Task Name")
        self.assertEqual(data['completed'], False) # Should remain false

        # Verify with GET
        get_response = self.app.get(f'/todos')
        self.assertEqual(get_response.json[0]['task'], "Updated Task Name")

    def test_update_todo_not_found(self):
        """Test PUT /todos/<id> for a non-existent todo."""
        update_payload = {"completed": True}
        response = self.app.put('/todos/999',  # Assuming 999 does not exist
                                data=json.dumps(update_payload),
                                content_type='application/json')
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Todo not found")

    def test_delete_todo(self):
        """Test DELETE /todos/<id> to remove a todo."""
        # First, add a todo
        add_payload = {"task": "Task to delete"}
        add_response = self.app.post('/todos',
                                     data=json.dumps(add_payload),
                                     content_type='application/json')
        todo_id = add_response.json['id']

        # Ensure it's there
        response_get_before = self.app.get('/todos')
        self.assertEqual(len(response_get_before.json), 1)

        # Delete it
        response = self.app.delete(f'/todos/{todo_id}')
        self.assertEqual(response.status_code, 200) # Or 204 if no content is returned by app
        self.assertEqual(response.json, {"message": "Todo deleted successfully"})


        # Ensure it's gone
        response_get_after = self.app.get('/todos')
        self.assertEqual(response_get_after.status_code, 200)
        self.assertEqual(len(response_get_after.json), 0)

    def test_delete_todo_not_found(self):
        """Test DELETE /todos/<id> for a non-existent todo."""
        response = self.app.delete('/todos/999') # Assuming 999 does not exist
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Todo not found")

if __name__ == '__main__':
    unittest.main()
