import pytest
from selenium.webdriver.common.by import By

from helpers import calculate, error_texts, open_site, result

RANGE_MSG = "Wartość zamówienia musi być liczbą z zakresu 0,01–10000,00."


def test_form_defaults(driver):
    """REQ-KAL-01: courier is the default delivery, card is not ticked."""
    open_site(driver, "kalkulator.php", By.ID, "form-kalkulator")
    assert driver.find_element(By.ID, "dostawa-kurier").is_selected()
    assert not driver.find_element(By.ID, "karta").is_selected()
    assert driver.find_element(By.ID, "oblicz").text == "Oblicz"
    assert driver.find_elements(By.ID, "wynik") == []


def test_form_keeps_entered_data(driver):
    """REQ-KAL-01: after calculating, the entered data stay in the form."""
    calculate(driver, "123.45", card=True, code="STUDENT10", delivery="paczkomat")
    assert driver.find_element(By.ID, "wartosc").get_attribute("value") == "123.45"
    assert driver.find_element(By.ID, "karta").is_selected()
    assert driver.find_element(By.ID, "kod").get_attribute("value") == "STUDENT10"
    assert driver.find_element(By.ID, "dostawa-paczkomat").is_selected()


@pytest.mark.xfail(reason="DEF-08", strict=True)
def test_example_from_specification(driver):
    """REQ-KAL-08: 150 zł, card, 'student10', courier -> 15%, 0.00 zł, 127.50 zł."""
    calculate(driver, "150", card=True, code="student10", delivery="kurier")
    assert result(driver) == ("15%", "0.00 zł", "127.50 zł")


@pytest.mark.parametrize("value, card, code, delivery, expected", [
    # discount: REQ-KAL-03
    ("100", False, "", "odbior", ("0%", "0.00 zł", "100.00 zł")),
    ("100", True, "", "odbior", ("10%", "0.00 zł", "90.00 zł")),
    ("100", False, "STUDENT10", "odbior", ("10%", "0.00 zł", "90.00 zł")),
    pytest.param("100", True, "STUDENT10", "odbior", ("15%", "0.00 zł", "85.00 zł"),
                 marks=pytest.mark.xfail(reason="DEF-08", strict=True)),
    # code: case and spaces ignored (REQ-KAL-04)
    ("100", False, "  student10 ", "odbior", ("10%", "0.00 zł", "90.00 zł")),
    ("100", False, "StUdEnT10", "odbior", ("10%", "0.00 zł", "90.00 zł")),
    # delivery costs: REQ-KAL-06
    ("100", False, "", "kurier", ("0%", "15.00 zł", "115.00 zł")),
    ("100", False, "", "paczkomat", ("0%", "10.00 zł", "110.00 zł")),
    # free delivery: card or >= 200 (REQ-KAL-05), boundary 199.99 / 200.00
    ("100", True, "", "kurier", ("10%", "0.00 zł", "90.00 zł")),
    ("100", True, "", "paczkomat", ("10%", "0.00 zł", "90.00 zł")),
    ("199.99", False, "", "kurier", ("0%", "15.00 zł", "214.99 zł")),
    ("200", False, "", "kurier", ("0%", "0.00 zł", "200.00 zł")),
    ("200.01", False, "", "paczkomat", ("0%", "0.00 zł", "200.01 zł")),
    # threshold is checked BEFORE the discount (glossary: cart value)
    ("200", False, "STUDENT10", "kurier", ("10%", "0.00 zł", "180.00 zł")),
    ("199.99", False, "STUDENT10", "kurier", ("10%", "15.00 zł", "194.99 zł")),
    # range boundaries and decimal comma: REQ-KAL-02
    ("0.01", False, "", "odbior", ("0%", "0.00 zł", "0.01 zł")),
    pytest.param("10000", True, "STUDENT10", "kurier", ("15%", "0.00 zł", "8500.00 zł"),
                 marks=pytest.mark.xfail(reason="DEF-08", strict=True)),
    ("99,99", False, "", "paczkomat", ("0%", "10.00 zł", "109.99 zł")),
    # rounding to the full grosz: REQ-KAL-07
    pytest.param("10.01", True, "STUDENT10", "odbior", ("15%", "0.00 zł", "8.51 zł"),
                 marks=pytest.mark.xfail(reason="DEF-08", strict=True)),
    ("33.33", True, "", "odbior", ("10%", "0.00 zł", "30.00 zł")),
], ids=[
    "no-discount", "card-only", "code-only", "card-and-code",
    "code-spaces", "code-mixed-case",
    "courier", "parcel-locker", "card-free-courier", "card-free-locker",
    "199.99-pays", "200-free", "200.01-free", "200-code-free", "199.99-code-pays",
    "min-value", "max-value", "decimal-comma",
    "rounding-up", "rounding-10pct",
])
def test_calculation(driver, value, card, code, delivery, expected):
    """REQ-KAL-03..08: discount, delivery and total to pay."""
    calculate(driver, value, card, code, delivery)
    assert result(driver) == expected


@pytest.mark.parametrize("code, card, discount", [
    ("ZLY-KOD", False, "0%"),
    ("ZLY-KOD", True, "10%"),
], ids=["invalid-code", "invalid-code-with-card"])
def test_invalid_code_is_ignored(driver, code, card, discount):
    """REQ-KAL-04: an invalid code is reported and does not give a discount."""
    calculate(driver, "100", card=card, code=code, delivery="odbior")
    assert driver.find_element(By.ID, "kod-info").text == \
        "Nieprawidłowy kod rabatowy – został pominięty."
    assert driver.find_element(By.ID, "rabat").text == discount


def test_valid_code_has_no_warning(driver):
    """REQ-KAL-04: a valid code (or an empty one) gives no warning."""
    calculate(driver, "100", code="STUDENT10")
    assert driver.find_elements(By.ID, "kod-info") == []
    calculate(driver, "100", code="")
    assert driver.find_elements(By.ID, "kod-info") == []


@pytest.mark.parametrize("value", [
    "0", "0.00", "-5", "10000.01", "10001", "abc", "", "12.345", "1,2,3",
], ids=["zero", "zero-2dp", "negative", "10000.01", "10001", "text", "empty",
        "3-decimals", "two-commas"])
def test_invalid_value(driver, value):
    """REQ-KAL-02: values outside 0.01-10000.00 or non-numeric are rejected."""
    calculate(driver, value)
    assert error_texts(driver) == [RANGE_MSG]
    assert driver.find_elements(By.ID, "wynik") == []
