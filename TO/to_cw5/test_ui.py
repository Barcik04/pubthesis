import re

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait

from helpers import log_in, open_site, wait_for, reset_database

PAGES = ["index.php", "rejestracja.php", "logowanie.php", "kalkulator.php",
         "kontakt.php", "admin.php"]
MENU_LOGGED_OUT = ["Start", "Rejestracja", "Kalkulator", "Zamówienia",
                   "Kontakt", "Administracja", "Logowanie"]


def menu_texts(driver):
    return [a.text for a in driver.find_elements(By.CSS_SELECTOR, "#menu a")]


@pytest.mark.parametrize("page", [
    "index.php", "rejestracja.php", "logowanie.php", "kalkulator.php",
    pytest.param("kontakt.php", marks=pytest.mark.xfail(reason="DEF-01", strict=True)),
    "admin.php",
])
def test_page_title(driver, page):
    """REQ-UI-02: title has the form 'SklepTO – <page name>'."""
    open_site(driver, page)
    prefix = "SklepTO – "
    assert driver.title.startswith(prefix)
    assert driver.title[len(prefix):].strip() != ""


def test_orders_page_title(driver, clean_db):
    """REQ-UI-02: the orders page (logged in) has a proper title too."""
    log_in(driver, "jan", "Haslo123")
    open_site(driver, "zamowienia.php", By.ID, "zamowienia")
    assert driver.title.startswith("SklepTO – ")
    assert driver.title != "SklepTO – "


@pytest.mark.parametrize("page", PAGES)
def test_menu_logged_out(driver, page):
    """REQ-UI-01: logged-out menu on every page."""
    open_site(driver, page)
    assert menu_texts(driver) == MENU_LOGGED_OUT


@pytest.mark.parametrize("page", PAGES)
def test_menu_logged_in(driver, clean_db, page):
    """REQ-UI-01: logged in – 'Zalogowano: jan' and 'Wyloguj' instead of 'Logowanie'."""
    log_in(driver, "jan", "Haslo123")
    open_site(driver, page)
    assert driver.find_element(By.ID, "zalogowany").text == "Zalogowano: jan"
    assert "Wyloguj" in menu_texts(driver)
    assert "Logowanie" not in menu_texts(driver)


@pytest.mark.parametrize("nav_id, path", [
    ("nav-home", "index.php"),
    ("nav-rejestracja", "rejestracja.php"),
    ("nav-kalkulator", "kalkulator.php"),
    ("nav-kontakt", "kontakt.php"),
    ("nav-admin", "admin.php"),
    ("nav-logowanie", "logowanie.php"),
])
def test_menu_navigation(driver, nav_id, path):
    """REQ-UI-01: a menu item opens the matching page."""
    open_site(driver, "kontakt.php" if nav_id != "nav-kontakt" else "index.php")
    driver.find_element(By.ID, nav_id).click()
    WebDriverWait(driver, 10).until(EC.url_contains(path))
    assert driver.current_url.endswith(path)


def test_menu_orders_when_logged_out_redirects_to_login(driver):
    """REQ-UI-01 / REQ-ZAM-01: 'Zamówienia' for a guest ends on the login page."""
    open_site(driver, "index.php")
    driver.find_element(By.ID, "nav-zamowienia").click()
    WebDriverWait(driver, 10).until(EC.url_contains("logowanie.php"))


@pytest.mark.parametrize("page", PAGES)
def test_footer_has_version(driver, page):
    """REQ-UI-07: the footer of every page shows the application version."""
    open_site(driver, page)
    footer = driver.find_element(By.ID, "stopka").text
    assert re.search(r"\d+\.\d+", footer), f"no version number in footer: {footer!r}"


def test_polish_characters_displayed(driver):
    """REQ-UI-07: Polish characters are displayed correctly (UTF-8)."""
    open_site(driver, "index.php")
    assert "Zamówienia" in menu_texts(driver)
    assert driver.find_element(By.TAG_NAME, "html").get_attribute("lang") == "pl"
    assert "�" not in driver.page_source


def test_flash_success_class_and_disappears_on_refresh(driver, clean_db):
    """REQ-UI-06: success message is 'success' and vanishes after a refresh."""
    flash = log_in(driver, "jan", "Haslo123")
    assert "success" in flash.get_attribute("class").split()
    driver.refresh()
    wait_for(driver, *(By.ID, "menu"))
    assert driver.find_elements(By.ID, "flash") == []


def test_flash_error_class(driver, clean_db):
    """REQ-UI-06: error message is displayed with the 'error' class."""
    flash = log_in(driver, "jan", "zle-haslo")
    assert "error" in flash.get_attribute("class").split()


def test_reset_logs_out_and_restores_data(driver, clean_db):
    """REQ-UI-09: install.php?reset=1 logs the user out and restores the data."""
    log_in(driver, "jan", "Haslo123")
    reset_database(driver)
    open_site(driver, "index.php")
    assert driver.find_elements(By.ID, "zalogowany") == []
    assert driver.find_elements(By.ID, "nav-logowanie") != []
