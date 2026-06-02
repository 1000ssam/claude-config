"""야간 자율작업 시각검증용 스크린샷.
usage: python shot.py <mode> <base_url> <outdir>
  mode = modal | result
  base_url 예: http://localhost:3100/newsletter   (끝 슬래시 없이)
"""
import sys
from playwright.sync_api import sync_playwright

mode, base, outdir = sys.argv[1], sys.argv[2].rstrip("/"), sys.argv[3].rstrip("/")

DESKTOP = {"width": 1280, "height": 900}
MOBILE = {"width": 390, "height": 844}


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        def shot(name, path, viewport, action=None, wait_sel=None):
            ctx = browser.new_context(viewport=viewport, device_scale_factor=2)
            page = ctx.new_page()
            page.goto(base + path, wait_until="networkidle", timeout=60000)
            if action:
                action(page)
            if wait_sel:
                page.wait_for_selector(wait_sel, timeout=15000)
            page.wait_for_timeout(600)
            out = f"{outdir}/{name}.png"
            page.screenshot(path=out)
            print("saved", out)
            ctx.close()

        if mode == "modal":
            shot("nm-home-desktop", "/", DESKTOP)

            def open_modal(page):
                page.get_by_role("button", name="구독 신청하기").first.click()

            shot("nm-modal-desktop", "/", DESKTOP, action=open_modal, wait_sel="[role=dialog]")
            shot("nm-modal-mobile", "/", MOBILE, action=open_modal, wait_sel="[role=dialog]")

        elif mode == "result":
            shot("nm-confirm-success", "/confirm/?status=success", DESKTOP)
            shot("nm-confirm-expired", "/confirm/?status=expired", DESKTOP)
            shot("nm-confirm-invalid", "/confirm/?status=invalid", DESKTOP)
            shot("nm-unsub-success", "/unsubscribe/?status=success", DESKTOP)
            shot("nm-unsub-invalid", "/unsubscribe/?status=invalid", DESKTOP)
            shot("nm-unsub-error", "/unsubscribe/?status=error", DESKTOP)

        browser.close()


run()
