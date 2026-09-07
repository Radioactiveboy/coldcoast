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
  Flag, Sparkles, Play, Anvil, Boxes,
} from "lucide-react";
import { TECHS, TECH_IDS } from "./data/techs.js";
import { UNIT_TIERS, UNITS, UNIT_IDS } from "./data/units.js";
import { SETTLEMENT, WORKS, WORK_IDS } from "./data/settlement.js";
import { seasonOf, yearOf } from "./data/seasons.js";
import { BUILDINGS } from "./data/buildings.js";
import { WARLORDS, LORD_COMMAND, LEADERLESS } from "./data/warlords.js";
import { writeSave, readSave, saveInfo } from "./game/save.js";

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
.cc-text-9fd6b4{color:#9fd6b4}
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
.cc-mapscroll{cursor:grab;background:#080d11;overscroll-behavior:contain;will-change:scroll-position}
.cc-mapscroll:active{cursor:grabbing}
.cc-maptools{right:12px;bottom:12px;background:rgba(10,16,21,.88);border:1px solid #31454f;border-radius:6px;padding:5px 7px;backdrop-filter:blur(4px)}
.cc-zoombtn{width:26px;height:26px;border:1px solid #31454f;border-radius:4px;background:#131f27;color:#dfeaf0;font-size:15px;line-height:1;display:flex;align-items:center;justify-content:center}
.cc-zoombtn:hover{border-color:#4d7488;background:#1b2a34}
.cc-w-auto{width:auto}
.cc-sndbtn{width:28px;height:28px;border:1px solid #31454f;border-radius:5px;background:#131f27;color:#7b8f9b;display:flex;align-items:center;justify-content:center}
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

const TERRAIN = {
  p: { name: "Plains",        color: "#7d8a5c", food: 3, scrap: 0, fuel: 0, powder: 0, men: 2, def: 0,  move: 1, land: true },
  f: { name: "Cold forest",   color: "#4a6350", food: 1, scrap: 1, fuel: 2, powder: 0, men: 1, def: 10, move: 2, land: true },
  h: { name: "Hills",         color: "#77705a", food: 1, scrap: 2, fuel: 1, powder: 0, men: 1, def: 15, move: 2, land: true },
  m: { name: "Mountains",     color: "#5d5f63", food: 0, scrap: 2, fuel: 0, powder: 0, men: 0, def: 28, move: 3, land: true },
  s: { name: "Steppe",        color: "#9a9463", food: 2, scrap: 1, fuel: 0, powder: 0, men: 3, def: 0,  move: 1, land: true },
  t: { name: "Tundra",        color: "#8e9aa0", food: 1, scrap: 0, fuel: 0, powder: 0, men: 1, def: 5,  move: 2, land: true },
  g: { name: "Glacier",       color: "#eaf3f7", food: 0, scrap: 0, fuel: 0, powder: 0, men: 0, def: 12, move: 3, land: true },
  d: { name: "Silt flats",    color: "#a5905e", food: 4, scrap: 2, fuel: 0, powder: 0, men: 1, def: -10, move: 1, land: true },
  c: { name: "Saltmarsh",     color: "#6f7a5f", food: 2, scrap: 1, fuel: 1, powder: 0, men: 0, def: 12, move: 2, land: true },
  r: { name: "Ruinfield",     color: "#8a5540", food: 0, scrap: 5, fuel: 1, powder: 2, men: 1, def: 22, move: 2, land: true },
  b: { name: "Saltpan",       color: "#b9a98b", food: 0, scrap: 1, fuel: 3, powder: 0, men: 0, def: -5, move: 1, land: true },
  l: { name: "Freshwater",    color: "#3f6b7d", food: 3, scrap: 0, fuel: 0, powder: 0, men: 0, def: -12, move: 2, land: true },
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
    trait: "They kept the manuals and can still read them: every advance takes 30% fewer winters, and +35% defence in hills and mountains.",
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

function UnitArt({ type, size = 40, plinth }) {
  const src = UNIT_ART[type];
  if (!src) return null;
  return (
    <span className={plinth ? "cc-unitplinth" : "cc-unitart"} style={{ height: size }}>
      <img src={src} alt="" style={{ height: size, width: "auto", display: "block" }} />
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
const CRAFT_BASE = 55;                       // a seat's own workshops, per season
const CRAFT_PER_HUT = 40;                    // each craftsmen's hut on top

function craftOutput(provinces, natId) {
  let out = 0;
  Object.values(provinces).forEach((p) => {
    if (p.owner !== natId) return;
    if (p.capital) out += CRAFT_BASE;
    if (p.building === "workshop" && !p.buildLeft) out += p.damaged ? CRAFT_PER_HUT / 2 : CRAFT_PER_HUT;
  });
  return Math.round(out);
}
// Shares are whole numbers; the season's output is split between them.
function craftSplit(nat, provinces, natId) {
  const total = craftOutput(provinces, natId);
  const shares = nat.crafts || {};
  const open = unitsFor(nat).filter((id) => (shares[id] || 0) > 0);
  const sum = open.reduce((n, id) => n + shares[id], 0);
  const out = {};
  open.forEach((id) => { out[id] = Math.round((total * shares[id]) / sum); });
  return { total, per: out };
}

const wGrade = (id) => WEAPON_GRADES.find((g) => g.id === id) || WEAPON_GRADES[0];
const aGrade = (id) => ARMOUR_GRADES.find((g) => g.id === id) || ARMOUR_GRADES[0];
const gradesFor = (nat, list) => list.filter((g) => !g.needs || nat?.known?.[g.needs]);
const unitOpen = (nat, id) => !UNITS[id].needs || !!nat?.known?.[UNITS[id].needs];
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
    antiCav: d.antiCav || 1, cav: !!d.cav, siege: !!d.siege,
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
    (t.site.building && p.building === t.site.building && !p.buildLeft));
}
function techState(state, natId, id) {
  const n = state.nations[natId];
  const t = TECHS[id];
  if (n.known?.[id]) return { s: "known" };
  if (n.research?.id === id) return { s: "working", left: n.research.left };
  const missing = t.needs.filter((k) => !n.known?.[k]);
  if (missing.length) return { s: "locked", why: `Needs ${missing.map((k) => TECHS[k].name.toLowerCase()).join(" and ")}.` };
  if (!hasSite(state, natId, t)) return { s: "locked", why: `Needs ${t.site.label}.` };
  if (n.research) return { s: "busy", why: "Your workshops are already on something else." };
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
    garrison: ["axemen", "axemen", "axemen", "spearmen"],
    loot: { scrap: 30, powder: 18 },
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
const musteringGround = (p) => !!p && (p.capital || (p.building === "muster" && !p.buildLeft));

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
  let ctx = null, master = null, musicBus = null, sfxBus = null;
  let noiseBuf = null, playing = false, timer = null, voices = [];
  let wantMusic = true, wantSfx = true;

  const ok = () => ctx && ctx.state !== "closed";

  function ensure() {
    if (ctx) return ctx;
    const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.75; sfxBus.connect(master);
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
    win:     () => { [220, 277.2, 329.6, 440].forEach((f, i) => tone(f, 2.2, "sawtooth", 0.05, i * 0.16)); },
    lose:    () => { [220, 207.7, 174.6, 146.8].forEach((f, i) => tone(f, 2.4, "sawtooth", 0.05, i * 0.22)); },
  };

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
      if (wantMusic) { startMusic(); fade(musicBus, 0.5, 3); }
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
      if (on) { startMusic(); fade(musicBus, 0.5, 2); }
      else { fade(musicBus, 0, 1.2); setTimeout(stopMusic, 1300); }
    },
    sfx(on) { wantSfx = on; if (ok()) fade(sfxBus, on ? 0.75 : 0, 0.2); },
    state() { return { music: wantMusic, sfx: wantSfx }; },
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
      provinces[k] = { c, r, t, name: nm, owner: null, building: null, capital: false, seat: null, explored: false, feature: null };
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
      crafts: { spearmen: 2, axemen: 1, hunters: 1 },
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

  // Some ruins are occupied. Which ones is not visible until surveyed.
  Object.values(provinces).forEach((q) => {
    const named = NAMED_LAIRS[key(q.c, q.r)];
    if (named) { q.lair = named; return; }
    if (q.t !== "r" || q.owner) return;
    if (noise(q.c * 11.3, q.r * 7.7, 31) < 0.34) {
      q.lair = noise(q.r * 5.1, q.c * 9.4, 32) < 0.42 ? "changed" : "wasters";
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
      q.feature = m.feature; q.building = m.building; q.buildLeft = 0;
    }
  });

  const war = {};
  return { provinces, nations, war };
}

const warKey = (a, b) => [a, b].sort().join("|");


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
    return { ok: false, cost, why: `Needs ${cost} movement; ${army.mp} left this winter.` };
  if (other) return { ok: true, cost, kind: "attack", label: `Attack the ${game.nations[other.owner].short} warband` };
  const friend = game.armies.find((a) => a.c === prov.c && a.r === prov.r && a.owner === P);
  if (friend) {
    if (friend.units.length + army.units.length > 8)
      return { ok: false, cost, why: `${friend.name} is already at full strength — eight companies is the limit.` };
    return { ok: true, cost, kind: "merge", label: `Merge forces with ${friend.name}` };
  }
  if (prov.owner && prov.owner !== P) return { ok: true, cost, kind: "seize", label: "March in and take it" };
  return { ok: true, cost, kind: "march", label: "March here" };
}

/* ------------------------------- ECONOMY ---------------------------------- */
function provinceYield(p, natId, nat) {
  const t = TERRAIN[p.t];
  const y = { food: t.food, scrap: t.scrap, metal: 0, fuel: t.fuel, powder: t.powder, men: t.men };
  if (p.building && !p.buildLeft && BUILDINGS[p.building].yield) {
    Object.entries(BUILDINGS[p.building].yield).forEach(([k, v]) => {
      y[k] += p.damaged ? Math.floor(v / 2) : v;
    });
  }
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
  Object.values(state.provinces).forEach((p) => {
    if (p.owner !== natId) return;
    const y = provinceYield(p, natId, state.nations?.[natId]);
    Object.keys(gross).forEach((k) => { gross[k] += y[k]; });
  });
  // the standing edict and the warlord both apply to what the land brings in...
  const lord = lordMul(natId, state.nations?.[natId]);
  const sea = seasonOf(turn ?? state.turn ?? 1);
  ["food", "scrap", "men"].forEach((k) => { gross[k] = Math.round(gross[k] * (sea[k] ?? 1)); });
  Object.entries(ed.mul || {}).forEach(([k, v]) => { gross[k] = Math.round(gross[k] * v); });
  Object.entries(lord.mul).forEach(([k, v]) => { gross[k] = Math.round(gross[k] * v); });
  // ...then the warbands take their share
  const keep = (ed.upkeep || 1) * lord.upkeep;
  state.armies.filter((a) => a.owner === natId).forEach((a) => {
    a.units.forEach((u) => {
      const st = unitStats(u);
      let f = st.food;
      if (natId === "horde" && st.cav) f = Math.round(f * 0.5);
      gross.food -= Math.round(f * keep);
      gross.fuel -= Math.round(st.fuel * keep);
    });
  });
  return gross;
}

/* ------------------------------- COMBAT ----------------------------------- */
function sidePower(units, stance, hasPowder) {
  let melee = 0, ranged = 0, defSum = 0, strSum = 0, cavStr = 0, antiCav = 0;
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
  });
  const avgDef = strSum ? defSum / strSum : 0;
  // Only so many men can reach the fighting at once. Beyond that you have depth,
  // not more firepower — which is what stops a small edge snowballing into a rout.
  const front = Math.min(1, FRONTAGE / Math.max(1, strSum));
  return { melee: melee * front, ranged: ranged * front, avgDef, strSum, cavStr, antiCav };
}
const FRONTAGE = 340;

const STANCES = {
  press:    { name: "Press the attack", deal: 1.3,  take: 1.15, morale: 1.0, ranged: 1.0, desc: "Close hard. Wins open ground, bleeds you on bad ground." },
  hold:     { name: "Hold the line",    deal: 0.85, take: 0.8,  morale: 0.9,  ranged: 1.0, desc: "Give up tempo to keep your companies together." },
  volley:   { name: "Volley fire",      deal: 1.0,  take: 1.0,  morale: 1.0,  ranged: 1.4, melee: 0.5, powder: 2, ignoresGround: 0.5, desc: "Shell them rather than storm them. Halves their ground advantage and burns double powder. Useless without guns." },
  withdraw: { name: "Break off",        deal: 0.4,  take: 1.4,  morale: 1.15,  ranged: 0.5, desc: "Quit the field and eat one parting volley." },
};

function resolveRound(bt) {
  const b = { ...bt, log: [...bt.log] };
  const aStance = STANCES[b.aStance], dStance = STANCES[b.dStance];

  const aPowderNeed = b.a.units.reduce((n, u) => n + unitStats(u).powder, 0) * (aStance.powder || 1);
  const dPowderNeed = b.d.units.reduce((n, u) => n + unitStats(u).powder, 0) * (dStance.powder || 1);
  const aHas = b.aPowder >= aPowderNeed;
  const dHas = b.dPowder >= dPowderNeed;
  b.aPowder = Math.max(0, b.aPowder - (aHas ? aPowderNeed : 0));
  b.dPowder = Math.max(0, b.dPowder - (dHas ? dPowderNeed : 0));
  if (!aHas && aPowderNeed > 0) b.log.push({ t: "warn", s: "a", m: "Attacking guns are down to scavenged charges." });
  if (!dHas && dPowderNeed > 0) b.log.push({ t: "warn", s: "d", m: "Defending guns are down to scavenged charges." });

  const A = sidePower(b.a.units, aStance, aHas);
  const D = sidePower(b.d.units, dStance, dHas);

  const terrDef = b.terrainDef / 100;
  const rng = () => 0.85 + Math.random() * 0.3;

  const aL = b.aLord || { dealt: 1, taken: 1, morale: 1 }, dL = b.dLord || { dealt: 1, taken: 1, morale: 1 };
  let aOut = (A.ranged * (aStance.ranged || 1) + A.melee * (aStance.melee || 1)) * aStance.deal * aL.dealt;
  let dOut = (D.ranged * (dStance.ranged || 1) + D.melee * (dStance.melee || 1)) * dStance.deal * dL.dealt;

  // Cavalry charges bite unless pikes are waiting.
  if (A.cavStr > 0 && D.antiCav < D.strSum * 0.3) aOut *= 1.25;
  if (D.cavStr > 0 && A.antiCav < A.strSum * 0.3) dOut *= 1.25;

  // Standing off and shooting denies the defender much of their ground advantage.
  const groundMul = aStance.ignoresGround || 1;
  dOut *= 1 + terrDef * groundMul;
  if (b.defenderBonus) dOut *= 1 + (b.defenderBonus / 100) * groundMul;

  // Each side's output is already stance-adjusted; here we apply the *receiving*
  // side's stance and its armour.
  const K = 3.4;
  const aCas = Math.round((dOut * K * rng() * aStance.take * aL.taken) / (1 + A.avgDef / 5));
  const dCas = Math.round((aOut * K * rng() * dStance.take * dL.taken) / (1 + D.avgDef / 5));

  const apply = (side, total, stanceMul) => {
    const units = side.units;
    const strTotal = units.reduce((n, u) => n + u.str, 0) || 1;
    const routed = [];
    units.forEach((u) => {
      const share = u.str / strTotal;
      const loss = Math.min(u.str, Math.round(total * share * (0.7 + Math.random() * 0.6)));
      u.str -= loss;
      u.lastLoss = loss;
      const pct = loss / u.max;
      u.morale -= pct * 70 * stanceMul + 2;
      if (u.str <= 0) { u.str = 0; routed.push({ u, dead: true }); }
      else if (u.morale <= 0) routed.push({ u, dead: false });
    });
    return routed;
  };

  const aRouted = apply(b.a, aCas, aStance.morale * (aL.morale || 1));
  const dRouted = apply(b.d, dCas, dStance.morale * (dL.morale || 1));

  b.log.push({ t: "round", m: `Round ${b.round}: attackers lose ${aCas}, defenders lose ${dCas}.` });
  [...aRouted].forEach((x) => b.log.push({
    t: x.dead ? "dead" : "rout", s: "a",
    m: x.dead ? `${unitName(x.u)} is wiped out.` : `${unitName(x.u)} breaks and runs.`,
  }));
  [...dRouted].forEach((x) => b.log.push({
    t: x.dead ? "dead" : "rout", s: "d",
    m: x.dead ? `${unitName(x.u)} is wiped out.` : `${unitName(x.u)} breaks and runs.`,
  }));

  b.a.routed = [...b.a.routed, ...aRouted.filter((x) => !x.dead).map((x) => ({ ...x.u, str: Math.round(x.u.str * 0.5) }))];
  b.d.routed = [...b.d.routed, ...dRouted.filter((x) => !x.dead).map((x) => ({ ...x.u, str: Math.round(x.u.str * 0.5) }))];
  b.a.units = b.a.units.filter((u) => u.str > 0 && u.morale > 0);
  b.d.units = b.d.units.filter((u) => u.str > 0 && u.morale > 0);

  b.lastExchange = {
    round: b.round, aCas, dCas,
    aStance: b.aStance, dStance: b.dStance,
    aRouted: aRouted.length, dRouted: dRouted.length,
    aDry: !aHas && aPowderNeed > 0, dDry: !dHas && dPowderNeed > 0,
  };
  b.round += 1;

  if (b.aStance === "withdraw" && b.a.units.length) { b.over = true; b.winner = "d"; b.retreat = "a"; }
  else if (b.dStance === "withdraw" && b.d.units.length) { b.over = true; b.winner = "a"; b.retreat = "d"; }
  else if (!b.a.units.length && !b.d.units.length) { b.over = true; b.winner = "d"; }
  else if (!b.a.units.length) { b.over = true; b.winner = "d"; }
  else if (!b.d.units.length) { b.over = true; b.winner = "a"; }
  else if (b.round > 10) { b.over = true; b.winner = "d"; b.stalemate = true; }

  if (b.over) {
    b.log.push({
      t: "end",
      m: b.stalemate ? "Light fails. The attack is called off."
        : b.retreat ? `${b.retreat === "a" ? "Attackers" : "Defenders"} disengage.`
        : `${b.winner === "a" ? "Attackers" : "Defenders"} hold the field.`,
    });
  }
  return b;
}


function makeBattle(provinces, nations, armies, aId, dId, k) {
  const attacker = armies.find((a) => a.id === aId);
  const defender = armies.find((a) => a.id === dId);
  const prov = provinces[k];
  if (!attacker || !defender || !prov) return null;
  const terrainDef = TERRAIN[prov.t].def + (prov.building === "redoubt" && !prov.buildLeft ? BUILDINGS.redoubt.def : 0);
  let defenderBonus = 0;
  if (defender.owner === "alpine" && ["h", "m"].includes(prov.t)) defenderBonus += 35;
  if (isMinor(defender.owner)) defenderBonus += MINORS[defender.owner].defBonus;
  defenderBonus += seatDefence(prov);
  return {
    round: 1,
    aNat: attacker.owner, dNat: defender.owner,
    aArmy: attacker.id, dArmy: defender.id,
    hex: { c: prov.c, r: prov.r }, provName: prov.name,
    a: { units: attacker.units.map((u) => ({ ...u })), routed: [] },
    d: { units: defender.units.map((u) => ({ ...u })), routed: [] },
    aPowder: nations[attacker.owner].res.powder,
    dPowder: nations[defender.owner].res.powder,
    aStance: "press", dStance: "hold",
    terrainDef, defenderBonus,
    aLord: attacker.lord ? commandMul(attacker.owner) : { dealt: 1, taken: 1, morale: 1 },
    dLord: defender.lord ? commandMul(defender.owner) : { dealt: 1, taken: 1, morale: 1 },
    aCommander: !!attacker.lord, dCommander: !!defender.lord,
    log: [{
      t: "open",
      m: `${nations[attacker.owner].short} strikes at ${prov.name}. ${TERRAIN[prov.t].name} favours the defender by ${terrainDef}%.`,
    }],
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
    showCodex: false, pending: [], survey: null, seat: null, tree: false, lords: false, lair: null, met: {}, notices: [], focus: null, sound: { music: true, sfx: true },
  };
}
const baseMove = (natId) => (natId === "lyon" || natId === "horde" ? 6 : 5);


function advanceBattle(b0, P, playerStance) {
  const pSide = b0.aNat === P ? "a" : b0.dNat === P ? "d" : null;
  const b = { ...b0 };
  if (pSide === "a") b.aStance = playerStance;
  if (pSide === "d") b.dStance = playerStance;
  const ai = pSide === "a" ? "d" : "a";
  const mine = b[ai].units.reduce((n, u) => n + u.str, 0);
  const theirs = b[ai === "a" ? "d" : "a"].units.reduce((n, u) => n + u.str, 0);
  const ratio = mine / Math.max(1, theirs);
  let pick = "hold";
  if (ratio > 1.35) pick = "press";
  else if (ratio < 0.45 && b.round > 2) pick = "withdraw";
  else if (b[ai].units.some((u) => unitStats(u).ranged > 8)) pick = Math.random() < 0.5 ? "volley" : "hold";
  b[ai === "a" ? "aStance" : "dStance"] = pick;
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
  if (!P) return <NationPicker onPick={(id) => { Sound.wake(); setGame((g) => ({ ...g, player: id })); }} />;

  /* --------------------------- ACTION HANDLERS --------------------------- */
  const push = (m) => setGame((g) => ({ ...g, log: [{ turn: g.turn, m }, ...g.log].slice(0, 60) }));

  function selectHex(c, r) {
    const k = key(c, r);
    const p = game.provinces[k];
    if (!p) return;
    const army = game.armies.find((a) => a.c === c && a.r === r);
    const mine = army && army.owner === P;
    const sel = game.sel || {};
    const held = sel.armyId ? game.armies.find((a) => a.id === sel.armyId) : null;

    // Clicking a hex you are already looking at, with a warband in hand and the
    // move legal, is the confirmation. The first click only offers it.
    if (held && sel.k === k) {
      const info = moveInfo(game, held, p, P, atWar);
      if (info && info.ok) { attemptMove(held, p); return; }
      if (held.c === c && held.r === r) { setGame((g) => ({ ...g, sel: { armyId: null, k } })); return; }
    }
    // Holding a warband and clicking another of your own keeps the first in
    // hand, so the panel can offer to merge them. Switching is explicit.
    setGame((g) => ({
      ...g,
      sel: { armyId: held ? held.id : (mine ? army.id : null), k },
    }));
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
      if (friend.units.length + army.units.length > 8) {
        push(`${friend.name} is already at full strength. Eight companies is the limit.`);
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

      const survivors = (side) => [...b[side].units, ...b[side].routed.filter((u) => u.str > 0)]
        .map((u) => ({ ...u, morale: Math.max(20, u.maxMorale * 0.7), xp: Math.min(3, u.xp + (b.winner === side ? 1 : 0)) }));

      const aUnits = survivors("a");
      const dUnits = survivors("d");

      // powder spent
      nations[b.aNat] = { ...nations[b.aNat], res: { ...nations[b.aNat].res, powder: Math.max(0, b.aPowder) } };
      nations[b.dNat] = { ...nations[b.dNat], res: { ...nations[b.dNat].res, powder: Math.max(0, b.dPowder) } };

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
          provinces[tk] = tp;
          armies = armies.map((a) => (a.id === b.aArmy ? { ...a, c: b.hex.c, r: b.hex.r } : a));
          msg = `${nations[b.aNat].short} storms ${b.provName}${prev ? `, wresting it from ${nations[prev].short}` : ""}.`;
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

      const entries = [{ turn: g.turn, m: msg }];
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
        log: [{ turn: g.turn, m: `The workshops turn to ${t.name.toLowerCase()}.` }, ...g.log].slice(0, 60),
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
        log: [{ turn: g.turn, m: `Work begins on a ${t.name.toLowerCase()} at ${p.name} — ${t.turns} winters.` }, ...g.log].slice(0, 60),
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
      if (!pr || pr.owner !== P || !pr.damaged) return g;
      const cost = Math.ceil(BUILDINGS[pr.building].scrap / 2);
      const n = g.nations[P];
      if (n.res.scrap < cost) return g;
      Sound.play("tick");
      return {
        ...g,
        nations: { ...g.nations, [P]: { ...n, res: { ...n.res, scrap: n.res.scrap - cost } } },
        provinces: { ...g.provinces, [k]: { ...pr, damaged: false } },
        log: [{ turn: g.turn, m: `${BUILDINGS[pr.building].name} at ${pr.name} put back in order.` }, ...g.log].slice(0, 60),
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
          ? `You set out to join ${target.name}, and will reach them next winter.`
          : "You start back for your seat." }, ...g.log].slice(0, 60),
      };
    });
  }

  function setCraft(type, d) {
    setGame((g) => {
      const n = g.nations[P];
      const crafts = { ...(n.crafts || {}) };
      const next = Math.max(0, Math.min(9, (crafts[type] || 0) + d));
      crafts[type] = next;
      if (!Object.values(crafts).some((v) => v > 0)) return g;   // somebody must be working
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
      if (from.units.length + to.units.length > 8) return g;
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

  function build(k, bid) {
    setGame((g) => {
      const p = g.provinces[k];
      const b = BUILDINGS[bid];
      if (!p || p.owner !== P || p.building) return g;
      if (g.nations[P].res.scrap < b.scrap) return g;
      const nations = { ...g.nations };
      nations[P] = { ...nations[P], res: { ...nations[P].res, scrap: nations[P].res.scrap - b.scrap } };
      Sound.play("tick");
      const provinces = { ...g.provinces, [k]: { ...p, building: bid, buildLeft: b.turns } };
      return { ...g, nations, provinces, log: [{ turn: g.turn, m: `Work begins on a ${b.name.toLowerCase()} at ${p.name} — ${b.turns} winters.` }, ...g.log].slice(0, 60) };
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
      if (res.scrap < cost.scrap || res.men < cost.men || (res.metal || 0) < cost.metal) return g;
      if (have < need) return g;                       // no arms on the rack
      const nations = { ...g.nations };
      nations[P] = { ...n0,
        res: { ...res, scrap: res.scrap - cost.scrap, metal: (res.metal || 0) - cost.metal, men: res.men - cost.men },
        arms: { ...(n0.arms || {}), [type]: have - need } };
      let uid = g.uid;
      const u = makeUnit(type, P, uid++, wg, ag);
      let armies = [...g.armies];
      const here = armies.find((a) => a.c === p.c && a.r === p.r && a.owner === P);
      if (here && here.units.length < 8) {
        armies = armies.map((a) => (a.id === here.id ? { ...a, units: [...a.units, u] } : a));
      } else {
        armies.push({
          id: `a${uid}x`, owner: P, c: p.c, r: p.r,
          name: `${NATIONS[P].short} Warband ${armies.filter((a) => a.owner === P).length + 1}`,
          units: [u], mp: 0, maxMp: baseMove(P),
        });
      }
      return { ...g, nations, armies, uid, recruit: null, log: [{ turn: g.turn, m: `${UNITS[type].name} mustered at ${p.name}.` }, ...g.log].slice(0, 60) };
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
          const target = myProv.find((p) => !p.building);
          if (target) {
            const opts = Object.entries(BUILDINGS)
              .filter(([bid]) => unlocked(nations[id], bid))
              .filter(([, b]) => !b.coast || coastal(target.c, target.r))
              .filter(([, b]) => !b.on || b.on.includes(target.t));
            const [bid, b] = opts[Math.floor(Math.random() * opts.length)] || [];
            if (bid && res.scrap >= b.scrap) {
              nations[id] = { ...nations[id], res: { ...res, scrap: res.scrap - b.scrap } };
              provinces[key(target.c, target.r)] = { ...target, building: bid, buildLeft: b.turns };
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
        const order = ["spearmen", "hunters", "axemen", "bowmen", "pikemen", "riders", "ironclad",
                       "line", "musketeers", "technicals", "guncrew", "riflemen", "vaultguard"];
        const pool = open2.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
        const liked = pool.filter((u) => want.includes(u));
        const type = (liked.length && Math.random() < 0.6 ? liked : pool).pop() || "spearmen";
        const bw = gradesFor(nat2, WEAPON_GRADES).slice(-1)[0].id;
        const ba = gradesFor(nat2, ARMOUR_GRADES).slice(-1)[0].id;
        const cost = unitCost(type, id, nat2, bw, ba);
        const rack = (nat2.arms || {})[type] || 0;
        if (rack >= UNITS[type].size && (r2.metal || 0) >= cost.metal
            && r2.scrap > cost.scrap * (1.6 / style.host) && r2.men > cost.men * (1.4 / style.host)) {
          const host = armies.find((a) => a.owner === id && a.units.length < 8);
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

        // keep the craftsmen on whatever this realm can actually raise
        {
          const nc = nations[id];
          const openU = unitsFor(nc);
          const cur = Object.keys(nc.crafts || {});
          if (openU.length && (cur.length !== openU.length || cur.some((x) => !openU.includes(x)))) {
            const crafts = {};
            openU.slice(-3).forEach((u, i) => { crafts[u] = i === 0 ? 1 : 2; });
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

        // move & fight
        armies.filter((a) => a.owner === id).forEach((a) => {
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

      // --- the Wasters ---
      // They do not claim ground. They walk to whoever has something worth
      // taking, and take it. Everyone is free to go and kill them.
      {
        const claimed = NATION_IDS.reduce((n, x) => n + (heldNow[x] || 0), 0);
        const bands = armies.filter((a) => a.owner === "wasters" && !a.lairBound);
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

        armies.filter((a) => a.owner === "wasters" && !a.lairBound).forEach((a) => {
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
                + (q.building && !q.damaged ? 16 : 0)
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
          if (on.building && !on.buildLeft && !on.damaged && roll < 0.42) {
            provinces[key(a.c, a.r)] = { ...on, damaged: true };
            what = `wreck the ${BUILDINGS[on.building].name.toLowerCase()} at ${on.name}`;
          } else if (roll < 0.72) {
            const take = 18 + Math.floor(Math.random() * 22);
            res3.scrap = Math.max(0, res3.scrap - take);
            what = `carry off ${take} scrap from ${on.name}`;
          } else {
            const food = 12 + Math.floor(Math.random() * 16);
            const men = 6 + Math.floor(Math.random() * 10);
            res3.food = Math.max(0, res3.food - food);
            res3.men = Math.max(0, res3.men - men);
            what = `burn ${food} rations at ${on.name} and take ${men} off with them`;
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
        const { per } = craftSplit(n, provinces, id);
        if (!Object.keys(per).length) return;
        // A rack only holds so much; work beyond three companies' worth is
        // wasted, so there is a reason to keep raising them.
        const arms = { ...(n.arms || {}) };
        Object.entries(per).forEach(([t, v]) => {
          arms[t] = Math.min((arms[t] || 0) + v, UNITS[t].size * 3);
        });
        nations[id] = { ...n, arms };
      });

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
        if (!p.buildLeft) return;
        const left = p.buildLeft - 1;
        provinces[k] = { ...p, buildLeft: left };
        if (left === 0 && p.owner === g.player) {
          newLog.push({ turn: g.turn, m: `${BUILDINGS[p.building].name} at ${p.name} is finished.` });
        }
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

      armies = armies.map((a) => ({
        ...a,
        units: a.units.filter((u) => u.str > 0).map((u) => ({ ...u, morale: Math.min(u.maxMorale, u.morale + 12) })),
        mp: Math.max(1, a.maxMp + ((EDICTS[nations[a.owner]?.edict || "none"] || EDICTS.none).move || 0)
          + lordMul(a.owner, nations[a.owner]).move + seasonOf(g.turn + 1).move),
      })).filter((a) => a.units.length > 0);

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
          ? "A hundred and fifty winters on, you hold more than anyone."
          : `A hundred and fifty winters on, ${NATIONS[best].name} holds more than you.` };
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
        armies={game.armies.filter((a) => a.owner === P).length}
        sound={game.sound} onLords={() => setGame((g) => ({ ...g, lords: true }))}
        onSound={(which) => setGame((g) => {
          const next = { ...g.sound, [which]: !g.sound[which] };
          if (which === "music") Sound.music(next.music); else Sound.sfx(next.sfx);
          return { ...g, sound: next };
        })}
        onEnd={endTurn} onSave={saveNow} saveFailed={saveFailed}
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
            onSeat={(k) => setGame((g) => ({ ...g, seat: k }))} onResearch={research}
            onOpenTree={() => setGame((g) => ({ ...g, tree: true }))} onRepair={repair}
            onTake={takeCommand} onMerge={mergeInto} onReinforce={reinforce} onCommand={setCommander}
            onCraft={setCraft}
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
          onClose={() => setGame((g) => ({ ...g, recruit: null }))}
          onConfirm={(type, wg, ag) => recruitUnit(game.recruit, type, wg, ag)}
        />
      )}
      {game.battle && (
        <BattleScreen b={game.battle} nations={game.nations} P={P}
          onStep={stepBattle} onAuto={autoBattle} onClose={closeBattle} />
      )}
      {game.lords && (
        <WarlordScreen game={game} P={P} onClose={() => setGame((g) => ({ ...g, lords: false }))} />
      )}
      {game.tree && (
        <TechTree game={game} P={P} onResearch={research}
          onClose={() => setGame((g) => ({ ...g, tree: false }))} />
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

function TopBar({ nat, income, turn, owned, armies, onEnd, onCodex, sound, onSound, onLords, onSave, saveFailed }) {
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

/* Terrain symbols, drawn as stroked marks rather than fills so the whole map
   keeps one hand-drawn ink language. */
function glyphFor(t, cx, cy, c, r) {
  const j = (i, amp) => (noise(c * 3 + i, r * 5 + i, 7) - 0.5) * amp;
  let d = "";
  switch (t) {
    case "m":
      for (let i = 0; i < 2; i++) {
        const x = cx - 5 + i * 10 + j(i, 3), y = cy + 4 + j(i + 9, 2);
        d += `M${x - 6} ${y}l6 -9.5l6 9.5`;
      }
      return d;
    case "h":
      for (let i = 0; i < 2; i++) {
        const x = cx - 5 + i * 10 + j(i, 3), y = cy + 3 + j(i + 4, 2);
        d += `M${x - 5.5} ${y}q5.5 -6 11 0`;
      }
      return d;
    case "f":
      for (let i = 0; i < 3; i++) {
        const x = cx - 8 + i * 8 + j(i, 2.5), y = cy + 6 + j(i + 2, 3);
        d += `M${x} ${y}l0 -3.5M${x - 3.5} ${y - 3.5}l3.5 -6.5l3.5 6.5z`;
      }
      return d;
    case "r":
      for (let i = 0; i < 2; i++) {
        const x = cx - 6 + i * 11 + j(i, 2), y = cy + 5 + j(i + 3, 2);
        d += `M${x - 4} ${y}l0 -7l3 0l0 3l4 0l0 4`;
      }
      return d;
    case "g":
      for (let i = 0; i < 2; i++) {
        const x = cx - 5 + i * 10 + j(i, 3), y = cy + j(i + 1, 4);
        d += `M${x - 4} ${y}l8 0M${x} ${y - 4}l0 8M${x - 3} ${y - 3}l6 6M${x + 3} ${y - 3}l-6 6`;
      }
      return d;
    case "d":
      for (let i = 0; i < 3; i++) {
        const y = cy - 5 + i * 5 + j(i, 1.5);
        d += `M${cx - 9} ${y}q4.5 -2.5 9 0t9 0`;
      }
      return d;
    case "l":
      for (let i = 0; i < 2; i++) {
        const y = cy - 3 + i * 6 + j(i, 1.5);
        d += `M${cx - 8} ${y}q4 -2.5 8 0t8 0`;
      }
      return d;
    case "s":
      for (let i = 0; i < 3; i++) {
        const x = cx - 8 + i * 8 + j(i, 3), y = cy + 4 + j(i + 6, 3);
        d += `M${x} ${y}l0 -5M${x - 2.5} ${y}l-1 -3.5M${x + 2.5} ${y}l1 -3.5`;
      }
      return d;
    case "c":
      for (let i = 0; i < 3; i++) {
        const x = cx - 7 + i * 7 + j(i, 2), y = cy - 3 + i * 4 + j(i + 5, 2);
        d += `M${x - 4} ${y}l8 0M${x} ${y}l0 -4`;
      }
      return d;
    case "b":
      for (let i = 0; i < 5; i++) {
        const x = cx - 8 + (i % 3) * 8 + j(i, 3), y = cy - 4 + Math.floor(i / 3) * 8 + j(i + 7, 3);
        d += `M${x} ${y}l0.1 0`;
      }
      return d;
    case "t":
      for (let i = 0; i < 3; i++) {
        const x = cx - 7 + i * 7 + j(i, 3), y = cy + j(i + 2, 5);
        d += `M${x} ${y}l0.1 0M${x + 2} ${y + 3}l0.1 0`;
      }
      return d;
    case "p":
      if (noise(c, r, 11) < 0.45) return "";
      return `M${cx - 3 + j(0, 4)} ${cy + 3}l0 -4M${cx + 3 + j(1, 4)} ${cy + 4}l0 -3`;
    default:
      return "";
  }
}

function BuildingMark({ b, x, y, small, left, damaged }) {
  const done = !left;
  const R = small ? 7.2 : 9.4;
  const C = 2 * Math.PI * R;
  const total = BUILDINGS[b].turns || 1;
  const frac = done ? 1 : (total - left) / total;
  const ink = done ? "#f2c97a" : "#9fb6c2";
  const ring = done ? "#8a6f36" : "#3d4f5c";
  const k = small ? 0.82 : 1;
  const marks = {
    siltfarm: <path d="M-4 3h8M-4 0h8M-3 3v-5M0 3v-6M3 3v-5" />,
    yard: <path d="M-4 4v-8h6M-4 -4l6 5M2 -4v3" />,
    mill: <path d="M-3 4v-7h6v7M0 -3v-3M-4 4h8" />,
    refinery: <path d="M-3 4v-6a3 3 0 0 1 6 0v6M-3 0h6M-4 4h8" />,
    muster: <path d="M-3 5v-10l7 2.5l-7 2.5" />,
    redoubt: <path d="M-5 4v-5l2.5-2.5L0 -1l2.5-2.5L5 -1v5z" />,
  };
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={R} fill="#0a1015" stroke={ring} strokeWidth="1.5" />
      {/* a site shows how far along it is; a finished work shows a solid collar */}
      <circle r={R} fill="none" stroke={ink} strokeWidth={done ? 1.6 : 2.4}
        className="cc-buildprog" transform="rotate(-90)"
        strokeDasharray={`${(C * frac).toFixed(1)} ${C.toFixed(1)}`}
        opacity={done ? 0.75 : 0.95} strokeLinecap="round" />
      <g stroke={ink} strokeWidth={1.35} fill="none" strokeLinecap="round" strokeLinejoin="round"
        opacity={done ? 0.95 : 0.5} transform={`scale(${k})`}>
        {marks[b]}
      </g>
      {!done && (
        <g stroke="#f2c97a" strokeWidth="1.3" strokeLinecap="round">
          <path d={`M${R - 1} ${-R + 1}l4 -4M${R + 1} ${-R - 3}l2 2`} />
        </g>
      )}
      {damaged && (
        <g stroke="#e0644a" strokeWidth="1.6" strokeLinecap="round">
          <circle r={R + 2.5} fill="none" strokeWidth="1.2" opacity="0.9" />
          <path d={`M${-3.2} ${-3.2}l6.4 6.4M${3.2} ${-3.2}l-6.4 6.4`} />
        </g>
      )}
    </g>
  );
}


// What a warband looks like from a distance: whatever its heaviest element is.
function warbandKind(a) {
  const u = a.units;
  if (!u.length) return "spear";
  if (u.some((x) => x.type === "guncrew")) return "cannon";
  if (u.some((x) => x.type === "technicals")) return "vehicle";
  if (u.filter((x) => UNITS[x.type]?.cav).length * 2 >= u.length) return "horse";
  const rank = { spearmen: 0, pikemen: 0, ironclad: 1, axemen: 1, line: 1,
                 hunters: 2, bowmen: 2, musketeers: 3, riflemen: 3, vaultguard: 3 };
  const top = u.reduce((m, x) => Math.max(m, rank[x.type] ?? 0), 0);
  return ["spear", "blade", "bow", "gun"][top];
}

function WarbandGlyph({ kind, col }) {
  const body = <path d="M-2.6 4.6L-2.3 0.9Q-2.3 -0.6 -1 -0.8L1 -0.8Q2.3 -0.6 2.3 0.9L2.6 4.6Z" fill={col} />;
  const head = <path d="M-1.5 -2.1Q-1.7 -5.2 0 -5.2Q1.7 -5.2 1.5 -2.1Z" fill={col} />;
  switch (kind) {
    case "spear": return (<>
      <path d="M-3.4 5.4L2.6 -6.6" stroke={col} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M2.6 -6.6l-1.2 2.1 2.2 0.2z" fill={col} />
      {body}{head}</>);
    case "blade": return (<>
      <path d="M3.2 4.4L4.6 -3.4" stroke={col} strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M2.6 -1.4h3.6" stroke={col} strokeWidth="0.9" strokeLinecap="round" fill="none" />
      {body}{head}
      <path d="M-2.4 -0.6Q-4.6 0.4 -4.2 3" fill={col} /></>);
    case "bow": return (<>
      <path d="M-3.8 -5.2a7 7 0 0 1 0 10.4" stroke={col} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M-3.8 -5.2L-3.8 5.2" stroke={col} strokeWidth="0.6" fill="none" />
      <path d="M-3.4 0h6" stroke={col} strokeWidth="0.9" strokeLinecap="round" fill="none" />
      {body}{head}</>);
    case "gun": return (<>
      <path d="M-3.6 3.6L4.2 -5.4" stroke={col} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M2.6 -3.6l1.6 -1.8" stroke={col} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {body}{head}</>);
    case "horse": return (<>
      <path d="M-5 4.4L-4.4 0.4Q-3.4 -1.2 -1 -1.2L3 -1.2Q4.6 -1.2 5 0.4L5.4 4.4"
        fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 -1.2L5.2 -4.2L4 -5.4" fill="none" stroke={col} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M-1.6 -1.6L-1.2 -4.4" stroke={col} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="-1.2" cy="-5.6" r="1.5" fill={col} /></>);
    case "vehicle": return (<>
      <path d="M-5.2 2.2L-4.4 -1.4L0.6 -1.4L2.2 -3.6L4.4 -3.6L5.2 2.2Z" fill={col} />
      <circle cx="-2.8" cy="3.4" r="1.7" fill="none" stroke={col} strokeWidth="1.1" />
      <circle cx="3" cy="3.4" r="1.7" fill="none" stroke={col} strokeWidth="1.1" /></>);
    case "cannon": return (<>
      <path d="M-4.6 1.4L4.8 -1.8" stroke={col} strokeWidth="2.1" strokeLinecap="round" fill="none" />
      <path d="M-4.4 1.8L-1.6 4.4" stroke={col} strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <circle cx="-3.4" cy="4" r="2" fill="none" stroke={col} strokeWidth="1.2" /></>);
    default: return <>{body}{head}</>;
  }
}

function WarbandMark({ col, n, hostile, chosen, kind }) {
  const edge = chosen ? "#ffffff" : col;
  return (
    <g>
      <circle r="8.6" fill="#0b1219" stroke={edge}
        strokeWidth={chosen ? 1.9 : hostile ? 1.7 : 1.2} />
      <g transform="translate(0,0.4)"><WarbandGlyph kind={kind} col={col} /></g>
      <circle cx="7" cy="6.6" r="4.2" fill="#0b1219" stroke={edge} strokeWidth="1" />
      <text x="7" y="8.4" textAnchor="middle" className="cc-armycount" fill={edge}>{n}</text>
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
const StaticLand = React.memo(function StaticLand({ provinces, cells, glyphs }) {
  const { fills, dCoast } = useMemo(() => {
    const byFill = {};
    let dc = "";
    Object.values(provinces).forEach((p) => {
      const pts = cells[key(p.c, p.r)];
      if (!pts) return;
      const tone = Math.round(noise(p.c * 5.1, p.r * 7.3, 4) * 3) / 3;
      const fill = mix(TERRAIN[p.t].color, tone > 0.5 ? "#ffffff" : "#000000",
        0.02 + Math.abs(tone - 0.5) * 0.07);
      byFill[fill] = (byFill[fill] || "") + "M" + pts.map((q) => q[0] + " " + q[1]).join("L") + "Z";
      for (let i = 0; i < 6; i++) {
        const [nc, nr] = edgeN(p.c, p.r, i);
        if (provinces[key(nc, nr)]) continue;
        const A = pts[i], B = pts[(i + 1) % 6];
        dc += `M${A[0]} ${A[1]}L${B[0]} ${B[1]}`;
      }
    });
    return { fills: Object.entries(byFill), dCoast: dc };
  }, [provinces, cells]);

  return (
    <>
      <g style={{ filter: "drop-shadow(2px 3px 3px rgba(3,7,10,.85))" }}>
        {fills.map(([col, d]) => <path key={col} d={d} fill={col} />)}
      </g>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
        {Object.entries(glyphs).map(([t, d]) => (
          <path key={t} d={d} stroke={inkFor(TERRAIN[t].color)} strokeWidth="0.95" opacity="0.46" />
        ))}
      </g>
      <g fill="none" style={{ pointerEvents: "none" }}>
        <path d={dCoast} stroke="#08141b" strokeWidth="2" opacity="0.92" strokeLinejoin="round" />
        <path d={dCoast} stroke="#a8dcee" strokeWidth="0.65" opacity="0.42" strokeLinejoin="round" />
      </g>

    </>
  );
});

const RealmLayer = React.memo(function RealmLayer({ provinces, cells, seen }) {
  const { tints, dFog, dDim, dNat, dProv, dFeature, marks } = useMemo(() => {
    const byNat = {};
    let lit = "", dim = "", dn = "", dp = "", df = "";
    const marks = [];
    Object.values(provinces).forEach((p) => {
      const pts = cells[key(p.c, p.r)];
      if (!pts) return;
      const seg = "M" + pts.map((q) => q[0] + " " + q[1]).join("L") + "Z";
      // Ground outside your sight is drawn as fog and nothing else about it is
      // drawn at all — which also keeps the layer's work proportional to what
      // you can see rather than to the size of the map.
      const k0 = key(p.c, p.r);
      if (!seen.has(k0)) { lit += seg; return; }
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
      if (p.building || p.capital) marks.push(p);
    });
    return { tints: Object.entries(byNat), dFog: lit, dDim: dim,
             dNat: dn, dProv: dp, dFeature: df, marks };
  }, [provinces, cells, seen]);

  return (
    <g style={{ pointerEvents: "none" }}>
      <path d={dFog} fill="#070d12" opacity="0.93" />
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
            {p.building && <BuildingMark b={p.building} left={p.buildLeft} damaged={p.damaged}
              small={!!p.capital} x={p.capital ? cx + 10 : cx} y={p.capital ? cy - 9 : cy} />}
            {p.capital && (
              <g>
                <circle cx={cx} cy={cy} r="9.6" fill="#0a1015" stroke={col} strokeWidth="1.8" />
                {Array.from({ length: seatTier(p) }, (_, i) => (
                  <circle key={i} cx={cx - 6 + i * 4} cy={cy + 12.5} r="1.5" fill={col} />
                ))}
                <g transform={`translate(${cx - 6.4},${cy - 6.4}) scale(0.53)`} stroke={col}
                  strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
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
const BaseMap = React.memo(function BaseMap({ w, h, provinces, cells, glyphs }) {
  return (
    <svg className="cc-worldmap cc-basemap" width={w} height={h}
      viewBox={`0 0 ${MAPW} ${MAPH}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="basesea" cx="42%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#16323f" />
          <stop offset="55%" stopColor="#0e2430" />
          <stop offset="100%" stopColor="#081720" />
        </radialGradient>
        <pattern id="baseswell" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 13q6.5 -4 13 0t13 0" fill="none" stroke="#4e7d95" strokeWidth="0.7" opacity="0.16" />
        </pattern>
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
      <StaticLand provinces={provinces} cells={cells} glyphs={glyphs} />
    </svg>
  );
});

function WorldMap({ game, P, sight, onSelect, atWar, onDeselect, onFocused }) {
  const [zoom, setZoom] = useState(0.8);
  const scroll = useRef(null);
  const drag = useRef(null);
  const moved = useRef(false);
  const centred = useRef(false);
  const zoomRef = useRef(0.8);
  zoomRef.current = zoom;

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

  const glyphs = useMemo(() => {
    const byT = {};
    Object.values(game.provinces).forEach((p) => {
      const [cx, cy] = centreOf(p.c, p.r);
      const d = glyphFor(p.t, cx, cy, p.c, p.r);
      if (d) byT[p.t] = (byT[p.t] || "") + d;
    });
    return byT;
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
  selRef.current = onSelect;
  // With the per-province click targets gone there is nothing in the document
  // to address a hex by, so expose one hook for tests to drive selection.
  useEffect(() => {
    if (typeof window !== "undefined") window.__ccPick = (c, r) => selRef.current(c, r);
  }, []);

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
    const onWheel = (e) => {
      e.preventDefault();                 // also claims trackpad pinch (ctrlKey)
      const z0 = zoomRef.current;
      const rate = e.ctrlKey ? 1.04 : 1.12;   // pinch sends many small deltas
      const z = clamp(+(z0 * (e.deltaY < 0 ? rate : 1 / rate)).toFixed(3), 0.3, 2.4);
      if (z === z0) return;
      const box = el.getBoundingClientRect();
      const px = e.clientX - box.left, py = e.clientY - box.top;
      const wx = (el.scrollLeft + px) / z0, wy = (el.scrollTop + py) / z0;
      setZoom(z);
      requestAnimationFrame(() => { el.scrollLeft = wx * z - px; el.scrollTop = wy * z - py; });
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
      const slots = l.seat ? [22, -23, 32, -33, 42, -43] : [14, -15, 26, -27, 38, -39];
      for (const dy of slots) {
        const y = l.cy + dy;
        if (!onArmy(l.x, y, l.w) && !onLabel(l.x, y, l.w)) { out.push({ ...l, y }); return; }
      }
      // A capital is never dropped; it takes the first slot regardless.
      if (l.seat) out.push({ ...l, y: l.cy + 22 });
    });
    return out;
  }, [placeLabels, armySpots, labels]);
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
        <BaseMap w={MAPW * zoom} h={MAPH * zoom} provinces={staticProvinces}
          cells={cells} glyphs={glyphs} />
        <svg viewBox={`0 0 ${MAPW} ${MAPH}`} className="cc-worldmap cc-overmap"
          style={{ width: MAPW * zoom, height: MAPH * zoom }}
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
                    {chosen && <circle className="cc-halo" r="12.5" fill="none" stroke={col} strokeWidth="2.4" />}
                    {chosen && <circle className="cc-ants" r="12.8" fill="none" stroke="#ffffff"
                      strokeWidth="1.4" strokeDasharray="5 4" opacity="0.95" />}
                    <WarbandMark col={col} n={a.units.length} hostile={hostile} chosen={chosen} kind={warbandKind(a)} />
                    {a.lord && (
                      <path d="M-4.4 -12.6l1.8 3 2.6 -3.6 2.6 3.6 1.8 -3 0.7 4.4h-10.2z"
                        fill="#f0e2b8" stroke="#0a1015" strokeWidth="0.6" />
                    )}
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
function Sidebar({ game, P, nat, sight, selProv, selArmy, atWar, onBuild, onRecruitOpen, onWar, onDisband, onDeselect, onInvestigate, onClaim, onMarch, onSeat, onResearch, onOpenTree, onRepair, onTake, onMerge, onReinforce, onCommand, onCraft }) {
  const [tab, setTab] = useState("here");
  const tabs = [
    { id: "here", label: "Here" },
    { id: "realm", label: "Realm" },
    { id: "tech", label: "Advances" },
    { id: "make", label: "Works" },
    { id: "world", label: "Rivals" },
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
            onMarch={onMarch} atWar={atWar} onSeat={onSeat} onRepair={onRepair}
            onTake={onTake} onMerge={onMerge} onReinforce={onReinforce} onCommand={onCommand} />
        )}
        {tab === "realm" && <RealmPanel game={game} P={P} nat={nat} />}
        {tab === "tech" && <AdvancesPanel game={game} P={P} onResearch={onResearch} onOpenTree={onOpenTree} />}
        {tab === "make" && <ProductionPanel game={game} P={P} onCraft={onCraft} />}
        {tab === "world" && <WorldPanel game={game} P={P} atWar={atWar} onWar={onWar} />}
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


function buildingEffect(bid) {
  const b = BUILDINGS[bid];
  const out = [];
  Object.entries(b.yield || {}).forEach(([k, v]) => {
    const label = RES_META.find((r) => r.k === k)?.label.toLowerCase() || k;
    out.push(`+${v} ${label} every winter`);
  });
  if (b.def) out.push(`+${b.def}% to anyone defending here`);
  if (bid === "muster") out.push("lets you raise warbands here");
  return out;
}

function SelectionPanel({ game, P, sight, selProv, selArmy, onBuild, onRecruitOpen, onDisband, onDeselect, onInvestigate, onClaim, onMarch, atWar, onSeat, onRepair, onTake, onMerge, onReinforce, onCommand, onCraft }) {
  if (!selProv) return (
    <div className="cc-text-13d5px cc-text-93a9b5 leading-relaxed">
      <p className="mb-3">Pick a hex to see what it grows and what it hides.</p>
      <p className="mb-1.5">Click one of your warbands, then click a neighbouring hex to march there.</p>
      <p>Moving onto unclaimed or enemy ground takes it. Moving onto an enemy warband starts a battle.</p>
    </div>
  );

  const terr = TERRAIN[selProv.t];
  const y = provinceYield(selProv, selProv.owner || P, game.nations[selProv.owner || P]);
  const ownerNat = selProv.owner ? game.nations[selProv.owner] : null;
  const mine = selProv.owner === P;
  const canMuster = mine && (selProv.capital || (selProv.building === "muster" && !selProv.buildLeft));
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
                  Clicking this hex again does the same thing.
                </div>
              </>
            ) : (
              <div className="cc-text-13px cc-text-95aab6">{info.why}</div>
            )}
          </Section>
        );
      })()}

      <Section title="What it gives each winter">
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

      {selProv.building && (
        (() => {
          const bd = BUILDINGS[selProv.building];
          const left = selProv.buildLeft || 0;
          const frac = left ? (bd.turns - left) / bd.turns : 1;
          return (
            <Section title={left ? "Under construction" : selProv.damaged ? "Wrecked" : "Standing here"}>
              <div className="flex items-baseline gap-2">
                <span className="cc-text-13d5px flex-1">{bd.name}</span>
                {selProv.damaged && <span className="cc-text-12px cc-text-e0644a">damaged</span>}
                {left > 0 && (
                  <span className="num cc-text-12d5px cc-text-c9a37a">
                    {left} winter{left === 1 ? "" : "s"} left
                  </span>
                )}
              </div>
              {left > 0 && (
                <div className="mt-1.5 cc-h-5px cc-bg-26333c rounded overflow-hidden">
                  <div className="h-full cc-bar" style={{ width: `${frac * 100}%`, background: "#f2c97a" }} />
                </div>
              )}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {buildingEffect(selProv.building).map((e) => (
                  <span key={e} className={`cc-text-11d5px rounded px-1.5 py-0.5 border ${left ? "cc-border-31454f cc-text-95aab6" : "cc-border-3d5a4a cc-text-9fd6b4"}`}>{e}</span>
                ))}
              </div>
              <div className="cc-text-12d5px cc-text-93a9b5 mt-1">{bd.desc}</div>
              {left > 0 && (
                <div className="cc-text-12d5px cc-text-95aab6 mt-1">It pays nothing until the work is done.</div>
              )}
              {selProv.damaged && !left && (() => {
                const cost = Math.ceil(bd.scrap / 2);
                const afford = game.nations[P].res.scrap >= cost;
                return (
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
                );
              })()}
            </Section>
          );
        })()
      )}

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

      {mine && !selProv.building && Object.entries(BUILDINGS)
        .filter(([bid]) => unlocked(game.nations[P], bid))
        .filter(([, b]) => !b.coast || coastal(selProv.c, selProv.r))
        .filter(([, b]) => !b.on || b.on.includes(selProv.t)).length === 0 && (
        <Section title="Build">
          <div className="cc-text-13px cc-text-c6d6de leading-relaxed">
            Nobody here knows how to raise anything yet. Set the workshops on something
            in <span className="cc-text-8fe3d6">Advances</span> — systematic scavenging
            gives you salvage yards within a few winters.
          </div>
        </Section>
      )}

      {mine && !selProv.building && (
        <Section title="Build">
          <div className="grid gap-1.5">
            {Object.entries(BUILDINGS)
              .filter(([bid]) => unlocked(game.nations[P], bid))
              .filter(([, b]) => !b.coast || coastal(selProv.c, selProv.r))
              .filter(([, b]) => !b.on || b.on.includes(selProv.t))
              .map(([bid, b]) => {
                const afford = game.nations[P].res.scrap >= b.scrap;
                return (
                  <button key={bid} disabled={!afford}
                    onClick={() => onBuild(key(selProv.c, selProv.r), bid)}
                    className={`text-left px-2.5 py-2 rounded border cc-text-13px transition-colors ${afford
                      ? "cc-border-31454f cc-hover-border-3d6470 cc-hover-bg-152029"
                      : "cc-border-25313a opacity-40 cursor-not-allowed"}`}>
                    <div className="flex justify-between items-baseline">
                      <span>{b.name}</span>
                      <span className="num cc-text-12d5px cc-text-c9a37a">{b.scrap} scrap · {b.turns}w</span>
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
          onTake={onTake} onMerge={onMerge} onReinforce={onReinforce} onCommand={onCommand} />
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

function ArmyCard({ army, game, P, onDisband, held, heldArmy, onTake, onMerge, onReinforce, onCommand }) {
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

  return (
    <Section title={own ? (held ? "In hand" : "Also standing here") : "Warband sighted"}>
      <div className="disp cc-text-15px flex items-center gap-2" style={{ color: nat.color }}>
        <Swords size={14} /> {army.name}
        {held && <span className="cc-text-11d5px cc-text-8fe3d6">· selected</span>}
        {army.lord && <Crown size={13} className="cc-text-f0e2b8" />}
      </div>
      <div className="cc-text-12d5px cc-text-93a9b5 mb-2">
        <span className="num">{totalStr}</span> strong
        {own && <> · <span className="num">{army.mp}</span>/{army.maxMp} movement left · eats <span className="num">{upkeep.food}</span> rations{upkeep.fuel > 0 && <>, <span className="num">{upkeep.fuel}</span> fuel</>}</>}
      </div>
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
                if (!rc) return (
                  <button onClick={() => onDisband(army.id, u.id)}
                    className="mt-1.5 cc-text-11d5px cc-text-93a9b5 cc-hover-text-e0644a transition-colors">
                    Stand down
                  </button>
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
                    <button onClick={() => onDisband(army.id, u.id)}
                      className="mt-1 cc-text-11d5px cc-text-93a9b5 cc-hover-text-e0644a transition-colors">
                      Stand down
                    </button>
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
              {transit ? "You are on the road — you reach them next winter"
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
                <button type="button" disabled={together > 8}
                  onClick={() => onMerge(heldArmy.id, army.id)}
                  className={`w-full py-2 rounded disp cc-text-13d5px border transition-colors ${together > 8
                    ? "cc-border-25313a cc-text-78909e"
                    : "cc-bg-2a3a4a cc-hover-bg-35495c cc-border-4d7488 cc-text-dfeaf0"}`}>
                  {together > 8 ? "Too many companies to merge" : `Merge ${heldArmy.name} into this warband`}
                </button>
                <div className="cc-text-12px cc-text-95aab6">
                  {together > 8
                    ? `That would be ${together} companies; eight is the limit.`
                    : `They would march on as one warband of ${together} companies.`}
                </div>
              </>
            )}
            <button type="button" onClick={() => onTake(army.id)}
              className="w-full py-2 rounded border cc-border-31454f cc-hover-border-3d6470 cc-text-c6d6de cc-text-13px transition-colors">
              Take command of this warband
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
  const g = {
    foraging: <><path d="M10 17V8" /><path d="M10 8c0-3 2-4 4-4 0 3-2 4-4 4z" /><path d="M10 11c0-3-2-4-4-4 0 3 2 4 4 4z" /></>,
    bowyery: <><path d="M5 3a12 12 0 0 1 0 14" /><path d="M5 3l10 7L5 17" /><path d="M15 10h2" /></>,
    horsemanship: <><path d="M5 17c0-5 3-8 7-8V6l4 3-4 3" /><path d="M12 9c-4 0-5 3-5 8" /></>,
    scavenging: <><path d="M4 16h12" /><path d="M6 16V8l5-4" /><path d="M11 4l4 3" /><path d="M8 11h5" /></>,
    smelting: <><path d="M6 17h8l-1-6H7z" /><path d="M8 11V6h4v5" /><path d="M10 6V3" /></>,
    toolcraft: <><path d="M4 16l7-7" /><path d="M11 5l4 4-2 2-4-4z" /><path d="M4 16l1 1" /></>,
    drill: <><path d="M6 17V4l8 3-8 3" /><path d="M13 17h3M4 17h3" /></>,
    dyking: <><path d="M3 12q4-3 7 0t7 0" /><path d="M3 16q4-3 7 0t7 0" /><path d="M6 8V4h8v4" /></>,
    saltpetre: <><path d="M10 3l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" /></>,
    blackpowder: <><circle cx="9" cy="13" r="4" /><path d="M12 10l3-3M15 7l1 1M15 7l-1-1" /></>,
    casting: <><path d="M3 13h9v3H3z" /><path d="M12 12l5 2-5 2z" /><circle cx="5" cy="17" r="1.5" /></>,
    refining: <><path d="M7 17V9a3 3 0 0 1 6 0v8z" /><path d="M7 12h6" /><path d="M5 17h10" /><path d="M10 6V3" /></>,
    enginework: <><circle cx="10" cy="10" r="3.5" /><path d="M10 3v2M10 15v2M3 10h2M15 10h2M5 5l1.5 1.5M13.5 13.5L15 15M15 5l-1.5 1.5M6.5 13.5L5 15" /></>,
    vaultcraft: <><circle cx="10" cy="10" r="6" /><circle cx="10" cy="10" r="2" /><path d="M10 4v3M10 13v3M4 10h3M13 10h3" /></>,
  };
  return <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{g[id] || <circle cx="10" cy="10" r="5" />}</g>;
}

const NODE_W = 168, NODE_H = 60, COL = 214, ROW = 78;

function treeLayout() {
  const depth = {};
  const d = (id) => {
    if (depth[id] != null) return depth[id];
    const t = TECHS[id];
    depth[id] = t.needs.length ? 1 + Math.max(...t.needs.map(d)) : 0;
    return depth[id];
  };
  TECH_IDS.forEach(d);
  const cols = {};
  TECH_IDS.forEach((id) => { (cols[depth[id]] = cols[depth[id]] || []).push(id); });
  const maxRows = Math.max(...Object.values(cols).map((c) => c.length));
  const pos = {};
  Object.entries(cols).forEach(([dep, ids]) => {
    const off = ((maxRows - ids.length) * ROW) / 2;
    ids.forEach((id, i) => {
      pos[id] = { x: 24 + Number(dep) * COL, y: 24 + off + i * ROW, depth: Number(dep) };
    });
  });
  return { pos, w: 24 + (Math.max(...Object.keys(cols).map(Number)) + 1) * COL, h: 48 + maxRows * ROW };
}
const TREE = treeLayout();

function TechTree({ game, P, onResearch, onClose }) {
  const nat = game.nations[P];
  const states = {};
  TECH_IDS.forEach((id) => { states[id] = techState(game, P, id); });
  const [sel, setSel] = useState(() =>
    nat.research?.id || TECH_IDS.find((id) => states[id].s === "open") || TECH_IDS[0]);
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
          <div className="disp cc-text-21px flex-1">The workshops</div>
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
            <g fill="none" strokeLinecap="round">
              {TECH_IDS.flatMap((id) => TECHS[id].needs.map((n) => {
                const a = TREE.pos[n], b = TREE.pos[id];
                const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2;
                const done = states[id].s === "known" || nat.known?.[n];
                return (
                  <path key={n + id} d={`M${x1} ${y1} C${x1 + 34} ${y1}, ${x2 - 34} ${y2}, ${x2} ${y2}`}
                    stroke={done ? "#4d7a5c" : "#2b3d47"} strokeWidth={done ? 2 : 1.4}
                    opacity={done ? 0.85 : 0.6} />
                );
              }))}
            </g>

            {TECH_IDS.map((id) => {
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
                  <g transform="translate(11,13)" style={{ color: c.text }}><TechIcon id={id} /></g>
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
            <span className="num cc-text-12d5px cc-text-c9a37a">{t.scrap} scrap · {researchTurns(P, t, nat)} winters</span>
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
              Set the workshops on it
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
        <Hammer size={16} /> Open the workshops
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
            The workshops are idle. {open.length
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
  const { total, per } = craftSplit(nat, game.provinces, P);
  const huts = Object.values(game.provinces).filter(
    (p) => p.owner === P && p.building === "workshop" && !p.buildLeft).length;
  const seats = Object.values(game.provinces).filter((p) => p.owner === P && p.capital).length;

  return (
    <div>
      <div className="rounded border cc-border-31454f cc-bg-131f27 px-3 py-2.5 mb-3">
        <div className="flex items-baseline gap-2">
          <span className="disp cc-text-17px flex-1">The workshops</span>
          <span className="num cc-text-14d5px cc-text-8fe3d6">{total} a season</span>
        </div>
        <div className="cc-text-12d5px cc-text-93a9b5 mt-1 leading-snug">
          {seats ? `Your seat turns out ${CRAFT_BASE}` : "You hold no seat"}
          {huts ? `, and ${huts} craftsmen's hut${huts === 1 ? "" : "s"} another ${huts * CRAFT_PER_HUT}` : ""}.
          Arms pile up on the rack until there are enough to put a company in the field.
        </div>
      </div>

      <p className="cc-text-12d5px cc-text-93a9b5 mb-2 leading-relaxed">
        Give each kind a share of the work. A company cannot be raised until its own arms
        are made — no amount of scrap will conjure a bow.
      </p>

      <div className="grid gap-1.5">
        {open.map((id) => {
          const u = UNITS[id];
          const share = (nat.crafts || {})[id] || 0;
          const rack = (nat.arms || {})[id] || 0;
          const rate = per[id] || 0;
          const short = Math.max(0, u.size - rack);
          const eta = rate > 0 ? Math.ceil(short / rate) : null;
          return (
            <div key={id} className={`rounded border px-3 py-2.5 ${share
              ? "cc-border-31454f cc-bg-131f27" : "cc-border-25313a"}`}>
              <div className="flex items-baseline gap-2">
                <span className={`cc-text-13d5px flex-1 ${share ? "" : "cc-text-95aab6"}`}>{u.name}</span>
                <span className="num cc-text-12px cc-text-a0b6c1">{rack}/{u.size}</span>
              </div>
              <div className="mt-1.5 cc-h-5px cc-bg-26333c rounded overflow-hidden">
                <div className="h-full cc-bar" style={{ width: `${Math.min(100, (rack / u.size) * 100)}%`,
                  background: rack >= u.size ? "#9fd6b4" : "#8fe3d6" }} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button type="button" onClick={() => onCraft(id, -1)} disabled={share === 0}
                  className={`cc-craftbtn ${share === 0 ? "cc-text-78909e" : ""}`}>−</button>
                <span className="num cc-text-13px cc-w-28px text-center">{share}</span>
                <button type="button" onClick={() => onCraft(id, 1)} className="cc-craftbtn">+</button>
                <span className="cc-text-12px cc-text-93a9b5 flex-1 min-w-0">
                  {rack >= u.size * 3 ? "the rack is full — raise them or move the works on"
                    : rack >= u.size ? "ready to raise"
                    : rate > 0 ? `${rate} a season · ready in ${eta} season${eta === 1 ? "" : "s"}`
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
function RecruitPanel({ natId, nat, provName, onClose, onConfirm }) {
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
                        <div className="flex items-baseline gap-2">
                          <span className="cc-text-13d5px flex-1">{u.name}</span>
                          <span className="num cc-text-11d5px cc-text-c9a37a">{u.size}</span>
                        </div>
                        <div className="cc-text-11d5px cc-text-93a9b5">{u.role}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {locked.length > 0 && (
              <div className="cc-text-12px cc-text-78909e leading-snug">
                {locked.map((t) => t.name).join(", ")} companies are beyond your people for now.
                What you learn in the workshops opens them.
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="rounded border cc-border-31454f cc-bg-131f27 p-4">
              <div className="flex gap-4 flex-wrap">
                {UNIT_ART[type] && <UnitArt type={type} size={170} plinth />}
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
            </div>

            <button type="button" disabled={!afford || !armed} onClick={() => onConfirm(type, wg, ag)}
              className={`w-full mt-3 py-2.5 rounded disp cc-text-15px border transition-colors ${afford && armed
                ? "cc-bg-2b3f2c cc-hover-bg-37502f cc-border-4a6b45 cc-text-d7ecc9"
                : "cc-border-25313a cc-text-78909e"}`}>
              {!armed ? `Only ${rack} of ${d.size} armed — set the works to it`
                : afford ? `Raise the ${d.name.toLowerCase()}` : "Not enough to raise them"}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function BattleScreen({ b, nations, P, onStep, onAuto, onClose }) {
  const pSide = b.aNat === P ? "a" : b.dNat === P ? "d" : null;
  const [stance, setStance] = useState(pSide === "a" ? "press" : "hold");
  const aN = nations[b.aNat], dN = nations[b.dNat];
  const aStr = b.a.units.reduce((n, u) => n + u.str, 0);
  const dStr = b.d.units.reduce((n, u) => n + u.str, 0);
  const tot = Math.max(1, aStr + dStr);
  const ex = b.lastExchange;

  const myPowder = pSide === "a" ? b.aPowder : b.dPowder;
  const myUnits = pSide ? b[pSide].units : [];
  const needBase = myUnits.reduce((n, u) => n + unitStats(u).powder, 0);
  const need = needBase * (STANCES[stance].powder || 1);
  const dry = needBase > 0 && need > myPowder;
  const mySide = pSide === "a" ? "attacking" : "defending";

  const Side = ({ side, nat, label }) => {
    const units = b[side].units;
    const str = side === "a" ? aStr : dStr;
    const yours = pSide === side;
    return (
      <div className="w-full cc-lg-w-270px shrink-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Sigil id={nat.id} size={19} color={nat.color} />
          <span className="disp cc-text-16px flex-1 min-w-0" style={{ color: nat.color }}>{nat.short}</span>
          <span className={`cc-text-11d5px rounded px-1.5 py-0.5 border ${yours ? "cc-border-4d9aa6 cc-text-d3e5ec" : "cc-border-31454f cc-text-95aab6"}`}>
            {yours ? `you, ${label}` : label}
          </span>
        </div>
        <div className="num cc-text-12d5px cc-text-c6d6de mb-2">
          {str} men · {side === "a" ? b.aPowder : b.dPowder} powder
        </div>
        <div className="grid gap-1.5">
          {units.map((u) => <CompanyRow key={u.id} u={u} col={nat.color} showLoss={!!ex} />)}
          {!units.length && <div className="cc-text-13px cc-text-95aab6 py-2">The line is gone.</div>}
        </div>
        {b[side].routed.length > 0 && (
          <div className="cc-text-12px cc-text-d9a63f mt-2">
            {b[side].routed.length} compan{b[side].routed.length === 1 ? "y has" : "ies have"} run
          </div>
        )}
      </div>
    );
  };

  return (
    <Overlay>
      <div className="cc-w-1020px cc-max-w-96vw cc-max-h-93vh rounded-lg border cc-border-3a2a26 cc-bg-0d1116 flex flex-col overflow-hidden"
        style={{ boxShadow: "0 0 80px rgba(224,100,74,.14)" }}>

        {/* who, where, how long */}
        <div className="px-5 py-3 border-b cc-border-2a1f1c"
          style={{ background: "linear-gradient(90deg,#1a1210,#0d1116)" }}>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5">
            <Target size={18} className="cc-text-e0644a shrink-0" />
            <div className="disp cc-text-21px">The field at {b.provName}</div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="cc-text-12px cc-text-c6d6de">round</span>
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className="cc-w-7px cc-h-7px rounded-sm"
                  style={{ background: i < Math.min(b.round, 10) - (b.over ? 0 : 1) ? "#e0644a" : "#2c3d47" }} />
              ))}
            </div>
          </div>
          <div className="cc-text-12d5px cc-text-c6d6de mt-1.5">
            Ground gives the defender <span className="num cc-text-8fe3d6">{b.terrainDef > 0 ? "+" : ""}{b.terrainDef}%</span>
            {b.defenderBonus ? <> plus <span className="num cc-text-8fe3d6">+{b.defenderBonus}%</span> from their own doctrine</> : null}
            . Attackers usually need about a third more men to carry a defended position.
          </div>
        </div>

        {/* who is winning, in one bar */}
        <div className="px-5 pt-3 shrink-0">
          <div className="flex cc-h-9px rounded overflow-hidden border cc-border-31454f">
            <div className="h-full cc-bar" style={{ width: `${(aStr / tot) * 100}%`, background: aN.color }} />
            <div className="h-full cc-bar" style={{ width: `${(dStr / tot) * 100}%`, background: dN.color }} />
          </div>
          <div className="flex justify-between cc-text-11d5px cc-text-95aab6 mt-1">
            <span className="num">{aStr} attacking</span>
            <span className="num">{dStr} defending</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto thin p-5 pt-3 flex flex-col cc-lg-flex-row gap-5">
          <Side side="a" nat={aN} label="attacking" />

          <div className="flex-1 min-w-0">
            {/* what just happened */}
            {ex ? (
              <div className="rounded border cc-border-31454f cc-bg-131f27 p-3 mb-3">
                <div className="cc-text-12px cc-text-a7bac6 mb-2">Round {ex.round}</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="num cc-text-24px" style={{ color: aN.color }}>−{ex.aCas}</div>
                    <div className="cc-text-11d5px cc-text-95aab6">{aN.short} fell</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="num cc-text-24px" style={{ color: dN.color }}>−{ex.dCas}</div>
                    <div className="cc-text-11d5px cc-text-95aab6">{dN.short} fell</div>
                  </div>
                </div>
                <div className="cc-text-12d5px cc-text-c6d6de mt-2.5 pt-2.5 border-t cc-border-243138">
                  {aN.short} {STANCES[ex.aStance].name.toLowerCase()}; {dN.short} {STANCES[ex.dStance].name.toLowerCase()}.
                  {ex.aRouted + ex.dRouted > 0 && " Companies broke."}
                  {(ex.aDry || ex.dDry) && " Guns are firing on scavenged charges."}
                </div>
              </div>
            ) : (
              <div className="rounded border cc-border-31454f cc-bg-131f27 p-3 mb-3 cc-text-13px cc-text-c6d6de">
                Lines are formed. Give an order to begin. Each round both sides act at once,
                and companies that lose their nerve run before they are killed — you get about
                half of those back afterwards.
              </div>
            )}

            {/* orders, with what they actually do */}
            {!b.over && pSide && (
              <>
                <div className="cc-text-12px cc-text-a7bac6 mb-1.5">Your order, {mySide}</div>
                <div className="grid gap-1.5">
                  {Object.entries(STANCES).map(([id, s]) => {
                    const on = stance === id;
                    return (
                      <button key={id} type="button" onClick={() => setStance(id)}
                        className={`text-left px-3 py-2 rounded border transition-colors ${on ? "cc-border-4d9aa6 cc-bg-152a30" : "cc-border-31454f cc-hover-border-3d6470"}`}>
                        <div className="flex items-baseline gap-2">
                          <span className="cc-text-13d5px flex-1">{s.name}</span>
                          {on && <span className="cc-text-11d5px cc-text-8fe3d6">chosen</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {stanceChips(id).map((c) => (
                            <span key={c.t}
                              className={`cc-text-11d5px rounded px-1.5 py-0.5 border ${c.good ? "cc-border-3d5a4a cc-text-9fd6b4" : "cc-border-5a3230 cc-text-e09a8a"}`}>
                              {c.t}
                            </span>
                          ))}
                        </div>
                        <div className="cc-text-11d5px cc-text-95aab6 mt-1.5">{s.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {dry && (
                  <div className="cc-text-12d5px cc-text-e09a8a mt-2">
                    Not enough powder for this order — you hold {myPowder} and need {need}. Your guns
                    will fire at a quarter strength.
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => onStep(stance)}
                    className="flex-1 py-2.5 rounded cc-bg-5a2f26 cc-hover-bg-6e3a2e border cc-border-8a4a38 cc-text-f3d9cf disp cc-text-15px transition-colors">
                    Give the order
                  </button>
                  <button type="button" onClick={() => onAuto(stance)}
                    className="py-2.5 px-3 rounded border cc-border-31454f cc-text-c6d6de cc-hover-border-3d6470 cc-text-13px transition-colors">
                    Fight it out
                  </button>
                </div>
              </>
            )}

            {b.over && (
              <div className="rounded border cc-border-8a4a38 p-3 mb-3">
                <div className="disp cc-text-19px cc-text-f0e2b8">
                  {b.stalemate ? "The attack is called off at nightfall"
                    : b.retreat ? `${(b.retreat === "a" ? aN : dN).short} disengages`
                    : `${(b.winner === "a" ? aN : dN).short} holds the field`}
                </div>
                <div className="cc-text-13px cc-text-c6d6de mt-1">
                  {b.winner === pSide ? "The ground is yours." : "You will have to come back with more."}
                </div>
                <button type="button" onClick={onClose}
                  className="w-full mt-3 py-2.5 rounded cc-bg-1f4a52 cc-hover-bg-2a5f69 border cc-border-356b76 cc-text-d9f0f2 disp cc-text-15px transition-colors">
                  Count the cost
                </button>
              </div>
            )}

            {/* the running account, kept secondary */}
            <details className="mt-3">
              <summary className="cc-text-12px cc-text-95aab6 cursor-pointer">Runners from the line</summary>
              <div className="grid gap-1 mt-2 cc-max-h-190px overflow-y-auto thin pr-1">
                {[...b.log].reverse().map((l, i) => (
                  <div key={i} className={`cc-text-12d5px leading-snug ${l.t === "end" ? "cc-text-f0e2b8"
                    : l.t === "dead" ? "cc-text-e0644a" : l.t === "rout" ? "cc-text-d9a63f"
                    : l.t === "warn" ? "cc-text-c9a37a" : "cc-text-c6d6de"}`}>
                    {l.m}
                  </div>
                ))}
              </div>
            </details>
          </div>

          <Side side="d" nat={dN} label="defending" />
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
            <div className="cc-text-12d5px cc-text-a7bac6 mb-2 pb-1 border-b cc-border-243138">The realm this winter</div>
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
                {kind.garrison.length} companies, dug in. They hold the ruin until somebody takes it off them.
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
            <div className="disp cc-text-16px cc-text-e5eef3 mb-1">Battles</div>
            <p>Ten rounds at most. Each round you give one order and so does your opponent, and both resolve at once. Every order card lists exactly what it changes — damage dealt, damage taken, nerve, powder — so you can read the trade before committing. Press on open ground, volley to shell an enemy out of good ground, hold to keep your companies together. Companies that lose their nerve run before they are killed, and you get about half of them back.</p>
          </div>
          <div>
            <div className="disp cc-text-16px cc-text-e5eef3 mb-1">Winning</div>
            <p>Take four rival seats of power, or hold a tenth of the continent, or simply hold more than anyone after a hundred and fifty winters. A seat stays a seat after it falls, so a captured capital keeps flying its crest under your colours. Lose every holding and it is over.</p>
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
