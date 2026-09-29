/* -------------------------------- PETITIONS --------------------------------
   Once or twice a year somebody comes to the hall. They wait there — nothing
   stops your turn — for a few seasons, and if you never see them the thing
   resolves the way things do when nobody decides.

   Each petition is a condition on the position, some words, and three ways
   to answer. Effects are data the game applies: `res` moves the stockpile,
   `pop` moves people at a place, `loyalty` moves every captain, `captain`
   moves the one who asked, `peace` keeps a rival off you for a while,
   `grudge` does the opposite, `ransom` brings a captive home, `boost`
   shortens the advance being learned, `promise` is kept if you keep it. */
export const PETITION_WAIT = 3;   // seasons before it resolves itself
export const PETITION_CHANCE = 0.4;

/* How long the coast remembers a broken word, and what it costs while it
   does: rivals are keener to come at you, and nobody offers you the chance
   to promise anything again. */
export const OATH_MEMORY = 20;

export const PETITIONS = [
  {
    id: "village_herd", who: "A headman from {place}",
    need: (c) => c.herdNear,
    text: "\"There is something in the wood beside us. It took a goat in autumn and a child last month, and the fence is not going to be enough. You have hunters. We have nothing.\"",
    /* A promise is the only answer here that costs nothing now. That is the
       point of it, and the reason breaking one is expensive. */
    promise: {
      kind: "herd", turns: 6,
      what: "Clear the wood beside {place}",
      how: "March a warband into the wood and beat what is in it. Hunters do best — it is animals.",
      keep: { pop: 45, res: { food: 30 }, loyalty: 4,
        text: "The wood by {place} is clear, as you said it would be. They come back to the outlying houses, and send thirty sacks to the seat for your trouble." },
      broke: { pop: -70, loyalty: -8, revolt: 0.4,
        text: "You gave {place} your word about the wood and six seasons went by. What was in it is still in it, and most of them have gone." },
    },
    options: [
      { label: "\"I will see to it.\"", hint: "Costs nothing now. Six seasons to clear the wood, and a great deal if you do not.",
        effect: { promise: true },
        result: "They go home with your word. Six seasons, before it stops meaning anything." },
      { label: "Send them rations to sit behind the fence.", hint: "25 rations. They stay, for now.",
        effect: { res: { food: -25 }, pop: 10 },
        result: "Twenty-five sacks go out on a cart. The fence holds for now." },
      { label: "\"Then move.\"", hint: "Some of them do. Some of them join the muster instead.",
        effect: { pop: -30, res: { men: 15 } },
        result: "About half of them walk to the seat. The rest stay and take their chances." },
    ],
    ignore: { pop: -25, result: "Nobody answered the headman. The wood took what it took, and the village is smaller for it." },
  },
  {
    id: "captain_wall", who: "Captain {captain}",
    need: (c) => c.hungryCaptain && !c.besieging,
    text: "\"There is a walled place within a fortnight's march and we are sitting here counting rations. Give me the word and I will sit in front of it until it gives, or go up it.\"",
    options: [
      { label: "\"It is the next thing we do.\"", hint: "They believe you. Do it.",
        effect: { captain: 8 }, result: "They go back to the companies grinning. You had better mean it." },
      { label: "\"Not yet.\"", hint: "Honest, and not what they wanted to hear.",
        effect: { captain: -4 }, result: "They take it. Not well." },
      { label: "\"Take the column and clear the nearest wood instead.\"", hint: "Something to do.",
        effect: { captain: 2 }, result: "It is not a wall. It is something." },
    ],
    ignore: { captain: -6, result: "They waited three seasons for an answer and stopped asking." },
  },
  {
    id: "envoy_passage", who: "An envoy of {rival}",
    need: (c) => c.rival,
    text: "\"{rivalName} asks passage across your ground for the season, for a column and its carts. In return, a gift, and the understanding that neither of us looks the other's way for a while.\"",
    options: [
      { label: "Grant it.", hint: "Twenty scrap, and two years in which they will not come at you.",
        effect: { res: { scrap: 20 }, peace: 8 }, result: "The column crosses in a week and leaves nothing behind but ruts. The envoy leaves twenty scrap." },
      { label: "Passage, for a price.", hint: "Sixty scrap. A year of quiet, and they will remember the price.",
        effect: { res: { scrap: 60 }, peace: 4, grudge: true }, result: "They pay. The envoy's smile does not reach anywhere near the eyes." },
      { label: "Refuse.", hint: "They go round. They remember.",
        effect: { grudge: true }, result: "The envoy bows and goes. The column goes the long way." },
    ],
    ignore: { grudge: true, result: "The envoy waited three seasons in your hall and went home with a story about it." },
  },
  {
    id: "ransom", who: "A rider from {rival}",
    need: (c) => c.captive,
    text: "\"We hold Captain {captain}. They are well, or well enough. {ransom} scrap and they walk home; nothing, and they do not.\"",
    options: [
      { label: "Pay it.", hint: "{ransom} scrap. They come home grateful.",
        effect: { ransom: "full" }, result: "The scrap goes out and, a fortnight later, a thin captain walks in." },
      { label: "Offer half.", hint: "They may take it. They may not.",
        effect: { ransom: "half" }, result: "" },
      { label: "Refuse.", hint: "You do not pay for people. Nobody will forget that you said so.",
        effect: { ransom: "none", loyalty: -6 }, result: "The rider leaves. So, in the end, does the captain, one way or another. Your captains heard all of it." },
    ],
    ignore: { ransom: "none", loyalty: -8, result: "The rider waited three seasons and left without an answer. Your captains noticed." },
  },
  /* --------------------------- THE RIVAL COURTS ---------------------------
     Three of these come from the realms rather than from your own people. A
     rival that only ever appears as a warband on a hill is a hazard; one that
     sends somebody to your hall to ask for something is an opponent. Each of
     these can be signed on the spot, which is why the envoy screen is not the
     only way an accord gets made. */
  {
    id: "rival_tribute", who: "A herald of {rival}",
    need: (c) => c.bigRival,
    text: "\"{rivalName} has counted your holdings and ours. The reckoning was not close. Scrap and grain to our court every season, and our hosts will find somewhere else to be this year. Or not, and they will not.\"",
    options: [
      { label: "Agree to it.", hint: "Tribute out of your stores every season for twelve. They leave you alone, and think better of you for knowing the arithmetic.",
        effect: { accord: "tributeTo", regardWith: 14 },
        result: "The carts are loaded before the herald is out of the gate. It is cheaper than the alternative and everybody in the hall knows it." },
      { label: "Send back half of what they asked and a civil letter.",
        hint: "30 scrap now. It buys a season of quiet and nothing signed.",
        effect: { res: { scrap: -30 }, peace: 6, regardWith: 4 },
        result: "The herald takes the cart and the letter. Neither was what they came for, and both were something." },
      { label: "\"Tell them to come and take it.\"",
        hint: "Nothing paid. They will, eventually, and they will bring friends.",
        effect: { grudge: true, regardWith: -16 },
        result: "The herald repeats it back to you word for word to be sure, writes it down, and rides." },
    ],
    ignore: { grudge: true, regardWith: -10, result: "The herald waited three seasons for an answer and took the silence back as one." },
  },
  {
    id: "rival_league", who: "An envoy of {rival}",
    need: (c) => c.leaguer,
    text: "\"{rivalName} is not asking for your scrap. {leader} holds more of this coast than the rest of us together will if it goes on, and we would rather it did not go on. Come in with us and neither of us has to be next.\"",
    options: [
      { label: "Come in with them.", hint: "A league for fourteen seasons. Their war becomes yours, and so does the peace between you.",
        effect: { accord: "league", regardWith: 10 },
        result: "It is signed in your hall with two seals and no ceremony. Somewhere to the south, somebody very large has just acquired a second problem." },
      { label: "Take their gift and promise nothing.", hint: "40 scrap in hand. They will not ask twice.",
        effect: { res: { scrap: 40 }, regardWith: -12 },
        result: "The envoy leaves the chest and the offer on the table, and only the chest stays." },
      { label: "Refuse, and say why.", hint: "Nothing gained. Honest, at least, and the honesty is worth a little.",
        effect: { regardWith: -4 },
        result: "The envoy hears you out, says that you may feel differently in five years, and is almost certainly right." },
    ],
    ignore: { regardWith: -8, result: "The envoy waited in your hall for three seasons while the thing they came about got worse." },
  },
  {
    id: "rival_border", who: "A rider from {rival}",
    need: (c) => c.rival && c.onTheirBorder,
    text: "\"There are companies of yours standing where our people can see them, and nobody has said why. {rivalName} would like to know whether we are digging or not.\"",
    options: [
      { label: "Give them your word it is nothing.", hint: "Costs nothing. They believe you a little.",
        effect: { regardWith: 6 }, result: "The rider goes back with an answer, which is all anybody wanted." },
      { label: "Say nothing and let them wonder.", hint: "A cheap threat, and it reads as one.",
        effect: { grudge: true, regardWith: -8 }, result: "The rider leaves without an answer. Within the month there is a ditch on their side of the line." },
      { label: "Offer the road both ways instead.", hint: "45 scrap. Columns cross freely for sixteen seasons, both of you.",
        effect: { res: { scrap: -45 }, accord: "road", regardWith: 8 },
        result: "The rider came for an explanation and goes home with a treaty, which is the best afternoon anybody in that court has had this year." },
    ],
    ignore: { regardWith: -6, result: "Nobody answered the rider. There is a ditch on their side of the line now, and it is getting deeper." },
  },
  {
    id: "stores_dust", who: "The quartermaster of {seat}",
    need: (c) => c.food < 45,
    text: "\"The stores are down to dust and sweepings. I can feed the seat or the warbands through the winter. Not both, and not for long.\"",
    options: [
      { label: "Slaughter the herds.", hint: "+60 rations now; fewer mouths next year.",
        effect: { res: { food: 60 }, pop: -15 }, result: "A week of smoke and salt. The pens are empty and the stores are not." },
      { label: "Send the warbands to forage.", hint: "+40 rations. The captains do not love it.",
        effect: { res: { food: 40 }, loyalty: -3 }, result: "The columns come back with carts of whatever they could find and a look about them." },
      { label: "Tighten every belt.", hint: "Nobody eats well. Nobody starves either.",
        effect: { loyalty: -2, pop: -10 }, result: "Everyone is hungrier and nobody is dead. It is what there was." },
    ],
    ignore: { result: "The quartermaster did what quartermasters do, and did not ask again." },
  },
  {
    id: "captain_heard", who: "Captain {captain}",
    need: (c) => c.sourCaptain,
    text: "\"I have led your people into two winters and I have not heard my name in your hall once. I am not asking for scrap. I am asking whether you know it.\"",
    options: [
      { label: "Name them before the muster.", hint: "15 scrap on a feast. They stay yours.",
        effect: { res: { scrap: -15 }, captain: 12 }, result: "A fire, a feast, and their name said loud. They stand a little differently after." },
      { label: "Send them home to the hall.", hint: "The warband gets a new captain. This one waits.",
        effect: { toHall: true }, result: "They hand the warband to whoever is next and ride to the seat. It was not what they asked for." },
      { label: "\"You are fed. That is your name.\"", hint: "Hard. They will remember it.",
        effect: { captain: -8 }, result: "They go very quiet, which is worse than the other thing." },
    ],
    ignore: { captain: -5, result: "They asked to be heard, and were not." },
  },
  {
    id: "refugees", who: "Forty families at the gate of {place}",
    need: (c) => c.warElsewhere,
    text: "\"We came out of the {warNames} war with what we could carry. We can dig, we can haul, we can stand in a line if we have to. We cannot go back.\"",
    options: [
      { label: "Take them in.", hint: "+60 people at {place}; 30 rations to see them through.",
        effect: { pop: 60, res: { food: -30 } }, result: "They are given the empty houses. By spring nobody remembers which ones were new." },
      { label: "Feed them and send them on.", hint: "15 rations; some of the young stay for the muster.",
        effect: { res: { food: -15, men: 10 } }, result: "They eat, and go, and a few of their sons and daughters do not." },
      { label: "Close the gate.", hint: "Nothing in, nothing out.",
        effect: {}, result: "The gate stays shut. In the morning the road is empty." },
    ],
    ignore: { pop: 20, res: { food: -10 }, result: "Nobody answered, so they camped outside the wall and, eventually, inside it." },
  },
  {
    id: "scholar", who: "A scholar from {seat}",
    need: (c) => c.research && c.scrap >= 80,
    text: "\"The advance you have set us to is written down somewhere. I know where. It costs forty scrap to get at it, and it saves a season of guessing.\"",
    options: [
      { label: "Give them the scrap.", hint: "40 scrap; the advance lands a season sooner.",
        effect: { res: { scrap: -40 }, boost: 1 }, result: "The scholar is gone a month and comes back with a book that smells of river." },
      { label: "\"Guess faster.\"", hint: "Nothing spent.",
        effect: {}, result: "The scholar goes back to guessing." },
      { label: "Give them twenty and a warning.", hint: "20 scrap; half a chance it was enough.",
        effect: { res: { scrap: -20 }, boostChance: 0.5 }, result: "" },
    ],
    ignore: { result: "The scholar shrugged and went back to the bench." },
  },
];
