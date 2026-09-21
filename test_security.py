import unittest
from app.core.security import is_safe_ip, resolve_safe_ip

class TestSecurity(unittest.TestCase):
    def test_is_safe_ip(self):
        self.assertTrue(is_safe_ip("8.8.8.8"))
        self.assertTrue(is_safe_ip("1.1.1.1"))
        self.assertFalse(is_safe_ip("127.0.0.1"))
        self.assertFalse(is_safe_ip("10.0.0.1"))
        self.assertFalse(is_safe_ip("192.168.1.1"))
        self.assertFalse(is_safe_ip("169.254.169.254"))

    def test_resolve_safe_ip(self):
        self.assertEqual(resolve_safe_ip("8.8.8.8"), "8.8.8.8")
        with self.assertRaises(ValueError):
            resolve_safe_ip("127.0.0.1")
        with self.assertRaises(ValueError):
            resolve_safe_ip("169.254.169.254")

if __name__ == "__main__":
    unittest.main()
