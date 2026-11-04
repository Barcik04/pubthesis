import pytest
from selenium.webdriver.common.by import By

from helpers import log_in, open_site

PAGES = ["index.php", "rejestracja.php", "logowanie.php", "kalkulator.php",
         "kontakt.php", "admin.php"]


@pytest.mark.parametrize("page", [
    "index.php", "rejestracja.php", "logowanie.php", "kalkulator.php",
    pytest.param("kontakt.php", marks=pytest.mark.xfail(reason="DEF-02", strict=True)),
    "admin.php",
])
def test_images_have_alt(driver, page):
    """REQ-UI-03: every image has a non-empty alt."""
    open_site(driver, page)
    for img in driver.find_elements(By.TAG_NAME, "img"):
        alt = img.get_attribute("alt")
        assert alt and alt.strip(), f"<img src={img.get_attribute('src')}> has no alt"


def assert_all_fields_labelled(driver):
    fields = driver.find_elements(
        By.CSS_SELECTOR,
        "input:not([type=hidden]):not([type=submit]):not([type=button]), textarea, select")
    assert fields, "no form fields found"
    for field in fields:
        field_id = field.get_attribute("id")
        assert field_id, f"field {field.get_attribute('name')!r} has no id"
        labels = driver.find_elements(By.CSS_SELECTOR, f"label[for='{field_id}']")
        assert labels, f"field #{field_id} has no <label for>"


@pytest.mark.parametrize("page", [
    "rejestracja.php", "logowanie.php", "kalkulator.php",
    pytest.param("kontakt.php", marks=pytest.mark.xfail(reason="DEF-03", strict=True)),
])
def test_fields_have_labels(driver, page):
    """REQ-UI-04: every visible form field has a <label for=...>."""
    open_site(driver, page)
    assert_all_fields_labelled(driver)


def test_orders_form_field_has_label(driver, clean_db):
    """REQ-UI-04: the new-order form field has a label."""
    log_in(driver, "jan", "Haslo123")
    open_site(driver, "zamowienia.php", By.ID, "form-nowe")
    assert_all_fields_labelled(driver)


@pytest.mark.parametrize("page", [
    "rejestracja.php",
    pytest.param("kontakt.php", marks=pytest.mark.xfail(reason="DEF-04", strict=True)),
])
def test_email_field_type(driver, page):
    """REQ-UI-05: the e-mail field is of type 'email'."""
    open_site(driver, page)
    assert driver.find_element(By.ID, "email").get_attribute("type") == "email"
