"""Render app assets from shuffle-mark.svg using local Python Playwright/Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
svg = (ROOT / 'assets/shuffle-mark.svg').read_text()
mark = svg.split('>', 1)[1].rsplit('</svg>', 1)[0]

def icon(background, foreground, scale=14):
    offset = (1024 - 48 * scale) / 2
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" color="{foreground}"><rect width="1024" height="1024" fill="{background}"/><g transform="translate({offset} {offset}) scale({scale})">{mark}</g></svg>'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1024, 'height': 1024}, device_scale_factor=1)
    for filename, background, foreground in [
        ('icon.png', '#061D2A', '#D8B878'),
        ('icon-dark.png', '#04131D', '#CFAE71'),
        ('icon-tinted.png', '#141414', '#E8E8E8'),
        ('adaptive-icon.png', 'none', '#D8B878'),
        ('splash.png', 'none', '#D8B878'),
    ]:
        scale = 11 if filename == 'adaptive-icon.png' else 14
        page.set_content('<style>*{margin:0}svg{display:block}</style>' + icon(background, foreground, scale))
        page.screenshot(path=str(ROOT / 'assets' / filename), omit_background=background == 'none')
    page.set_viewport_size({'width': 48, 'height': 48})
    page.set_content('<style>*{margin:0}svg{display:block;width:48px;height:48px}</style>' + icon('#061D2A', '#D8B878'))
    page.screenshot(path=str(ROOT / 'assets/favicon.png'))
    browser.close()
print('Rendered Shuffle app assets from assets/shuffle-mark.svg')
