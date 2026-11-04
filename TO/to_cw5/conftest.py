import os

import pytest
from selenium import webdriver

from helpers import reset_database


@pytest.fixture(scope="session")
def driver():
    """One Chrome for the whole session; the database is reset once at start."""
    options = webdriver.ChromeOptions()
    if os.getenv("HEADLESS"):
        for arg in ("--headless=new", "--no-sandbox", "--disable-dev-shm-usage"):
            options.add_argument(arg)
    drv = webdriver.Chrome(options=options)
    drv.implicitly_wait(0)
    reset_database(drv)
    yield drv
    drv.quit()


@pytest.fixture
def clean_db(driver):
    """Restores the initial data before a test that changes data."""
    reset_database(driver)


@pytest.fixture(autouse=True)
def no_cookies(driver):
    """Every test starts logged out."""
    driver.delete_all_cookies()
