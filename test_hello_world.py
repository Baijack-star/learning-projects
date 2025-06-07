import subprocess
import unittest

class TestHelloWorld(unittest.TestCase):
    def test_hello_world_output(self):
        process = subprocess.Popen(['python', 'hello_world.py'],
                                     stdout=subprocess.PIPE,
                                     stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        self.assertEqual(stdout.decode('utf-8').strip(), "Hello, World!")
        self.assertEqual(stderr.decode('utf-8').strip(), "")

if __name__ == '__main__':
    unittest.main()
