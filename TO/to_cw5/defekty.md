# Defekty SklepTO 1.0

Wykryte testami Selenium (`to_cw5`). Oczekiwany wynik pochodzi ze specyfikacji
(`specyfikacja_SklepTO.md`), nie z zachowania aplikacji. Każdy defekt jest w kodzie testów
oznaczony `@pytest.mark.xfail(reason="DEF-xx", strict=True)`.

| ID | Wymaganie | Strona | Skrót |
|---|---|---|---|
| DEF-01 | REQ-UI-02 | Kontakt | pusty tytuł strony |
| DEF-02 | REQ-UI-03, REQ-KON-01 | Kontakt | obrazek bez `alt` |
| DEF-03 | REQ-UI-04, REQ-KON-01 | Kontakt | pole E-mail bez etykiety |
| DEF-04 | REQ-UI-05, REQ-KON-01 | Kontakt | pole E-mail typu `text` zamiast `email` |
| DEF-05 | REQ-KON-01 | Kontakt | brak limitu 120 znaków w polu E-mail |
| DEF-06 | REQ-LOG-02 | Logowanie | poprawne logowanie nie zeruje licznika prób |
| DEF-07 | REQ-REJ-05 | Rejestracja | wiek 100 jest akceptowany |
| DEF-08 | REQ-KAL-03 | Kalkulator | karta + STUDENT10 daje 20% zamiast 15% |
| DEF-09 | REQ-ZAM-04, 05, 07 | Zamówienia | z „Wysłane” można anulować zamówienie |
| DEF-10 | REQ-REJ-02 | Rejestracja | login z wielkimi literami jest akceptowany |

---

## DEF-01 – Pusty tytuł strony Kontakt
- **Wymaganie:** REQ-UI-02 – tytuł w postaci „SklepTO – &lt;nazwa strony&gt;”.
- **Kroki:** 1. Otwórz `/kontakt.php`. 2. Odczytaj tytuł karty (`<title>`).
- **Oczekiwany rezultat:** „SklepTO – kontakt” (lub podobny, z prefiksem „SklepTO – ”).
- **Rzeczywisty rezultat:** `<title></title>` – tytuł jest pusty.
- **Test:** `test_ui.py::test_page_title[kontakt.php]`

## DEF-02 – Obrazek bez tekstu alternatywnego (Kontakt)
- **Wymaganie:** REQ-UI-03.
- **Kroki:** 1. Otwórz `/kontakt.php`. 2. Sprawdź atrybut `alt` obrazka `logo.svg`.
- **Oczekiwany rezultat:** niepusty `alt`.
- **Rzeczywisty rezultat:** `<img src="logo.svg" width="60" height="60">` – brak `alt`.
- **Test:** `test_ui_checklist.py::test_images_have_alt[kontakt.php]`

## DEF-03 – Pole E-mail bez etykiety (Kontakt)
- **Wymaganie:** REQ-UI-04.
- **Kroki:** 1. Otwórz `/kontakt.php`. 2. Poszukaj `<label for="email">`.
- **Oczekiwany rezultat:** pole E-mail ma powiązaną etykietę.
- **Rzeczywisty rezultat:** brak etykiety; pole ma tylko `placeholder="E-mail"`.
- **Test:** `test_ui_checklist.py::test_fields_have_labels[kontakt.php]`

## DEF-04 – Pole E-mail nie jest typu `email` (Kontakt)
- **Wymaganie:** REQ-UI-05.
- **Kroki:** 1. Otwórz `/kontakt.php`. 2. Odczytaj atrybut `type` pola `#email`.
- **Oczekiwany rezultat:** `email`.
- **Rzeczywisty rezultat:** `text`.
- **Test:** `test_ui_checklist.py::test_email_field_type[kontakt.php]`

## DEF-05 – Brak limitu długości pola E-mail (Kontakt)
- **Wymaganie:** REQ-KON-01 – E-mail maks. 120 znaków.
- **Kroki:** 1. Otwórz `/kontakt.php`. 2. Odczytaj atrybut `maxlength` pola `#email`.
- **Oczekiwany rezultat:** `maxlength="120"` (jak `maxlength="60"` w polu Imię).
- **Rzeczywisty rezultat:** brak atrybutu `maxlength`.
- **Test:** `test_kontakt.py::test_field_length_limits[email-120]`

## DEF-06 – Poprawne logowanie nie zeruje licznika nieudanych prób
- **Wymaganie:** REQ-LOG-02 (oraz REQ-LOG-03, REQ-LOG-04 – „kolejne” nieudane próby).
- **Kroki:** 1. Reset danych. 2. Zaloguj się jako `jan` z błędnym hasłem dwa razy.
  3. Zaloguj się poprawnie (`Haslo123`). 4. Otwórz Administracja i odczytaj „Nieudane próby” jana.
- **Oczekiwany rezultat:** 0 (po poprawnym logowaniu licznik jest zerowany).
- **Rzeczywisty rezultat:** 2 – licznik pozostaje. Skutek: kolejna pomyłka po udanym logowaniu
  nie daje „Pozostało prób: 2”, a konto można zablokować błędami rozdzielonymi poprawnym logowaniem.
- **Test:** `test_login.py::test_successful_login_resets_counter`

## DEF-07 – Wiek 100 jest akceptowany
- **Wymaganie:** REQ-REJ-05 – wiek 18–99 włącznie.
- **Kroki:** 1. Otwórz `/rejestracja.php`. 2. Wypełnij poprawnie wszystkie pola, wiek = `100`.
  3. Kliknij „Zarejestruj”.
- **Oczekiwany rezultat:** błąd „Wiek musi być liczbą całkowitą z zakresu 18–99.”, konto nie powstaje.
- **Rzeczywisty rezultat:** brak błędu, konto zostaje utworzone (wartość graniczna 100 jest akceptowana).
- **Test:** `test_rejestracja.py::test_age_rules[100]`

## DEF-08 – Błędny rabat dla karty i kodu STUDENT10
- **Wymaganie:** REQ-KAL-03, REQ-KAL-08 – karta **i** kod = 15%.
- **Kroki:** 1. Otwórz `/kalkulator.php`. 2. Wartość `150`, zaznacz kartę, kod `student10`,
  dostawa Kurier. 3. Kliknij „Oblicz”.
- **Oczekiwany rezultat:** rabat 15%, dostawa 0.00 zł, do zapłaty 127.50 zł (przykład ze specyfikacji).
- **Rzeczywisty rezultat:** rabat 20%, dostawa 0.00 zł, do zapłaty 120.00 zł. Rabaty z karty (10%)
  i z kodu (10%) są sumowane, choć „rabaty nie sumują się”. Poprawnie działają przypadki
  „tylko karta” i „tylko kod” (10%).
- **Testy:** `test_kalkulator.py::test_example_from_specification`,
  `test_calculation[card-and-code]`, `[max-value]`, `[rounding-up]`

## DEF-09 – Anulowanie zamówienia w stanie „Wysłane”
- **Wymaganie:** REQ-ZAM-04 (dozwolone tylko: Wysłane → Dostarczone), REQ-ZAM-05, REQ-ZAM-07.
- **Kroki:** 1. Reset danych, zaloguj się jako `jan`, otwórz Zamówienia.
  2. Zobacz przyciski przy zamówieniu #3 (Wysłane). 3. Kliknij „Anuluj” (lub otwórz
  `akcja.php?id=3&akcja=anuluj`).
- **Oczekiwany rezultat:** przy #3 tylko „Potwierdź dostawę”; wywołanie `anuluj` daje
  „Niedozwolone przejście: Wysłane → anuluj.” i status bez zmian.
- **Rzeczywisty rezultat:** przy #3 jest też przycisk „Anuluj”, a akcja zmienia status na
  „Anulowane” („Zamówienie #3: Wysłane → Anulowane.”).
- **Testy:** `test_zamowienia.py::test_action_buttons_match_state[shipped]`,
  `test_forbidden_transitions_by_url[shipped-cancel]`

## DEF-10 – Login z wielkimi literami jest akceptowany
- **Wymaganie:** REQ-REJ-02 – tylko małe litery a–z, cyfry i `_`.
- **Kroki:** 1. Otwórz `/rejestracja.php`. 2. Login `Nowy_User`, pozostałe pola poprawne,
  regulamin zaznaczony. 3. Kliknij „Zarejestruj”.
- **Oczekiwany rezultat:** błąd „Login musi mieć od 3 do 20 znaków (małe litery, cyfry, _).”
- **Rzeczywisty rezultat:** konto zostaje utworzone.
- **Test:** `test_rejestracja.py::test_login_rules[uppercase]`
