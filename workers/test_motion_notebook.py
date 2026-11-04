import json
import unittest
from pathlib import Path


class MotionNotebookPreflightTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        notebook = json.loads((Path(__file__).parent.parent / "public/downloads/gpu/aurora_motion_preflight.ipynb").read_text())
        cls.namespace = {}
        code = next(cell for cell in notebook["cells"] if cell["cell_type"] == "code")
        exec("".join(code["source"]), cls.namespace)

    def assess(self, memory, disk):
        return self.namespace["assess_runtime"](memory, disk)

    def test_free_t4_does_not_pass_motion_gate(self):
        self.assertFalse(self.assess([16384], 50)["ready"])

    def test_two_t4s_are_not_one_large_gpu(self):
        self.assertFalse(self.assess([16384, 16384], 50)["ready"])

    def test_twenty_gib_is_minimum(self):
        self.assertTrue(self.assess([20480], 30)["ready"])
        self.assertFalse(self.assess([20479], 30)["ready"])

    def test_thirty_gib_disk_is_minimum(self):
        self.assertFalse(self.assess([40960], 29.9)["ready"])
        self.assertTrue(self.assess([40960], 30)["ready"])

    def test_no_gpu_never_passes(self):
        self.assertFalse(self.assess([], 100)["ready"])


if __name__ == "__main__":
    unittest.main()