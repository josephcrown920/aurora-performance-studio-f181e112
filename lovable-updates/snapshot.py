import asyncio
from playwright.async_api import async_playwright
OUT="/dev-server/lovable-updates/screenshots"
pages=["/","/studio","/canvas","/layers","/lagos40","/perform-anywhere","/director-room","/video-agent","/motion","/lipsync","/library","/colors","/previs","/tools","/billing","/auth","/pricing","/guides","/contact","/admin"]
pa=["/perform-anywhere","/perform-anywhere?experience=grwm"]
async def shot(page,url,path):
    try:
        await page.goto("http://localhost:8080"+url,wait_until="domcontentloaded",timeout=30000)
        await page.wait_for_timeout(6000)
        await page.screenshot(path=path); print("ok",url)
    except Exception as e: print("fail",url,e)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        pg=await (await b.new_context(viewport={"width":1280,"height":1800})).new_page()
        for u in pages:
            n=(u.strip("/") or "home").replace("/","-")
            await shot(pg,u,f"{OUT}/pages/{n}.png")
        for i,u in enumerate(pa):
            await shot(pg,u,f"{OUT}/perform-anywhere/{i+1:02d}-{'main' if i==0 else 'get-ready-with-me'}-full.png")
            h=await pg.evaluate("document.body.scrollHeight")
            y=0;k=1
            while y<h and k<=6:
                await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(800)
                await pg.screenshot(path=f"{OUT}/perform-anywhere/{i+1:02d}-section-{k}.png"); y+=1700;k+=1
        m=await (await b.new_context(viewport={"width":390,"height":844})).new_page()
        await shot(m,"/perform-anywhere?experience=grwm",f"{OUT}/perform-anywhere/03-grwm-mobile.png")
        await b.close()
asyncio.run(main())
