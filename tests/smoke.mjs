/* A headless smoke test. Builds nothing — point it at a running dev server,
   or at `npm run preview` after a build.

   Usage:  npm run dev            (in one terminal)
           npm test               (in another)

   It drives the real UI with a real mouse: takes a banner, checks the map
   renders, clicks a province, and runs a stretch of seasons watching for
   errors. Most bugs in this project have been caught exactly this way. */
import puppeteer from "puppeteer-core";

const URL = process.env.CC_URL || "http://localhost:5173/";
const CHROME = process.env.CHROME_PATH
  || "/usr/bin/google-chrome"
  || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await puppeteer.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 880 });

const errors = [];
page.on("pageerror", (e) => errors.push(e.message.split("\n")[0]));
// Only the app's own errors matter here. A blocked webfont or a missing
// favicon is not a bug in the game, so those are filtered out deliberately.
page.on("console", (m) => {
  const t = m.text();
  const external = /fonts\.googleapis|fonts\.gstatic|favicon/.test(t)
    || /Failed to load resource/.test(t);
  if (m.type() === "error" && !external) errors.push(t.slice(0, 120));
});

let failures = 0;
const check = (name, ok, note = "") => {
  console.log(`${ok ? "  pass  " : "  FAIL  "}${name}${note ? `  ${note}` : ""}`);
  if (!ok) failures++;
};
const click = (re) =>
  page.evaluate((r) => {
    const b = [...document.querySelectorAll("button")].find((x) => new RegExp(r).test(x.textContent));
    if (b) { b.click(); return true; }
    return false;
  }, re);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto(URL, { waitUntil: "networkidle0" });
await wait(500);
await click("Begin");
await wait(400);

// Deliberately NOT the click() helper above. element.click() succeeds on a
// button no human could reach, and that is exactly what happened here: the
// picker was pinned to 100vh with overflow:hidden, so "take up the banner"
// sat below the fold on any screen under ~1050px with nothing to scroll.
// The helper clicked it happily and the test passed while the game could not
// be started at all. A handle click drives a real mouse, scrolling first.
const banner = (await page.evaluateHandle(() =>
  [...document.querySelectorAll("button")].find((b) => /Take up the banner/.test(b.textContent))
)).asElement();
check("the banner button exists", !!banner);

// Scroll the way a player does — a real wheel — and not with scrollIntoView().
// A box with overflow:hidden is still scrollable from script, so scrollIntoView
// reaches a button the wheel never can, and the test passes on a screen the
// player is stuck on. The wheel is the honest question: can a human get there?
const vh = page.viewport().height;
const onScreen = async () => {
  const b = await banner.boundingBox();
  return b && b.y >= 0 && b.y + b.height <= vh;
};
await page.mouse.move(page.viewport().width / 2, vh / 2);
for (let i = 0; i < 12 && !(await onScreen()); i++) {
  await page.mouse.wheel({ deltaY: 200 });
  await wait(60);
}
const box = await banner.boundingBox();
check("the banner button can be reached by scrolling", await onScreen(),
  box ? `bottom ${Math.round(box.y + box.height)} of ${vh}` : "no box");
await banner.click();
await page.waitForSelector("svg.cc-worldmap", { timeout: 30000 });
await wait(1500);

check("the world renders", await page.evaluate(() => !!document.querySelector("svg.cc-basemap")));
await page.evaluate((c, r) => window.__ccPick(c, r), 25, 77);
await wait(300);
check("a province can be selected",
  /Lunden/.test(await page.evaluate(() => document.querySelector("aside").innerText)));

let seasons = 0;
for (let i = 0; i < 200 && seasons < 40; i++) {
  const text = await page.evaluate(() => document.body.innerText);
  if (text.includes("Give the order")) {
    await click("Fight it out"); await wait(120);
    await click("Count the cost"); await wait(120);
    continue;
  }
  if (text.includes("Start again")) break;
  if (!(await click("End (spring|summer|autumn|winter)"))) break;
  await wait(50);
  seasons++;
}
check("forty seasons pass", seasons === 40, `${seasons}`);
check("no NaN on screen", !/NaN/.test(await page.evaluate(() => document.body.innerText)));
check("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));

await browser.close();
process.exit(failures ? 1 : 0);
