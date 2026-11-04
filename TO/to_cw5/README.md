# to_cw5 – testy Selenium SklepTO

    pip install -r requirements.txt
    python -m pytest -v
    python -m pytest --html=report.html --self-contained-html

Adres aplikacji: `SKLEPTO_URL` (domyślnie `http://localhost/sklepTO`). Przed sesją baza jest resetowana (`install.php?reset=1`).
Znane defekty: `defekty.md` (testy oznaczone `xfail`, `reason="DEF-xx"`).
