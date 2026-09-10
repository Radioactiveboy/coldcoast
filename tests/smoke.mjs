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
await wait(900);
// The opening scene stands between the picker and the map now.
check("the opening scene names the threat", await page.evaluate(() =>
  /Rendfast Host/.test(document.querySelector(".fixed.inset-0.z-50")?.innerText || "")));
await click("Call the muster");
await page.waitForSelector("svg.cc-worldmap", { timeout: 30000 });
await wait(1500);

check("the world renders", await page.evaluate(() => !!document.querySelector("svg.cc-basemap")));

// Ground you have not seen keeps its shape: it is drawn in bands of relief
// rather than as one flat black shroud, so the coast and the ranges read from
// the first turn. One tone means the silhouette is gone.
const fogTones = await page.evaluate(() => new Set(
  [...document.querySelectorAll("svg.cc-overmap path")]
    .map((p) => p.getAttribute("fill"))
    .filter((f) => f && /^#[0-9a-f]{6}$/i.test(f))).size);
check("unexplored ground still shows its shape", fogTones > 4, `${fogTones} tones`);
check("the ground carries its names", await page.evaluate(() =>
  document.querySelectorAll(".cc-mapname").length) > 8);

// About a third of the woodland is holding a feral herd, which is the thing
// that stops early scouting being a walk. There is no way to check a spawn
// rate by playing it — you would have to walk into every wood in Europe.
const wild = await page.evaluate(() => window.__ccWild && window.__ccWild());
check("a third of the woods are held by something",
  !!wild && wild.herds / Math.max(1, wild.woods) > 0.25 && wild.herds / wild.woods < 0.45,
  wild ? `${wild.herds} herds in ${wild.woods} woods` : "no hook");
check("every realm has a host walking at it", !!wild && wild.mobs >= 7, `${wild?.mobs} hosts`);

// The ambience is synthesised and there is no way to hear a headless browser,
// so check the plumbing instead: the layers exist, the season moves the wind,
// and standing on a shore brings the sea up. Silence here is a broken graph.
const heard = () => page.evaluate(() => window.__ccHeard && window.__ccHeard());
const airSpring = await heard();
for (let i = 0; i < 3; i++) { await click("End (spring|summer|autumn|winter)"); await wait(320); }
await wait(1400);
const airWinter = await heard();
check("the season is audible", !!airSpring && !!airWinter
  && airWinter.season === "winter" && airWinter.wind > airSpring.wind,
  airSpring ? `wind ${airSpring.wind} -> ${airWinter?.wind}` : "no ambience running");
await page.evaluate((c, r) => window.__ccPick(c, r), 17, 81);   // Plymouth Hulk, a shore
await wait(1500);
const airShore = await heard();
check("a shore brings up the sea", !!airShore && airShore.coast && airShore.sea > 0.002,
  airShore ? `sea ${airShore.sea}` : "no ambience running");

/* Ending those seasons let the opening Waster host reach the seat, which is
   exactly what it is for. Fight it here — a battle overlay left standing would
   sit in front of every check below it, and beating them is where the captives
   come from. */
const purse = () => page.evaluate(() => {
  const t = document.querySelector("header")?.innerText || "";
  const g = (label) => {
    const m = t.match(new RegExp("([\\d,]+)\\s*\\n?\\s*" + label, "i"));
    return m ? +m[1].replace(/,/g, "") : 0;
  };
  return { scrap: g("Scrap"), food: g("Rations"), men: g("Recruits") };
});
const fightOut = async (rounds = 14) => {
  for (let i = 0; i < rounds; i++) {
    const t = await page.evaluate(() => document.body.innerText);
    if (!/Give the order/.test(t)) break;
    await click("Give the order"); await wait(320);
    await click("Count the cost|Fight it out|Press on"); await wait(260);
  }
  await page.evaluate(() => {
    const ov = document.querySelector(".fixed.inset-0.z-50");
    if (ov) [...ov.querySelectorAll("button")].pop()?.click();
  });
  await wait(400);
};
const beforeHost = await purse();
let metHost = await page.evaluate(() => /Give the order/.test(document.body.innerText));
for (let i = 0; i < 6 && !metHost; i++) {
  await click("End (spring|summer|autumn|winter)"); await wait(360);
  metHost = await page.evaluate(() => /Give the order/.test(document.body.innerText));
}
check("the opening host comes for the seat", metHost);
await fightOut();
const afterHost = await purse();
check("breaking a band gives up what it was carrying",
  afterHost.men > beforeHost.men || afterHost.scrap > beforeHost.scrap,
  `men ${beforeHost.men} -> ${afterHost.men}, scrap ${beforeHost.scrap} -> ${afterHost.scrap}`);


// A zoom gesture is a composited transform, which is what makes it cheap —
// and what left the map soft when it stopped, because a scaled layer is the
// old pixels stretched. Once the gesture settles the maps have to be drawn at
// the scale they are being shown at, or zooming in looks blocky.
await page.mouse.move(700, 450);
for (let i = 0; i < 8; i++) { await page.mouse.wheel({ deltaY: -220 }); await wait(70); }
await wait(700);
const sharp = await page.evaluate(() => {
  const b = document.querySelector("svg.cc-basemap");
  return { drawn: +b.getAttribute("width"), shown: b.getBoundingClientRect().width };
});
check("the map redraws sharp at the zoom you stop on", Math.abs(sharp.drawn - sharp.shown) < 2,
  `drawn ${Math.round(sharp.drawn)}px, shown at ${Math.round(sharp.shown)}px`);
for (let i = 0; i < 8; i++) { await page.mouse.wheel({ deltaY: 220 }); await wait(70); }
await wait(500);
await page.evaluate((c, r) => window.__ccPick(c, r), 25, 77);
await wait(300);
check("a province can be selected",
  /Lunden/.test(await page.evaluate(() => document.querySelector("aside").innerText)));

// Advances come in tiers now and a tier stays out of sight until the one
// below it is nearly done. At turn one a realm knows at most one advance, so
// everything past Tribal must be shrouded — named, counted, but not readable.
await page.evaluate(() => {
  const b = [...document.querySelectorAll("header button")].find((x) => x.getAttribute("aria-label") === "Advances");
  if (b) b.click();
});
await wait(350);
await click("Consult the scholars");
await wait(500);
const tree = await page.evaluate(() => document.querySelector(".fixed.inset-0.z-50")?.innerText || "");
check("the tech tree opens from Consult the scholars", /TRIBAL/.test(tree));
check("later tiers are shrouded at the start",
  /Learn \d+ more Tribal advance/.test(tree) && !/Bloomery|Vault craft/.test(tree),
  /Bloomery|Vault craft/.test(tree) ? "a locked tier is naming its advances" : "");
check("the long muster is one of the tribal advances", /Long muster/.test(tree));


// The tree has to read as a tree: every advance in view that needs something
// must have a line drawn into it, and clicking one must light its own lines
// so you can see what it opens. Both were asked for by name.
const lit = () => page.evaluate(() => [...document.querySelectorAll("svg.cc-tree path")]
  .filter((p) => p.getAttribute("stroke") === "#8fe3d6").length);
const paths = await page.evaluate(() => document.querySelectorAll("svg.cc-tree path").length);
const litBefore = await lit();
await page.evaluate(() => {
  const t = [...document.querySelectorAll("svg.cc-tree text")].find((x) => x.textContent === "Bowyery");
  t?.closest("g").dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
// React commits on its own schedule; measuring in the same evaluate as the
// click reads the old paint and the check can never fail.
await wait(300);
const litAfter = await lit();
check("the tree draws its lines", paths > 4, `${paths} paths`);
check("picking an advance lights the lines into it",
  litBefore > 0 && litAfter > 0 && litAfter !== litBefore, `lit ${litBefore} -> ${litAfter}`);

// A named place builds through its district: a row of slots that opens with
// the population, each holding a chain that can be improved twice. Learn
// something buildable, raise it, and check the improvement is offered.
await page.evaluate(() => {
  const t = [...document.querySelectorAll("svg.cc-tree text")].find((x) => x.textContent === "Scavenging");
  t?.closest("g").dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
await wait(250);
await click("Set the scholars on it");
await wait(350);
await page.evaluate(() => {
  const ov = document.querySelector(".fixed.inset-0.z-50");
  if (ov) ov.querySelector("button")?.click();
});
await wait(250);
await page.evaluate(() => {
  const ov = document.querySelector(".fixed.inset-0.z-50");
  if (ov) ov.querySelector("button")?.click();
});
await wait(250);
await page.evaluate(() => {
  const ov = document.querySelector(".fixed.inset-0.z-50");
  if (ov) ov.querySelector("button")?.click();
});
await wait(250);

for (let i = 0; i < 6; i++) { await click("End (spring|summer|autumn|winter)"); await wait(300); }
await page.evaluate((c, r) => window.__ccPick(c, r), 25, 77);
await wait(300);
check("a settlement opens a district", await click("Build in the district"));
await wait(400);
const slots = await page.evaluate(() => ({
  open: document.querySelectorAll(".cc-slotempty").length,
  filled: document.querySelectorAll(".cc-slotfull").length,
}));
check("the district has slots to fill", slots.open + slots.filled >= 4,
  `${slots.open} empty, ${slots.filled} filled`);
await page.evaluate(() => document.querySelector(".cc-slotempty")?.click());
await wait(300);
const raised = await page.evaluate(() => {
  const c = [...document.querySelectorAll(".cc-pickcard")].find((x) => /Salvage yard/.test(x.textContent) && !x.disabled);
  if (!c) return false;
  c.click(); return true;
});
check("something can be raised on empty ground", raised);
await wait(350);
await page.evaluate(() => {
  const ov = document.querySelector(".fixed.inset-0.z-50");
  if (ov) ov.querySelector("button")?.click();
});
await wait(250);
for (let i = 0; i < 4; i++) { await click("End (spring|summer|autumn|winter)"); await wait(300); }
await page.evaluate((c, r) => window.__ccPick(c, r), 25, 77);
await wait(300);
await click("Build in the district");
await wait(400);
const up = await page.evaluate(() =>
  ([...document.querySelectorAll(".cc-slotup")].map((b) => b.textContent).join(" ")));
check("a finished building offers its next level", /Cutting floor/.test(up), up.slice(0, 60));
await page.evaluate(() => {
  const ov = document.querySelector(".fixed.inset-0.z-50");
  if (ov) ov.querySelector("button")?.click();
});
await wait(250);

// Merging two warbands was reported as "basically impossible": holding one
// warband made every later click keep that first one in hand, so clicking
// another of your own did not select it and there was no visible way to
// switch. Both starting warbands share the capital hex, so this is cheap to
// check and worth keeping honest.
await page.evaluate((c, r) => window.__ccPick(c, r), 25, 77);
await wait(300);
const bandsBefore = await page.evaluate(() =>
  (document.querySelector("aside").innerText.match(/Merge .* into this warband/) || []).length);
check("a merge is offered for two warbands on one hex", bandsBefore > 0);
await click("Put this warband in hand");
await wait(250);
check("clicking another warband hands you that one",
  /in hand/.test(await page.evaluate(() => document.querySelector("aside").innerText)));
await click("Merge .* into this warband");
await wait(400);
const oneBand = await page.evaluate(() =>
  !/Merge .* into this warband/.test(document.querySelector("aside").innerText));
check("the two warbands become one", oneBand);

// A warband keeps the name you give it, and a company can be peeled off into
// one of its own — which is the only way out of a warband sitting at the
// eight-company limit. Split and then merge back, so the rest of this test
// starts from the same position it did before.
await click("^rename$");
await wait(200);
await page.evaluate(() => {
  const i = document.querySelector("aside input.cc-namefield");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(i, "The Thames Wolves");
  i.dispatchEvent(new Event("input", { bubbles: true }));
});
await click("Name it");
await wait(300);
check("a warband can be renamed",
  /The Thames Wolves/.test(await page.evaluate(() => document.querySelector("aside").innerText)));

await click("March out alone");
await wait(350);
const splitOk = /Merge .* into this warband/.test(
  await page.evaluate(() => document.querySelector("aside").innerText));
check("a company can march out on its own", splitOk,
  splitOk ? "" : "no second warband appeared to merge back");

// Merging two warbands standing on NEIGHBOURING hexes is its own path, and
// it broke once already: making every click switch which warband is in hand
// meant you could never hold one and look at another, so the order had
// nowhere to appear. March the splinter next door and put them back together
// from there — which also leaves the host back on 25,77 for the march below.
await page.evaluate((c, r) => window.__ccPick(c, r), 24, 77);
await wait(200);
await click("March here|March in and take it");
await wait(350);
await page.evaluate((c, r) => window.__ccPick(c, r), 24, 77);
await wait(200);
await page.evaluate((c, r) => window.__ccPick(c, r), 25, 77);
await wait(250);
const adjacentOrder = /Merge forces with/.test(
  await page.evaluate(() => document.querySelector("aside").innerText));
check("two warbands a hex apart can be combined", adjacentOrder,
  adjacentOrder ? "" : "no merge order offered from the neighbouring hex");
await click("Merge forces with");
await wait(400);

// Pick a fight on purpose. The battle screen carried two undefined symbols
// (stanceChips, CompanyRow) for the whole life of the project and this test
// never noticed, because across forty seasons the AI happens never to attack —
// so the branch that renders it was simply never entered. A game whose combat
// screen cannot open is not a working game, so we now walk to the waster lair
// west of Lunden and hit it.
let ac = 25, ar = 77;
for (let step = 0; step < 30 && ac > 20; step++) {
  await page.evaluate((c, r) => window.__ccPick(c, r), ac, ar);
  await wait(120);
  await page.evaluate((c, r) => window.__ccPick(c, r), ac - 1, ar);
  await wait(140);
  const moved = await click("March here|March in and take it");
  if (moved) { ac -= 1; await wait(160); }
  else { await click("End (spring|summer|autumn|winter)"); await wait(320); }
}
check("the host can march to the lair", ac === 20, `stopped at ${ac},${ar}`);

// Investigate it — that is what puts a waster warband in the ruin.
for (let i = 0; i < 8; i++) {
  await page.evaluate((c, r) => window.__ccPick(c, r), 20, 77);
  await wait(140);
  if (await click("Send them in|Investigate|Survey")) break;
  await click("End (spring|summer|autumn|winter)"); await wait(320);
}
await wait(500);
await page.evaluate(() => {
  const ov = document.querySelector(".fixed.inset-0.z-50");
  if (ov) [...ov.querySelectorAll("button")].pop()?.click();
});
await wait(300);
await click("End (spring|summer|autumn|winter)"); await wait(600);

// Stand next to it and attack.
await page.evaluate(() => window.__ccPick(21, 77)); await wait(140);
await page.evaluate(() => window.__ccPick(20, 77)); await wait(200);
// Clearing a lair pays out what was in it. The loot was being written onto the
// province when the lair was found and then never given to anybody, so taking
// a waster hold got you the ground and nothing else.
const canAttack = await click("Attack the");
await wait(700);
const battle = await page.evaluate(() => ({
  open: !!document.querySelector(".fixed.inset-0.z-50"),
  kids: document.getElementById("root")?.children.length ?? 0,
  orders: /Give the order/.test(document.body.innerText),
}));
check("a battle can be started", canAttack && battle.open, canAttack ? "" : "no attack order offered");
check("the battle screen renders", battle.kids > 0 && battle.orders,
  `#root children ${battle.kids}, orders ${battle.orders}`);
if (battle.open) {
  await click("Give the order"); await wait(500);
  await click("Count the cost|Fight it out|Press on"); await wait(400);
  await page.evaluate(() => {
    const ov = document.querySelector(".fixed.inset-0.z-50");
    if (ov) [...ov.querySelectorAll("button")].pop()?.click();
  });
  await wait(400);
}
check("the game survives the battle", await page.evaluate(() =>
  (document.getElementById("root")?.children.length ?? 0) > 0));

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

// The position must survive the tab closing, which is the whole point of a
// save. Compare the header — turn, holdings, warbands — across a real reload.
const headerBefore = await page.evaluate(() => document.querySelector("header")?.innerText || "");
await page.reload({ waitUntil: "networkidle0" });
await wait(600);
check("a saved game is offered on return", await page.evaluate(() =>
  [...document.querySelectorAll("button")].some((b) => /Continue as/.test(b.textContent))));
await click("Continue as");
await page.waitForSelector("svg.cc-worldmap", { timeout: 30000 }).catch(() => {});
await wait(1200);
const headerAfter = await page.evaluate(() => document.querySelector("header")?.innerText || "");
check("the position survives a reload", !!headerBefore && headerAfter === headerBefore,
  headerAfter === headerBefore ? "" : `"${headerBefore.replace(/\n/g, " ")}" -> "${headerAfter.replace(/\n/g, " ")}"`);

await browser.close();
process.exit(failures ? 1 : 0);
