import pytest
from selenium.webdriver.common.by import By

from helpers import (click_and_wait, fill, log_in, open_site,
                     order_action_classes, order_row, wait_for)

AMOUNT_MSG = "Kwota zamówienia musi być dodatnią liczbą."


@pytest.fixture
def jan(driver, clean_db):
    """Logs in as jan and opens his orders."""
    log_in(driver, "jan", "Haslo123")
    open_site(driver, "zamowienia.php", By.ID, "zamowienia")


def status_of(driver, order_id):
    """Status text and the data-status attribute of an order on the page."""
    row = order_row(driver, order_id)
    return (row.find_element(By.CSS_SELECTOR, "td.status").text,
            row.get_attribute("data-status"))


def press(driver, order_id, action):
    """Clicks the action button of the order; returns the #flash element."""
    button = order_row(driver, order_id).find_element(
        By.CSS_SELECTOR, f"button.akcja-{action}")
    return click_and_wait(driver, button, "#flash")[0]


def test_guest_is_redirected_to_login(driver):
    """REQ-ZAM-01: a guest goes to the login page with a message."""
    driver.get("about:blank")
    flash = open_site(driver, "zamowienia.php", By.ID, "flash")
    assert "logowanie.php" in driver.current_url
    assert flash.text == "Zaloguj się, aby zobaczyć zamówienia."


def test_own_orders_listed(driver, jan):
    """REQ-ZAM-02: jan sees only his 5 orders with amounts and statuses."""
    headers = [th.text for th in driver.find_elements(By.CSS_SELECTOR, "#zamowienia th")]
    assert headers == ["Nr", "Kwota", "Status", "Akcje"]
    rows = driver.find_elements(By.CSS_SELECTOR, "#zamowienia tr[id^='zam-']")
    listed = [(r.find_element(By.CSS_SELECTOR, "td.nr").text,
               r.find_element(By.CSS_SELECTOR, "td.kwota").text,
               r.find_element(By.CSS_SELECTOR, "td.status").text) for r in rows]
    assert listed == [("1", "100.00 zł", "Nowe"), ("2", "250.00 zł", "Opłacone"),
                      ("3", "80.00 zł", "Wysłane"), ("4", "40.00 zł", "Dostarczone"),
                      ("5", "60.00 zł", "Anulowane")]


def test_other_users_orders_not_listed(driver, clean_db):
    """REQ-ZAM-02: anna sees only her own order (#6), not jan's."""
    log_in(driver, "anna", "Tajne456")
    open_site(driver, "zamowienia.php", By.ID, "zamowienia")
    ids = [r.get_attribute("id") for r in
           driver.find_elements(By.CSS_SELECTOR, "#zamowienia tr[id^='zam-']")]
    assert ids == ["zam-6"]


@pytest.mark.parametrize("amount, shown", [("55.50", "55.50 zł"), ("20,25", "20.25 zł")],
                         ids=["dot", "comma"])
def test_new_order(driver, jan, amount, shown):
    """REQ-ZAM-03: a new order has status 'Nowe' and a confirmation with its number."""
    fill(driver, "kwota", amount)
    flash = click_and_wait(driver, driver.find_element(By.ID, "nowe-zamowienie"),
                           "#flash")[0]
    assert flash.text == "Utworzono zamówienie #7."
    assert status_of(driver, 7) == ("Nowe", "NEW")
    assert order_row(driver, 7).find_element(By.CSS_SELECTOR, "td.kwota").text == shown


@pytest.mark.parametrize("amount", ["0", "-10", "abc", ""],
                         ids=["zero", "negative", "text", "empty"])
def test_new_order_invalid_amount(driver, jan, amount):
    """REQ-ZAM-03: a non-positive or non-numeric amount is refused."""
    fill(driver, "kwota", amount)
    flash = click_and_wait(driver, driver.find_element(By.ID, "nowe-zamowienie"),
                           "#flash")[0]
    assert flash.text == AMOUNT_MSG
    assert len(driver.find_elements(By.CSS_SELECTOR, "#zamowienia tr[id^='zam-']")) == 5


@pytest.mark.parametrize("order_id, expected", [
    (1, {"oplac", "anuluj"}),
    (2, {"wyslij", "anuluj"}),
    pytest.param(3, {"dostarcz"}, marks=pytest.mark.xfail(reason="DEF-09", strict=True)),
    (4, set()),
    (5, set()),
], ids=["new", "paid", "shipped", "delivered", "cancelled"])
def test_action_buttons_match_state(driver, jan, order_id, expected):
    """REQ-ZAM-05: only the actions allowed in the current state have buttons."""
    assert order_action_classes(driver, order_id) == expected


@pytest.mark.parametrize("order_id, action, message, new_status", [
    (1, "oplac", "Zamówienie #1: Nowe → Opłacone.", ("Opłacone", "PAID")),
    (1, "anuluj", "Zamówienie #1: Nowe → Anulowane.", ("Anulowane", "CANCELLED")),
    (2, "wyslij", "Zamówienie #2: Opłacone → Wysłane.", ("Wysłane", "SHIPPED")),
    (2, "anuluj", "Zamówienie #2: Opłacone → Anulowane.", ("Anulowane", "CANCELLED")),
    (3, "dostarcz", "Zamówienie #3: Wysłane → Dostarczone.", ("Dostarczone", "DELIVERED")),
], ids=["new-pay", "new-cancel", "paid-ship", "paid-cancel", "shipped-deliver"])
def test_allowed_transitions(driver, jan, order_id, action, message, new_status):
    """REQ-ZAM-04, REQ-ZAM-06: allowed transitions change the status and report it."""
    flash = press(driver, order_id, action)
    assert flash.text == message
    assert status_of(driver, order_id) == new_status


def test_full_life_cycle(driver, jan):
    """REQ-ZAM-04..06: new -> paid -> shipped -> delivered; final state has no buttons."""
    fill(driver, "kwota", "99")
    click_and_wait(driver, driver.find_element(By.ID, "nowe-zamowienie"), "#flash")
    for action, status in (("oplac", "Opłacone"), ("wyslij", "Wysłane"),
                           ("dostarcz", "Dostarczone")):
        press(driver, 7, action)
        assert status_of(driver, 7)[0] == status
    assert order_action_classes(driver, 7) == set()


@pytest.mark.parametrize("order_id, action, status_label", [
    (4, "anuluj", "Dostarczone"),
    (5, "oplac", "Anulowane"),
    (1, "wyslij", "Nowe"),
    (1, "dostarcz", "Nowe"),
    (2, "oplac", "Opłacone"),
    pytest.param(3, "anuluj", "Wysłane", marks=pytest.mark.xfail(reason="DEF-09", strict=True)),
], ids=["delivered-cancel", "cancelled-pay", "new-ship", "new-deliver",
        "paid-pay", "shipped-cancel"])
def test_forbidden_transitions_by_url(driver, jan, order_id, action, status_label):
    """REQ-ZAM-07: a forbidden action called by URL changes nothing and is reported."""
    flash = open_site(driver, f"akcja.php?id={order_id}&akcja={action}", By.ID, "flash")
    assert flash.text == f"Niedozwolone przejście: {status_label} → {action}."
    open_site(driver, "zamowienia.php", By.ID, "zamowienia")
    assert status_of(driver, order_id)[0] == status_label


@pytest.mark.parametrize("order_id", [6, 999], ids=["other-users-order", "nonexistent"])
def test_action_on_foreign_or_missing_order(driver, jan, order_id):
    """REQ-ZAM-08: acting on someone else's or a missing order changes nothing."""
    flash = open_site(driver, f"akcja.php?id={order_id}&akcja=oplac", By.ID, "flash")
    assert flash.text == "Nie znaleziono zamówienia."
    # anna's order is still untouched
    driver.delete_all_cookies()
    log_in(driver, "anna", "Tajne456")
    open_site(driver, "zamowienia.php", By.ID, "zamowienia")
    assert status_of(driver, 6) == ("Nowe", "NEW")
