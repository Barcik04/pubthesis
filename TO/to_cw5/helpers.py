
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.common.exceptions import WebDriverException

from config import SKLEPTO_URL

MENU = (By.ID, "menu")


def wait_for(driver, *locator, timeout=10):
    """Waits (max `timeout` s) until the element is in the DOM."""
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located(locator))


def open_page(driver, url, *marker):
    """Opens the URL and waits for the page marker; returns it."""
    driver.get(url)
    return wait_for(driver, *marker)


def page_url(path):
    return f"{SKLEPTO_URL}/{path.lstrip('/')}"


def open_site(driver, path, *marker):
    """Opens a SklepTO page (default marker: the menu)."""
    return open_page(driver, page_url(path), *(marker or MENU))


def reset_database(driver):
    """Restores the initial data (REQ-UI-09) and checks the status is OK."""
    status = open_page(driver, page_url("install.php?reset=1"),
                       By.ID, "install-status")
    assert status.text == "OK", f"database reset failed: {status.text}"


def fill(driver, field_id, text):
    """Clears the field and types the text."""
    field = driver.find_element(By.ID, field_id)
    field.clear()
    field.send_keys(text)


def _page_left(button):
    def check(driver):
        try:
            button.is_enabled()
            return False
        except WebDriverException:
            return True
    return check


def click_and_wait(driver, button, css):
    button.click()
    WebDriverWait(driver, 10).until(_page_left(button))
    return WebDriverWait(driver, 10).until(
        lambda d: d.find_elements(By.CSS_SELECTOR, css) or False)

def error_texts(driver):
    return [li.text for li in driver.find_elements(By.CSS_SELECTOR, "#bledy li")]


# ---------- login ----------

def log_in(driver, login, password):
    """Logs in through the form; returns the #flash element."""
    open_site(driver, "logowanie.php", By.ID, "form-logowanie")
    fill(driver, "login", login)
    fill(driver, "haslo", password)
    driver.find_element(By.ID, "zaloguj").click()
    return wait_for(driver, By.ID, "flash")


def log_out(driver):
    driver.find_element(By.ID, "nav-wyloguj").click()
    return wait_for(driver, By.ID, "flash")


def admin_row(driver, login):
    """Returns (status, failed attempts) of the account from the admin panel."""
    open_site(driver, "admin.php", By.ID, "uzytkownicy")
    row = driver.find_element(By.CSS_SELECTOR, f"tr[data-login='{login}']")
    return (row.find_element(By.CSS_SELECTOR, "td.status").text,
            row.find_element(By.CSS_SELECTOR, "td.proby").text)


# ---------- registration ----------

VALID_USER = dict(login="nowy_user", email="nowy@example.com", age="20",
                  password="Haslo1234", password2=None, terms=True)


def register(driver, **overrides):
    """Fills in and submits the registration form (valid data + overrides)."""
    data = {**VALID_USER, **overrides}
    if data["password2"] is None:
        data["password2"] = data["password"]
    open_site(driver, "rejestracja.php", By.ID, "form-rejestracja")
    fill(driver, "login", data["login"])
    fill(driver, "email", data["email"])
    fill(driver, "wiek", data["age"])
    fill(driver, "haslo", data["password"])
    fill(driver, "haslo2", data["password2"])
    if data["terms"]:
        driver.find_element(By.ID, "regulamin").click()
    driver.find_element(By.ID, "zarejestruj").click()
    WebDriverWait(driver, 10).until(
        lambda d: d.find_elements(By.CSS_SELECTOR, "#sukces, #bledy") or False)


# ---------- calculator ----------

def calculate(driver, value, card=False, code="", delivery="kurier"):
    """Fills in the calculator form and clicks Oblicz."""
    open_site(driver, "kalkulator.php", By.ID, "form-kalkulator")
    fill(driver, "wartosc", value)
    if card:
        driver.find_element(By.ID, "karta").click()
    fill(driver, "kod", code)
    driver.find_element(By.ID, f"dostawa-{delivery}").click()
    driver.find_element(By.ID, "oblicz").click()
    WebDriverWait(driver, 10).until(
        lambda d: d.find_elements(By.CSS_SELECTOR, "#wynik, #bledy") or False)


def result(driver):
    """(discount, delivery cost, to pay) as displayed by the calculator."""
    return (driver.find_element(By.ID, "rabat").text,
            driver.find_element(By.ID, "koszt-dostawy").text,
            driver.find_element(By.ID, "do-zaplaty").text)


# ---------- orders ----------

def order_row(driver, order_id):
    return driver.find_element(By.ID, f"zam-{order_id}")


def order_action_classes(driver, order_id):
    """Set of action names of the buttons shown for the order, e.g. {'oplac'}."""
    buttons = order_row(driver, order_id).find_elements(
        By.CSS_SELECTOR, "td.akcje button")
    return {b.get_attribute("class").replace("akcja-", "") for b in buttons}
