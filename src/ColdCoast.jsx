import lordGorranBust from "./assets/lord-gorran-bust.webp";
import lordGorranHead from "./assets/lord-gorran-head.webp";
import lordGrimhandBust from "./assets/lord-grimhand-bust.webp";
import lordGrimhandHead from "./assets/lord-grimhand-head.webp";
import terrainPlains from "./assets/terrain-plains.webp";
import terrainSiltFlats from "./assets/terrain-siltflats.webp";
import unitAxemen from "./assets/unit-axemen.webp";
import unitHunters from "./assets/unit-hunters.webp";
import unitSpearmen from "./assets/unit-spearmen.webp";
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Swords, Wheat, Wrench, Fuel, Flame, Users, X, ChevronRight,
  Crown, Hammer, MapPin, Skull, Snowflake, Target, Ban, Handshake, Volume2, VolumeX, Music,
  Flag, Sparkles, Play, Anvil, Boxes, Lock,
} from "lucide-react";
import { TECHS, TECH_IDS, TECH_TIERS, TIER_OF, tierGate, tierOpen, tierNeeds } from "./data/techs.js";
import { ICONS, ICON_AUTHORS, unitIcon, techIcon } from "./data/gameicons.js";
import { MAP_NAMES } from "./data/places.js";
import { SECTORS, SECTOR_NAME, ADJACENT, POSTURES, POSTURE_IDS, GROUND, groundFor,
         FORMATIONS, FORMATION_IDS, FLANK_DEAL, FLANK_MORALE, SHAKEN_NEAR, SHAKEN_SECTOR,
         SIEGE, BREACH_ORDER }
  from "./data/battle.js";
import { UNIT_TIERS, UNITS, UNIT_IDS } from "./data/units.js";
import { SUPPLY_MAX, SUPPLY_BANDS, bandAt, HARD_GROUND, WINTER_WASTE,
         CART_RELIEF_CAP, QUARTER_RELIEF, QUARTER_EASE } from "./data/supply.js";
import { SETTLEMENT, WORKS, WORK_IDS } from "./data/settlement.js";
import { seasonOf, yearOf } from "./data/seasons.js";
import { BUILDINGS, buildStep, buildNext, buildName } from "./data/buildings.js";
import { WARLORDS, LORD_COMMAND, LEADERLESS } from "./data/warlords.js";
import { writeSave, readSave, saveInfo } from "./game/save.js";
import { startingPop, popRecruits, popSlots, popRank, popCostOf, popCeiling, popGrow,
         popFood, POP_LAIR, POP_INVEST, POP_PER_MOUTH } from "./data/population.js";

/* ============================================================================
   COLD COAST — a turn-based grand strategy prototype
   Europe, ~380 years after the Collapse. A long cold snap locked the world's
   water into ice. The seas fell ~110 metres. The North Sea, the Baltic and the
   northern Adriatic are dry silt plains. The Black Sea is a shrinking salt lake.
   ========================================================================== */

const UI_CSS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Barlow+Condensed:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
html,body{height:100%;margin:0;padding:0;background:#080c10}
#root{min-height:100%;display:flex;flex-direction:column}
.cc-app{height:100vh;min-height:100vh;overflow:hidden;flex:1 1 auto}
/* For screens that are documents rather than a fixed viewport: they grow past
   the fold and scroll. cc-app pins to 100vh and clips, which is right for the
   map but hid the nation picker's own "take up the banner" button on any
   screen shorter than ~1050px. Do not put cc-app and cc-page on one element —
   cc-app wins, because UI_CSS is injected after base.css. */
.cc-page{min-height:100vh;height:auto;overflow-y:auto;flex:1 1 auto}
.cc-root{color:#ffffff;background:#080c10;font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif}
.cc-root *{border-color:inherit}
.disp{font-family:'Barlow Condensed','Inter',system-ui,sans-serif;font-weight:600;letter-spacing:.01em}
.num{font-family:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;font-variant-numeric:tabular-nums}
.hexcell{transition:filter .12s ease}
.hexcell:hover{filter:brightness(1.35)}
.thin{overscroll-behavior:contain}
.thin::-webkit-scrollbar{width:6px;height:6px}
.thin::-webkit-scrollbar-thumb{background:#31454f;border-radius:3px}
.thin::-webkit-scrollbar-track{background:transparent}
button{font-family:inherit;color:inherit;background-color:transparent;padding:0}
.cc-worldmap{display:block;contain:paint}
.cc-basemap{position:absolute;left:0;top:0;z-index:0}
.cc-overmap{position:relative;z-index:1;background:transparent}
.cc-cell{cursor:pointer;transition:filter .13s ease}
.cc-cell:hover{filter:brightness(1.3) saturate(1.1)}
.cc-maplabel{font-family:'Barlow Condensed','Inter',sans-serif;font-weight:600;font-size:13px;letter-spacing:.18em}
.cc-placelabel{font-family:'Barlow Condensed','Inter',sans-serif;font-weight:500;font-size:9.5px;letter-spacing:.06em}
.cc-seatlabel{font-family:'Barlow Condensed','Inter',sans-serif;font-weight:700;font-size:12px;letter-spacing:.09em}
.cc-armycount{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:600;font-size:8.4px}
.cc-compass{font-family:'Barlow Condensed','Inter',sans-serif;font-size:10.5px;letter-spacing:.12em}
.cc-sigilwatermark{position:absolute;right:14px;top:12px;opacity:.13;pointer-events:none}
@keyframes cc-ants{to{stroke-dashoffset:-22}}
@keyframes cc-halo{0%{opacity:.6;transform:scale(.72)}70%{opacity:0;transform:scale(1.35)}100%{opacity:0;transform:scale(1.35)}}
.cc-ants{animation:cc-ants 1.1s linear infinite}
.cc-halo{animation:cc-halo 1.9s ease-out infinite}
.cc-banner{will-change:transform}
.cc-picked,.cc-unpicked{transition:transform .18s ease}
.cc-picked{transform:scale(1.16)}
.cc-buildprog{transition:stroke-dasharray .45s ease}
.cc-bar{transition:width .45s cubic-bezier(.3,.1,.2,1)}
@media (prefers-reduced-motion:reduce){
  .cc-ants,.cc-halo{animation:none}
  .cc-banner,.cc-picked,.cc-unpicked,.cc-bar,.cc-buildprog{transition:none}
}
.cc-min-h-760px{min-height:760px}
.cc-text-e5eef3{color:#ffffff}
.cc-border-28363f{border-color:#28363f}
.cc-bg-0d141aa85{background-color:rgba(13,20,26,0.85)}
.cc-max-h-46vh{max-height:min(46vh,420px)}
.cc-bg-0a1015a90{background-color:rgba(10,16,21,0.9)}
.cc-text-17px{font-size:17px}
.cc-text-12px{font-size:12px}
.cc-text-93a9b5{color:#b7c8d2}
.cc-text-15px{font-size:15px}
.cc-text-11d5px{font-size:11.5px}
.cc-text-8399a6{color:#a7bac6}
.cc-text-13px{font-size:13px}
.cc-text-a0b6c1{color:#c6d6de}
.cc-border-22303a{border-color:#22303a}
.cc-bg-1f4a52{background-color:#1f4a52}
.cc-border-356b76{border-color:#356b76}
.cc-text-d9f0f2{color:#d9f0f2}
.cc-bg-152029{background-color:#152029}
.cc-border-4d9aa6{border-color:#4d9aa6}
.cc-py-3px{padding-top:3px;padding-bottom:3px}
.cc-text-13d5px{font-size:13.5px}
.cc-text-19px{font-size:19px}
.cc-text-f0e2b8{color:#f0e2b8}
.cc-text-12d5px{font-size:12.5px}
.cc-border-31454f{border-color:#31454f}
.cc-border-25313a{border-color:#25313a}
.cc-text-c9a37a{color:#c9a37a}
.cc-bg-2b3f2c{background-color:#2b3f2c}
.cc-border-4a6b45{border-color:#4a6b45}
.cc-text-d7ecc9{color:#d7ecc9}
.cc-text-14px{font-size:14px}
.cc-bg-131f27{background-color:#131f27}
.cc-text-aac5d1{color:#d3e2e9}
.cc-h-3px{height:3px}
.cc-bg-26333c{background-color:#26333c}
.cc-text-18px{font-size:18px}
.cc-text-adc2cc{color:#d0dee5}
.cc-text-d3e5ec{color:#eef6f9}
.cc-text-14d5px{font-size:14.5px}
.cc-border-3d5a4a{border-color:#3d5a4a}
.cc-border-5a4636{border-color:#5a4636}
.cc-text-9fd6b4{color:#9fd6b4}
/* Three warning tones that were being used all over the interface and had no
   rule behind them, so every "this is going badly" line was quietly rendering
   in the body colour. */
.cc-text-e8b98a{color:#e8b98a}
.cc-text-e08a6a{color:#e08a6a}
.cc-text-4d5f6b{color:#4d5f6b}
.cc-border-5a3230{border-color:#5a3230}
.cc-text-e09a8a{color:#e09a8a}
.cc-text-cfe0e8{color:#eaf3f7}
.cc-border-243138{border-color:#243138}
.cc-bg-152a30{background-color:#152a30}
.cc-w-840px{width:840px}
.cc-max-w-95vw{max-width:95vw}
.cc-max-h-88vh{max-height:88vh}
.cc-bg-0d141a{background-color:#0d141a}
.cc-text-20px{font-size:20px}
.cc-text-16px{font-size:16px}
.cc-bg-243138{background-color:#243138}
.cc-text-8fe3d6{color:#8fe3d6}
.cc-text-e0644a{color:#e0644a}
.cc-text-78909e{color:#95aab6}
.cc-w-1000px{width:1000px}
.cc-max-w-96vw{max-width:96vw}
.cc-max-h-92vh{max-height:92vh}
.cc-border-3a2a26{border-color:#3a2a26}
.cc-bg-0d1116{background-color:#0d1116}
.cc-border-2a1f1c{border-color:#2a1f1c}
.cc-text-21px{font-size:21px}
.cc-max-h-300px{max-height:300px}
.cc-text-d9a63f{color:#d9a63f}
.cc-bg-5a2f26{background-color:#5a2f26}
.cc-border-8a4a38{border-color:#8a4a38}
.cc-text-f3d9cf{color:#f3d9cf}
.cc-max-w-1080px{max-width:1080px}
.cc-text-7fc9d6{color:#7fc9d6}
.cc-text-40px{font-size:40px}
.cc-max-w-62ch{max-width:62ch}
.cc-border-3d6470{border-color:#3d6470}
.cc-bg-121e26{background-color:#121e26}
.cc-bg-0e161d{background-color:#0e161d}
.cc-text-24px{font-size:24px}
.cc-w-720px{width:720px}
.cc-max-w-94vw{max-width:94vw}
.cc-max-h-86vh{max-height:86vh}
.cc-text-c3d5de{color:#dfeaf0}
.cc-w-520px{width:520px}
.cc-max-w-92vw{max-width:92vw}
.cc-text-34px{font-size:34px}
.cc-hover-text-e5eef3:hover{color:#ffffff}
.cc-hover-border-31424e:hover{border-color:#31424e}
.cc-hover-bg-2a5f69:hover{background-color:#2a5f69}
.cc-hover-text-c3d5de:hover{color:#dfeaf0}
.cc-hover-border-3d6470:hover{border-color:#3d6470}
.cc-hover-bg-152029:hover{background-color:#152029}
.cc-hover-bg-37502f:hover{background-color:#37502f}
.cc-hover-text-e0644a:hover{color:#e0644a}
.cc-hover-bg-1a2c22:hover{background-color:#1a2c22}
.cc-hover-bg-2a1a18:hover{background-color:#2a1a18}
.cc-hover-bg-6e3a2e:hover{background-color:#6e3a2e}
.cc-hover-border-2b3d47:hover{border-color:#2b3d47}
@media(min-width:1024px){.cc-lg-w-352px{width:352px}}
@media(min-width:1024px){.cc-lg-w-264px{width:264px}}
@media(min-width:640px){.cc-sm-text-52px{font-size:52px}}
@media(min-width:1024px){.cc-lg-w-380px{width:380px}}
@media(min-width:1024px){.cc-lg-flex-row{flex-direction:row}}
@media(min-width:1024px){.cc-lg-border-t-0{border-top-width:0}}
@media(min-width:1024px){.cc-lg-border-l{border-left-width:1px}}
@media(min-width:1024px){.cc-lg-max-h-none{max-height:none}}
@media(min-width:640px){.cc-sm-grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1280px){.cc-xl-grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(min-width:640px){.cc-sm-px-8{padding-left:2rem;padding-right:2rem}}
@media(min-width:640px){.cc-sm-py-12{padding-top:3rem;padding-bottom:3rem}}
.cc-h-5px{height:5px}
.cc-h-7px{height:7px}
.cc-h-9px{height:9px}
@media(min-width:1024px){.cc-lg-w-270px{width:270px}}
.cc-max-h-190px{max-height:190px}
.cc-max-h-93vh{max-height:93vh}
.cc-text-95aab6{color:#95aab6}
.cc-text-a7bac6{color:#a7bac6}
.cc-text-c6d6de{color:#c6d6de}
.cc-text-dfeaf0{color:#dfeaf0}
.cc-text-ff8a72{color:#ff8a72}
.cc-w-1020px{width:1020px}
.cc-morebuilds{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:5.4px;font-weight:600}
.cc-facing{font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;opacity:.75;margin-bottom:3px;border-bottom:1px solid #22303a;padding-bottom:2px}
.cc-line{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
@media(max-width:720px){.cc-line{grid-template-columns:1fr}}
.cc-sector{border:1px solid #2a3a44;border-radius:8px;background:#101a21;padding:10px;min-height:150px;transition:border-color .12s,background .12s}
.cc-sector:hover{border-color:#3d5a66}
.cc-sectorgone{background:#160f0e;border-color:#4a2b26;opacity:.75}
.cc-sectorflank{border-color:#8a4636;box-shadow:inset 0 0 22px rgba(224,100,74,.12)}
.cc-groundtag{font-size:10.5px;border:1px solid #2a3a44;border-radius:3px;padding:1px 5px;color:#7e939f}
.cc-gr-rough{border-color:#5c5230;color:#c9a37a}
.cc-gr-anchor{border-color:#2f5768;color:#7fb2cd}
.cc-breachpip{width:16px;height:5px;border-radius:2px;display:inline-block}
.cc-chipdark{background:#0c141a;border-style:dashed;border-color:#22303a}
.cc-blindmark{width:9px;height:9px;border-radius:2px;opacity:.5;display:inline-block}
.cc-chip{border:1px solid #2a3a44;border-radius:5px;background:#131f27;padding:5px 6px;user-select:none}
.cc-chippick{cursor:grab}
.cc-chippick:hover{border-color:#4d9aa6}
.cc-chipheld{border-color:#8fe3d6;background:#152a30}
.cc-chipbar{height:3px;border-radius:2px;background:#26333c;overflow:hidden;display:block}
.cc-chipbar>span{display:block;height:100%}
.cc-tug{height:7px;border-radius:3px;overflow:hidden;display:flex;background:#26333c}
.cc-tug>span{display:block;height:100%}
.cc-postrow{display:flex;gap:3px}
.cc-postbtn{flex:1;font-size:11px;padding:3px 0;border:1px solid #2a3a44;border-radius:4px;color:#8ba0ac;background:#0f1820;transition:border-color .12s,color .12s,background .12s}
.cc-postbtn:hover{border-color:#3d6470;color:#c3d5de}
.cc-poston{border-color:#4d9aa6;color:#dfeaf0;background:#152a30}
.cc-reserve{border:1px dashed #2a3a44;border-radius:8px;background:#0e161c;padding:10px}
.cc-reserverow{display:flex;gap:8px;flex-wrap:wrap}
.cc-reserverow>div{min-width:132px}
.cc-formbtn{font-size:11.5px;padding:3px 9px;border:1px solid #31454f;border-radius:4px;color:#c3d5de;background:#131f27;transition:border-color .12s,background .12s}
.cc-formbtn:hover{border-color:#4d9aa6;background:#18262e}
.cc-bigbtn{padding:9px 18px;border-radius:6px;border:1px solid;font-family:inherit;font-size:14.5px;transition:background .12s,border-color .12s}
.cc-bigfight{border-color:#8a4636;background:#3a2018;color:#f0d6c2}
.cc-bigfight:hover{background:#4a2a1f}
.cc-bigfight:disabled{opacity:.4;cursor:not-allowed}
.cc-bigoff{border-color:#31454f;background:#131f27;color:#c3d5de}
.cc-bigoff:hover{background:#18262e}
.cc-w-1180px{width:1180px}
.cc-bg-121a20{background:#121a20}
.cc-districtgrid{grid-template-columns:repeat(auto-fill,minmax(232px,1fr))}
.cc-districtlist{grid-template-columns:repeat(auto-fill,minmax(228px,1fr))}
.cc-slot{border-radius:8px;border:1px solid #2a3a44;padding:11px;min-height:104px;display:flex;flex-direction:column}
.cc-slotfull{background:#131f27;border-color:#31454f}
.cc-slothurt{background:#1d1614;border-color:#5c3a32}
.cc-slotlocked{background:#0b1117;border-style:dashed;border-color:#22303a;align-items:center;justify-content:center}
.cc-slotempty{background:#0f1820;border-style:dashed;border-color:#31454f;align-items:center;justify-content:center;transition:border-color .12s,background .12s}
.cc-slotempty:hover{border-color:#4d9aa6;background:#132029}
.cc-slotpicking{border-color:#4d9aa6;background:#132029;border-style:solid}
.cc-plus{font-size:26px;line-height:1;color:#6f8794}
.cc-slotempty:hover .cc-plus{color:#8fe3d6}
.cc-slotbtn{width:100%;border-radius:5px;border:1px solid;padding:5px 8px;font-size:12.5px;transition:background .12s,border-color .12s}
.cc-slotup{border-color:#3d6470;background:#152029;color:#dfeaf0}
.cc-slotup:hover{border-color:#4d9aa6;background:#1a2c36}
.cc-slotfix{border-color:#7a4436;background:#241713;color:#e8b98a}
.cc-slotfix:hover{border-color:#a45a46}
.cc-slotpoor{border-color:#25313a;color:#5f7280;cursor:not-allowed}
.cc-pip{display:inline-block;width:7px;height:4px;border-radius:1px;margin-left:2px}
.cc-pickcard{border-radius:6px;border:1px solid #31454f;background:#111c23;padding:8px 9px;text-align:left;transition:border-color .12s,background .12s}
.cc-pickcard:hover{border-color:#4d9aa6;background:#152029}
.cc-pickoff{opacity:.42;cursor:not-allowed}
.cc-pickoff:hover{border-color:#31454f;background:#111c23}
.cc-w-1060px{width:1060px}
.cc-mapnames{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}
.cc-mapname{position:absolute;white-space:nowrap;font-family:'Barlow Condensed',ui-sans-serif,sans-serif;font-weight:600;text-transform:uppercase;user-select:none;text-shadow:0 0 6px rgba(4,8,12,.95),0 1px 2px rgba(4,8,12,.95)}
.cc-nsea{color:#7fb2cd}
.cc-nland{color:#d9cdb2}
.cc-nridge{color:#cfc4ab}
.cc-nice{color:#cfe3ec}
.cc-mapzoom{position:absolute;top:0;left:0;transform-origin:0 0;will-change:transform}
.cc-mapscroll{cursor:grab;background:#080d11;overscroll-behavior:contain;will-change:scroll-position}
.cc-mapscroll:active{cursor:grabbing}
.cc-maptools{right:12px;bottom:12px;background:rgba(10,16,21,.88);border:1px solid #31454f;border-radius:6px;padding:5px 7px;backdrop-filter:blur(4px)}
.cc-zoombtn{width:26px;height:26px;border:1px solid #31454f;border-radius:4px;background:#131f27;color:#dfeaf0;font-size:15px;line-height:1;display:flex;align-items:center;justify-content:center}
.cc-zoombtn:hover{border-color:#4d7488;background:#1b2a34}
.cc-w-auto{width:auto}
.cc-namefield{background:#0d161c;border:1px solid #4d7488;border-radius:4px;color:#e5eef3;padding:3px 7px;outline:none}\n.cc-namefield:focus{border-color:#8fe3d6}\n.cc-sndbtn{width:28px;height:28px;border:1px solid #31454f;border-radius:5px;background:#131f27;color:#7b8f9b;display:flex;align-items:center;justify-content:center}
.cc-sndbtn:hover{border-color:#4d7488;color:#dfeaf0}
.cc-sndon{color:#8fe3d6;border-color:#3d6470}
.cc-seatart{display:block;width:100%;height:auto;aspect-ratio:200/44}
.cc-seatplate{left:20px;bottom:14px;right:64px}
.cc-seatcrest{width:52px;height:52px;border-width:1px;border-style:solid}
.cc-seatclose{right:14px;top:14px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;color:#dfeaf0;background:rgba(10,16,21,.72);border:1px solid #31454f;border-radius:6px}
.cc-seatclose:hover{border-color:#4d7488}
@media(min-width:1024px){.cc-lg-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}}
.cc-static{position:static}
.cc-treescroll{background:radial-gradient(900px 380px at 30% 0%,#12202a 0%,#0a1218 70%)}
.cc-tree{display:block}
.cc-tnode{cursor:pointer}
.cc-tnode rect:first-child{transition:stroke .12s ease,filter .12s ease}
.cc-tnode:hover rect:first-child{filter:brightness(1.35)}
.cc-tiername{font-family:'Barlow Condensed','Inter',system-ui,sans-serif;font-weight:700;font-size:13px;letter-spacing:.12em}
.cc-tname{font-family:'Barlow Condensed','Inter',sans-serif;font-weight:600;font-size:14px}
.cc-tmeta{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10.5px}
.cc-lordbtn{width:30px;height:30px;border:1px solid #31454f;border-radius:5px;overflow:hidden;padding:0;display:flex}
.cc-lordbtn:hover{border-color:#4d7488}
.cc-lordicon{width:100%;height:100%;object-fit:cover}
.cc-lorddead{border-color:#8a4a38}
.cc-lorddead .cc-lordicon{filter:grayscale(1) brightness(.55)}
.cc-lordthumb{width:34px;height:41px;border-radius:3px;flex-shrink:0}
.cc-lordbig{width:150px;height:180px;border-radius:5px;flex-shrink:0}
.cc-bg-0d141af2{background-color:rgba(13,20,26,.97)}
.cc-block{display:block}
.cc-uncharted{display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:112px;border-radius:5px;border:1px dashed #2f4049;color:#8399a6;
  background:repeating-linear-gradient(135deg,#0c151b 0 7px,#0e1920 7px 14px)}
.cc-tabbtn{flex:1 1 0;min-width:0;padding:10px 4px;font-size:12.5px;white-space:nowrap;
  transition:color .15s,background-color .15s}
.cc-tabon{box-shadow:inset 0 -2px 0 #4d9aa6}
.cc-craftbtn{width:26px;height:24px;border:1px solid #31454f;border-radius:4px;line-height:1;
  font-size:15px;color:#cfe0e8;flex-shrink:0}
.cc-craftbtn:hover{border-color:#4d7488;background:#1b2a34}
.cc-titleart{position:absolute;inset:0;width:100%;height:100%}
.cc-titlestack{z-index:2;max-width:640px}
.cc-titleword{letter-spacing:.02em;text-shadow:0 6px 34px rgba(4,10,14,.95),0 2px 6px rgba(4,10,14,.9)}
.cc-beginbtn{display:inline-flex;align-items:center;gap:9px;padding:12px 34px;border-radius:7px;
  border:1px solid #4d9aa6;color:#dff3f6;background:linear-gradient(180deg,#1c4048,#132c33);
  box-shadow:0 4px 18px rgba(4,12,16,.7);transition:filter .15s,transform .15s}
.cc-beginbtn:hover{filter:brightness(1.25);transform:translateY(-1px)}
.cc-notices{position:absolute;left:12px;bottom:12px;z-index:20;display:flex;flex-direction:column;
  gap:6px;max-width:340px;pointer-events:none}
.cc-notice{pointer-events:auto;display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:6px;
  background:rgba(11,18,25,.97);box-shadow:0 4px 14px rgba(3,7,10,.55);
  animation:noticeIn .28s ease}
@keyframes noticeIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
.cc-terrainart{position:relative;display:block;width:100%;overflow:hidden;border-radius:5px;border:1px solid #2a3d48;margin-bottom:12px}
.cc-terrainflat{border-radius:0;border:0;border-bottom:1px solid #28363f;margin-bottom:0}
.cc-terrainfade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(8,14,19,.15) 0%,rgba(8,14,19,0) 42%,rgba(8,14,19,.82) 100%)}
.cc-terraincap{position:absolute;left:9px;bottom:7px;font-family:'Barlow Condensed','Inter',sans-serif;font-weight:600;font-size:12.5px;letter-spacing:.09em;color:#eaf3f7;text-shadow:0 1px 3px #04080c}
.cc-unitart{display:inline-block;flex-shrink:0;filter:drop-shadow(0 1px 2px rgba(3,7,10,.8))}
.cc-unitplinth{display:inline-block;position:relative;padding:0 8px;border-radius:5px;
  background:radial-gradient(60% 42% at 50% 92%, rgba(143,227,214,.14), rgba(0,0,0,0) 70%),
             linear-gradient(180deg,#16242e 0%,#0d161d 100%);
  border:1px solid #2a3d48;filter:drop-shadow(0 2px 5px rgba(3,7,10,.7))}
.cc-w-30px{width:30px}
.cc-w-7px{width:7px}
.cc-bg-2a3a4a{background-color:#2a3a4a}
.cc-border-4d7488{border-color:#4d7488}
.cc-border-8a6f36{border-color:#8a6f36}
.cc-hover-bg-35495c:hover{background-color:#35495c}
.cc-min-h-420px{min-height:200px}
.cc-text-22px{font-size:22px}
.cc-text-f2c97a{color:#f2c97a}
.cc-w-42px{width:42px}
.cc-w-620px{width:620px}
.cc-text-28px{font-size:28px}
.cc-w-960px{width:960px}
.cc-bg-101820{background-color:#101820}
.cc-w-1180px{width:1180px}
.cc-w-1060px{width:1060px}
.cc-text-26px{font-size:26px}
.cc-w-200px{width:200px}
.cc-w-980px{width:980px}
.cc-text-9db8c4{color:#9db8c4}
.cc-text-c3cf7a{color:#c3cf7a}
@media(min-width:640px){.cc-sm-text-84px{font-size:84px}}
.cc-text-64px{font-size:64px}
.cc-text-9fd9e8{color:#9fd9e8}
.cc-text-b6dfc0{color:#b6dfc0}
.cc-text-f3b0a0{color:#f3b0a0}
.cc-w-300px{width:300px}
.cc-w-28px{width:28px}
.cc-text-6f8794{color:#6f8794}`;

/* ---------------------------------- MAP ----------------------------------- */
// Stylised 22x19 hex grid of a future Europe. Rows are padded in code, so the
// strings below don't need to be exactly 22 characters.
//  _ void   ~ sea    l lake     g glacier  t tundra   f forest  p plains
//  h hills  m mountains  s steppe  d drained seabed  c marsh  r ruins  b saltpan
const MAP_ROWS = [
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ggg~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~g~~~~~gg~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~gg~gggggggggg~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ggggggggggggggg~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~g~gggggggggggggggggg~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~gggggggggggggggggggggg~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ggggggggggggggggggggggg~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~g~gggmmgggggggggggggggggggg~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~gggggmgmgggggggggggggggggg~g~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~gggggmmgggggggggggggggggg~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~gggggggggggggggggggggggggggg~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~gggggggggggggggggggggggggggggg~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~gggmmgggggggggggggggggggggggggg~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ggggmmgggggggggggggggggggggggggg~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ggggmmggggggggggggggggggggggggg~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ggggggggggggggggggggggggggggggg~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~gggmmmgggggggggggggggggggggggggg~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~gggmmmgggggggggggggggggggggggggg~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tgmmggtgfttggtggttttgggggggtggg~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ttttmtttttttttttttttttttttffttt~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ttttmttttttttttttttttttttttttttf~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ttmfmtttttttttttttttt~tftffff~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~fttmftttttttttttttttt~~~~ftfff~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ttttttttffttttttttff~~~~~~~~tt~~~~~~~~~~~~~~~~~~~~~~~f",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tftttttttttftttttttt~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tt",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ttmmtffttttttttttttt~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~t~~tt",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tttmmfftttttttttttt~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ttttt",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tfmtmtffttttfftttttf~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tfttt",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ttfmmtftttttffffttttt~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tffftt",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tttmmmttttffffftttttt~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tffttt",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ttttmmttttttfffffttttllll~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tffttt",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tttttmtttfttttftftttttllll~~~~~~~~~~~~~~~~~~~~~~~~~~~ttfftttt",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~tttmmftttfffftptftttttlllll~~~~~~~~~~~~~~~~~~~~~~~~~ttffftttt",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~fmmfffffffffftppfffhtlllllll~~~~~~~~~~~~~~~~~~~~~~~ffffffffff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ffffmmmffffpfffffffpffhhflllllll~~~~~~~~~~~~~~~~~~~~~~~~fffffffff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ffmmmmmfffphffffffffffhflllllllll~~~~~~~~~~~~~~~~~~~~~~~~ffhhffff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hffmmmmmffffffffffhhfffffflllllllll~~~~~~~~~~~~~~~~~~~~ffhhfffhffff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hffmmmmfffffffffffhffffflllllllllll~~~~~~~~~~~~~~~~~~llffhhpfffffff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~fffmmmhhffffhhffffppfffffllllllllll~~~~~~~~~~~~~~~~~fllfhfpppffffff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~mmmmmhhhfffhfhpffffffffffllllllllll~~~~~~~~~~~~~~~llllllhffffhppfff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hhmmhffhffffffffffffffffffllllllllll~~~~~~~~~~~~~~llllllhfffffhpfff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ffhhmmffffffffffffffffffhffflllllllll~~~~~~~~~~~~~~~llllllffffffhffff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ffmmmhfffffffhhffffffffhhlllllllllll~~~~~~~~~~~~~~~llfffffffffffffff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~fhhfhhffffffrfhhpffffffflllllllllllll~~~~~~~~~~~~~~~ffffhppfffffffff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hhffhfffffffrfhpppffffffflllllllllllllllll~~~~~f~~~~ffffhhffffffffff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ffhpppfffffhffpffffffffflllllllllllllllll~ffffffffffpphhhffffffffff",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~fhhphfffffhffphffhppffflrlllllllllllllllfffffffppfffhffhhffffffffh",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hfpffffhhhhfffffhfhffllllllllllllllllllffffffffhhffffffhfffffhfffh",
  "~~~~~~~~~~~~~~~~f~f~~~~~~~~~~~~~~~~~~~ffppfffpphhhffffhpffpllllllllllllllllllffffffffffffffffffffffhffff",
  "~~~~~~~~~~~~~~~ffff~~~~~~~~~~~~~~~~~~~~ffffffppffffffffffppplllllllllllllllllffffffffffffffffffffppfffff",
  "~~~~~~~~~~~~~~hhff~~~~~~~~~~~~~~~~~~~~~~~hhpp~~fffpfffffffpplllllllllllllllllffffffffffffffffpppppffffhp",
  "~~~~~~~~~~~~~ffmmmm~~~~~~~~~~~~~~~~~~~~~ffhh~~~ffpphffffffpllllllllllllllllllfffffffffffffffhhpppffffhhp",
  "~~~~~~~~~~~~~~~mmmmff~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hfffffppllllllllllllllllllfffffffhfffffffhhpppfffhhpp",
  "~~~~~~~~~~~~~~mmmmff~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~fpfphfpppllllllllllllllllllffffffhhfffhfffhhffffffhhfh",
  "~~~~~~~~~~~~~fmmmmmff~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ffppfhfpfhlllllllllllllllllfffffffhffffffffffffffphhfh",
  "~~~~~~~~~~~~~fmmmff~~~~~~~~~~~~~~~~~~~~~~~~~~hh~~~~~~ppffffllllllllllllllllrlfppffpphffffffffffffffpffff",
  "~~~~~~~~~~~~~~fmfff~~~~~~~~~~~~~~~~~~~~~~~~~~ff~~~~~~hppppfflllllllllll~~llfrppphhhffhffffffffffffffffff",
  "~~~~~~~~~~~~~~ffhfff~~~~~~~~~~~d~dd~d~~~~~~~~ff~~~~~hpppplllllllllllll~~~ppffpppphfffhhfffsppfshfffffffs",
  "~~~~~~~~~~~~~~ffhhppff~~~~~~~dddddddddd~~~~~~ff~~~~hhhfp~~llllllllllll~~~~hpphhppppfphhhhsspppsspppsssss",
  "~~~~~~~~~~~~~~~hrhprf~~~~~d~ddddddddddddd~~~ffpp~~~~rf~~lllllllllllll~~~~~hhffppphhhphfshssspsspsssssssr",
  "~~~~~~~~~~~~~fhrffpppf~~~ddddddddddddddddd~fffppp~~~rfl~lllllllllll~~~~pffpfpffppphfphfsppsssssppssssssr",
  "~~~~~~~~~~~~~ffffpppffr~ddddddddddddddddddddffffffp~ff~llllllllllllh~~~ppfphppppfpppphhhspssssspppssppss",
  "~~~~~~~pppff~ppfppppphddddddddddddddddddddddffffpppp~flllllllllllllh~~pfpfffhpphhffppppsspppssssssppspss",
  "~~~~~~~fpfffpppfpppffhddddddddddddddddddddd~fffppppffllllllllddllllpphhfppfhhphhhfpppppfsppssssssspsssss",
  "~~~~~fffhhffprrffffffpddddddddddddddddddddd~~ffffpfppp~llllllddddfppppffpfpfppphpppppppffpppssssssssssss",
  "~~~~~ppphppprdddddhhhhfdddddddddddddddddddd~fffffhhppppl~~fllpdrrpphpfphhfppffphppppppfsppppsssssppssspp",
  "~~~~~~ppfpppddddddpphrrrdddddddddddddddddd~pphfffhpppphh~ffffhprrhphffhhfffpffhhppppppfsppppsssssppssspp",
  "~~~~~~hfhpphdddddddphprrdddddddddddddddddpfppprfffpppphphfffpfffpppphfhhppppfffppprrpfppppsssssssppssspp",
  "~~~~ppphpppdddddddhhrpphhpddddddddddddddppfppprrfffphhhpffppppffffpppfhhhppppppffffrfffsppsssssssssssspp",
  "~~~~pppfhpppdddddhhhppffhhdddddddddddpddhpfffpffffphhhhffpppppfffppppfhhhphpfpffffffpfffsssssssssssssssp",
  "~~~~~pppfppprddddhhppfffhhhpdddddddddpphhppffhpfffppphpffffffpffffhppfhhffhhffffpfffhpffsssssssssssssssp",
  "~~~~~ppppppdddddhhhfhhpfhhpddddddddhhpppphffhhffpppphhpffffffpfffffhpphhfffffpphhhhphhfssssssssssppssppp",
  "~~~~~fpppppddddhhhhfhhrrhhprrdddddrrppppphfhffpfhfpphrrffpffffpppppfppphppfppppffcpphfccsssppsssssppsppp",
  "~~~~~ffpppfddddhhhpphrfffpfpddddddhpppppphppffpphffpfpffpppffpppppffffpppppppcccccccccccssspssssspppppps",
  "~~~~~fffpphddddhhhhppfpphhfdddddddhppppppfpppffpfffpffhhpppfpppppfffprrpphccccccccccccccsssssspppppsssps",
  "~~~~~fffpp~ddddpppppffpphhppdddddd~hpppphhpphfffpppppfppppfpfppppfppprhphhccccccccccccccssssspppppssspps",
  "~~~~~~~pp~~~dd~~~~prppfpfpppdddd~~~hfffffppfffffpppppppppphpffpppfppfpphfcccccccccccccccssssssspsssssspp",
  "~~~~~~~~~~~~~~~~~~rrrrpffrpdddd~ppppffffhpffffffffpppppppphhppppphhhhhphcccccccccccccpppsssssssssssppsps",
  "~~~~~~~~~~~~~~~~~~frffffffppddhp~ffppfprppppfpppppfhhfffffhhhfhphphhpphpcppfpppffppfffcpsssssssssssspsss",
  "~~~~~~~~~~~~~~~~~ffff~dddddppdfffffhffpfrppppppppphhhhfhhhhhppfhfffpppfphfpffppppppppfppssssssssssssssss",
  "~~~~~~~~~~~~~~~~~dd~~~ddddddppfffffhfppffppppfpppppphhhhhhhhfpppfffppfffffppfhhpppppphhssrssssssssssssss",
  "~~~~~~~~~~~~ddr~~f~~~dddd~~pffffpfhphpppppppffpfpppphhhhhhhhpppfffffffffffpffhpppppfpppsrrssssssssssspps",
  "~~~~~~~~~~~~dddddd~dddddd~~~fffpppfpfppppppppfffffphhhhhhhhfpffhhfffffpfpppffffpfppffpshsrssssssssssssps",
  "~~~~~~~~~~~~ddddddddddd~~~~~pppppfffffpppppphhhfffphhhhrhhhfffpphffffppfpppffffhfffffhhfsssssssssssssspp",
  "~~~~~~~~~~~~dddddddddd~~~~~~ffffppppffpppfppppfppphhhhhhhhhffffffffhphhphhpppffhhfffffffsppsssssssssssss",
  "~~~~~~~~~~~~ddddddddddfffp~~pfffhppppfppfffppppppphhhhhhhhhpffppffmhmmhphpppfffhfppfffpssppssssssssssssp",
  "~~~~~~~~~~~ddddddddd~fhpffppppffhppffpppppffpppppphhhhhhhhhhpffpffmmmmmmmpppffppfpphhhsssssppssssssssssp",
  "~~~~~~~~~~~ddddddd~~~~pppfpppprffpffppppppppppfpppphhhhhhhhhfffffffmmmmmmhhffpphhpfffppfsssppsssssssssss",
  "~~~~~~~~~~~~~~~pp~~h~~fppppppffpppfffffffppppfffppfffhhhphhppppfpffmmmmmmhhffppppppffppfssppssssssssssss",
  "~~~~~~~~~~~~~~~~~pphphfppppppffpffffffffpppppfffppffppfpppfppppppfppmmmmmmppmppppppffppssspsssssspssssss",
  "~~~~~~~~~~~~~~~~~ffphppppppppphppffppppffpppfffffpmffphfppprrfppppppmmmmmmmmmppppfffffppsssssssssppsssss",
  "~~~~~~~~~~~~~~~~~~~phppppppppphhffffpppfpppfffffmmmmffppffpfffffffhhmmmmmmmmmpmfffffffssssssssssssssssss",
  "~~~~~~~~~~~~~~~~~~~~~pppppppppfffpffpphffpppfffmmmmmfmmfffffffffffhpmmmmmmmmmmhfffppffffssssssssssssssss",
  "~~~~~~~~~~~~~~~~~~~~~~pppfhpffffhpffpphffmpmmmmmmmmmppmfhfffppppfrpppmmmmmmmmmmmffpfffffssssspssssssssss",
  "~~~~~~~~~~~~~~~~~~~~~~ppphhhhhhhppppppphmmmmmmmmmmmmpphhhhfpfppphhhphhmmmmmmmmmmhhpfsspssssssppssssssspp",
  "~~~~~~~~~~~~~~~~~~~~~~~pppphhhpppppphppmmmmmmmmmmmmpphhhppphppphphhphhmmmmmmmmmmhhhpspppssssssssssssppsp",
  "~~~~~~~~~~~~~~~~~~~~~~~ppppphhhhpppphhmmmmmmmmmmmppphhhpphhhhpphpppphhmmmmmmmmmmhhhhppppppps~sssssssppss",
  "~~~~~~~~~~~~~~~~~~~~~~~hppphhhhhhhppphmmmmmmmmmmpphhppppphppppppphhhhhhmmmmmmmmpphhhsppppp~~~ssspsssssds",
  "~~~~~~~~~~~~~~~~~~~~~~~hhpphhhhhhhhrphhmmmmmmmmhpphrphhppppppppppphhhhhmmmmmmmppphhssspppp~~~~ssspppssp~",
  "~~~~~~~~~~~~~~~~~~~~~~phppphhhhhhhrrhphmmmmmrmpppp~~~hhpppppphphhphhhhhhhmmmmmhppppsssppp~~~~~sssppsssp~",
  "~~~~~~~~~~~~~~~~~~~~~~h~ppphhhhhhhhhpmmmmmphhrpppph~~hhppppphhhphhhhhhhhhppmmmhpppphssc~~~~~~~ssssssss~~",
  "~~~~~~~~~~~~~~~~~~~~~~ppppppphhhhhhhhhhmrrphpppppph~~d~mpppphhppphhhhhhhhpphmhhppphhscc~~~~~~~~sssssssll",
  "~~~~~~~~~~~~~~~~~~~~~pppppppphhhhhhhhhhhhrpppppppppddd~mmpppphppphhhhhhhhhphhhhhpphscs~~~~~~l~~lsllsllll",
  "~~~~~~~~~~~~~~~~~~~~~ppppppphhhhhhhhhhhhhhppppppppppddmmmphpphphhhhhhhhhppppppppphhpc~~~~~~lllllllllllll",
  "~~~~~~~~~~~~~~~~~~~~~~phhhphhhphhhhphhhhppppppppppphpdddmmmhphpphhhhhhppphhhpppprppssss~~~llllllllllllll",
  "~~~~~~~~~~~~~~~~~~~~~~~hhphhhppphhpphphhpp~ppppppphhppdddmmmphhpphhhpphhhhhppppprphpss~~~lllllllllllllll",
  "~~~~~~~~~p~~~~~~~~~~~~phpphhhhhphhppprp~pp~~hhhhhhhhppddddmmhhhpphhhpphhhhhppppphhhhh~~~~lllllllllllllll",
  "~~~~~~~~pp~~~pphp~~~~hpppphhhhpppppprrp~~~~~~~hppphpppddddmh~mpphhhhppphhhhppppphhhhs~~~~~llllllllllllll",
  "~~~~~~~~~ppppphhhh~h~mhpmmhhhhphhphpr~~~~~~~~~~~pphhppdddd~~mmmpphhhppphmphpppppphhh~~~~~~llllllllllllll",
  "~~~~~~pppppphhhhhhhhhmmmmmhphhphph~~~~~~~~~~~~~~pmmhppdddd~~~pmphhhppppmmmmmmpmhpphh~~~~~~~lllllllllllll",
  "~~~~~~ppppppmmmmmmpphhmmmmmmmmppp~~~~~~~~~~~~~~~ppppphhhddd~~mpmhhhhphhhmmmmmmmphpph~~~~~~~~l~~lllllll~~",
  "~~~~~~hppppphmmmhmhppmpmmmmmmmmm~~~~~~~~~~~~~~~~ppppphhd~~~~~~~~mhhhhpphmmmmmmmhmhp~~~~~~~~~~~~~~l~~~~~~",
  "~~~~~~hhpppphhhhhhhhpppphhpmmmmm~~~~~~~~~~~~~~~~pppppphd~~~~~~~~mhhhhhpppmmhhmmmmhh~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~hhpppphhhhhhhhhhhpppppppph~~~~~~~~~~~~~~~~~ppppmpp~~~~~~~mmmmhhhpppphhpppphhh~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~hpppphhhhhhhhhhhhpphpp~~~~~~~~~~~~~~~~~~~~~~hpmpp~~~~~~~~mmmhpppphhhhhpppphpp~~~~~~~~~~~~s~~ss~~~",
  "~~~~~~~~hhpphhhhhhhhhhhhphhhp~~~~~~~~~~~~~~~~~~~~~~rhppphhp~~~~~~~hhppphhhpppppppppp~~~~~ssssssppssssp~~",
  "~~~~~~~~hhhhhhhhhhhhhhpppphrr~~~~~~~~~~~~~~~~~~~~~hhhhhmhhpp~~~~~mpppppppppppppphppp~~rssssppsssssssssss",
  "~~~~~~~hhhhhhhhhhhhhhhpppph~~~~~~~~~~~~~~~~~~~~~~~hh~hprmpph~~~~~mmppppphpphhpphhhp~pr~ssspsppsssppsppss",
  "~~~~~~~hhhhhhhhhhhhhhhhpppp~~~~~~~~~~~~~~~~~~~~~~~~~~~rrpmph~~~~~~hmphhphhhhhhhhhh~~pprssspssppppppssppp",
  "~~~~~~~hpphhhhhhhhhpphhpppp~~~~~~~~~~~~~~~~~~~~~~~~~~~~~mppppp~~~~~pphpphhhhh~hhhhpppppspppsssspssssssss",
  "~~~~~~hhpphhhhhhhrrppppppppp~~~~~~~~~~~~~~~~~~~~~~~~~~~~mppppp~~~~hhhhhphhhh~~~pphhppppspppsssspssssppss",
  "~~~~~~hhpbhhhhpbbppppppppphh~~~~~~~~~~~~~~~~~~~~~~~~~~~~m~~bpp~~~~hphhhphh~dd~~~hhhppppssppshppppspppssh",
  "~~~~~~~hbbhhhhbbppppbbppppp~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~bbph~~~~pbhpppppddd~~~hhhhpphhppphbrpppppppph",
  "~~~~~~hhpbbhpbbbppppbbphpp~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~mppp~~~~pppbppppddddd~~hhhhpphhppbpbhhhpppphhp",
  "~~~~~~hhhpbppppbhppbbbhhh~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~mppp~~~~~~~bbhppdddddd~hhbhbphhhhhppppbhbbphpp",
  "~~~~~~hhhhpppppbhpbbpppbp~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~m~pp~~~~~hhpbhppddddddphbbbppphhhhhpphbhhhhhpp",
  "~~~~~brbphphhpppppbbhbbbp~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~h~~p~~~~~bbbppppddddddbbbbbppbhhphhhpphphhhhpp",
  "~~~~~bpbbhbhhpbbhpbbhbhhh~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~mh~~~~~~~~~pphppdddddddhbhppphhpppppppppphpphh",
  "~~~~~~ppphhppppbhhbhhhhh~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~mmp~~~~~~~~~hhhhrpdddddhhhppphhppppbhhppbhbbhh",
  "~~~~~~pppppbhhhhbbpbhhpp~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~pp~~~~~~~~~~hhhhhrdddd~~~hpppphhpppbbbbpphhbhhh",
  "~~~~~~hppppphpbbbpphbbpp~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~p~~~~~~~~~~hhhhppddd~~~pppphhhhppppbpbbhhbphbb",
  "~~~~~~hbhpphhpbbbhhhpppp~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hhhbb~~~~~~~ppppbhhhhhphhpphhppphbb",
  "~~~~~~hbhhbprrhhppppppp~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hhpp~~~~~~~~pppppppphhhhppppppppph",
  "~~~~~~~~~~b~pppppppppp~~~~~~~~~~~~~~~pppppppp~~~~~~~~~~~~~~~~~~~~~~~~~~bhp~~~~~~~~hhbbppppbhhpppphhpbbpp",
  "~~~~~~~~~~~~pppp~~pphpp~~~~~~~~~~~~h~bppppbppphh~~~~~~~~~~~~~~~~~~~~~~~bhh~~~~~~~~hh~bpppppbbpppphpbbbhh",
  "~~~~~~~~~~~~hpp~~~~~~~~~~~~~~~~hphhhbbhppbbppphh~~~~~~~~~~~~~~~~~~~~~~~p~~~~~~~~~~h~~ppppppphppppbbbbbph",
  "~~~~~~~~~~~~~p~~~~~~~~~~~~~~~hbpphppbbhhhhhhpphhp~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~p~~~~ppppbbbbhh~",
  "~hh~~~~~~~h~~b~~~~~~~~~~~~~bhhbbbphpbbhhhhhbbbhbb~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~p~pbbb~b~~",
  "~hhbh~h~bbhhhb~~~~~~~~~hhbbbhhbbbbbbbbhhhbbbbbbbb~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~bbbb~~~~",
  "~~~hbhhbbbhhhbbhhb~~~bbbhhhhhhbbbbbbhhhhhbbhhbbbb~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~bbh~~~~",
  "~~~hhbhhbhhhhbbhhbb~h~bbbhhbhhhhbbbbhhbhhhbbhhbhb~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hbb~~~~",
  "~~~hbbhhhhhhbbbbbbhhhbbhhhbbbbhhbbbhhbbbhhbbbhhhh~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hbbb~~~~",
  "~~bbbbhhhhhbbbbbbbhhhhhhhhbbbbhhbbbbbbbbhhbbbbbh~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hbbbh~~~",
  "~bbbbhhbbhbbbbbbbhhbhhhhhhbbbbbbbbhhbbbbbbbbbbbbb~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hbbb~~~~",
  "~bbbbbhbbbbbbbbhbhhbbbhhhhhbbbbbbbhhhbbbbbbbbbbb~b~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~bbbb~~~~",
];
const W = 104;
const H = MAP_ROWS.length;
const MAP = MAP_ROWS.map((r) => r.padEnd(W, "_").slice(0, W));

/* The colours are the map's, and nothing else uses them. They were picked one
   at a time and it showed: three different greens of the same weight alternating
   tile by tile read as camouflage rather than as country, and the ruinfields
   shouted in orange from one end of Europe to the other.
   They sit in a narrow band of value and chroma now — close enough that relief
   shading and the ink symbols carry the reading, far enough apart to tell what
   you are standing on. Ice and the drained seabed are the two deliberate
   exceptions: those should be visible from across the continent. */
const TERRAIN = {
  p: { name: "Plains",        color: "#79805a", food: 3, scrap: 0, fuel: 0, powder: 0, men: 2, def: 0,  move: 1, land: true },
  f: { name: "Cold forest",   color: "#556a53", food: 1, scrap: 1, fuel: 2, powder: 0, men: 1, def: 10, move: 2, land: true },
  h: { name: "Hills",         color: "#867a5e", food: 1, scrap: 2, fuel: 1, powder: 0, men: 1, def: 15, move: 2, land: true },
  m: { name: "Mountains",     color: "#7e7b74", food: 0, scrap: 2, fuel: 0, powder: 0, men: 0, def: 28, move: 3, land: true },
  s: { name: "Steppe",        color: "#8f8a61", food: 2, scrap: 1, fuel: 0, powder: 0, men: 3, def: 0,  move: 1, land: true },
  t: { name: "Tundra",        color: "#87908f", food: 1, scrap: 0, fuel: 0, powder: 0, men: 1, def: 5,  move: 2, land: true },
  g: { name: "Glacier",       color: "#dde8ee", food: 0, scrap: 0, fuel: 0, powder: 0, men: 0, def: 12, move: 3, land: true },
  d: { name: "Silt flats",    color: "#a2905f", food: 4, scrap: 2, fuel: 0, powder: 0, men: 1, def: -10, move: 1, land: true },
  c: { name: "Saltmarsh",     color: "#6c7760", food: 2, scrap: 1, fuel: 1, powder: 0, men: 0, def: 12, move: 2, land: true },
  r: { name: "Ruinfield",     color: "#7d6355", food: 0, scrap: 5, fuel: 1, powder: 2, men: 1, def: 22, move: 2, land: true },
  b: { name: "Saltpan",       color: "#b0a184", food: 0, scrap: 1, fuel: 3, powder: 0, men: 0, def: -5, move: 1, land: true },
  l: { name: "Freshwater",    color: "#41697a", food: 3, scrap: 0, fuel: 0, powder: 0, men: 0, def: -12, move: 2, land: true },
  "~": { name: "Open sea",    color: "#1b2c38", land: false },
  _: { name: "", color: "transparent", land: false },
};

// Places worth naming. Everything else gets a regional name.
const LANDMARKS = {
  "58,28": "Skjoldhall",
  "48,44": "Oslo Cleft",
  "62,46": "Stockholm Reef",
  "75,55": "Riga Deep",
  "16,59": "Glasgow Rust",
  "19,59": "Edinburgh Crag",
  "52,59": "Kobenhavn Sill",
  "103,59": "Muskova Drift",
  "22,61": "Newcastle Slag",
  "13,64": "Belfast Ram",
  "64,65": "Gdansk Keel",
  "22,67": "Leeds Cut",
  "23,67": "York Minster",
  "83,67": "Minsk Hollow",
  "20,68": "Manchester Pit",
  "46,68": "Hamburg Yards",
  "57,68": "Rostov Gate",
  "12,70": "Dublin Bar",
  "64,70": "Volgograd Line",
  "22,72": "Birmingham Heap",
  "28,72": "Norwich Fen",
  "35,72": "Amsterdam Bed",
  "54,72": "Berlin Vault",
  "70,74": "Warszawa Stack",
  "19,77": "Cardiff Tide",
  "20,77": "Bristol Weir",
  "25,77": "Lunden",
  "39,78": "Koln Ash",
  "14,81": "Red-Ruth",
  "17,81": "Plymouth Hulk",
  "88,81": "Kyiv Shelf",
  "55,83": "Praha Vault",
  "30,87": "Paris Ash",
  "59,90": "Wien Door",
  "87,91": "Karkhan Wells",
  "65,93": "Budapest Span",
  "45,97": "The Innsbruck Door",
  "51,98": "Venezia Silt",
  "35,99": "Lyon Terraces",
  "45,100": "Milan Foundry",
  "41,102": "Torino Works",
  "80,104": "Bucuresti Flats",
  "59,106": "Ragusa-on-the-Flats",
  "36,107": "Marseille Pan",
  "51,115": "Roma Cinders",
  "28,116": "Barcelona Salt",
  "86,116": "Stanbul Gate",
  "55,117": "Napoli Slag",
  "17,120": "Meseta Prime",
  "94,122": "Ankara Rise",
  "6,126": "Lisboa Mouth",
  "74,129": "Athina Stone",
  "13,132": "Sevilla Kiln",
};

const REGIONS = [
  { n: "Kernow", x0: 12, y0: 80, x1: 16, y1: 84 },
  { n: "Dyfnaint", x0: 16, y0: 78, x1: 20, y1: 83 },
  { n: "Wessex", x0: 20, y0: 75, x1: 26, y1: 81 },
  { n: "Anglia", x0: 25, y0: 70, x1: 29, y1: 77 },
  { n: "Mercia", x0: 19, y0: 68, x1: 25, y1: 75 },
  { n: "Cambria", x0: 14, y0: 70, x1: 19, y1: 77 },
  { n: "Northumbria", x0: 17, y0: 58, x1: 25, y1: 70 },
  { n: "Caledon", x0: 12, y0: 46, x1: 20, y1: 59 },
  { n: "Hibernia", x0: 3, y0: 61, x1: 14, y1: 78 },
  { n: "The Dogger Flats", x0: 22, y0: 57, x1: 39, y1: 75 },
  { n: "Frisia", x0: 33, y0: 65, x1: 44, y1: 75 },
  { n: "Neustria", x0: 14, y0: 83, x1: 29, y1: 91 },
  { n: "Aquitaine", x0: 20, y0: 91, x1: 29, y1: 109 },
  { n: "Gallia", x0: 29, y0: 83, x1: 38, y1: 99 },
  { n: "Burgundy", x0: 32, y0: 93, x1: 41, y1: 103 },
  { n: "Rhenland", x0: 38, y0: 74, x1: 46, y1: 90 },
  { n: "Saxony", x0: 44, y0: 67, x1: 54, y1: 83 },
  { n: "Bohemia", x0: 51, y0: 78, x1: 61, y1: 91 },
  { n: "Wisla", x0: 61, y0: 64, x1: 72, y1: 86 },
  { n: "Prussia", x0: 52, y0: 62, x1: 65, y1: 74 },
  { n: "Norvegr", x0: 33, y0: 28, x1: 48, y1: 51 },
  { n: "Svea", x0: 48, y0: 39, x1: 62, y1: 62 },
  { n: "Bothnia", x0: 61, y0: 20, x1: 80, y1: 44 },
  { n: "Lappmark", x0: 57, y0: 0, x1: 91, y1: 20 },
  { n: "Karelia", x0: 80, y0: 20, x1: 96, y1: 46 },
  { n: "The Baltic Water", x0: 52, y0: 30, x1: 78, y1: 65 },
  { n: "Ruthen", x0: 72, y0: 55, x1: 91, y1: 83 },
  { n: "Muskova", x0: 91, y0: 44, x1: 104, y1: 74 },
  { n: "The Pontic Steppe", x0: 84, y0: 83, x1: 104, y1: 106 },
  { n: "Livonia", x0: 70, y0: 46, x1: 84, y1: 62 },
  { n: "Alpen", x0: 36, y0: 91, x1: 55, y1: 103 },
  { n: "Lombardy", x0: 39, y0: 99, x1: 52, y1: 106 },
  { n: "Ausonia", x0: 45, y0: 104, x1: 57, y1: 115 },
  { n: "Latium", x0: 48, y0: 113, x1: 58, y1: 120 },
  { n: "Calabria", x0: 55, y0: 117, x1: 64, y1: 130 },
  { n: "Illyria", x0: 52, y0: 99, x1: 67, y1: 115 },
  { n: "Pannon", x0: 58, y0: 88, x1: 72, y1: 102 },
  { n: "Dacia", x0: 71, y0: 88, x1: 86, y1: 109 },
  { n: "Thrace", x0: 71, y0: 107, x1: 86, y1: 120 },
  { n: "Hellas", x0: 65, y0: 119, x1: 80, y1: 136 },
  { n: "Meseta", x0: 10, y0: 112, x1: 23, y1: 125 },
  { n: "Lusitania", x0: 4, y0: 113, x1: 12, y1: 133 },
  { n: "Baetica", x0: 10, y0: 125, x1: 22, y1: 138 },
  { n: "Tarraco", x0: 22, y0: 110, x1: 32, y1: 128 },
  { n: "Cantabria", x0: 7, y0: 106, x1: 20, y1: 112 },
  { n: "Anatol", x0: 80, y0: 113, x1: 104, y1: 138 },
  { n: "Kaukasos", x0: 100, y0: 102, x1: 104, y1: 122 },
  { n: "Barbary", x0: 0, y0: 136, x1: 104, y1: 161 },
  { n: "The Dry Sea", x0: 86, y0: 96, x1: 104, y1: 115 },
];

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII",
  "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV"];

/* -------------------------------- NATIONS --------------------------------- */
const NATIONS = {
  dogger: {
    cue: "Salvage and silt",
    name: "The Lunden Doggerbund", short: "Doggerbund", color: "#3aa892",
    cap: [25, 77],
    blurb:
      "They hold Lunden, where the Thames runs through a drowned grid of towers, and they farm the floor of the old North Sea from there. Every keel out on the flats is a century of iron waiting to be cut.",
    trait: "Salvage rights: +50% scrap, silt flats feed one more mouth each, and they already know how to work a shoreline.",
  },
  lyon: {
    cue: "Roads and levies",
    name: "The Concordat of Lyon", short: "Lyon", color: "#4b74d8",
    cap: [35, 99],
    blurb:
      "The one polity that kept its paperwork. Roads are graded, censuses are taken, conscripts are drilled.",
    trait: "Levy rolls: +40% recruits, and every warband marches one step further.",
  },
  alpine: {
    cue: "Mountain vaults",
    name: "The Alpine Compact", short: "Alpine", color: "#c8ced6",
    cap: [45, 97],
    blurb:
      "Vault-keepers under the Alps. They still have working rifles, and they still know how to make more.",
    trait: "They kept the manuals and can still read them: every advance takes 30% fewer seasons, and +35% defence in hills and mountains.",
  },
  karst: {
    cue: "Free cities",
    name: "The Karst League", short: "Karst", color: "#9a5fc9",
    cap: [59, 106],
    blurb:
      "Free cities strung along the drained Adriatic, wealthy on caravan tolls and other people's wars.",
    trait: "Hiring halls: warbands cost 40% fewer recruits, and scrap income rises 25%.",
  },
  boreal: {
    cue: "Ice-edge clans",
    name: "The Boreal Clans", short: "Boreal", color: "#78ccdf",
    cap: [58, 28],
    blurb:
      "Ice-edge clans who never stopped moving. They regard the glacier as a road and the south as a larder.",
    trait: "Ice-born: no cold attrition, cheap warbands, and captured land yields plunder.",
  },
  horde: {
    cue: "Riders of the salt",
    name: "The Dry Sea Horde", short: "Horde", color: "#d9a63f",
    cap: [87, 91],
    blurb:
      "Riders of the salt basin left behind when the Black Sea shrank. They water at wells that were once harbours.",
    trait: "Long saddle: cavalry upkeep halved, +1 movement, steppe feeds an extra ration.",
  },
  solar: {
    cue: "Mirror fields",
    name: "The Solar Throne", short: "Solar", color: "#e0644a",
    cap: [17, 120],
    blurb:
      "Iberia under mirror-fields. They burn no wood and answer to a court that measures time in sunlight.",
    trait: "Mirror fields: fuel income doubled, and technicals cost a third less once you know how to build one.",
  },
};
const NATION_IDS = Object.keys(NATIONS);

/* How each realm plays. These weight the same decisions every AI makes, so
   the Boreal Clans sprawl and fight while the Alpine Compact sits still and
   reads, without any of them needing separate code. */
const AI_STYLE = {
  dogger: { expand: 1.15, war: 0.75, build: 1.35, research: 1.15, host: 0.9,
            note: "works its holdings before it widens them" },
  lyon:   { expand: 1.30, war: 0.95, build: 1.10, research: 1.00, host: 1.15,
            note: "levies hard and pushes the frontier" },
  alpine: { expand: 0.65, war: 0.55, build: 1.50, research: 1.45, host: 0.75,
            note: "sits still, builds and reads" },
  karst:  { expand: 1.00, war: 0.80, build: 1.25, research: 1.25, host: 1.00,
            note: "buys what it can and fights when it must" },
  boreal: { expand: 1.45, war: 1.45, build: 0.60, research: 0.65, host: 1.35,
            note: "sprawls and raids, builds almost nothing" },
  horde:  { expand: 1.50, war: 1.25, build: 0.60, research: 0.80, host: 1.30,
            note: "rides wide and keeps moving" },
  solar:  { expand: 0.85, war: 0.65, build: 1.40, research: 1.35, host: 0.85,
            note: "hoards, refines and stays home" },
};
const styleOf = (id) => AI_STYLE[id] || { expand: 1, war: 1, build: 1, research: 1, host: 1 };

/* Company art, keyed on what the company carries. Anything without a
   picture simply shows no picture — the layouts do not depend on it. */
const UNIT_ART = {
  spearmen: unitSpearmen,
  hunters: unitHunters,
  axemen: unitAxemen,
};

/* The icon for a company type, whether or not it has a painting. Used where a
   row needs a mark rather than a portrait — the muster roll, mostly. */
function UnitMark({ type, size = 22, lit }) {
  const ic = unitIcon(type);
  if (!ic) return <span style={{ width: size, height: size, display: "inline-block" }} />;
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} aria-hidden="true"
      style={{ display: "block", flexShrink: 0, color: lit ? "#8fe3d6" : "#7e939f" }}>
      <path d={ic.d} fill="currentColor" />
    </svg>
  );
}

function UnitArt({ type, size = 40, plinth }) {
  const src = UNIT_ART[type];
  if (src) {
    return (
      <span className={plinth ? "cc-unitplinth" : "cc-unitart"} style={{ height: size }}>
        <img src={src} alt="" style={{ height: size, width: "auto", display: "block" }} />
      </span>
    );
  }
  /* Three of the fourteen company types have painted art and the other eleven
     had nothing at all — a blank where the picture goes, in every muster roll
     and every battle. They fall back to a game-icons mark, which is not the
     same thing as a painting but is a great deal better than a hole. */
  const ic = unitIcon(type);
  if (!ic) return null;
  // In the portrait slot the mark is set well inside the plinth, so it reads as
  // a device on a plate rather than as a painting that failed to load.
  const s = plinth ? Math.round(size * 0.62) : size;
  return (
    <span className={plinth ? "cc-unitplinth" : "cc-unitart"}
      style={{ height: size, color: plinth ? "#7f96a3" : "#93aab7",
        display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 512 512" width={s} height={s} aria-hidden="true" style={{ display: "block" }}>
        <path d={ic.d} fill="currentColor" />
      </svg>
    </span>
  );
}

/* Ground art, keyed on terrain. Used in the province panel and behind a
   survey encounter. Terrains without a picture simply show none. */
const TERRAIN_ART = {
  p: terrainPlains,
  d: terrainSiltFlats,
};

function TerrainArt({ t, height = 116, caption, corner }) {
  const src = TERRAIN_ART[t];
  if (!src) return null;
  return (
    <div className={`cc-terrainart ${corner ? "cc-terrainflat" : ""}`} style={{ height }}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <span className="cc-terrainfade" />
      {caption && <span className="cc-terraincap">{caption}</span>}
    </div>
  );
}

/* ------------------------------- EQUIPMENT -------------------------------- */

// What a realm can do before it has learned anything.

/* What a company carries and wears. Both start where everyone starts — bone,
   stone and hide — and climb as the workshops learn. Scrap plate is cheap and
   it shows: forged mail off your own ore is worth far more than salvage. */
const WEAPON_GRADES = [
  { id: "bone",  name: "Bone and stone", mul: 1.00, scrap: 1, metal: 0, needs: null,
    desc: "Knapped points and fire-hardened shafts. It kills, slowly." },
  { id: "iron",  name: "Wrought iron",   mul: 1.35, scrap: 2, metal: 2, needs: "smelting",
    desc: "Bloomery iron, hammered out. The first real edge anyone has held in centuries." },
  { id: "steel", name: "Forged steel",   mul: 1.70, scrap: 2, metal: 4, needs: "toolcraft",
    desc: "Carburised, quenched and drawn. It holds an edge through a whole engagement." },
  { id: "vault", name: "Vault steel",    mul: 2.05, scrap: 3, metal: 7, needs: "vaultcraft",
    desc: "Pre-Collapse alloy, copied by hand. Ruinously dear and worth it." },
];
const ARMOUR_GRADES = [
  { id: "hide",   name: "Bone and hide",  def: 0,  scrap: 0, metal: 0, needs: null,
    desc: "Layered hide over bone plate. Warm, at least." },
  { id: "leather",name: "Boiled leather", def: 4,  scrap: 3, metal: 0, needs: "smelting",
    desc: "Hardened in wax. Cheap, quiet, and it turns a blade once." },
  { id: "scrap",  name: "Scrap plate",    def: 8,  scrap: 12, metal: 0, needs: "toolcraft",
    desc: "Road signs and bootlids riveted over cloth. It is what you make when you have no ore." },
  { id: "mail",   name: "Forged mail",    def: 14, scrap: 2, metal: 5, needs: "toolcraft",
    desc: "Drawn wire, riveted ring by ring. Worth three scrap-clad men." },
  { id: "plate",  name: "Forged plate",   def: 21, scrap: 2, metal: 10, needs: "vaultcraft",
    desc: "Articulated and fitted. Nothing short of a gun will open it." },
];
/* ------------------------------- PRODUCTION --------------------------------
   Companies are not conjured out of scrap. Your workshops turn out arms of a
   given kind every season, and a company cannot be raised until enough of its
   kind is on the rack. What your craftsmen work on is your decision.
   ------------------------------------------------------------------------ */
/* A tile carries more than one worksite now. How many depends on who lives
   there, and each one after the first costs more — the ground, the timber and
   the hands are already spoken for. One of each kind per tile: two silt farms
   on the same hex is not a decision, it is a typo. */
const buildsOf = (p) => (p && p.builds) || [];
const doneBuilds = (p) => buildsOf(p).filter((b) => !b.left);
const hasBuild = (p, id) => buildsOf(p).some((b) => b.id === id && !b.left);
/* A named place is a settlement and gets a district: a row of slots that opens
   up as more people live there, the way a town grows quarters. Everything else
   on the map is ground with room for a worksite or three, which is what it was
   before — 8,500 hexes with a building screen each would be a spreadsheet, not
   a game. */
const isSettlement = (p) => !!p && !!LANDMARKS[key(p.c, p.r)];
const DISTRICT_SLOTS = [
  { at: 1400, n: 5, name: "a city" },
  { at: 800, n: 4, name: "a town" },
  { at: 400, n: 3, name: "a market town" },
  { at: 150, n: 2, name: "a village" },
  { at: 0, n: 1, name: "a hamlet" },
];
const districtRank = (pop) => DISTRICT_SLOTS.find((d) => (pop || 0) >= d.at) || DISTRICT_SLOTS[DISTRICT_SLOTS.length - 1];
// A seat holds one more than its size alone would allow: the hall, the yards
// and the people who came because it is the hall.
const districtSlots = (p) => districtRank(p && p.pop).n + (p?.capital ? 1 : 0);
const districtMax = (p) => DISTRICT_SLOTS[0].n + (p?.capital ? 1 : 0);
// What a locked slot is waiting for, or null when they are all open.
function districtNeeds(p) {
  const have = districtSlots(p);
  const step = [...DISTRICT_SLOTS].reverse().find((d) => d.n > districtRank(p && p.pop).n);
  return step ? { at: step.at, name: step.name, n: step.n + (p?.capital ? 1 : 0), have } : null;
}
const buildSlots = (p) => (isSettlement(p) ? districtSlots(p) : popSlots(p && p.pop));
const freeSlots = (p) => buildSlots(p) - buildsOf(p).length;
const BUILD_STEP = [1, 1.75, 2.5];
const buildCost = (base, n) => Math.round(base * BUILD_STEP[Math.min(n, BUILD_STEP.length - 1)]);
const firstDamaged = (p) => buildsOf(p).find((b) => b.damaged && !b.left) || null;

const HANDS_SEAT = 6;                        // craftsmen working out of a seat
const HANDS_PER_HUT = 4;                     // each craftsmen's hut on top
const ARMS_PER_HAND = 10;                    // what one of them turns out in a season

/* How many pairs of hands a realm has. A hut that has been knocked about works
   at half strength, rounded down — half a craftsman is no craftsman. */
function craftHands(provinces, natId) {
  let hands = 0;
  Object.values(provinces).forEach((p) => {
    if (p.owner !== natId) return;
    if (p.capital) hands += HANDS_SEAT;
    doneBuilds(p).forEach((b) => {
      if (b.id !== "workshop") return;
      const n = buildStep(b)?.hands || HANDS_PER_HUT;
      hands += b.damaged ? Math.floor(n / 2) : n;
    });
  });
  return hands;
}

/* nat.crafts is a count of craftsmen per line, not a share of the work. The
   difference matters: hands you do not assign are idle and make nothing, so
   the number on the screen is a decision rather than a ratio.

   A realm can end up with more assigned than it has — a hut burns, a seat is
   taken — and rather than silently dropping lines, everyone is scaled back
   proportionally and the panel says so. */
function craftPlan(nat, provinces, natId) {
  const hands = craftHands(provinces, natId);
  const crafts = nat.crafts || {};
  const open = unitsFor(nat);
  const assigned = open.reduce((n, id) => n + Math.max(0, crafts[id] || 0), 0);
  const scale = assigned > hands && assigned > 0 ? hands / assigned : 1;
  const per = {};
  let working = 0;
  open.forEach((id) => {
    const on = Math.floor(Math.max(0, crafts[id] || 0) * scale);
    if (on > 0) { per[id] = on * ARMS_PER_HAND; working += on; }
  });
  return { hands, assigned, working, idle: Math.max(0, hands - assigned),
           over: assigned > hands, per, total: working * ARMS_PER_HAND };
}

const wGrade = (id) => WEAPON_GRADES.find((g) => g.id === id) || WEAPON_GRADES[0];
const aGrade = (id) => ARMOUR_GRADES.find((g) => g.id === id) || ARMOUR_GRADES[0];
const gradesFor = (nat, list) => list.filter((g) => !g.needs || nat?.known?.[g.needs]);
/* `only` marks a company that belongs to one faction and nobody else — the
   changed do not muster and their horde is never on anyone's roll. */
const unitOpen = (nat, id) => {
  const u = UNITS[id];
  if (u.only) return nat?.id === u.only;
  return !u.needs || !!nat?.known?.[u.needs];
};
const unitsFor = (nat) => UNIT_IDS.filter((id) => unitOpen(nat, id));

function unitStats(u) {
  const d = UNITS[u.type] || UNITS.spearmen;
  const wg = wGrade(u.wg), ag = aGrade(u.ag);
  return {
    melee: Math.round(d.melee * wg.mul * 10) / 10,
    ranged: Math.round(d.ranged * wg.mul * 10) / 10,
    def: d.def + ag.def,
    powder: d.powder || 0,
    food: d.food, fuel: d.fuel || 0,
    antiCav: d.antiCav || 1, cav: !!d.cav, siege: !!d.siege, beast: !!d.beast,
    scout: d.scout || 0,
    speedBonus: d.speed || 0, hold: d.hold || 1, press: d.press || 1,
  };
}
function unitCost(typeId, nat, natRec, wgId, agId) {
  const d = UNITS[typeId] || UNITS.spearmen;
  const wg = wGrade(wgId), ag = aGrade(agId);
  const per = d.size / 100;
  let scrap = Math.round(d.scrap + (wg.scrap + ag.scrap) * per * 10);
  let metal = Math.round((wg.metal + ag.metal) * per * 10);
  let men = d.size;
  if (nat === "karst") scrap = Math.round(scrap * 0.85);
  if (nat === "solar" && typeId === "technicals") scrap = Math.round(scrap * 0.7);
  men = Math.max(1, Math.round(men * lordMul(nat, natRec).recruitCost));
  return { scrap, metal, men };
}
function makeUnit(typeId, owner, idSeed, wg, ag) {
  const d = UNITS[typeId] || UNITS.spearmen;
  return {
    id: `u${idSeed}`, type: typeId, owner, wg: wg || "bone", ag: ag || "hide",
    str: d.size, max: d.size,
    morale: d.moraleBase, maxMorale: d.moraleBase,
    xp: 0,
  };
}
const unitName = (u) => (UNITS[u.type] || UNITS.spearmen).name;
const unitKit = (u) => `${wGrade(u.wg).name} · ${aGrade(u.ag).name}`;


function hasSite(state, natId, t) {
  if (!t.site) return true;
  const owned = Object.values(state.provinces).filter((p) => p.owner === natId);
  return owned.some((p) =>
    (t.site.terrain && t.site.terrain.includes(p.t)) ||
    (t.site.feature && p.feature && t.site.feature.includes(p.feature)) ||
    (t.site.building && hasBuild(p, t.site.building)));
}
function techState(state, natId, id) {
  const n = state.nations[natId];
  const t = TECHS[id];
  if (n.known?.[id]) return { s: "known" };
  if (n.research?.id === id) return { s: "working", left: n.research.left };
  // A whole tier can be out of sight. Nothing in it is offered, to the player
  // or to the AI, until the tier below is nearly done.
  if (!tierOpen(n.known, TIER_OF[id])) {
    const w = tierNeeds(n.known, TIER_OF[id]);
    return { s: "shrouded", why: `Learn ${w.left} more ${w.tier.name} advance${w.left === 1 ? "" : "s"} first.` };
  }
  const missing = t.needs.filter((k) => !n.known?.[k]);
  if (missing.length) return { s: "locked", why: `Needs ${missing.map((k) => TECHS[k].name.toLowerCase()).join(" and ")}.` };
  if (!hasSite(state, natId, t)) return { s: "locked", why: `Needs ${t.site.label}.` };
  if (n.research) return { s: "busy", why: "Your scholars are already on something else." };
  if (n.res.scrap < t.scrap) return { s: "poor", why: `Needs ${t.scrap} scrap.` };
  return { s: "open" };
}
const researchTurns = (natId, t, nat) => Math.max(1, Math.ceil(
  t.turns * (natId === "alpine" ? 0.7 : 1) * lordMul(natId, nat).research));

// Every gate on kit and buildings resolves through this.
// Buildings still gate on advances; companies use their own `needs` field.
function unlocked(nat, thing) {
  return TECH_IDS.some((id) => nat?.known?.[id] && (TECHS[id].unlocks || []).includes(thing));
}

/* --------------------------------- LAIRS ----------------------------------
   Ruins are not empty. Some of them hold somebody, and you do not find out
   which until you send a warband in. What is in there fights like anyone else,
   so the ordinary battle rules apply and the ordinary battle screen opens.
   ------------------------------------------------------------------------ */
const LAIR_KINDS = {
  wasters: {
    faction: "wasters", title: "Somebody is living here",
    text: "Cooking smoke, a dog that stops barking too suddenly, and a barricade across the stair that was built from the inside. They have been here a long while and they know every floor of it.",
    garrison: ["spearmen", "axemen", "hunters"],
    loot: { scrap: 55, food: 25 },
  },
  changed: {
    faction: "changed", title: "Something is living here",
    text: "The lower floors are wet and warm and smell of ammonia. What comes up the stairwell at you is the wrong shape and there is a great deal of it. Nobody agrees afterwards on how many there were.",
    garrison: ["fleshhorde", "fleshhorde", "fleshhorde"],
    loot: { scrap: 30, powder: 18 },
  },
  herd: {
    faction: "beasts", title: "Something is already using this wood",
    text: "Runs pushed through the bracken, a kill dragged up into the roots of a fallen oak, and the birds all going quiet at once. Nothing here wants to talk to you and nothing here is afraid of you.",
    garrison: ["feralherd", "feralherd"],
    loot: { food: 45 },
  },
  barricade: {
    faction: "wasters", title: "The street is walled off",
    text: "Cars stacked three high across the approach, loopholed, with a gate that opens from behind. Whoever holds it has powder and is not interested in talking about terms.",
    garrison: ["spearmen", "hunters", "axemen"],
    loot: { scrap: 45, powder: 10, food: 15 },
  },
};
// Ruins we have decided are occupied, whatever the dice say.
const NAMED_LAIRS = { "20,77": "wasters", "19,77": "changed" };

/* ------------------------------- HOLDOUTS ---------------------------------
   Powers that hold exactly one place and never march anywhere. They do not
   expand, negotiate or take sides — they simply refuse to be moved, and what
   they are sitting on is worth taking off them.
   ------------------------------------------------------------------------ */
const MINORS = {
  quarrymen: {
    name: "The Quarrymen of Red-Ruth", short: "Quarrymen", color: "#d08a3c",
    at: [14, 81], seatName: "Red-Ruth", defBonus: 45,
    feature: "quarry", building: "yard",
    blurb:
      "Three hundred years down the same shafts. They kept the pumps running, the china clay pits open and the smelters lit, and they have never once needed anyone's permission.",
    trait:
      "Dug in behind spoil heaps and cut faces, with guns ranged on every approach. They will not expand and they will not treat. Break them and the workings are yours.",
    garrison: [
      "vaultguard",
      "pikemen",
      "pikemen",
      ["battery", "cannon", "rags", "foot"],
    ],
  },
  wasters: {
    name: "The Wasters", short: "Wasters", color: "#b5793f", defBonus: 10, roaming: true,
    blurb: "Nobody's people. They hold a ruin until it is emptied and then they walk to the next one.",
    trait: "They hold what they are sitting on and take what is not nailed down. There is nothing to negotiate.",
  },
  beasts: {
    name: "The Feral Herds", short: "Feral herd", color: "#9a7a4a", defBonus: 8,
    blurb: "Three hundred years with nobody hunting them, and the woods belong to what lives in them.",
    trait: "They hold the wood they are in and nothing more. Bring bows: they have no armour and no stomach for a fight they are losing.",
  },
  changed: {
    name: "The Changed", short: "Changed", color: "#8a5fa0", defBonus: 20,
    blurb: "Three centuries in the wet dark under the ruins did something, and it kept doing it.",
    trait: "They do not leave the ruins and they do not stop coming up the stairs.",
  },
};
const MINOR_IDS = Object.keys(MINORS);
const SEATED_MINORS = MINOR_IDS.filter((id) => MINORS[id].at);
const isMinor = (id) => !!MINORS[id];
// every lookup for a colour, a name or a crest goes through this
const FACTION = { ...NATIONS, ...MINORS };

/* ------------------------------- THE WILD ---------------------------------
   Empty ground is not empty. A warband standing on unclaimed land can survey
   it, which draws an encounter weighted by terrain. Only once a place has been
   surveyed can it be claimed — so expansion costs time and sometimes blood.
   ------------------------------------------------------------------------ */
const FEATURES = {
  depot:    { name: "Buried depot",      yield: { scrap: 2 },            desc: "Pallets still shrink-wrapped." },
  weirs:    { name: "Fish weirs",        yield: { food: 2 },             desc: "Someone's traps, still catching." },
  herd:     { name: "Wild herd",         yield: { food: 1, men: 1 },     desc: "Horses that answer to nobody yet." },
  vault:    { name: "Cracked vault",     yield: { scrap: 1, powder: 1 }, desc: "Pre-Collapse stock, mostly spoiled." },
  holdfast: { name: "Survivor holdfast", yield: { men: 2 },              desc: "They stayed. Now they muster with you." },
  seep:     { name: "Fuel seep",         yield: { fuel: 2 },             desc: "It comes up on its own." },
  boneyard: { name: "Boneyard",          yield: { scrap: 1 },            desc: "Machines died here in numbers." },
  quarry:   { name: "The Red-Ruth workings", yield: { scrap: 5, fuel: 3, powder: 1 },
              desc: "Deep shafts, standing smelters and pumps that still turn. The best industry left on the island." },
};

// on: terrains this encounter suits. null means anywhere.
const ENCOUNTERS = [
  {
    id: "wreck", on: "d", title: "A ship lying on her side",
    text: "Four hundred metres of hull, keeled over in the silt where the sea left her. The containers aft are still stacked.",
    choices: [
      { label: "Cut into the holds", hint: "The deck plates are rotten through",
        outcomes: [
          { w: 62, text: "Two days of torch work and you are dragging out cable drums and bar stock.", res: { scrap: 55 }, feature: "depot" },
          { w: 38, text: "A walkway gives way. You lose people, and most of the load goes into the mud.", res: { scrap: 20 }, hurt: 0.1 },
        ] },
      { label: "Strip what is on deck", hint: "Modest, and nobody gets hurt",
        outcomes: [{ w: 100, text: "Winches, rail, a lifeboat's worth of fittings. Honest work.", res: { scrap: 22 } }] },
    ],
  },
  {
    id: "bloom", on: "dc", title: "Salt bloom",
    text: "The flats here have gone white and crusted, but underneath the silt is black and sweet.",
    choices: [
      { label: "Break ground and sample it", hint: "",
        outcomes: [
          { w: 70, text: "Good soil under the crust. Your quartermasters are visibly moved.", res: { food: 40 } },
          { w: 30, text: "Brine all the way down. You fill two barrels with salt and call it a day.", res: { food: 10, scrap: 5 } },
        ] },
    ],
  },
  {
    id: "feral", on: "r", title: "The Changed",
    text: "Something has been living in the stairwells. It moves in a group, it uses the high ground, and it has been watching you since noon.",
    choices: [
      { label: "Clear the block", hint: "Costly, but the ruin is worth having",
        outcomes: [
          { w: 58, text: "Ugly work, floor by floor. You hold the block by dark.", res: { scrap: 30 }, hurt: 0.1, feature: "boneyard" },
          { w: 42, text: "They know the building far better than you do. You pull back at dusk with fewer people.", hurt: 0.2 },
        ] },
      { label: "Burn the approaches and move on", hint: "Cheap, learns little",
        outcomes: [{ w: 100, text: "You make the ground floors impassable and camp well clear. Nothing follows.", res: { fuel: -6 } }] },
    ],
  },
  {
    id: "sealed", on: "rhm", title: "A door that never opened",
    text: "A blast door set into the rock, still seated, still cold. The keypad has been dead for three centuries.",
    choices: [
      { label: "Cut it", hint: "Slow, and you do not know what is behind it",
        outcomes: [
          { w: 45, text: "Racks of sealed crates. Powder, primers, machine tools.", res: { scrap: 35, powder: 30 }, feature: "vault" },
          { w: 35, text: "Flooded. Whatever was in there dissolved a long time ago.", res: { scrap: 8 } },
          { w: 20, text: "The seal was holding something in. You shut it again, but not before it costs you.", hurt: 0.12 },
        ] },
      { label: "Mark it and leave it sealed", hint: "You can always come back",
        outcomes: [{ w: 100, text: "You chalk the position and post a warning. Some doors stay shut for a reason.", res: {} }] },
    ],
  },
  {
    id: "convoy", on: "gt", title: "A convoy in the ice",
    text: "Nine vehicles nose to tail, buried to the windows. The cold has kept them almost honest.",
    choices: [
      { label: "Dig them out", hint: "Days of shovelling in the open",
        outcomes: [
          { w: 66, text: "Three tanks still sealed, and the tools to move them.", res: { fuel: 45, scrap: 20 }, feature: "seep" },
          { w: 34, text: "A whiteout comes down while you are working. You get two barrels and some frostbite.", res: { fuel: 14 }, hurt: 0.09 },
        ] },
      { label: "Siphon and go", hint: "",
        outcomes: [{ w: 100, text: "You take what will pour and leave before the weather turns.", res: { fuel: 18 } }] },
    ],
  },
  {
    id: "whiteout", on: "gt", title: "The weather turns",
    text: "The sky goes the colour of the ground and stays there for three days.",
    choices: [
      { label: "Sit it out", hint: "",
        outcomes: [
          { w: 60, text: "You dig in and wait. Cold, dull, survivable.", res: { food: -12 } },
          { w: 40, text: "Two tents go in the night, and the people in them.", hurt: 0.1, res: { food: -8 } },
        ] },
    ],
  },
  {
    id: "herd", on: "sp", title: "Horses on the grass",
    text: "Perhaps two hundred head, shaggy and short-legged, grazing without a rider in sight.",
    choices: [
      { label: "Run them into a draw and take what you can", hint: "",
        outcomes: [
          { w: 72, text: "Forty head, green but sound. Your outriders are delighted.", res: { food: 25, men: 40 }, feature: "herd" },
          { w: 28, text: "They scatter over the ridge before the net closes. You get six.", res: { food: 8, men: 8 } },
        ] },
      { label: "Leave them and note the ground", hint: "Good pasture is worth more than meat",
        outcomes: [{ w: 100, text: "You map the water and the grazing instead. This will feed a holding.", feature: "herd" }] },
    ],
  },
  {
    id: "riders", on: "s", title: "Watched from the ridge",
    text: "Six riders on the skyline, matching your pace at a distance, making no attempt to hide.",
    choices: [
      { label: "Ride out to them", hint: "",
        outcomes: [
          { w: 55, text: "They trade: salt and directions for powder. Useful directions.", res: { powder: -10, food: 20 } },
          { w: 45, text: "They are gone before you close, and so is one of your picket lines that night.", res: { food: -10 }, hurt: 0.05 },
        ] },
      { label: "Close ranks and continue", hint: "",
        outcomes: [{ w: 100, text: "They follow for a day and peel off. Nothing comes of it.", res: {} }] },
    ],
  },
  {
    id: "charcoal", on: "f", title: "Charcoal burners",
    text: "Cut stacks, banked earth, a fire that has been managed within the month. Whoever tends it is not showing themselves.",
    choices: [
      { label: "Call out and wait", hint: "",
        outcomes: [
          { w: 68, text: "A family, eventually. They would rather sell than run.", res: { fuel: 30, food: 10 }, feature: "seep" },
          { w: 32, text: "Nobody comes. You take the stacks that are cool enough to move.", res: { fuel: 16 } },
        ] },
      { label: "Take the stacks", hint: "Faster, and someone will remember it",
        outcomes: [{ w: 100, text: "You load what is cut and go. The fire is still banked when you leave.", res: { fuel: 26 } }] },
    ],
  },
  {
    id: "wolves", on: "fh", title: "Something is culling the deer",
    text: "You find the third carcass by mid-afternoon, opened the same way as the first two.",
    choices: [
      { label: "Hunt it", hint: "",
        outcomes: [
          { w: 60, text: "A pack, bigger than they have any business being. You take the pelts.", res: { food: 18 }, hurt: 0.05 },
          { w: 40, text: "It hunts you back through the timber. You break off after losing two.", hurt: 0.11 },
        ] },
      { label: "Post double watch and move through", hint: "",
        outcomes: [{ w: 100, text: "Long night, no losses, no pelts.", res: {} }] },
    ],
  },
  {
    id: "mirrors", on: "b", title: "A field of mirrors",
    text: "Hectares of heliostats, most still standing, all still tracking a sun they can no longer feed anything.",
    choices: [
      { label: "Recommission a bank of them", hint: "Needs parts and patience",
        outcomes: [
          { w: 64, text: "You get one loop hot. It will crack oil, slowly, forever.", res: { scrap: -15, fuel: 40 }, feature: "seep" },
          { w: 36, text: "The control gear is beyond you. You take the silvered glass and the copper.", res: { scrap: 25 } },
        ] },
      { label: "Strip the copper", hint: "",
        outcomes: [{ w: 100, text: "Miles of it, and nobody to object.", res: { scrap: 30 } }] },
    ],
  },
  {
    id: "weirs", on: "lc", title: "Traps still set",
    text: "Withy fences across the channel, maintained within living memory, full of fish.",
    choices: [
      { label: "Take the catch and repair the weirs", hint: "",
        outcomes: [{ w: 100, text: "A good haul, and the fences will keep working for whoever holds this water.", res: { food: 35 }, feature: "weirs" }] },
    ],
  },
  {
    id: "holdfast", on: null, title: "People, still here",
    text: "A holdfast of forty-odd, walled with vehicle bodies. They have watched three centuries of weather and are not obviously impressed by you.",
    choices: [
      { label: "Offer terms and a share of the rations", hint: "Costs food now, gains hands later",
        outcomes: [
          { w: 70, text: "They take the terms. Their young walk out with your column.", res: { food: -25, men: 70 }, feature: "holdfast" },
          { w: 30, text: "They take the food and keep the gate shut. You have bought goodwill and nothing else.", res: { food: -25 } },
        ] },
      { label: "Demand tribute", hint: "Quick, and they will not forget",
        outcomes: [
          { w: 55, text: "They pay. Sullenly, and less than you asked.", res: { scrap: 20, food: 12 } },
          { w: 45, text: "They shoot first. You take the wall, and the place is worth much less now.", res: { scrap: 10 }, hurt: 0.13 },
        ] },
    ],
  },
  {
    id: "road", on: null, title: "A road that still goes somewhere",
    text: "Two lanes of it, cracked but level, running straight through the country under a century of drift. There are vehicles on it, nose to tail, where the traffic stopped.",
    choices: [
      { label: "Work the line of vehicles", hint: "Slow going, but there are hundreds",
        outcomes: [
          { w: 68, text: "Batteries, alloy, glass, and a flatbed you can actually tow.", res: { scrap: 34 }, feature: "boneyard" },
          { w: 32, text: "Picked over long ago. You get the wheel weights and little else.", res: { scrap: 11 } },
        ] },
      { label: "Follow it and map the route", hint: "No loot, but a road is a road",
        outcomes: [{ w: 100, text: "It runs clean for forty kilometres. Your outriders will thank you for this.", res: { fuel: 8 } }] },
    ],
  },
  {
    id: "cairn", on: null, title: "A cairn, and a warning",
    text: "Stones piled shoulder-high, and a board with a word on it in a script nobody with you can read. The ground beyond is very quiet.",
    choices: [
      { label: "Go around", hint: "Costs a day, offends nobody",
        outcomes: [{ w: 100, text: "You lose an afternoon and gain a healthy respect for other people's markers.", res: {} }] },
      { label: "Go through", hint: "Whoever built it meant something by it",
        outcomes: [
          { w: 52, text: "Nothing happens. On the far side, a cellar nobody has opened.", res: { scrap: 18, food: 12 } },
          { w: 48, text: "The ground is sour. Two dozen sicken before you are clear of it.", hurt: 0.09 },
        ] },
    ],
  },
  {
    id: "empty", on: null, title: "Nothing much",
    text: "Old field boundaries, a collapsed barn, weather. Your scouts are back before dark with little to report.",
    choices: [
      { label: "Map it and move on", hint: "",
        outcomes: [
          { w: 70, text: "At least you know what is here now.", res: {} },
          { w: 30, text: "A cache under the barn floor. Small, but something.", res: { scrap: 12, food: 8 } },
        ] },
    ],
  },
];

function pickEncounter(t) {
  const pool = [];
  ENCOUNTERS.forEach((e) => {
    const fits = e.on === null ? 1 : e.on.includes(t) ? 6 : 0;
    for (let i = 0; i < fits; i++) pool.push(e);
  });
  return pool[Math.floor(Math.random() * pool.length)] || ENCOUNTERS[ENCOUNTERS.length - 1];
}
function rollOutcome(choice) {
  const total = choice.outcomes.reduce((n, o) => n + o.w, 0);
  let r = Math.random() * total;
  for (const o of choice.outcomes) { r -= o.w; if (r <= 0) return o; }
  return choice.outcomes[0];
}

// Putting a flag on new ground means feeding it and garrisoning it — and the
// wider a realm already is, the more it costs to add to. A flat price let
// income outrun it and expansion compounded; this keeps growth roughly linear.
const CLAIM_BASE = { food: 22, men: 14 };
const heldCount = (provinces, id) =>
  Object.values(provinces).reduce((n, p) => n + (p.owner === id ? 1 : 0), 0);

// How many steps from this ground to the nearest province the realm already
// holds. 1 means it touches the border. Ground far out beyond the frontier
// costs more to settle, which pushes realms to grow outward in one piece
// rather than scattering holdings across the map.
function ringsToBorder(provinces, id, c, r, cap = 9) {
  if (provinces[key(c, r)]?.owner === id) return 0;
  let ring = [[c, r]];
  const seen = new Set([key(c, r)]);
  for (let d = 1; d <= cap; d++) {
    const next = [];
    for (const [x, y] of ring) {
      for (const [nx, ny] of neighbours(x, y)) {
        const k = key(nx, ny);
        if (seen.has(k)) continue;
        seen.add(k);
        const q = provinces[k];
        if (!q) continue;
        if (q.owner === id) return d;
        next.push([nx, ny]);
      }
    }
    if (!next.length) break;
    ring = next;
  }
  return cap;
}

function claimCost(provinces, id, c, r, held) {
  const strain = 1 + (held ?? heldCount(provinces, id)) * 0.06;
  const rings = (c === undefined) ? 1 : ringsToBorder(provinces, id, c, r);
  const reach = 1 + Math.max(0, rings - 1) * 0.10;      // +10% a step beyond the border
  return {
    food: Math.round(CLAIM_BASE.food * strain * reach),
    men: Math.round(CLAIM_BASE.men * strain * reach),
    rings, reach,
  };
}
const canClaim = (nat, cost) => nat.res.food >= cost.food && nat.res.men >= cost.men;

// Replacements are dearer in the field than at a muster hall, where you can
// take your pick and arm them properly.
function reinforceCost(u, natId, atMuster) {
  const gap = u.max - u.str;
  if (gap <= 0) return null;
  const full = unitCost(u.type, natId);
  const share = gap / u.max;
  const mult = atMuster ? 1 : 1.7;
  return {
    gap,
    men: Math.max(1, Math.round(full.men * share * mult)),
    scrap: Math.max(1, Math.round(full.scrap * share * mult)),
  };
}
/* How many companies will march under one banner. The long muster is a
   clerical advance, not a military one: rolls, billets and who feeds whom. */
const BAND_CAP = 8, BAND_CAP_LONG = 10;
const bandCap = (nat) => (nat?.known?.hosting ? BAND_CAP_LONG : BAND_CAP);

const musteringGround = (p) => !!p && (p.capital || hasBuild(p, "muster"));

// Sight is your own ground, wherever your warbands are standing, and one step
// beyond both. Everything else is dark: you do not know who holds it, what is
// built on it, or what is walking about on it.
function seenSet(provinces, armies, natId) {
  const seen = new Set();
  const add = (c, r) => {
    const k = key(c, r);
    if (provinces[k]) seen.add(k);
    neighbours(c, r).forEach(([x, y]) => { if (provinces[key(x, y)]) seen.add(key(x, y)); });
  };
  Object.values(provinces).forEach((p) => { if (p.owner === natId) add(p.c, p.r); });
  armies.forEach((a) => { if (a.owner === natId) add(a.c, a.r); });
  return seen;
}

const SEASON_TINT = { spring: "#9fd6a8", summer: "#e8d089", autumn: "#d09a6a", winter: "#9fc8dd" };

const seatTier = (p) => p?.tier || 0;
const seatSlots = (p) => SETTLEMENT[seatTier(p)].slots;
const seatUsed = (p) => Object.keys(p?.works || {}).length;
function seatDefence(p) {
  if (!p?.capital) return 0;
  let d = SETTLEMENT[seatTier(p)].def;
  Object.keys(p.works || {}).forEach((w) => { d += WORKS[w].def || 0; });
  return d;
}
/* ------------------------------- SIEGES ------------------------------------
   How strong the place is, whether it is worth investing rather than storming,
   and what a season of sitting in front of it does. */
const wallsOf = (p) => doneBuilds(p).reduce((n, b) => n + (buildStep(b)?.def || 0), 0) + seatDefence(p);
const isWalled = (p) => wallsOf(p) >= SIEGE.wallsAt;
const siegeOf = (p) => p?.siege || null;
const breachCount = (p) => Math.min(SIEGE.maxBreach, Math.floor((p?.siege?.seasons || 0) / SIEGE.perBreach));
/* What the ground is when the wall is the thing in your way. Sectors are walls
   until the siege has opened them. */
function stormGround(p) {
  const open = breachCount(p);
  const g = { left: "walls", centre: "walls", right: "walls" };
  BREACH_ORDER.slice(0, open).forEach((sec) => { g[sec] = "rough"; });
  return g;
}

function seatCap(prov, natId) {
  let c = 0;
  Object.values(prov).forEach((p) => {
    if (!p.capital || !p.works) return;
    if (natId && p.owner !== natId) return;
    Object.keys(p.works).forEach((w) => { c += WORKS[w].cap || 0; });
  });
  return c;
}
function workState(game, P, prov, id) {
  const w = WORKS[id];
  if (prov.works?.[id]) return { s: "built" };
  if (prov.project) return { s: "busy", why: "Work is already under way here." };
  if (seatTier(prov) < w.tier) return { s: "locked", why: `Needs ${SETTLEMENT[w.tier].name.toLowerCase()}.` };
  if (w.needs && !game.nations[P].known?.[w.needs])
    return { s: "locked", why: `Needs ${TECHS[w.needs].name.toLowerCase()}.` };
  if (seatUsed(prov) >= seatSlots(prov)) return { s: "full", why: "No room left inside the walls." };
  if (game.nations[P].res.scrap < w.scrap) return { s: "poor", why: `Needs ${w.scrap} scrap.` };
  return { s: "open" };
}
function upgradeState(game, P, prov) {
  const next = seatTier(prov) + 1;
  if (next >= SETTLEMENT.length) return { s: "max" };
  const t = SETTLEMENT[next];
  if (prov.project) return { s: "busy", why: "Work is already under way here." };
  if (t.needs && !game.nations[P].known?.[t.needs])
    return { s: "locked", why: `Needs ${TECHS[t.needs].name.toLowerCase()}.` };
  if (game.nations[P].res.scrap < t.scrap) return { s: "poor", why: `Needs ${t.scrap} scrap.` };
  return { s: "open" };
}

/* -------------------------------- SOUND -----------------------------------
   Everything here is synthesised at runtime. Artifacts cannot fetch audio
   files, so the drone, the wind and every effect are built from oscillators
   and filtered noise. Nothing is created until the player's first gesture,
   which is also what browsers require before audio may start.
   ------------------------------------------------------------------------ */
const Sound = (() => {
  let ctx = null, master = null, musicBus = null, sfxBus = null, ambBus = null;
  let noiseBuf = null, playing = false, timer = null, voices = [];
  let wantMusic = true, wantSfx = true;
  let amb = null, ambTimer = null, field = null;
  let scene = { season: "spring", coast: false, forge: false, ruins: false };

  const ok = () => ctx && ctx.state !== "closed";

  function ensure() {
    if (ctx) return ctx;
    const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.75; sfxBus.connect(master);
    // Ambience rides with the music, so one switch silences the lot.
    ambBus = ctx.createGain(); ambBus.gain.value = 0; ambBus.connect(master);
    const n = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  function noise(dur, type, freq, q, gain, at = 0) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    const t = ctx.currentTime + at;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(t); src.stop(t + dur + 0.05);
  }

  function tone(freq, dur, type, gain, at = 0, glide) {
    const o = ctx.createOscillator(); o.type = type;
    const g = ctx.createGain();
    const t = ctx.currentTime + at;
    o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  const FX = {
    click:   () => { noise(0.05, "highpass", 1800, 1, 0.05); },
    tick:    () => { tone(880, 0.05, "square", 0.02); },
    march:   () => { for (let i = 0; i < 4; i++) noise(0.13, "lowpass", 220 - i * 12, 1, 0.075, i * 0.11); },
    claim:   () => { tone(146.8, 1.5, "sawtooth", 0.055); tone(220, 1.5, "sawtooth", 0.035, 0.05); tone(293.7, 1.2, "triangle", 0.03, 0.18); },
    survey:  () => { tone(392, 0.5, "triangle", 0.05); tone(587.3, 0.7, "triangle", 0.04, 0.12); },
    found:   () => { [523.3, 659.3, 784].forEach((f, i) => tone(f, 0.7, "triangle", 0.045, i * 0.09)); },
    hurt:    () => { noise(0.4, "lowpass", 320, 1, 0.09); tone(110, 0.35, "sawtooth", 0.05, 0, 62); },
    volley:  () => { for (let i = 0; i < 7; i++) noise(0.09, "bandpass", 900 + Math.random() * 1500, 2, 0.06, Math.random() * 0.22); },
    clash:   () => { for (let i = 0; i < 5; i++) noise(0.16, "bandpass", 500 + Math.random() * 900, 3, 0.07, i * 0.05); tone(82, 0.5, "sawtooth", 0.05); },
    turn:    () => { tone(98, 1.1, "sawtooth", 0.05); tone(147, 1.1, "sawtooth", 0.03, 0.04); },
    // The orders given, and what happens when they are obeyed.
    horn:    () => { tone(116, 1.5, "sawtooth", 0.055); tone(174, 1.4, "sawtooth", 0.032, 0.06);
                     tone(233, 1.1, "triangle", 0.02, 0.12); },
    charge:  () => { for (let i = 0; i < 6; i++) noise(0.1, "lowpass", 180 - i * 8, 1, 0.06, i * 0.07);
                     tone(87, 0.8, "sawtooth", 0.045, 0.1, 131); },
    give:    () => { tone(220, 1.2, "sawtooth", 0.05, 0, 82); noise(0.7, "bandpass", 620, 2, 0.05, 0.05); },
    flanked: () => { tone(65, 1.4, "sawtooth", 0.055, 0, 49); tone(98, 1.2, "triangle", 0.03, 0.08, 73); },
    chase:   () => { for (let i = 0; i < 8; i++) noise(0.11, "lowpass", 240 - i * 14, 1, 0.05, i * 0.065); },
    win:     () => { [220, 277.2, 329.6, 440].forEach((f, i) => tone(f, 2.2, "sawtooth", 0.05, i * 0.16)); },
    lose:    () => { [220, 207.7, 174.6, 146.8].forEach((f, i) => tone(f, 2.4, "sawtooth", 0.05, i * 0.22)); },
  };

/* ------------------------------- AMBIENCE ----------------------------------
   Weather, and what is living in it. Three layers that run continuously and
   are mixed by the season — wind, insects, the sea — and a scatter of things
   that happen once: birds in spring, gulls on a coast, ravens over ruins, a
   hammer at a seat with workshops in it, thunder in a winter storm.

   All of it is synthesised, like the rest of the audio in this game. That is
   not a compromise: a season that changes the weather under you is worth more
   than a better recording of one, and a bird that answers where you are
   standing cannot come out of a file.
   ------------------------------------------------------------------------ */
  const SEASON_AIR = {
    spring: { wind: 0.030, windHz: 520, bird: 0.55, insect: 0.00, rain: 0.10, gap: [7, 15] },
    summer: { wind: 0.018, windHz: 640, bird: 0.30, insect: 0.05, rain: 0.05, gap: [8, 17] },
    autumn: { wind: 0.055, windHz: 430, bird: 0.10, insect: 0.01, rain: 0.22, gap: [6, 13] },
    winter: { wind: 0.085, windHz: 300, bird: 0.00, insect: 0.00, rain: 0.30, gap: [5, 12] },
  };
  const air = () => SEASON_AIR[scene.season] || SEASON_AIR.spring;

  function loop(freq, q, type, gain, lfoHz, lfoAmt) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.value = gain;
    if (lfoHz) {
      const l = ctx.createOscillator(); l.frequency.value = lfoHz;
      const lg = ctx.createGain(); lg.gain.value = lfoAmt;
      l.connect(lg); lg.connect(g.gain); l.start();
      voices.push(l);
    }
    src.connect(f); f.connect(g); g.connect(ambBus);
    src.start();
    voices.push(src);
    return { g, f };
  }

  function startAmbience() {
    if (amb || !ok()) return;
    amb = {
      wind: loop(500, 0.6, "bandpass", 0.0001, 0.05, 0.02),
      sea: loop(760, 0.5, "lowpass", 0.0001, 0.075, 0.028),
      bugs: loop(4600, 9, "bandpass", 0.0001, 11, 0.006),
      rain: loop(2400, 0.4, "highpass", 0.0001, 0, 0),
    };
    tuneAmbience(0.5);
    ambEvent();
  }

  function tuneAmbience(secs = 4) {
    if (!amb || !ok()) return;
    const a = air();
    fade(amb.wind.g, a.wind, secs);
    amb.wind.f.frequency.setTargetAtTime(a.windHz, ctx.currentTime, 2);
    fade(amb.sea.g, scene.coast ? 0.055 : 0.0001, secs);
    fade(amb.bugs.g, a.insect, secs);
    fade(amb.rain.g, a.rain * 0.045, secs);
  }

  // One-shots. Everything here is short, quiet and slightly different each
  // time, because a sound that repeats exactly is the one you start hearing.
  function amBird() {
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const f = 2400 + Math.random() * 1800;
      ambTone(f, 0.055, "sine", 0.035, i * (0.07 + Math.random() * 0.05), f * (1 + Math.random() * 0.5));
    }
  }
  function amGull() {
    const f = 780 + Math.random() * 260;
    ambTone(f, 0.42, "sawtooth", 0.022, 0, f * 0.55);
    ambTone(f * 1.4, 0.3, "sawtooth", 0.01, 0.28, f * 0.8);
  }
  function amRaven() {
    for (let i = 0; i < 2; i++) ambNoise(0.22, "bandpass", 620 + Math.random() * 220, 6, 0.05, i * 0.34);
  }
  function amHammer() {
    for (let i = 0; i < 3; i++) {
      const t = i * (0.34 + Math.random() * 0.06);
      ambNoise(0.06, "bandpass", 1800, 3, 0.035, t);
      ambTone(1150 + Math.random() * 200, 0.16, "triangle", 0.016, t);
    }
  }
  function amThunder() {
    ambNoise(2.6, "lowpass", 130, 0.7, 0.075);
  }
  function ambNoise(dur, type, freq, q, gain, at = 0) {
    if (!ok()) return;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    const t = ctx.currentTime + at;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.08, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(ambBus);
    src.start(t); src.stop(t + dur + 0.05);
  }
  function ambTone(freq, dur, type, gain, at = 0, glide) {
    if (!ok()) return;
    const o = ctx.createOscillator(); o.type = type;
    const g = ctx.createGain();
    const t = ctx.currentTime + at;
    o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ambBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  /* What might be heard next, weighted by the season and by what is under the
     player. Drawn rather than cycled, so the same thing can happen twice and
     the ear never learns the order. */
  function ambEvent() {
    if (!amb || !ok()) return;
    const a = air();
    const pool = [];
    if (a.bird > 0) pool.push([amBird, a.bird]);
    if (scene.coast) pool.push([amGull, 0.5]);
    if (scene.ruins) pool.push([amRaven, 0.45]);
    if (scene.forge) pool.push([amHammer, 0.4]);
    if (scene.season === "autumn" || scene.season === "winter") pool.push([amRaven, 0.2]);
    if (scene.season === "winter") pool.push([amThunder, 0.12]);
    const total = pool.reduce((n, x) => n + x[1], 0);
    if (total > 0) {
      let r = Math.random() * total;
      for (const [fn, w] of pool) { r -= w; if (r <= 0) { try { fn(); } catch (e) {} break; } }
    }
    const [lo, hi] = a.gap;
    ambTimer = setTimeout(ambEvent, (lo + Math.random() * (hi - lo)) * 1000);
  }

  function stopAmbience() {
    if (ambTimer) { clearTimeout(ambTimer); ambTimer = null; }
    amb = null;
  }

  // A slow cold drone, wind, and a bell every so often from a minor pentatonic.
  const ROOT = 55;
  const STEPS = [0, 3, 5, 7, 10, 12, 15, 19];
  function startMusic() {
    if (playing || !ok()) return;
    playing = true;
    const t = ctx.currentTime;
    [1, 1.5, 2.005].forEach((mul, i) => {
      const o = ctx.createOscillator(); o.type = i === 0 ? "sine" : "sawtooth";
      o.frequency.value = ROOT * mul;
      const f = ctx.createBiquadFilter(); f.type = "lowpass";
      f.frequency.value = 260; f.Q.value = 0.7;
      const g = ctx.createGain(); g.gain.value = i === 0 ? 0.16 : 0.045;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.03 + i * 0.017;
      const lg = ctx.createGain(); lg.gain.value = i === 0 ? 0.05 : 0.02;
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(f); f.connect(g); g.connect(musicBus);
      o.start(t); lfo.start(t);
      voices.push(o, lfo);
    });
    const w = ctx.createBufferSource(); w.buffer = noiseBuf; w.loop = true;
    const wf = ctx.createBiquadFilter(); wf.type = "bandpass"; wf.frequency.value = 480; wf.Q.value = 0.6;
    const wg = ctx.createGain(); wg.gain.value = 0.05;
    const wl = ctx.createOscillator(); wl.frequency.value = 0.06;
    const wlg = ctx.createGain(); wlg.gain.value = 0.035;
    wl.connect(wlg); wlg.connect(wg.gain);
    const wl2 = ctx.createOscillator(); wl2.frequency.value = 0.021;
    const wl2g = ctx.createGain(); wl2g.gain.value = 260;
    wl2.connect(wl2g); wl2g.connect(wf.frequency);
    w.connect(wf); wf.connect(wg); wg.connect(musicBus);
    w.start(t); wl.start(t); wl2.start(t);
    voices.push(w, wl, wl2);

    const bell = () => {
      if (!playing || !ok()) return;
      const semi = STEPS[Math.floor(Math.random() * STEPS.length)];
      const f = ROOT * 4 * Math.pow(2, semi / 12);
      const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
      const g = ctx.createGain();
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.05, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);
      o.connect(g); g.connect(musicBus);
      o.start(now); o.stop(now + 5.6);
      timer = setTimeout(bell, 5000 + Math.random() * 9000);
    };
    timer = setTimeout(bell, 2500);
  }

  function stopMusic() {
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
    voices.forEach((v) => { try { v.stop(); } catch (e) {} });
    voices = [];
  }

  function fade(node, to, secs) {
    if (!ok()) return;
    const t = ctx.currentTime;
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(Math.max(0.0001, node.gain.value), t);
    node.gain.linearRampToValueAtTime(to, t + secs);
  }

  return {
    // called on the first real gesture, which is what unlocks audio
    wake() {
      if (!ensure()) return;
      if (ctx.state === "suspended") ctx.resume();
      if (wantMusic) { startMusic(); startAmbience(); fade(musicBus, 0.5, 3); fade(ambBus, 0.9, 4); }
    },
    play(name) {
      if (!wantSfx || !ok() || !FX[name]) return;
      if (ctx.state === "suspended") ctx.resume();
      try { FX[name](); } catch (e) {}
    },
    music(on) {
      wantMusic = on;
      if (!ensure()) return;
      if (ctx.state === "suspended") ctx.resume();
      if (on) { startMusic(); startAmbience(); fade(musicBus, 0.5, 2); fade(ambBus, 0.9, 2); }
      else { fade(musicBus, 0, 1.2); fade(ambBus, 0, 1.2); setTimeout(() => { stopMusic(); stopAmbience(); }, 1300); }
    },
    sfx(on) { wantSfx = on; if (ok()) fade(sfxBus, on ? 0.75 : 0, 0.2); },
    /* Where the player is and what season it is. Called whenever either
       changes; cheap enough to call on every selection, since nothing here
       restarts — the layers are already running and only their gains move. */
    /* The field, while you are standing on it: a long way off, a great many
       people shouting, and iron every so often. It rides the ambience bus, so
       the same switch silences it, and it is torn down when the screen closes.
       Built rather than sampled, like everything else here. */
    field(on) {
      if (!ensure() || !amb) { if (!on) return; if (!ensure()) return; }
      if (on) {
        if (field || !ok()) return;
        if (ctx.state === "suspended") ctx.resume();
        const roar = loop(320, 0.7, "bandpass", 0.0001, 0.09, 0.02);
        const iron = loop(2100, 5, "bandpass", 0.0001, 0.7, 0.004);
        fade(roar.g, 0.05, 2.5);
        fade(iron.g, 0.012, 2.5);
        field = { roar, iron };
      } else {
        if (!field) return;
        fade(field.roar.g, 0.0001, 1.4);
        fade(field.iron.g, 0.0001, 1.4);
        field = null;
      }
    },
    scene(next) {
      const same = Object.keys(next).every((k) => scene[k] === next[k]);
      if (same) return;
      scene = { ...scene, ...next };
      if (amb && ok()) tuneAmbience(4);
    },
    state() { return { music: wantMusic, sfx: wantSfx }; },
    /* What the ambience is doing right now, for the smoke test. There is no
       way to hear a headless browser, so the next best thing is to check that
       the layers exist and that the season actually moves their gains. */
    heard() {
      if (!amb || !ok()) return null;
      return {
        season: scene.season, coast: scene.coast, ruins: scene.ruins, forge: scene.forge,
        wind: +amb.wind.g.gain.value.toFixed(4),
        sea: +amb.sea.g.gain.value.toFixed(4),
        bugs: +amb.bugs.g.gain.value.toFixed(4),
      };
    },
  };
})();

/* --------------------------------- UTIL ----------------------------------- */
const key = (c, r) => `${c},${r}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const c = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}

// odd-r offset neighbours
function neighbours(c, r) {
  const odd = r % 2 === 1;
  const d = odd
    ? [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]]
    : [[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]];
  return d
    .map(([dc, dr]) => [c + dc, r + dr])
    .filter(([x, y]) => x >= 0 && x < W && y >= 0 && y < H);
}

/* -------------------------------- SUPPLY -----------------------------------
   How far from anything this realm holds a warband is standing, counted in
   hexes and traced only through ground nobody else holds. Territory belonging
   to somebody else does not carry your rations, so a column that walks past a
   rival's border can be cut off while standing three hexes from its own.

   The search is bounded at SUPPLY_MAX, which is the whole point: at worst it
   looks at the sixty-odd hexes within four of the column rather than walking
   a map of eight thousand provinces. */
function supplyDist(provinces, natId, c, r) {
  const here = provinces[key(c, r)];
  if (!here) return SUPPLY_MAX;
  if (here.owner === natId) return 0;
  const seen = new Set([key(c, r)]);
  let edge = [[c, r]];
  for (let d = 1; d < SUPPLY_MAX; d++) {
    const next = [];
    for (const [x, y] of edge) {
      for (const [nx, ny] of neighbours(x, y)) {
        const k2 = key(nx, ny);
        if (seen.has(k2)) continue;
        seen.add(k2);
        const q = provinces[k2];
        if (!q) continue;                 // sea: nothing walks across it
        if (q.owner === natId) return d;   // the line reaches this far
        if (!q.owner) next.push([nx, ny]); // open country carries it onward
      }
    }
    if (!next.length) break;
    edge = next;
  }
  return SUPPLY_MAX;
}

/* What pulls that distance back in: the carts the column drags with it, and
   whether the realm has learned to keep a road open behind an army. */
function supplyRelief(army, nat) {
  const carts = Math.min(CART_RELIEF_CAP, army.units.reduce((n, u) =>
    n + (u.str > 0 ? (UNITS[u.type]?.carry || 0) : 0), 0));
  const road = nat?.known?.quartering ? QUARTER_RELIEF : 0;
  return { carts, road, total: carts + road };
}

/* Where a warband actually stands: how far the line really is, how far it
   feels after the carts, and what that band costs. */
function supplyOf(provinces, nat, natId, army) {
  const raw = supplyDist(provinces, natId, army.c, army.r);
  const relief = supplyRelief(army, nat);
  const d = Math.max(0, raw - relief.total);
  return { raw, relief, d, band: bandAt(d) };
}

/* Distance in hexes, through the cube coordinates an odd-r grid is really
   made of. Only the marching host needs it, and it needs it every season. */
function hexDist(c1, r1, c2, r2) {
  const x1 = c1 - ((r1 - (r1 & 1)) >> 1), z1 = r1, y1 = -x1 - z1;
  const x2 = c2 - ((r2 - (r2 & 1)) >> 1), z2 = r2, y2 = -x2 - z2;
  return (Math.abs(x1 - x2) + Math.abs(y1 - y2) + Math.abs(z1 - z2)) / 2;
}

// Land that touches open sea or a great lake can take works no inland
// province can. Sea and void are not provinces, so we read the map directly.
function coastal(c, r) {
  return neighbours(c, r).some(([x, y]) => {
    const t = MAP[y] && MAP[y][x];
    return t === "~" || t === "l";
  });
}

function regionName(c, r) {
  const hit = REGIONS.find((g) => c >= g.x0 && c <= g.x1 && r >= g.y0 && r <= g.y1);
  return hit ? hit.n : "The Wastes";
}




/* ------------------------------ WORLD SETUP ------------------------------- */
function buildWorld() {
  const provinces = {};
  const nameCount = {};
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const t = MAP[r][c];
      const info = TERRAIN[t];
      if (!info || !info.land) continue;
      const k = key(c, r);
      let nm = LANDMARKS[k];
      if (!nm) {
        const reg = regionName(c, r);
        nameCount[reg] = (nameCount[reg] || 0) + 1;
        nm = `${reg} ${ROMAN[nameCount[reg]] || nameCount[reg]}`;
      }
      provinces[k] = { c, r, t, name: nm, owner: null, builds: [], capital: false, seat: null, explored: false, feature: null, pop: startingPop(k, t, null) };
    }
  }

  // Seed each nation from its capital and grow outward.
  const nations = {};
  NATION_IDS.forEach((id) => {
    const def = NATIONS[id];
    const ck = key(def.cap[0], def.cap[1]);
    nations[id] = {
      id, ...def,
      res: { food: 340, scrap: 200, metal: 0, fuel: 110, powder: 90, men: 300 },
      known: id === "dogger" ? { coastworks: true } : {}, research: null,
      crafts: { spearmen: 3, axemen: 2, hunters: 1 },   // six hands, the seat's full crew
      arms: { spearmen: 150, axemen: 120, hunters: 0 },
      dead: false,
    };
    if (provinces[ck]) {
      provinces[ck].owner = id; provinces[ck].capital = true; provinces[ck].seat = id;
      provinces[ck].explored = true;
      provinces[ck].tier = 0; provinces[ck].works = {}; provinces[ck].project = null;
    }
  });

  // A realm is a seat and one neighbour. Everything else has to be walked to,
  // surveyed and claimed.
  const TARGET = 2;
  for (let pass = 0; pass < TARGET; pass++) {
    NATION_IDS.forEach((id) => {
      const owned = Object.values(provinces).filter((p) => p.owner === id);
      if (owned.length >= TARGET) return;
      const frontier = [];
      owned.forEach((p) => neighbours(p.c, p.r).forEach(([c, r]) => {
        const q = provinces[key(c, r)];
        if (q && !q.owner && !frontier.includes(q)) frontier.push(q);
      }));
      frontier.slice(0, 1).forEach((q) => { q.owner = id; q.explored = true; });
    });
  }

  /* Some ruins are occupied, and so is about a third of the woodland. Which is
     which is not visible until somebody walks in and finds out — the roll is
     made here rather than at the moment of investigating so that a wood is the
     same wood every time the world is drawn, and so a save carries it.

     Herds do not add to a tile's population. They are not people. */
  Object.values(provinces).forEach((q) => {
    const named = NAMED_LAIRS[key(q.c, q.r)];
    if (named) { q.lair = named; q.pop += POP_LAIR[named] || 0; return; }
    if (q.owner) return;
    if (q.t === "f" && noise(q.c * 6.7, q.r * 13.1, 47) < 0.34) { q.lair = "herd"; return; }
    if (q.t !== "r") return;
    if (noise(q.c * 11.3, q.r * 7.7, 31) < 0.34) {
      q.lair = noise(q.r * 5.1, q.c * 9.4, 32) < 0.42 ? "changed" : "wasters";
      q.pop += POP_LAIR[q.lair] || 0;
    }
  });

  MINOR_IDS.forEach((id) => {
    nations[id] = { id, ...MINORS[id], minor: true,
      res: { food: 0, scrap: 0, metal: 0, fuel: 0, powder: 200, men: 0 } };
  });
  SEATED_MINORS.forEach((id) => {
    const m = MINORS[id];
    const k = key(m.at[0], m.at[1]);
    const q = provinces[k];
    if (q) {
      q.owner = id; q.explored = true; q.capital = true; q.seat = id;
      q.feature = m.feature; q.builds = m.building ? [{ id: m.building, left: 0 }] : [];
    }
  });

  const war = {};
  return { provinces, nations, war };
}

const warKey = (a, b) => [a, b].sort().join("|");


/* What a warband may march this season, and why that is not simply its base.
   The turn loop tops movement up with the season, the standing edict and the
   warlord folded in, so a host with a base of five shows six all summer and
   reads as a bug unless the extra is named. Mirrors the sum the turn loop
   does; if that changes, this has to change with it. */
/* A column only moves as fast as its slowest cart. One baggage train costs a
   point of movement; a second one is not free either, but it does not cost
   twice — the drovers are already going at the pace of the waggons. */
const cartDrag = (army) => Math.min(2, army.units.reduce((n, u) =>
  n + (u.str > 0 ? (UNITS[u.type]?.slow || 0) : 0), 0));

function moveAllowance(game, army) {
  const nat = game.nations?.[army.owner];
  const ed = EDICTS[nat?.edict || "none"] || EDICTS.none;
  const sea = seasonOf(game.turn);
  const seaMove = sea.move || 0;
  const edMove = ed.move || 0;
  const lordMove = lordMul(army.owner, nat).move || 0;
  const cartMove = -cartDrag(army);
  const sign = (n) => `${n > 0 ? "+" : "\u2212"}${Math.abs(n)}`;
  const from = [];
  if (seaMove) from.push(`${sea.name.toLowerCase()} ${sign(seaMove)}`);
  if (edMove) from.push(`${ed.name.toLowerCase()} ${sign(edMove)}`);
  if (lordMove) from.push(`your warlord ${sign(lordMove)}`);
  if (cartMove) from.push(`the carts ${sign(cartMove)}`);
  const total = Math.max(1, (army.maxMp || 0) + seaMove + edMove + lordMove + cartMove);
  // Movement was granted at the end of last season. Change an edict now and
  // these modifiers no longer describe what the warband is carrying — it has
  // more than the sum says, and the change bites at the turn of the season.
  const pending = (army.mp || 0) > total;
  return {
    total: Math.max(total, army.mp || 0),
    note: from.length ? from.join(", ") + (pending ? ", from next season" : "") : "",
  };
}

function moveInfo(game, army, prov, P, atWar) {
  if (!army || !prov || army.owner !== P) return null;
  if (army.c === prov.c && army.r === prov.r) return { here: true };
  const adj = neighbours(army.c, army.r).some(([x, y]) => x === prov.c && y === prov.r);
  if (!adj) return { ok: false, why: "Not next to your warband." };
  const cost = TERRAIN[prov.t].move;
  const other = game.armies.find((a) => a.c === prov.c && a.r === prov.r && a.owner !== P);
  if (other && !atWar(P, other.owner))
    return { ok: false, cost, why: `${game.nations[other.owner].short} stands there. Declare war first.` };
  if (army.mp < cost)
    return { ok: false, cost, why: `Needs ${cost} movement; ${army.mp} left this season.` };
  if (other) return { ok: true, cost, kind: "attack", label: `Attack the ${game.nations[other.owner].short} warband` };
  const friend = game.armies.find((a) => a.c === prov.c && a.r === prov.r && a.owner === P);
  if (friend) {
    const cap = bandCap(game.nations[P]);
    if (friend.units.length + army.units.length > cap)
      return { ok: false, cost, why: `${friend.name} is already at full strength — ${cap} companies is the limit.` };
    return { ok: true, cost, kind: "merge", label: `Merge forces with ${friend.name}` };
  }
  if (prov.owner && prov.owner !== P) return { ok: true, cost, kind: "seize", label: "March in and take it" };
  return { ok: true, cost, kind: "march", label: "March here" };
}

/* ------------------------------- ECONOMY ---------------------------------- */
function provinceYield(p, natId, nat) {
  // Invested: the carts do not come out and nothing is going in.
  if (p.siege) return { food: 0, scrap: 0, metal: 0, fuel: 0, powder: 0, men: 0 };
  const t = TERRAIN[p.t];
  // men comes from who lives here rather than from the terrain itself. The
  // population table is set so an ordinary tile yields exactly what its
  // terrain used to; a named place yields more, because more people are on it.
  const y = { food: t.food, scrap: t.scrap, metal: 0, fuel: t.fuel, powder: t.powder, men: popRecruits(p.pop) };
  doneBuilds(p).forEach((b) => {
    const def = buildStep(b);
    if (!def || !def.yield) return;
    Object.entries(def.yield).forEach(([k, v]) => {
      y[k] += b.damaged ? Math.floor(v / 2) : v;
    });
  });
  if (p.feature && FEATURES[p.feature]) {
    Object.entries(FEATURES[p.feature].yield).forEach(([k, v]) => { y[k] += v; });
  }
  // Ore is dug, not scavenged, and only once someone knows what to do with it.
  if (nat?.known?.smelting && (p.t === "m" || p.t === "h")) y.metal += p.t === "m" ? 2 : 1;
  TECH_IDS.forEach((id) => {
    const t = TECHS[id];
    if (!t.yield || !nat?.known?.[id]) return;
    if (t.on && !t.on.includes(p.t)) return;
    Object.entries(t.yield).forEach(([k, v]) => { y[k] += v; });
  });
  if (p.capital) {
    y.food += 7; y.scrap += 3; y.men += 3; y.powder += 1;
    Object.keys(p.works || {}).forEach((w) => {
      Object.entries(WORKS[w].yield || {}).forEach(([k, v]) => { y[k] += v; });
    });
  }
  if (natId === "dogger") { y.scrap = Math.round(y.scrap * 1.5); if (p.t === "d") y.food += 1; }
  if (natId === "karst") y.scrap = Math.round(y.scrap * 1.25);
  if (natId === "solar") y.fuel *= 2;
  if (natId === "horde" && p.t === "s") y.food += 1;
  if (natId === "lyon") y.men = Math.round(y.men * 1.4);
  return y;
}

function nationIncome(state, natId, turn) {
  const ed = EDICTS[state.nations?.[natId]?.edict || "none"] || EDICTS.none;
  const gross = { food: 0, scrap: 0, metal: 0, fuel: 0, powder: 0, men: 0 };
  let mouths = 0;
  Object.values(state.provinces).forEach((p) => {
    if (p.owner !== natId) return;
    mouths += p.pop || 0;
    const y = provinceYield(p, natId, state.nations?.[natId]);
    Object.keys(gross).forEach((k) => { gross[k] += y[k]; });
  });
  // Mouths first, and before the season is applied: what the land gives swings
  // with the year but what people eat does not, which is what makes winter bite.
  gross.food -= popFood(mouths);
  // the standing edict and the warlord both apply to what the land brings in...
  const lord = lordMul(natId, state.nations?.[natId]);
  const sea = seasonOf(turn ?? state.turn ?? 1);
  ["food", "scrap", "men"].forEach((k) => { gross[k] = Math.round(gross[k] * (sea[k] ?? 1)); });
  Object.entries(ed.mul || {}).forEach(([k, v]) => { gross[k] = Math.round(gross[k] * v); });
  Object.entries(lord.mul).forEach(([k, v]) => { gross[k] = Math.round(gross[k] * v); });
  /* ...then the warbands take their share, and what that share is depends on
     where they are standing. A company at home eats what the table says. The
     same company four hexes into somebody else's country eats five times it,
     because everything it eats has to be dragged there. */
  const keep = (ed.upkeep || 1) * lord.upkeep;
  state.armies.filter((a) => a.owner === natId).forEach((a) => {
    const draw = supplyOf(state.provinces, state.nations?.[natId], natId, a).band.draw;
    a.units.forEach((u) => {
      const st = unitStats(u);
      let f = st.food;
      if (natId === "horde" && st.cav) f = Math.round(f * 0.5);
      gross.food -= Math.round(f * keep * draw);
      gross.fuel -= Math.round(st.fuel * keep * draw);
    });
  });
  return gross;
}

/* ------------------------------- COMBAT -----------------------------------
   A battle is a line of three sectors and a reserve behind it. Every company
   stands somewhere; `u.pos` is where. Sectors fight each other separately,
   which is what makes where you put things matter — and when one of them goes,
   the enemy turns onto whatever is beside it, which is how a line comes apart
   rather than simply wearing down.
   ------------------------------------------------------------------------ */

/* What you can see of the other line before a blow is struck, which is what
   outriders are actually for. Nothing brought, nothing known: you deploy blind
   and find out when the fighting starts. A company of hunters can count them.
   Horse gets close enough to see what they are.

   0 — nothing at all      1 — how many stand in each sector
   2 — what they are, and how many                                        */
const scoutLevel = (units) => {
  const eyes = units.reduce((n, u) => n + (u.str > 0 ? unitStats(u).scout : 0), 0);
  return eyes >= 3 ? 2 : eyes >= 1 ? 1 : 0;
};

/* Heaviest first, so a formation's idea of "the centre" gets the companies
   that can hold one. */
const deployWeight = (u) => {
  const st = unitStats(u);
  return st.def * 2 + st.melee * 3 + (st.cav ? -12 : 0) + (st.ranged > 8 ? -8 : 0);
};
function deployUnits(units, formation) {
  // Carts are not drawn up. They go behind the line and stay there, and a
  // formation is laid out over the companies that can actually hold ground.
  const idx = units.map((u, i) => ({ u, i }));
  const carts = idx.filter(({ u }) => UNITS[u.type]?.carry);
  const fighting = idx.filter(({ u }) => !UNITS[u.type]?.carry);
  const lay = (FORMATIONS[formation] || FORMATIONS.even).lay(fighting.length);
  const order = fighting.sort((x, y) => deployWeight(y.u) - deployWeight(x.u));
  const out = units.map((u) => ({ ...u }));
  order.forEach(({ i }, rank) => { out[i] = { ...out[i], pos: lay[rank] }; });
  carts.forEach(({ i }) => { out[i] = { ...out[i], pos: "res" }; });
  return out;
}

/* Which of a side's sectors have nobody left standing in them. A sector nobody
   was ever put in counts as broken the moment the enemy has somebody there:
   an empty wing is not a clever economy, it is an open flank. */
function brokenSectors(mine, theirs) {
  const out = {};
  SECTORS.forEach((s) => {
    const me = mine.filter((u) => u.pos === s && u.str > 0).length;
    const them = theirs.filter((u) => u.pos === s && u.str > 0).length;
    out[s] = me === 0 && them > 0;
  });
  return out;
}

/* How many broken neighbours a sector has beside it. Anchored ground — a
   river, a shore — cannot be turned however the rest of the line is going. */
function flanksOn(broken, ground, s) {
  if (GROUND[ground[s]]?.safe) return 0;
  return ADJACENT[s].filter((t) => broken[t]).length;
}

function sidePower(units, stance, hasPowder) {
  let melee = 0, ranged = 0, defSum = 0, strSum = 0, cavStr = 0, antiCav = 0, beastStr = 0;
  units.forEach((u) => {
    const s = unitStats(u);
    const xpMul = 1 + u.xp * 0.08;
    const bodies = u.str / 100;            // linear in men still standing
    melee += s.melee * bodies * xpMul;
    ranged += s.ranged * bodies * xpMul * (hasPowder || s.powder === 0 ? 1 : 0.25);
    defSum += s.def * u.str;
    strSum += u.str;
    if (s.cav) cavStr += u.str;
    if (s.antiCav > 1) antiCav += u.str;
    if (s.beast) beastStr += u.str;
  });
  const avgDef = strSum ? defSum / strSum : 0;
  // Only so many men can reach the fighting at once. Beyond that you have depth,
  // not more firepower — which is what stops a small edge snowballing into a rout.
  const front = Math.min(1, FRONTAGE / Math.max(1, strSum));
  // rangedShare is kept unstanced: it says what this side IS, not what it is
  // doing this round, and that is what decides how it fares against animals.
  const rangedShare = melee + ranged > 0 ? ranged / (melee + ranged) : 0;
  return { melee: melee * front, ranged: ranged * front, avgDef, strSum, cavStr, antiCav,
           beastFrac: strSum ? beastStr / strSum : 0, rangedShare };
}
const FRONTAGE = 340;

const STANCES = {
  press:    { name: "Press the attack", deal: 1.3,  take: 1.15, morale: 1.0, ranged: 1.0, desc: "Close hard. Wins open ground, bleeds you on bad ground." },
  hold:     { name: "Hold the line",    deal: 0.85, take: 0.8,  morale: 0.9,  ranged: 1.0, desc: "Give up tempo to keep your companies together." },
  volley:   { name: "Volley fire",      deal: 1.0,  take: 1.0,  morale: 1.0,  ranged: 1.4, melee: 0.5, powder: 2, ignoresGround: 0.5, desc: "Shell them rather than storm them. Halves their ground advantage and burns double powder. Useless without guns." },
  withdraw: { name: "Break off",        deal: 0.4,  take: 1.4,  morale: 1.15,  ranged: 0.5, desc: "Quit the field and eat one parting volley." },
};

/* The short labels under each order in the battle screen. Every stance is a
   trade and this is the trade, in the fewest words that still say which way it
   runs. Note the polarity on morale: the multiplier scales how much nerve a
   company LOSES, so under one is the good direction — the same reading the
   warlord screen already uses when it says "nerve holds -12%". */
function stanceChips(id) {
  const s = STANCES[id];
  if (!s) return [];
  const pct = (v) => `${v > 1 ? "+" : "\u2212"}${Math.round(Math.abs(v - 1) * 100)}%`;
  const out = [];
  if (s.deal && s.deal !== 1) out.push({ t: `${pct(s.deal)} dealt`, good: s.deal > 1 });
  if (s.take && s.take !== 1) out.push({ t: `${pct(s.take)} taken`, good: s.take < 1 });
  if (s.ranged && s.ranged !== 1) out.push({ t: `${pct(s.ranged)} shooting`, good: s.ranged > 1 });
  if (s.melee && s.melee !== 1) out.push({ t: `${pct(s.melee)} in the press`, good: s.melee > 1 });
  if (s.morale && s.morale !== 1) {
    out.push({ t: `nerve ${s.morale < 1 ? "holds" : "breaks"} ${pct(s.morale)}`, good: s.morale < 1 });
  }
  if (s.ignoresGround) out.push({ t: "halves their ground", good: true });
  if (s.powder) out.push({ t: `${s.powder}\u00d7 powder`, good: false });
  return out;
}

function resolveRound(bt) {
  const b = { ...bt, log: [...bt.log] };
  const aPost = b.aPost, dPost = b.dPost;
  const aL = b.aLord || { dealt: 1, taken: 1, morale: 1 };
  const dL = b.dLord || { dealt: 1, taken: 1, morale: 1 };

  /* Powder is drawn for the whole army, once, for whatever part of the line is
     shooting this round. A sector that is not on volley still fires, it just
     does not burn double doing it. */
  const need = (units, post) => units.reduce((n, u) =>
    n + unitStats(u).powder * ((POSTURES[post[u.pos]] || POSTURES.hold).powder || 1), 0);
  const aNeed = need(b.a.units, aPost), dNeed = need(b.d.units, dPost);
  const aHas = b.aPowder >= aNeed, dHas = b.dPowder >= dNeed;
  b.aPowder = Math.max(0, b.aPowder - (aHas ? aNeed : 0));
  b.dPowder = Math.max(0, b.dPowder - (dHas ? dNeed : 0));
  if (!aHas && aNeed > 0) b.log.push({ t: "warn", s: "a", m: "Attacking guns are down to scavenged charges." });
  if (!dHas && dNeed > 0) b.log.push({ t: "warn", s: "d", m: "Defending guns are down to scavenged charges." });

  const aBroke = brokenSectors(b.a.units, b.d.units);
  const dBroke = brokenSectors(b.d.units, b.a.units);
  const ground = b.ground || { left: "open", centre: "open", right: "open" };
  const terrDef = b.terrainDef / 100;

  let aTotal = 0, dTotal = 0;
  const shaken = { a: 0, d: 0 };
  const notes = [];

  SECTORS.forEach((sec) => {
    const aU = b.a.units.filter((u) => u.pos === sec && u.str > 0);
    const dU = b.d.units.filter((u) => u.pos === sec && u.str > 0);
    if (!aU.length && !dU.length) return;

    const aS = POSTURES[aPost[sec]] || POSTURES.hold;
    const dS = POSTURES[dPost[sec]] || POSTURES.hold;
    const A = sidePower(aU, aS, aHas);
    const D = sidePower(dU, dS, dHas);
    const gr = GROUND[ground[sec]] || GROUND.open;

    let aOut = (A.ranged * (aS.ranged || 1) + A.melee * (aS.melee || 1)) * aS.deal * aL.dealt;
    let dOut = (D.ranged * (dS.ranged || 1) + D.melee * (dS.melee || 1)) * dS.deal * dL.dealt;

    // Horse is worth what the ground lets it be worth.
    if (A.cavStr > 0 && D.antiCav < D.strSum * 0.3) aOut *= 1 + 0.25 * gr.horse;
    if (D.cavStr > 0 && A.antiCav < A.strSum * 0.3) dOut *= 1 + 0.25 * gr.horse;

    // Animals against arrows, as before, but sector by sector.
    const BEAST_BOW = 1.15;
    if (D.beastFrac > 0.5) aOut *= 1 + BEAST_BOW * A.rangedShare;
    if (A.beastFrac > 0.5) dOut *= 1 + BEAST_BOW * D.rangedShare;

    // Taken in the flank. This is the whole reason the line is worth drawing.
    const aFlank = flanksOn(aBroke, ground, sec);
    const dFlank = flanksOn(dBroke, ground, sec);
    if (dFlank) { aOut *= 1 + FLANK_DEAL * dFlank; notes.push({ s: "a", sec, n: dFlank }); }
    if (aFlank) { dOut *= 1 + FLANK_DEAL * aFlank; notes.push({ s: "d", sec, n: aFlank }); }

    // The ground under this sector, and the works on the hex, help whoever is
    // defending the battle — unless the attacker stands off and shoots.
    const groundMul = aS.ignoresGround || 1;
    dOut *= 1 + (terrDef + gr.def / 100) * groundMul;
    if (b.defenderBonus) dOut *= 1 + (b.defenderBonus / 100) * groundMul;

    const K = 3.4;
    const rng = () => 0.85 + Math.random() * 0.3;
    const aCas = Math.round((dOut * K * rng() * aS.take * aL.taken) / (1 + A.avgDef / 5));
    const dCas = Math.round((aOut * K * rng() * dS.take * dL.taken) / (1 + D.avgDef / 5));
    aTotal += aCas; dTotal += dCas;

    const hit = (units, total, moraleMul, flank) => {
      const strTotal = units.reduce((n, u) => n + u.str, 0) || 1;
      const gone = [];
      units.forEach((u) => {
        const loss = Math.min(u.str, Math.round(total * (u.str / strTotal) * (0.7 + Math.random() * 0.6)));
        u.str -= loss;
        u.lastLoss = loss;
        u.morale -= (loss / u.max) * 70 * moraleMul + 2 + flank * FLANK_MORALE;
        if (u.str <= 0) { u.str = 0; gone.push({ u, dead: true }); }
        else if (u.morale <= 0) gone.push({ u, dead: false });
      });
      // The company beside you going is felt by everyone still in the sector.
      if (gone.length) units.forEach((u) => { if (u.str > 0 && u.morale > 0) u.morale -= gone.length * SHAKEN_NEAR; });
      return gone;
    };

    const aGone = hit(aU, aCas, aS.morale * (aL.morale || 1), dFlank);
    const dGone = hit(dU, dCas, dS.morale * (dL.morale || 1), aFlank);
    b.a.routed.push(...aGone.map((x) => x.u));
    b.d.routed.push(...dGone.map((x) => x.u));
    [[aGone, "a"], [dGone, "d"]].forEach(([list, side]) => list.forEach((x) => b.log.push({
      t: x.dead ? "dead" : "rout", s: side, sec,
      m: x.dead ? `${unitName(x.u)} is wiped out on the ${sec}.`
                : `${unitName(x.u)} breaks on the ${sec}.`,
    })));
    if (aGone.length && !aU.some((u) => u.str > 0 && u.morale > 0)) shaken.a += 1;
    if (dGone.length && !dU.some((u) => u.str > 0 && u.morale > 0)) shaken.d += 1;
  });

  b.a.units = b.a.units.filter((u) => u.str > 0 && u.morale > 0);
  b.d.units = b.d.units.filter((u) => u.str > 0 && u.morale > 0);

  // A whole sector going is felt all down the line, reserve included.
  if (shaken.a) b.a.units.forEach((u) => { u.morale -= shaken.a * SHAKEN_SECTOR; });
  if (shaken.d) b.d.units.forEach((u) => { u.morale -= shaken.d * SHAKEN_SECTOR; });
  b.a.units.filter((u) => u.morale <= 0).forEach((u) => b.a.routed.push(u));
  b.d.units.filter((u) => u.morale <= 0).forEach((u) => b.d.routed.push(u));
  b.a.units = b.a.units.filter((u) => u.morale > 0);
  b.d.units = b.d.units.filter((u) => u.morale > 0);

  notes.forEach((n) => b.log.push({
    t: "flank", s: n.s === "a" ? "d" : "a",
    m: `The ${n.s === "a" ? "attacking" : "defending"} ${n.sec} is taken in the flank${n.n > 1 ? " from both sides" : ""}.`,
  }));
  if (shaken.a) b.log.push({ t: "give", s: "d", m: `The attacking line gives way on ${shaken.a === 1 ? "a sector" : "two sectors"}.` });
  if (shaken.d) b.log.push({ t: "give", s: "a", m: `The defending line gives way on ${shaken.d === 1 ? "a sector" : "two sectors"}.` });
  b.log.push({ t: "round", m: `Round ${b.round}: attackers lose ${aTotal}, defenders lose ${dTotal}.` });
  b.lastExchange = { aCas: aTotal, dCas: dTotal };

  b.broken = { a: brokenSectors(b.a.units, b.d.units), d: brokenSectors(b.d.units, b.a.units) };
  b.round += 1;

  const allGone = (side) => SECTORS.every((sec) => !b[side].units.some((u) => u.pos === sec && u.str > 0));
  if (b.aStance === "withdraw" && b.a.units.length) { b.over = true; b.winner = "d"; b.retreat = "a"; }
  else if (b.dStance === "withdraw" && b.d.units.length) { b.over = true; b.winner = "a"; b.retreat = "d"; }
  else if (!b.a.units.length && !b.d.units.length) { b.over = true; b.winner = "d"; }
  else if (!b.a.units.length) { b.over = true; b.winner = "d"; }
  else if (!b.d.units.length) { b.over = true; b.winner = "a"; }
  else if (allGone("a") && !allGone("d")) { b.over = true; b.winner = "d"; b.rolled = "a"; }
  else if (allGone("d") && !allGone("a")) { b.over = true; b.winner = "a"; b.rolled = "d"; }
  else if (b.round > 10) { b.over = true; b.winner = "d"; b.stalemate = true; }

  if (b.over) {
    b.log.push({
      t: "end",
      m: b.stalemate ? "Both lines are still standing when the light goes."
        : b.rolled ? `The ${b.rolled === "a" ? "attacking" : "defending"} line is rolled up from the flank.`
        : b.retreat ? `The ${b.retreat === "a" ? "attackers" : "defenders"} quit the field.`
        : `${b.winner === "a" ? "Attackers" : "Defenders"} hold the field.`,
    });
  }
  return b;
}

function spoilsText(bag) {
  const parts = Object.entries(bag || {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${v} ${RES_META.find((r) => r.k === k)?.label.toLowerCase() || k}`);
  if (!parts.length) return "";
  const last = parts.pop();
  return `Taken from them: ${parts.length ? `${parts.join(", ")} and ${last}` : last}.`;
}

function makeBattle(provinces, nations, armies, aId, dId, k) {
  const attacker = armies.find((a) => a.id === aId);
  const defender = armies.find((a) => a.id === dId);
  const prov = provinces[k];
  if (!attacker || !defender || !prov) return null;
  const works = doneBuilds(prov).reduce((n, b) => n + (buildStep(b)?.def || 0), 0);
  // A place under siege by this attacker is stormed, not met in the open.
  const storming = prov.siege && prov.siege.by === attacker.owner && isWalled(prov);
  const ground = storming ? stormGround(prov)
    : groundFor(prov.t, coastal(prov.c, prov.r), prov.c + prov.r);
  // In a storm the wall is the ground, sector by sector, and a breach is a hole
  // in it. Counting the works a second time on top of that would make a
  // breached wall as strong as a whole one.
  const terrainDef = TERRAIN[prov.t].def + (storming ? 0 : works);
  let defenderBonus = 0;
  if (defender.owner === "alpine" && ["h", "m"].includes(prov.t)) defenderBonus += 35;
  if (isMinor(defender.owner)) defenderBonus += MINORS[defender.owner].defBonus;
  defenderBonus += seatDefence(prov);
  return {
    round: 1,
    aNat: attacker.owner, dNat: defender.owner,
    aArmy: attacker.id, dArmy: defender.id,
    hex: { c: prov.c, r: prov.r }, provName: prov.name,
    // The defender picked the ground; the attacker has to come at it.
    ground, storming: !!storming, breach: storming ? breachCount(prov) : 0,
    a: { units: deployUnits(attacker.units.map((u) => ({ ...u })), "even"), routed: [] },
    d: { units: deployUnits(defender.units.map((u) => ({ ...u })), aiFormation(defender.units, ground)), routed: [] },
    aPost: { left: "press", centre: "press", right: "press" },
    dPost: { left: "hold", centre: "hold", right: "hold" },
    broken: { a: { left: false, centre: false, right: false },
              d: { left: false, centre: false, right: false } },
    aPowder: nations[attacker.owner].res.powder,
    dPowder: nations[defender.owner].res.powder,
    aStance: "press", dStance: "hold",
    terrainDef, defenderBonus,
    aLord: attacker.lord ? commandMul(attacker.owner) : { dealt: 1, taken: 1, morale: 1 },
    dLord: defender.lord ? commandMul(defender.owner) : { dealt: 1, taken: 1, morale: 1 },
    aCommander: !!attacker.lord, dCommander: !!defender.lord,
    log: [{
      t: "open",
      m: storming
        ? `${nations[attacker.owner].short} storms ${prov.name}. ${breachCount(prov)
          ? `${breachCount(prov)} breach${breachCount(prov) > 1 ? "es" : ""} stand open.`
          : "The wall is whole."}`
        : `${nations[attacker.owner].short} strikes at ${prov.name}. ${TERRAIN[prov.t].name} favours the defender by ${terrainDef}%.`,
    }],
    // Nobody strikes a blow until the line is drawn. Every battle that reaches
    // a screen has the player on one side of it; the ones that do not are
    // settled by the quick resolve in the turn step and never come here.
    phase: "deploy",
    over: false, winner: null,
  };
}

/* ----------------------------- INITIAL STATE ------------------------------ */
function initialState() {
  const w = buildWorld();
  const armies = [];
  let uid = 0;
  NATION_IDS.forEach((id) => {
    const cap = NATIONS[id].cap;
    // Spearmen in rags. Nobody starts with anything better.
    const units = [
      makeUnit("spearmen", id, uid++),
      makeUnit("spearmen", id, uid++),
      makeUnit("axemen", id, uid++),
    ];
    armies.push({
      id: `a${id}`, owner: id, c: cap[0], r: cap[1],
      name: `${NATIONS[id].short} Field Host`,
      units, mp: baseMove(id), maxMp: baseMove(id),
    });
    armies.push({
      id: `b${id}`, owner: id, c: cap[0], r: cap[1],
      name: `${NATIONS[id].short} Outrider Column`,
      units: [makeUnit("hunters", id, uid++)],
      mp: baseMove(id), maxMp: baseMove(id),
    });
  });
  /* Every realm opens with a Waster host three days' march away and every
     intention of being at the gate. It is a deadline rather than a decoration:
     left alone it walks in and sacks the seat. It is also the game's first
     lesson — small enough to beat with what you start with, big enough that
     losing companies to it hurts, and it is carrying a string of captives and
     a season's takings that go to whoever breaks it. */
  NATION_IDS.forEach((id) => {
    const cap = NATIONS[id].cap;
    const capK = key(cap[0], cap[1]);
    let ring = [[cap[0], cap[1]]];
    const seen = new Set([capK]);
    for (let step = 0; step < 3; step++) {
      const next = [];
      ring.forEach(([c, r]) => neighbours(c, r).forEach(([x, y]) => {
        const k2 = key(x, y);
        if (seen.has(k2)) return;
        seen.add(k2);
        if (w.provinces[k2]) next.push([x, y]);
      }));
      if (next.length) ring = next;
    }
    const at = ring.find(([c, r]) => { const q = w.provinces[key(c, r)]; return q && !q.owner; }) || ring[0];
    if (!at) return;
    armies.push({
      id: `mob${id}`, owner: "wasters", mob: true, target: capK,
      c: at[0], r: at[1], name: "The Rendfast Host",
      units: [
        makeUnit("axemen", "wasters", `mob${id}a`),
        makeUnit("axemen", "wasters", `mob${id}b`),
        makeUnit("hunters", "wasters", `mob${id}c`),
      ],
      mp: 0, maxMp: 3,
      spoils: { men: 140, scrap: 70, food: 30 },
      spoilText: "Their captives are cut loose and their carts are yours: 140 recruits, 70 scrap and 30 rations.",
    });
  });

  SEATED_MINORS.forEach((id) => {
    const m = MINORS[id];
    armies.push({
      id: `m${id}`, owner: id, c: m.at[0], r: m.at[1],
      name: `${m.short} Pit Guard`,
      units: m.garrison.map((g) => makeUnit(g[0], g[1], g[2], g[3], id, uid++)),
      mp: 0, maxMp: 0,
    });
  });

  const war = {};
  [["dogger", "lyon"], ["lyon", "alpine"], ["alpine", "karst"], ["karst", "horde"],
   ["boreal", "dogger"], ["solar", "lyon"], ["horde", "boreal"]]
    .forEach(([a, b]) => { war[warKey(a, b)] = true; });
  return {
    turn: 1, player: null, ...w, war, armies, uid,
    sel: null, battle: null, log: [], recruit: null, over: null,
    showCodex: false, district: null, intro: false, pending: [], survey: null, seat: null, tree: false, lords: false, lair: null, met: {}, notices: [], focus: null, sound: { music: true, sfx: true },
  };
}
const baseMove = (natId) => (natId === "lyon" || natId === "horde" ? 6 : 5);


/* What a rival draws up. Horse wants a wing and open ground to use it on; a
   line with nothing to shoot with wants weight in the middle; a realm that
   knows it is outnumbered keeps something back. */
function aiFormation(units, ground) {
  const cav = units.filter((u) => unitStats(u).cav).length;
  const shot = units.filter((u) => unitStats(u).ranged > 8).length;
  const openWing = SECTORS.some((s) => s !== "centre" && ground[s] === "open");
  if (cav >= 2 && openWing) return "horns";
  if (units.length >= 6) return "reserve";
  if (shot >= 2) return "wall";
  return "even";
}

/* A rival's orders, sector by sector. It presses where it is winning, holds
   where it is not, shoots if it has anything to shoot with, and throws its
   reserve at the first sector that is about to go. */
function aiOrders(b, side) {
  const foe = side === "a" ? "d" : "a";
  const post = {};
  let commit = null, worst = 0;
  SECTORS.forEach((sec) => {
    const mine = b[side].units.filter((u) => u.pos === sec).reduce((n, u) => n + u.str, 0);
    const theirs = b[foe].units.filter((u) => u.pos === sec).reduce((n, u) => n + u.str, 0);
    const ratio = mine / Math.max(1, theirs);
    if (theirs === 0) post[sec] = "hold";
    else if (ratio > 1.3) post[sec] = "press";
    else if (b[side].units.some((u) => u.pos === sec && unitStats(u).ranged > 8) && Math.random() < 0.5) post[sec] = "volley";
    else post[sec] = "hold";
    // The sector most likely to go next is where the reserve is needed.
    const need = theirs - mine;
    if (mine > 0 && need > worst) { worst = need; commit = sec; }
  });
  return { post, commit };
}

function advanceBattle(b0, P, playerStance) {
  const pSide = b0.aNat === P ? "a" : b0.dNat === P ? "d" : null;
  const b = { ...b0, a: { ...b0.a, units: b0.a.units.map((u) => ({ ...u })), routed: [...b0.a.routed] },
                      d: { ...b0.d, units: b0.d.units.map((u) => ({ ...u })), routed: [...b0.d.routed] } };
  /* The old screen gave one order for the whole army. Until the line is drawn
     on screen that order is simply given to all three sectors, so a plain
     "press" still means what it always did. */
  if (pSide && playerStance) {
    if (playerStance === "withdraw") b[pSide === "a" ? "aStance" : "dStance"] = "withdraw";
    else {
      const key = pSide === "a" ? "aPost" : "dPost";
      b[key] = { left: playerStance, centre: playerStance, right: playerStance };
    }
  }
  const ai = pSide === "a" ? "d" : pSide === "d" ? "a" : null;
  if (ai) {
    const { post, commit } = aiOrders(b, ai);
    b[ai === "a" ? "aPost" : "dPost"] = post;
    const mine = b[ai].units.reduce((n, u) => n + u.str, 0);
    const theirs = b[ai === "a" ? "d" : "a"].units.reduce((n, u) => n + u.str, 0);
    if (mine < theirs * 0.4 && b.round > 2) b[ai === "a" ? "aStance" : "dStance"] = "withdraw";
    // Reserves go in when a sector is in trouble, not before.
    if (commit && b[ai].units.some((u) => u.pos === "res")) {
      b[ai].units = b[ai].units.map((u) => (u.pos === "res" ? { ...u, pos: commit } : u));
      b.log = [...b.log, { t: "give", s: ai,
        m: `The ${ai === "a" ? "attacking" : "defending"} reserve goes in on the ${commit}.` }];
    }
  } else {
    // Nobody here is the player's: both lines are handled the same way.
    ["a", "d"].forEach((sd) => {
      const { post, commit } = aiOrders(b, sd);
      b[sd === "a" ? "aPost" : "dPost"] = post;
      if (commit && b[sd].units.some((u) => u.pos === "res")) {
        b[sd].units = b[sd].units.map((u) => (u.pos === "res" ? { ...u, pos: commit } : u));
      }
    });
  }
  return resolveRound(b);
}

/* ============================== COMPONENT ================================= */
export default function ColdCoast() {
  const [game, setGame] = useState(initialState);

  const P = game.player;

  const nat = P ? game.nations[P] : null;
  // What your realm can actually see. Both the map and the panels work from it.
  const sight = useMemo(
    () => (P ? seenSet(game.provinces, game.armies, P) : new Set()),
    [game.provinces, game.armies, P]
  );
  const income = useMemo(() => (P ? nationIncome(game, P) : null), [game, P]);
  /* The figure under every other resource in the top bar is what it will do
     next season, so the one under People has to be the same thing: heads
     gained or lost, not rations eaten. Showing the ration cost there read as
     a population in permanent decline. What they eat is in the tooltip, and
     is already priced into the Rations figure two boxes along.

     This mirrors the growth the turn loop will actually apply — same season,
     same ceiling, same feeding — rather than estimating it. */
  const realmPop = useMemo(() => {
    let total = 0, after = 0;
    const season = seasonOf(game.turn).id;
    Object.values(game.provinces).forEach((p) => {
      if (p.owner !== P) return;
      const now = p.pop || 0;
      total += now;
      let then = popGrow(now, popCeiling(key(p.c, p.r), p.t), season);
      if (p.grow && p.grow.left > 0) then += p.grow.per;
      after += then;
    });
    return { total: Math.round(total), grow: Math.round(after - total), eats: popFood(total) };
  }, [game.provinces, P, game.turn]);

  const atWar = useCallback((a, b) => (isMinor(a) || isMinor(b) ? true : !!game.war[warKey(a, b)]), [game.war]);

  const owned = useMemo(
    () => Object.values(game.provinces).filter((p) => p.owner === P),
    [game.provinces, P]
  );

  // Hooks must all run on every render. This sits above the nation-picker's
  // early return, or the hook count changes the moment a banner is taken.
  useEffect(() => {
    if (game.over) Sound.play(game.over.win ? "win" : "lose");
  }, [game.over]);

  /* The weather you can hear. The season sets the air, and whatever hex is
     under the cursor decides what lives in it — gulls on a shore, ravens over
     a ruinfield, a hammer where the workshops are. */
  const selKey = game.sel?.k || null;
  useEffect(() => {
    const here = selKey ? game.provinces[selKey] : null;
    const seat = Object.values(game.provinces).find((p) => p.capital && p.seat === game.player);
    const at = here || seat;
    Sound.scene({
      season: seasonOf(game.turn).id,
      coast: !!at && coastal(at.c, at.r),
      ruins: !!at && at.t === "r",
      forge: !!at && (at.capital || buildsOf(at).some((b) => b.id === "workshop" && !b.left)),
    });
  }, [game.turn, selKey, game.provinces, game.player]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setGame((g) => (g.sel ? { ...g, sel: null } : g)); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ----------------------------- NATION PICK ----------------------------- */
  // Declared above the early returns: every render of this component must run
  // the same hooks in the same order, whichever screen is showing.
  const clearFocus = useCallback(() => setGame((g) => (g.focus ? { ...g, focus: null } : g)), []);

  /* Autosave on the turn of the season. Keyed on game.turn rather than on the
     whole state so it writes once a turn instead of on every click, and it
     lives above the early returns because hooks must run in the same order on
     every render whichever screen is showing. */
  const [saved, setSaved] = useState(saveInfo);
  /* A save that quietly does nothing is worse than none at all — the player
     finds out when they come back and the game is gone. The position is ~1.2MB
     against a ~5MB localStorage budget, so quota is not a worry today, but a
     browser storing nothing (private windows, storage off by policy) is, and
     that has to be visible rather than assumed. */
  const [saveFailed, setSaveFailed] = useState(false);
  useEffect(() => {
    if (game.begun && game.player) {
      setSaveFailed(!writeSave(game));
      setSaved(saveInfo());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turn, game.player, game.begun]);

  const saveNow = useCallback(() => {
    setGame((g) => {
      const ok = writeSave(g);
      setSaved(saveInfo());
      setSaveFailed(!ok);
      return { ...g, log: [{ turn: g.turn, m: ok ? "Position written down." : "Could not write the position — this browser is not storing it." }, ...g.log].slice(0, 60) };
    });
  }, []);

  if (!game.begun) return (
    <TitleScreen sound={game.sound} saved={saved}
      onContinue={() => { const s = readSave(); if (s) { Sound.wake(); setGame(s); } else setSaved(null); }}
      onSound={(which) => { Sound.wake(); setGame((g) => {
        const next = { ...g.sound, [which]: !g.sound[which] };
        if (which === "music") Sound.music(next.music); else Sound.sfx(next.sfx);
        return { ...g, sound: next };
      }); }}
      onBegin={() => { Sound.wake(); Sound.play("turn"); setGame((g) => ({ ...g, begun: true })); }} />
  );
  if (!P) return <NationPicker onPick={(id) => { Sound.wake();
    setGame((g) => ({ ...g, player: id, intro: true })); }} />;

  /* --------------------------- ACTION HANDLERS --------------------------- */
  const push = (m) => setGame((g) => ({ ...g, log: [{ turn: g.turn, m }, ...g.log].slice(0, 60) }));

  /* Clicking the map only ever looks at things. Orders are the labelled
     buttons in the panel.

     What was here before: a second click on a hex you were already looking at
     silently carried out whatever order was on offer, and holding a warband
     made every later click keep that first one in hand — so clicking another
     of your own warbands did not select it, and there was no visible way to
     switch. The only escape was clicking the held warband's own hex twice.
     That is what made moving and merging feel impossible rather than merely
     fiddly. Now: your own warband under the cursor is always the one you pick
     up, and nothing moves until you press an order. */
  function selectHex(c, r) {
    const k = key(c, r);
    const prov = game.provinces[k];
    if (!prov) return;
    setGame((g) => {
      const clicked = g.armies.find((a) => a.c === c && a.r === r && a.owner === P);
      const held = g.sel?.armyId ? g.armies.find((a) => a.id === g.sel.armyId) : null;
      // Holding one warband and clicking a neighbouring one of your own is how
      // you put them together, so the first stays in hand and the order shows
      // up in the panel. Making every click switch — which is what fixed being
      // unable to change warbands at all — had quietly taken this away, since
      // you could never hold one and look at another.
      if (held && clicked && held.id !== clicked.id) {
        const war = (a, b) => (isMinor(a) || isMinor(b) ? true : !!g.war[warKey(a, b)]);
        const info = moveInfo(g, held, prov, P, war);
        if (info && info.ok && info.kind === "merge") return { ...g, sel: { armyId: held.id, k } };
      }
      // Otherwise your own warband under the cursor is the one you pick up.
      // Switching away from a warband you are merging is one press on the
      // other one's card.
      if (clicked) return { ...g, sel: { armyId: clicked.id, k } };
      return { ...g, sel: { armyId: held ? held.id : null, k } };
    });
  }

  function attemptMove(army, target) {
    const cost = TERRAIN[target.t].move;
    if (army.mp < cost) { push("That warband is out of movement for this turn."); return; }
    const enemyArmy = game.armies.find(
      (a) => a.c === target.c && a.r === target.r && a.owner !== P && atWar(P, a.owner)
    );
    const blocker = game.armies.find((a) => a.c === target.c && a.r === target.r && a.owner !== P && !atWar(P, a.owner));
    if (blocker) { push(`${game.nations[blocker.owner].short} holds ${target.name}. Declare war first.`); return; }

    if (enemyArmy) { startBattle(army, enemyArmy, target); return; }

    // Two of your own warbands on one hex fold into one.
    const friend = game.armies.find((a) => a.c === target.c && a.r === target.r && a.owner === P && a.id !== army.id);
    if (friend) {
      if (friend.units.length + army.units.length > bandCap(game.nations[P])) {
        push(`${friend.name} is already at full strength. ${bandCap(game.nations[P])} companies is the limit.`);
        return;
      }
      setGame((g) => ({
        ...g,
        armies: g.armies
          .map((a) => (a.id === friend.id
            ? { ...a, units: [...a.units, ...army.units], mp: Math.min(a.mp, army.mp - cost) }
            : a))
          .filter((a) => a.id !== army.id),
        sel: { armyId: friend.id, k: key(target.c, target.r) },
        log: [{ turn: g.turn, m: `${army.name} folds into ${friend.name}.` }, ...g.log].slice(0, 60),
      }));
      return;
    }

    setGame((g) => {
      const armies = g.armies.map((a) => (a.id === army.id
        ? { ...a, c: target.c, r: target.r, mp: a.mp - cost, route: [[a.c, a.r], [target.c, target.r]], seq: (a.seq || 0) + 1 }
        : a));
      const provinces = { ...g.provinces };
      const tk = key(target.c, target.r);
      const tp = { ...provinces[tk] };
      let logMsg = null;
      const nations = { ...g.nations };
      if (tp.owner !== P && tp.owner !== null && atWar(P, tp.owner)) {
        const prev = tp.owner;
        tp.owner = P;
        provinces[tk] = tp;
        logMsg = prev ? `${tp.name} taken from ${g.nations[prev].short}.` : `${tp.name} brought under the flag.`;
        if (P === "boreal" && prev) {
          nations[P] = { ...nations[P], res: { ...nations[P].res, scrap: nations[P].res.scrap + 25, food: nations[P].res.food + 20 } };
          logMsg += " The clans strip it bare.";
        }
      }
      return {
        ...g, armies, provinces, nations,
        sel: g.sel?.armyId === army.id ? { ...g.sel, k: key(target.c, target.r) } : g.sel,
        log: logMsg ? [{ turn: g.turn, m: logMsg }, ...g.log].slice(0, 60) : g.log,
      };
    });
  }

  function startBattle(attacker, defender, prov) {
    setGame((g) => ({
      ...g,
      battle: makeBattle(g.provinces, g.nations, g.armies, attacker.id, defender.id, key(prov.c, prov.r)),
    }));
  }

  function stepBattle(playerStance) {
    Sound.play(playerStance === "volley" ? "volley" : "clash");
    setGame((g) => (!g.battle || g.battle.over ? g : { ...g, battle: advanceBattle(g.battle, P, playerStance) }));
  }

  /* The line, while it is being drawn and while it is being fought. All four
     of these write straight into the battle, because the battle IS the state —
     there is nothing to commit and nothing to undo. */
  const bSide = (g) => (g.battle?.aNat === P ? "a" : g.battle?.dNat === P ? "d" : null);
  function deployBattle(units) {
    setGame((g) => {
      const sd = bSide(g);
      if (!g.battle || !sd || g.battle.over) return g;
      return { ...g, battle: { ...g.battle, [sd]: { ...g.battle[sd], units } } };
    });
  }
  function beginBattle() {
    setGame((g) => (g.battle ? { ...g, battle: { ...g.battle, phase: "fight" } } : g));
  }
  function postBattle(sec, id) {
    setGame((g) => {
      const sd = bSide(g);
      if (!g.battle || !sd) return g;
      const key = sd === "a" ? "aPost" : "dPost";
      return { ...g, battle: { ...g.battle, [key]: { ...g.battle[key], [sec]: id } } };
    });
  }
  function commitReserve(sec) {
    setGame((g) => {
      const sd = bSide(g);
      if (!g.battle || !sd) return g;
      const units = g.battle[sd].units.map((u) => (u.pos === "res" ? { ...u, pos: sec } : u));
      if (units.every((u, i) => u.pos === g.battle[sd].units[i].pos)) return g;
      Sound.play("march");
      return { ...g, battle: { ...g.battle, [sd]: { ...g.battle[sd], units },
        log: [...g.battle.log, { t: "give", s: sd, m: `Your reserve goes in on the ${sec}.` }] } };
    });
  }

  function autoBattle(playerStance) {
    Sound.play("clash");
    setGame((g) => {
      if (!g.battle || g.battle.over) return g;
      let b = g.battle, guard = 0;
      while (!b.over && guard++ < 20) b = advanceBattle(b, P, playerStance);
      return { ...g, battle: b };
    });
  }

  function closeBattle() {
    setGame((g) => {
      const b = g.battle;
      if (!b) return { ...g, battle: null };
      let armies = [...g.armies];
      const nations = { ...g.nations };
      const provinces = { ...g.provinces };

      /* Pursuit. A broken company is running, not fighting, and horse is what
         catches it — this is what turns a win into a settled question instead
         of the same enemy standing in front of you next season. Without a
         single rider you catch almost nobody. */
      const chase = (side) => {
        if (!b.winner || b.winner === side || b.stalemate) return 0;
        const win = b[b.winner].units;
        const str = win.reduce((n, u) => n + u.str, 0) || 1;
        const horse = win.filter((u) => unitStats(u).cav).reduce((n, u) => n + u.str, 0);
        return Math.min(0.8, 0.1 + (horse / str) * 1.5);
      };
      const caught = { a: chase("a"), d: chase("d") };
      const ridDown = { a: 0, d: 0 };
      const survivors = (side) => {
        const ran = b[side].routed.filter((u) => u.str > 0).filter((u) => {
          if (Math.random() < caught[side]) { ridDown[side] += 1; return false; }
          return true;
        });
        return [...b[side].units, ...ran]
          .map((u) => ({ ...u, morale: Math.max(20, u.maxMorale * 0.7), xp: Math.min(3, u.xp + (b.winner === side ? 1 : 0)) }));
      };

      const aUnits = survivors("a");
      const dUnits = survivors("d");
      const rode = ridDown.a + ridDown.d;

      // powder spent
      nations[b.aNat] = { ...nations[b.aNat], res: { ...nations[b.aNat].res, powder: Math.max(0, b.aPowder) } };
      nations[b.dNat] = { ...nations[b.dNat], res: { ...nations[b.dNat].res, powder: Math.max(0, b.dPowder) } };

      /* Some bands are carrying something — the opening Waster host has a
         string of captives and a cart of scrap behind it. Break the band and
         you get what it was carrying. */
      let spoilMsg = "";
      const gone = [["a", b.aArmy, b.dNat], ["d", b.dArmy, b.aNat]];
      gone.forEach(([side, id, toNat]) => {
        // Beaten, not necessarily annihilated. Companies that rout still walk
        // away, so waiting for the last man would mean the captives were almost
        // never cut loose — losing the field is what loses you what you carry.
        if (b.winner === side || b.stalemate) return;
        const dead = g.armies.find((a) => a.id === id);
        if (!dead || !dead.spoils || !nations[toNat]) return;
        const res = { ...nations[toNat].res };
        Object.entries(dead.spoils).forEach(([rk, v]) => { res[rk] = (res[rk] || 0) + v; });
        nations[toNat] = { ...nations[toNat], res };
        if (toNat === g.player) spoilMsg = ` ${dead.spoilText || spoilsText(dead.spoils)}`;
      });

      armies = armies.map((a) => {
        if (a.id === b.aArmy) return { ...a, units: aUnits, mp: 0 };
        if (a.id === b.dArmy) return { ...a, units: dUnits };
        return a;
      }).filter((a) => a.units.length > 0);

      let msgLord = "";
      // If the warband carrying a warlord is broken, the warlord may fall with it.
      [["a", b.aNat, b.aArmy, b.aCommander], ["d", b.dNat, b.dArmy, b.dCommander]]
        .forEach(([side, nat, armyId, hadLord]) => {
          if (!hadLord || b.winner === side) return;
          const survived = armies.find((a) => a.id === armyId);
          const risk = survived ? 0.18 : 1;
          if (Math.random() >= risk) return;
          nations[nat] = { ...nations[nat], lordDead: true };
          armies = armies.map((a) => (a.owner === nat ? { ...a, lord: false } : a));
          const who = WARLORDS[nat];
          if (who) msgLord = nat === g.player
            ? `You fall at ${b.provName}. Your realm has no warlord now.`
            : `${who.name} falls at ${b.provName}. ${FACTION[nat].name} is without a warlord.`;
        });

      let msg = "";
      if (b.winner === "a" && !b.stalemate) {
        const loser = armies.find((a) => a.id === b.dArmy);
        const attacker = armies.find((a) => a.id === b.aArmy);
        if (!loser && attacker) {
          const tk = key(b.hex.c, b.hex.r);
          const tp = { ...provinces[tk] };
          const prev = tp.owner;
          tp.owner = b.aNat; if (tp.capital) tp.capital = false;
          /* What was in there. This was being written onto the province when a
             lair was found and then never paid to anybody — clearing a waster
             hold gave you the ground and nothing else, which is not what the
             text on the screen said it would. */
          let took = "";
          if (tp.loot && nations[b.aNat]) {
            const res = { ...nations[b.aNat].res };
            Object.entries(tp.loot).forEach(([rk, v]) => { res[rk] = (res[rk] || 0) + v; });
            nations[b.aNat] = { ...nations[b.aNat], res };
            took = " " + spoilsText(tp.loot);
            tp.loot = null;
          }
          provinces[tk] = tp;
          armies = armies.map((a) => (a.id === b.aArmy ? { ...a, c: b.hex.c, r: b.hex.r } : a));
          msg = `${nations[b.aNat].short} storms ${b.provName}${prev ? `, wresting it from ${nations[prev].short}` : ""}.${took}`;
        } else if (loser && attacker) {
          // push the defender back to an adjacent friendly or empty hex
          const spot = neighbours(loser.c, loser.r).find(([x, y]) => {
            const q = provinces[key(x, y)];
            return q && (q.owner === loser.owner || !q.owner) && !armies.some((z) => z.c === x && z.r === y);
          });
          if (spot) armies = armies.map((a) => (a.id === b.dArmy ? { ...a, c: spot[0], r: spot[1], mp: 0 } : a));
          msg = `${nations[b.dNat].short} gives ground at ${b.provName}.`;
        }
      } else {
        msg = b.stalemate
          ? `The assault on ${b.provName} stalls at nightfall.`
          : `${nations[b.dNat].short} holds ${b.provName}.`;
      }

      const queue = g.pending || [];
      let next = null, rest = [];
      for (let i = 0; i < queue.length; i++) {
        const q = queue[i];
        const built = makeBattle(provinces, nations, armies, q.aId, q.dId, q.k);
        if (built) { next = built; rest = queue.slice(i + 1); break; }
      }

      const chased = rode
        ? ` ${rode} broken ${rode === 1 ? "company is" : "companies are"} ridden down in the pursuit.`
        : "";
      const entries = [{ turn: g.turn, m: msg + chased + spoilMsg }];
      if (msgLord) { entries.unshift({ turn: g.turn, m: msgLord }); if (b.aNat === g.player || b.dNat === g.player) Sound.play("lose"); }
      return {
        ...g, armies, nations, provinces, battle: next, sel: null, pending: rest,
        log: [...entries, ...g.log].slice(0, 60),
      };
    });
  }

  function march(armyId, k) {
    const a = game.armies.find((x) => x.id === armyId);
    const t = game.provinces[k];
    if (a && t) { Sound.play("march"); attemptMove(a, t); }
  }

  function research(id) {
    setGame((g) => {
      if (techState(g, P, id).s !== "open") return g;
      const t = TECHS[id];
      const n = g.nations[P];
      Sound.play("tick");
      return {
        ...g,
        nations: { ...g.nations, [P]: { ...n, res: { ...n.res, scrap: n.res.scrap - t.scrap },
          research: { id, left: researchTurns(P, t, n) } } },
        log: [{ turn: g.turn, m: `The scholars turn to ${t.name.toLowerCase()}.` }, ...g.log].slice(0, 60),
      };
    });
  }

  function seatUpgrade(k) {
    setGame((g) => {
      const p = g.provinces[k];
      if (!p || p.owner !== P || upgradeState(g, P, p).s !== "open") return g;
      const t = SETTLEMENT[seatTier(p) + 1];
      const n = g.nations[P];
      Sound.play("tick");
      return {
        ...g,
        nations: { ...g.nations, [P]: { ...n, res: { ...n.res, scrap: n.res.scrap - t.scrap } } },
        provinces: { ...g.provinces, [k]: { ...p, project: { kind: "tier", left: t.turns } } },
        log: [{ turn: g.turn, m: `Work begins on a ${t.name.toLowerCase()} at ${p.name} — ${t.turns} seasons.` }, ...g.log].slice(0, 60),
      };
    });
  }

  function seatWork(k, id) {
    setGame((g) => {
      const p = g.provinces[k];
      if (!p || p.owner !== P || workState(g, P, p, id).s !== "open") return g;
      const w = WORKS[id];
      const n = g.nations[P];
      Sound.play("tick");
      return {
        ...g,
        nations: { ...g.nations, [P]: { ...n, res: { ...n.res, scrap: n.res.scrap - w.scrap } } },
        provinces: { ...g.provinces, [k]: { ...p, project: { kind: "work", id, left: w.turns } } },
        log: [{ turn: g.turn, m: `Work begins on a ${w.name.toLowerCase()} at ${p.name}.` }, ...g.log].slice(0, 60),
      };
    });
  }

  function setEdict(id) {
    setGame((g) => {
      const n = g.nations[P];
      if ((n.edict || "none") === id) return g;
      if (n.edictTurn === g.turn || n.res.scrap < 25) return g;
      Sound.play("claim");
      return {
        ...g,
        nations: { ...g.nations, [P]: { ...n, edict: id, edictTurn: g.turn, res: { ...n.res, scrap: n.res.scrap - 25 } } },
        log: [{ turn: g.turn, m: `Edict proclaimed: ${EDICTS[id].name.toLowerCase()}.` }, ...g.log].slice(0, 60),
      };
    });
  }

  function repair(k) {
    setGame((g) => {
      const pr = g.provinces[k];
      const hurt = firstDamaged(pr);
      if (!pr || pr.owner !== P || !hurt) return g;
      const cost = Math.ceil((buildStep(hurt)?.scrap || 40) / 2);
      const n = g.nations[P];
      if (n.res.scrap < cost) return g;
      Sound.play("tick");
      const fixed = buildsOf(pr).map((b) => (b === hurt ? { ...b, damaged: false } : b));
      return {
        ...g,
        nations: { ...g.nations, [P]: { ...n, res: { ...n.res, scrap: n.res.scrap - cost } } },
        provinces: { ...g.provinces, [k]: { ...pr, builds: fixed } },
        log: [{ turn: g.turn, m: `${buildName(hurt)} at ${pr.name} put back in order.` }, ...g.log].slice(0, 60),
      };
    });
  }

  function setCommander(armyId) {
    setGame((g) => {
      const n = g.nations[P];
      if (!lordAlive(n)) return g;
      if (n.lordTransit) return g;                       // already on the road
      const target = armyId ? g.armies.find((a) => a.id === armyId) : null;
      if (armyId && !target) return g;
      // A warlord may only join or leave a warband on your own ground.
      const where = target && g.provinces[key(target.c, target.r)];
      if (target && (!where || where.owner !== P)) return g;
      const cur = g.armies.find((a) => a.owner === P && a.lord);
      if (cur) {
        const at = g.provinces[key(cur.c, cur.r)];
        if (!at || at.owner !== P) return g;             // cannot leave in the field
      }
      if (cur && cur.id === armyId) return g;
      Sound.play("claim");
      return {
        ...g,
        // They leave at once and arrive next winter; there is no shuttling
        // them in and out of a warband on the same turn.
        armies: g.armies.map((a) => (a.owner !== P ? a : { ...a, lord: false })),
        nations: { ...g.nations, [P]: { ...n, lordTransit: { to: armyId || null } } },
        log: [{ turn: g.turn, m: armyId
          ? `You set out to join ${target.name}, and will reach them next season.`
          : "You start back for your seat." }, ...g.log].slice(0, 60),
      };
    });
  }

  function setCraft(type, d) {
    setGame((g) => {
      const n = g.nations[P];
      const { hands, assigned } = craftPlan(n, g.provinces, P);
      const crafts = { ...(n.crafts || {}) };
      const cur = Math.max(0, crafts[type] || 0);
      // You cannot put on a craftsman you do not have. Taking them all off a
      // line is allowed — idle hands are a choice the panel shows you.
      const room = Math.max(0, hands - assigned);
      const next = Math.max(0, cur + Math.min(d, room));
      if (next === cur) return g;
      crafts[type] = next;
      Sound.play("tick");
      return { ...g, nations: { ...g.nations, [P]: { ...n, crafts } } };
    });
  }

  function reinforce(armyId, unitId) {
    setGame((g) => {
      const army = g.armies.find((a) => a.id === armyId);
      if (!army || army.owner !== P) return g;
      const prov = g.provinces[key(army.c, army.r)];
      if (!prov || prov.owner !== P) return g;          // your own ground only
      const u = army.units.find((x) => x.id === unitId);
      if (!u) return g;
      const cost = reinforceCost(u, P, musteringGround(prov));
      if (!cost) return g;
      const n = g.nations[P];
      if (n.res.men < cost.men || n.res.scrap < cost.scrap) return g;
      Sound.play("tick");
      return {
        ...g,
        nations: { ...g.nations, [P]: { ...n, res: { ...n.res,
          men: n.res.men - cost.men, scrap: n.res.scrap - cost.scrap } } },
        armies: g.armies.map((a) => (a.id !== armyId ? a : {
          ...a,
          units: a.units.map((x) => (x.id !== unitId ? x
            : { ...x, str: x.max, morale: Math.min(x.maxMorale, Math.max(x.morale, x.maxMorale * 0.6)) })),
        })),
        log: [{ turn: g.turn, m: `${unitName(u)} brought back up to strength at ${prov.name}.` }, ...g.log].slice(0, 60),
      };
    });
  }

  function mergeInto(fromId, toId) {
    setGame((g) => {
      const from = g.armies.find((a) => a.id === fromId);
      const to = g.armies.find((a) => a.id === toId);
      if (!from || !to || from.id === to.id) return g;
      if (from.owner !== P || to.owner !== P) return g;
      if (from.c !== to.c || from.r !== to.r) return g;
      if (from.units.length + to.units.length > bandCap(g.nations[P])) return g;
      Sound.play("march");
      return {
        ...g,
        armies: g.armies
          .map((a) => (a.id === toId
            ? { ...a, units: [...a.units, ...from.units], mp: Math.min(a.mp, from.mp) } : a))
          .filter((a) => a.id !== fromId),
        sel: { armyId: toId, k: key(to.c, to.r) },
        log: [{ turn: g.turn, m: `${from.name} folds into ${to.name}.` }, ...g.log].slice(0, 60),
      };
    });
  }

  function takeCommand(id) {
    setGame((g) => {
      const a = g.armies.find((x) => x.id === id);
      return a && a.owner === P ? { ...g, sel: { armyId: id, k: key(a.c, a.r) } } : g;
    });
  }

  function deselect() { setGame((g) => ({ ...g, sel: null })); }

  function investigate(k) {
    setGame((g) => {
      const pr = g.provinces[k];
      if (!pr || pr.owner || pr.explored) return g;
      const army = g.armies.find((a) => a.owner === P && a.c === pr.c && a.r === pr.r);
      if (!army || army.mp < 1) return g;
      Sound.play("survey");
      // An occupied ruin is not an encounter you read your way out of.
      if (pr.lair) {
        const kind = LAIR_KINDS[pr.lair];
        // The garrison is bound to its ruin: the roaming code must never walk it out.
        let armies = [...g.armies, {
          id: `lair${k}`, owner: kind.faction, c: pr.c, r: pr.r, lairBound: true,
          name: `${MINORS[kind.faction].short} of ${pr.name}`,
          units: kind.garrison.map((u, i) => makeUnit(u, kind.faction, `${k}-${i}`)),
          mp: 0, maxMp: 0,
        }];
        // Your scouts are driven back out of the building rather than left
        // standing on the same ground as the people who live in it.
        const back = neighbours(pr.c, pr.r).find(([x, y]) => {
          const q = g.provinces[key(x, y)];
          return q && (!q.owner || q.owner === P)
            && !armies.some((z) => z.c === x && z.r === y && z.owner !== P);
        });
        if (back) {
          armies = armies.map((a) => (a.id === army.id
            ? { ...a, c: back[0], r: back[1], mp: 0,
                route: [[pr.c, pr.r], [back[0], back[1]]], seq: (a.seq || 0) + 1 }
            : a));
        }
        return {
          ...g, armies,
          sel: back ? { armyId: army.id, k: key(back[0], back[1]) } : g.sel,
          provinces: { ...g.provinces, [k]: {
            ...pr, explored: true, owner: kind.faction, lair: null, loot: kind.loot } },
          lair: { k, kind: pr.lair },
          log: [{ turn: g.turn, m: `${pr.name} is occupied — ${kind.title.toLowerCase()}.` }, ...g.log].slice(0, 60),
        };
      }
      return { ...g, survey: { k, encId: pickEncounter(pr.t).id, armyId: army.id, result: null } };
    });
  }

  function resolveSurvey(idx) {
    setGame((g) => {
      const sv = g.survey;
      if (!sv || sv.result) return g;
      const enc = ENCOUNTERS.find((e) => e.id === sv.encId);
      const out = rollOutcome(enc.choices[idx]);
      Sound.play(out.hurt ? "hurt" : out.feature ? "found" : "tick");
      const pr = g.provinces[sv.k];
      const provinces = { ...g.provinces, [sv.k]: { ...pr, explored: true, feature: out.feature || pr.feature } };
      const nations = { ...g.nations };
      const res = { ...nations[P].res };
      Object.entries(out.res || {}).forEach(([rk, v]) => { res[rk] = Math.max(0, res[rk] + v); });
      nations[P] = { ...nations[P], res };
      const armies = g.armies.map((a) => {
        if (a.id !== sv.armyId) return a;
        const units = out.hurt
          ? a.units.map((u) => ({ ...u, str: Math.max(1, Math.round(u.str * (1 - out.hurt))) }))
          : a.units;
        return { ...a, units, mp: Math.max(0, a.mp - 1) };
      });
      return {
        ...g, provinces, nations, armies,
        survey: { ...sv, result: out },
        log: [{ turn: g.turn, m: `${pr.name} surveyed: ${enc.title.toLowerCase()}.` }, ...g.log].slice(0, 60),
      };
    });
  }

  /* Sitting down in front of a walled place. Nothing about it is fast: it pays
     nothing while you are there, its people go hungry, its garrison thins, and
     every third season the wall gives somewhere. */
  function invest(k) {
    setGame((g) => {
      const pr = g.provinces[k];
      if (!pr || !pr.owner || pr.owner === P || !isWalled(pr) || pr.siege) return g;
      const near = g.armies.some((a) => a.owner === P && a.units.length
        && hexDist(a.c, a.r, pr.c, pr.r) === 1);
      if (!near) return g;
      Sound.play("horn");
      return {
        ...g,
        provinces: { ...g.provinces, [k]: { ...pr, siege: { by: P, seasons: 0 } } },
        log: [{ turn: g.turn, m: `${pr.name} is invested. Nothing goes in and nothing comes out.` },
              ...g.log].slice(0, 60),
      };
    });
  }
  function liftSiege(k) {
    setGame((g) => {
      const pr = g.provinces[k];
      if (!pr?.siege || pr.siege.by !== P) return g;
      return {
        ...g,
        provinces: { ...g.provinces, [k]: { ...pr, siege: null } },
        log: [{ turn: g.turn, m: `The siege of ${pr.name} is lifted.` }, ...g.log].slice(0, 60),
      };
    });
  }

  function claim(k) {
    setGame((g) => {
      const pr = g.provinces[k];
      if (!pr || pr.owner || !pr.explored) return g;
      const army = g.armies.find((a) => a.owner === P && a.c === pr.c && a.r === pr.r);
      const cost = claimCost(g.provinces, P, pr.c, pr.r);
      if (!army || !canClaim(g.nations[P], cost)) return g;
      Sound.play("claim");
      const n = g.nations[P];
      return {
        ...g,
        nations: { ...g.nations, [P]: { ...n, res: { ...n.res,
          food: n.res.food - cost.food, men: n.res.men - cost.men } } },
        provinces: { ...g.provinces, [k]: { ...pr, owner: P } },
        log: [{ turn: g.turn, m: `${pr.name} comes under your banner.` }, ...g.log].slice(0, 60),
      };
    });
  }

  /* Rations into a ward, and people over the following seasons. Deliberately
     slow: a company raised today is worth more than thirty people next spring,
     and the whole point is that the long bet has to be made early. */
  /* A warband keeps whatever you call it. Names are yours — the generated
     ones exist only so a new company has something on it. */
  function renameArmy(id, raw) {
    const name = String(raw || "").replace(/\s+/g, " ").trim().slice(0, 40);
    if (!name) return;
    setGame((g) => ({
      ...g,
      armies: g.armies.map((a) => (a.id === id && a.owner === P ? { ...a, name } : a)),
    }));
  }

  /* Peel one company off into a warband of its own, standing where it already
     stands. Without this a warband at the eight-company limit was a dead end:
     you could not add to it and you could not take anything out of it except
     by standing the company down for good. The new band keeps the movement
     the old one had left, so splitting is not a way to buy a free march. */
  function splitUnit(armyId, unitId) {
    setGame((g) => {
      const src = g.armies.find((a) => a.id === armyId);
      if (!src || src.owner !== P || src.units.length < 2) return g;
      const unit = src.units.find((u) => u.id === unitId);
      if (!unit) return g;
      const n = g.armies.filter((a) => a.owner === P).length + 1;
      Sound.play("tick");
      return {
        ...g,
        uid: g.uid + 1,
        armies: [
          ...g.armies.map((a) => (a.id === armyId
            ? { ...a, units: a.units.filter((u) => u.id !== unitId) } : a)),
          { id: `s${g.uid}x`, owner: P, c: src.c, r: src.r,
            name: `${NATIONS[P].short} Warband ${n}`,
            units: [unit], mp: src.mp, maxMp: src.maxMp ?? baseMove(P) },
        ],
        sel: { armyId: `s${g.uid}x`, k: key(src.c, src.r) },
        log: [{ turn: g.turn, m: `${unitName(unit)} march out of ${src.name} on their own.` }, ...g.log].slice(0, 60),
      };
    });
  }

  function investPop(k) {
    setGame((g) => {
      const p = g.provinces[k];
      if (!p || p.owner !== P || p.grow) return g;
      const n = g.nations[P];
      if (n.res.food < POP_INVEST.food) return g;
      Sound.play("tick");
      return {
        ...g,
        nations: { ...g.nations, [P]: { ...n, res: { ...n.res, food: n.res.food - POP_INVEST.food } } },
        provinces: { ...g.provinces, [k]: { ...p, grow: { left: POP_INVEST.seasons, per: POP_INVEST.per } } },
        log: [{ turn: g.turn, m: `${POP_INVEST.food} rations go to ${p.name} — ${POP_INVEST.seasons} seasons of feeding.` }, ...g.log].slice(0, 60),
      };
    });
  }

  function build(k, bid) {
    setGame((g) => {
      const p = g.provinces[k];
      const b = BUILDINGS[bid];
      if (!p || p.owner !== P || freeSlots(p) <= 0) return g;
      if (buildsOf(p).some((x) => x.id === bid)) return g;      // one of each kind
      const price = buildCost(b.scrap, buildsOf(p).length);
      if (g.nations[P].res.scrap < price) return g;
      const nations = { ...g.nations };
      nations[P] = { ...nations[P], res: { ...nations[P].res, scrap: nations[P].res.scrap - price } };
      Sound.play("tick");
      const provinces = { ...g.provinces, [k]: { ...p, builds: [...buildsOf(p), { id: bid, left: b.turns }] } };
      return { ...g, nations, provinces, log: [{ turn: g.turn, m: `Work begins on a ${b.name.toLowerCase()} at ${p.name} — ${b.turns} seasons.` }, ...g.log].slice(0, 60) };
    });
  }

  /* Taking a slot up a level. The work sits on the existing building rather
     than replacing it: it keeps paying out at its current level while the new
     one is going up, which is both kinder and more truthful — a farm does not
     stop growing food because you are digging a sluice. `becomes` is what it
     turns into when the last season is served. */
  function improve(k, idx, step) {
    setGame((g) => {
      const p = g.provinces[k];
      if (!p || p.owner !== P) return g;
      const b = buildsOf(p)[idx];
      if (!b || b.left || b.damaged) return g;
      const opts = buildNext(b);
      const pick = opts.find((o) => o.lvl === step.lvl && (o.id || null) === (step.fork || null));
      if (!pick) return g;
      if (g.nations[P].res.scrap < pick.scrap) return g;
      const nations = { ...g.nations };
      nations[P] = { ...nations[P], res: { ...nations[P].res, scrap: nations[P].res.scrap - pick.scrap } };
      const builds = buildsOf(p).map((x, i) => (i === idx
        ? { ...x, left: pick.turns, becomes: { lvl: pick.lvl, fork: pick.lvl === 3 ? pick.id : undefined } }
        : x));
      Sound.play("tick");
      return {
        ...g, nations,
        provinces: { ...g.provinces, [k]: { ...p, builds } },
        log: [{ turn: g.turn, m: `${p.name}: work begins on the ${pick.name.toLowerCase()} — ${pick.turns} seasons.` },
              ...g.log].slice(0, 60),
      };
    });
  }

  function recruitUnit(k, type, wg, ag) {
    setGame((g) => {
      const p = g.provinces[k];
      const n0 = g.nations[P];
      const cost = unitCost(type, P, n0, wg, ag);
      const res = n0.res;
      const need = UNITS[type].size;
      const have = (n0.arms || {})[type] || 0;
      // Half the company is drawn off this province for good. The other half
      // is reckoned to be drifters and people who were passing through.
      const popCost = popCostOf(need);
      if (res.scrap < cost.scrap || res.men < cost.men || (res.metal || 0) < cost.metal) return g;
      if (have < need) return g;                       // no arms on the rack
      if ((p.pop || 0) < popCost) return g;            // nobody left here to take
      const nations = { ...g.nations };
      nations[P] = { ...n0,
        res: { ...res, scrap: res.scrap - cost.scrap, metal: (res.metal || 0) - cost.metal, men: res.men - cost.men },
        arms: { ...(n0.arms || {}), [type]: have - need } };
      const provinces = { ...g.provinces, [k]: { ...p, pop: Math.max(0, (p.pop || 0) - popCost) } };
      let uid = g.uid;
      const u = makeUnit(type, P, uid++, wg, ag);
      let armies = [...g.armies];
      const here = armies.find((a) => a.c === p.c && a.r === p.r && a.owner === P);
      if (here && here.units.length < bandCap(n0)) {
        armies = armies.map((a) => (a.id === here.id ? { ...a, units: [...a.units, u] } : a));
      } else {
        armies.push({
          id: `a${uid}x`, owner: P, c: p.c, r: p.r,
          name: `${NATIONS[P].short} Warband ${armies.filter((a) => a.owner === P).length + 1}`,
          units: [u], mp: 0, maxMp: baseMove(P),
        });
      }
      return { ...g, nations, armies, provinces, uid, recruit: null, log: [{ turn: g.turn, m: `${UNITS[type].name} mustered at ${p.name} — ${popCost} of its people go with them.` }, ...g.log].slice(0, 60) };
    });
  }

  function toggleWar(other) {
    setGame((g) => {
      const wk = warKey(P, other);
      const war = { ...g.war };
      let msg;
      if (war[wk]) {
        // suing for peace costs scrap; AI accepts if it is losing or neutral
        const mine = Object.values(g.provinces).filter((p) => p.owner === P).length;
        const theirs = Object.values(g.provinces).filter((p) => p.owner === other).length;
        if (g.nations[P].res.scrap < 40) return { ...g, log: [{ turn: g.turn, m: "No scrap left for tribute. Peace refused." }, ...g.log] };
        const accept = theirs <= mine * 1.15 || Math.random() < 0.4;
        const nations = { ...g.nations };
        nations[P] = { ...nations[P], res: { ...nations[P].res, scrap: nations[P].res.scrap - 40 } };
        if (accept) { delete war[wk]; msg = `Peace agreed with ${g.nations[other].short}.`; }
        else msg = `${g.nations[other].short} pockets the tribute and fights on.`;
        return { ...g, war, nations, log: [{ turn: g.turn, m: msg }, ...g.log].slice(0, 60) };
      }
      war[wk] = true;
      msg = `War declared on ${g.nations[other].short}.`;
      return { ...g, war, log: [{ turn: g.turn, m: msg }, ...g.log].slice(0, 60) };
    });
  }

  /* ------------------------------- END TURN ------------------------------ */
  function endTurn() {
    Sound.play("turn");
    setGame((g) => {
      let { provinces, nations, armies, war } = { ...g };
      provinces = { ...provinces };
      nations = { ...nations };
      armies = armies.map((a) => ({ ...a, units: a.units.map((u) => ({ ...u })) }));
      // A single ownership tally for the whole winter, updated as ground
      // changes hands. Every realm used to re-count the entire map, repeatedly.
      const heldNow = {};
      Object.values(provinces).forEach((q) => {
        if (q.owner) heldNow[q.owner] = (heldNow[q.owner] || 0) + 1;
      });
      const changeOwner = (k, to) => {
        const was = provinces[k].owner;
        if (was) heldNow[was] = (heldNow[was] || 1) - 1;
        if (to) heldNow[to] = (heldNow[to] || 0) + 1;
      };

      const newLog = [];
      const notices = [];
      const notice = (kind, text, k) => notices.push({ id: `n${g.turn}${notices.length}`, kind, text, k });
      const pending = [];

      // --- AI turns ---
      NATION_IDS.forEach((id) => {
        if (id === g.player) return;
        const style = styleOf(id);
        const res = nations[id].res;
        const myProv = Object.values(provinces).filter((p) => p.owner === id);
        if (!myProv.length) return;

        // build
        if (res.scrap > 90 / style.build) {
          // Prefer somewhere with room. The AI pays the same escalating price
          // for a second worksite on the same ground that the player does.
          /* Rivals improve what they have as well as raising new things, and
             roughly as often — a realm that only ever built level ones would be
             handing the player the game by the fiftieth season. Improving is
             tried first when there is something finished and unhurt to improve,
             which is also the cheaper move. */
          let spent = false;
          const grow = [];
          myProv.forEach((p) => buildsOf(p).forEach((b, i) => {
            if (b.left || b.damaged) return;
            buildNext(b).forEach((o) => grow.push({ p, i, o }));
          }));
          if (grow.length && Math.random() < 0.55) {
            const g2 = grow[Math.floor(Math.random() * grow.length)];
            if (res.scrap >= g2.o.scrap) {
              nations[id] = { ...nations[id], res: { ...res, scrap: res.scrap - g2.o.scrap } };
              const k2 = key(g2.p.c, g2.p.r);
              provinces[k2] = {
                ...g2.p,
                builds: buildsOf(g2.p).map((x, i) => (i === g2.i
                  ? { ...x, left: g2.o.turns, becomes: { lvl: g2.o.lvl, fork: g2.o.lvl === 3 ? g2.o.id : undefined } }
                  : x)),
              };
              spent = true;
            }
          }
          // A plain `return` here would end this realm's whole turn, not just
          // its building — everything below is its recruiting and its marching.
          const target = spent ? null : myProv.find((p) => freeSlots(p) > 0);
          if (target) {
            const opts = Object.entries(BUILDINGS)
              .filter(([bid]) => unlocked(nations[id], bid))
              .filter(([bid]) => !buildsOf(target).some((x) => x.id === bid))
              .filter(([, b]) => !b.coast || coastal(target.c, target.r))
              .filter(([, b]) => !b.on || b.on.includes(target.t));
            const [bid, b] = opts[Math.floor(Math.random() * opts.length)] || [];
            const price = b ? buildCost(b.scrap, buildsOf(target).length) : 0;
            if (bid && res.scrap >= price) {
              nations[id] = { ...nations[id], res: { ...res, scrap: res.scrap - price } };
              provinces[key(target.c, target.r)] = {
                ...target, builds: [...buildsOf(target), { id: bid, left: b.turns }] };
            }
          }
        }

        // recruit, with the best kit this realm knows how to make
        const r2 = nations[id].res;
        const nat2 = nations[id];
        // Whatever it has learned to raise, weighted a little by temperament.
        const open2 = unitsFor(nat2);
        const want = id === "horde" ? ["riders", "technicals"] : id === "boreal" ? ["axemen", "riders"]
          : id === "alpine" ? ["ironclad", "vaultguard"] : id === "solar" ? ["riflemen", "musketeers"] : [];
        // Ranked worst to best; the AI takes from the end. Baggage sits at the
        // front deliberately — a cart is not something a realm recruits when
        // it is deciding what to put in the field.
        const order = ["baggage", "spearmen", "hunters", "axemen", "bowmen", "pikemen", "riders", "ironclad",
                       "line", "musketeers", "technicals", "guncrew", "riflemen", "vaultguard"];
        const pool = open2.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
        const liked = pool.filter((u) => want.includes(u));
        const type = (liked.length && Math.random() < 0.6 ? liked : pool).pop() || "spearmen";
        const bw = gradesFor(nat2, WEAPON_GRADES).slice(-1)[0].id;
        const ba = gradesFor(nat2, ARMOUR_GRADES).slice(-1)[0].id;
        const cost = unitCost(type, id, nat2, bw, ba);
        const rack = (nat2.arms || {})[type] || 0;
        // The AI musters from its seat, and pays the same in people the player
        // does. Letting it raise companies out of nowhere would quietly hand it
        // every province the player has to spend to fill.
        const seatP = myProv.find((p) => p.capital);
        const seatK = seatP ? key(seatP.c, seatP.r) : null;
        const seatPop = seatK ? (provinces[seatK].pop || 0) : 0;
        const popCost = popCostOf(UNITS[type].size);
        if (rack >= UNITS[type].size && (r2.metal || 0) >= cost.metal && seatK && seatPop >= popCost
            && r2.scrap > cost.scrap * (1.6 / style.host) && r2.men > cost.men * (1.4 / style.host)) {
          const host = armies.find((a) => a.owner === id && a.units.length < bandCap(nations[id]));
          const u = makeUnit(type, id, Math.random().toString(36).slice(2), bw, ba);
          if (host) host.units.push(u);
          else {
            const cap = myProv.find((p) => p.capital) || myProv[0];
            armies.push({
              id: `ai${id}${Math.random().toString(36).slice(2, 6)}`, owner: id,
              c: cap.c, r: cap.r, name: `${NATIONS[id].short} Host`,
              units: [u], mp: 0, maxMp: baseMove(id),
            });
          }
          provinces[seatK] = { ...provinces[seatK], pop: Math.max(0, seatPop - popCost) };
          nations[id] = { ...nations[id],
            res: { ...r2, scrap: r2.scrap - cost.scrap, metal: (r2.metal || 0) - cost.metal, men: r2.men - cost.men },
            arms: { ...(nat2.arms || {}), [type]: rack - UNITS[type].size } };
        }

        // research
        const nr = nations[id];
        if (!nr.research && Math.random() < 0.55 * style.research) {
          const open = TECH_IDS.filter((t) =>
            techState({ provinces, nations, armies }, id, t).s === "open");
          if (open.length) {
            const pick = open[Math.floor(Math.random() * open.length)];
            const t = TECHS[pick];
            nations[id] = { ...nr, res: { ...nr.res, scrap: nr.res.scrap - t.scrap },
              research: { id: pick, left: researchTurns(id, t, nr) } };
          }
        }

        // Keep the craftsmen on whatever this realm can actually raise, and
        // keep all of them working — idle hands would quietly hand the player
        // an advantage the AI never chose to give.
        {
          const nc = nations[id];
          const openU = unitsFor(nc);
          const plan = craftPlan(nc, provinces, id);
          const cur = Object.keys(nc.crafts || {}).filter((x) => (nc.crafts[x] || 0) > 0);
          const stale = cur.some((x) => !openU.includes(x));
          if (openU.length && (stale || plan.assigned !== plan.hands)) {
            const lines = openU.slice(-3);
            const crafts = {};
            lines.forEach((u) => { crafts[u] = 0; });
            for (let i = 0; i < plan.hands; i++) crafts[lines[i % lines.length]] += 1;
            nations[id] = { ...nc, crafts };
          }
        }

        // develop the seat, so rivals grow their capitals too
        const capk = Object.keys(provinces).find((k) =>
          provinces[k].owner === id && provinces[k].capital && provinces[k].seat === id);
        if (capk && !provinces[capk].project) {
          const st = { provinces, nations, armies };
          const cp = provinces[capk];
          const upg = upgradeState(st, id, cp);
          const openWorks = WORK_IDS.filter((w) => workState(st, id, cp, w).s === "open");
          const nn = nations[id];
          if (upg.s === "open" && (seatUsed(cp) >= seatSlots(cp) - 1 || Math.random() < 0.35 * style.build)) {
            const t = SETTLEMENT[seatTier(cp) + 1];
            nations[id] = { ...nn, res: { ...nn.res, scrap: nn.res.scrap - t.scrap } };
            provinces[capk] = { ...cp, project: { kind: "tier", left: t.turns } };
          } else if (openWorks.length) {
            const pick = openWorks[Math.floor(Math.random() * openWorks.length)];
            const w = WORKS[pick];
            nations[id] = { ...nn, res: { ...nn.res, scrap: nn.res.scrap - w.scrap } };
            provinces[capk] = { ...cp, project: { kind: "work", id: pick, left: w.turns } };
          }
        }

        // move & fight. A force bound to a place — a lair, or a garrison with a
        // besieging army camped outside the gate — stays where it is.
        armies.filter((a) => a.owner === id && !a.lairBound
          && !provinces[key(a.c, a.r)]?.siege).forEach((a) => {
          a.route = [[a.c, a.r]];
          let mp = a.mp;
          let guard = 0;
          while (mp > 0 && guard++ < 4) {
            const opts = neighbours(a.c, a.r)
              .map(([x, y]) => provinces[key(x, y)])
              .filter(Boolean)
              .filter((p) => TERRAIN[p.t].move <= mp);
            if (!opts.length) break;
            const score = (p) => {
              let s = 0;
              const other = armies.find((z) => z.c === p.c && z.r === p.r && z.owner !== id);
              // With most of the continent unclaimed, expansion should out-rank
              // conquest — otherwise everyone dogpiles their nearest neighbour
              // and the empty map goes to waste.
              if (p.owner === null) {
                s += 16 * style.expand;
                // wandering off to settle islands of territory is discouraged
                s -= Math.max(0, ringsToBorder(provinces, id, p.c, p.r, 5) - 1) * 7;
              }
              else if (p.owner !== id && (isMinor(p.owner) || war[warKey(id, p.owner)])) s += 10 * style.war;
              else if (p.owner !== id) s -= 50;
              else s += 1;
              if (other) {
                if (!isMinor(other.owner) && !war[warKey(id, other.owner)]) s -= 100;
                else {
                  const mineStr = a.units.reduce((n, u) => n + u.str, 0);
                  const theirStr = other.units.reduce((n, u) => n + u.str, 0);
                  s += mineStr > theirStr * 1.25 ? 12 : -40;
                }
              }
              s += TERRAIN[p.t].food + TERRAIN[p.t].scrap;
              return s;
            };
            opts.sort((x, y) => score(y) - score(x));
            const best = opts[0];
            if (score(best) < 2) break;
            const defArmy = armies.find((z) => z.c === best.c && z.r === best.r && z.owner !== id);
            if (defArmy) {
              if (defArmy.owner === g.player) {
                // The player gets to fight this one himself, after the turn resolves.
                pending.push({ aId: a.id, dId: defArmy.id, k: key(best.c, best.r) });
              } else {
                // AI vs AI: quick resolve
                const mineStr = a.units.reduce((n, u) => n + u.str, 0);
                const theirStr = defArmy.units.reduce((n, u) => n + u.str, 0) * (1 + TERRAIN[best.t].def / 100);
                const win = mineStr > theirStr;
                const hit = (arr, f) => arr.forEach((u) => { u.str = Math.max(0, Math.round(u.str * f)); });
                hit(a.units, win ? 0.78 : 0.5);
                hit(defArmy.units, win ? 0.45 : 0.8);
                a.units = a.units.filter((u) => u.str > 5);
                defArmy.units = defArmy.units.filter((u) => u.str > 5);
                if (win && !defArmy.units.length) {
                  provinces[key(best.c, best.r)] = { ...best, owner: id };
                  a.c = best.c; a.r = best.r;
                }
              }
              mp = 0;
              break;
            }
            mp -= TERRAIN[best.t].move;
            a.c = best.c; a.r = best.r;
            a.route.push([best.c, best.r]);
            if (best.owner === null) {
              // Wild ground costs the AI the same time the player spends
              // surveying it, and the same rations and recruits to settle.
              const nn = nations[id];
              const cc = claimCost(provinces, id, best.c, best.r, heldNow[id] || 0);
              if (canClaim(nn, cc)) {
                mp -= 1;
                nations[id] = { ...nn, res: { ...nn.res,
                  food: nn.res.food - cc.food, men: nn.res.men - cc.men } };
                changeOwner(key(best.c, best.r), id);
                provinces[key(best.c, best.r)] = { ...best, owner: id, explored: true };
              }
            } else if (best.owner !== id && war[warKey(id, best.owner)]) {
              changeOwner(key(best.c, best.r), id);
              provinces[key(best.c, best.r)] = { ...best, owner: id, explored: true };
            }
          }
          a.mp = 0;
          if (a.route.length > 1) a.seq = (a.seq || 0) + 1; else a.route = null;
        });

        // AI diplomacy: occasionally declare war on a weaker neighbour
        if (Math.random() < 0.12 * style.war) {
          const neigh = new Set();
          Object.values(provinces).filter((p) => p.owner === id).forEach((p) =>
            neighbours(p.c, p.r).forEach(([x, y]) => {
              const q = provinces[key(x, y)];
              if (q && q.owner && q.owner !== id) neigh.add(q.owner);
            })
          );
          const cands = [...neigh].filter((n) => !war[warKey(id, n)]);
          if (cands.length) {
            const t = cands[Math.floor(Math.random() * cands.length)];
            const mine = heldNow[id] || 0;
            const theirs = heldNow[t] || 0;
            if (mine > theirs * (1.35 - 0.15 * style.war)) {
              war[warKey(id, t)] = true;
              if (t === g.player) newLog.push({ turn: g.turn, m: `${nations[id].short} declares war on you.` });
            }
          }
        }
      });

      armies = armies.filter((a) => a.units.length > 0);

      /* --- the host that came for the seat ---
         It does not wander and it does not raid on the way. It walks at the
         capital it was made for, and when it arrives it either fights whoever
         is standing there or sacks the place and falls back to do it again.
         It never takes the seat: a mob of three companies cannot hold a city,
         and a tutorial that ends the game is not a tutorial. */
      armies.filter((a) => a.mob && a.units.length).forEach((a) => {
        const tgt = provinces[a.target];
        if (!tgt) return;
        a.route = [[a.c, a.r]];
        let mp = a.maxMp || 3, guard = 0;
        while (mp > 0 && guard++ < 4 && hexDist(a.c, a.r, tgt.c, tgt.r) > 0) {
          const step = neighbours(a.c, a.r).map(([x, y]) => provinces[key(x, y)]).filter(Boolean)
            .filter((q) => TERRAIN[q.t].move <= mp)
            .sort((x, y) => hexDist(x.c, x.r, tgt.c, tgt.r) - hexDist(y.c, y.r, tgt.c, tgt.r))[0];
          if (!step || hexDist(step.c, step.r, tgt.c, tgt.r) >= hexDist(a.c, a.r, tgt.c, tgt.r)) break;
          const held = armies.find((z) => z.c === step.c && z.r === step.r && z.owner !== a.owner && z.units.length);
          if (held) {
            // Somebody is in the way. That is the fight, wherever it happens.
            if (held.owner === g.player) pending.push({ aId: a.id, dId: held.id, k: key(step.c, step.r) });
            mp = 0;
            break;
          }
          mp -= TERRAIN[step.t].move;
          a.c = step.c; a.r = step.r;
          a.route.push([step.c, step.r]);
        }
        a.seq = (a.seq || 0) + 1;
        if (a.route.length < 2) a.route = null;
        if (hexDist(a.c, a.r, tgt.c, tgt.r) !== 0) return;

        const guardArmy = armies.find((z) => z.c === a.c && z.r === a.r && z.owner === tgt.owner && z.units.length);
        if (guardArmy) {
          if (tgt.owner === g.player) pending.push({ aId: a.id, dId: guardArmy.id, k: a.target });
          return;
        }
        // Nobody home. They take what a seat has and go back out to the edge.
        const vn = nations[tgt.owner];
        if (vn) {
          const men = Math.min(90, Math.max(0, Math.floor((tgt.pop || 0) * 0.05)));
          const res4 = { ...vn.res };
          res4.food = Math.max(0, res4.food - 45);
          res4.scrap = Math.max(0, res4.scrap - 40);
          nations[tgt.owner] = { ...vn, res: res4 };
          provinces[a.target] = { ...tgt, pop: Math.max(0, (tgt.pop || 0) - men) };
          const rn = nations[a.owner];
          if (rn) nations[a.owner] = { ...rn, res: { ...rn.res, men: (rn.res?.men || 0) + men } };
          a.spoils = { men: (a.spoils?.men || 0) + men, scrap: (a.spoils?.scrap || 0) + 40,
                       food: (a.spoils?.food || 0) + 45 };
          if (tgt.owner === g.player) {
            newLog.push({ turn: g.turn, m: `The Rendfast Host walks into ${tgt.name} unopposed and helps itself.` });
            notice("raid", `The Rendfast Host has sacked ${tgt.name}. They took 45 rations, 40 scrap and ${men} of your people.`, a.target);
          }
        }
        const back = neighbours(a.c, a.r).find(([x, y]) => provinces[key(x, y)]
          && !armies.some((z) => z.c === x && z.r === y && z.owner !== a.owner));
        if (back) { a.c = back[0]; a.r = back[1]; a.route = null; a.seq = (a.seq || 0) + 1; }
      });

      /* Rivals sit down in front of walls too. A host that has marched up to a
         walled place it is at war with invests rather than throwing itself at
         the stonework. */
      armies.forEach((a) => {
        if (a.owner === g.player || isMinor(a.owner) || !a.units.length) return;
        neighbours(a.c, a.r).forEach(([x, y]) => {
          const q = provinces[key(x, y)];
          if (!q || !q.owner || q.owner === a.owner || q.siege || !isWalled(q)) return;
          if (!isMinor(q.owner) && !war[warKey(a.owner, q.owner)]) return;
          if (Math.random() > 0.5) return;
          provinces[key(x, y)] = { ...q, siege: { by: a.owner, seasons: 0 } };
          if (q.owner === g.player) {
            notice("raid", `${NATIONS[a.owner]?.short || "A host"} has sat down in front of ${q.name}.`, key(x, y));
          }
        });
      });

      /* --- sieges ---
         A siege is a thing you keep doing, not a thing you did. Walk away and
         it lifts itself; stay and the place pays nobody, its people go hungry
         and the men on the wall get thinner every season. */
      Object.values(provinces).forEach((pv) => {
        const sg = pv.siege;
        if (!sg) return;
        const k2 = key(pv.c, pv.r);
        const still = armies.some((a) => a.owner === sg.by && a.units.length
          && hexDist(a.c, a.r, pv.c, pv.r) === 1);
        if (!still || pv.owner === sg.by) {
          provinces[k2] = { ...pv, siege: null };
          if (sg.by === g.player && pv.owner !== sg.by) {
            newLog.push({ turn: g.turn, m: `The siege of ${pv.name} lapses — nobody is standing in front of it.` });
          }
          return;
        }
        const was = Math.floor(sg.seasons / SIEGE.perBreach);
        const seasons = sg.seasons + 1;
        const now = Math.min(SIEGE.maxBreach, Math.floor(seasons / SIEGE.perBreach));
        provinces[k2] = {
          ...pv, siege: { ...sg, seasons },
          pop: Math.max(0, Math.round((pv.pop || 0) * (1 - SIEGE.starve))),
        };
        // The garrison thins on short rations as surely as the town does.
        armies.forEach((a) => {
          if (a.c !== pv.c || a.r !== pv.r || a.owner !== pv.owner) return;
          a.units = a.units.map((u) => ({ ...u, str: Math.max(1, Math.round(u.str * (1 - SIEGE.garrison))) }));
        });
        // Sitting still in the mud costs the besieger rations.
        const bn = nations[sg.by];
        if (bn) nations[sg.by] = { ...bn, res: { ...bn.res, food: Math.max(0, bn.res.food - SIEGE.upkeep) } };
        if (now > was) {
          const where = BREACH_ORDER[now - 1];
          if (sg.by === g.player) {
            newLog.push({ turn: g.turn, m: `The wall at ${pv.name} gives way on the ${where}.` });
            notice("built", `A breach is open at ${pv.name}. Storm it while it stands open.`, k2);
          } else if (pv.owner === g.player) {
            notice("raid", `The wall at ${pv.name} has been breached on the ${where}.`, k2);
          }
        } else if (pv.owner === g.player && seasons === 1) {
          notice("raid", `${pv.name} is invested. It pays you nothing while they sit there.`, k2);
        }
      });

      // --- the Wasters ---
      // They do not claim ground. They walk to whoever has something worth
      // taking, and take it. Everyone is free to go and kill them.
      {
        const claimed = NATION_IDS.reduce((n, x) => n + (heldNow[x] || 0), 0);
        const bands = armies.filter((a) => a.owner === "wasters" && !a.lairBound && !a.mob);
        const want = Math.min(7, Math.floor(claimed / 55));
        if (bands.length < want && Math.random() < 0.4) {
          const wild = Object.values(provinces).filter((q) => !q.owner && q.explored === false);
          const at = wild[Math.floor(Math.random() * wild.length)];
          if (at) {
            const size = 2 + Math.floor(Math.random() * 2);
            armies.push({
              id: `w${g.turn}${Math.random().toString(36).slice(2, 6)}`, owner: "wasters",
              c: at.c, r: at.r, name: "Waster band",
              units: Array.from({ length: size }, (_, i) =>
                makeUnit(i === 0 ? "hunters" : "axemen", "wasters",
                  `w${g.turn}${i}${Math.random().toString(36).slice(2, 5)}`)),
              mp: 0, maxMp: 3,
            });
          }
        }

        armies.filter((a) => a.owner === "wasters" && !a.lairBound && !a.mob).forEach((a) => {
          // They never settle. Every winter they move on, and they will not
          // walk back over ground they have just stripped.
          a.recent = (a.recent || []).slice(-5);
          let mp = 4, guard = 0;
          a.route = [[a.c, a.r]];
          while (mp > 0 && guard++ < 5) {
            const opts = neighbours(a.c, a.r).map(([x, y]) => provinces[key(x, y)]).filter(Boolean)
              .filter((q) => TERRAIN[q.t].move <= mp);
            if (!opts.length) break;
            const score = (q) => {
              const k = key(q.c, q.r);
              let v = (q.owner && !isMinor(q.owner) ? 34 : 0)
                + (doneBuilds(q).some((b) => !b.damaged) ? 16 : 0)
                + (q.capital ? -30 : 0)                      // seats are too well held
                + neighbours(q.c, q.r).filter(([x, y]) => {
                    const z = provinces[key(x, y)]; return z && z.owner && !isMinor(z.owner);
                  }).length * 5;
              if (a.recent.includes(k)) v -= 40;             // stripped already
              return v + Math.random() * 6;
            };
            opts.sort((x, y) => score(y) - score(x));
            const best = opts[0];
            if (armies.some((z) => z.c === best.c && z.r === best.r && z.owner !== "wasters")) break;
            mp -= TERRAIN[best.t].move;
            a.c = best.c; a.r = best.r;
            a.recent.push(key(best.c, best.r));
            a.route.push([best.c, best.r]);
            const stand = provinces[key(a.c, a.r)];
            if (stand && stand.owner && !isMinor(stand.owner)) break;   // stop where the pickings are
          }
          if (a.route.length < 2) a.route = null;
          a.seq = (a.seq || 0) + 1;

          const on = provinces[key(a.c, a.r)];
          if (!on || !on.owner || isMinor(on.owner)) return;
          const victim = on.owner;
          const vn = nations[victim];
          const roll = Math.random();
          const res3 = { ...vn.res };
          let what = "";
          const spoil = doneBuilds(on).find((b) => !b.damaged);
          if (spoil && roll < 0.42) {
            provinces[key(a.c, a.r)] = { ...on,
              builds: buildsOf(on).map((b) => (b === spoil ? { ...b, damaged: true } : b)) };
            what = `wreck the ${buildName(spoil).toLowerCase()} at ${on.name}`;
          } else if (roll < 0.72) {
            const take = 18 + Math.floor(Math.random() * 22);
            res3.scrap = Math.max(0, res3.scrap - take);
            what = `carry off ${take} scrap from ${on.name}`;
          } else {
            // They take people, not an abstraction. The heads come off the
            // province itself and go into the raiders' own pool, so a ward
            // raided twice pays fewer recruits for years afterwards and the
            // wasters get stronger for exactly what they took.
            const food = 12 + Math.floor(Math.random() * 16);
            const want = 20 + Math.floor(Math.random() * 30);
            const taken = Math.min(want, Math.max(0, Math.floor(on.pop || 0)));
            res3.food = Math.max(0, res3.food - food);
            provinces[key(a.c, a.r)] = { ...on, pop: Math.max(0, (on.pop || 0) - taken) };
            const rn = nations[a.owner];
            if (rn) nations[a.owner] = { ...rn, res: { ...rn.res, men: (rn.res?.men || 0) + taken } };
            what = taken > 0
              ? `burn ${food} rations at ${on.name} and drive ${taken} of its people off with them`
              : `burn ${food} rations at ${on.name}, and find nobody left to take`;
          }
          nations[victim] = { ...vn, res: res3 };
          if (victim === g.player) {
            newLog.push({ turn: g.turn, m: `Wasters ${what}.` });
            notice("raid", `Raiders have attacked your land — they ${what}.`, key(a.c, a.r));
          }

          // An undefended holding with nothing worth wrecking gets taken.
          const guarded = armies.some((z) => z.c === a.c && z.r === a.r && z.owner === victim);
          if (!guarded && !on.capital && Math.random() < 0.28) {
            changeOwner(key(a.c, a.r), "wasters");
            provinces[key(a.c, a.r)] = { ...provinces[key(a.c, a.r)], owner: "wasters", damaged: false };
            if (victim === g.player) {
              newLog.push({ turn: g.turn, m: `${on.name} is lost — the Wasters have moved into it.` });
              notice("loss", `${on.name} has fallen to the Wasters. They hold it now.`, key(a.c, a.r));
            }
          }
        });
      }

      // --- warlords on the road arrive ---
      NATION_IDS.forEach((id) => {
        const n = nations[id];
        if (!n.lordTransit) return;
        const to = n.lordTransit.to;
        const target = to && armies.find((a) => a.id === to);
        armies = armies.map((a) => (a.owner === id ? { ...a, lord: !!target && a.id === to } : a));
        nations[id] = { ...n, lordTransit: null };
        if (id === g.player && WARLORDS[id]) {
          const lm = target ? `You take the field with ${target.name}.`
                            : "You are back at your seat.";
          newLog.push({ turn: g.turn, m: lm });
          notice("lord", lm, target ? key(target.c, target.r) : null);
        }
      });

      // --- who you have laid eyes on ---
      {
        const sight = seenSet(provinces, armies, g.player);
        const met = { ...(g.met || {}) };
        sight.forEach((k) => { const q = provinces[k]; if (q && q.owner) met[q.owner] = true; });
        armies.forEach((a) => { if (sight.has(key(a.c, a.r))) met[a.owner] = true; });
        g = { ...g, met };
      }

      // --- the workshops turn out arms ---
      NATION_IDS.forEach((id) => {
        const n = nations[id];
        const { per } = craftPlan(n, provinces, id);
        if (!Object.keys(per).length) return;
        // A rack only holds so much; work beyond three companies' worth is
        // wasted, so there is a reason to keep raising them.
        const arms = { ...(n.arms || {}) };
        Object.entries(per).forEach(([t, v]) => {
          arms[t] = Math.min((arms[t] || 0) + v, UNITS[t].size * 3);
        });
        nations[id] = { ...n, arms };
      });

      // --- the wards grow, and any that are being fed grow faster ---
      {
        const sea = seasonOf(g.turn).id;
        Object.keys(provinces).forEach((pk) => {
          const q = provinces[pk];
          if (!q.owner || isMinor(q.owner)) return;      // only realms tend their ground
          const ceil = popCeiling(pk, q.t);
          let pop = popGrow(q.pop, ceil, sea);
          let grow = q.grow;
          if (grow && grow.left > 0) {
            // Rations already paid for. This lands whatever the season does,
            // and it is allowed to push a ward past what the land would carry
            // on its own — that is what the rations are buying.
            pop = pop + grow.per;
            grow = grow.left <= 1 ? null : { ...grow, left: grow.left - 1 };
            if (!grow && q.owner === g.player) {
              newLog.push({ turn: g.turn, m: `The ward at ${q.name} is fed through. It stands at ${Math.round(pop)}.` });
            }
          }
          if (pop !== q.pop || grow !== q.grow) provinces[pk] = { ...q, pop, grow };
        });
      }

      // --- a winter of study ---
      NATION_IDS.forEach((id) => {
        const n = nations[id];
        if (!n.research) return;
        const left = n.research.left - 1;
        if (left > 0) { nations[id] = { ...n, research: { ...n.research, left } }; return; }
        nations[id] = { ...n, research: null, known: { ...n.known, [n.research.id]: true } };
        if (id === g.player) {
          newLog.push({ turn: g.turn, m: `${TECHS[n.research.id].name} is understood.` });
          notice("learned", `${TECHS[n.research.id].name} is understood. New work is open in the Advances tab.`);
          Sound.play("found");
        }
      });

      // --- the seat builds ---
      Object.keys(provinces).forEach((k) => {
        const p = provinces[k];
        if (!p.project) return;
        const left = p.project.left - 1;
        if (left > 0) { provinces[k] = { ...p, project: { ...p.project, left } }; return; }
        const done = p.project;
        provinces[k] = done.kind === "tier"
          ? { ...p, tier: p.tier + 1, project: null }
          : { ...p, works: { ...p.works, [done.id]: true }, project: null };
        if (p.owner === g.player) {
          const doneMsg = done.kind === "tier"
            ? `${p.name} is now ${SETTLEMENT[p.tier + 1].name.toLowerCase()}.`
            : `${WORKS[done.id].name} finished at ${p.name}.`;
          newLog.push({ turn: g.turn, m: doneMsg });
          notice("built", doneMsg, k);
          Sound.play("found");
        }
      });

      // --- construction advances a winter ---
      Object.keys(provinces).forEach((k) => {
        const p = provinces[k];
        if (!buildsOf(p).some((b) => b.left)) return;
        const done = [];
        const builds = buildsOf(p).map((b) => {
          if (!b.left) return b;
          const left = b.left - 1;
          // A slot being improved carries the level it is becoming, so when the
          // work lands the name in the log is the new one, not the old.
          const next = left === 0 && b.becomes
            ? { ...b, left, lvl: b.becomes.lvl, fork: b.becomes.fork, becomes: undefined }
            : { ...b, left };
          if (left === 0) done.push(next);
          return next;
        });
        provinces[k] = { ...p, builds };
        if (p.owner === g.player) done.forEach((b) => {
          newLog.push({ turn: g.turn, m: `${buildName(b)} at ${p.name} is finished.` });
        });
      });

      // --- income for everyone ---
      NATION_IDS.forEach((id) => {
        const inc = nationIncome({ provinces, armies, nations }, id, g.turn);
        const res = { ...nations[id].res };
        res.food = res.food + inc.food;
        res.scrap += Math.max(0, inc.scrap);
        res.fuel += Math.max(0, inc.fuel);
        res.powder += Math.max(0, inc.powder);
        res.men += Math.max(0, inc.men);

        if (res.food < 0) {
          // starvation: warbands waste away
          const hungry = armies.filter((a) => a.owner === id);
          hungry.forEach((a) => a.units.forEach((u) => {
            u.str = Math.max(0, u.str - Math.ceil(u.max * 0.08));
            u.morale = Math.max(0, u.morale - 8);
          }));
          if (id === g.player) newLog.push({ turn: g.turn, m: "Rations have run out. Your warbands are wasting away." });
          res.food = 0;
        }
        // cold attrition on the ice, unless you were born there
        if (id !== "boreal") {
          armies.filter((a) => a.owner === id).forEach((a) => {
            const t = provinces[key(a.c, a.r)]?.t;
            if (t === "g" || t === "t") a.units.forEach((u) => { u.str = Math.max(0, u.str - Math.ceil(u.max * 0.05)); });
          });
        }
        res.men = Math.min(res.men, 900 + seatCap(provinces, id));
        nations[id] = { ...nations[id], res };
      });

      /* --- supply ---
         The last word on a season. A warband at home sleeps, eats and gets its
         nerve back; one on the end of a long line does none of those things.
         Distance does the work, and hard ground and winter make it worse. */
      const cold = seasonOf(g.turn).id === "winter" ? WINTER_WASTE : 1;
      armies = armies.map((a) => {
        const nat = nations[a.owner];
        const sup = supplyOf(provinces, nat, a.owner, a);
        const ease = nat?.known?.quartering ? QUARTER_EASE : 1;
        const hard = HARD_GROUND[provinces[key(a.c, a.r)]?.t] || 1;
        const waste = sup.band.waste * hard * cold * ease;
        const shake = Math.round(sup.band.morale * ease);
        if (a.owner === g.player && sup.d >= 3 && (a.supply || 0) < 3) {
          notice("raid", `${a.name} is ${sup.band.name.toLowerCase()} — ${sup.raw} hexes from anything you hold. They are losing men every season out there.`, key(a.c, a.r));
        }
        return {
          ...a,
          supply: sup.d,
          units: a.units.filter((u) => u.str > 0).map((u) => ({
            ...u,
            str: waste ? Math.max(0, u.str - Math.ceil(u.max * waste)) : u.str,
            // Nobody rests well on short rations, so the season that would have
            // put their nerve back takes some of it instead.
            morale: Math.max(0, shake ? u.morale - shake : Math.min(u.maxMorale, u.morale + 12)),
          })),
          mp: Math.max(1, a.maxMp + ((EDICTS[nations[a.owner]?.edict || "none"] || EDICTS.none).move || 0)
            + lordMul(a.owner, nations[a.owner]).move + seasonOf(g.turn + 1).move - cartDrag(a)),
        };
      }).map((a) => ({ ...a, units: a.units.filter((u) => u.str > 0) }))
        .filter((a) => a.units.length > 0);

      // --- victory / defeat ---
      const counts = {};
      NATION_IDS.forEach((id) => { counts[id] = heldNow[id] || 0; });
      const landTotal = Object.keys(provinces).length;
      const seatsHeld = Object.values(provinces).filter(
        (p) => p.capital && p.seat !== g.player && !isMinor(p.seat) && p.owner === g.player).length;
      let over = g.over;
      if (counts[g.player] === 0) over = { win: false, why: "Your last holding is gone. The flag comes down." };
      else if (seatsHeld >= 4) over = { win: true, why: `Four rival seats fly your banner. Nobody left can contest the coast.` };
      else if (counts[g.player] / landTotal > 0.10) over = { win: true, why: "A tenth of the continent answers to you, and no rival can raise a host to match it." };
      else if (g.turn >= 150) {
        const best = NATION_IDS.reduce((a, b) => (counts[a] > counts[b] ? a : b));
        over = { win: best === g.player, why: best === g.player
          ? "A hundred and fifty seasons on, you hold more than anyone."
          : `A hundred and fifty seasons on, ${NATIONS[best].name} holds more than you.` };
      }

      // Anything the AI threw at the player is fought out one field at a time.
      // (This block was lost when the victory rules were rewritten; the return
      // below refers to both bindings.)
      const live = pending.filter((q) =>
        armies.some((a) => a.id === q.aId) && armies.some((a) => a.id === q.dId));
      const battle = live.length
        ? makeBattle(provinces, nations, armies, live[0].aId, live[0].dId, live[0].k) : null;
      if (battle) {
        newLog.unshift({ turn: g.turn, m: `${nations[battle.aNat].short} falls on your warband at ${battle.provName}.` });
      }

      return {
        ...g, provinces, nations, armies, war, turn: g.turn + 1,
        log: [...newLog, ...g.log].slice(0, 60), sel: null, over,
        notices: [...notices, ...g.notices].slice(0, 6),
        battle, pending: battle ? live.slice(1) : [],
      };
    });
  }

  /* -------------------------------- RENDER ------------------------------- */
  const selProv = game.sel?.k ? game.provinces[game.sel.k] : null;
  const selArmy = game.sel?.armyId ? game.armies.find((a) => a.id === game.sel.armyId) : null;

  return (
    <div className="cc-root cc-app w-full flex flex-col cc-text-e5eef3"
      style={{ background: "radial-gradient(1200px 700px at 25% 0%, #16232c 0%, #0b1116 60%, #080c10 100%)", color: "#ffffff" }}>
      <style>{UI_CSS}</style>

      <TopBar nat={nat} income={income} turn={game.turn} owned={owned.length}
        armies={game.armies.filter((a) => a.owner === P).length} pop={realmPop}
        sound={game.sound} onLords={() => setGame((g) => ({ ...g, lords: true }))}
        onSound={(which) => setGame((g) => {
          const next = { ...g.sound, [which]: !g.sound[which] };
          if (which === "music") Sound.music(next.music); else Sound.sfx(next.sfx);
          return { ...g, sound: next };
        })}
        onEnd={endTurn} onSave={saveNow} saveFailed={saveFailed}
        onScreen={(id) => setGame((g) => ({ ...g, screen: id }))}
        onCodex={() => setGame((g) => ({ ...g, showCodex: true }))} />

      <div className="flex-1 flex flex-col cc-lg-flex-row min-h-0">
        <div className="flex-1 min-w-0 min-h-0 relative overflow-hidden cc-min-h-420px">
          <Notices list={game.notices}
            onGo={(n) => setGame((g) => ({ ...g, focus: n.k, sel: { armyId: null, k: n.k },
              notices: g.notices.filter((x) => x.id !== n.id) }))}
            onDismiss={(id) => setGame((g) => ({ ...g, notices: g.notices.filter((x) => x.id !== id) }))} />
          <WorldMap game={game} P={P} sight={sight} onSelect={selectHex} atWar={atWar} onDeselect={deselect}
            onFocused={clearFocus} />
        </div>
        <aside className="w-full cc-lg-w-352px shrink-0 border-t cc-lg-border-t-0 cc-lg-border-l cc-border-28363f cc-bg-0d141af2 flex flex-col min-h-0 cc-max-h-46vh cc-lg-max-h-none">
          <Sidebar
            game={game} P={P} nat={nat} sight={sight} selProv={selProv} selArmy={selArmy} atWar={atWar}
            onBuild={build} onRecruitOpen={(k) => setGame((g) => ({ ...g, recruit: k }))}
            onWar={toggleWar} onDeselect={deselect}
            onInvestigate={investigate} onClaim={claim} onMarch={march}
            onInvest={invest} onLift={liftSiege}
            onSeat={(k) => setGame((g) => ({ ...g, seat: k }))} onResearch={research}
            onOpenTree={() => setGame((g) => ({ ...g, tree: true }))} onRepair={repair}
            onDistrict={(k) => setGame((g) => ({ ...g, district: k }))}
            onTake={takeCommand} onMerge={mergeInto} onReinforce={reinforce} onCommand={setCommander}
            onCraft={setCraft} onInvestPop={investPop}
            onRename={renameArmy} onSplit={splitUnit}
            onDisband={(aid, uid) => setGame((g) => ({
              ...g,
              armies: g.armies.map((a) => a.id === aid ? { ...a, units: a.units.filter((u) => u.id !== uid) } : a).filter((a) => a.units.length),
            }))}
          />
        </aside>
      </div>

      {game.recruit && (
        <RecruitPanel
          natId={P} nat={nat} provName={game.provinces[game.recruit]?.name}
          prov={game.provinces[game.recruit]}
          onClose={() => setGame((g) => ({ ...g, recruit: null }))}
          onConfirm={(type, wg, ag) => recruitUnit(game.recruit, type, wg, ag)}
        />
      )}
      {game.battle && (
        <BattleScreen b={game.battle} nations={game.nations} P={P}
          onStep={stepBattle} onAuto={autoBattle} onClose={closeBattle}
          onDeploy={deployBattle} onPost={postBattle} onCommit={commitReserve}
          onBegin={beginBattle} />
      )}
      {game.lords && (
        <WarlordScreen game={game} P={P} onClose={() => setGame((g) => ({ ...g, lords: false }))} />
      )}
      {game.tree && (
        <TechTree game={game} P={P} onResearch={research}
          onClose={() => setGame((g) => ({ ...g, tree: false }))} />
      )}
      {game.intro && (
        <OpeningScene game={game} P={P}
          onClose={() => setGame((g) => ({ ...g, intro: false }))} />
      )}
      {game.district && game.provinces[game.district] && (
        <DistrictPanel game={game} P={P} prov={game.provinces[game.district]}
          onClose={() => setGame((g) => ({ ...g, district: null }))}
          onBuild={build} onImprove={improve} onRepair={repair} />
      )}
      {game.seat && game.provinces[game.seat] && (
        <SeatScreen game={game} P={P} prov={game.provinces[game.seat]}
          onClose={() => setGame((g) => ({ ...g, seat: null }))}
          onEdict={setEdict} onUpgrade={seatUpgrade} onWork={seatWork}
          onRecruitOpen={(k) => setGame((g) => ({ ...g, recruit: k }))} />
      )}
      {game.lair && game.provinces[game.lair.k] && (
        <LairModal lair={game.lair} prov={game.provinces[game.lair.k]}
          onClose={() => setGame((g) => ({ ...g, lair: null }))} />
      )}
      {game.survey && (
        <SurveyModal sv={game.survey} prov={game.provinces[game.survey.k]}
          onChoose={resolveSurvey} onClose={() => setGame((g) => ({ ...g, survey: null }))} />
      )}
      {game.screen && (() => {
        const shut = () => setGame((g) => ({ ...g, screen: null }));
        const openTree = () => setGame((g) => ({ ...g, screen: null, tree: true }));
        if (game.screen === "realm") return (
          <RealmScreen title="The realm" onClose={shut}>
            <RealmPanel game={game} P={P} nat={nat} />
          </RealmScreen>);
        if (game.screen === "tech") return (
          <RealmScreen title="Advances" onClose={shut}>
            <AdvancesPanel game={game} P={P} onResearch={research} onOpenTree={openTree} />
          </RealmScreen>);
        if (game.screen === "make") return (
          <RealmScreen title="The works" onClose={shut}>
            <ProductionPanel game={game} P={P} onCraft={setCraft} />
          </RealmScreen>);
        if (game.screen === "world") return (
          <RealmScreen title="Rivals" onClose={shut}>
            <WorldPanel game={game} P={P} atWar={atWar} onWar={toggleWar} />
          </RealmScreen>);
        return null;
      })()}
      {game.showCodex && <Codex onClose={() => setGame((g) => ({ ...g, showCodex: false }))} />}
      {game.over && <GameOver over={game.over} onRestart={() => setGame(initialState())} />}
    </div>
  );
}

/* ------------------------------- TOP BAR ---------------------------------- */
const RES_META = [
  { k: "food", label: "Rations", Icon: Wheat, c: "#c3cf7a" },
  { k: "scrap", label: "Scrap", Icon: Wrench, c: "#c9a37a" },
  { k: "metal", label: "Metal", Icon: Anvil, c: "#b6c2cc" },
  { k: "fuel", label: "Fuel", Icon: Fuel, c: "#7fb8c9" },
  { k: "powder", label: "Powder", Icon: Flame, c: "#d98a6a" },
  { k: "men", label: "Recruits", Icon: Users, c: "#9db8c4" },
];

function TopBar({ nat, income, turn, owned, armies, pop, onEnd, onCodex, sound, onSound, onLords, onSave, saveFailed, onScreen }) {
  return (
    <header className="shrink-0 border-b cc-border-28363f cc-bg-0a1015a90 backdrop-blur px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2">
      <div className="flex items-center gap-2.5 pr-5 border-r cc-border-28363f">
        <span className="shrink-0 flex items-center justify-center rounded"
          style={{ width: 30, height: 30, background: mix(nat.color, "#0b1116", 0.82),
                   border: `1px solid ${mix(nat.color, "#0b1116", 0.5)}` }}>
          <Sigil id={nat.id} size={19} color={nat.color} />
        </span>
        <div className="leading-tight">
          <div className="disp cc-text-17px">{nat.name}</div>
          <div className="cc-text-12px cc-text-93a9b5">
            {WARLORDS[nat.id] ? `${WARLORDS[nat.id].name} · ` : ""}
          <span style={{ color: SEASON_TINT[seasonOf(turn).id] }}>{seasonOf(turn).name}</span>
          {" "}of year <span className="num">{yearOf(turn)}</span> · <span className="num">{owned}</span> holdings · <span className="num">{armies}</span> warbands
          </div>
        </div>
      </div>


      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 flex-1 min-w-0">
        {/* People, not a resource: you do not spend them, they eat, and the
            recruits they yield are counted separately two boxes along. */}
        <div className="flex items-center gap-2"
          title={`Everyone living under your banner. They eat ${pop.eats} rations a season, already counted in what the land brings in.`}>
          <Users size={15} style={{ color: "#d3b98a" }} strokeWidth={1.8} />
          <div className="leading-none">
            <div className="num cc-text-15px">{pop.total.toLocaleString()}</div>
            <div className="cc-text-11d5px cc-text-8399a6 flex items-center gap-1">
              People
              <span className="num" style={{ color: pop.grow < 0 ? "#e0644a" : pop.grow > 0 ? "#6fae8c" : "#a7bac6" }}>
                {pop.grow > 0 ? "+" : ""}{pop.grow}
              </span>
            </div>
          </div>
        </div>
        {RES_META.map(({ k, label, Icon, c }) => {
          const v = nat.res[k];
          const d = income[k];
          return (
            <div key={k} className="flex items-center gap-2">
              <Icon size={15} style={{ color: c }} strokeWidth={1.8} />
              <div className="leading-none">
                <div className="num cc-text-15px">{Math.round(v)}</div>
                <div className="cc-text-11d5px cc-text-8399a6 flex items-center gap-1">
                  {label}
                  <span className="num" style={{ color: d < 0 ? "#e0644a" : d > 0 ? "#6fae8c" : "#a7bac6" }}>
                    {d > 0 ? "+" : ""}{d}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Icons, not words: four text buttons here cost enough width to wrap the
          bar onto three rows, and at 1280x720 that ate 36% of the screen the
          map is meant to be on. Same 28px square as the warlord and sound
          controls beside them. */}
      <div className="flex items-center gap-1.5">
        {[["realm", "The realm", Crown], ["tech", "Advances", Sparkles],
          ["make", "The works", Anvil], ["world", "Rivals", Swords]].map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => onScreen(id)}
            title={label} aria-label={label} className="cc-sndbtn">
            <Icon size={15} />
          </button>
        ))}
      </div>
      <button type="button" onClick={onLords}
        title={nat.lordDead ? "Your realm has no warlord" : "Your warlord"}
        className={`cc-lordbtn ${nat.lordDead ? "cc-lorddead" : ""}`} aria-label="Warlord">
        <LordPortrait id={nat.id} className="cc-lordicon" small />
      </button>
      <button type="button" onClick={() => onSound("music")} title="Background music"
        className={`cc-sndbtn ${sound.music ? "cc-sndon" : ""}`} aria-pressed={sound.music}>
        <Music size={15} />
      </button>
      <button type="button" onClick={() => onSound("sfx")} title="Sound effects"
        className={`cc-sndbtn ${sound.sfx ? "cc-sndon" : ""}`} aria-pressed={sound.sfx}>
        {sound.sfx ? <Volume2 size={15} /> : <VolumeX size={15} />}
      </button>
      <button onClick={onSave}
        title={saveFailed
          ? "This browser is not storing the game — it will be gone when you close the tab"
          : "Write the position down (it also saves itself every season)"}
        className={`cc-text-13px px-2 py-1 rounded border transition-colors ${saveFailed
          ? "cc-text-e8b98a cc-border-8a4a38"
          : "cc-text-a0b6c1 cc-hover-text-e5eef3 cc-border-22303a cc-hover-border-31424e"}`}>
        {saveFailed ? "Not saving" : "Save"}
      </button>
      <button onClick={onCodex}
        className="cc-text-13px cc-text-a0b6c1 cc-hover-text-e5eef3 px-2 py-1 rounded border cc-border-22303a cc-hover-border-31424e transition-colors">
        How this works
      </button>
      <button onClick={onEnd}
        className="disp cc-text-15px px-5 py-2 rounded cc-bg-1f4a52 cc-hover-bg-2a5f69 border cc-border-356b76 cc-text-d9f0f2 flex items-center gap-2 transition-colors">
        End {seasonOf(turn).name.toLowerCase()} <ChevronRight size={15} />
      </button>
    </header>
  );
}


/* -------------------------------- HERALDRY -------------------------------- */
function SigilMarks({ id }) {
  switch (id) {
    case "dogger": return (<><circle cx="12" cy="4" r="2.2" /><path d="M12 6.2V20M6.5 10h11M4.5 14.5a7.5 7.5 0 0 0 15 0" /></>);
    case "lyon": return (<><path d="M12 4v16M5 20h14M6 8h12M6 8l-3 5.5a3.4 3.4 0 0 0 6 0zM18 8l3 5.5a3.4 3.4 0 0 1-6 0z" /></>);
    case "alpine": return (<><path d="M2.5 19.5h19L12 4z" /><circle cx="12" cy="15" r="3" /></>);
    case "karst": return (<><path d="M2 17.5h20M6 17.5V10.5M18 17.5V10.5M6 12a6 6 0 0 1 12 0M12 10V4.5" /></>);
    case "boreal": return (<><path d="M12 2.5v19M3.8 7.2l16.4 9.6M20.2 7.2L3.8 16.8M12 6.6l-3-2.4M12 6.6l3-2.4M12 17.4l-3 2.4M12 17.4l3 2.4" /></>);
    case "horde": return (<><path d="M6.5 20v-7.5a5.5 5.5 0 0 1 11 0V20M6.5 20h3M14.5 20h3M12 3v2.4" /></>);
    case "solar": return (<><circle cx="12" cy="12" r="4.2" /><path d="M12 2.6v2.8M12 18.6v2.8M2.6 12h2.8M18.6 12h2.8M5.3 5.3l2 2M16.7 16.7l2 2M18.7 5.3l-2 2M7.3 16.7l-2 2" /></>);
    case "quarrymen": return (<><path d="M5.5 18.5L17.5 6.5" /><path d="M12.8 3.6a7.2 7.2 0 0 1 6.6 6.6" />
      <path d="M18.5 18.5L10 10" /><path d="M4.4 4.4h5.2v5.2H4.4z" /></>);
    case "wasters": return (<><path d="M4 19h16M7 19l2-9h6l2 9M9 10l3-6 3 6" /><path d="M10 14h4" /></>);
    case "changed": return (<><path d="M12 3.5c4 0 6.5 3 6.5 6.5S16 20.5 12 20.5 5.5 13.5 5.5 10 8 3.5 12 3.5z" />
      <path d="M9.5 9.5v1M14.5 9.5v1M9 14c2 1.6 4 1.6 6 0" /></>);
    default: return <circle cx="12" cy="12" r="6" />;
  }
}
function Sigil({ id, size = 20, color, width = 1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"}
      strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ flexShrink: 0 }}>
      <SigilMarks id={id} />
    </svg>
  );
}

/* ------------------------------- WORLD MAP --------------------------------
   The board is still a hex lattice underneath (adjacency and movement depend
   on it), but nothing is drawn as a hexagon. Every lattice corner is displaced
   by a hash of its own position, so neighbouring cells agree on the same
   displaced point and the tiling stays watertight while the outlines turn
   irregular. On top of that go coastlines, national frontiers and terrain
   symbols, which is what actually makes it read as a map.
   ------------------------------------------------------------------------ */
const S = 16;
const HEXW = Math.sqrt(3) * S;
const VS = S * 1.5;
const PAD = 18;
const MAPW = W * HEXW + HEXW / 2 + PAD * 2;
const MAPH = (H - 1) * VS + S * 2 + PAD * 2;

const centreOf = (c, r) => [c * HEXW + (r % 2 ? HEXW / 2 : 0) + HEXW / 2 + PAD, r * VS + S + PAD];

// The inverse of centreOf. With this the map needs one click target instead of
// one per province, which keeps thousands of nodes out of the document.
function hexAt(x, y) {
  const r0 = Math.round((y - S - PAD) / VS);
  let best = null, bd = Infinity;
  for (let r = r0 - 1; r <= r0 + 1; r++) {
    const c0 = Math.round((x - HEXW / 2 - PAD - (r % 2 ? HEXW / 2 : 0)) / HEXW);
    for (let c = c0 - 1; c <= c0 + 1; c++) {
      const [cx, cy] = centreOf(c, r);
      const d = (cx - x) * (cx - x) + (cy - y) * (cy - y);
      if (d < bd) { bd = d; best = [c, r]; }
    }
  }
  return bd <= S * S ? best : null;
}

function noise(x, y, s) {
  const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
}
function lum(h) {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const inkFor = (col) => (lum(col) > 0.22 ? mix(col, "#04080b", 0.62) : mix(col, "#e9f3f7", 0.55));

/* ------------------------------- RELIEF ------------------------------------
   There is no elevation data behind this world and there should not be — the
   coast is hand-drawn, and a dropped sea is the whole premise. But a height
   can be inferred from what the ground already IS: mountains stand over hills,
   hills over plains, and the drained seabed lies below all of it. Smooth that
   table of terrain classes a few times and it becomes a landform; light the
   landform from the north-west and every range gets a lit face and a shadowed
   one. That is most of what separates a map from a chart of coloured tiles,
   and it costs one pass at load and nothing at all thereafter. */
/* Only the classes that ARE a height difference get one. A forest is not
   higher than a plain and a ruinfield is not higher than a steppe, and giving
   them separate heights turned the shading into salt and pepper — the lowland
   classes alternate every other tile, so the map read as noise rather than as
   country. Everything that is simply ground sits at one level; mountains,
   hills, ice and the dropped seabed are the landform. */
const RELIEF_H = {
  m: 1, g: 0.86, h: 0.46,
  p: 0.16, f: 0.16, s: 0.16, t: 0.16, r: 0.16, c: 0.12,
  l: 0.1, d: -0.05, b: -0.08, "~": -0.2, _: -0.2,
};
const RELIEF_LIGHT = [-0.62, -0.62, 0.48];   // from the north-west, fairly low
const RELIEF_K = 5.2;                        // vertical exaggeration
const RELIEF_STEPS = 6;                      // quantised, so the fills batch

const RELIEF = (() => {
  const at = (c, r) => r * W + c;
  let h = new Float32Array(W * H);
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) h[at(c, r)] = RELIEF_H[MAP[r][c]] ?? 0;
  }
  // Six passes of neighbour averaging. Fewer and a range is one bright tile;
  // many more and the whole continent melts into a single dome.
  for (let pass = 0; pass < 6; pass++) {
    const next = new Float32Array(W * H);
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        let sum = h[at(c, r)] * 2.2, n = 2.2;
        neighbours(c, r).forEach(([nc, nr]) => { sum += h[at(nc, nr)]; n += 1; });
        next[at(c, r)] = sum / n;
      }
    }
    h = next;
  }

  const L = (() => {
    const m = Math.hypot(...RELIEF_LIGHT);
    return RELIEF_LIGHT.map((v) => v / m);
  })();
  const flat = L[2];                          // what level ground returns
  const out = new Float32Array(W * H);
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const [cx, cy] = centreOf(c, r);
      let gx = 0, gy = 0, n = 0;
      neighbours(c, r).forEach(([nc, nr]) => {
        const [nx, ny] = centreOf(nc, nr);
        const dh = h[at(nc, nr)] - h[at(c, r)];
        gx += (dh * (nx - cx)) / (2 * S);
        gy += (dh * (ny - cy)) / (2 * S);
        n += 1;
      });
      if (n) { gx = (gx * 2) / n; gy = (gy * 2) / n; }
      const vx = -gx * RELIEF_K, vy = -gy * RELIEF_K;
      const m = Math.hypot(vx, vy, 1);
      const dot = (vx * L[0] + vy * L[1] + L[2]) / m;
      out[at(c, r)] = Math.max(-1, Math.min(1, (dot - flat) * 2.3));
    }
  }
  return out;
})();

/* Lit above zero, in shadow below, quantised so that the whole map still draws
   as a couple of hundred batched paths rather than one per tile. The grain of
   the ground is folded in here too, rather than being its own dimension of
   fill colour that would multiply the batches. */
const reliefAt = (c, r) => {
  const v = RELIEF[r * W + c] + (noise(c * 5.1, r * 7.3, 4) - 0.5) * 0.09;
  return Math.round(Math.max(-1, Math.min(1, v)) * RELIEF_STEPS) / RELIEF_STEPS;
};

const JIT = S * 0.3;
const _cor = new Map();
function cornerAt(cx, cy, i) {
  const a = (Math.PI / 180) * (60 * i - 30);
  const rx = Math.round((cx + S * Math.cos(a)) * 2) / 2;
  const ry = Math.round((cy + S * Math.sin(a)) * 2) / 2;
  const k = rx + "," + ry;
  let p = _cor.get(k);
  if (!p) {
    const ang = noise(rx, ry, 1) * Math.PI * 2;
    const rad = (0.3 + noise(ry, rx, 2) * 0.7) * JIT;
    p = [+(rx + Math.cos(ang) * rad).toFixed(2), +(ry + Math.sin(ang) * rad).toFixed(2)];
    _cor.set(k, p);
  }
  return p;
}
function cellPts(c, r) {
  const [cx, cy] = centreOf(c, r);
  const out = [];
  for (let i = 0; i < 6; i++) out.push(cornerAt(cx, cy, i));
  return out;
}
const ptsStr = (pts) => pts.map((p) => p[0] + "," + p[1]).join(" ");

// Edge i runs from corner i to corner i+1. These are the cells across each edge.
const EDGE_N = [
  [[1, 0], [1, 0]], [[0, 1], [1, 1]], [[-1, 1], [0, 1]],
  [[-1, 0], [-1, 0]], [[-1, -1], [0, -1]], [[0, -1], [1, -1]],
];
const edgeN = (c, r, i) => {
  const [dc, dr] = EDGE_N[i][r % 2 === 1 ? 1 : 0];
  return [c + dc, r + dr];
};

/* ----------------------------- TERRAIN MARKS -------------------------------
   What is actually growing, standing or lying on a tile. These were single
   stroked outlines at a fixed offset — two identical chevrons for every
   mountain in Europe, three identical firs for every forest — which tiled into
   a visible lattice the moment you zoomed in, and read as wallpaper rather
   than as ground.

   Every mark is now built from the tile's own noise: how many, how big, where
   they sit, which way they lean. And each comes back in three parts rather
   than one, so the ground is lit like the rest of the map — a dark face on the
   south-east side, the outline, and a bright edge on the north-west, which is
   the same north-west the relief shading is lit from. A mountain reads as a
   mountain because it has a shadow, not because it is a triangle.

   Everything stays within about eleven units of the centre so nothing spills
   into the neighbouring tile, and every terrain still batches down to three
   paths for the whole map.
   ------------------------------------------------------------------------ */
function glyphFor(t, cx, cy, c, r) {
  // One stable stream of randomness per tile. Same tile, same mountains, every
  // time the world is drawn — but no two tiles alike.
  const rnd = (i) => noise(c * 7.13 + i * 2.7, r * 3.91 + i * 1.3, 13);
  const between = (i, lo, hi) => lo + rnd(i) * (hi - lo);
  const n = (i, lo, hi) => Math.floor(between(i, lo, hi + 0.999));
  let ink = "", fill = "", lit = "";

  switch (t) {
    case "m": {
      // Peaks along a rough baseline, tallest first so the small ones sit in
      // front. The south-east face is filled; the north-west ridge is lit.
      // One dominant peak and usually a smaller neighbour, set at different
      // heights on a wandering baseline. Two or three peaks of the same size on
      // the same line, hex after hex, drew a zigzag across the whole range —
      // regular enough to read as a pattern instead of as mountains.
      const count = rnd(20) > 0.62 ? 3 : 2;
      for (let i = 0; i < count; i++) {
        const x = cx + (i - (count - 1) / 2) * between(i + 1, 7, 10) + between(i + 4, -1.8, 1.8);
        const y = cy + between(i + 7, 1.5, 6);
        const w = between(i + 10, 3.4, 5.6);
        const h = (i === 0 ? between(i + 13, 8.5, 12.5) : between(i + 13, 5, 9));
        ink += `M${(x - w).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y - h).toFixed(1)}L${(x + w).toFixed(1)} ${y.toFixed(1)}`;
        fill += `M${x.toFixed(1)} ${(y - h).toFixed(1)}L${(x + w).toFixed(1)} ${y.toFixed(1)}L${(x + w * 0.15).toFixed(1)} ${y.toFixed(1)}Z`;
        lit += `M${(x - w * 0.9).toFixed(1)} ${(y - h * 0.12).toFixed(1)}L${x.toFixed(1)} ${(y - h).toFixed(1)}`;
      }
      break;
    }
    case "h": {
      // Mounds, overlapping, each with the shadow under its right shoulder.
      const count = n(0, 2, 3);
      for (let i = 0; i < count; i++) {
        const x = cx + (i - (count - 1) / 2) * between(i + 1, 7, 9) + between(i + 3, -1, 1);
        const y = cy + between(i + 6, 2.5, 4.5);
        const w = between(i + 9, 4, 5.6);
        const h = between(i + 12, 3.4, 5);
        // The mound is one quadratic; the lit edge and the shadow are its two
        // halves, split at the apex by de Casteljau rather than drawn by eye —
        // guessing at them left a pale arc hovering above the hill.
        const ap = (y - h * 0.95).toFixed(1);
        ink += `M${(x - w).toFixed(1)} ${y.toFixed(1)}q${w.toFixed(1)} ${(-h * 1.9).toFixed(1)} ${(w * 2).toFixed(1)} 0`;
        lit += `M${(x - w).toFixed(1)} ${y.toFixed(1)}Q${(x - w * 0.5).toFixed(1)} ${ap} ${x.toFixed(1)} ${ap}`;
        fill += `M${x.toFixed(1)} ${ap}Q${(x + w * 0.5).toFixed(1)} ${ap} ${(x + w).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}Z`;
      }
      break;
    }
    case "f": {
      // A stand rather than a row: varied heights, and the short ones nearer
      // the front so the group has some depth to it.
      const count = n(0, 3, 5);
      for (let i = 0; i < count; i++) {
        const x = cx + between(i + 1, -9, 9);
        const y = cy + between(i + 4, 1, 7);
        const h = between(i + 7, 5.5, 9);
        const w = h * between(i + 10, 0.3, 0.42);
        ink += `M${x.toFixed(1)} ${y.toFixed(1)}l0 ${(-h * 0.22).toFixed(1)}`;
        ink += `M${(x - w).toFixed(1)} ${(y - h * 0.22).toFixed(1)}L${x.toFixed(1)} ${(y - h).toFixed(1)}L${(x + w).toFixed(1)} ${(y - h * 0.22).toFixed(1)}Z`;
        fill += `M${x.toFixed(1)} ${(y - h).toFixed(1)}L${(x + w).toFixed(1)} ${(y - h * 0.22).toFixed(1)}L${x.toFixed(1)} ${(y - h * 0.22).toFixed(1)}Z`;
      }
      break;
    }
    case "r": {
      // Broken wall stubs and a standing corner or two: a place that was built
      // on rather than a pair of tally marks.
      const count = n(0, 2, 4);
      for (let i = 0; i < count; i++) {
        const x = cx + between(i + 1, -9, 6);
        const y = cy + between(i + 4, 1, 6);
        const w = between(i + 7, 3, 5.5);
        const h = between(i + 10, 3, 6.5);
        // A wall that stopped part way: up the near side, across a broken top,
        // down to the ground again. Filled as well as outlined, so it has some
        // mass to it rather than reading as a tally mark, which is what the
        // first version looked like.
        const a = w * between(i + 13, 0.35, 0.6);
        const shape = `M${x.toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y - h).toFixed(1)}L${(x + a).toFixed(1)} ${(y - h).toFixed(1)}`
          + `L${(x + a).toFixed(1)} ${(y - h * 0.58).toFixed(1)}L${(x + w).toFixed(1)} ${(y - h * 0.58).toFixed(1)}`
          + `L${(x + w).toFixed(1)} ${y.toFixed(1)}Z`;
        ink += shape;
        fill += shape;
        // A window, and whatever came down off the top.
        if (h > 4.4) ink += `M${(x + 0.9).toFixed(1)} ${(y - h * 0.72).toFixed(1)}l${(a - 1.8).toFixed(1)} 0l0 ${(h * 0.3).toFixed(1)}l${(-(a - 1.8)).toFixed(1)} 0Z`;
        if (rnd(i + 16) > 0.5) ink += `M${(x - 2.6).toFixed(1)} ${(y - 0.4).toFixed(1)}h.01M${(x - 1.4).toFixed(1)} ${(y + 0.5).toFixed(1)}h.01`;
      }
      break;
    }
    case "g": {
      // Crevasses, not asterisks. Long thin cracks with the odd branch.
      const count = n(0, 2, 3);
      for (let i = 0; i < count; i++) {
        const x = cx + between(i + 1, -8, 4);
        const y = cy + between(i + 4, -6, 5);
        const dx = between(i + 7, 5, 10), dy = between(i + 10, -3, 3);
        ink += `M${x.toFixed(1)} ${y.toFixed(1)}l${(dx * 0.45).toFixed(1)} ${(dy * 0.6).toFixed(1)}l${(dx * 0.55).toFixed(1)} ${(dy * 0.4).toFixed(1)}`;
        if (rnd(i + 13) > 0.5) ink += `M${(x + dx * 0.45).toFixed(1)} ${(y + dy * 0.6).toFixed(1)}l${(dx * 0.25).toFixed(1)} ${(3 + rnd(i) * 2).toFixed(1)}`;
      }
      break;
    }
    case "d": {
      // Ripples on a drained seabed. They run with the tide, so the whole tile
      // leans one way rather than every line being independently wobbly.
      const lean = between(0, -1.6, 1.6);
      const count = n(1, 3, 4);
      for (let i = 0; i < count; i++) {
        const y = cy - 5.5 + i * between(i + 2, 3.4, 4.4) + between(i + 5, -0.6, 0.6);
        const w = between(i + 8, 7.5, 9.5);
        ink += `M${(cx - w).toFixed(1)} ${(y - lean).toFixed(1)}q${(w * 0.5).toFixed(1)} -2.4 ${w.toFixed(1)} 0t${w.toFixed(1)} ${(lean * 2).toFixed(1)}`;
      }
      break;
    }
    case "l": {
      const count = n(0, 2, 3);
      for (let i = 0; i < count; i++) {
        const y = cy - 3.5 + i * between(i + 2, 3.6, 4.6);
        const w = between(i + 5, 6.5, 8.5);
        ink += `M${(cx - w).toFixed(1)} ${y.toFixed(1)}q${(w * 0.5).toFixed(1)} -2.6 ${w.toFixed(1)} 0t${w.toFixed(1)} 0`;
      }
      break;
    }
    case "s": {
      // Tufts of dry grass, some tall enough to lean.
      const count = n(0, 4, 6);
      for (let i = 0; i < count; i++) {
        const x = cx + between(i + 1, -9.5, 9.5);
        const y = cy + between(i + 4, 0, 6.5);
        const h = between(i + 7, 3, 5.5);
        const bend = between(i + 10, -1.6, 1.6);
        ink += `M${x.toFixed(1)} ${y.toFixed(1)}q${(bend * 0.5).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${bend.toFixed(1)} ${(-h).toFixed(1)}`;
        ink += `M${x.toFixed(1)} ${y.toFixed(1)}q${(-1.4).toFixed(1)} ${(-h * 0.45).toFixed(1)} ${(-2.2).toFixed(1)} ${(-h * 0.7).toFixed(1)}`;
      }
      break;
    }
    case "c": {
      // Reed tufts standing in short lengths of open water.
      const count = n(0, 2, 3);
      for (let i = 0; i < count; i++) {
        const x = cx + between(i + 1, -8, 6);
        const y = cy + between(i + 4, -4, 6);
        const h = between(i + 7, 3.5, 5.5);
        ink += `M${x.toFixed(1)} ${y.toFixed(1)}l0 ${(-h).toFixed(1)}M${(x + 2.2).toFixed(1)} ${y.toFixed(1)}l0 ${(-h * 0.7).toFixed(1)}`;
        ink += `M${(x - 3.4).toFixed(1)} ${(y + 1.4).toFixed(1)}q3.4 -1.4 6.8 0`;
      }
      break;
    }
    case "b": {
      // Salt crust: irregular plates with cracks between them.
      const count = n(0, 2, 3);
      for (let i = 0; i < count; i++) {
        const x = cx + between(i + 1, -7, 4);
        const y = cy + between(i + 4, -5, 4);
        const w = between(i + 7, 3.4, 5.4);
        const h = between(i + 10, 2.6, 4);
        ink += `M${x.toFixed(1)} ${y.toFixed(1)}l${w.toFixed(1)} ${(-h * 0.35).toFixed(1)}l${(w * 0.55).toFixed(1)} ${(h * 0.8).toFixed(1)}l${(-w * 0.7).toFixed(1)} ${(h * 0.55).toFixed(1)}Z`;
      }
      break;
    }
    case "t": {
      // Lichen and a few knee-high shrubs. Sparse, because it is.
      const count = n(0, 3, 5);
      for (let i = 0; i < count; i++) {
        const x = cx + between(i + 1, -9, 9);
        const y = cy + between(i + 4, -5, 6);
        if (rnd(i + 7) > 0.55) {
          ink += `M${x.toFixed(1)} ${y.toFixed(1)}l0 -2.4M${(x - 1.5).toFixed(1)} ${(y - 1.2).toFixed(1)}l1.5 -1.2l1.5 1.2`;
        } else {
          ink += `M${x.toFixed(1)} ${y.toFixed(1)}h.01M${(x + 1.8).toFixed(1)} ${(y + 1.4).toFixed(1)}h.01`;
        }
      }
      break;
    }
    case "p": {
      // Open ground says almost nothing, which is the point — but a little
      // more than half of it now carries a furrow or a tuft.
      if (rnd(0) < 0.42) break;
      for (let i = 0; i < n(1, 2, 3); i++) {
        const x = cx + between(i + 3, -7, 7), y = cy + between(i + 6, -1, 4.5);
        const h = between(i + 9, 2.6, 4);
        const bend = between(i + 12, -0.9, 0.9);
        ink += `M${x.toFixed(1)} ${y.toFixed(1)}q${(bend * 0.4).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${bend.toFixed(1)} ${(-h).toFixed(1)}`;
      }
      break;
    }
    default:
      break;
  }
  return ink || fill || lit ? { ink, fill, lit } : null;
}

/* Buildings on the map.

   These were abstract strokes inside a dark disc that hovered over the hex,
   and four of the ten had no glyph at all — workshop, mine, fishery and pier
   drew an empty circle, which is a poor way to tell someone what they built.

   They are silhouettes now: a shape you could recognise from its outline,
   filled and outlined so it reads over any terrain colour, sitting on a small
   ground shadow rather than floating in a ring. Everything is drawn against a
   baseline at y=3 and kept inside roughly 13 wide, so up to three fit along
   the bottom of a hex without covering the ground. */
const BUILD_ART = {
  // A barn, and the furrows of the dyked plots beside it.
  siltfarm: (
    <>
      <path d="M-6.4 3v-3.4l2.6-2.2 2.6 2.2V3z" />
      <path d="M0.4 1.1h6.4M0.4 2.1h6.4M0.4 3h6.4" fill="none" strokeWidth="0.75" />
    </>
  ),
  // Cut plate stacked against a jib, with the hook still on it. The first
  // version was a lamp-post next to a triangle.
  yard: (
    <>
      <path d="M-7 3v-2.6l4.6-1.1V3z" />
      <path d="M-2 3v-4.1l4.3-1V3z" />
      <path d="M2.9 3v-2.2l3.4-0.8V3z" />
      <path d="M-5.4-2.2v-6.2M-5.4-8.4h7.2" fill="none" strokeWidth="1.1" />
      <path d="M1.8-8.4v2.2" fill="none" strokeWidth="0.85" />
      <path d="M0.9-6.2h1.8v1.5H0.9z" />
    </>
  ),
  // A charcoal kiln: a dome with its chimney, and the saltpetre beds.
  mill: (
    <>
      <path d="M-5 3a4.4 4.4 0 0 1 8.8 0z" />
      <path d="M1.4-1.6v-3.2h1.9v2.2" />
      <path d="M-6 3h1.2M4.4 3h1.8" fill="none" strokeWidth="0.85" />
    </>
  ),
  // Two tanks and a flare, joined by a run of pipe. The single rounded tower
  // it had before read as a headstone with a candle beside it.
  refinery: (
    <>
      <path d="M-7.2 3v-5.6h4.8V3z" />
      <path d="M-7.2-2.6h4.8" fill="none" strokeWidth="0.7" />
      <path d="M-1.2 3v-7.8h4V3z" />
      <path d="M-1.2-2.2h4M-1.2 0.4h4" fill="none" strokeWidth="0.7" />
      <path d="M-4.8-2.6v-1.6h3.6" fill="none" strokeWidth="0.8" />
      <path d="M5.2 3v-6.4h1.7V3z" />
      <path d="M6.05-3.6q-1.5-1.9 0-3.8q1.5 1.9 0 3.8z" />
    </>
  ),
  // A longhall with a banner over the door.
  muster: (
    <>
      <path d="M-6 3v-3l2-2.4h7l2 2.4v3z" />
      <path d="M4.6-2.6v-5.4" fill="none" strokeWidth="1" />
      <path d="M4.6-8h3.4l-1 1.3 1 1.3H4.6z" />
    </>
  ),
  // A craftsman's hut, chimney smoking.
  workshop: (
    <>
      <path d="M-5.4 3v-3.6l3.6-2.8 3.6 2.8V3z" />
      <path d="M1.6-2.6v-2.8h1.8V-1" />
      <path d="M2.5-6.4q-1.1-1 0-2q1.1-1 0-2" fill="none" strokeWidth="0.75" />
    </>
  ),
  // A pithead: the winding wheel on its A-frame, over the spoil.
  mine: (
    <>
      <path d="M-3.8 3L0-5.2 3.8 3M-2.4-0.6h4.8" fill="none" strokeWidth="1.1" />
      <circle cx="0" cy="-6.4" r="1.7" fill="none" strokeWidth="1.1" />
      <path d="M4.4 3l1.7-2.1L7.8 3z" />
    </>
  ),
  // Drying racks on the shore, with the catch hung out.
  fishery: (
    <>
      <path d="M-5.6 1h11.2l-1.7 2.4h-7.8z" />
      <path d="M-0.8 1v-4.6" fill="none" strokeWidth="1" />
      <path d="M-0.8-3.6q3.6 1.1 3.1 4.6" fill="none" strokeWidth="0.85" />
    </>
  ),
  // A stage out over the silt, with a hull tied up against it.
  pier: (
    <>
      <path d="M-6.6-0.9h12.2v1.5h-12.2z" />
      <path d="M-4.8 0.6V3M-0.4 0.6V3M4 0.6V3" fill="none" strokeWidth="0.95" />
      <path d="M4.6-0.9v-2.4h1.7v2.4z" />
    </>
  ),
  // A crenellated wall with a bastion thrown out from it.
  redoubt: (
    <>
      <path d="M-6.6 3v-4h1.5v-1.6h1.5V-1h1.6v-1.6h1.5V-1h1.6v-1.6h1.5V-1h1.5v4z" />
      <path d="M-2.2 3v-2.4h2.6V3z" fill="#0a1015" />
    </>
  ),
};

function BuildingMark({ b, x, y, small, tiny, left, damaged }) {
  const done = !left;
  const art = BUILD_ART[b];
  const total = BUILDINGS[b]?.turns || 1;
  const frac = done ? 1 : Math.max(0, (total - left) / total);
  const k = tiny ? 0.62 : small ? 0.82 : 1;
  // Warm timber and stone when it is standing; cold slate while it is still a
  // site, so a half-built thing reads as unfinished at a glance rather than
  // needing a progress collar to be studied.
  return (
    /* The same silhouette three times over: cast on the ground to the
       south-east, filled with a gradient so it has a top and a bottom, and
       given a warm edge on the north-west. Flat shapes in one colour looked
       like stickers once the ground under them had a light source. */
    <g transform={`translate(${x},${y}) scale(${k})`}>
      <ellipse cx="1.2" cy="3.4" rx="6.8" ry="1.6" fill="#060b0f" opacity="0.45" />
      <g transform="translate(0.9,0.8)" fill="#050a0e" stroke="#050a0e" strokeWidth="0.6"
         strokeLinejoin="round" strokeLinecap="round" opacity="0.3">
        {art || <path d="M-4 3v-4h8v4z" />}
      </g>
      <g fill={`url(#${done ? (damaged ? "bldhurt" : "bldwarm") : "bldsite"})`}
         stroke="#0a1015" strokeWidth="0.9" strokeLinejoin="round" strokeLinecap="round"
         opacity={done ? 1 : 0.9}>
        {art || <path d="M-4 3v-4h8v4z" />}
      </g>
      <g transform="translate(-0.45,-0.45)" fill="none" stroke="#fff0cf" strokeWidth="0.6"
         strokeLinejoin="round" strokeLinecap="round" opacity="0.3">
        {art || <path d="M-4 3v-4h8v4z" />}
      </g>
      {!done && (
        <>
          {/* scaffolding, and how far along the work is */}
          <path d="M-6.4 3l1.8-6M6.4 3l-1.8-6" fill="none" stroke="#f2c97a"
            strokeWidth="0.8" opacity="0.8" strokeLinecap="round" />
          <rect x="-6.4" y="4.4" width="12.8" height="1.5" rx="0.7" fill="#0a1015" opacity="0.85" />
          <rect x="-6.4" y="4.4" width={(12.8 * frac).toFixed(2)} height="1.5" rx="0.7" fill="#f2c97a" />
        </>
      )}
      {/* A cross drawn over the whole silhouette hid the thing it was marking.
          A badge in the corner says the same and leaves the building legible. */}
      {damaged && done && (
        <g transform="translate(5.6,-5)">
          <circle r="2.7" fill="#2a1512" stroke="#e0644a" strokeWidth="0.85" />
          <path d="M-1.1-1.1l2.2 2.2M1.1-1.1l-2.2 2.2" stroke="#e0644a"
            strokeWidth="1.05" fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

/* What a warband is carrying, for the glyph on the map: guns and vehicles
   announce themselves, a mostly-mounted band reads as horse, and otherwise
   the heaviest thing in the column names it. */
function warbandKind(a) {
  const u = a.units;
  if (!u.length) return "spear";
  if (u.some((x) => x.type === "fleshhorde")) return "horde";
  if (u.some((x) => x.type === "guncrew")) return "cannon";
  if (u.some((x) => x.type === "technicals")) return "vehicle";
  if (u.filter((x) => UNITS[x.type]?.cav).length * 2 >= u.length) return "horse";
  const rank = { spearmen: 0, pikemen: 0, ironclad: 1, axemen: 1, line: 1,
                 hunters: 2, bowmen: 2, musketeers: 3, riflemen: 3, vaultguard: 3 };
  const top = u.reduce((m, x) => Math.max(m, rank[x.type] ?? 0), 0);
  return ["spear", "blade", "bow", "gun"][top];
}

/* Warbands on the map.

   These were little stick figures inside a dark disc almost as wide as the
   hex itself, with a second disc for the company count and a halo on top of
   that — three rings of furniture around a shape you could not read anyway.

   They are the arms themselves now, in the same language as the buildings:
   one filled silhouette, a dark outline so it holds over any terrain, a small
   ground shadow, and nothing else. Drawn inside about 11 wide against a hex
   of 27, so the ground stays visible underneath them. */
function WarbandGlyph({ kind }) {
  switch (kind) {
    // A shield and a levelled spear.
    case "spear": return (<>
      <path d="M-4.8-2.6h4v3q0 2.6-2 3.6-2-1-2-3.6z" />
      <path d="M1 4.4L3.6-4.2" fill="none" strokeWidth="1.3" />
      <path d="M3.6-4.6l1.3 1.9-2.4.5z" />
    </>);
    // An axe on its haft.
    case "blade": return (<>
      <path d="M0-6.2l.9 1.6v4.4h-1.8v-4.4z" />
      <path d="M-2.8.2h5.6v1.2h-5.6z" />
      <path d="M-.6 1.6h1.2v2.6h-1.2z" />
      <circle cx="0" cy="4.8" r="0.95" />
    </>);
    // A recurve, strung, with the arrow on it.
    case "bow": return (<>
      <path d="M-1.4-4.8a6 6 0 0 1 0 9.6" fill="none" strokeWidth="1.3" />
      <path d="M-1.4-4.8v9.6" fill="none" strokeWidth="0.6" />
      <path d="M-3.2 0h5.6" fill="none" strokeWidth="1" />
      <path d="M2.8 0l-1.6-1v2z" />
    </>);
    // A musket, angled as if shouldered.
    case "gun": return (<>
      <path d="M-3.2 4.2L3.2-4.2" fill="none" strokeWidth="1.3" />
      <path d="M-3 3.8l-1.8 1.1 1.1 1.6 1.6-1.4z" />
      <path d="M0.2 0.6l1.6.9" fill="none" strokeWidth="1.7" />
    </>);
    // A shoe, for the horse under it.
    case "horse": return (<>
      <path d="M-3.8 4.6A4.2 5 0 1 1 3.8 4.6H1.9A2.4 3.1 0 1 0-1.9 4.6z" />
      <circle cx="-3" cy="3.4" r="0.5" fill="#0a1015" stroke="none" />
      <circle cx="3" cy="3.4" r="0.5" fill="#0a1015" stroke="none" />
    </>);
    // A running chassis.
    case "vehicle": return (<>
      <path d="M-5 2.2v-2.6h4.6l1.6-2.2h2.6l1.2 2.2v2.6z" />
      <circle cx="-2.6" cy="3.4" r="1.6" fill="none" strokeWidth="1.1" />
      <circle cx="2.8" cy="3.4" r="1.6" fill="none" strokeWidth="1.1" />
    </>);
    // Not arms at all. A mass of it, coming up the stair.
    case "horde": return (<>
      <path d="M-4.6 4.6q-1.4-3.4.8-5.2 1.6-1.3 3.4-.5.4-2.4 2.4-2.4 2.2 0 2.4 2.6 2.2.5 2 3-.2 1.8-1.8 2.5z" />
      <path d="M-2.4 1.2l-1.8-2.6M0.4-.4l-.4-3.2M2.8 1l2-2.4" fill="none" strokeWidth="0.8" />
    </>);
    // A barrel on its carriage.
    case "cannon": return (<>
      <path d="M-3.6 0.6L4.4-1.8" fill="none" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M-3.8 1.2L-1 4" fill="none" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="-2.6" cy="3.2" r="2" fill="none" strokeWidth="1.2" />
    </>);
    default: return <path d="M-4.4-2.6h4v3q0 2.6-2 3.6-2-1-2-3.6z" />;
  }
}

function WarbandMark({ col, n, hostile, chosen, kind }) {
  return (
    <g>
      <ellipse cx="0" cy="5" rx="5.4" ry="1.3" fill="#060b0f" opacity="0.5" />
      <g fill={col} stroke={chosen ? "#ffffff" : "#0a1015"}
         strokeWidth={chosen ? 1.1 : hostile ? 1 : 0.85}
         strokeLinejoin="round" strokeLinecap="round">
        <WarbandGlyph kind={kind} />
      </g>
      {/* How many companies, on a chip small enough to sit beside the arms
          rather than on top of them. */}
      <g transform="translate(5.4,4.4)">
        <circle r="3.2" fill="#0b1219" stroke={chosen ? "#ffffff" : col} strokeWidth="0.9" />
        <text y="1.6" textAnchor="middle" className="cc-armycount"
          style={{ fontSize: "6.6px" }} fill={chosen ? "#ffffff" : col}>{n}</text>
      </g>
    </g>
  );
}

/* The land is drawn once and memoised. It only redraws when ground changes
   hands, so selecting, hovering and moving never touch four thousand cells. */
/* The map is drawn in two layers with very different lifetimes.

   StaticLand is the ground itself: terrain colour, terrain symbols, coastlines
   and the transparent cells that exist to be clicked. None of it ever changes
   after the world is built, so it is rendered exactly once. Keeping the ~8,500
   click targets in here is the whole point — React never reconciles them again.

   RealmLayer is everything that changes hands: who owns what, where the borders
   run, which ground is still unwalked, and what is standing on it. It draws as
   a handful of grouped paths rather than one node per province. */
/* How the ground is cut up for drawing. One path per terrain across the whole
   map was the obvious way to keep the node count down, and it is exactly wrong
   for rasterising: the browser draws a big element in tiles, and a path whose
   bounding box is the whole of Europe has to be walked in full for every
   single tile it touches. Eight and a half thousand hexes, ninety times over.

   Cutting the map into blocks means a tile only walks the blocks it actually
   overlaps. It costs more nodes — about a thousand instead of forty — but they
   are small, static, and never reconciled again. */
const BLOCK_C = 12, BLOCK_R = 16;
const BLOCK_COLS = Math.ceil(W / BLOCK_C);

const StaticLand = React.memo(function StaticLand({ provinces, cells }) {
  const blocks = useMemo(() => {
    const out = new Map();
    const at = (c, r) => {
      const k = Math.floor(r / BLOCK_R) * BLOCK_COLS + Math.floor(c / BLOCK_C);
      let b = out.get(k);
      if (!b) { b = { k, fills: {}, glyphs: {}, coast: "" }; out.set(k, b); }
      return b;
    };
    Object.values(provinces).forEach((p) => {
      const pts = cells[key(p.c, p.r)];
      if (!pts) return;
      const b = at(p.c, p.r);
      // The sun is on the ground, not on a lamp behind the screen: a lit face
      // warms towards daylight and a shadowed one falls towards the cold blue
      // the whole map is painted in, rather than both going grey.
      const sh = reliefAt(p.c, p.r);
      const fill = sh >= 0
        ? mix(TERRAIN[p.t].color, "#fff3d8", sh * 0.19)
        : mix(TERRAIN[p.t].color, "#0b1220", -sh * 0.27);
      b.fills[fill] = (b.fills[fill] || "") + "M" + pts.map((q) => q[0] + " " + q[1]).join("L") + "Z";

      const [cx, cy] = centreOf(p.c, p.r);
      const g = glyphFor(p.t, cx, cy, p.c, p.r);
      if (g) {
        const o = b.glyphs[p.t] || (b.glyphs[p.t] = { ink: "", fill: "", lit: "" });
        o.ink += g.ink; o.fill += g.fill; o.lit += g.lit;
      }

      for (let i = 0; i < 6; i++) {
        const [nc, nr] = edgeN(p.c, p.r, i);
        if (provinces[key(nc, nr)]) continue;
        const A = pts[i], B = pts[(i + 1) % 6];
        b.coast += `M${A[0]} ${A[1]}L${B[0]} ${B[1]}`;
      }
    });
    return [...out.values()];
  }, [provinces, cells]);

  const dCoast = useMemo(() => blocks.map((b) => b.coast).join(""), [blocks]);

  return (
    <>
      {/* The shelf. Three soft passes along the coastline, laid down before the
          land is: the half that falls inland is covered by the ground on top,
          so what is left is water shallowing as it comes ashore. Cartographers
          have drawn this band for four hundred years and it is most of why an
          old chart reads as water rather than as blue paper. */}
      <g fill="none" stroke="#63b6d8" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
        <path d={dCoast} strokeWidth="34" opacity="0.05" />
        <path d={dCoast} strokeWidth="17" opacity="0.07" />
        <path d={dCoast} strokeWidth="7" opacity="0.09" />
      </g>

      {/* No filter over this. A drop-shadow on the land forced the browser to
          render every hex on the continent into one offscreen buffer before it
          could composite anything — at full zoom that buffer is sixty-eight
          megapixels, and it defeats the block splitting above completely. The
          coastline below carries the same reading for nothing. */}
      {blocks.map((b) => (
        <g key={b.k}>
          {Object.entries(b.fills).map(([col, d]) => <path key={col} d={d} fill={col} />)}
          {/* Shadow, outline, lit edge — in that order, so a mark reads as a
              thing standing on the ground rather than a line drawn on it. */}
          {Object.entries(b.glyphs).map(([t, g]) => {
            const ink = inkFor(TERRAIN[t].color);
            return (
              <g key={t} strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
                {g.fill && <path d={g.fill} fill={ink} stroke="none" opacity="0.26" />}
                {g.ink && <path d={g.ink} fill="none" stroke={ink} strokeWidth="0.95" opacity="0.52" />}
                {g.lit && <path d={g.lit} fill="none" stroke="#fff2d8" strokeWidth="0.8"
                  opacity={t === "m" ? 0.12 : 0.2} />}
              </g>
            );
          })}
        </g>
      ))}
      <g fill="none" style={{ pointerEvents: "none" }}>
        <path d={dCoast} stroke="#08141b" strokeWidth="3.2" opacity="0.95" strokeLinejoin="round" />
        <path d={dCoast} stroke="#a8dcee" strokeWidth="0.65" opacity="0.42" strokeLinejoin="round" />
      </g>

    </>
  );
});

/* The names of the ground. These live OUTSIDE the scaled box, as plain
   positioned text over the map rather than SVG text inside it, and that is a
   performance decision as much as a typographic one: anything inside the
   composited zoom layer that changes forces the whole layer to repaint, and
   that layer runs to seven thousand pixels across. Twenty stroked SVG labels
   in there took sixteen zoom steps from 113ms of main-thread work to 655ms.
   Out here they cost nothing, and they hold one size on screen instead of
   swelling with the map — which is how an atlas behaves anyway.

   Drawn above the fog on purpose: you know the Horse Sea is out there long
   before you have put a warband on it. They fade out as you zoom in, because
   at tile-reading range a name three hexes wide is in the way of whatever is
   standing under it. */
const MapNames = React.memo(function MapNames({ zoom }) {
  const k = zoom <= 1.15 ? 1 : Math.max(0, 1 - (zoom - 1.15) / 0.7);
  if (k <= 0.02) return null;
  return (
    <div className="cc-mapnames">
      {MAP_NAMES.map((n) => {
        const [x, y] = centreOf(n.at[0], n.at[1]);
        const cls = n.sea ? "cc-nsea" : n.ice ? "cc-nice" : n.ridge ? "cc-nridge" : "cc-nland";
        return (
          <span key={n.name} className={`cc-mapname ${cls}`}
            style={{
              left: x * zoom, top: y * zoom,
              // Sized in map units like everything else, so a name covers the
              // same ground at every zoom — it just is not drawn inside the
              // layer that has to be re-rasterised when the ground is.
              fontSize: n.size * zoom, letterSpacing: n.size * 0.32 * zoom,
              opacity: (n.sea ? 0.66 : 0.72) * k,
              transform: `translate(-50%,-50%) rotate(${n.rot || 0}deg)`,
            }}>
            {n.name.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
});

const RealmLayer = React.memo(function RealmLayer({ provinces, cells, seen }) {
  const { tints, fogBands, dDim, dNat, dProv, dFeature, marks } = useMemo(() => {
    const byNat = {};
    const fog = {};
    let dim = "", dn = "", dp = "", df = "";
    const marks = [];
    Object.values(provinces).forEach((p) => {
      const pts = cells[key(p.c, p.r)];
      if (!pts) return;
      const seg = "M" + pts.map((q) => q[0] + " " + q[1]).join("L") + "Z";
      /* Ground outside your sight keeps its shape and its relief and nothing
         else: no colour, no symbol, no sign of what it is worth. Survivors of a
         collapse would know the lie of the land — the old roads, the ranges,
         where the water stops — without knowing who is living on it now. Drawn
         opaque over the ground rather than as a veil across it, so nothing of
         the terrain beneath leaks through to be read. */
      const k0 = key(p.c, p.r);
      if (!seen.has(k0)) {
        // Bucketed by block as well as by band, for the same reason the ground
        // is: fog covers most of the map, and one path per band means every
        // raster tile walks the whole continent.
        const blk = Math.floor(p.r / BLOCK_R) * BLOCK_COLS + Math.floor(p.c / BLOCK_C);
        const band = reliefAt(p.c, p.r);
        const o = fog[blk] || (fog[blk] = {});
        o[band] = (o[band] || "") + seg;
        return;
      }
      if (p.owner) byNat[p.owner] = (byNat[p.owner] || "") + seg;
      else if (!p.explored) dim += seg;

      // Borders only exist around held ground, so wilderness is skipped entirely
      // rather than having all six of its edges tested every winter.
      if (p.owner) {
        const k = key(p.c, p.r);
        for (let i = 0; i < 6; i++) {
          const [nc, nr] = edgeN(p.c, p.r, i);
          const q = provinces[key(nc, nr)];
          if (!q) continue;
          const A = pts[i], B = pts[(i + 1) % 6];
          const line = `M${A[0]} ${A[1]}L${B[0]} ${B[1]}`;
          if (q.owner !== p.owner) dn += line;
          else if (key(nc, nr) > k) dp += line;
        }
      }
      if (p.feature) {
        const [cx, cy] = centreOf(p.c, p.r);
        df += `M${cx} ${cy - 4}L${cx + 4} ${cy}L${cx} ${cy + 4}L${cx - 4} ${cy}Z`;
      }
      if (buildsOf(p).length || p.capital) marks.push(p);
    });
    return { tints: Object.entries(byNat), fogBands: Object.entries(fog), dDim: dim,
             dNat: dn, dProv: dp, dFeature: df, marks };
  }, [provinces, cells, seen]);

  return (
    <g style={{ pointerEvents: "none" }}>
      {fogBands.map(([blk, bands]) => (
        <g key={blk}>
          {Object.entries(bands).map(([b, d]) => {
            const sh = +b;
            return <path key={b} d={d} fill={sh >= 0
              ? mix("#16242f", "#4a6d80", sh * 0.66)
              : mix("#16242f", "#05090d", -sh * 0.8)} />;
          })}
        </g>
      ))}
      <path d={dDim} fill="#101820" opacity="0.16" />
      {tints.map(([nat, d]) => (
        <path key={nat} d={d} data-nat={nat} fill={FACTION[nat].color} opacity="0.46" />
      ))}
      <g fill="none">
        <path d={dProv} stroke="#0a1216" strokeWidth="0.55" opacity="0.35" />
        <path d={dNat} stroke="#070d11" strokeWidth="2.8" opacity="0.9" strokeLinejoin="round" />
        <path d={dNat} stroke="#dceaf1" strokeWidth="0.8" opacity="0.45" strokeLinejoin="round" />
      </g>
      <path d={dFeature} fill="#f2c97a" opacity="0.9" stroke="#0a1015" strokeWidth="0.9" />
      {marks.map((p) => {
        const [cx, cy] = centreOf(p.c, p.r);
        const col = p.owner ? FACTION[p.owner].color : "#f0e2b8";
        return (
          <g key={"M" + p.c + "_" + p.r}>
            {/* Up to three worksites on one hex. Any more than one and they all
                shrink and spread along the bottom of the tile, because three
                full-size marks stacked on a 16px hex bury the ground under
                them and you can no longer see what you are standing on.

                A seat is tighter again: the crest wants the middle of the hex
                and so did the worksites, so a yard at a capital was drawn half
                behind the ring and half over the tile edge. They are stacked
                instead — crest in the upper half, works in a row along the
                bottom — and the rank pips move inside the crest, which is
                where a rank belongs anyway. */}
            {(() => {
              /* A district can hold six, and six marks will not go on a hex
                 thirty pixels across without burying the ground they stand on.
                 Three are drawn and the rest are counted — the district screen
                 is where you look at a city properly. The three are the ones
                 still being worked on and the wrecked ones first, because those
                 are the ones you might do something about from here. */
              const all = buildsOf(p);
              const seat = !!p.capital;
              const order = all.slice().sort((a, b) =>
                (b.damaged ? 2 : 0) + (b.left ? 1 : 0) - ((a.damaged ? 2 : 0) + (a.left ? 1 : 0)));
              const shown = order.slice(0, 3);
              const rest = all.length - shown.length;
              const y = seat ? cy + 8 : cy + (shown.length > 1 ? 3 : 0);
              const step = seat ? 8 : 9.5;
              return (
                <>
                  {shown.map((bld, i) => (
                    <BuildingMark key={bld.id + i} b={bld.id} left={bld.left} damaged={bld.damaged}
                      small={seat || shown.length > 1} tiny={shown.length > 2 || (seat && shown.length > 1)}
                      x={cx + (shown.length > 1 ? (i - (shown.length - 1) / 2) * step : 0)}
                      y={y} />
                  ))}
                  {rest > 0 && (
                    <g transform={`translate(${cx + ((shown.length - 1) / 2) * step + 9.5},${y - 4.5})`}>
                      <rect x="-4.2" y="-3.3" width="8.4" height="6.6" rx="1.8"
                        fill="#0a1015" stroke={col} strokeWidth="0.75" opacity="0.95" />
                      <text x="0" y="2.1" textAnchor="middle" className="cc-morebuilds" fill={col}>
                        +{rest}
                      </text>
                    </g>
                  )}
                </>
              );
            })()}
            {p.capital && (
              <g>
                <circle cx={cx} cy={cy - 5.5} r="8.4" fill="#0a1015" stroke={col} strokeWidth="1.7" />
                {Array.from({ length: seatTier(p) }, (_, i) => (
                  <circle key={i} cx={cx - 4 + i * 4} cy={cy + 0.6} r="1.15" fill={col} />
                ))}
                <g transform={`translate(${cx - 5.4},${cy - 11.4}) scale(0.45)`} stroke={col}
                  strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <SigilMarks id={p.owner} />
                </g>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
});

/* The ground never changes after the world is built, so it lives in its own
   <svg> beneath the rest. The browser rasterises it once; turns and selections
   repaint only the thin layer above, which is what stopped the stutter. */
const BaseMap = React.memo(function BaseMap({ w, h, provinces, cells }) {
  return (
    <svg className="cc-worldmap cc-basemap" width={w} height={h}
      viewBox={`0 0 ${MAPW} ${MAPH}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="basesea" cx="42%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#1a3a49" />
          <stop offset="55%" stopColor="#122b37" />
          <stop offset="100%" stopColor="#0b1e29" />
        </radialGradient>
        <pattern id="baseswell" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 13q6.5 -4 13 0t13 0" fill="none" stroke="#4e7d95" strokeWidth="0.7" opacity="0.16" />
        </pattern>
        {/* Paper. Specks too small to read as marks, enough to stop every fill
            being a flat slab of one colour. Two patterns rather than one, and
            their sizes are coprime (23 and 17), because a single tile shows its
            grid the moment you zoom in — which is exactly what the first
            attempt at this did, polka dots across the whole continent. */}
        <pattern id="basegrain" width="23" height="23" patternUnits="userSpaceOnUse">
          <path d="M2.4 3.1h.01M8.7 1.4h.01M15.2 4.8h.01M20.6 2.3h.01M5.1 9.6h.01M12.8 8.2h.01
                   M18.4 11.7h.01M3.3 15.4h.01M9.9 18.1h.01M16.6 16.3h.01M21.2 19.8h.01M6.7 21.4h.01"
            stroke="#000000" strokeWidth="0.7" strokeLinecap="round" opacity="0.26" />
        </pattern>
        <pattern id="basegrain2" width="17" height="17" patternUnits="userSpaceOnUse">
          <path d="M1.8 6.2h.01M7.4 2.9h.01M13.6 7.8h.01M4.9 12.7h.01M11.2 14.3h.01M15.8 11.1h.01"
            stroke="#ffffff" strokeWidth="0.65" strokeLinecap="round" opacity="0.15" />
        </pattern>
        {/* Latitude. The north of this map is ice and the south is dust, and a
            wash from one to the other ties eight thousand separate tiles into
            one continent — the thing a coloured grid never does on its own. */}
        <linearGradient id="baselat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8ecbe8" stopOpacity="0.11" />
          <stop offset="42%" stopColor="#8ecbe8" stopOpacity="0.02" />
          <stop offset="68%" stopColor="#e8b578" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#e8a05a" stopOpacity="0.11" />
        </linearGradient>
      </defs>
      <rect width={MAPW} height={MAPH} fill="url(#basesea)" />
      <rect width={MAPW} height={MAPH} fill="url(#baseswell)" style={{ pointerEvents: "none" }} />
      <g stroke="#8fd0e6" strokeWidth="0.5" opacity="0.06" style={{ pointerEvents: "none" }}>
        {Array.from({ length: Math.ceil(MAPW / 90) }, (_, i) => (
          <line key={"v" + i} x1={i * 90} y1="0" x2={i * 90} y2={MAPH} />
        ))}
        {Array.from({ length: Math.ceil(MAPH / 90) }, (_, i) => (
          <line key={"h" + i} x1="0" y1={i * 90} x2={MAPW} y2={i * 90} />
        ))}
      </g>
      <StaticLand provinces={provinces} cells={cells} />
      <rect width={MAPW} height={MAPH} fill="url(#basegrain)" style={{ pointerEvents: "none" }} />
      <rect width={MAPW} height={MAPH} fill="url(#basegrain2)" style={{ pointerEvents: "none" }} />
      <rect width={MAPW} height={MAPH} fill="url(#baselat)" style={{ pointerEvents: "none" }} />
    </svg>
  );
});

function WorldMap({ game, P, sight, onSelect, atWar, onDeselect, onFocused }) {
  const [zoom, setZoom] = useState(0.8);
  // What scale the maps are actually DRAWN at, as opposed to what scale they
  // are being shown at. See the note on the settle below.
  const [crisp, setCrisp] = useState(0.8);
  const scroll = useRef(null);
  const drag = useRef(null);
  const moved = useRef(false);
  const centred = useRef(false);
  const zoomRef = useRef(0.8);
  const pendingZoom = useRef(null);
  const zoomRaf = useRef(null);

  // The ground itself is fixed at world build. Holding the first snapshot keeps
  // the static layer's props identical for the rest of the game, so it renders
  // once and is never reconciled again.
  const staticRef = useRef(null);
  if (!staticRef.current) staticRef.current = game.provinces;
  const staticProvinces = staticRef.current;

  const cells = useMemo(() => {
    const o = {};
    Object.values(game.provinces).forEach((p) => { o[key(p.c, p.r)] = cellPts(p.c, p.r); });
    return o;
  }, []);


  // Where each name wants to sit. Actual placement happens below, once we know
  // where the warbands are standing.
  const placeLabels = useMemo(() => {
    const out = [];
    Object.values(game.provinces).forEach((p) => {
      const n = LANDMARKS[key(p.c, p.r)];
      if (!n) return;
      const [x, y] = centreOf(p.c, p.r);
      const seat = !!p.capital;
      out.push({
        k: key(p.c, p.r), n, x, cy: y, seat,
        // A seat with worksites on it needs its name further out again: the
        // crest is in the top half and the works are along the bottom, and the
        // name was printing straight over them.
        works: buildsOf(p).length > 0,
        col: p.owner ? FACTION[p.owner].color : "#f0e2b8",
        w: n.length * (seat ? 5.3 : 4.2),
      });
    });
    // Seats are placed before anything else so a capital never loses its slot
    // to an ordinary ruin next door.
    out.sort((a, b) => (a.seat === b.seat ? 0 : a.seat ? -1 : 1));
    return out;
  }, [game.provinces]);

  const labels = useMemo(() => {
    const out = [];
    NATION_IDS.forEach((id) => {
      const mine = Object.values(game.provinces).filter((p) => p.owner === id);
      if (mine.length < 12) return;
      let sx = 0, sy = 0;
      mine.forEach((p) => { const [x, y] = centreOf(p.c, p.r); sx += x; sy += y; });
      sx /= mine.length; sy /= mine.length;
      let best = mine[0], bd = Infinity;
      mine.forEach((p) => {
        const [x, y] = centreOf(p.c, p.r);
        const d = (x - sx) ** 2 + (y - sy) ** 2;
        if (d < bd) { bd = d; best = p; }
      });
      const [x, y] = centreOf(best.c, best.r);
      out.push({ id, k: key(best.c, best.r), x, y: y - 17, name: NATIONS[id].short, col: NATIONS[id].color,
        w: NATIONS[id].short.length * 6.6 });
    });
    return out;
  }, [game.provinces]);

  const selRef = useRef(onSelect);
  const deselRef = useRef(onDeselect);
  const provRef = useRef(game.provinces);
  // The debug hooks below are installed once, so they must not close over the
  // turn they were installed on.
  const gameRef = useRef(game);
  gameRef.current = game;
  selRef.current = onSelect;
  // With the per-province click targets gone there is nothing in the document
  // to address a hex by, so expose one hook for tests to drive selection.
  useEffect(() => {
    if (typeof window !== "undefined") window.__ccPick = (c, r) => selRef.current(c, r);
    if (typeof window !== "undefined") window.__ccHeard = () => Sound.heard();
    /* For the smoke test: how much of the wild is actually holding something.
       There is no way to check the spawn rate by playing — you would have to
       walk into every wood on the continent. */
    /* For the smoke test and for probes: enough of the position to check a
       rule without playing forty seasons by hand. */
    if (typeof window !== "undefined") window.__ccSiege = () => {
      const game = gameRef.current;
      const walled = Object.values(game.provinces).filter((p) => p.owner && isWalled(p));
      return {
        walled: walled.length,
        besieged: walled.filter((p) => p.siege).map((p) => ({
          name: p.name, by: p.siege.by, seasons: p.siege.seasons, at: key(p.c, p.r),
        })),
        mine: game.armies.filter((a) => a.owner === game.player).map((a) => `${a.c},${a.r}:${a.units.length}`),
        // What a storm would find at each stage of a siege. Read-only: it asks
        // the same helpers the battle does, without touching the position.
        storm: [0, 1, 2, 3].map((n) => SECTORS
          .map((sec) => stormGround({ siege: { seasons: n * SIEGE.perBreach } })[sec]).join("/")),
      };
    };
    /* What the selected warband would eat standing at home, so a test can
       check it is really being charged more for standing somewhere else. */
    if (typeof window !== "undefined") window.__ccSupply = () => {
      const game = gameRef.current;
      const a = game.armies.find((x) => x.id === game.sel?.armyId)
        || game.armies.find((x) => x.owner === game.player);
      if (!a) return null;
      const sup = supplyOf(game.provinces, game.nations[a.owner], a.owner, a);
      return {
        base: a.units.reduce((n, u) => n + unitStats(u).food, 0),
        raw: sup.raw, d: sup.d, draw: sup.band.draw, band: sup.band.name,
      };
    };
    if (typeof window !== "undefined") window.__ccWild = () => {
      const game = gameRef.current;
      const all = Object.values(game.provinces);
      const woods = all.filter((p) => p.t === "f" && !p.owner);
      return {
        woods: woods.length,
        herds: woods.filter((p) => p.lair === "herd").length,
        mobs: game.armies.filter((a) => a.mob).length,
      };
    };
  }, []);

  // The wheel writes zoomRef itself mid-gesture; this keeps it true for every
  // other route to a new zoom (the buttons, Q and E, jumping to the seat).
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  /* Scaling a layer stretches the pixels it already had, which is what makes a
     gesture cheap and what left the map soft and blocky once you stopped —
     zoomed to 2x you were looking at a 1x drawing blown up. So the transform
     carries the gesture, and a moment after it stops the maps are given their
     true size and redrawn from the vectors, sharp at whatever scale you landed
     on. The expensive redraw happens once, on a map that is standing still,
     instead of on every notch of the wheel. */
  useEffect(() => {
    if (crisp === Math.min(zoom, 2)) return;
    // Capped, because the drawn size is what the browser has to rasterise:
    // at 2.4 the map is sixty-eight megapixels, at 2.0 it is forty-seven. Past
    // the cap the last stretch is 1.2x, which is not something you can see —
    // unlike the 2.4x stretch that made this look pixelly in the first place.
    const t = setTimeout(() => setCrisp(Math.min(zoom, 2)), 170);
    return () => clearTimeout(t);
  }, [zoom, crisp]);

  const pick = useCallback((c, r) => { if (!moved.current) selRef.current(c, r); }, []);

  // A click anywhere on the map is resolved to a hex arithmetically, measured
  // against the base layer so zoom and scroll are both accounted for.
  const pickAt = useCallback((e) => {
    if (moved.current) return;
    const base = e.currentTarget.querySelector(".cc-basemap");
    if (!base) return;
    const box = base.getBoundingClientRect();
    const z = box.width / MAPW;
    const hit = hexAt((e.clientX - box.left) / z, (e.clientY - box.top) / z);
    if (hit && provRef.current[key(hit[0], hit[1])]) selRef.current(hit[0], hit[1]);
    else if (deselRef.current) deselRef.current();
  }, []);

  const centreOn = useCallback((c, r, z) => {
    const el = scroll.current;
    if (!el) return;
    const [x, y] = centreOf(c, r);
    el.scrollLeft = x * (z ?? zoomRef.current) - el.clientWidth / 2;
    el.scrollTop = y * (z ?? zoomRef.current) - el.clientHeight / 2;
  }, []);

  useEffect(() => {
    if (!game.focus) return;
    const p = game.provinces[game.focus];
    if (p) centreOn(p.c, p.r);
    onFocused();
  }, [game.focus, game.provinces, centreOn, onFocused]);

  useEffect(() => {
    if (centred.current) return;
    const seat = Object.values(game.provinces).find((p) => p.capital && p.seat === P);
    if (seat) { centreOn(seat.c, seat.r); centred.current = true; }
  }, [game.provinces, P, centreOn]);

  useEffect(() => {
    const el = scroll.current;
    if (!el) return;
    /* A trackpad pinch fires dozens of wheel events a second and a mouse wheel
       is not much kinder. Each one used to be its own React render of the whole
       map. The zoom is tracked in a ref and folded into state once per frame
       instead, so a fast gesture costs one render rather than twenty, and the
       scroll correction still happens on the frame the new scale lands. */
    const onWheel = (e) => {
      e.preventDefault();                 // also claims trackpad pinch (ctrlKey)
      const z0 = zoomRef.current;
      const rate = e.ctrlKey ? 1.04 : 1.12;   // pinch sends many small deltas
      const z = clamp(+(z0 * (e.deltaY < 0 ? rate : 1 / rate)).toFixed(3), 0.3, 2.4);
      if (z === z0) return;
      const box = el.getBoundingClientRect();
      const px = e.clientX - box.left, py = e.clientY - box.top;
      const wx = (el.scrollLeft + px) / z0, wy = (el.scrollTop + py) / z0;
      zoomRef.current = z;                // later events in this gesture build on it
      pendingZoom.current = { z, wx, wy, px, py };
      if (zoomRaf.current == null) {
        zoomRaf.current = requestAnimationFrame(() => {
          zoomRaf.current = null;
          const q = pendingZoom.current;
          if (!q) return;
          setZoom(q.z);
          el.scrollLeft = q.wx * q.z - q.px;
          el.scrollTop = q.wy * q.z - q.py;
        });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // WASD / arrows pan, Q and E zoom. Held keys run off one animation frame loop
  // so panning is smooth rather than stepped.
  useEffect(() => {
    const held = new Set();
    let raf = null;
    const PAN = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
    const step = () => {
      const el = scroll.current;
      if (!el || held.size === 0) { raf = null; return; }
      const fast = held.has("shift") ? 2.6 : 1;
      const v = 17 * fast;
      if (held.has("a") || held.has("arrowleft")) el.scrollLeft -= v;
      if (held.has("d") || held.has("arrowright")) el.scrollLeft += v;
      if (held.has("w") || held.has("arrowup")) el.scrollTop -= v;
      if (held.has("s") || held.has("arrowdown")) el.scrollTop += v;
      raf = requestAnimationFrame(step);
    };
    const typing = (t) => t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    const down = (e) => {
      if (e.metaKey || e.altKey || typing(e.target)) return;
      const k = e.key.toLowerCase();
      if (e.shiftKey) held.add("shift");
      if (PAN.includes(k)) {
        e.preventDefault();
        held.add(k);
        if (!raf) raf = requestAnimationFrame(step);
      } else if (k === "q" || k === "-") { e.preventDefault(); nudgeZoom(-0.2); }
      else if (k === "e" || k === "+" || k === "=") { e.preventDefault(); nudgeZoom(0.2); }
    };
    const up = (e) => { held.delete(e.key.toLowerCase()); if (!e.shiftKey) held.delete("shift"); };
    const clear = () => { held.clear(); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const onDown = (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    const el = scroll.current;
    drag.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
    moved.current = false;
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved.current = true;
    scroll.current.scrollLeft = drag.current.sl - dx;
    scroll.current.scrollTop = drag.current.st - dy;
  };
  const onUp = () => { drag.current = null; };

  const nudgeZoom = useCallback((d) => {
    const el = scroll.current;
    if (!el) return;
    const z0 = zoomRef.current;
    const z = clamp(+(z0 + d).toFixed(2), 0.3, 2.4);
    if (z === z0) return;
    const cx = (el.scrollLeft + el.clientWidth / 2) / z0;
    const cy = (el.scrollTop + el.clientHeight / 2) / z0;
    setZoom(z);
    requestAnimationFrame(() => {
      el.scrollLeft = cx * z - el.clientWidth / 2;
      el.scrollTop = cy * z - el.clientHeight / 2;
    });
  }, []);

  const armyAt = {};
  const stackAt = {};
  game.armies.forEach((a) => {
    const k = key(a.c, a.r);
    armyAt[k] = a;
    stackAt[k] = (stackAt[k] || 0) + 1;
  });

  // Warband markers are positioned by hand rather than by React, so a move can
  // be walked along its actual route instead of sliding straight there.
  const nodes = useRef({});
  const anim = useRef({});
  const seen = useRef({});
  const raf = useRef(null);

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

    game.armies.forEach((a) => {
      const at = key(a.c, a.r);
      const was = seen.current[a.id];
      if (was && was.at !== at && !reduce) {
        const pts = (a.route && a.route.length > 1 ? a.route : [was.cr, [a.c, a.r]])
          .map(([c, r]) => centreOf(c, r));
        let len = 0;
        for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        anim.current[a.id] = { pts, len, t0: now(), dur: Math.min(6000, 780 * (pts.length - 1)) };
      }
      seen.current[a.id] = { at, cr: [a.c, a.r] };
    });
    Object.keys(seen.current).forEach((id) => {
      if (!game.armies.some((a) => a.id === id)) { delete seen.current[id]; delete anim.current[id]; }
    });

    const place = () => {
      const t = now();
      let busy = false;
      game.armies.forEach((a) => {
        const el = nodes.current[a.id];
        if (!el) return;
        const m = anim.current[a.id];
        let x, y, bob = 0;
        if (m) {
          const k = (t - m.t0) / m.dur;
          if (k >= 1) { delete anim.current[a.id]; [x, y] = centreOf(a.c, a.r); }
          else {
            busy = true;
            // walk the polyline at a steady pace
            let want = k * m.len, i = 1, acc = 0;
            for (; i < m.pts.length; i++) {
              const seg = Math.hypot(m.pts[i][0] - m.pts[i - 1][0], m.pts[i][1] - m.pts[i - 1][1]);
              if (acc + seg >= want || i === m.pts.length - 1) {
                const f = seg ? (want - acc) / seg : 1;
                x = m.pts[i - 1][0] + (m.pts[i][0] - m.pts[i - 1][0]) * clamp(f, 0, 1);
                y = m.pts[i - 1][1] + (m.pts[i][1] - m.pts[i - 1][1]) * clamp(f, 0, 1);
                break;
              }
              acc += seg;
            }
            bob = Math.sin((t - m.t0) / 150) * 1.1;     // a walking step
          }
        }
        if (x === undefined) [x, y] = centreOf(a.c, a.r);
        el.style.transform = `translate(${x}px,${(y + bob).toFixed(2)}px)`;
      });
      raf.current = busy ? requestAnimationFrame(place) : null;
    };
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(place);
    return () => { if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null; } };
  }, [game.armies]);
  const armySpots = useMemo(() => game.armies.map((a) => centreOf(a.c, a.r)), [game.armies]);
  // Try below the hex first, then above, then further out. A name is only
  // dropped if every slot is taken — it never prints under a marker.
  const shownLabels = useMemo(() => {
    const out = [];
    const onArmy = (x, y, w) => armySpots.some(([ax, ay]) =>
      Math.abs(ax - x) < w / 2 + 10 && Math.abs(ay - y) < 13);
    // Realm banners are placed already, so every other name works around them.
    const onLabel = (x, y, w) => [...labels, ...out].some((q) =>
      Math.abs(q.y - y) < 12 && Math.abs(q.x - x) < (q.w + w) / 2 + 6);
    placeLabels.forEach((l) => {
      // A seat carries a crest, so its name starts further out.
      const slots = l.seat
        ? (l.works ? [29, -30, 39, -40, 49, -50] : [22, -23, 32, -33, 42, -43])
        : [14, -15, 26, -27, 38, -39];
      for (const dy of slots) {
        const y = l.cy + dy;
        if (!onArmy(l.x, y, l.w) && !onLabel(l.x, y, l.w)) { out.push({ ...l, y }); return; }
      }
      // A capital is never dropped; it takes the first slot regardless.
      if (l.seat) out.push({ ...l, y: l.cy + (l.works ? 29 : 22) });
    });
    return out;
  }, [placeLabels, armySpots, labels]);
  /* Which of your own columns are past the end of their supply line. The
     panel says it in words when you select one; this is so you can see at a
     glance which of four warbands is the one quietly dying. */
  const outOfSupply = useMemo(() => {
    const out = {};
    game.armies.forEach((a) => {
      if (a.owner !== P) return;
      const d = supplyOf(game.provinces, game.nations[P], P, a).d;
      if (d >= 3) out[a.id] = d;
    });
    return out;
  }, [game.armies, game.provinces, game.nations, P]);

  const selArmy = game.sel?.armyId ? game.armies.find((a) => a.id === game.sel.armyId) : null;
  const targets = new Set();
  if (selArmy && selArmy.owner === P && selArmy.mp > 0) {
    neighbours(selArmy.c, selArmy.r).forEach(([c, r]) => {
      const p = game.provinces[key(c, r)];
      if (p && TERRAIN[p.t].move <= selArmy.mp) targets.add(key(c, r));
    });
  }
  const seat = Object.values(game.provinces).find((p) => p.capital && p.seat === P);

  return (
    <div className="absolute inset-0">
      <div ref={scroll} className="absolute inset-0 overflow-auto thin cc-mapscroll"
        onClick={pickAt}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
        <div className="cc-mapstack" style={{ width: MAPW * zoom, height: MAPH * zoom }}>
        {/* Mid-gesture the zoom is a transform on this box rather than a new
            width on the maps underneath it. Resizing the SVGs makes the browser
            re-rasterise eight and a half thousand hexes, their filters and
            their labels; doing that on every wheel notch is what made zooming
            drag. A transform is composited instead, and BaseMap's props stop
            changing so React skips it entirely. The ratio is zoom over crisp,
            so the moment the settle above catches up this is scale(1) and the
            maps are drawn at their true size. */}
        <div className="cc-mapzoom"
          style={{ width: MAPW * crisp, height: MAPH * crisp, transform: `scale(${zoom / crisp})` }}>
        <BaseMap w={MAPW * crisp} h={MAPH * crisp} provinces={staticProvinces} cells={cells} />
        <svg viewBox={`0 0 ${MAPW} ${MAPH}`} className="cc-worldmap cc-overmap"
          style={{ width: MAPW * crisp, height: MAPH * crisp }}
          role="img" aria-label="Map of post-Collapse Europe">
          <defs>
            <radialGradient id="sea" cx="42%" cy="28%" r="90%">
              <stop offset="0%" stopColor="#1b3040" />
              <stop offset="60%" stopColor="#14212c" />
              <stop offset="100%" stopColor="#0d161d" />
            </radialGradient>
            <radialGradient id="vignette" cx="50%" cy="45%" r="78%">
              <stop offset="55%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
            </radialGradient>
            <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
            <filter id="pick" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <pattern id="swell" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M0 13q6.5 -4 13 0t13 0" fill="none" stroke="#4e7d95" strokeWidth="0.7" opacity="0.16" />
            </pattern>
            {/* Timber and stone standing, cold slate while it is still a site,
                and scorched where something has been at it. */}
            <linearGradient id="bldwarm" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0%" stopColor="#f2d9ab" />
              <stop offset="55%" stopColor="#d8ba8c" />
              <stop offset="100%" stopColor="#9d7a53" />
            </linearGradient>
            <linearGradient id="bldsite" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0%" stopColor="#a8bfcd" />
              <stop offset="100%" stopColor="#5f7889" />
            </linearGradient>
            <linearGradient id="bldhurt" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0%" stopColor="#c69884" />
              <stop offset="100%" stopColor="#7d5245" />
            </linearGradient>
          </defs>

          <RealmLayer provinces={game.provinces} cells={cells} seen={sight} />

          <g style={{ pointerEvents: "none" }}>
            {[...targets].map((k) => {
              const p = game.provinces[k];
              const [tx, ty] = centreOf(p.c, p.r);
              const [ax, ay] = centreOf(selArmy.c, selArmy.r);
              const ang = (Math.atan2(ty - ay, tx - ax) * 180) / Math.PI;
              return (
                <g key={"t" + k}>
                  <polygon points={ptsStr(cells[k])} fill="#8fe3d6" opacity="0.17" />
                  <polygon points={ptsStr(cells[k])} fill="none" stroke="#8fe3d6" strokeWidth="1.8"
                    strokeDasharray="5 4" className="cc-ants" opacity="0.95" />
                  <g transform={`translate(${tx},${ty}) rotate(${ang})`} opacity="0.9">
                    <path d="M-3.5 -4.5L1 0L-3.5 4.5" fill="none" stroke="#c9f5ec" strokeWidth="1.9"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </g>
              );
            })}
            {game.sel?.k && cells[game.sel.k] && (
              <polygon points={ptsStr(cells[game.sel.k])} fill="none" stroke="#ffffff"
                strokeWidth="2.4" className="cc-ants" strokeDasharray="7 5" opacity="0.95" />
            )}
          </g>

          {/* Names live above the land but below the warbands, and any name a
              warband is standing on is dropped rather than printed under it. */}
          <g style={{ pointerEvents: "none" }}>
            {shownLabels.filter((l) => sight.has(l.k)).map((l) => (
              <g key={l.k}>
                <rect x={l.x - l.w / 2 - (l.seat ? 5 : 3)} y={l.y - (l.seat ? 9.4 : 7.6)}
                  width={l.w + (l.seat ? 10 : 6)} height={l.seat ? 13 : 10.4} rx={l.seat ? 3 : 2.5}
                  fill="#040a0f" opacity={l.seat ? 0.85 : 0.72}
                  stroke={l.seat ? mix(l.col, "#040a0f", 0.25) : "#2b3d47"}
                  strokeWidth={l.seat ? 0.9 : 0.4} />
                <text x={l.x} y={l.y} textAnchor="middle"
                  className={l.seat ? "cc-seatlabel" : "cc-placelabel"}
                  fill={l.seat ? mix(l.col, "#ffffff", 0.72) : "#f2f8fb"}
                  stroke="#040a0f" strokeWidth={l.seat ? 1.8 : 1.4} paintOrder="stroke">{l.n}</text>
              </g>
            ))}
            {labels.filter((l) => sight.has(l.k)).map((l) => (
              <text key={l.id} x={l.x} y={l.y} textAnchor="middle" className="cc-maplabel"
                fill={mix(l.col, "#ffffff", 0.55)} stroke="#050c11" strokeWidth="3"
                paintOrder="stroke" opacity="0.92">{l.name}</text>
            ))}
          </g>

          <g style={{ pointerEvents: "none" }}>
            {game.armies.filter((a) => a.owner === P || sight.has(key(a.c, a.r))).map((a) => {
              const [cx, cy] = centreOf(a.c, a.r);
              const col = FACTION[a.owner].color;
              const hostile = a.owner !== P && atWar(P, a.owner);
              const chosen = game.sel?.armyId === a.id;
              return (
                <g key={a.id} className="cc-banner"
                  ref={(el) => { if (el) nodes.current[a.id] = el; else delete nodes.current[a.id]; }}>
                  <g className={chosen ? "cc-picked" : "cc-unpicked"}>
                {stackAt[key(a.c, a.r)] > 1 && (
                  <g>
                    <circle cx="-3.2" cy="-3.2" r="8.6" fill="#0b1219" stroke={col}
                      strokeWidth="1" opacity="0.75" />
                    <circle cx="-6.4" cy="-6.4" r="8.6" fill="#0b1219" stroke={col}
                      strokeWidth="0.8" opacity="0.45" />
                  </g>
                )}
                    {/* Sized to the mark it is around. It used to be drawn for
                        a warband glyph half again as wide as the one there now. */}
                    {chosen && <circle className="cc-halo" r="8.6" fill="none" stroke={col} strokeWidth="1.8" />}
                    {chosen && <circle className="cc-ants" r="8.9" fill="none" stroke="#ffffff"
                      strokeWidth="1.1" strokeDasharray="3.6 3" opacity="0.95" />}
                    <WarbandMark col={col} n={a.units.length} hostile={hostile} chosen={chosen} kind={warbandKind(a)} />
                    {a.lord && (
                      <path d="M-4.4 -12.6l1.8 3 2.6 -3.6 2.6 3.6 1.8 -3 0.7 4.4h-10.2z"
                        fill="#f0e2b8" stroke="#0a1015" strokeWidth="0.6" />
                    )}
                    {outOfSupply[a.id] && (() => {
                      const warn = outOfSupply[a.id] >= 4 ? "#e08a6a" : "#e8b98a";
                      return (
                        <g transform="translate(9,-8.6)">
                          <circle r="4.4" fill="#170d09" stroke={warn} strokeWidth="1.1" />
                          <path d="M0 -2.3v2.4" stroke={warn} strokeWidth="1.3" strokeLinecap="round" />
                          <circle cy="1.9" r="0.75" fill={warn} />
                        </g>
                      );
                    })()}
                    {a.owner === P && chosen && (
                      <g>
                        {Array.from({ length: a.maxMp }, (_, i) => (
                          <circle key={i} cx={(i - (a.maxMp - 1) / 2) * 5} cy="12.6" r="1.6"
                            fill={i < a.mp ? "#8fe3d6" : "#2c3d47"} />
                        ))}
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </g>

          <rect width={MAPW} height={MAPH} fill="url(#vignette)" style={{ pointerEvents: "none" }} />

          <g transform={`translate(66,${MAPH - 78})`} style={{ pointerEvents: "none" }} opacity="0.45">
            <circle r="24" fill="none" stroke="#9fd4e6" strokeWidth="0.8" />
            <circle r="18" fill="none" stroke="#9fd4e6" strokeWidth="0.5" opacity="0.6" />
            <path d="M0 -22L4.5 0L0 22L-4.5 0Z" fill="#9fd4e6" opacity="0.35" stroke="#cfe8f2" strokeWidth="0.7" />
            <path d="M0 -22L4.5 0L0 0Z" fill="#e9f4f8" />
            <path d="M-22 0L0 -4.5L22 0L0 4.5Z" fill="none" stroke="#9fd4e6" strokeWidth="0.7" opacity="0.7" />
            <text y="-27" textAnchor="middle" className="cc-compass" fill="#cfe8f2">N</text>
          </g>
        </svg>
        </div>
        <MapNames zoom={zoom} />
        </div>
      </div>

      <div className="absolute flex items-center gap-1.5 cc-maptools">
        <button type="button" onClick={() => nudgeZoom(-0.2)} title="Zoom out (Q)"
          className="cc-zoombtn" aria-label="Zoom out">−</button>
        <span className="num cc-text-12px cc-text-c6d6de cc-w-42px text-center">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => nudgeZoom(0.2)} title="Zoom in (E)"
          className="cc-zoombtn" aria-label="Zoom in">+</button>
        {seat && (
          <button type="button" onClick={() => centreOn(seat.c, seat.r)}
            className="cc-zoombtn cc-w-auto px-2.5 cc-text-12px" title="Centre on your capital">Seat</button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------- SIDEBAR --------------------------------- */
function Sidebar({ game, P, nat, sight, selProv, selArmy, atWar, onBuild, onRecruitOpen, onWar, onDisband, onDeselect, onInvestigate, onClaim, onMarch, onSeat, onResearch, onOpenTree, onRepair, onTake, onMerge, onReinforce, onCommand, onCraft, onInvestPop, onRename, onSplit, onDistrict, onInvest, onLift }) {
  const [tab, setTab] = useState("here");
  // Only the two that are about what is in front of you. The realm-wide
  // screens moved to the top bar; six tabs did not fit this column.
  const tabs = [
    { id: "here", label: "Here" },
    { id: "log", label: "Log" },
  ];
  return (
    <>
      <div className="flex border-b cc-border-28363f shrink-0">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`cc-tabbtn ${tab === t.id ? "cc-text-e5eef3 cc-bg-152029 cc-tabon" : "cc-text-93a9b5 cc-hover-text-c3d5de"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto thin p-3.5">
        {tab === "here" && (
          <SelectionPanel game={game} P={P} sight={sight} selProv={selProv} selArmy={selArmy}
            onBuild={onBuild} onRecruitOpen={onRecruitOpen} onDisband={onDisband}
            onDeselect={onDeselect} onInvestigate={onInvestigate} onClaim={onClaim}
            onMarch={onMarch} atWar={atWar} onSeat={onSeat} onRepair={onRepair} onDistrict={onDistrict}
            onInvest={onInvest} onLift={onLift}
            onTake={onTake} onMerge={onMerge} onReinforce={onReinforce} onCommand={onCommand}
            onInvestPop={onInvestPop} onRename={onRename} onSplit={onSplit} />
        )}
        {tab === "log" && <LogPanel log={game.log} />}
      </div>
    </>
  );
}

const Row = ({ label, value, tint }) => (
  <div className="flex justify-between items-baseline cc-py-3px cc-text-13px">
    <span className="cc-text-a0b6c1">{label}</span>
    <span className="num" style={{ color: tint || "#ffffff" }}>{value}</span>
  </div>
);


/* What a step of a chain actually does, in words. Takes the step rather than
   the chain, so it reads a granary and a silt farm with the same code. */
function buildingEffect(step, bid) {
  const out = [];
  Object.entries(step?.yield || {}).forEach(([k, v]) => {
    const label = RES_META.find((r) => r.k === k)?.label.toLowerCase() || k;
    out.push(`+${v} ${label} every season`);
  });
  if (step?.def) out.push(`+${step.def}% to anyone defending here`);
  if (step?.hands) out.push(`${step.hands} pairs of hands at the arms`);
  if (step?.quality) out.push("what leaves is better than what a hut turns out");
  if (bid === "muster") out.push("lets you raise warbands here");
  return out;
}

/* ------------------------------ THE DISTRICT -------------------------------
   A named place is not a hex with a shed on it. It has a district: a row of
   slots that opens as more people live there, each holding one chain of
   building that can be taken up two levels and then forked once.

   The panel is deliberately one screen rather than a list in the sidebar. What
   a player wants here is to see the whole place at once — what is standing,
   what it is worth, what is still empty and what it would cost to fill — and
   that does not fit beside a map.
   ------------------------------------------------------------------------ */
function LevelPips({ lvl, col = "#8fe3d6" }) {
  return (
    <span className="inline-flex items-center align-middle" style={{ marginLeft: 5 }}>
      {[1, 2, 3].map((i) => (
        <span key={i} className="cc-pip" style={{ background: i <= lvl ? col : "#2a3a44" }} />
      ))}
    </span>
  );
}

function DistrictPanel({ game, P, prov, onClose, onBuild, onImprove, onRepair }) {
  const [pick, setPick] = useState(null);        // which empty slot is being filled
  const nat = game.nations[P];
  const builds = buildsOf(prov);
  const open = districtSlots(prov);
  const max = districtMax(prov);
  const rank = districtRank(prov.pop);
  const want = districtNeeds(prov);
  const shore = coastal(prov.c, prov.r);

  const canPut = (bid) => {
    const b = BUILDINGS[bid];
    if (builds.some((x) => x.id === bid)) return "already stands here";
    if (b.on && !b.on.includes(prov.t)) return `not on ${TERRAIN[prov.t].name.toLowerCase()}`;
    if (b.coast && !shore) return "wants a shore";
    if (!unlocked(nat, bid)) return "your scholars have not got to it";
    return null;
  };
  const price = (bid) => buildCost(BUILDINGS[bid].scrap, builds.length);

  return (
    <Overlay onClose={onClose}>
      <div className="cc-w-1060px cc-max-w-96vw cc-max-h-92vh rounded-lg border cc-border-31454f cc-bg-0d141a flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b cc-border-28363f flex items-center gap-3"
          style={{ background: "linear-gradient(90deg,#14202a,#0d141a)" }}>
          <Hammer size={18} className="cc-text-8fe3d6" />
          <div className="flex-1">
            <div className="disp cc-text-21px">{prov.name}</div>
            <div className="cc-text-12d5px cc-text-93a9b5">
              {prov.capital ? "your seat" : rank.name} · <span className="num">{prov.pop.toLocaleString()}</span> live here
              {" · "}<span className="num">{builds.length}</span> of <span className="num">{open}</span> slots taken
            </div>
          </div>
          <button type="button" onClick={onClose} className="cc-seatclose cc-static" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto thin p-5">
          <div className="grid gap-3 cc-districtgrid">
            {Array.from({ length: max }, (_, i) => {
              const b = builds[i];
              const locked = i >= open;
              if (locked) {
                return (
                  <div key={i} className="cc-slot cc-slotlocked">
                    <Lock size={18} className="cc-text-4d5f6b" />
                    <div className="cc-text-12px cc-text-6f8794 text-center mt-1.5 leading-snug">
                      {want ? `Room for this once ${want.at.toLocaleString()} people live here` : "Not yet"}
                    </div>
                  </div>
                );
              }
              if (!b) {
                return (
                  <button key={i} type="button" onClick={() => setPick(i)}
                    className={`cc-slot cc-slotempty ${pick === i ? "cc-slotpicking" : ""}`}>
                    <span className="cc-plus">+</span>
                    <div className="cc-text-12px cc-text-93a9b5 mt-1">Empty ground</div>
                  </button>
                );
              }
              const step = buildStep(b);
              const next = b.left || b.damaged ? [] : buildNext(b);
              return (
                <div key={i} className={`cc-slot ${b.damaged ? "cc-slothurt" : "cc-slotfull"}`}>
                  <div className="flex items-start gap-2">
                    <svg viewBox="-11 -12 22 20" width="30" height="27" className="shrink-0">
                      <g fill={b.left ? "#8ea6b4" : b.damaged ? "#c69884" : "#d8ba8c"}
                        stroke="#0a1015" strokeWidth="0.9" strokeLinejoin="round" strokeLinecap="round">
                        {BUILD_ART[b.id]}
                      </g>
                    </svg>
                    <div className="min-w-0 flex-1">
                      <div className="cc-text-13d5px cc-text-e5eef3 leading-tight">
                        {step.name}<LevelPips lvl={b.becomes ? b.becomes.lvl : (b.lvl || 1)} />
                      </div>
                      <div className="cc-text-11d5px cc-text-8399a6">
                        {b.left ? `${b.left} season${b.left === 1 ? "" : "s"} of work left`
                          : b.damaged ? "wrecked — working at half"
                          : buildingEffect(step, b.id).join(" · ") || "no yield of its own"}
                      </div>
                    </div>
                  </div>
                  {b.damaged && !b.left && (
                    <button type="button" onClick={() => onRepair(key(prov.c, prov.r))}
                      className="cc-slotbtn cc-slotfix mt-2">
                      Put it back in order — <span className="num">{Math.ceil(step.scrap / 2)}</span> scrap
                    </button>
                  )}
                  {next.map((o) => {
                    const poor = nat.res.scrap < o.scrap;
                    return (
                      <button key={o.lvl + (o.id || "")} type="button" disabled={poor}
                        onClick={() => onImprove(key(prov.c, prov.r), i, { lvl: o.lvl, fork: o.lvl === 3 ? o.id : undefined })}
                        className={`cc-slotbtn mt-2 ${poor ? "cc-slotpoor" : "cc-slotup"}`}>
                        <div className="flex items-baseline gap-2">
                          <span className="flex-1 text-left">{o.name}</span>
                          <span className="num cc-text-11d5px">{o.scrap} scrap · {o.turns}w</span>
                        </div>
                        <div className="cc-text-11d5px cc-text-8399a6 text-left leading-snug mt-0.5">
                          {buildingEffect(o, b.id).join(" · ")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {pick != null && (
            <div className="mt-5 pt-4 border-t cc-border-28363f">
              <div className="disp cc-text-15px cc-text-e5eef3 mb-1">Raise something on the empty ground</div>
              <div className="cc-text-12d5px cc-text-93a9b5 mb-3">
                Each one after the first costs more — the ground, the timber and the hands are
                already spoken for.
              </div>
              <div className="grid gap-2 cc-districtlist">
                {Object.keys(BUILDINGS).map((bid) => {
                  const why = canPut(bid);
                  const b = BUILDINGS[bid];
                  const cost = price(bid);
                  const poor = nat.res.scrap < cost;
                  return (
                    <button key={bid} type="button" disabled={!!why || poor}
                      onClick={() => { onBuild(key(prov.c, prov.r), bid); setPick(null); }}
                      className={`cc-pickcard ${why || poor ? "cc-pickoff" : ""}`}>
                      <div className="flex items-center gap-2">
                        <svg viewBox="-11 -12 22 20" width="26" height="24" className="shrink-0">
                          <g fill={why || poor ? "#5f7889" : "#d8ba8c"} stroke="#0a1015" strokeWidth="0.9"
                            strokeLinejoin="round" strokeLinecap="round">{BUILD_ART[bid]}</g>
                        </svg>
                        <span className="cc-text-13px flex-1 text-left">{b.name}</span>
                        <span className="num cc-text-11d5px cc-text-c9a37a">{cost} · {b.turns}w</span>
                      </div>
                      <div className="cc-text-11d5px cc-text-8399a6 text-left leading-snug mt-1">
                        {why ? why : buildingEffect(b, bid).join(" · ") || b.desc}
                      </div>
                      {!why && (
                        <div className="cc-text-11d5px cc-text-6f8794 text-left leading-snug mt-1">
                          then {b.up[0].name}, then {b.fork[0].name} or {b.fork[1].name}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function SelectionPanel({ game, P, sight, selProv, selArmy, onBuild, onRecruitOpen, onDisband, onDeselect, onInvestigate, onClaim, onMarch, atWar, onSeat, onRepair, onTake, onMerge, onReinforce, onCommand, onCraft, onInvestPop, onRename, onSplit, onDistrict, onInvest, onLift }) {
  if (!selProv) return (
    <div className="cc-text-13d5px cc-text-93a9b5 leading-relaxed">
      <p className="mb-3">Pick a hex to see what it grows and what it hides.</p>
      <p className="mb-1.5">
        Click one of your warbands to take it in hand, then click a neighbouring hex.
        The order appears here — nothing moves until you press it.
      </p>
      <p className="mb-1.5">
        Clicking another of your warbands hands you that one instead.
      </p>
      <p>Marching onto unclaimed or enemy ground takes it. Marching onto an enemy warband starts a battle.
        Two of your own on one hex can be merged from the second one's card.</p>
    </div>
  );

  const terr = TERRAIN[selProv.t];
  const y = provinceYield(selProv, selProv.owner || P, game.nations[selProv.owner || P]);
  const ownerNat = selProv.owner ? game.nations[selProv.owner] : null;
  const mine = selProv.owner === P;
  const canMuster = mine && (selProv.capital || hasBuild(selProv, "muster"));
  const armiesHere = game.armies.filter((a) => a.c === selProv.c && a.r === selProv.r);

  // Ground nobody of yours has stood near tells you nothing at all.
  const charted = sight?.has(key(selProv.c, selProv.r)) || selProv.owner === P;
  if (!charted) {
    return (
      <div>
        <div className="cc-uncharted mb-3">
          <MapPin size={22} className="cc-text-6f8794" />
          <div className="disp cc-text-17px mt-2">Uncharted land</div>
        </div>
        <p className="cc-text-13px cc-text-adc2cc leading-relaxed">
          Nobody of yours has been within sight of this ground. You do not know what grows on
          it, who holds it, or what is standing on it.
        </p>
        <p className="cc-text-12d5px cc-text-93a9b5 leading-relaxed mt-2">
          March a warband within a step of it and it will be put on the map.
        </p>
        <button type="button" onClick={onDeselect}
          className="w-full mt-4 py-2 rounded border cc-border-31454f cc-hover-border-3d6470 cc-text-c6d6de cc-text-13px transition-colors">
          Put it aside · Esc
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Which warband is in hand used to be invisible state you could only
          infer from a card further down the panel. It travels with you now,
          says where it is, and can always be put down. */}
      {selArmy && (
        <div className="rounded border cc-border-4d9aa6 cc-bg-152a30 px-2.5 py-2 mb-2.5 flex items-center gap-2">
          <Swords size={14} className="cc-text-8fe3d6 shrink-0" />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="cc-text-13px truncate">{selArmy.name}</div>
            <div className="cc-text-11d5px cc-text-93a9b5">
              in hand · <span className="num">{selArmy.units.length}</span> compan{selArmy.units.length === 1 ? "y" : "ies"}
              {(() => {
                const allow = moveAllowance(game, selArmy);
                return (
                  <>{" · "}<span className="num">{selArmy.mp}</span> of{" "}
                    <span className="num">{allow.total}</span> movement
                    {allow.note && <span className="cc-text-9fd6b4"> ({allow.note})</span>}</>
                );
              })()}
              {(selArmy.c !== selProv.c || selArmy.r !== selProv.r) && " · standing elsewhere"}
            </div>
          </div>
          <button type="button" onClick={onDeselect}
            className="shrink-0 cc-text-11d5px cc-text-93a9b5 cc-hover-text-e5eef3 px-1.5 py-1 rounded border cc-border-31454f transition-colors">
            Put down
          </button>
        </div>
      )}
      <TerrainArt t={selProv.t} height={112} caption={TERRAIN[selProv.t].name} />
      <div className="mb-3">
        <div className="disp cc-text-19px leading-tight flex items-center gap-2">
          {selProv.capital && <Crown size={15} className="cc-text-f0e2b8" />}
          {selProv.name}
        </div>
        <div className="cc-text-13px cc-text-93a9b5 mt-0.5">
          {terr.name}
          {ownerNat ? <> · held by <span style={{ color: ownerNat.color }}>{ownerNat.short}</span></> : " · unclaimed"}
        </div>
        {/* Who is actually on this ground. Everything downstream — the recruits
            it pays, how much can be built here, what a raider can carry off —
            comes off this number, so it sits with the name rather than buried
            in a yield list. */}
        <div className="flex items-baseline gap-2 mt-2 rounded border cc-border-25313a px-2.5 py-1.5">
          <Users size={13} className="cc-text-a0b6c1" />
          <span className="num cc-text-15px">{Math.round(selProv.pop || 0).toLocaleString()}</span>
          <span className="cc-text-12px cc-text-8399a6 flex-1">
            live here · {popRank(selProv.pop)}
          </span>
          <span className="num cc-text-12d5px cc-text-a0b6c1">
            {popRecruits(selProv.pop)}
          </span>
          <span className="cc-text-11d5px cc-text-8399a6">recruits a season</span>
        </div>
        {mine && (() => {
          const ceil = popCeiling(key(selProv.c, selProv.r), selProv.t);
          const room = ceil > 0 && (selProv.pop || 0) < ceil;
          if (selProv.grow) return (
            <div className="cc-text-12px cc-text-9fd6b4 mt-1.5">
              Being fed — <span className="num">{selProv.grow.per}</span> a season for
              {" "}<span className="num">{selProv.grow.left}</span> more
              {selProv.grow.left === 1 ? " season" : " seasons"}.
            </div>
          );
          return (
            <button type="button" onClick={() => onInvestPop(key(selProv.c, selProv.r))}
              disabled={!room || game.nations[P].res.food < POP_INVEST.food}
              className={`w-full mt-1.5 py-1.5 rounded border cc-text-12d5px transition-colors ${
                room && game.nations[P].res.food >= POP_INVEST.food
                  ? "cc-border-31454f cc-text-cfe0e8 cc-hover-border-4d7488"
                  : "cc-border-25313a cc-text-78909e"}`}>
              {!room ? "This ground will not carry any more"
                : `Feed the ward — ${POP_INVEST.food} rations over ${POP_INVEST.seasons} seasons`}
            </button>
          );
        })()}
      </div>

      {selArmy && (() => {
        const info = moveInfo(game, selArmy, selProv, P, atWar);
        if (!info || info.here) return null;
        return (
          <Section title={`Orders for ${selArmy.name}`}>
            {info.ok ? (
              <>
                <button type="button" onClick={() => onMarch(selArmy.id, key(selProv.c, selProv.r))}
                  className={`w-full py-2.5 rounded disp cc-text-14d5px border transition-colors ${info.kind === "attack"
                    ? "cc-bg-5a2f26 cc-hover-bg-6e3a2e cc-border-8a4a38 cc-text-f3d9cf"
                    : "cc-bg-1f4a52 cc-hover-bg-2a5f69 cc-border-356b76 cc-text-d9f0f2"}`}>
                  {info.label}
                </button>
                <div className="cc-text-12d5px cc-text-95aab6 mt-1.5">
                  Costs <span className="num">{info.cost}</span> of <span className="num">{selArmy.mp}</span> movement.
                </div>
              </>
            ) : (
              <div className="cc-text-13px cc-text-95aab6">{info.why}</div>
            )}
          </Section>
        );
      })()}

      <Section title="What it gives each season">
        {RES_META.map(({ k, label }) => y[k] > 0 && <Row key={k} label={label} value={`+${y[k]}`} tint="#6fae8c" />)}
        {RES_META.every(({ k }) => y[k] <= 0) && <div className="cc-text-13px cc-text-8399a6">Nothing worth carting out.</div>}
        {coastal(selProv.c, selProv.r) && (
          <Row label="Touches open water" value="piers, fisheries" tint="#8fe3d6" />
        )}
        <Row label="Ground favours defender" value={`${terr.def > 0 ? "+" : ""}${terr.def}%`} tint={terr.def > 0 ? "#8fe3d6" : "#e0644a"} />
        <Row label="Costs to enter" value={`${terr.move} move`} />
      </Section>

      {selProv.owner && selProv.feature && (
        <Section title="On the ground">
          <div className="cc-text-13d5px cc-text-f2c97a">{FEATURES[selProv.feature].name}</div>
          <div className="cc-text-12d5px cc-text-93a9b5 mt-0.5">{FEATURES[selProv.feature].desc}</div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(FEATURES[selProv.feature].yield).map(([k, v]) => (
              <span key={k} className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">
                +{v} {RES_META.find((r) => r.k === k)?.label.toLowerCase() || k}
              </span>
            ))}
          </div>
        </Section>
      )}

      {selProv.owner && isMinor(selProv.owner) && (
        <Section title="Holdout">
          <div className="cc-text-13px cc-text-c6d6de leading-relaxed">{MINORS[selProv.owner].trait}</div>
          <div className="cc-text-12d5px cc-text-e09a8a mt-1.5">
            Defenders here take a further <span className="num">+{MINORS[selProv.owner].defBonus}%</span> on
            top of the ground. They never march out, and there is nothing to negotiate.
          </div>
        </Section>
      )}

      {buildsOf(selProv).length > 0 && (
        <Section title={`Standing here — ${buildsOf(selProv).length} of ${buildSlots(selProv)} ${buildSlots(selProv) === 1 ? "site" : "sites"}`}>
          {/* People leave — raiders drive them off, companies take them away —
              and a ward can end up carrying more worksites than it now has the
              hands for. Nothing falls down; you simply cannot add to it until
              the ward recovers. Saying so beats a Build section that has
              silently vanished. */}
          {freeSlots(selProv) < 0 && (
            <div className="cc-text-12d5px cc-text-e8b98a mb-2 leading-snug">
              More work here than {Math.round(selProv.pop || 0).toLocaleString()} people can keep up.
              Nothing will fall down, but nothing more can be started until the ward grows back.
            </div>
          )}
          {buildsOf(selProv).map((bld, i) => {
            const bd = BUILDINGS[bld.id];
            const left = bld.left || 0;
            const frac = left ? (bd.turns - left) / bd.turns : 1;
            const cost = Math.ceil(bd.scrap / 2);
            const afford = game.nations[P].res.scrap >= cost;
            return (
              <div key={bld.id} className={i ? "mt-2.5 pt-2.5 border-t cc-border-25313a" : ""}>
                <div className="flex items-baseline gap-2">
                  <span className="cc-text-13d5px flex-1">{bd.name}</span>
                  {bld.damaged && !left && <span className="cc-text-12px cc-text-e0644a">damaged</span>}
                  {left > 0 && (
                    <span className="num cc-text-12d5px cc-text-c9a37a">
                      {left} season{left === 1 ? "" : "s"} left
                    </span>
                  )}
                </div>
                {left > 0 && (
                  <div className="mt-1.5 cc-h-5px cc-bg-26333c rounded overflow-hidden">
                    <div className="h-full cc-bar" style={{ width: `${frac * 100}%`, background: "#f2c97a" }} />
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {buildingEffect(bld.id).map((e) => (
                    <span key={e} className={`cc-text-11d5px rounded px-1.5 py-0.5 border ${left ? "cc-border-31454f cc-text-95aab6" : "cc-border-3d5a4a cc-text-9fd6b4"}`}>{e}</span>
                  ))}
                </div>
                <div className="cc-text-12d5px cc-text-93a9b5 mt-1">{bd.desc}</div>
                {left > 0 && (
                  <div className="cc-text-12d5px cc-text-95aab6 mt-1">It pays nothing until the work is done.</div>
                )}
                {bld.damaged && !left && (
                  <>
                    <div className="cc-text-12d5px cc-text-e09a8a mt-1.5">
                      Raiders got in. It pays half what it should until it is put back in order.
                    </div>
                    {mine && (
                      <button type="button" disabled={!afford} onClick={() => onRepair(key(selProv.c, selProv.r))}
                        className={`w-full mt-2 py-2 rounded cc-text-13px border transition-colors ${afford
                          ? "cc-bg-2a3a4a cc-hover-bg-35495c cc-border-4d7488 cc-text-dfeaf0"
                          : "cc-border-25313a cc-text-78909e"}`}>
                        {afford ? `Repair it — ${cost} scrap` : `Needs ${cost} scrap`}
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </Section>
      )}

      {/* A walled place somebody else holds. You can walk at it and be shot off
          the wall, or you can sit down in front of it and wait. */}
      {selProv.owner && selProv.owner !== P && isWalled(selProv) && (() => {
        const k = key(selProv.c, selProv.r);
        const sg = siegeOf(selProv);
        const mine = sg && sg.by === P;
        const near = game.armies.some((a) => a.owner === P && a.units.length
          && hexDist(a.c, a.r, selProv.c, selProv.r) === 1);
        const br = breachCount(selProv);
        const next = SIEGE.perBreach - ((sg?.seasons || 0) % SIEGE.perBreach);
        return (
          <Section title={mine ? "Your siege" : `Walled — ${wallsOf(selProv)}% to the defender`}>
            {mine ? (
              <>
                <div className="cc-text-13px cc-text-c6d6de leading-relaxed mb-2">
                  Invested <span className="num">{sg.seasons}</span>{" "}
                  {sg.seasons === 1 ? "season" : "seasons"}. Nothing goes in and nothing comes out:
                  it pays you nothing, its people are going hungry and its garrison is thinning.
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {Array.from({ length: SIEGE.maxBreach }, (_, i) => (
                    <span key={i} className="cc-breachpip" style={{ background: i < br ? "#e0644a" : "#2c3d47" }} />
                  ))}
                  <span className="cc-text-12px cc-text-a0b6c1">
                    {br === 0 ? "the wall is whole" : br >= SIEGE.maxBreach ? "the wall is gone"
                      : `${br} ${br === 1 ? "breach" : "breaches"}`}
                    {br < SIEGE.maxBreach ? ` · next in ${next} ${next === 1 ? "season" : "seasons"}` : ""}
                  </span>
                </div>
                <div className="cc-text-12px cc-text-93a9b5 leading-snug mb-2">
                  {br === 0 ? "Storm it now and your companies go at a standing wall."
                    : br === 1 ? "The gate has gone. A storm reaches the centre without climbing."
                    : br === 2 ? "The gate and one flank are open."
                    : "There is no wall left worth the name."}
                </div>
                <button type="button" onClick={() => onLift(k)}
                  className="w-full py-2 rounded border cc-border-31454f cc-text-c3d5de cc-text-13px cc-hover-border-3d6470 transition-colors">
                  Lift the siege
                </button>
              </>
            ) : sg ? (
              <div className="cc-text-13px cc-text-c6d6de leading-relaxed">
                {FACTION[sg.by]?.short || "Somebody"} already has it invested.
              </div>
            ) : (
              <>
                <div className="cc-text-13px cc-text-c6d6de leading-relaxed mb-2">
                  Works and walls give the defender <span className="num">{wallsOf(selProv)}%</span>.
                  Storming that costs companies. Sitting in front of it costs seasons.
                </div>
                <button type="button" disabled={!near} onClick={() => onInvest(k)}
                  className={`w-full py-2.5 rounded disp cc-text-14d5px border transition-colors ${near
                    ? "cc-bg-2a3a4a cc-hover-bg-35495c cc-border-4d7488 cc-text-dfeaf0"
                    : "cc-border-25313a cc-text-78909e"}`}>
                  {near ? "Invest the place" : "March a warband alongside it first"}
                </button>
              </>
            )}
          </Section>
        );
      })()}

      {!selProv.owner && (() => {
        const here = game.armies.find((a) => a.owner === P && a.c === selProv.c && a.r === selProv.r);
        const ready = here && here.mp >= 1;
        if (!selProv.explored) {
          return (
            <Section title="Unsurveyed">
              <div className="cc-text-13px cc-text-c6d6de leading-relaxed mb-2">
                Nobody has walked this ground in your lifetime. Send a warband in to find out
                what is on it before you put a flag in it.
              </div>
              <button type="button" disabled={!ready} onClick={() => onInvestigate(key(selProv.c, selProv.r))}
                className={`w-full py-2.5 rounded disp cc-text-14d5px border transition-colors ${ready
                  ? "cc-bg-2a3a4a cc-hover-bg-35495c cc-border-4d7488 cc-text-dfeaf0"
                  : "cc-border-25313a cc-text-78909e"}`}>
                {ready ? "Investigate" : here ? "That warband has no movement left" : "March a warband here first"}
              </button>
            </Section>
          );
        }
        return (
          <Section title="Surveyed">
            {selProv.feature ? (
              <div className="mb-2">
                <div className="cc-text-13d5px cc-text-f2c97a">{FEATURES[selProv.feature].name}</div>
                <div className="cc-text-12d5px cc-text-93a9b5">{FEATURES[selProv.feature].desc}</div>
              </div>
            ) : (
              <div className="cc-text-13px cc-text-c6d6de mb-2">Nothing here but the ground itself.</div>
            )}
            {(() => {
              const cost = claimCost(game.provinces, P, selProv.c, selProv.r);
              const afford = canClaim(game.nations[P], cost);
              const ok = here && afford;
              return (
                <>
                  <button type="button" disabled={!ok} onClick={() => onClaim(key(selProv.c, selProv.r))}
                    className={`w-full py-2.5 rounded disp cc-text-14d5px border transition-colors ${ok
                      ? "cc-bg-2b3f2c cc-hover-bg-37502f cc-border-4a6b45 cc-text-d7ecc9"
                      : "cc-border-25313a cc-text-78909e"}`}>
                    {!here ? "March a warband here first"
                      : afford ? "Claim this land for your banner"
                      : "Not enough to settle it"}
                  </button>
                  <div className="cc-text-12d5px cc-text-95aab6 mt-1.5">
                    Settling costs <span className="num cc-text-c3cf7a">{cost.food} rations</span> and{" "}
                    <span className="num cc-text-9db8c4">{cost.men} recruits</span> — people have to be fed
                    there and someone has to hold it. The wider your realm, the more the next one costs.
                  </div>
                  {cost.rings > 1 && (
                    <div className="cc-text-12d5px cc-text-c9a37a mt-1">
                      This ground is <span className="num">{cost.rings}</span> steps out from your nearest
                      holding, which puts <span className="num">{Math.round((cost.reach - 1) * 100)}%</span> on
                      the price. Ground that touches your border costs nothing extra.
                    </div>
                  )}
                </>
              );
            })()}
          </Section>
        );
      })()}

      {mine && isSettlement(selProv) && (
        <Section title={`The district — ${buildsOf(selProv).length} of ${districtSlots(selProv)} slots taken`}>
          <button type="button" onClick={() => onDistrict(key(selProv.c, selProv.r))}
            className="w-full py-2.5 rounded cc-bg-2a3a4a cc-hover-bg-35495c border cc-border-4d7488 cc-text-dfeaf0 disp cc-text-15px transition-colors flex items-center justify-center gap-2">
            <Hammer size={15} /> Build in the district
          </button>
          <div className="cc-text-12px cc-text-93a9b5 mt-1.5 leading-snug">
            {districtNeeds(selProv)
              ? `Another slot opens at ${districtNeeds(selProv).at.toLocaleString()} people.`
              : "Every slot this place will ever have is open."}
          </div>
        </Section>
      )}

      {mine && !isSettlement(selProv) && freeSlots(selProv) > 0 && Object.entries(BUILDINGS)
        .filter(([bid]) => unlocked(game.nations[P], bid))
        .filter(([, b]) => !b.coast || coastal(selProv.c, selProv.r))
        .filter(([, b]) => !b.on || b.on.includes(selProv.t)).length === 0 && (
        <Section title="Build">
          <div className="cc-text-13px cc-text-c6d6de leading-relaxed">
            Nobody here knows how to raise anything yet. Set the scholars on something
            in <span className="cc-text-8fe3d6">Advances</span> — systematic scavenging
            gives you salvage yards within a few seasons.
          </div>
        </Section>
      )}

      {mine && !isSettlement(selProv) && freeSlots(selProv) > 0 && (
        <Section title={`Build — ${freeSlots(selProv)} of ${buildSlots(selProv)} ${freeSlots(selProv) === 1 ? "site" : "sites"} free`}>
          <div className="grid gap-1.5">
            {Object.entries(BUILDINGS)
              .filter(([bid]) => unlocked(game.nations[P], bid))
              .filter(([bid]) => !buildsOf(selProv).some((x) => x.id === bid))
              .filter(([, b]) => !b.coast || coastal(selProv.c, selProv.r))
              .filter(([, b]) => !b.on || b.on.includes(selProv.t))
              .map(([bid, b]) => {
                // Second and third worksites on one tile cost more.
                const price = buildCost(b.scrap, buildsOf(selProv).length);
                const afford = game.nations[P].res.scrap >= price;
                return (
                  <button key={bid} disabled={!afford}
                    onClick={() => onBuild(key(selProv.c, selProv.r), bid)}
                    className={`text-left px-2.5 py-2 rounded border cc-text-13px transition-colors ${afford
                      ? "cc-border-31454f cc-hover-border-3d6470 cc-hover-bg-152029"
                      : "cc-border-25313a opacity-40 cursor-not-allowed"}`}>
                    <div className="flex justify-between items-baseline">
                      <span>{b.name}</span>
                      <span className="num cc-text-12d5px cc-text-c9a37a">{price} scrap · {b.turns}w</span>
                    </div>
                    <div className="cc-text-12px cc-text-93a9b5 mt-0.5">{b.desc}</div>
                  </button>
                );
              })}
          </div>
        </Section>
      )}

      {selProv.capital && selProv.owner === P && selProv.seat === P && (
        <button type="button" onClick={() => onSeat(key(selProv.c, selProv.r))}
          className="w-full mt-1 mb-3 py-2.5 rounded cc-bg-2a3a4a cc-hover-bg-35495c border cc-border-4d7488 cc-text-dfeaf0 disp cc-text-14d5px flex items-center justify-center gap-2 transition-colors">
          <Crown size={15} /> Enter the seat of power
        </button>
      )}

      {canMuster && (
        <button onClick={() => onRecruitOpen(key(selProv.c, selProv.r))}
          className="w-full mt-1 mb-3 py-2.5 rounded cc-bg-2b3f2c cc-hover-bg-37502f border cc-border-4a6b45 cc-text-d7ecc9 disp cc-text-14px flex items-center justify-center gap-2 transition-colors">
          <Hammer size={15} /> Outfit a new company
        </button>
      )}

      {armiesHere.map((a) => (
        <ArmyCard key={a.id} army={a} game={game} P={P} onDisband={onDisband}
          held={selArmy?.id === a.id} heldArmy={selArmy}
          onTake={onTake} onMerge={onMerge} onReinforce={onReinforce} onCommand={onCommand}
          onRename={onRename} onSplit={onSplit} />
      ))}

      {selArmy && (
        <button type="button" onClick={onDeselect}
          className="w-full mt-1 py-2 rounded border cc-border-31454f cc-hover-border-3d6470 cc-text-c6d6de cc-text-13px transition-colors">
          Put the warband down  ·  Esc
        </button>
      )}
    </div>
  );
}

/* Where the warband stands in relation to anything you hold, said plainly,
   because it is the number that decides whether a campaign is a campaign or a
   slow way of losing an army. */
function SupplyLine({ sup }) {
  const tone = sup.band.tone === "good" ? "cc-text-9fd6b4"
    : sup.band.tone === "warn" ? "cc-text-e8b98a" : "cc-text-e08a6a";
  return (
    <div className="rounded border cc-border-31454f cc-bg-131f27 px-2.5 py-2 mb-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className={`cc-text-13px ${tone}`}>{sup.band.name}</span>
        <span className="cc-text-11d5px cc-text-93a9b5">
          rations <span className="num">&times;{sup.band.draw}</span>
        </span>
      </div>
      <div className="cc-text-12px cc-text-93a9b5 mt-0.5">{sup.band.note}</div>
      {sup.raw > sup.d && (() => {
        const by = [];
        if (sup.relief.carts) by.push(`the waggons ${sup.relief.carts > 1 ? "(two trains)" : ""}`.trim());
        if (sup.relief.road) by.push("your quartermasters");
        return (
          <div className="cc-text-11d5px cc-text-9fd6b4 mt-1">
            <span className="num">{sup.raw}</span> hexes from your nearest holding, counting
            as <span className="num">{sup.d}</span> thanks to {by.join(" and ")}.
          </div>
        );
      })()}
      {sup.band.waste > 0 && (
        <div className="cc-text-11d5px cc-text-e08a6a mt-1">
          Losing <span className="num">{Math.round(sup.band.waste * 100)}%</span> of every
          company each season, and nerve with it. Worse on hard ground, worse again in winter.
        </div>
      )}
    </div>
  );
}

function ArmyCard({ army, game, P, onDisband, held, heldArmy, onTake, onMerge, onReinforce, onCommand, onRename, onSplit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(army.name);
  const standingOn = game.provinces[key(army.c, army.r)];
  const friendly = !!standingOn && standingOn.owner === P;
  const muster = musteringGround(standingOn);
  const own = army.owner === P;
  const nat = game.nations[army.owner];
  const totalStr = army.units.reduce((n, u) => n + u.str, 0);
  const upkeep = army.units.reduce((acc, u) => {
    const s = unitStats(u);
    acc.food += s.food; acc.fuel += s.fuel; return acc;
  }, { food: 0, fuel: 0 });
  const sup = supplyOf(game.provinces, nat, army.owner, army);

  return (
    <Section title={own ? (held ? "In hand" : "Also standing here") : "Warband sighted"}>
      {own && editing ? (
        <form className="flex items-center gap-1.5"
          onSubmit={(e) => { e.preventDefault(); onRename(army.id, draft); setEditing(false); }}>
          <input autoFocus value={draft} maxLength={40}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") { setDraft(army.name); setEditing(false); } }}
            className="cc-namefield disp cc-text-15px flex-1 min-w-0" />
          <button type="submit" className="cc-text-11d5px cc-text-8fe3d6 px-1.5 py-1 rounded border cc-border-4d9aa6">Name it</button>
          <button type="button" onClick={() => { setDraft(army.name); setEditing(false); }}
            className="cc-text-11d5px cc-text-93a9b5 px-1.5 py-1">Leave it</button>
        </form>
      ) : (
        <div className="disp cc-text-15px flex items-center gap-2" style={{ color: nat.color }}>
          <Swords size={14} className="shrink-0" />
          <span className="min-w-0 truncate">{army.name}</span>
          {held && <span className="cc-text-11d5px cc-text-8fe3d6 shrink-0">· selected</span>}
          {army.lord && <Crown size={13} className="cc-text-f0e2b8 shrink-0" />}
          {own && (
            <button type="button" title="Give this warband a name"
              onClick={() => { setDraft(army.name); setEditing(true); }}
              className="shrink-0 cc-text-11d5px cc-text-93a9b5 cc-hover-text-e5eef3 px-1 transition-colors">
              rename
            </button>
          )}
        </div>
      )}
      {own && army.units.length >= bandCap(game.nations[P]) && (
        <div className="cc-text-11d5px cc-text-e8b98a mt-1">
          Full at {bandCap(game.nations[P])} companies. March one out on its own to make room
          {game.nations[P]?.known?.hosting ? "." : ", or learn the long muster for two more."}
        </div>
      )}
      <div className="cc-text-12d5px cc-text-93a9b5 mb-2">
        <span className="num">{totalStr}</span> strong
        {own && (() => {
          const allow = moveAllowance(game, army);
          return (
            <> · <span className="num">{army.mp}</span> of <span className="num">{allow.total}</span> movement
              {allow.note && <span className="cc-text-9fd6b4"> ({allow.note})</span>}
              {" "}· eats <span className="num">{Math.round(upkeep.food * sup.band.draw)}</span> rations
              {upkeep.fuel > 0 && <>, <span className="num">{Math.round(upkeep.fuel * sup.band.draw)}</span> fuel</>}</>
          );
        })()}
      </div>
      {own && <SupplyLine sup={sup} />}
      <div className="grid gap-1.5">
        {army.units.map((u) => {
          const s = unitStats(u);
          return (
            <div key={u.id} className="rounded border cc-border-31454f cc-bg-131f27 px-2.5 py-2 flex gap-2.5">
              <UnitArt type={u.type} size={46} />
              <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span className="cc-text-13px">{unitName(u)}{u.xp > 0 && <span className="cc-text-c9a37a num"> ·{u.xp}</span>}</span>
                <span className="num cc-text-12d5px cc-text-aac5d1">{u.str}/{u.max}</span>
              </div>
              <div className="cc-text-12px cc-text-93a9b5 mt-0.5">
                {unitKit(u)}
              </div>
              <div className="flex gap-3 mt-1.5 cc-text-11d5px cc-text-a0b6c1">
                <span className="num">melee {s.melee.toFixed(0)}</span>
                <span className="num">shot {s.ranged}</span>
                <span className="num">armour {s.def}</span>
              </div>
              <div className="mt-1.5 cc-h-3px cc-bg-26333c rounded overflow-hidden">
                <div className="h-full" style={{ width: `${(u.str / u.max) * 100}%`, background: nat.color }} />
              </div>
              {own && (() => {
                const rc = reinforceCost(u, P, muster);
                const canSplit = army.units.length > 1;
                const splitBtn = canSplit && (
                  <button type="button" onClick={() => onSplit(army.id, u.id)}
                    title="They become a warband of their own, standing where they are"
                    className="cc-text-11d5px cc-text-93a9b5 cc-hover-text-8fe3d6 transition-colors">
                    March out alone
                  </button>
                );
                if (!rc) return (
                  <div className="mt-1.5 flex items-center gap-3">
                    {splitBtn}
                    <button onClick={() => onDisband(army.id, u.id)}
                      className="cc-text-11d5px cc-text-93a9b5 cc-hover-text-e0644a transition-colors">
                      Stand down
                    </button>
                  </div>
                );
                const afford = game.nations[P].res.men >= rc.men && game.nations[P].res.scrap >= rc.scrap;
                const ok = friendly && afford;
                return (
                  <div className="mt-1.5">
                    <button type="button" disabled={!ok} onClick={() => onReinforce(army.id, u.id)}
                      className={`w-full py-1.5 rounded border cc-text-12d5px transition-colors ${ok
                        ? "cc-bg-2b3f2c cc-hover-bg-37502f cc-border-4a6b45 cc-text-d7ecc9"
                        : "cc-border-25313a cc-text-78909e"}`}>
                      {!friendly ? "Cannot reinforce outside your own ground"
                        : !afford ? `Needs ${rc.men} recruits and ${rc.scrap} scrap`
                        : `Bring up ${rc.gap} men — ${rc.men} recruits, ${rc.scrap} scrap`}
                    </button>
                    {friendly && !muster && afford && (
                      <div className="cc-text-11d5px cc-text-c9a37a mt-1">
                        Field replacements. At a muster hall or your seat the same men cost far less.
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-3">
                      {splitBtn}
                      <button onClick={() => onDisband(army.id, u.id)}
                        className="cc-text-11d5px cc-text-93a9b5 cc-hover-text-e0644a transition-colors">
                        Stand down
                      </button>
                    </div>
                  </div>
                );
              })()}
              </div>
            </div>
          );
        })}
      </div>

      {own && WARLORDS[P] && lordAlive(game.nations[P]) && (() => {
        const lordHere = !!army.lord;
        const lordElsewhere = game.armies.some((a) => a.owner === P && a.lord && a.id !== army.id);
        const transit = game.nations[P].lordTransit;
        const blocked = !friendly || !!transit;
        return (
          <div className="mt-2">
            <button type="button" disabled={blocked}
              onClick={() => onCommand(lordHere ? null : army.id)}
              className={`w-full py-2 rounded disp cc-text-13d5px border transition-colors ${blocked
                ? "cc-border-25313a cc-text-78909e"
                : lordHere ? "cc-bg-5a2f26 cc-hover-bg-6e3a2e cc-border-8a4a38 cc-text-f3d9cf"
                : "cc-bg-2a3a4a cc-hover-bg-35495c cc-border-4d7488 cc-text-dfeaf0"}`}>
              {transit ? "You are on the road — you reach them next season"
                : !friendly ? "You can only join or leave a warband on your own ground"
                : lordHere ? "Leave them and return to your seat"
                : lordElsewhere ? "Ride over and take command of this warband"
                : "Take the field with this warband"}
            </button>
            {lordHere && (
              <div className="cc-text-12px cc-text-f2c97a mt-1">
                {LORD_COMMAND[P].n} — {LORD_COMMAND[P].d} If this warband is broken, you may fall with it.
              </div>
            )}
          </div>
        );
      })()}

      {own && !held && (() => {
        const together = heldArmy && heldArmy.units.length + army.units.length;
        const canMerge = heldArmy && heldArmy.id !== army.id
          && heldArmy.c === army.c && heldArmy.r === army.r;
        return (
          <div className="grid gap-1.5 mt-2">
            {canMerge && (
              <>
                <button type="button" disabled={together > bandCap(game.nations[P])}
                  onClick={() => onMerge(heldArmy.id, army.id)}
                  className={`w-full py-2 rounded disp cc-text-13d5px border transition-colors ${together > bandCap(game.nations[P])
                    ? "cc-border-25313a cc-text-78909e"
                    : "cc-bg-2a3a4a cc-hover-bg-35495c cc-border-4d7488 cc-text-dfeaf0"}`}>
                  {together > bandCap(game.nations[P]) ? "Too many companies to merge" : `Merge ${heldArmy.name} into this warband`}
                </button>
                <div className="cc-text-12px cc-text-95aab6">
                  {together > bandCap(game.nations[P])
                    ? `That would be ${together} companies; ${bandCap(game.nations[P])} is the limit.`
                    : `They would march on as one warband of ${together} companies.`}
                </div>
              </>
            )}
            <button type="button" onClick={() => onTake(army.id)}
              className="w-full py-2 rounded border cc-border-31454f cc-hover-border-3d6470 cc-text-c6d6de cc-text-13px transition-colors">
              Put this warband in hand
            </button>
          </div>
        );
      })()}
    </Section>
  );
}

function RealmPanel({ game, P, nat }) {
  const inc = nationIncome(game, P, game.turn);
  const provs = Object.values(game.provinces).filter((p) => p.owner === P);
  const byTerr = {};
  provs.forEach((p) => { byTerr[TERRAIN[p.t].name] = (byTerr[TERRAIN[p.t].name] || 0) + 1; });
  return (
    <div>
      <div className="disp cc-text-18px" style={{ color: nat.color }}>{nat.name}</div>
      <p className="cc-text-13px cc-text-adc2cc leading-relaxed mt-1.5 mb-3">{nat.blurb}</p>

      {(() => {
        const sea = seasonOf(game.turn);
        return (
          <div className="rounded border cc-border-31454f cc-bg-131f27 px-3 py-2.5 mb-3">
            <div className="flex items-baseline gap-2">
              <span className="disp cc-text-16px" style={{ color: SEASON_TINT[sea.id] }}>{sea.name}</span>
              <span className="cc-text-12d5px cc-text-93a9b5">year {yearOf(game.turn)}</span>
            </div>
            <div className="cc-text-12d5px cc-text-93a9b5 mt-1 leading-snug">{sea.note}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {[["rations", sea.food], ["scrap", sea.scrap], ["recruits", sea.men]].map(([k, v]) =>
                v === 1 ? null : (
                  <span key={k} className={`cc-text-11d5px rounded px-1.5 py-0.5 border ${v > 1
                    ? "cc-border-3d5a4a cc-text-9fd6b4" : "cc-border-5a3230 cc-text-e09a8a"}`}>
                    {k} {v > 1 ? "+" : "−"}{Math.abs(Math.round((v - 1) * 100))}%
                  </span>
                ))}
              {sea.move !== 0 && (
                <span className={`cc-text-11d5px rounded px-1.5 py-0.5 border ${sea.move > 0
                  ? "cc-border-3d5a4a cc-text-9fd6b4" : "cc-border-5a3230 cc-text-e09a8a"}`}>
                  {sea.move > 0 ? "+" : ""}{sea.move} movement
                </span>
              )}
            </div>
          </div>
        );
      })()}
      <Section title="What sets you apart">
        <div className="cc-text-13px cc-text-d3e5ec leading-relaxed">{nat.trait}</div>
        <Row label="Season" value={`${seasonOf(game.turn).name} of year ${yearOf(game.turn)}`}
          tint={SEASON_TINT[seasonOf(game.turn).id]} />
        <Row label="Advances learned" value={`${Object.keys(nat.known || {}).length} of ${TECH_IDS.length}`} />
      </Section>
      <Section title="Ledger">
        {RES_META.map(({ k, label }) => (
          <Row key={k} label={label} value={`${Math.round(nat.res[k])}  (${inc[k] > 0 ? "+" : ""}${inc[k]})`}
            tint={inc[k] < 0 ? "#e0644a" : undefined} />
        ))}
      </Section>
      <Section title="Land">
        <Row label="Holdings" value={provs.length} />
        {Object.entries(byTerr).sort((a, b) => b[1] - a[1]).map(([n, c]) => <Row key={n} label={n} value={c} />)}
      </Section>
    </div>
  );
}

function WorldPanel({ game, P, atWar, onWar }) {
  const counts = {};
  NATION_IDS.forEach((id) => { counts[id] = Object.values(game.provinces).filter((p) => p.owner === id).length; });
  return (
    <div>
      <div className="cc-text-13px cc-text-93a9b5 mb-3 leading-relaxed">
        You can only take ground from someone you are at war with. Suing for peace costs 40 scrap and they may just keep it.
      </div>
      {!NATION_IDS.some((id) => id !== P && game.met?.[id]) && !MINOR_IDS.some((id) => game.met?.[id]) && (
        <div className="cc-text-13px cc-text-93a9b5 leading-relaxed mb-4">
          You have met nobody yet. Send warbands out; what you have not laid eyes on,
          you know nothing about.
        </div>
      )}

      <div className="grid gap-2 mb-4">
        {MINOR_IDS.filter((id) => game.met?.[id]).map((id) => {
          const m = MINORS[id];
          const held = Object.values(game.provinces).filter((p) => p.owner === id).length;
          const bands = game.armies.filter((a) => a.owner === id).length;
          const seated = !!m.at;
          return (
            <div key={id} className="rounded border cc-border-8a6f36 cc-bg-131f27 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Sigil id={id} size={18} color={m.color} />
                <span className="disp cc-text-14d5px flex-1">{m.short}</span>
                <span className="num cc-text-12d5px cc-text-a0b6c1">
                  {seated ? (held ? m.seatName : "broken")
                    : held || bands ? `${held} holds · ${bands} bands` : "nowhere"}
                </span>
              </div>
              <div className="cc-text-12d5px cc-text-93a9b5 mt-1 leading-snug">{m.trait}</div>
              {seated && !held && (
                <div className="cc-text-12d5px cc-text-9fd6b4 mt-1.5">The workings answer to someone else now.</div>
              )}
              {!seated && bands > 0 && (
                <div className="cc-text-12d5px cc-text-e09a8a mt-1.5">
                  {bands} band{bands === 1 ? "" : "s"} abroad. They will find your holdings on their own.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-2">
        {NATION_IDS.filter((id) => id !== P && game.met?.[id]).map((id) => {
          const n = game.nations[id];
          const war = atWar(P, id);
          const gone = counts[id] === 0;
          return (
            <div key={id} className="rounded border cc-border-31454f cc-bg-131f27 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <LordPortrait id={id} className="cc-lordthumb" small />
                <span className="flex-1 min-w-0">
                  <span className="disp cc-text-14d5px cc-block">{n.short}</span>
                  <span className="cc-text-11d5px cc-text-93a9b5 cc-block">{WARLORDS[id]?.name || "no one speaks for them"}</span>
                </span>
                <span className="num cc-text-12d5px cc-text-a0b6c1">{counts[id]} holdings</span>
              </div>
              <div className="cc-text-12px cc-text-93a9b5 mt-1 leading-snug">{n.trait}</div>
              {!gone && (
                <button onClick={() => onWar(id)}
                  className={`mt-2 w-full py-1.5 rounded cc-text-13px border transition-colors flex items-center justify-center gap-1.5 ${war
                    ? "cc-border-3d5a4a cc-text-9fd6b4 cc-hover-bg-1a2c22"
                    : "cc-border-5a3230 cc-text-e09a8a cc-hover-bg-2a1a18"}`}>
                  {war ? <><Handshake size={13} /> Sue for peace</> : <><Ban size={13} /> Declare war</>}
                </button>
              )}
              {gone && <div className="mt-2 cc-text-12d5px cc-text-8399a6 flex items-center gap-1.5"><Skull size={12} /> Wiped from the map</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ THE WORKSHOPS -----------------------------
   The advances drawn as what they are: a tree. Depth comes from the
   prerequisites themselves, so adding a technology re-lays the whole thing
   without anyone positioning a node by hand.
   ------------------------------------------------------------------------ */
function TechIcon({ id }) {
  /* These were fourteen line marks drawn by hand and they looked it — a
     wobbling arc for bowyery, a circle with spokes for anything mechanical.
     Every advance now carries a game-icons mark instead, drawn at 512 and
     scaled down, which is why they hold up at any size. */
  const ic = techIcon(id);
  if (ic) return <path d={ic.d} fill="currentColor" transform="scale(0.0508)" />;
  return <circle cx="11" cy="11" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />;
}

const NODE_W = 168, NODE_H = 60, COL = 214, ROW = 78;

const TIER_HEAD = 34;

/* One column per tier, so a shrouded tier is a column you can point at, and
   the columns read left to right as the order you work through them. Within a
   tier an advance sits directly under whatever it grows out of, and the links
   between those two run down the gutter to the left of the column. */
function treeLayout() {
  const pos = {};
  const rowOf = {};
  let maxRows = 0;
  TECH_TIERS.forEach((tier, ti) => {
    const sub = {};
    const d = (id) => {
      if (sub[id] != null) return sub[id];
      const own = TECHS[id].needs.filter((n) => TIER_OF[n] === ti);
      sub[id] = own.length ? 1 + Math.max(...own.map(d)) : 0;
      return sub[id];
    };
    tier.techs.forEach(d);
    // Sit each advance opposite whatever it grows out of. Sorting a tier by
    // the average row of its prerequisites is the standard trick for layered
    // graphs, and it is what stops the lines crossing into a thicket — the
    // tier columns were readable but the links between them were not.
    const bary = (id) => {
      const from = TECHS[id].needs.filter((n) => rowOf[n] != null && TIER_OF[n] < ti);
      return from.length ? from.reduce((a, n) => a + rowOf[n], 0) / from.length : 99;
    };
    // Sorting by depth alone put foraging at the top and the three advances
    // that grow out of it at the bottom, with unrelated ones in between, so
    // every one of its links had to reach across the whole column. Walk the
    // tier instead: a root, then its own children directly beneath it, then
    // the next root. What leads where is then simply what sits under what.
    const byBary = (a, b) => (bary(a) - bary(b)) || (tier.techs.indexOf(a) - tier.techs.indexOf(b));
    const ordered = [];
    const seen = {};
    const walk = (id) => {
      if (seen[id]) return;
      seen[id] = 1;
      ordered.push(id);
      tier.techs.filter((k) => TECHS[k].needs.includes(id)).sort(byBary).forEach(walk);
    };
    tier.techs.filter((id) => sub[id] === 0).sort(byBary).forEach(walk);
    tier.techs.forEach(walk);   // anything left in a cycle still gets a row
    maxRows = Math.max(maxRows, ordered.length);
    const off = ((6 - ordered.length) * ROW) / 2;
    ordered.forEach((id, i) => {
      rowOf[id] = i;
      pos[id] = { x: 54 + ti * COL, y: 24 + TIER_HEAD + off + i * ROW, tier: ti, row: i };
    });
  });
  return { pos, w: 54 + TECH_TIERS.length * COL,
           h: 48 + TIER_HEAD + Math.max(maxRows, 6) * ROW, rows: Math.max(maxRows, 6) };
}
const TREE = treeLayout();

function TechTree({ game, P, onResearch, onClose }) {
  const nat = game.nations[P];
  const states = {};
  TECH_IDS.forEach((id) => { states[id] = techState(game, P, id); });
  const visible = TECH_IDS.filter((id) => tierOpen(nat.known, TIER_OF[id]));
  const [sel0, setSel] = useState(() =>
    nat.research?.id || visible.find((id) => states[id].s === "open") || visible[0]);
  // Learning something can shroud nothing, but a loaded save or a restart can
  // leave the selection pointing at a tier that is no longer in view.
  const sel = visible.includes(sel0) ? sel0 : visible[0];
  const t = TECHS[sel], st = states[sel];

  const tone = (s) => s === "known" ? { fill: "#132219", edge: "#4d7a5c", text: "#a6e0bd" }
    : s === "working" ? { fill: "#10262c", edge: "#4d9aa6", text: "#9fe8dd" }
    : s === "open" ? { fill: "#16242e", edge: "#4d7488", text: "#e4eef4" }
    : { fill: "#0d141a", edge: "#22303a", text: "#7b8f9b" };

  return (
    <Overlay onClose={onClose}>
      <div className="cc-w-1180px cc-max-w-96vw cc-max-h-92vh rounded-lg border cc-border-31454f cc-bg-0d141a flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b cc-border-28363f flex items-center gap-3"
          style={{ background: "linear-gradient(90deg,#14202a,#0d141a)" }}>
          <Hammer size={18} className="cc-text-8fe3d6" />
          <div className="disp cc-text-21px flex-1">The scholars</div>
          <div className="cc-text-12d5px cc-text-c6d6de">
            <span className="num">{Object.keys(nat.known || {}).length}</span> of{" "}
            <span className="num">{TECH_IDS.length}</span> understood
          </div>
          <button type="button" onClick={onClose} className="cc-seatclose cc-static" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto thin cc-treescroll">
          <svg width={TREE.w} height={TREE.h} className="cc-tree">
            {/* One faint panel per tier. The columns were already there in the
                positions, but nothing on screen said so, and a wall of evenly
                spaced boxes does not read as stages you work through in
                order. */}
            {TECH_TIERS.map((tier, ti) => (
              <rect key={tier.id} x={54 + ti * COL - 44} y="8" width={COL - 4} height={TREE.h - 16}
                rx="10" fill={ti % 2 ? "#101c24" : "#0c161d"} opacity="0.75" />
            ))}

            <g fill="none" strokeLinecap="round">
              {TECH_IDS.filter((id) => tierOpen(nat.known, TIER_OF[id]))
                .flatMap((id) => TECHS[id].needs.map((n) => ({ n, id, lit: sel === n || sel === id })))
                // Whatever you are looking at gets its own lines drawn last and
                // drawn bright, so "what does this open, and what did it need"
                // is answered by clicking the box rather than by tracing.
                .sort((u, v) => Number(u.lit) - Number(v.lit))
                .map(({ n, id, lit }) => {
                const a = TREE.pos[n], b = TREE.pos[id];
                const y1 = a.y + NODE_H / 2, y2 = b.y + NODE_H / 2;
                // Two advances in the same tier share a column, so a plain
                // left-to-right curve between them runs backwards and loops
                // over its neighbours. Those leave by the left face and come
                // back through the gutter beside the column, which reads as a
                // bracket down the side rather than a knot.
                const inTier = a.x === b.x;
                const x2 = inTier ? b.x - 1 : b.x;
                const line = inTier
                  ? `M${a.x} ${y1} C${a.x - 34} ${y1}, ${a.x - 34} ${y2}, ${x2} ${y2}`
                  : `M${a.x + NODE_W} ${y1} C${a.x + NODE_W + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`;
                // Walked means you already hold what this line comes from, so
                // the road behind you reads brighter than the road ahead.
                const walked = !!nat.known?.[n];
                const col = lit ? "#8fe3d6" : walked ? "#5f9e78" : "#3d5563";
                const wide = lit ? 2.9 : walked ? 2.4 : 1.6;
                const op = lit ? 1 : walked ? 0.95 : 0.6;
                return (
                  <g key={n + id}>
                    <path d={line} stroke={col} strokeWidth={wide} opacity={op} />
                    <path d={`M${x2 - 8} ${y2 - 4.4}L${x2 - 0.5} ${y2}L${x2 - 8} ${y2 + 4.4}`}
                      stroke={col} strokeWidth={wide - 0.2} opacity={op} strokeLinejoin="round" />
                  </g>
                );
              })}
            </g>

            {/* A tier that is not in view yet: its name, how many advances it
                holds, and what opens it — but not what they are. */}
            {TECH_TIERS.map((tier, ti) => {
              const open = tierOpen(nat.known, ti);
              const x = 54 + ti * COL;
              const w = tierNeeds(nat.known, ti);
              const off = ((6 - tier.techs.length) * ROW) / 2;
              return (
                <g key={tier.id}>
                  <text x={x} y={22} className="cc-tiername" fill={open ? "#8fe3d6" : "#5d707c"}>
                    {tier.name.toUpperCase()}
                  </text>
                  <text x={x + NODE_W} y={22} textAnchor="end" className="cc-tmeta" fill="#5d707c">
                    {tier.techs.filter((id) => nat.known?.[id]).length}/{tier.techs.length}
                  </text>
                  {!open && tier.techs.map((_, i) => (
                    <g key={i} transform={`translate(${x},${24 + TIER_HEAD + off + i * ROW})`}>
                      {/* A stub coming in from the left, so a shrouded tier
                          reads as the road continuing rather than the tree
                          simply stopping at the edge of what you know. */}
                      <path d={`M-26 ${NODE_H / 2}h18`} stroke="#2b3d47" strokeWidth="1.6"
                        fill="none" strokeLinecap="round" opacity="0.8" />
                      <path d={`M-11 ${NODE_H / 2 - 3.6}L-4 ${NODE_H / 2}L-11 ${NODE_H / 2 + 3.6}`}
                        stroke="#2b3d47" strokeWidth="1.5" fill="none" strokeLinejoin="round" opacity="0.8" />
                      <rect width={NODE_W} height={NODE_H} rx="7" fill="#0a1015"
                        stroke="#22303a" strokeWidth="1.2" strokeDasharray="5 4" />
                      <rect x="11" y="22" width={NODE_W - 52} height="7" rx="3.5" fill="#1b2731" />
                      <rect x="11" y="34" width={NODE_W - 96} height="6" rx="3" fill="#161f27" />
                    </g>
                  ))}
                  {!open && w && (
                    <text x={x} y={24 + TIER_HEAD + off + tier.techs.length * ROW + 4}
                      className="cc-tmeta" fill="#7b8f9b">
                      Learn {w.left} more {w.tier.name} advance{w.left === 1 ? "" : "s"}.
                    </text>
                  )}
                </g>
              );
            })}

            {TECH_IDS.filter((id) => tierOpen(nat.known, TIER_OF[id])).map((id) => {
              const p = TREE.pos[id], s = states[id].s, c = tone(s);
              const on = sel === id;
              const tt = TECHS[id];
              const frac = s === "working"
                ? (researchTurns(P, tt, nat) - states[id].left) / researchTurns(P, tt, nat) : 0;
              return (
                <g key={id} transform={`translate(${p.x},${p.y})`} className="cc-tnode"
                  onClick={() => setSel(id)}>
                  <rect width={NODE_W} height={NODE_H} rx="7" fill={c.fill}
                    stroke={on ? "#ffffff" : c.edge} strokeWidth={on ? 2.2 : 1.4} />
                  <g transform="translate(10,17)" style={{ color: c.text }}><TechIcon id={id} /></g>
                  <text x="36" y="24" className="cc-tname" fill={c.text}>{tt.short || tt.name}</text>
                  <text x="36" y="40" className="cc-tmeta" fill={mix(c.text, "#0d141a", 0.42)}>
                    {s === "known" ? "understood"
                      : s === "working" ? `${states[id].left}w remaining`
                      : `${tt.scrap} scrap · ${researchTurns(P, tt, nat)}w`}
                  </text>
                  {s === "known" && <path d="M148 15l4 4 7-8" stroke="#a6e0bd" strokeWidth="2"
                    fill="none" strokeLinecap="round" strokeLinejoin="round" />}
                  {s === "working" && (
                    <rect x="10" y={NODE_H - 9} width={(NODE_W - 20) * frac} height="3" rx="1.5" fill="#8fe3d6" />
                  )}
                  {(s === "locked" || s === "poor" || s === "busy") && (
                    <g transform={`translate(${NODE_W - 21},9)`} stroke="#7b8f9b" strokeWidth="1.4" fill="none">
                      <rect x="1" y="5" width="9" height="7" rx="1.5" />
                      <path d="M3 5V3.5a2.5 2.5 0 0 1 5 0V5" />
                    </g>
                  )}
                  {tt.site && <circle cx={NODE_W - 12} cy={NODE_H - 13} r="3.4"
                    fill={hasSite(game, P, tt) ? "#9fd6b4" : "#d09a3c"} />}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="shrink-0 border-t cc-border-28363f p-4 cc-bg-101820">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="disp cc-text-18px">{t.name}</span>
            <span className="num cc-text-12d5px cc-text-c9a37a">{t.scrap} scrap · {researchTurns(P, t, nat)} seasons</span>
            {st.s === "known" && <span className="cc-text-12d5px cc-text-9fd6b4">already understood</span>}
          </div>
          <div className="cc-text-13px cc-text-c6d6de mt-1 leading-relaxed">{t.desc}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {t.gives.map((g) => (
              <span key={g} className="cc-text-12px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">{g}</span>
            ))}
            {t.site && (
              <span className={`cc-text-12px rounded px-1.5 py-0.5 border ${hasSite(game, P, t)
                ? "cc-border-3d5a4a cc-text-9fd6b4" : "cc-border-8a6f36 cc-text-f2c97a"}`}>
                ground: {t.site.label}{hasSite(game, P, t) ? " — held" : ""}
              </span>
            )}
          </div>
          {st.why && <div className="cc-text-12d5px cc-text-c9a37a mt-2">{st.why}</div>}
          {st.s === "open" && (
            <button type="button" onClick={() => { onResearch(sel); onClose(); }}
              className="w-full mt-3 py-2.5 rounded cc-bg-2a3a4a cc-hover-bg-35495c border cc-border-4d7488 cc-text-dfeaf0 disp cc-text-15px transition-colors">
              Set the scholars on it
            </button>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function AdvancesPanel({ game, P, onResearch, onOpenTree }) {
  const nat = game.nations[P];
  const busy = nat.research;
  const known = Object.keys(nat.known || {}).length;
  const open = TECH_IDS.filter((id) => techState(game, P, id).s === "open");
  const waiting = TECH_IDS.filter((id) => {
    const st = techState(game, P, id);
    return st.s === "locked" && TECHS[id].site && !hasSite(game, P, TECHS[id]);
  });

  return (
    <div>
      <button type="button" onClick={onOpenTree}
        className="w-full py-3 rounded cc-bg-2a3a4a cc-hover-bg-35495c border cc-border-4d7488 cc-text-dfeaf0 disp cc-text-15px flex items-center justify-center gap-2 transition-colors">
        <Hammer size={16} /> Consult the scholars
      </button>

      {busy ? (
        <div className="rounded border cc-border-4d9aa6 cc-bg-152a30 px-3 py-2.5 mt-3">
          <div className="cc-text-12px cc-text-a7bac6 mb-1">Under way</div>
          <div className="flex items-baseline gap-2">
            <span className="disp cc-text-15px flex-1">{TECHS[busy.id].name}</span>
            <span className="num cc-text-12d5px cc-text-8fe3d6">
              {busy.left} winter{busy.left === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-2 cc-h-5px cc-bg-26333c rounded overflow-hidden">
            <div className="h-full cc-bar" style={{
              width: `${((researchTurns(P, TECHS[busy.id], nat) - busy.left) / researchTurns(P, TECHS[busy.id], nat)) * 100}%`,
              background: "#8fe3d6" }} />
          </div>
          <div className="cc-text-12px cc-text-93a9b5 mt-2">{TECHS[busy.id].gives.join(" · ")}</div>
        </div>
      ) : (
        <div className="rounded border cc-border-31454f cc-bg-131f27 px-3 py-2.5 mt-3">
          <div className="cc-text-13px cc-text-c6d6de">
            The scholars are idle. {open.length
              ? `${open.length} line${open.length === 1 ? "" : "s"} of work could start now.`
              : "Nothing can start until you hold more, or earn more scrap."}
          </div>
        </div>
      )}

      <Section title="Where you stand">
        <Row label="Understood" value={`${known} of ${TECH_IDS.length}`} />
        <Row label="Could start now" value={open.length} tint={open.length ? "#9fd6b4" : undefined} />
        <Row label="Waiting on ground" value={waiting.length} tint={waiting.length ? "#f2c97a" : undefined} />
      </Section>

      {waiting.length > 0 && (
        <Section title="Held up for want of ground">
          {waiting.map((id) => (
            <div key={id} className="cc-text-12d5px mb-1.5">
              <span className="cc-text-dfeaf0">{TECHS[id].name}</span>
              <span className="cc-text-c9a37a"> — needs {TECHS[id].site.label}.</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function ProductionPanel({ game, P, onCraft }) {
  const nat = game.nations[P];
  const open = unitsFor(nat);
  const { hands, assigned, idle, over, per, total } = craftPlan(nat, game.provinces, P);
  const huts = Object.values(game.provinces).filter(
    (p) => p.owner === P && hasBuild(p, "workshop")).length;
  const seats = Object.values(game.provinces).filter((p) => p.owner === P && p.capital).length;

  return (
    <div>
      <div className="rounded border cc-border-31454f cc-bg-131f27 px-3.5 py-3 mb-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="disp cc-text-18px flex-1">The workshops</span>
          <span className="num cc-text-15px cc-text-8fe3d6">{total} arms a season</span>
        </div>
        <div className="flex items-center gap-4 mt-2.5 flex-wrap">
          <div className="leading-none">
            <div className="num cc-text-20px">{hands}</div>
            <div className="cc-text-11d5px cc-text-8399a6">craftsmen</div>
          </div>
          <div className="leading-none">
            <div className="num cc-text-20px" style={{ color: over ? "#e0644a" : "#b6c2cc" }}>{assigned}</div>
            <div className="cc-text-11d5px cc-text-8399a6">at a bench</div>
          </div>
          <div className="leading-none">
            <div className="num cc-text-20px" style={{ color: idle > 0 ? "#e8b98a" : "#6fae8c" }}>{idle}</div>
            <div className="cc-text-11d5px cc-text-8399a6">idle</div>
          </div>
          <div className="cc-text-12d5px cc-text-93a9b5 flex-1 min-w-0 leading-snug">
            {seats ? `Your seat keeps ${HANDS_SEAT}` : "You hold no seat"}
            {huts ? `, and ${huts} craftsmen's hut${huts === 1 ? "" : "s"} another ${huts * HANDS_PER_HUT}` : ""}.
            Each turns out {ARMS_PER_HAND} a season.
          </div>
        </div>
      </div>

      {over && (
        <div className="rounded border cc-border-8a4a38 px-3 py-2 mb-2.5 cc-text-12d5px cc-text-e8b98a leading-snug">
          You have {assigned} at the benches and only {hands} craftsmen left. Every line is
          working short until you take some off.
        </div>
      )}
      {!over && idle > 0 && (
        <div className="rounded border cc-border-3d6470 px-3 py-2 mb-2.5 cc-text-12d5px cc-text-cfe0e8 leading-snug">
          <span className="num">{idle}</span> {idle === 1 ? "craftsman is" : "craftsmen are"} standing
          about making nothing. Put them on a line below.
        </div>
      )}

      <p className="cc-text-12d5px cc-text-93a9b5 mb-2 leading-relaxed">
        Put your craftsmen on the arms you mean to use. A company cannot be raised until its
        own arms are made — no amount of scrap will conjure a bow.
      </p>

      <div className="grid gap-1.5">
        {open.map((id) => {
          const u = UNITS[id];
          const on = Math.max(0, (nat.crafts || {})[id] || 0);
          const rack = (nat.arms || {})[id] || 0;
          const rate = per[id] || 0;
          const cap = u.size * 3;
          const companies = Math.floor(rack / u.size);
          const short = Math.max(0, u.size - rack);
          const eta = rate > 0 ? Math.ceil(short / rate) : null;
          const full = rack >= cap;
          return (
            <div key={id} className={`rounded border px-3 py-2.5 ${on
              ? "cc-border-31454f cc-bg-131f27" : "cc-border-25313a"}`}>
              <div className="flex items-baseline gap-2">
                <span className={`cc-text-14px flex-1 ${on ? "" : "cc-text-95aab6"}`}>{u.name}</span>
                <span className="num cc-text-12d5px cc-text-a0b6c1">{rack} on the rack</span>
                <span className="cc-text-11d5px cc-text-8399a6">of {cap} max</span>
              </div>

              {/* The bar is marked off in companies, so "enough to raise one"
                  is something you can see rather than divide out. */}
              <div className="mt-1.5 cc-h-5px cc-bg-26333c rounded overflow-hidden relative">
                <div className="h-full cc-bar" style={{ width: `${Math.min(100, (rack / cap) * 100)}%`,
                  background: companies >= 1 ? "#9fd6b4" : "#8fe3d6" }} />
                <span style={{ position: "absolute", top: 0, bottom: 0, left: "33.33%", width: 1, background: "#0d141a" }} />
                <span style={{ position: "absolute", top: 0, bottom: 0, left: "66.66%", width: 1, background: "#0d141a" }} />
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button type="button" onClick={() => onCraft(id, -1)} disabled={on === 0}
                  className={`cc-craftbtn ${on === 0 ? "cc-text-78909e" : ""}`}>−</button>
                <span className="num cc-text-13px cc-w-28px text-center">{on}</span>
                <button type="button" onClick={() => onCraft(id, 1)} disabled={idle === 0}
                  className={`cc-craftbtn ${idle === 0 ? "cc-text-78909e" : ""}`}>+</button>
                <span className="cc-text-11d5px cc-text-8399a6">
                  {on === 1 ? "craftsman" : "craftsmen"}
                  {rate > 0 ? ` · ${rate} a season` : ""}
                </span>
                <span className="cc-text-12px flex-1 min-w-0 text-right"
                  style={{ color: full ? "#e8b98a" : companies >= 1 ? "#9fd6b4" : "#93a9b5" }}>
                  {full ? "the rack is full — raise them or move the works on"
                    : companies >= 1 ? `enough for ${companies} ${companies === 1 ? "company" : "companies"}`
                    : rate > 0 ? `ready in ${eta} season${eta === 1 ? "" : "s"}`
                    : "no one is working on these"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Section title="Materials">
        <Row label="Scrap" value={Math.round(nat.res.scrap)} />
        <Row label="Metal" value={Math.round(nat.res.metal || 0)}
          tint={(nat.res.metal || 0) > 0 ? "#b6c2cc" : "#e0644a"} />
        <div className="cc-text-12d5px cc-text-93a9b5 mt-1.5 leading-snug">
          {nat.known?.smelting
            ? "Ore comes out of the hills and mountains you hold. A mine on either doubles it."
            : "Ore is worthless until somebody can smelt it. Scrap plate is what you make when you have none."}
        </div>
      </Section>
    </div>
  );
}

function LogPanel({ log }) {
  if (!log.length) return <div className="cc-text-13d5px cc-text-93a9b5">Nothing has happened yet.</div>;
  return (
    <div className="grid gap-2">
      {log.map((l, i) => (
        <div key={i} className="cc-text-13px leading-snug border-l-2 cc-border-31454f pl-2.5 py-0.5">
          <span className="num cc-text-11d5px cc-text-8399a6 mr-1.5">W{l.turn}</span>
          <span className="cc-text-cfe0e8">{l.m}</span>
        </div>
      ))}
    </div>
  );
}

const Section = ({ title, children }) => (
  <div className="mb-4">
    <div className="cc-text-12px cc-text-8399a6 mb-1.5 pb-1 border-b cc-border-243138">{title}</div>
    {children}
  </div>
);

/* ------------------------------ RECRUIT ----------------------------------- */
function RecruitPanel({ natId, nat, provName, prov, onClose, onConfirm }) {
  const open = unitsFor(nat);
  const [type, setType] = useState(open[0] || "spearmen");
  const wOpts = gradesFor(nat, WEAPON_GRADES), aOpts = gradesFor(nat, ARMOUR_GRADES);
  const [wg, setWg] = useState(wOpts[wOpts.length - 1].id);
  const [ag, setAg] = useState(aOpts[aOpts.length - 1].id);
  const d = UNITS[type];
  const cost = unitCost(type, natId, nat, wg, ag);
  const rack = (nat.arms || {})[type] || 0;
  const armed = rack >= d.size;
  const afford = nat.res.scrap >= cost.scrap && nat.res.men >= cost.men
    && (nat.res.metal || 0) >= cost.metal;
  // Half of them never come back to this ground, so the province has to have
  // them in the first place.
  const popCost = popCostOf(d.size);
  const here = Math.round(prov?.pop || 0);
  const peopled = here >= popCost;
  const st = unitStats({ type, wg, ag });
  const byTier = UNIT_TIERS
    .map((t) => ({ t, ids: open.filter((id) => UNITS[id].tier === t.id) }))
    .filter((g) => g.ids.length);
  const locked = UNIT_TIERS.filter((t) => !byTier.some((g) => g.t.id === t.id));

  return (
    <Overlay onClose={onClose}>
      <div className="cc-w-980px cc-max-w-96vw cc-max-h-92vh rounded-lg border cc-border-31454f cc-bg-0d141a flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b cc-border-28363f flex items-center gap-3"
          style={{ background: "linear-gradient(90deg,#14202a,#0d141a)" }}>
          <Hammer size={18} className="cc-text-8fe3d6" />
          <div className="min-w-0">
            <div className="disp cc-text-21px">Raise a company</div>
            <div className="cc-text-12d5px cc-text-a7bac6">Mustering at {provName}</div>
          </div>
          <button type="button" onClick={onClose} className="cc-seatclose cc-static ml-auto" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto thin p-5 flex flex-col cc-lg-flex-row gap-5">
          <div className="cc-w-300px shrink-0">
            {byTier.map(({ t, ids }) => (
              <div key={t.id} className="mb-4">
                <div className="cc-text-12d5px cc-text-a7bac6 mb-1 pb-1 border-b cc-border-243138">
                  {t.name}
                </div>
                <div className="cc-text-12px cc-text-8399a6 mb-2">{t.desc}</div>
                <div className="grid gap-1.5">
                  {ids.map((id) => {
                    const u = UNITS[id];
                    const on = type === id;
                    return (
                      <button key={id} type="button" onClick={() => setType(id)}
                        className={`text-left px-3 py-2 rounded border transition-colors ${on
                          ? "cc-border-4d9aa6 cc-bg-152a30" : "cc-border-31454f cc-hover-border-3d6470"}`}>
                        <div className="flex items-center gap-2.5">
                          <UnitMark type={id} size={22} lit={on} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="cc-text-13d5px flex-1">{u.name}</span>
                              <span className="num cc-text-11d5px cc-text-c9a37a">{u.size}</span>
                            </div>
                            <div className="cc-text-11d5px cc-text-93a9b5">{u.role}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {locked.length > 0 && (
              <div className="cc-text-12px cc-text-78909e leading-snug">
                {locked.map((t) => t.name).join(", ")} companies are beyond your people for now.
                What your scholars learn opens them.
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="rounded border cc-border-31454f cc-bg-131f27 p-4">
              <div className="flex gap-4 flex-wrap">
                <UnitArt type={type} size={170} plinth />
                <div className="flex-1 min-w-0">
                  <div className="disp cc-text-22px">{d.name}</div>
                  <div className="cc-text-13px cc-text-8fe3d6">{d.role}</div>
                  <p className="cc-text-13d5px cc-text-dfeaf0 leading-relaxed mt-2">{d.desc}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {d.hold && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">holds ground {Math.round((d.hold - 1) * 100)}% better</span>}
                    {d.press && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">presses {Math.round((d.press - 1) * 100)}% harder</span>}
                    {d.antiCav > 1 && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">×{d.antiCav} against horse</span>}
                    {d.cav && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">mounted</span>}
                    {d.siege && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">siege piece</span>}
                    {d.scout > 0 && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">{d.scout >= 2 ? "names what it sees" : "counts what it sees"}</span>}
                    {d.carry > 0 && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">carries the line {d.carry} hexes further</span>}
                    {d.slow > 0 && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-5a4636 cc-text-e8b98a">−{d.slow} movement for the whole warband</span>}
                  </div>
                </div>
              </div>

              <div className="grid gap-2 mt-4">
                {[["What they carry", wOpts, wg, setWg, "mul"],
                  ["What they wear", aOpts, ag, setAg, "def"]].map(([label, opts, cur, set, kind]) => (
                  <div key={label}>
                    <div className="cc-text-12d5px cc-text-a7bac6 mb-1">{label}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {opts.map((g) => (
                        <button key={g.id} type="button" onClick={() => set(g.id)}
                          className={`px-2.5 py-1.5 rounded border cc-text-12d5px transition-colors ${cur === g.id
                            ? "cc-border-4d9aa6 cc-bg-152a30 cc-text-dfeaf0"
                            : "cc-border-31454f cc-text-a0b6c1 cc-hover-border-3d6470"}`}>
                          {g.name}
                          {kind === "mul" && <span className="num cc-text-11d5px cc-text-c9a37a"> ×{g.mul.toFixed(2)}</span>}
                          {kind === "def" && g.def > 0 && <span className="num cc-text-11d5px cc-text-c9a37a"> +{g.def}</span>}
                        </button>
                      ))}
                    </div>
                    <div className="cc-text-12px cc-text-93a9b5 mt-1">
                      {(kind === "mul" ? wGrade(cur) : aGrade(cur)).desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-1.5 mt-4">
                <Row label="Strength" value={d.size} />
                <Row label="Melee" value={st.melee} />
                <Row label="Shot" value={st.ranged} tint={st.ranged ? "#9fd6b4" : undefined} />
                <Row label="Armour" value={st.def} />
                <Row label="Nerve" value={d.moraleBase} />
                <Row label="Eats each season" value={`${st.food} rations`} />
                {st.fuel > 0 && <Row label="Burns each season" value={`${st.fuel} fuel`} />}
                {st.powder > 0 && <Row label="Powder per round" value={st.powder} />}
              </div>
            </div>

            <div className="rounded border cc-border-31454f cc-bg-131f27 p-3.5 mt-3">
              <div className="cc-text-12d5px cc-text-a7bac6 mb-2">Cost to raise</div>
              <Row label="Scrap" value={cost.scrap} tint={nat.res.scrap < cost.scrap ? "#e0644a" : undefined} />
              {cost.metal > 0 && (
                <Row label="Metal" value={cost.metal}
                  tint={(nat.res.metal || 0) < cost.metal ? "#e0644a" : undefined} />
              )}
              <Row label="Recruits" value={cost.men} tint={nat.res.men < cost.men ? "#e0644a" : undefined} />
              <Row label="Arms on the rack" value={`${rack} of ${d.size}`}
                tint={armed ? "#9fd6b4" : "#e0644a"} />
              <Row label={`People of ${provName || "this holding"}`}
                value={`${popCost} of ${here.toLocaleString()}`}
                tint={peopled ? undefined : "#e0644a"} />
            </div>

            <button type="button" disabled={!afford || !armed || !peopled} onClick={() => onConfirm(type, wg, ag)}
              className={`w-full mt-3 py-2.5 rounded disp cc-text-15px border transition-colors ${afford && armed && peopled
                ? "cc-bg-2b3f2c cc-hover-bg-37502f cc-border-4a6b45 cc-text-d7ecc9"
                : "cc-border-25313a cc-text-78909e"}`}>
              {!armed ? `Only ${rack} of ${d.size} armed — set the works to it`
                : !peopled ? "Not enough people on this ground"
                : afford ? `Raise the ${d.name.toLowerCase()}` : "Not enough to raise them"}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* One company in the line of battle: what it is, what it carries, how much of
   it is still standing and whether its nerve is going. The loss is shown only
   while an exchange is on screen, so the number always refers to something the
   player has just watched happen rather than to history. */
function CompanyRow({ u, col, showLoss }) {
  const strFrac = Math.max(0, Math.min(1, u.str / (u.max || 1)));
  const morFrac = Math.max(0, Math.min(1, u.morale / (u.maxMorale || 1)));
  const spent = u.str <= 0 || u.morale <= 0;
  return (
    <div className={`rounded border px-2.5 py-2 ${spent ? "cc-border-25313a" : "cc-border-31454f cc-bg-131f27"}`}>
      <div className="flex items-center gap-2">
        <UnitArt type={u.type} size={26} />
        <div className="min-w-0 flex-1">
          <div className="cc-text-13px truncate" style={{ color: spent ? "#78909e" : col }}>{unitName(u)}</div>
          <div className="cc-text-11d5px cc-text-8399a6 truncate">{unitKit(u)}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="num cc-text-13px">
            {u.str}<span className="cc-text-11d5px cc-text-8399a6">/{u.max}</span>
          </div>
          {showLoss && u.lastLoss > 0 && (
            <div className="num cc-text-11d5px cc-text-e0644a">\u2212{u.lastLoss}</div>
          )}
        </div>
      </div>
      <div className="mt-1.5 cc-h-3px cc-bg-26333c rounded overflow-hidden">
        <div className="h-full" style={{ width: `${strFrac * 100}%`, background: col }} />
      </div>
      <div className="mt-1 cc-h-3px cc-bg-26333c rounded overflow-hidden" title="nerve">
        <div className="h-full" style={{ width: `${morFrac * 100}%`,
          background: morFrac > 0.5 ? "#9fd6b4" : morFrac > 0.25 ? "#e8b98a" : "#e0644a" }} />
      </div>
    </div>
  );
}

/* ------------------------------ THE BATTLE --------------------------------
   Two screens in one. First the line is drawn: every company is dragged onto
   the left, the centre, the right or into reserve, over ground that is
   different in each sector. Then it is fought, sector by sector, with an order
   for each and a reserve to throw in when you decide the moment has come.

   The previous version of this was a column of numbers and one button, and the
   complaint about it was exactly right: it did not feel like a battle. What
   makes it feel like one is seeing the line — which part of it is winning,
   which part is about to go, and what is about to come round the end of it.
   ------------------------------------------------------------------------ */
function CompanyChip({ u, col, small, held, onPick, draggable, onDragStart }) {
  const frac = Math.max(0, Math.min(1, u.str / (u.max || 1)));
  const mor = Math.max(0, Math.min(1, u.morale / (u.maxMorale || 1)));
  return (
    <div
      draggable={!!draggable}
      onDragStart={onDragStart}
      onClick={onPick}
      className={`cc-chip ${held ? "cc-chipheld" : ""} ${onPick ? "cc-chippick" : ""}`}
      style={{ borderColor: held ? "#8fe3d6" : undefined }}>
      <div className="flex items-center gap-1.5">
        <UnitMark type={u.type} size={small ? 14 : 17} />
        <span className="cc-text-11d5px flex-1 min-w-0 truncate" style={{ color: col }}>{unitName(u)}</span>
        <span className="num cc-text-11d5px cc-text-a0b6c1">{u.str}</span>
      </div>
      <div className="cc-chipbar mt-1"><span style={{ width: `${frac * 100}%`, background: col }} /></div>
      <div className="cc-chipbar mt-0.5">
        <span style={{ width: `${mor * 100}%`,
          background: mor > 0.5 ? "#9fd6b4" : mor > 0.25 ? "#e8b98a" : "#e0644a" }} />
      </div>
    </div>
  );
}

function BattleScreen({ b, nations, P, onStep, onAuto, onClose, onDeploy, onPost, onCommit, onBegin }) {
  const pSide = b.aNat === P ? "a" : b.dNat === P ? "d" : null;
  const foe = pSide === "a" ? "d" : "a";
  const aN = nations[b.aNat], dN = nations[b.dNat];
  const myN = pSide === "a" ? aN : dN, theirN = pSide === "a" ? dN : aN;
  const [held, setHeld] = useState(null);
  const deploying = b.phase === "deploy" && !!pSide;

  /* The field is loud while you are on it, and quiet the moment you leave. */
  useEffect(() => { Sound.field(true); return () => Sound.field(false); }, []);
  /* One pass over what the last round produced, so the ear hears the same
     things the log reports: a line giving way, a flank turned, a pursuit. */
  const heard = useRef(0);
  useEffect(() => {
    if (deploying || heard.current === b.round) return;
    heard.current = b.round;
    const tail = b.log.slice(-8);
    if (tail.some((l) => l.t === "flank")) Sound.play("flanked");
    if (tail.some((l) => l.t === "give")) Sound.play("give");
    else if (tail.some((l) => l.t === "rout" || l.t === "dead")) Sound.play("give");
    if (b.over) Sound.play(b.winner === pSide ? "charge" : "flanked");
  }, [b.round, b.over, deploying]);
  const ex = b.lastExchange;
  const ground = b.ground || { left: "open", centre: "open", right: "open" };

  const mine = pSide ? b[pSide].units : [];
  const theirs = pSide ? b[foe].units : b.d.units;
  // Before the lines close you only know what your outriders brought back —
  // unless you have spent seasons camped in front of the place, in which case
  // you have watched them on the wall every morning and know exactly who is up
  // there.
  const besieger = !!b.storming && pSide === "a";
  const seen = deploying ? (besieger ? 2 : scoutLevel(mine)) : 2;
  const myPost = (pSide === "a" ? b.aPost : b.dPost) || {};
  const inSec = (list, sec) => list.filter((u) => u.pos === sec);
  const strOf = (list) => list.reduce((n, u) => n + u.str, 0);
  const myBroke = (b.broken || {})[pSide] || {};
  const theirBroke = (b.broken || {})[foe] || {};

  const place = (id, sec) => {
    onDeploy(mine.map((u) => (u.id === id ? { ...u, pos: sec } : u)));
    setHeld(null);
  };
  const drop = (sec) => (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || held;
    if (id) place(id, sec);
  };

  const reserve = inSec(mine, "res");
  const myPowder = pSide === "a" ? b.aPowder : b.dPowder;

  const Sector = ({ sec }) => {
    const gr = GROUND[ground[sec]] || GROUND.open;
    const us = inSec(mine, sec), them = inSec(theirs, sec);
    const ourStr = strOf(us), theirStr = strOf(them);
    const tot = Math.max(1, ourStr + theirStr);
    const gone = myBroke[sec], theirGone = theirBroke[sec];
    const flanked = !gr.safe && ADJACENT[sec].some((t) => myBroke[t]);
    const turning = !gr.safe && ADJACENT[sec].some((t) => theirBroke[t]);
    return (
      <div className={`cc-sector ${gone ? "cc-sectorgone" : ""} ${flanked ? "cc-sectorflank" : ""}`}
        onDragOver={(e) => deploying && e.preventDefault()}
        onDrop={deploying ? drop(sec) : undefined}
        onClick={deploying && held ? () => place(held, sec) : undefined}>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="disp cc-text-14px cc-text-e5eef3">{SECTOR_NAME[sec]}</span>
          <span className={`cc-groundtag ${ground[sec] === "rough" ? "cc-gr-rough"
            : ground[sec] === "anchored" ? "cc-gr-anchor" : ""}`} title={gr.desc}>{gr.name}</span>
        </div>

        <div className="cc-facing" style={{ color: theirN.color }}>
          {seen === 0 ? "Opposite" : theirN.short}
        </div>
        <div className="grid gap-1">
          {seen === 2 && them.map((u) => <CompanyChip key={u.id} u={u} col={theirN.color} small />)}
          {seen === 1 && them.map((u) => (
            <div key={u.id} className="cc-chip cc-chipdark">
              <div className="flex items-center gap-1.5">
                <span className="cc-blindmark" style={{ background: theirN.color }} />
                <span className="cc-text-11d5px cc-text-8399a6">a company</span>
              </div>
            </div>
          ))}
          {seen === 0 && (
            <div className="cc-chip cc-chipdark">
              <div className="cc-text-11d5px cc-text-6f8794">
                dust, and nobody sent to look
              </div>
            </div>
          )}
          {seen > 0 && !them.length && (
            <div className={`cc-text-11d5px py-1 ${theirGone ? "cc-text-9fd6b4" : "cc-text-6f8794"}`}>
              {theirGone ? "swept off this ground" : "nobody opposite"}
            </div>
          )}
        </div>

        {!deploying && (
          <div className="cc-tug my-1.5" title={`${ourStr} against ${theirStr}`}>
            <span style={{ width: `${(theirStr / tot) * 100}%`, background: theirN.color }} />
            <span style={{ width: `${(ourStr / tot) * 100}%`, background: myN.color }} />
          </div>
        )}
        {(flanked || turning) && !deploying && (
          <div className={`cc-text-11d5px mb-1 ${flanked ? "cc-text-e0644a" : "cc-text-9fd6b4"}`}>
            {flanked ? "taken in the flank" : "turning their flank"}
          </div>
        )}

        <div className="cc-facing mt-1.5" style={{ color: myN.color }}>{myN.short}</div>
        <div className="grid gap-1">
          {us.map((u) => (
            <CompanyChip key={u.id} u={u} col={myN.color} held={held === u.id}
              draggable={deploying}
              onDragStart={deploying ? (e) => { e.dataTransfer.setData("text/plain", u.id); setHeld(u.id); } : undefined}
              onPick={deploying ? () => setHeld(held === u.id ? null : u.id) : undefined} />
          ))}
          {!us.length && (
            <div className={`cc-text-11d5px py-1 ${gone ? "cc-text-e0644a" : "cc-text-6f8794"}`}>
              {gone ? "the line here is gone" : deploying ? "drop a company here" : "nobody"}
            </div>
          )}
        </div>

        {!deploying && !!us.length && (
          <div className="cc-postrow mt-2">
            {POSTURE_IDS.map((id) => (
              <button key={id} type="button" title={POSTURES[id].desc}
                onClick={() => onPost(sec, id)}
                className={`cc-postbtn ${myPost[sec] === id ? "cc-poston" : ""}`}>
                {POSTURES[id].name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Overlay>
      <div className="cc-w-1180px cc-max-w-96vw cc-max-h-93vh rounded-lg border cc-border-3a2a26 cc-bg-0d1116 flex flex-col overflow-hidden"
        style={{ boxShadow: "0 0 80px rgba(224,100,74,.14)" }}>

        <div className="px-5 py-3 border-b cc-border-2a1f1c"
          style={{ background: "linear-gradient(90deg,#1a1210,#0d1116)" }}>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5">
            <Target size={18} className="cc-text-e0644a shrink-0" />
            <div className="disp cc-text-21px">The field at {b.provName}</div>
            <div className="cc-text-12d5px cc-text-95aab6">
              {/* A blind commander does not know their strength either, and a
                  scout who could only count heads brings back a round number. */}
              {myN.short} <span className="num">{strOf(mine)}</span> against{" "}
              {seen === 0 ? "an unknown number"
                : seen === 1
                  ? <>about <span className="num">{Math.round(strOf(theirs) / 50) * 50}</span> of {theirN.short}</>
                  : <>{theirN.short} <span className="num">{strOf(theirs)}</span></>}
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="cc-text-12px cc-text-c6d6de">round</span>
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className="cc-w-7px cc-h-7px rounded-sm"
                  style={{ background: i < Math.min(b.round, 10) - (b.over || deploying ? 0 : 1) ? "#e0644a" : "#2c3d47" }} />
              ))}
            </div>
          </div>
        </div>

        {deploying && (
          <div className="px-5 py-2.5 border-b cc-border-2a1f1c flex items-center flex-wrap gap-2">
            <span className="cc-text-12d5px cc-text-a7bac6 mr-1">Draw them up:</span>
            {FORMATION_IDS.map((id) => (
              <button key={id} type="button" title={FORMATIONS[id].desc}
                onClick={() => onDeploy(deployUnits(mine, id))}
                className="cc-formbtn">{FORMATIONS[id].name}</button>
            ))}
            <span className={`cc-text-11d5px ml-auto ${seen === 0 ? "cc-text-e8b98a" : "cc-text-6f8794"}`}>
              {besieger ? "You have watched this wall for seasons. You know every man on it."
                : seen === 2 ? "Your outriders have counted them and named them."
                : seen === 1 ? "Your scouts can count them, no more than that."
                : "Nobody scouted. You are drawing up blind."}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto thin p-4">
          <div className="cc-line">
            {SECTORS.map((sec) => <Sector key={sec} sec={sec} />)}
          </div>

          <div className="cc-reserve mt-3"
            onDragOver={(e) => deploying && e.preventDefault()}
            onDrop={deploying ? drop("res") : undefined}
            onClick={deploying && held ? () => place(held, "res") : undefined}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="disp cc-text-14px cc-text-e5eef3">Reserve</span>
              <span className="cc-text-11d5px cc-text-93a9b5">
                held back — they take nothing and give nothing until you send them in
              </span>
              {!deploying && reserve.length > 0 && (
                <span className="ml-auto flex gap-1.5">
                  {SECTORS.map((sec) => (
                    <button key={sec} type="button" onClick={() => onCommit(sec)} className="cc-formbtn">
                      Send in on the {sec}
                    </button>
                  ))}
                </span>
              )}
            </div>
            <div className="cc-reserverow">
              {reserve.map((u) => (
                <CompanyChip key={u.id} u={u} col={myN.color} held={held === u.id}
                  draggable={deploying}
                  onDragStart={deploying ? (e) => { e.dataTransfer.setData("text/plain", u.id); setHeld(u.id); } : undefined}
                  onPick={deploying ? () => setHeld(held === u.id ? null : u.id) : undefined} />
              ))}
              {!reserve.length && (
                <div className="cc-text-11d5px cc-text-6f8794 py-1">
                  {deploying ? "nothing held back" : "no reserve"}
                </div>
              )}
            </div>
          </div>

          {!deploying && ex && (
            <div className="rounded border cc-border-2a1f1c cc-bg-121a20 px-3.5 py-2.5 mt-3">
              <div className="flex items-center gap-5 flex-wrap">
                <div>
                  <div className="num cc-text-20px" style={{ color: aN.color }}>−{ex.aCas}</div>
                  <div className="cc-text-11d5px cc-text-95aab6">{aN.short} fell</div>
                </div>
                <div>
                  <div className="num cc-text-20px" style={{ color: dN.color }}>−{ex.dCas}</div>
                  <div className="cc-text-11d5px cc-text-95aab6">{dN.short} fell</div>
                </div>
                <div className="cc-text-12d5px cc-text-a7bac6 flex-1 min-w-0">
                  {b.log.filter((l) => ["rout", "dead", "flank", "give", "end"].includes(l.t)).slice(-3)
                    .map((l, i) => <div key={i} className="truncate">{l.m}</div>)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t cc-border-2a1f1c flex items-center gap-2 flex-wrap">
          {deploying ? (
            <>
              <div className="cc-text-12d5px cc-text-93a9b5 flex-1 min-w-0">
                {inSec(mine, "left").length + inSec(mine, "centre").length + inSec(mine, "right").length === 0
                  ? "Put somebody in the line first."
                  : SECTORS.some((sec) => !inSec(mine, sec).length)
                    ? "An empty sector is an open flank — the enemy will come round it."
                    : "The line is drawn."}
              </div>
              <button type="button" onClick={() => { Sound.play("charge"); onBegin(); }}
                disabled={!SECTORS.some((sec) => inSec(mine, sec).length)}
                className="cc-bigbtn cc-bigfight">Take the field</button>
            </>
          ) : b.over ? (
            <>
              <div className="disp cc-text-16px flex-1 min-w-0">
                {b.log[b.log.length - 1]?.m || "It is over."}
              </div>
              <button type="button" onClick={onClose} className="cc-bigbtn cc-bigfight">Count the cost</button>
            </>
          ) : (
            <>
              <div className="cc-text-12d5px cc-text-93a9b5 flex-1 min-w-0">
                <span className="num">{myPowder}</span> powder in hand
                {reserve.length ? ` · ${reserve.length} in reserve` : ""}
              </div>
              <button type="button" onClick={() => onStep("withdraw")} className="cc-bigbtn cc-bigoff">
                Break off
              </button>
              <button type="button" onClick={() => onAuto(null)} className="cc-bigbtn cc-bigoff">
                Fight it out
              </button>
              <button type="button" onClick={() => { Sound.play("horn"); onStep(null); }}
                className="cc-bigbtn cc-bigfight">
                Give the order
              </button>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}



/* ------------------------------ SEAT OF POWER -----------------------------
   A capital is more than a province. From here you set the standing edict that
   shapes your whole realm, and manage the home ground itself.
   ------------------------------------------------------------------------ */
const EDICTS = {
  none:     { name: "No standing edict", desc: "The wards govern themselves and nobody is asked for anything extra.", mul: {} },
  dredge:   { name: "Dredge the wrecks", desc: "Every hull on the flats goes to the cutting yards. The fishing crews are pulled off the water to do it.",
              mul: { scrap: 1.35, food: 0.8 } },
  granary:  { name: "Open the granaries", desc: "Seed corn and dyked plots before salvage. The yards go quiet.",
              mul: { food: 1.35, scrap: 0.8 } },
  levy:     { name: "Levy the wards", desc: "Every household owes a body. They arrive hungry and unarmed.",
              mul: { men: 1.6, food: 0.85, scrap: 0.9 } },
  saltpetre:{ name: "Bank the powder mills", desc: "Nitre beds and charcoal kilns take priority, and they burn everything that will burn.",
              mul: { powder: 1.5, fuel: 0.7 } },
  quarters: { name: "Winter quarters", desc: "Warbands stand down to half rations and short marches. Cheap, and slow.",
              mul: {}, upkeep: 0.65, move: -1 },
};
const EDICT_IDS = Object.keys(EDICTS);

function edictChips(id) {
  const e = EDICTS[id];
  const out = [];
  Object.entries(e.mul || {}).forEach(([k, v]) => {
    const label = RES_META.find((r) => r.k === k)?.label.toLowerCase() || k;
    out.push({ t: `${label} ${v > 1 ? "+" : "−"}${Math.abs(Math.round((v - 1) * 100))}%`, good: v > 1 });
  });
  if (e.upkeep) out.push({ t: `warbands eat ${Math.round((1 - e.upkeep) * 100)}% less`, good: true });
  if (e.move) out.push({ t: `${e.move} movement`, good: false });
  return out;
}

/* A cold plate of the seat itself. Everything is drawn, nothing is loaded. */
const SEAT_SCENES = {
  // [x, height above the ground, width] on a 200-wide plate, ground at y=62
  dogger: { water: true, ridge: "flats", bridge: true, cranes: [[46, 30], [138, 26]],
    towers: [[8,26,9],[22,38,11],[36,20,8],[48,44,12],[63,30,9],[76,48,13],[92,26,8],
             [104,36,10],[118,22,9],[130,42,11],[146,28,9],[158,34,10],[172,20,8],[184,32,10]] },
  lyon: { water: true, ridge: "hills", cranes: [[120, 26]],
    towers: [[10,22,9],[24,32,11],[40,18,8],[54,38,12],[70,26,9],[86,34,11],[102,20,8],
             [118,30,10],[134,24,9],[150,36,11],[166,22,9],[182,28,10]] },
  alpine: { water: false, ridge: "peaks", vault: true, cranes: [],
    towers: [[14,16,8],[30,24,9],[46,14,7],[64,20,9],[136,18,8],[154,26,10],[172,16,8],[186,22,9]] },
  karst: { water: true, ridge: "flats", bridge: true, cranes: [[64, 28], [150, 24]],
    towers: [[12,24,9],[28,34,11],[44,18,8],[58,38,12],[74,24,9],[92,32,11],[110,20,8],
             [126,34,10],[144,22,9],[160,30,11],[178,24,9]] },
  boreal: { water: false, ridge: "peaks", ice: true, cranes: [],
    towers: [[16,14,8],[34,20,9],[52,12,7],[72,18,9],[96,14,8],[120,20,9],[146,13,8],[170,17,9]] },
  horde: { water: false, ridge: "flats", tents: true, cranes: [],
    towers: [[20,12,8],[46,16,9],[74,11,7],[104,15,9],[134,12,8],[164,16,9]] },
  solar: { water: false, ridge: "hills", mirrors: true, cranes: [],
    towers: [[12,24,9],[28,34,11],[46,18,8],[62,38,12],[80,24,9],[98,32,11],[118,20,8],
             [136,34,10],[156,22,9],[176,30,11]] },
};

function SeatArt({ id, tier = 0 }) {
  const col = FACTION[id]?.color || "#8fa7b3";
  const sc = SEAT_SCENES[id] || SEAT_SCENES.dogger;
  const G = 28;                                    // ground line on a 200x44 plate
  const rnd = (i) => noise(i * 3.7, i * 1.9, 21);
  const ink = "#050b11";
  const lit = mix(col, "#ffe6b0", 0.62);
  const ridgePts = Array.from({ length: 21 }, (_, i) => {
    const x = i * 10;
    const y = sc.ridge === "peaks" ? G - 9 - (i % 3 === 1 ? 12 : i % 3 === 2 ? 5 : 0) - rnd(i) * 4
      : sc.ridge === "hills" ? G - 4 - rnd(i) * 4
      : G - 1 - rnd(i) * 2;
    return `${x},${y.toFixed(1)}`;
  }).join(" L");

  // A round hut: turf cone, doorway, and a thread of smoke.
  const hut = (x, w, h, i) => (
    <g key={"h" + x}>
      <path d={`M${x - w},${G + 3} Q${x - w * 0.8},${G - h} ${x},${G - h} Q${x + w * 0.8},${G - h} ${x + w},${G + 3} Z`} fill={ink} />
      <path d={`M${x - 1.4},${G + 3} L${x - 1.4},${G - h * 0.45} Q${x},${G - h * 0.62} ${x + 1.4},${G - h * 0.45} L${x + 1.4},${G + 3} Z`}
        fill={lit} opacity={rnd(i + 5) > 0.45 ? 0.5 : 0.14} />
      {rnd(i + 12) > 0.4 && (
        <path d={`M${x},${G - h - 1} q${1.6},-3 ${-0.6},-5.4 q${-2},-2.4 ${0.4},-5`}
          fill="none" stroke="#c8dbe4" strokeWidth="0.55" opacity="0.22" />
      )}
    </g>
  );
  // A pitched hall or house.
  const hall = (x, w, h) => (
    <g key={"l" + x}>
      <path d={`M${x - w},${G + 3} L${x - w},${G - h * 0.55} L${x},${G - h} L${x + w},${G - h * 0.55} L${x + w},${G + 3} Z`} fill={ink} />
      <rect x={x - w * 0.35} y={G - h * 0.42} width={w * 0.7} height={h * 0.28} fill={lit} opacity="0.35" />
    </g>
  );
  const tower = (x, w, h) => (
    <g key={"t" + x}>
      <path d={`M${x - w},${G + 3} L${x - w},${G - h} L${x + w},${G - h} L${x + w},${G + 3} Z`} fill={ink} />
      <path d={`M${x - w - 0.8},${G - h} l0,-2 l1.6,0 l0,1 l1.6,0 l0,-1 l1.6,0 l0,1 l1.6,0 l0,-1 l1.6,0 l0,2 z`} fill={ink} />
      <rect x={x - 0.8} y={G - h * 0.72} width="1.6" height="2.4" fill={lit} opacity="0.45" />
    </g>
  );

  // The settlement itself, which is what actually changes as the seat grows.
  const village = () => {
    if (tier === 0) return (
      <g>
        {[[42, 5, 7], [58, 6.5, 9], [74, 4.5, 6], [92, 7, 10], [110, 5, 7.5], [126, 6, 8.5], [144, 4.5, 6.5]]
          .map(([x, w, h], i) => hut(x, w, h, i))}
        {/* drying racks and a fire */}
        <path d={`M30,${G + 3} l0,-5 M30,${G - 2} l7,0 M37,${G + 3} l0,-5`} stroke={ink} strokeWidth="1.1" fill="none" />
        <path d={`M158,${G + 3} l0,-4 M158,${G - 1} l6,0 M164,${G + 3} l0,-4`} stroke={ink} strokeWidth="1.1" fill="none" />
        <circle cx="84" cy={G + 1} r="2" fill={lit} opacity="0.55" />
      </g>
    );
    if (tier === 1) return (
      <g>
        {[[48, 5, 7], [64, 5.5, 8], [118, 5, 7], [136, 6, 9]].map(([x, w, h], i) => hut(x, w, h, i))}
        {hall(92, 11, 13)}
        {/* split-timber palisade with a gate */}
        <g fill={ink}>
          {Array.from({ length: 34 }, (_, i) => {
            const x = 24 + i * 4.6;
            if (x > 94 && x < 106) return null;
            return <path key={i} d={`M${x},${G + 5} l0,-7.5 l1.1,-1.6 l1.1,1.6 l0,7.5 z`} />;
          })}
          <path d={`M94,${G + 5} l0,-10 l12,0 l0,10 l-2.6,0 l0,-7.4 l-6.8,0 l0,7.4 z`} />
        </g>
      </g>
    );
    if (tier === 2) return (
      <g>
        {hall(78, 10, 15)}{hall(112, 9, 13)}
        {[[62, 4.5, 8], [130, 5, 9]].map(([x, w, h], i) => hut(x, w, h, i))}
        {/* coursed wall with crenellations and flanking towers */}
        <path d={`M26,${G + 5} L26,${G - 6} L174,${G - 6} L174,${G + 5} Z`} fill={ink} />
        <g fill={ink}>
          {Array.from({ length: 25 }, (_, i) => <rect key={i} x={26 + i * 6} y={G - 9} width="3.4" height="3.4" />)}
        </g>
        {tower(40, 5, 19)}{tower(160, 5, 19)}
        <path d={`M96,${G + 5} l0,-9 l10,0 l0,9 z`} fill="#02070b" />
      </g>
    );
    return (
      <g>
        {hall(84, 11, 17)}
        {tower(100, 8, 26)}
        {tower(46, 5.5, 20)}{tower(154, 5.5, 20)}
        {/* angled bastions thrown out from the curtain */}
        <path d={`M20,${G + 5} L20,${G - 7} L180,${G - 7} L180,${G + 5} Z`} fill={ink} />
        <path d={`M20,${G - 7} L34,${G - 12} L48,${G - 7} Z`} fill={ink} />
        <path d={`M152,${G - 7} L166,${G - 12} L180,${G - 7} Z`} fill={ink} />
        <g fill={ink}>
          {Array.from({ length: 27 }, (_, i) => <rect key={i} x={20 + i * 6} y={G - 10.5} width="3.6" height="3.6" />)}
        </g>
        {/* banners on the keep */}
        <path d={`M100,${G - 26} l0,-6`} stroke={mix(col, "#ffffff", 0.4)} strokeWidth="0.9" />
        <path d={`M100,${G - 31.5} l7,2.4 l-7,2.4 z`} fill={col} />
      </g>
    );
  };

  return (
    <svg viewBox="0 0 200 44" className="cc-seatart" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#060d14" />
          <stop offset="40%" stopColor={mix(col, "#0e1b25", 0.84)} />
          <stop offset="66%" stopColor={mix(col, "#22343f", 0.46)} />
          <stop offset="100%" stopColor={mix(col, "#16242e", 0.7)} />
        </linearGradient>
        <radialGradient id={`vg${id}`} cx="50%" cy="40%" r="80%">
          <stop offset="42%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      <rect width="200" height="44" fill={`url(#sky${id})`} />
      <circle cx="152" cy="13" r="8" fill={mix(col, "#ffffff", 0.7)} opacity="0.13" />
      <circle cx="152" cy="13" r="3" fill={mix(col, "#ffffff", 0.88)} opacity="0.45" />

      <path d={`M0,44 L0,${G} L${ridgePts} L200,44 Z`} fill={mix(col, "#0b1720", 0.88)} opacity="0.7" />
      {sc.ice && <path d={`M0,${G - 2} L34,${G - 5} L68,${G - 2} L104,${G - 6} L140,${G - 2} L176,${G - 5} L200,${G - 2} L200,${G + 2} L0,${G + 2} Z`}
        fill="#cfe0e8" opacity="0.14" />}
      {sc.mirrors && Array.from({ length: 15 }, (_, i) => (
        <path key={i} d={`M${8 + i * 13},${G} l3,-3 l1.4,1.4 l-3,3 z`} fill={mix(col, "#ffffff", 0.7)} opacity="0.32" />
      ))}

      {/* the old world, still standing behind the new one */}
      <g fill="#071119" opacity="0.72">
        {sc.towers.map(([x, hh, w], i) => {
          const h = hh * 0.42;
          const top = G - 4 - h;
          return <path key={i} d={`M${x},${G - 3} L${x},${top + 2} L${x + w * 0.4},${top} L${x + w * 0.7},${top + 3} L${x + w},${top + 1} L${x + w},${G - 3} Z`} />;
        })}
      </g>

      {village()}

      {sc.water && (
        <g>
          <path d={`M0,${G + 9} L200,${G + 8} L200,44 L0,44 Z`} fill={mix(col, "#071620", 0.87)} />
          {[40, 42].map((y, i) => (
            <path key={i} d={`M${4 + i * 9},${y} q9,-0.9 18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0`}
              fill="none" stroke={mix(col, "#e2f3fa", 0.55)} strokeWidth="0.45" opacity="0.3" />
          ))}
        </g>
      )}

      <g transform="translate(184,8)">
        <path d="M0,0 L0,24" stroke={mix(col, "#ffffff", 0.42)} strokeWidth="0.9" />
        <path d="M0,1 L9,4 L0,7 Z" fill={col} opacity="0.95" />
      </g>

      {Array.from({ length: 34 }, (_, i) => (
        <circle key={i} cx={rnd(i + 70) * 200} cy={rnd(i + 90) * 40} r={0.25 + rnd(i + 110) * 0.35}
          fill="#e8f3f8" opacity={0.1 + rnd(i + 130) * 0.22} />
      ))}
      <rect width="200" height="44" fill={`url(#vg${id})`} />
    </svg>
  );
}

function SeatScreen({ game, P, prov, onClose, onEdict, onUpgrade, onWork, onRecruitOpen }) {
  const nat = game.nations[P];
  const inc = nationIncome(game, P, game.turn);
  const held = Object.values(game.provinces).filter((p) => p.owner === P).length;
  const active = nat.edict || "none";
  const changedThisWinter = nat.edictTurn === game.turn;
  const tier = seatTier(prov);
  const stage = SETTLEMENT[tier];
  const up = upgradeState(game, P, prov);
  const next = SETTLEMENT[tier + 1];
  const used = seatUsed(prov), slots = seatSlots(prov);
  const groups = [0, 1, 2, 3].map((t) => ({ t, ids: WORK_IDS.filter((w) => WORKS[w].tier === t) }))
    .filter((g) => g.ids.length);

  return (
    <Overlay onClose={onClose}>
      <div className="cc-w-1060px cc-max-w-96vw cc-max-h-92vh rounded-lg border cc-border-31454f cc-bg-0d141a flex flex-col overflow-hidden">
        <div className="relative shrink-0">
          <SeatArt id={P} tier={tier} />
          <div className="absolute cc-seatplate">
            <div className="flex items-center gap-3">
              <span className="shrink-0 flex items-center justify-center rounded cc-seatcrest"
                style={{ background: mix(nat.color, "#0b1116", 0.78), borderColor: mix(nat.color, "#0b1116", 0.4) }}>
                <Sigil id={P} size={26} color={nat.color} />
              </span>
              <div>
                <div className="disp cc-text-28px leading-none">{prov.name}</div>
                <div className="cc-text-13px cc-text-c6d6de mt-1">
                  {stage.name} · <span className="num">{held}</span> holdings · winter <span className="num">{game.turn}</span>
                </div>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="absolute cc-seatclose" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto thin p-5 grid gap-5 cc-lg-grid-2">
          {/* ---- the settlement itself ---- */}
          <div>
            <div className="cc-text-12d5px cc-text-a7bac6 mb-2 pb-1 border-b cc-border-243138">The settlement</div>

            <div className="rounded border cc-border-4d7488 cc-bg-152a30 p-3 mb-2">
              <div className="flex items-baseline gap-2">
                <span className="disp cc-text-17px flex-1">{stage.name}</span>
                <span className="cc-text-12d5px cc-text-c6d6de">
                  stage <span className="num">{tier + 1}</span> of <span className="num">{SETTLEMENT.length}</span>
                </span>
              </div>
              <div className="cc-text-12d5px cc-text-93a9b5 mt-1">{stage.desc}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-31454f cc-text-a0b6c1">
                  {used} of {slots} slots used
                </span>
                {seatDefence(prov) > 0 && (
                  <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">
                    +{seatDefence(prov)}% to defenders here
                  </span>
                )}
              </div>
            </div>

            {prov.project ? (
              <div className="rounded border cc-border-8a6f36 cc-bg-131f27 p-3 mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="cc-text-13d5px flex-1">
                    {prov.project.kind === "tier" ? next.name : WORKS[prov.project.id].name}
                  </span>
                  <span className="num cc-text-12d5px cc-text-f2c97a">
                    {prov.project.left} winter{prov.project.left === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-2 cc-h-5px cc-bg-26333c rounded overflow-hidden">
                  <div className="h-full cc-bar" style={{
                    width: `${(1 - prov.project.left / (prov.project.kind === "tier"
                      ? next.turns : WORKS[prov.project.id].turns)) * 100}%`, background: "#f2c97a" }} />
                </div>
              </div>
            ) : up.s === "max" ? (
              <div className="cc-text-12d5px cc-text-9fd6b4 mb-3">
                There is nothing left to build it into.
              </div>
            ) : (
              <div className="rounded border cc-border-31454f p-3 mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="cc-text-13d5px flex-1">Raise it to a {next.name.toLowerCase()}</span>
                  <span className="num cc-text-12d5px cc-text-c9a37a">{next.scrap} scrap · {next.turns}w</span>
                </div>
                <div className="cc-text-12d5px cc-text-93a9b5 mt-1">{next.desc}</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">
                    +{next.def}% defence
                  </span>
                  <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">
                    {next.slots - stage.slots} more slot{next.slots - stage.slots === 1 ? "" : "s"}
                  </span>
                </div>
                {up.why && <div className="cc-text-12d5px cc-text-c9a37a mt-1.5">{up.why}</div>}
                {up.s === "open" && (
                  <button type="button" onClick={() => onUpgrade(key(prov.c, prov.r))}
                    className="w-full mt-2 py-2 rounded cc-bg-2a3a4a cc-hover-bg-35495c border cc-border-4d7488 cc-text-dfeaf0 disp cc-text-14d5px transition-colors">
                    Begin the work
                  </button>
                )}
              </div>
            )}

            {groups.map((gp) => (
              <div key={gp.t} className="mb-3">
                <div className="cc-text-12px cc-text-8399a6 mb-1.5">
                  {gp.t === 0 ? "From the first huts" : `From a ${SETTLEMENT[gp.t].name.toLowerCase()}`}
                </div>
                <div className="grid gap-1.5">
                  {gp.ids.map((id) => {
                    const w = WORKS[id];
                    const st = workState(game, P, prov, id);
                    const built = st.s === "built";
                    return (
                      <div key={id} className={`rounded border px-3 py-2 ${built ? "cc-border-3d5a4a cc-bg-131f27"
                        : st.s === "open" ? "cc-border-31454f" : "cc-border-25313a"}`}>
                        <div className="flex items-baseline gap-2">
                          <span className={`cc-text-13px flex-1 ${built ? "cc-text-9fd6b4" : st.s === "open" ? "" : "cc-text-95aab6"}`}>
                            {w.name}
                          </span>
                          {built ? <span className="cc-text-12px cc-text-9fd6b4">standing</span>
                            : <span className="num cc-text-12px cc-text-c9a37a">{w.scrap} scrap · {w.turns}w</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(w.yield || {}).map(([k, v]) => (
                            <span key={k} className={`cc-text-11d5px rounded px-1.5 py-0.5 border ${built
                              ? "cc-border-3d5a4a cc-text-9fd6b4" : "cc-border-31454f cc-text-a0b6c1"}`}>
                              +{v} {RES_META.find((r) => r.k === k)?.label.toLowerCase() || k}
                            </span>
                          ))}
                          {w.def && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-31454f cc-text-a0b6c1">+{w.def}% defence</span>}
                          {w.cap && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-31454f cc-text-a0b6c1">+{w.cap} recruit ceiling</span>}
                        </div>
                        {!built && <div className="cc-text-12px cc-text-93a9b5 mt-1 leading-snug">{w.desc}</div>}
                        {st.why && <div className="cc-text-12px cc-text-c9a37a mt-1">{st.why}</div>}
                        {st.s === "open" && (
                          <button type="button" onClick={() => onWork(key(prov.c, prov.r), id)}
                            className="w-full mt-1.5 py-1.5 rounded cc-bg-2a3a4a cc-hover-bg-35495c border cc-border-4d7488 cc-text-dfeaf0 cc-text-13px transition-colors">
                            Build it
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ---- the realm ---- */}
          <div>
            <div className="cc-text-12d5px cc-text-a7bac6 mb-2 pb-1 border-b cc-border-243138">The realm this season</div>
            <div className="grid gap-1.5 mb-4">
              {RES_META.map(({ k, label }) => (
                <div key={k} className="flex items-baseline justify-between cc-text-13px">
                  <span className="cc-text-93a9b5">{label}</span>
                  <span className="num">
                    {Math.round(nat.res[k])}
                    <span className={inc[k] < 0 ? "cc-text-e0644a" : "cc-text-9fd6b4"}>
                      {" "}{inc[k] > 0 ? "+" : ""}{inc[k]}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => { onClose(); onRecruitOpen(key(prov.c, prov.r)); }}
              className="w-full mb-4 py-2.5 rounded cc-bg-2b3f2c cc-hover-bg-37502f border cc-border-4a6b45 cc-text-d7ecc9 disp cc-text-14d5px flex items-center justify-center gap-2 transition-colors">
              <Hammer size={15} /> Outfit a company here
            </button>

            <div className="cc-text-12d5px cc-text-a7bac6 mb-2 pb-1 border-b cc-border-243138">Standing edict</div>
            <p className="cc-text-12d5px cc-text-93a9b5 leading-relaxed mb-2">
              One order stands over the whole realm at a time. Changing it costs{" "}
              <span className="num cc-text-c9a37a">25 scrap</span> and can be done once a winter.
            </p>
            <div className="grid gap-1.5">
              {EDICT_IDS.map((id) => {
                const e = EDICTS[id];
                const on = active === id;
                const locked = !on && (changedThisWinter || nat.res.scrap < 25);
                return (
                  <button key={id} type="button" disabled={locked} onClick={() => onEdict(id)}
                    className={`text-left px-3 py-2 rounded border transition-colors ${on
                      ? "cc-border-4d9aa6 cc-bg-152a30" : locked
                      ? "cc-border-25313a cc-text-78909e" : "cc-border-31454f cc-hover-border-3d6470"}`}>
                    <div className="flex items-baseline gap-2">
                      <span className="cc-text-13px flex-1">{e.name}</span>
                      {on && <span className="cc-text-12px cc-text-8fe3d6">in force</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {edictChips(id).map((c) => (
                        <span key={c.t} className={`cc-text-11d5px rounded px-1.5 py-0.5 border ${c.good
                          ? "cc-border-3d5a4a cc-text-9fd6b4" : "cc-border-5a3230 cc-text-e09a8a"}`}>{c.t}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="cc-text-12d5px cc-text-93a9b5 mt-3 leading-relaxed">{nat.blurb}</p>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* Painted portraits, carried as data URIs because an artifact cannot fetch
   files. Anything not listed here falls back to the drawn bust below. */
const LORD_ART = {
  quarrymen: {
    bust: lordGorranBust,
    head: lordGorranHead,
  },
  dogger: {
    bust: lordGrimhandBust,
    head: lordGrimhandHead,
  },
};

const lordAlive = (nat) => !nat || !nat.lordDead;
function commandMul(natId) {
  const c = LORD_COMMAND[natId] || {};
  return { dealt: c.dealt || 1, taken: c.taken || 1, morale: c.morale || 1 };
}
function lordMul(natId, nat) {
  const out = { mul: {}, upkeep: 1, research: 1, move: 0, dealt: 1, taken: 1, recruitCost: 1 };
  if (nat && nat.lordDead) return { ...out, ...LEADERLESS };
  const w = WARLORDS[natId];
  if (!w) return out;
  w.traits.forEach((t) => {
    Object.entries(t.mul || {}).forEach(([k, v]) => { out.mul[k] = (out.mul[k] || 1) * v; });
    if (t.upkeep) out.upkeep *= t.upkeep;
    if (t.research) out.research *= t.research;
    if (t.move) out.move += t.move;
    if (t.recruitCost) out.recruitCost *= t.recruitCost;
  });
  return out;
}
function lordChips(natId) {
  const w = WARLORDS[natId];
  if (!w) return [];
  const out = [];
  const pc = (v) => `${v > 1 ? "+" : "−"}${Math.abs(Math.round((v - 1) * 100))}%`;
  w.traits.forEach((t) => {
    Object.entries(t.mul || {}).forEach(([k, v]) =>
      out.push({ t: `${RES_META.find((r) => r.k === k)?.label.toLowerCase() || k} ${pc(v)}`, good: v > 1 }));
    if (t.upkeep) out.push({ t: `warbands eat ${pc(t.upkeep)}`, good: t.upkeep < 1 });
    if (t.research) out.push({ t: `advances ${pc(t.research)} slower`.replace("−", "").replace("slower", "faster"), good: true });
    if (t.move) out.push({ t: `+${t.move} movement`, good: true });
    if (t.dealt) out.push({ t: `damage dealt ${pc(t.dealt)}`, good: true });
    if (t.taken) out.push({ t: `damage taken ${pc(t.taken)}`, good: t.taken < 1 });
    if (t.recruitCost) out.push({ t: `companies cost ${pc(t.recruitCost)} recruits`, good: t.recruitCost < 1 });
  });
  return out;
}

/* A drawn bust. Nothing is loaded; each face is built from the same parts with
   different headgear, so they read as one people with different jobs. */
function LordPortrait({ id, className, small }) {
  // A painted portrait wins over the drawn one; the head crop is used wherever
  // the frame is too small for a bust to read.
  const painted = LORD_ART[id];
  if (painted) {
    const src = small ? (painted.head || painted.bust) : painted.bust;
    const tint = FACTION[id]?.color || "#8fa7b3";
    return (
      <svg viewBox="0 0 100 120" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`lg${id}${small ? "s" : "b"}`} x1="0" y1="0.55" x2="0" y2="1">
            <stop offset="0%" stopColor="#04080c" stopOpacity="0" />
            <stop offset="100%" stopColor="#04080c" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <image href={src} xlinkHref={src} x="0" y="0" width="100" height="120"
          preserveAspectRatio="xMidYMid slice" />
        <rect width="100" height="120" fill={tint} opacity="0.06" />
        <rect width="100" height="120" fill={`url(#lg${id}${small ? "s" : "b"})`} />
        <rect width="100" height="120" fill="none" stroke={mix(tint, "#0a1218", 0.5)} strokeWidth="2" />
      </svg>
    );
  }
  const col = FACTION[id]?.color || "#8fa7b3";
  const skin = mix(col, "#2b2622", 0.72);
  const dark = "#0a1218";
  const cloth = mix(col, "#101a22", 0.62);
  const metal = mix(col, "#dfeaf0", 0.55);
  const head = (
    <>
      <path d="M34 52q0-18 16-18t16 18q0 16-16 22t-16-22z" fill={skin} />
      <path d="M42 50h6M52 50h6" stroke={dark} strokeWidth="1.6" strokeLinecap="round" />
    </>
  );
  const shoulders = <path d="M14 120q2-24 20-30q16 10 32 0q18 6 20 30z" fill={cloth} />;
  const gear = {
    dogger: (<>
      <path d="M28 46q4-22 22-22t22 22l-4 2q-4-16-18-16t-18 16z" fill={cloth} />
      <path d="M32 34q10-12 36 0l2 8q-20-10-40 0z" fill={metal} opacity="0.55" />
      <path d="M18 96q12-8 32 0q20-8 32 0l-2 8q-14-8-30 0q-16-8-30 0z" fill={metal} opacity="0.35" />
    </>),
    lyon: (<>
      <path d="M32 40q18-10 36 0l-2 6q-16-8-32 0z" fill={metal} opacity="0.7" />
      <path d="M30 118q4-20 20-26q14 8 20-2l4 4q-4 12-24 10q-14 4-16 14z" fill={metal} opacity="0.25" />
      <path d="M36 96q14-6 28 0l0 8q-14-6-28 0z" fill={cloth} />
    </>),
    alpine: (<>
      <path d="M30 54q0-24 20-24t20 24l0 10q-20 10-40 0z" fill={metal} opacity="0.75" />
      <rect x="36" y="46" width="28" height="5" rx="2" fill={dark} />
      <path d="M50 30v-8" stroke={metal} strokeWidth="2" />
    </>),
    karst: (<>
      <path d="M28 40q22-14 44 0l-2 6q-20-10-40 0z" fill={cloth} />
      <path d="M26 42h48" stroke={metal} strokeWidth="2" opacity="0.6" />
      <path d="M34 94q16 14 32 0" fill="none" stroke={metal} strokeWidth="1.6" opacity="0.7" />
      <circle cx="50" cy="104" r="4" fill={metal} opacity="0.7" />
    </>),
    boreal: (<>
      <path d="M20 96q10-16 30-12q20-4 30 12q-14 16-30 12q-16 4-30-12z" fill={metal} opacity="0.3" />
      <path d="M36 32q-6-12-14-14M64 32q6-12 14-14" fill="none" stroke={metal} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M30 34q20-10 40 0l-2 6q-18-8-36 0z" fill={cloth} />
      <path d="M56 56l6 8" stroke={dark} strokeWidth="1.4" />
    </>),
    horde: (<>
      <path d="M28 42q22-14 44 0l-2 6q-20-10-40 0z" fill={cloth} />
      <circle cx="42" cy="50" r="7" fill="none" stroke={metal} strokeWidth="2" />
      <circle cx="58" cy="50" r="7" fill="none" stroke={metal} strokeWidth="2" />
      <path d="M49 50h2" stroke={metal} strokeWidth="2" />
      <path d="M32 62q18 10 36 0l2 12q-20 10-40 0z" fill={cloth} />
    </>),
    solar: (<>
      <path d="M32 36q18-10 36 0l-2 6q-16-8-32 0z" fill={metal} opacity="0.8" />
      <path d="M50 30v-8M38 33l-4-7M62 33l4-7" stroke={metal} strokeWidth="2" strokeLinecap="round" />
      <path d="M34 60q16 8 32 0l0 6q-16 8-32 0z" fill={metal} opacity="0.5" />
    </>),
    quarrymen: (<>
      <path d="M28 46q22-16 44 0l0 6q-22-12-44 0z" fill={metal} opacity="0.7" />
      <circle cx="50" cy="40" r="5" fill={mix("#ffe6b0", col, 0.3)} opacity="0.8" />
      <path d="M30 100l40-10" stroke={metal} strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
    </>),
  };
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`lp${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mix(col, "#0a1218", 0.72)} />
          <stop offset="100%" stopColor="#070e14" />
        </linearGradient>
      </defs>
      <rect width="100" height="120" fill={`url(#lp${id})`} />
      <circle cx="50" cy="46" r="34" fill={mix(col, "#ffffff", 0.82)} opacity="0.07" />
      {shoulders}{head}{gear[id] || null}
      <rect width="100" height="120" fill="none" stroke={mix(col, "#0a1218", 0.5)} strokeWidth="2" />
    </svg>
  );
}

function WarlordScreen({ game, P, onClose }) {
  // A mutant horde has no warlord. Only factions with one are listed, and
  // every lookup below tolerates a faction that has none.
  const ids = [P, ...NATION_IDS.filter((i) => i !== P), ...MINOR_IDS]
    .filter((i) => WARLORDS[i] && (i === P || game.met?.[i]));
  const [sel, setSel] = useState(P);
  const w = WARLORDS[sel] || WARLORDS[P];
  const f = FACTION[sel] || FACTION[P];
  const gone = !Object.values(game.provinces).some((p) => p.owner === sel);

  return (
    <Overlay onClose={onClose}>
      <div className="cc-w-980px cc-max-w-96vw cc-max-h-92vh rounded-lg border cc-border-31454f cc-bg-0d141a flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b cc-border-28363f flex items-center gap-3"
          style={{ background: "linear-gradient(90deg,#14202a,#0d141a)" }}>
          <Crown size={18} className="cc-text-f0e2b8" />
          <div className="disp cc-text-21px flex-1">Those who lead</div>
          <button type="button" onClick={onClose} className="cc-seatclose cc-static" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto thin p-5 flex flex-col cc-lg-flex-row gap-5">
          <div className="cc-w-200px shrink-0 grid gap-1.5">
            {ids.map((id) => {
              const on = sel === id;
              const ff = FACTION[id];
              return (
                <button key={id} type="button" onClick={() => setSel(id)}
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded border text-left transition-colors ${on
                    ? "cc-border-4d9aa6 cc-bg-152a30" : "cc-border-31454f cc-hover-border-3d6470"}`}>
                  <LordPortrait id={id} className="cc-lordthumb" small />
                  <span className="min-w-0">
                    <span className="cc-text-13px cc-block" style={{ color: ff.color }}>{WARLORDS[id]?.name || ff.short}</span>
                    <span className="cc-text-11d5px cc-text-93a9b5 cc-block">{ff.short}{id === P ? " · you" : ""}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex gap-4 flex-wrap">
              <LordPortrait id={sel} className="cc-lordbig" />
              <div className="flex-1 min-w-0">
                <div className="disp cc-text-26px leading-tight" style={{ color: f.color }}>{w.name}</div>
                <div className="cc-text-14px cc-text-c6d6de">{w.title}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Sigil id={sel} size={17} color={f.color} />
                  <span className="cc-text-13px cc-text-a0b6c1">{f.name}</span>
                  {gone && <span className="cc-text-12d5px cc-text-e0644a">· broken</span>}
                </div>
                {(() => {
                  const nat = game.nations[sel];
                  if (nat && nat.lordDead) return (
                    <div className="rounded border cc-border-5a3230 cc-bg-131f27 px-3 py-2 mt-2">
                      <div className="cc-text-13d5px cc-text-e0644a">
                        {sel === P ? "You are dead, and no one has taken your place." : "Dead, and not replaced."}
                      </div>
                      <div className="cc-text-12d5px cc-text-e09a8a mt-0.5">
                        The realm is leaderless: rations and scrap down a sixth, recruits down a fifth,
                        every advance a third slower, and companies dearer to raise.
                      </div>
                    </div>
                  );
                  const withArmy = game.armies.find((a) => a.owner === sel && a.lord);
                  const transit = nat && nat.lordTransit;
                  return (
                    <div className="cc-text-12d5px cc-text-93a9b5 mt-1.5">
                      {sel === P
                        ? (transit ? "You are on the road. You reach them next winter, and command nothing until you do."
                          : withArmy ? `You are in the field with ${withArmy.name}.` : "You are at your seat.")
                        : (transit ? "On the road. Arrives next winter, and commands nothing until then."
                          : withArmy ? `In the field with ${withArmy.name}.` : "At the seat.")}
                    </div>
                  );
                })()}
                <p className="cc-text-13d5px cc-text-dfeaf0 leading-relaxed mt-3">{w.blurb}</p>
              </div>
            </div>

            {LORD_COMMAND[sel] && (
              <>
                <div className="cc-text-12d5px cc-text-a7bac6 mt-4 mb-2 pb-1 border-b cc-border-243138">
                  {sel === P ? "In the field, with the warband you ride with"
                    : "In the field, with the warband they ride with"}
                </div>
                <div className="rounded border cc-border-8a6f36 cc-bg-131f27 px-3 py-2.5">
                  <div className="cc-text-13d5px cc-text-f2c97a">{LORD_COMMAND[sel].n}</div>
                  <div className="cc-text-12d5px cc-text-93a9b5 mt-0.5">{LORD_COMMAND[sel].d}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {LORD_COMMAND[sel].dealt && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">damage dealt +{Math.round((LORD_COMMAND[sel].dealt-1)*100)}%</span>}
                    {LORD_COMMAND[sel].taken && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">damage taken −{Math.round((1-LORD_COMMAND[sel].taken)*100)}%</span>}
                    {LORD_COMMAND[sel].morale && <span className="cc-text-11d5px rounded px-1.5 py-0.5 border cc-border-3d5a4a cc-text-9fd6b4">nerve holds −{Math.round((1-LORD_COMMAND[sel].morale)*100)}%</span>}
                  </div>
                  <div className="cc-text-12px cc-text-c9a37a mt-1.5">
                    Only while they are with that warband — and if it is broken, they may fall with it.
                  </div>
                </div>
              </>
            )}

            <div className="cc-text-12d5px cc-text-a7bac6 mt-4 mb-2 pb-1 border-b cc-border-243138">
              {sel === P ? "Your habits, and what your realm gets while you live"
                : "Their habits, and what the realm gets while they live"}
            </div>
            <div className="grid gap-2">
              {w.traits.map((t) => (
                <div key={t.n} className="rounded border cc-border-31454f cc-bg-131f27 px-3 py-2.5">
                  <div className="cc-text-13d5px">{t.n}</div>
                  <div className="cc-text-12d5px cc-text-93a9b5 mt-0.5">{t.d}</div>
                </div>
              ))}
              <div className="flex flex-wrap gap-1 mt-1">
                {lordChips(sel).map((c) => (
                  <span key={c.t} className={`cc-text-12px rounded px-1.5 py-0.5 border ${c.good
                    ? "cc-border-3d5a4a cc-text-9fd6b4" : "cc-border-5a3230 cc-text-e09a8a"}`}>{c.t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}


/* ------------------------------ SURVEY MODAL ------------------------------ */
/* The first thing a player sees after taking the banner. It exists to do two
   jobs at once: say where they are and what year it is, and put something on
   the map that has to be dealt with. A strategy game that opens on an empty
   continent teaches nothing. */
function OpeningScene({ game, P, onClose }) {
  const nat = game.nations[P];
  const seat = Object.values(game.provinces).find((p) => p.capital && p.seat === P);
  const host = game.armies.find((a) => a.mob && a.target === (seat ? key(seat.c, seat.r) : null));
  const away = host && seat ? hexDist(host.c, host.r, seat.c, seat.r) : 3;
  return (
    <Overlay onClose={onClose}>
      <div className="cc-w-720px cc-max-w-94vw rounded-lg border cc-border-31454f cc-bg-0d141a overflow-hidden">
        <div className="px-5 py-3.5 border-b cc-border-28363f flex items-center gap-3"
          style={{ background: "linear-gradient(90deg,#1c1410,#0d141a)" }}>
          <Flame size={18} className="cc-text-e8b98a" />
          <div className="disp cc-text-20px flex-1">Riders came in before dawn</div>
        </div>
        <div className="p-5 cc-text-14px leading-relaxed cc-text-c3d5de grid gap-3">
          <p>
            Three hundred years since the water went out. The sea dropped and kept dropping,
            and what it left behind — the Dogger flats, the dry floor of the narrows — is
            walkable now, and everyone has worked that out at once.
          </p>
          <p>
            You are {WARLORDS[P]?.name || "the headsman"}, and {seat ? seat.name : "your seat"} is yours
            because nobody stronger has come for it yet. That changed this morning.
          </p>
          <p className="cc-text-e8b98a">
            The Rendfast Host is {away} {away === 1 ? "hex" : "hexes"} out and walking straight at you.
            Four score of them, axes and a few bows, and a line of people roped behind the carts
            who used to live somewhere like this. They do not besiege and they do not treat.
            They arrive, they take what a season took to make, and they go back out for more.
          </p>
          <div className="rounded border cc-border-31454f cc-bg-131f27 px-3.5 py-3">
            <div className="disp cc-text-15px cc-text-e5eef3 mb-1">What that means for you</div>
            <p className="cc-text-13px cc-text-a0b6c1 leading-relaxed">
              Leave them and they will walk into {seat ? seat.name : "your seat"} and help themselves —
              rations, scrap, and your people off the muster roll. Break them and you get the lot back
              and the captives besides: <span className="cc-text-9fd6b4 num">140 recruits</span>,{" "}
              <span className="cc-text-9fd6b4 num">70 scrap</span> and{" "}
              <span className="cc-text-9fd6b4 num">30 rations</span>.
              You have{" "}<span className="num">{game.armies.filter((a) => a.owner === P).length}</span>{" "}
              warbands standing at the seat. That is enough, if you use both.
            </p>
          </div>
          <p className="cc-text-12d5px cc-text-93a9b5">
            And keep your outriders out of the deep woods until you can spare the losses. There is
            more living in them than trees.
          </p>
        </div>
        <div className="px-5 pb-5">
          <button type="button" onClick={onClose}
            className="w-full py-2.5 rounded cc-bg-2a3a4a cc-hover-bg-35495c border cc-border-4d7488 cc-text-dfeaf0 disp cc-text-15px transition-colors">
            Call the muster
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function LairModal({ lair, prov, onClose }) {
  const kind = LAIR_KINDS[lair.kind];
  const f = FACTION[kind.faction];
  return (
    <Overlay onClose={onClose}>
      <div className="cc-w-620px cc-max-w-94vw rounded-lg border cc-border-8a4a38 cc-bg-0d141a overflow-hidden">
        {prov && <TerrainArt t={prov.t} height={132} corner />}
        <div className="px-5 py-3 border-b cc-border-2a1f1c"
          style={{ background: "linear-gradient(90deg,#1a1210,#0d141a)" }}>
          <div className="cc-text-12d5px cc-text-a7bac6">Survey · {prov?.name}</div>
          <div className="disp cc-text-22px">{kind.title}</div>
        </div>
        <div className="p-5">
          <p className="cc-text-14px cc-text-dfeaf0 leading-relaxed mb-4">{kind.text}</p>
          <div className="rounded border cc-border-31454f cc-bg-131f27 p-3 flex items-center gap-3">
            <Sigil id={kind.faction} size={26} color={f.color} />
            <div className="flex-1 min-w-0">
              <div className="disp cc-text-16px" style={{ color: f.color }}>{f.name}</div>
              <div className="cc-text-12d5px cc-text-93a9b5">
                {kind.garrison.length} companies, dug in. They hold the{" "}
                {lair.kind === "herd" ? "wood" : "ruin"} until somebody takes it off them.
              </div>
            </div>
          </div>
          <div className="cc-text-12d5px cc-text-c9a37a mt-3">
            Your scouts were driven back out. Nothing more will be learned about the place while
            they are in it — march in and take it off them, or leave it and go around.
          </div>
          <button type="button" onClick={onClose}
            className="w-full mt-4 py-2.5 rounded cc-bg-5a2f26 cc-hover-bg-6e3a2e border cc-border-8a4a38 cc-text-f3d9cf disp cc-text-15px transition-colors">
            Understood
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function SurveyModal({ sv, prov, onChoose, onClose }) {
  const enc = ENCOUNTERS.find((e) => e.id === sv.encId);
  const res = sv.result;
  const gains = res ? Object.entries(res.res || {}).filter(([, v]) => v !== 0) : [];
  return (
    <Overlay onClose={res ? onClose : undefined}>
      <div className="cc-w-620px cc-max-w-94vw rounded-lg border cc-border-31454f cc-bg-0d141a overflow-hidden">
        {prov && <TerrainArt t={prov.t} height={132} corner />}
        <div className="px-5 py-3 border-b cc-border-28363f"
          style={{ background: "linear-gradient(90deg,#14202a,#0d141a)" }}>
          <div className="cc-text-12d5px cc-text-a7bac6">Survey · {prov?.name}</div>
          <div className="disp cc-text-22px">{enc.title}</div>
        </div>
        <div className="p-5">
          <p className="cc-text-14px cc-text-dfeaf0 leading-relaxed mb-4">{enc.text}</p>
          {!res && (
            <div className="grid gap-2">
              {enc.choices.map((c, i) => (
                <button key={i} type="button" onClick={() => onChoose(i)}
                  className="text-left px-3.5 py-2.5 rounded border cc-border-31454f cc-hover-border-3d6470 transition-colors">
                  <div className="cc-text-13d5px">{c.label}</div>
                  {c.hint && <div className="cc-text-12d5px cc-text-95aab6 mt-0.5">{c.hint}</div>}
                </button>
              ))}
            </div>
          )}
          {res && (
            <div>
              <div className="rounded border cc-border-31454f cc-bg-131f27 p-3.5">
                <p className="cc-text-13d5px cc-text-dfeaf0 leading-relaxed">{res.text}</p>
                {(gains.length > 0 || res.hurt || res.feature) && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {gains.map(([k, v]) => (
                      <span key={k} className={`cc-text-12d5px rounded px-2 py-0.5 border ${v > 0 ? "cc-border-3d5a4a cc-text-9fd6b4" : "cc-border-5a3230 cc-text-e09a8a"}`}>
                        {v > 0 ? "+" : ""}{v} {RES_META.find((r) => r.k === k)?.label.toLowerCase() || k}
                      </span>
                    ))}
                    {res.hurt ? (
                      <span className="cc-text-12d5px rounded px-2 py-0.5 border cc-border-5a3230 cc-text-e09a8a">
                        −{Math.round(res.hurt * 100)}% strength
                      </span>
                    ) : null}
                    {res.feature && (
                      <span className="cc-text-12d5px rounded px-2 py-0.5 border cc-border-8a6f36 cc-text-f2c97a">
                        found: {FEATURES[res.feature].name}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button type="button" onClick={onClose}
                className="w-full mt-4 py-2.5 rounded cc-bg-1f4a52 cc-hover-bg-2a5f69 border cc-border-356b76 cc-text-d9f0f2 disp cc-text-15px transition-colors">
                {prov && !prov.owner ? "Done — the ground is yours to claim now" : "Done"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* -------------------------------- NOTICES ---------------------------------
   Small prompts for things that happen while you are looking elsewhere. Each
   one can carry you to the ground it happened on.
   ------------------------------------------------------------------------ */
const NOTICE_LOOK = {
  raid:    { icon: Swords,   tone: "cc-border-8a4a38", text: "cc-text-f3b0a0" },
  loss:    { icon: Flag,     tone: "cc-border-8a4a38", text: "cc-text-f3b0a0" },
  built:   { icon: Hammer,   tone: "cc-border-4a6b45", text: "cc-text-b6dfc0" },
  learned: { icon: Sparkles, tone: "cc-border-4d7488", text: "cc-text-9fd9e8" },
  lord:    { icon: Crown,    tone: "cc-border-8a6f36", text: "cc-text-f2c97a" },
  war:     { icon: Swords,   tone: "cc-border-8a4a38", text: "cc-text-f3b0a0" },
};

function Notices({ list, onGo, onDismiss }) {
  if (!list.length) return null;
  return (
    <div className="cc-notices">
      {list.slice(0, 5).map((n) => {
        const look = NOTICE_LOOK[n.kind] || NOTICE_LOOK.built;
        const Icon = look.icon;
        return (
          <div key={n.id} className={`cc-notice border ${look.tone}`}>
            <Icon size={15} className={`shrink-0 ${look.text}`} />
            <span className="cc-text-12d5px flex-1 min-w-0 leading-snug">{n.text}</span>
            {n.k && (
              <button type="button" onClick={() => onGo(n)}
                className="cc-text-11d5px cc-text-8fe3d6 shrink-0 whitespace-nowrap">Show me</button>
            )}
            <button type="button" onClick={() => onDismiss(n.id)}
              className="cc-text-12d5px cc-text-8399a6 shrink-0" aria-label="Dismiss">×</button>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- TITLE SCREEN ------------------------------ */
function TitleScreen({ onBegin, sound, onSound, saved, onContinue }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf, start = performance.now();
    const tick = (n) => { setT((n - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const flakes = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    x: noise(i, 1, 71) * 100, y: noise(i, 2, 72) * 100,
    r: 0.6 + noise(i, 3, 73) * 1.6, sp: 2 + noise(i, 4, 74) * 6,
    dr: (noise(i, 5, 75) - 0.5) * 8,
  })), []);

  return (
    <div className="cc-root cc-app w-full flex flex-col cc-text-e5eef3 overflow-hidden"
      style={{ background: "#05090c", color: "#ffffff" }}>
      <style>{UI_CSS}</style>
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center px-5">
        <svg viewBox="0 0 1000 560" className="cc-titleart" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#05090c" />
              <stop offset="42%" stopColor="#13242e" />
              <stop offset="72%" stopColor="#223a44" />
              <stop offset="100%" stopColor="#0b141a" />
            </linearGradient>
            <radialGradient id="tsun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#cfe3ea" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#cfe3ea" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="tvig" cx="50%" cy="45%" r="72%">
              <stop offset="45%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.82" />
            </radialGradient>
          </defs>
          <rect width="1000" height="560" fill="url(#tsky)" />
          <circle cx="700" cy="180" r="150" fill="url(#tsun)" />
          <circle cx="700" cy="180" r="26" fill="#e8f2f6" opacity="0.35" />

          {/* far range, then the drowned city, then the flats */}
          <path d="M0 300 L90 250 L150 285 L240 225 L330 280 L420 240 L520 295 L610 250 L700 300 L820 245 L920 292 L1000 262 L1000 560 L0 560 Z"
            fill="#0d1b23" opacity="0.85" />
          <g fill="#091319">
            {[[120,330,26,120],[168,352,18,98],[210,300,30,150],[262,340,20,110],[300,318,34,132],
              [352,356,16,94],[386,308,28,142],[440,346,22,104],[478,322,32,128],[534,352,18,98],
              [572,312,30,138],[628,344,24,106],[672,326,28,124],[726,354,20,96],[762,318,34,132],
              [820,348,22,102],[860,330,26,120],[912,352,18,98]].map(([x,y,w,h],i)=>(
              <path key={i} d={`M${x} ${y+h} L${x} ${y} L${x+w*0.45} ${y-6} L${x+w} ${y+4} L${x+w} ${y+h} Z`} />
            ))}
          </g>
          <path d="M0 430 Q250 408 500 428 T1000 424 L1000 560 L0 560 Z" fill="#16242c" />
          <path d="M0 470 Q260 452 520 470 T1000 464 L1000 560 L0 560 Z" fill="#101c23" />
          {[452, 486, 516].map((y, i) => (
            <path key={i} d={`M0 ${y} q60 -6 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0`}
              fill="none" stroke="#5f8a97" strokeWidth="0.8" opacity="0.22" />
          ))}
          {/* a hull on her side, because that is the first thing the Doggerbund saw */}
          <g transform="translate(150,455) rotate(-8)" fill="#070f14">
            <path d="M0 0 q60 -26 190 -20 l16 10 q-40 26 -120 30 q-70 2 -86 -20 z" />
            <path d="M96 -22 l6 -34 l16 2 l-2 32 z" />
          </g>
          {flakes.map((fl, i) => {
            const y = (fl.y + t * fl.sp) % 110 - 5;
            return <circle key={i} cx={`${(fl.x + Math.sin(t / 3 + i) * fl.dr / 10 + 100) % 100}%`}
              cy={`${y}%`} r={fl.r} fill="#dceaf0" opacity={0.10 + fl.r * 0.10} />;
          })}
          <rect width="1000" height="560" fill="url(#tvig)" />
        </svg>

        <div className="relative text-center cc-titlestack">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Snowflake size={30} className="cc-text-7fc9d6" strokeWidth={1.4} />
            <h1 className="disp cc-text-64px cc-sm-text-84px leading-none cc-titleword">Cold Coast</h1>
          </div>
          <p className="cc-text-15px cc-text-adc2cc tracking-wide mb-1">
            Three hundred and eighty winters after the Collapse
          </p>
          <p className="cc-text-14px cc-text-8399a6 cc-max-w-62ch mx-auto leading-relaxed mb-7">
            The seas fell and gave back a continent. Out on the dry Dogger, the wrecks
            stand where they settled, and seven realms are counting what is left.
          </p>
          <button type="button" onClick={onBegin} className="cc-beginbtn disp cc-text-19px">
            <Play size={17} /> {saved ? "Begin again" : "Begin"}
          </button>
          {saved && (
            <div className="mt-3">
              <button type="button" onClick={onContinue}
                className="disp cc-text-16px px-5 py-2 rounded cc-bg-1f4a52 cc-hover-bg-2a5f69 border cc-border-356b76 cc-text-d9f0f2 inline-flex items-center gap-2 transition-colors">
                <Flag size={15} /> Continue as {FACTION[saved.player]?.short || "your realm"}
              </button>
              <p className="cc-text-12px cc-text-8399a6 mt-2">
                {seasonOf(saved.turn).name} of year {yearOf(saved.turn)}, saved {new Date(saved.at).toLocaleString()}
              </p>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button type="button" onClick={() => onSound("music")}
              className={`cc-sndbtn ${sound.music ? "cc-sndon" : ""}`} title="Score">
              <Music size={15} />
            </button>
            <button type="button" onClick={() => onSound("sfx")}
              className={`cc-sndbtn ${sound.sfx ? "cc-sndon" : ""}`} title="Sound">
              {sound.sfx ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ NATION PICK ------------------------------- */
function NationPicker({ onPick }) {
  const [sel, setSel] = useState("dogger");
  const n = NATIONS[sel];
  return (
    <div className="cc-root cc-page w-full flex flex-col cc-text-e5eef3"
      style={{ background: "radial-gradient(1000px 600px at 50% -10%, #1a2c36 0%, #0b1116 65%, #070b0e 100%)", color: "#ffffff" }}>
      <style>{UI_CSS}</style>
      <div className="cc-max-w-1080px mx-auto px-5 cc-sm-px-8 py-10 cc-sm-py-12 w-full">
        <div className="flex items-center gap-3 mb-1">
          <Snowflake size={26} className="cc-text-7fc9d6" strokeWidth={1.5} />
          <h1 className="disp cc-text-40px cc-sm-text-52px leading-none">Cold Coast</h1>
        </div>
        <p className="cc-text-13d5px cc-text-8399a6 mb-4">
          Choose a realm and you take its warlord's name. What follows is yours.
        </p>
        <div className="flex items-center gap-3 mb-5 rounded border cc-border-31454f cc-bg-131f27 p-3">
          <LordPortrait id={sel} className="cc-lordthumb" small />
          <div className="min-w-0">
            <div className="disp cc-text-17px" style={{ color: n.color }}>{WARLORDS[sel].name}</div>
            <div className="cc-text-12d5px cc-text-93a9b5">{WARLORDS[sel].title} — you</div>
          </div>
        </div>
        <p className="cc-text-15px cc-text-adc2cc leading-relaxed cc-max-w-62ch mb-9">
          Three hundred and eighty winters after the Collapse, the ice took the water back.
          The seas fell a hundred metres and gave up their floors. The North Sea is a silt prairie,
          the Baltic a chain of lakes, and the Black Sea is drying into salt. Seven powers are
          walking out onto the new ground. Only one of them gets to keep it.
        </p>

        <div className="flex flex-col cc-lg-flex-row gap-7">
          <div className="grid gap-2 flex-1">
            {NATION_IDS.map((id) => {
              const d = NATIONS[id];
              const on = sel === id;
              return (
                <button key={id} type="button" aria-pressed={on}
                  onClick={() => setSel(id)} onFocus={() => setSel(id)}
                  className={`text-left px-4 py-3 rounded border transition-colors ${on ? "cc-border-3d6470 cc-bg-121e26" : "cc-border-243138 cc-hover-border-2b3d47"}`}>
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 flex items-center justify-center rounded"
                      style={{ width: 34, height: 34, background: mix(d.color, "#0b1116", 0.82),
                               border: `1px solid ${mix(d.color, "#0b1116", on ? 0.35 : 0.6)}` }}>
                      <Sigil id={id} size={21} color={d.color} />
                    </span>
                    <span className="disp cc-text-20px flex-1 min-w-0">{d.name}</span>
                    <span className="cc-text-12d5px cc-text-8399a6 shrink-0 whitespace-nowrap ml-3">{d.cue}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="w-full cc-lg-w-380px shrink-0 rounded border cc-border-31454f cc-bg-0e161d p-5 self-start">
            <div className="flex items-center gap-3 mb-3">
              <span className="shrink-0 flex items-center justify-center rounded"
                style={{ width: 46, height: 46, background: mix(n.color, "#0b1116", 0.8),
                         border: `1px solid ${mix(n.color, "#0b1116", 0.42)}` }}>
                <Sigil id={sel} size={29} color={n.color} width={1.6} />
              </span>
              <div className="disp cc-text-24px leading-tight">{n.name}</div>
            </div>
            <p className="cc-text-14px cc-text-adc2cc leading-relaxed mb-4">{n.blurb}</p>
            <div className="cc-text-12px cc-text-8399a6 mb-1.5 pb-1 border-b cc-border-243138">Their edge</div>
            <p className="cc-text-13d5px cc-text-d3e5ec leading-relaxed mb-4">{n.trait}</p>
            <div className="cc-text-12px cc-text-8399a6 mb-1.5 pb-1 border-b cc-border-243138">Seat of power</div>
            <p className="cc-text-13d5px cc-text-cfe0e8 flex items-center gap-1.5 mb-5">
              <MapPin size={13} /> {LANDMARKS[key(n.cap[0], n.cap[1])] || "an unnamed hold"}
            </p>
            <button type="button" onClick={() => onPick(sel)}
              className="w-full py-3 rounded disp cc-text-16px border transition-colors"
              style={{ background: mix(n.color, "#0b1116", 0.72), borderColor: mix(n.color, "#0b1116", 0.45), color: "#eaf6fa" }}>
              Take up the banner as {WARLORDS[sel].name}
            </button>
            <p className="cc-text-12px cc-text-8399a6 mt-2.5 text-center">
              Pick a name to read about them. Nothing starts until you take a banner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- CODEX ----------------------------------- */
/* The realm-wide panels used to be tabs in the sidebar, six of them sharing a
   column narrow enough that "Advances" and "Works" were squeezed to a few
   pixels each. They are reached from the top bar now, and each one opens in
   the same overlay the tech tree and the seat already use. The panels
   themselves are unchanged — this moves where they live, not what they say. */
function RealmScreen({ title, onClose, children }) {
  return (
    <Overlay onClose={onClose}>
      <div className="cc-w-720px cc-max-w-94vw cc-max-h-86vh rounded-lg border cc-border-31454f cc-bg-0d141a flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 border-b cc-border-28363f flex items-center justify-between">
          <div className="disp cc-text-20px">{title}</div>
          <button onClick={onClose} className="cc-text-93a9b5 cc-hover-text-e5eef3"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto thin p-5">{children}</div>
      </div>
    </Overlay>
  );
}

function Codex({ onClose }) {
  return (
    <Overlay onClose={onClose}>
      <div className="cc-w-720px cc-max-w-94vw cc-max-h-86vh rounded-lg border cc-border-31454f cc-bg-0d141a flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 border-b cc-border-28363f flex items-center justify-between">
          <div className="disp cc-text-20px">How this works</div>
          <button onClick={onClose} className="cc-text-93a9b5 cc-hover-text-e5eef3"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto thin p-5 cc-text-14px leading-relaxed cc-text-c3d5de grid gap-4">
          <div>
            <div className="disp cc-text-16px cc-text-e5eef3 mb-1">A winter is a turn</div>
            <p>Spend it however you like, then end it. Every holding you own pays out, every company you feed takes a bite, and then everyone else moves. Building work also advances by one winter — a site carries a gold progress collar on the map and pays nothing until that collar closes.</p>
          </div>
          <div>
            <div className="disp cc-text-16px cc-text-e5eef3 mb-1">Five things to run out of</div>
            <p>Rations feed your companies and go negative if you over-recruit — starving warbands melt away. Scrap builds and equips everything. Fuel runs technicals. Powder is only spent in battle, and guns without it fight at a quarter strength. Recruits are the bodies themselves.</p>
          </div>
          <div>
            <div className="disp cc-text-16px cc-text-e5eef3 mb-1">The ground the sea left behind</div>
            <p>The map is real Europe with the water taken out of it. The Baltic and the Black Sea are cut off below their sills and have gone fresh, so they survive as great inland lakes. The shallow shelves did not: the southern North Sea, the Channel and the Irish Sea are silt prairie now, which is why Lunden sits inland and why you can walk from Kent to Jutland. Silt flats are the best farmland on the map and are studded with wrecks, but they are flat and open and terrible to defend. Ruinfields give scrap and powder and no food at all. Mountains give almost nothing and are nearly impossible to storm. The map is large — drag to pan, use the zoom controls in the corner, and press Seat to jump back to your capital.</p>
          </div>
          <div>
            <div className="disp cc-text-16px cc-text-e5eef3 mb-1">Marching</div>
            <p>Click a warband and it lifts, ringed in white, with its remaining movement shown as pips beneath. Every hex it can reach lights up with a chevron pointing the way. Click one to march. Click the warband again, press Escape, or click the sea to put it down. Rough ground costs more movement, and stepping onto an enemy warband starts a battle.</p>
          </div>
          <div>
            <div className="disp cc-text-16px cc-text-e5eef3 mb-1">Supply</div>
            <p>A warband eats every season, and what it eats depends entirely on where it is standing. On your own ground it eats what the muster roll says. A hex past your border costs half again, two hexes costs nearly two and a half times, and past that there is no supply line at all: they are living on what they carried, losing men and nerve every season, and worse on hard ground and in winter. The warning mark on a marker means that column is past the end of its line.</p>
            <p className="mt-2">There are two answers and they are both deliberate. Claim ground as you go, so the line moves with you. Or learn carting and put a baggage train in the column: it drags the line two hexes further, costs the whole warband a point of movement, and is worth nothing whatever in a fight. Quartering, later, adds a hex again and halves the wastage.</p>
          </div>
          <div>
            <div className="disp cc-text-16px cc-text-e5eef3 mb-1">Battles</div>
            <p>A battle is a line: left, centre and right, with a reserve behind it. Before a blow is struck you draw it up — pick one of the preset formations, or drag companies between sectors and into reserve yourself. You see only what your outriders brought back, so a warband with no scouts deploys blind.</p>
            <p className="mt-2">Then each sector takes its own order and both lines resolve at once. Every sector fights the one opposite it, on its own ground: broken ground is worth holding and useless to horse, a wall has to come down before anything behind it can be reached. When a sector breaks, the enemy in it turns onto whichever sector is beside it, which is how a line comes apart rather than simply wearing down. Companies that lose their nerve run before they are killed, and you get about half of them back — unless the other side still has horse to chase them.</p>
          </div>
          <div>
            <div className="disp cc-text-16px cc-text-e5eef3 mb-1">Winning</div>
            <p>Take four rival seats of power, or hold a tenth of the continent, or simply hold more than anyone after a hundred and fifty seasons. A seat stays a seat after it falls, so a captured capital keeps flying its crest under your colours. Lose every holding and it is over.</p>
          </div>
          {/* The icon set is CC BY 3.0, which means its authors have to be
              named somewhere a player can find them. This is that place. */}
          <div className="pt-2 border-t cc-border-28363f">
            <div className="disp cc-text-16px cc-text-e5eef3 mb-1">Credits</div>
            <p className="cc-text-13px cc-text-93a9b5">
              Company and advance icons by {ICON_AUTHORS.join(", ")} from{" "}
              <span className="cc-text-c3d5de">game-icons.net</span>, used under the
              Creative Commons Attribution 3.0 licence.
            </p>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function GameOver({ over, onRestart }) {
  return (
    <Overlay>
      <div className="cc-w-520px cc-max-w-92vw rounded-lg border cc-border-31454f cc-bg-0d141a p-7 text-center">
        <div className="disp cc-text-34px mb-2" style={{ color: over.win ? "#8fe3d6" : "#e0644a" }}>
          {over.win ? "The coast is yours" : "The banner falls"}
        </div>
        <p className="cc-text-14px cc-text-c3d5de leading-relaxed mb-6">{over.why}</p>
        <button onClick={onRestart}
          className="px-6 py-2.5 rounded cc-bg-1f4a52 cc-hover-bg-2a5f69 border cc-border-356b76 cc-text-d9f0f2 disp cc-text-15px">
          Start again
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,9,12,.78)", backdropFilter: "blur(3px)" }}
      onClick={(e) => { if (onClose && e.target === e.currentTarget) onClose(); }}>
      {children}
    </div>
  );
}
