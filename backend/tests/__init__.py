from app import create_app


test_app = create_app('test')

from .test_task import TaskTestCase
from .test_ping import PingTestCase
