import pytest
from selenium.webdriver.common.by import By

from helpers import error_texts, fill, open_site, wait_for
from selenium.webdriver.support.wait import WebDriverWait


def send_message(driver, name, email, message):
    open_site(driver, "kontakt.php", By.ID, "form-kontakt")
    fill(driver, "imie", name)
    fill(driver, "email", email)
    fill(driver, "wiadomosc", message)
    driver.find_element(By.ID, "wyslij").click()
    WebDriverWait(driver, 10).until(
        lambda d: d.find_elements(By.CSS_SELECTOR, "#sukces, #bledy") or False)


def test_form_fields(driver):
    """REQ-KON-01: the form has name, e-mail, message and the 'Wyślij' button."""
    open_site(driver, "kontakt.php", By.ID, "form-kontakt")
    for field_id in ("imie", "email", "wiadomosc"):
        assert driver.find_element(By.ID, field_id).is_displayed()
    assert driver.find_element(By.ID, "wyslij").text == "Wyślij"


@pytest.mark.parametrize("field_id, limit", [
    ("imie", "60"),
    pytest.param("email", "120", marks=pytest.mark.xfail(reason="DEF-05", strict=True)),
])
def test_field_length_limits(driver, field_id, limit):
    """REQ-KON-01: name max 60 characters, e-mail max 120 characters."""
    open_site(driver, "kontakt.php", By.ID, "form-kontakt")
    assert driver.find_element(By.ID, field_id).get_dom_attribute("maxlength") == limit


def test_valid_message(driver, clean_db):
    """REQ-KON-05: a correct message is accepted."""
    send_message(driver, "Anna", "anna@example.com", "Dzień dobry, mam pytanie.")
    assert driver.find_element(By.ID, "sukces").text == "Dziękujemy za wiadomość."
    assert error_texts(driver) == []


def test_empty_form_gives_three_errors(driver):
    """REQ-KON-02, 03, 04: an empty form lists three errors."""
    send_message(driver, "", "", "")
    assert error_texts(driver) == ["Podaj imię.", "Niepoprawny adres e-mail.",
                                   "Wpisz treść wiadomości."]
    assert driver.find_elements(By.ID, "sukces") == []


@pytest.mark.parametrize("name, email, message, expected", [
    ("", "a@example.com", "Treść", "Podaj imię."),
    ("Anna", "zly-adres", "Treść", "Niepoprawny adres e-mail."),
    ("Anna", "a@example.com", "", "Wpisz treść wiadomości."),
], ids=["no-name", "bad-email", "no-message"])
def test_single_field_error(driver, name, email, message, expected):
    """REQ-KON-02, 03, 04: one invalid field gives exactly its own message."""
    send_message(driver, name, email, message)
    assert error_texts(driver) == [expected]
