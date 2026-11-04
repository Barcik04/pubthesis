import pytest
from selenium.webdriver.common.by import By

from helpers import (admin_row, click_and_wait, log_in, log_out, open_site,
                     wait_for)

LOCKED_MSG = "Konto jest zablokowane. Skontaktuj się z administratorem."


def test_valid_login(driver, clean_db):
    """REQ-LOG-02: correct data log the user in and redirect to the home page."""
    flash = log_in(driver, "jan", "Haslo123")
    assert flash.text == "Zalogowano jako jan."
    assert driver.current_url.endswith("index.php") or driver.current_url.endswith("/")
    assert driver.find_element(By.ID, "zalogowany").text == "Zalogowano: jan"


@pytest.mark.parametrize("login, password, message", [
    ("jan", "zleHaslo1", "Błędny login lub hasło. Pozostało prób: 2."),
    ("nie_ma_takiego", "Haslo123", "Błędny login lub hasło."),
    ("zablokowany", "Haslo123", LOCKED_MSG),
    ("", "", "Błędny login lub hasło."),
], ids=["wrong-password", "unknown-login", "locked-account", "empty-fields"])
def test_invalid_login(driver, clean_db, login, password, message):
    """REQ-LOG-03, REQ-LOG-05, REQ-LOG-06: invalid logins give the right message."""
    flash = log_in(driver, login, password)
    assert flash.text == message
    assert "error" in flash.get_attribute("class").split()
    assert driver.find_elements(By.ID, "zalogowany") == []


def test_three_wrong_passwords_lock_account(driver, clean_db):
    """REQ-LOG-03, REQ-LOG-04, REQ-LOG-08: 3 failures lock the account."""
    assert log_in(driver, "anna", "zle1").text == "Błędny login lub hasło. Pozostało prób: 2."
    assert log_in(driver, "anna", "zle2").text == "Błędny login lub hasło. Pozostało prób: 1."
    assert log_in(driver, "anna", "zle3").text == \
        "Konto zostało zablokowane po 3 nieudanych próbach."
    assert admin_row(driver, "anna") == ("LOCKED", "3")


def test_locked_account_rejects_correct_password(driver, clean_db):
    """REQ-LOG-05: after locking, even the correct password is refused."""
    for attempt in ("zle1", "zle2", "zle3"):
        log_in(driver, "anna", attempt)
    assert log_in(driver, "anna", "Tajne456").text == LOCKED_MSG


@pytest.mark.xfail(reason="DEF-06", strict=True)
def test_successful_login_resets_counter(driver, clean_db):
    """REQ-LOG-02: a correct login zeroes the counter of failed attempts."""
    log_in(driver, "jan", "zle1")
    log_in(driver, "jan", "zle2")
    assert admin_row(driver, "jan") == ("ACTIVE", "2")
    assert log_in(driver, "jan", "Haslo123").text == "Zalogowano jako jan."
    assert admin_row(driver, "jan") == ("ACTIVE", "0")
    log_out(driver)
    assert log_in(driver, "jan", "zle3").text == "Błędny login lub hasło. Pozostało prób: 2."


def test_failed_attempts_are_per_account(driver, clean_db):
    """REQ-LOG-03: a failure for one account does not touch the others."""
    log_in(driver, "jan", "zle1")
    assert admin_row(driver, "anna") == ("ACTIVE", "0")


def test_logout(driver, clean_db):
    """REQ-LOG-07: 'Wyloguj' ends the session, shows the home page and a message."""
    log_in(driver, "jan", "Haslo123")
    flash = log_out(driver)
    assert flash.text == "Wylogowano."
    assert driver.current_url.endswith("index.php") or driver.current_url.endswith("/")
    assert driver.find_elements(By.ID, "zalogowany") == []
    assert driver.find_elements(By.ID, "nav-logowanie") != []


def test_admin_table_columns_and_data(driver, clean_db):
    """REQ-LOG-08: admin panel shows users with the required columns."""
    open_site(driver, "admin.php", By.ID, "uzytkownicy")
    headers = [th.text for th in driver.find_elements(By.CSS_SELECTOR, "#uzytkownicy th")]
    assert headers[:5] == ["Login", "E-mail", "Wiek", "Nieudane próby", "Status"]
    rows = {}
    for tr in driver.find_elements(By.CSS_SELECTOR, "#uzytkownicy tr[data-login]"):
        cells = [tr.find_element(By.CSS_SELECTOR, f"td.{c}").text
                 for c in ("login", "email", "wiek", "proby", "status")]
        rows[cells[0]] = cells
    assert rows == {
        "jan": ["jan", "jan@example.com", "30", "0", "ACTIVE"],
        "anna": ["anna", "anna@example.com", "25", "0", "ACTIVE"],
        "zablokowany": ["zablokowany", "zb@example.com", "40", "3", "LOCKED"],
    }


def test_unlock_button_only_for_locked_account(driver, clean_db):
    """REQ-LOG-09: 'Odblokuj' is shown for the locked account only."""
    open_site(driver, "admin.php", By.ID, "uzytkownicy")
    buttons = driver.find_elements(By.CSS_SELECTOR, "#uzytkownicy button.odblokuj")
    assert [b.get_attribute("value") for b in buttons] == ["zablokowany"]
    assert buttons[0].text == "Odblokuj"


def test_unlock_account(driver, clean_db):
    """REQ-LOG-09: unlocking sets ACTIVE, zeroes the counter and allows login."""
    open_site(driver, "admin.php", By.ID, "uzytkownicy")
    button = driver.find_element(By.CSS_SELECTOR, "button.odblokuj")
    flash = click_and_wait(driver, button, "#flash")[0]
    assert flash.text == "Odblokowano konto zablokowany."
    assert admin_row(driver, "zablokowany") == ("ACTIVE", "0")
    assert driver.find_elements(By.CSS_SELECTOR, "button.odblokuj") == []
    assert log_in(driver, "zablokowany", "Haslo123").text == "Zalogowano jako zablokowany."
