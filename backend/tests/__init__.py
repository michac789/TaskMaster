from app import create_app


test_app = create_app('test')

from .test_ping import PingTestCase
from .test_task import (
    TaskGetAllTestCase,
    TaskCreateTestCase,
    TaskGetTestCase,
    TaskUpdateTestCase,
    TaskDeleteTestCase,
)
from .test_user import (
    UserCreateTestCase,
    UserLoginTestCase,
    UserGetTestCase,
    UserChangePasswordTestCase,
)
