import pytest
from selenium.webdriver.common.by import By

from helpers import error_texts, log_in, open_site, register

LOGIN_MSG = "Login musi mieć od 3 do 20 znaków (małe litery, cyfry, _)."
EMAIL_MSG = "Niepoprawny adres e-mail."
AGE_MSG = "Wiek musi być liczbą całkowitą z zakresu 18–99."
PASS_MSG = "Hasło musi mieć od 8 do 20 znaków i zawierać literę oraz cyfrę."
MISMATCH_MSG = "Hasła nie są identyczne."
TERMS_MSG = "Musisz zaakceptować regulamin."
TAKEN_MSG = "Login jest już zajęty."
SUCCESS_MSG = "Konto zostało utworzone. Możesz się zalogować."


def test_form_fields(driver):
    """REQ-REJ-01: the form has all the required fields and the submit button."""
    open_site(driver, "rejestracja.php", By.ID, "form-rejestracja")
    for field_id in ("login", "email", "wiek", "haslo", "haslo2", "regulamin"):
        assert driver.find_element(By.ID, field_id).is_displayed()
    assert driver.find_element(By.ID, "zarejestruj").text == "Zarejestruj"
    assert "Akceptuję regulamin" in driver.find_element(
        By.CSS_SELECTOR, "label[for='regulamin']").text


def test_valid_registration_and_login(driver, clean_db):
    """REQ-REJ-10: valid data create an ACTIVE account that can log in at once."""
    register(driver)
    assert driver.find_element(By.ID, "sukces").text == SUCCESS_MSG
    assert driver.find_element(By.ID, "login").get_attribute("value") == ""
    assert driver.find_element(By.ID, "email").get_attribute("value") == ""
    assert log_in(driver, "nowy_user", "Haslo1234").text == "Zalogowano jako nowy_user."


@pytest.mark.parametrize("login, valid", [
    ("ab", False), ("abc", True), ("a" * 20, True), ("a" * 21, False),
    pytest.param("Nowy_User", False,
                 marks=pytest.mark.xfail(reason="DEF-10", strict=True)),
    ("ann-a", False), ("ann a", False), ("ab_9", True),
], ids=["2-chars", "3-chars", "20-chars", "21-chars", "uppercase",
        "hyphen", "space", "underscore-digit"])
def test_login_rules(driver, clean_db, login, valid):
    """REQ-REJ-02: login 3-20 chars from [a-z0-9_]."""
    register(driver, login=login)
    if valid:
        assert driver.find_elements(By.ID, "sukces")
    else:
        assert error_texts(driver) == [LOGIN_MSG]


def test_login_must_be_unique(driver, clean_db):
    """REQ-REJ-03: an existing login is refused."""
    register(driver, login="jan")
    assert error_texts(driver) == [TAKEN_MSG]


@pytest.mark.parametrize("email, valid", [
    ("ala@example.com", True), ("abc", False), ("ala@", False), ("@example.com", False),
], ids=["valid", "no-at", "no-domain", "no-local-part"])
def test_email_rules(driver, clean_db, email, valid):
    """REQ-REJ-04: e-mail must be a valid address."""
    register(driver, email=email)
    if valid:
        assert driver.find_elements(By.ID, "sukces")
    else:
        assert error_texts(driver) == [EMAIL_MSG]


@pytest.mark.parametrize("age, valid", [
    ("17", False), ("18", True), ("99", True),
    pytest.param("100", False, marks=pytest.mark.xfail(reason="DEF-07", strict=True)),
    ("", False), ("18.5", False), ("0", False), ("-20", False),
], ids=["17", "18", "99", "100", "empty", "decimal", "zero", "negative"])
def test_age_rules(driver, clean_db, age, valid):
    """REQ-REJ-05: age is an integer 18-99 (boundary values)."""
    register(driver, age=age)
    if valid:
        assert driver.find_elements(By.ID, "sukces")
    else:
        assert error_texts(driver) == [AGE_MSG]


@pytest.mark.parametrize("password, valid", [
    ("abcdefg1", True), ("abcdef1", False), ("a" * 19 + "1", True),
    ("a" * 20 + "1", False), ("abcdefgh", False), ("12345678", False),
], ids=["8-chars", "7-chars", "20-chars", "21-chars", "no-digit", "no-letter"])
def test_password_rules(driver, clean_db, password, valid):
    """REQ-REJ-06: password 8-20 chars with a letter and a digit."""
    register(driver, password=password)
    if valid:
        assert driver.find_elements(By.ID, "sukces")
    else:
        assert error_texts(driver) == [PASS_MSG]


def test_passwords_must_match(driver, clean_db):
    """REQ-REJ-07: 'Powtórz hasło' must equal 'Hasło'."""
    register(driver, password2="Haslo9999")
    assert error_texts(driver) == [MISMATCH_MSG]


def test_terms_required(driver, clean_db):
    """REQ-REJ-08: the terms must be accepted."""
    register(driver, terms=False)
    assert error_texts(driver) == [TERMS_MSG]


def test_all_errors_listed_and_values_kept(driver, clean_db):
    """REQ-REJ-09: all errors are listed, no account is created, values are kept."""
    register(driver, login="A!", email="zly", age="5", password="abc",
             password2="xyz", terms=False)
    errors = error_texts(driver)
    for expected in (LOGIN_MSG, EMAIL_MSG, AGE_MSG, PASS_MSG, MISMATCH_MSG, TERMS_MSG):
        assert expected in errors
    assert driver.find_elements(By.ID, "sukces") == []
    assert driver.find_element(By.ID, "login").get_attribute("value") == "A!"
    assert driver.find_element(By.ID, "email").get_attribute("value") == "zly"
    assert driver.find_element(By.ID, "wiek").get_attribute("value") == "5"
    assert log_in(driver, "A!", "abc").text == "Błędny login lub hasło."
