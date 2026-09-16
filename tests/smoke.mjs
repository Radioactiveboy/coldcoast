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
/* Warband detail now lives in the bar along the foot of the map and the ground
   detail in the right-hand panel, so most checks want both. */
const panelText = () => page.evaluate(() => [
  document.querySelector("aside")?.innerText || "",
  document.querySelector(".cc-warbar")?.innerText || "",
].join("\n"));
/* Companies open on a click, the way a unit card does in a strategy game. */
const openCompany = async (n = 0) => {
  const did = await page.evaluate((i) => {
    const u = document.querySelectorAll(".cc-warbar .cc-wbunit")[i];
    if (!u) return false;
    if (!u.classList.contains("cc-wbon")) u.click();
    return true;
  }, n);
  await wait(250);
  return did;
};
const popText = () => page.evaluate(() => document.querySelector(".cc-wbpop")?.innerText || "");

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
check("the opening asks who you were", await page.evaluate(() =>
  /hunter's child/.test(document.querySelector(".fixed.inset-0.z-50")?.innerText || "")));
await click("The captain's child");
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
/* A battle now opens on the deployment screen — the line has to be drawn
   before anybody swings — so taking the field is step one of fighting one. */
const inBattle = () => page.evaluate(() =>
  /Take the field|Give the order/.test(document.body.innerText));
let sawAftermath = false;
const fightOut = async (rounds = 14) => {
  await click("Take the field"); await wait(300);
  for (let i = 0; i < rounds; i++) {
    const t = await page.evaluate(() => document.body.innerText);
    if (!/Give the order/.test(t)) break;
    await click("Give the order"); await wait(320);
    if (await page.evaluate(() => /Let them go/.test(document.querySelector(".fixed.inset-0.z-50")?.innerText || ""))) sawAftermath = true;
    await click("Count the cost"); await wait(260);
  }
  await page.evaluate(() => {
    const ov = document.querySelector(".fixed.inset-0.z-50");
    if (ov) [...ov.querySelectorAll("button")].pop()?.click();
  });
  await wait(400);
};
const beforeHost = await purse();
let metHost = await inBattle();
for (let i = 0; i < 6 && !metHost; i++) {
  await click("End (spring|summer|autumn|winter)"); await wait(360);
  metHost = await inBattle();
}
check("the opening host comes for the seat", metHost);
await fightOut();
const afterHost = await purse();
check("a won field asks what to do with the broken", sawAftermath);
check("breaking a band gives up what it was carrying",
  afterHost.men > beforeHost.men || afterHost.scrap > beforeHost.scrap,
  `men ${beforeHost.men} -> ${afterHost.men}, scrap ${beforeHost.scrap} -> ${afterHost.scrap}`);

/* Nobody leads a warband because it was raised. You appoint somebody from
   the hall, and it costs. */
await page.evaluate((c, r) => window.__ccPick(c, r), 25, 77); await wait(300);
check("a warband starts with nobody leading it", await page.evaluate(() =>
  /Nobody leads them/.test(document.querySelector(".cc-warbar")?.innerText || "")));
{
  const scrapNow = () => page.evaluate(() => +((document.querySelector("header")?.innerText.match(/([\d,]+)\s*\n?\s*Scrap/) || [])[1] || "0").replace(/,/g, ""));
  const before = await scrapNow();
  await click("Nobody leads them"); await wait(350);
  const hall = await page.evaluate(() => document.querySelector(".fixed.inset-0.z-50")?.innerText || "");
  check("the hall has men waiting and names a price", /Waiting in the hall/.test(hall) && /Wants \d+ scrap/.test(hall),
    hall.match(/Wants \d+ scrap/)?.[0] || "no price");
  await click("Give them the command"); await wait(450);
  const after = await scrapNow();
  check("appointing a captain costs scrap and takes effect at once",
    after < before && /Captain [A-Z]/.test(await panelText()),
    `${before} -> ${after} scrap`);
}

/* Companies carry a rank, and it is said in words — on the card in the bar,
   and in full when you open the company. */
await openCompany(0);
check("companies carry a rank",
  /Rank \d · (Raw|Blooded|Seasoned|Hardened|Veteran|Elder)/.test(await popText()),
  (await popText()).match(/Rank \d · \w+/)?.[0] || "no rank line");
check("the bar names the rank on the company card", await page.evaluate(() =>
  /Raw|Blooded|Seasoned|Hardened|Veteran|Elder/.test(
    document.querySelector(".cc-warbar .cc-wbunit")?.innerText || "")));
check("the bar says how much room is left in the warband",
  /room for \d|full/.test(await page.evaluate(() => document.querySelector(".cc-warbar")?.innerText || "")),
  (await page.evaluate(() => document.querySelector(".cc-warbar")?.innerText || "")).match(/room for \d|full/)?.[0] || "no room line");

/* Meeting a people for the first time is a scene with lore and an answer, and
   the answer has to do something you can point at afterwards. Red-Ruth is a
   dozen seasons' walk away, so the test puts your riders on the rim. */
{
  const rates = () => page.evaluate(() => {
    const t = document.querySelector("header")?.innerText || "";
    const g = (l) => { const m = t.match(new RegExp(l + "\\s*([+\u2212-][\\d]+)", "i")); return m ? m[1] : "?"; };
    return `${g("Scrap")}/${g("Powder")}/${g("Rations")}`;
  });
  const ledgerBefore = await rates();
  await page.evaluate(() => window.__ccTest.meet("quarrymen")); await wait(450);
  const scene = await page.evaluate(() => document.querySelector(".fixed.inset-0.z-50")?.innerText || "");
  check("meeting a people opens a scene, not a log line",
    /Quarrymen of Red-Ruth/.test(scene) && /Gorran Black/.test(scene),
    (scene.split("\n")[1] || "").slice(0, 40));
  check("the scene carries lore and four answers",
    /china clay pits/.test(scene)
    && ["Send a man down", "Ask the Pit-King", "Range your guns", "Mark it on the map"]
      .every((t) => scene.includes(t)));
  await click("Ask the Pit-King"); await wait(300);
  check("an answer shows what came of it before you commit",
    /carts start east/.test(await page.evaluate(() => document.querySelector(".fixed.inset-0.z-50")?.innerText || "")));
  await click("So it is said"); await wait(450);
  const meet = await page.evaluate(() => window.__ccWild());
  check("the answer is remembered", (meet.regard || []).some((r) => /^quarrymen:/.test(r)),
    (meet.regard || []).join(" "));
  check("a standing arrangement shows in the ledger",
    (meet.pacts || []).includes("quarrymen:quarryTrade") && (await rates()) !== ledgerBefore,
    `${ledgerBefore} -> ${await rates()}`);
  check("the scene closes once it is answered",
    await page.evaluate(() => !document.querySelector(".fixed.inset-0.z-50")));
}

/* Someone comes to the hall, and can be heard and answered. */
await page.evaluate(() => window.__ccTest.knock()); await wait(300);
check("somebody waits in the hall", await page.evaluate(() => !!document.querySelector(".cc-hallrow")));
await page.evaluate(() => document.querySelector(".cc-hallrow")?.click()); await wait(350);
const heardOne = await page.evaluate(() => (document.querySelector(".fixed.inset-0.z-50")?.innerText || "").includes("In the hall"));
await page.evaluate(() => [...document.querySelectorAll(".fixed.inset-0.z-50 .cc-origin")][0]?.click()); await wait(400);
check("a petition is heard and answered", heardOne && await page.evaluate(() => !document.querySelector(".cc-hallrow")));

/* The season card and the goals. Ending a season after the host is broken
   has to tick the first goal and put a card up saying what the season did. */
await click("End (spring|summer|autumn|winter)"); await wait(500);
if (await inBattle()) await fightOut();
check("the season is summed up on a card", await page.evaluate(() =>
  /of year/.test(document.querySelector(".cc-seasoncard")?.innerText || "")));
check("breaking the host ticks the first goal", await page.evaluate(() =>
  document.querySelectorAll(".cc-goaltickon").length >= 1),
  await page.evaluate(() => (document.querySelector(".cc-goals")?.innerText || "").split("\n").slice(0, 3).join(" | ")));
check("the season button says who has not moved", await page.evaluate(() =>
  /not moved/.test([...document.querySelectorAll("header button")].map((b) => b.innerText).join(" "))));

/* Bringing a company back up to strength takes exactly the men it puts in
   the line. It used to charge a field premium on the bodies as well as the
   kit, so "bring up 20 men" quietly took 34 of them. */
{
  await page.evaluate((c, r) => window.__ccPick(c, r), 25, 77); await wait(300);
  let btn = "";
  for (let i = 0; i < 8 && !btn; i++) {
    if (!(await openCompany(i))) break;
    btn = await page.evaluate(() =>
      [...document.querySelectorAll(".cc-wbpop button")].map((b) => b.textContent).find((t) => /Bring up/.test(t)) || "");
  }
  const m = btn.match(/Bring up (\d+) men — (\d+) recruits/);
  check("reinforcement costs exactly the men it brings up", !!m && m[1] === m[2], btn.trim() || "nothing to bring up");
}

/* A promise is a visible, dated thing with a target you can be shown. */
{
  let sawPromise = false;
  for (let i = 0; i < 16 && !sawPromise; i++) {
    await page.evaluate(() => window.__ccTest.knock()); await wait(220);
    const hall = await page.evaluate(() => document.querySelector(".cc-hallrow")?.innerText || "");
    if (!hall) break;
    await page.evaluate(() => document.querySelector(".cc-hallrow")?.click()); await wait(280);
    const promised = await page.evaluate(() => {
      const b = [...document.querySelectorAll(".fixed.inset-0.z-50 .cc-origin")]
        .find((x) => /I will see to it/.test(x.textContent));
      if (b) { b.click(); return true; }
      return false;
    });
    if (!promised) {
      await page.evaluate(() => [...document.querySelectorAll(".fixed.inset-0.z-50 .cc-origin")].pop()?.click());
      await wait(280);
      await click("End (spring|summer|autumn|winter)"); await wait(400);
      if (await inBattle()) await fightOut();
      continue;
    }
    await wait(350);
    sawPromise = await page.evaluate(() => !!document.querySelector(".cc-promises"));
  }
  const card = await page.evaluate(() => document.querySelector(".cc-promises")?.innerText || "");
  check("a promise says what it needs and how long you have",
    sawPromise && /Clear the wood/.test(card) && /seasons?/.test(card),
    card.split("\n").slice(0, 3).join(" | ") || "no promise made");
}

/* The warlord falls; a captain takes the seat; the header says so. */
{
  const before = await page.evaluate(() => document.querySelector("header")?.innerText.split("\n")[1] || "");
  await page.evaluate(() => window.__ccTest.fall()); await wait(500);
  const scene = await page.evaluate(() => (document.querySelector(".fixed.inset-0.z-50")?.innerText || "").includes("The seat is empty"));
  await click("Give them the seat"); await wait(500);
  const after = await page.evaluate(() => document.querySelector("header")?.innerText.split("\n")[1] || "");
  check("the seat passes to a captain", scene && after !== before && !/Grimhand/.test(after), after.split(" · ")[0]);
}

/* Everything outstanding, gathered on one screen off the five places it is
   scattered across. */
await page.evaluate(() => {
  const b = [...document.querySelectorAll("header button")].find((x) => x.getAttribute("aria-label") === "Missions");
  if (b) b.click();
});
await wait(400);
{
  const t = await page.evaluate(() => document.querySelector(".fixed.inset-0.z-50")?.innerText || "");
  const kinds = [...new Set((t.match(/What now|Your word|The hall|A place|A quarter/g) || []))];
  check("the missions screen gathers what is outstanding",
    /Outstanding —/.test(t) && kinds.length >= 2, kinds.join(", ") || "nothing listed");
  await page.evaluate(() => {
    const ov = document.querySelector(".fixed.inset-0.z-50");
    if (ov) [...ov.querySelectorAll("button")].find((b) => /^\s*$/.test(b.textContent) || b.getAttribute("aria-label") === "Close")?.click();
  });
  await wait(250);
  await page.keyboard.press("Escape"); await wait(250);
  await page.evaluate(() => { const ov = document.querySelector(".fixed.inset-0.z-50"); if (ov) ov.click(); });
  await wait(300);
}

/* The muster roll: every warband on one sheet, a click from the map. */
await click("warbands?$"); await wait(350);
const rosterRows = await page.evaluate(() => document.querySelectorAll(".cc-rosterrow").length);
check("the muster roll lists every warband", rosterRows >= 1, `${rosterRows} rows`);
await page.evaluate(() => document.querySelectorAll(".cc-rosterrow")[0]?.click()); await wait(500);
check("picking a row takes the warband in hand", await page.evaluate(() =>
  /in hand/.test(document.querySelector("aside")?.innerText || "")));



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
/* A settlement is one slot and a set of quarters that belong to somebody
   else. Lunden's first is the Trench, and it can be bought. */
{
  const slots = await page.evaluate(() => ({
    open: document.querySelectorAll(".cc-slotempty").length,
    filled: document.querySelectorAll(".cc-slotfull").length,
    wards: document.querySelectorAll(".cc-ward").length,
    text: document.querySelector(".fixed.inset-0.z-50")?.innerText || "",
  }));
  check("a settlement starts with one slot and quarters to take",
    slots.open + slots.filled === 1 && slots.wards >= 4,
    `${slots.open + slots.filled} slot, ${slots.wards} quarters`);
  check("the seat's quarters are the written ones", /The Trench/.test(slots.text),
    (slots.text.match(/The [A-Z][a-z]+( [A-Z][a-z]+)?/g) || []).slice(0, 3).join(", "));
  // A quarter with a painting shows it; one without looks the way it did.
  const art = await page.evaluate(() => {
    const w = [...document.querySelectorAll(".cc-ward")].find((x) => /The Trench/.test(x.textContent));
    const img = w && w.querySelector(".cc-wardart img");
    return { has: !!img, loaded: !!img && img.naturalWidth > 0, wide: img ? img.naturalWidth : 0 };
  });
  check("a quarter with a painting shows it", art.has && art.loaded && art.wide <= 1280,
    art.has ? `${art.wide}px wide` : "no plate on the Trench");
  const scrapNow = () => page.evaluate(() => +((document.querySelector("header")?.innerText.match(/([\d,]+)\s*\n?\s*Scrap/) || [])[1] || "0").replace(/,/g, ""));
  const before = await scrapNow();
  const paid = await page.evaluate(() => {
    const w = [...document.querySelectorAll(".cc-ward")].find((x) => /The Trench/.test(x.textContent));
    const b = w && [...w.querySelectorAll("button")].find((x) => !x.disabled && /Pay/.test(x.textContent));
    if (b) { b.click(); return true; }
    return false;
  });
  await wait(400);
  const after = await scrapNow();
  check("a quarter can be bought, and opens a slot", paid && after < before
    && await page.evaluate(() => document.querySelectorAll(".cc-slotempty").length + document.querySelectorAll(".cc-slotfull").length === 2),
    `${before} -> ${after} scrap`);
}
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

/* Rivals run their own halls and give out commands the same way you do. */
{
  const led = await page.evaluate(() => window.__ccWild().led);
  const rivals = led.filter((x) => !x.startsWith("dogger"));
  const withCaptains = rivals.filter((x) => +x.split(":")[1].split("/")[0] > 0).length;
  check("rivals give out commands from their own halls", withCaptains >= 3,
    rivals.join("  "));
}
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
  (document.querySelector(".cc-warbar")?.innerText.match(/Merge .* into this warband/) || []).length);
check("a merge is offered for two warbands on one hex", bandsBefore > 0);
await click("Put this warband in hand");
await wait(250);
check("clicking another warband hands you that one",
  /in hand/.test(await page.evaluate(() => document.querySelector("aside").innerText)));
await click("Merge .* into this warband");
await wait(400);
const oneBand = await page.evaluate(() =>
  !/Merge .* into this warband/.test(document.querySelector(".cc-warbar")?.innerText || ""));
check("the two warbands become one", oneBand);

// A warband keeps the name you give it, and a company can be peeled off into
// one of its own — which is the only way out of a warband sitting at the
// eight-company limit. Split and then merge back, so the rest of this test
// starts from the same position it did before.
await click("^rename$");
await wait(200);
await page.evaluate(() => {
  const i = document.querySelector(".cc-warbar input.cc-namefield");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(i, "The Thames Wolves");
  i.dispatchEvent(new Event("input", { bubbles: true }));
});
await click("Name it");
await wait(300);
check("a warband can be renamed",
  /The Thames Wolves/.test(await panelText()));

await openCompany(0);
await click("March out alone");
await wait(350);
const splitOk = /Merge .* into this warband/.test(
  await panelText());
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
/* The first step west is a right-click, which is the other way to march: the
   warband in hand goes to the hex under the cursor, no chevron needed. */
{
  const mv = () => page.evaluate(() => +(document.querySelector(".cc-warbar")?.innerText.match(/(\d+) of \d+ movement/)?.[1] ?? -1));
  await page.evaluate((c, r) => window.__ccPick(c, r), 25, 77); await wait(300);
  // Merging spent the movement. A fresh season, and whatever it brings, first.
  if ((await mv()) < 2) {
    await click("End (spring|summer|autumn|winter)"); await wait(500);
    if (await inBattle()) await fightOut();
    await page.evaluate((c, r) => window.__ccPick(c, r), 25, 77); await wait(300);
  }
  const at = await page.evaluate(() => {
    const g = document.querySelector(".cc-banner .cc-picked"); const r = g?.getBoundingClientRect();
    const b = document.querySelector("svg.cc-basemap"); const z = b ? b.getBoundingClientRect().width / +b.getAttribute("width") : 1;
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, z } : null;
  });
  const before = await mv();
  let mid = before;
  if (at && before > 1) {
    await page.mouse.click(at.x - 27.7 * at.z, at.y, { button: "right" }); await wait(900);
    mid = await mv();
  }
  check("a right-click marches the warband in hand", at && before > 1 && mid < before,
    at ? `${before} -> ${mid}` : "no marker in hand");
  if (mid < before) ac = 24;
}
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

/* Supply. Five hexes west of Lunden is past the end of any line the player
   has at this point, and the panel has to say so plainly — this is the number
   that decides whether a campaign is a campaign or a slow way of losing an
   army, so it must never be something you have to work out. */
{
  await page.evaluate((c, r) => window.__ccPick(c, r), ac, ar);
  await wait(300);
  const panel = await panelText();
  check("a column out in the wild says it is out of supply",
    /Cut off|Off the waggons/.test(panel), panel.split("\n").find((l) => /rations ×/.test(l)) || "no supply line");
  check("and says what the rations now cost", /rations ×(2\.4|3\.6|5)/.test(panel),
    panel.match(/rations ×[\d.]+/)?.[0] || "no multiplier");
  const eats = +(panel.match(/eats\s+(\d+)/)?.[1] || 0);
  const base = await page.evaluate(() => {
    const a = window.__ccSupply && window.__ccSupply();
    return a ? a.base : 0;
  });
  check("and is actually charged for it", base > 0 && eats >= base * 2,
    `${base} at home, ${eats} out here`);
}

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
const deploy = await page.evaluate(() => ({
  open: !!document.querySelector(".fixed.inset-0.z-50"),
  sectors: document.querySelectorAll(".cc-sector").length,
  ground: [...document.querySelectorAll(".cc-groundtag")].map((x) => x.textContent).join("/"),
  presets: [...document.querySelectorAll(".cc-formbtn")].length,
}));
check("the field is drawn, not just tabulated", await page.evaluate(() =>
  !!document.querySelector(".cc-fieldsvg") && document.querySelectorAll(".cc-fieldsvg .cc-fieldlabel").length >= 3),
  await page.evaluate(() => `${document.querySelectorAll(".cc-fieldsvg rect").length} shapes`));
check("a battle opens on the line, not the first blow", deploy.open && deploy.sectors === 3,
  `${deploy.sectors} sectors, ground ${deploy.ground}, ${deploy.presets} formations`);
/* You see what your outriders brought back and nothing else. By this point the
   host has a company of hunters in it, so it can count them but not name them:
   the strength comes back rounded, never exact, and the companies opposite are
   anonymous. Exact numbers here would mean the scouting level is being ignored. */
const blind = await page.evaluate(() =>
  document.querySelector(".fixed.inset-0.z-50")?.innerText || "");
const vague = /drawing up blind|nobody sent to look/.test(blind)
  || (/about \d+/.test(blind) && /a company/.test(blind));
check("you only see what you scouted", vague,
  vague ? "" : blind.split("\n").slice(0, 2).join(" / "));
// Drop a company somewhere else and check it actually moves.
const spread = () => page.evaluate(() => [...document.querySelectorAll(".cc-sector")]
  .map((s) => s.querySelectorAll(".cc-chippick").length).join(","));
const shifted = { was: await spread() };
// Two separate gestures: picking a company up is a render, and the sector
// only takes a drop once it knows something is in hand.
await page.evaluate(() => {
  const chips = [...document.querySelectorAll(".cc-chippick")];
  chips[chips.length - 1]?.click();
});
await wait(250);
await page.evaluate(() => document.querySelectorAll(".cc-sector")[0].click());
await wait(300);
const nowAt = await page.evaluate(() => [...document.querySelectorAll(".cc-sector")]
  .map((s) => s.querySelectorAll(".cc-chippick").length).join(","));
check("a company can be moved along the line", shifted.was !== nowAt,
  `${shifted.was} -> ${nowAt}`);

// And by actually dragging one, with a real DataTransfer, which is what a
// person's mouse hands the handlers. Tapping is the fallback, not the feature.
const dragged = await page.evaluate(() => {
  const chip = [...document.querySelectorAll(".cc-chippick")].pop();
  const res = document.querySelector(".cc-reserve");
  if (!chip || !res) return false;
  const dt = new DataTransfer();
  chip.dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer: dt }));
  res.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: dt }));
  res.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  return true;
});
await wait(350);
const held = await page.evaluate(() => document.querySelectorAll(".cc-reserverow .cc-chip").length);
check("a company can be dragged into reserve", dragged && held > 0, `${held} held back`);
await click("Take the field"); await wait(400);
const battle = await page.evaluate(() => ({
  open: !!document.querySelector(".fixed.inset-0.z-50"),
  kids: document.getElementById("root")?.children.length ?? 0,
  orders: /Give the order/.test(document.body.innerText),
  postures: document.querySelectorAll(".cc-postbtn").length,
}));
check("every sector takes its own order", battle.postures >= 3, `${battle.postures} buttons`);
check("a battle can be started", canAttack && battle.open, canAttack ? "" : "no attack order offered");
check("the battle screen renders", battle.kids > 0 && battle.orders,
  `#root children ${battle.kids}, orders ${battle.orders}`);
if (battle.open) {
  await click("Give the order"); await wait(500);
  check("the round is told in words", await page.evaluate(() => {
    const n = document.querySelector(".cc-narration");
    return !!n && n.innerText.trim().length > 20;
  }), await page.evaluate(() => (document.querySelector(".cc-narration")?.innerText || "").split("\n")[0]));
  await click("Count the cost"); await wait(400);
  await page.evaluate(() => {
    const ov = document.querySelector(".fixed.inset-0.z-50");
    if (ov) [...ov.querySelectorAll("button")].pop()?.click();
  });
  await wait(400);
} else {
  check("the round is told in words", false, "no battle to tell");
}
check("the game survives the battle", await page.evaluate(() =>
  (document.getElementById("root")?.children.length ?? 0) > 0));
{
  await page.evaluate((c, r) => window.__ccPick(c, r), 20, 77); await wait(300);
  const t = await page.evaluate(() => document.querySelector("aside")?.innerText || "");
  const ours = /held by Doggerbund/.test(t);
  check("a cleared place starts its story", !ours || /Bristol Weir · 1 of 3/.test(t), ours ? "" : "the lair was not taken, so no story to start");
}

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
check("the first chapter was written", await page.evaluate(() =>
  /The state of the coast/.test(document.querySelector(".fixed.inset-0.z-50")?.innerText || "")));
await click("Read on"); await wait(300);

/* Sieges. Walls have to appear on their own for a siege to ever be offered, and
   a wall has to stop being a wall once the siege has opened it. */
{
  const sg = await page.evaluate(() => window.__ccSiege && window.__ccSiege());
  check("walls go up somewhere in forty seasons", !!sg && sg.walled > 0, `${sg?.walled} walled`);
  check("a whole wall is a wall in every sector", sg?.storm?.[0] === "walls/walls/walls", sg?.storm?.[0]);
  check("the first breach opens the centre", sg?.storm?.[1] === "walls/rough/walls", sg?.storm?.[1]);
  check("three breaches leave no wall standing", sg?.storm?.[3] === "rough/rough/rough", sg?.storm?.[3]);
}
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
