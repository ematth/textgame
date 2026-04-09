import { isSolid } from './world.js'
import { DISTRICT } from './world.js'

// --- Seeded PRNG ---
function mulberry32(seed) {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ============================================================
// RACES — each race has unique first names and glyph sets
// ============================================================

const RACE_HUMAN = {
  name: 'Human',
  weight: 0.30,
  firstNames: [
    'Aldric','Margery','Cedric','Isolde','Bran','Elara','Gareth','Rowena','Theron','Lydia',
    'Osric','Adela','Wulfric','Brienne','Leofric','Elowen','Godwin','Matilda','Alaric','Helga',
    'Edmund','Sigrid','Reynard','Gisela','Tormund','Yvette','Baldric','Mildred','Hector','Agnes',
    'Percival','Rosalind','Roderick','Beatrice','Duncan','Clarice','Godfrey','Edith','Lambert','Sabine',
    'Bertram','Constance','Aldwin','Millicent','Ulric','Cecily','Osbert','Maude','Anselm','Sybil',
    'Crispin','Aveline','Eadric','Lettice','Norbert','Muriel','Fulke','Petronilla','Leander','Blanche',
    'Wolfram','Griselda','Ingram','Thomasin','Baldwin','Rosamund','Gilbert','Alienor','Hubert','Emeline',
    'Ranulf','Benedicta','Gervase','Scholastica','Odo','Gertrude','Drogo','Hildegard','Eustace','Clemence',
    'Robert','Alice','William','Joan','Thomas','Mary','John','Elizabeth','Richard','Margaret',
    'Walter','Catherine','Henry','Anne','Simon','Eleanor','Adam','Mabel','Geoffrey','Juliana',
  ],
  chars: {
    Guard: 'G', Merchant: 'M', Blacksmith: 'B', Baker: 'b', Priest: 'P',
    Noble: 'N', Beggar: 'z', Bard: 'd', Thief: 't', Farmer: 'F',
    Scholar: 'S', Healer: 'H', Soldier: 'g', Innkeeper: 'I', Fishmonger: 'f',
    Mason: 'm', Courier: 'c', Servant: 's', Knight: 'K', Witch: 'W',
  },
}

const RACE_KHARIDIAN = {
  name: 'Kharidian',
  weight: 0.15,
  firstNames: [
    'Thanos','Elektra','Darius','Kassandra','Stavros','Melina','Nikos','Ioanna','Kostas','Eleni',
    'Alexios','Dimitra','Yannis','Chryssa','Spiros','Athina','Michail','Despina','Pavlos','Kalliope',
    'Herakles','Phoebe','Leonidas','Selene','Achilles','Daphne','Orion','Ariadne','Theseus','Medusa',
    'Perseus','Calypso','Atlas','Hestia','Kyros','Xanthe','Zephyros','Ianthe','Solon','Thalia',
  ],
  // Greek alphabet glyphs
  chars: {
    Guard: 'Σ', Merchant: 'Φ', Blacksmith: 'Ψ', Baker: 'β', Priest: 'Ω',
    Noble: 'Δ', Beggar: 'ζ', Bard: 'λ', Thief: 'θ', Farmer: 'γ',
    Scholar: 'Ξ', Healer: 'Π', Soldier: 'σ', Innkeeper: 'ι', Fishmonger: 'φ',
    Mason: 'μ', Courier: 'κ', Servant: 'ε', Knight: 'Λ', Witch: 'Θ',
  },
}

const RACE_NORTHBORN = {
  name: 'Northborn',
  weight: 0.15,
  firstNames: [
    'Dmitri','Anastasia','Vladimir','Tatiana','Alexei','Natasha','Mikhail','Olga','Boris','Katya',
    'Sergei','Yelena','Nikolai','Irina','Vasily','Masha','Grigori','Svetlana','Fyodor','Daria',
    'Andrei','Ludmila','Pavel','Zoya','Yuri','Galina','Ivan','Raisa','Oleg','Tamara',
    'Rurik','Vasilisa','Svyatoslav','Yaroslava','Mstislav','Bogdana','Rostislav','Dragomir','Miroslav','Zlata',
  ],
  // Cyrillic glyphs
  chars: {
    Guard: 'Д', Merchant: 'Ж', Blacksmith: 'Ш', Baker: 'Б', Priest: 'Ф',
    Noble: 'Я', Beggar: 'э', Bard: 'Л', Thief: 'ц', Farmer: 'П',
    Scholar: 'Щ', Healer: 'Ю', Soldier: 'д', Innkeeper: 'И', Fishmonger: 'ж',
    Mason: 'ш', Courier: 'ч', Servant: 'н', Knight: 'Ч', Witch: 'Э',
  },
}

const RACE_ELVEN = {
  name: 'Elven',
  weight: 0.15,
  firstNames: [
    'Aelindra','Thalion','Celebwen','Faelar','Galawen','Ithilien','Luthiel','Maedhros','Nimrodel','Orophin',
    'Silvan','Taurenil','Vanesse','Earendil','Findaril','Glorindel','Haldaril','Idrilas','Lorien','Miriel',
    'Nenharma','Tirion','Elanor','Amroth','Caladwen','Daeron','Ecthelion','Finduilas','Gwindor','Aranwe',
    'Beleg','Cirdan','Denethor','Eldalote','Feanor','Gilraen','Indis','Nerdanel','Thingol','Melian',
  ],
  // Extended Latin / Nordic glyphs
  chars: {
    Guard: 'Æ', Merchant: 'Ø', Blacksmith: 'Ð', Baker: 'þ', Priest: 'Å',
    Noble: 'Ý', Beggar: 'ð', Bard: 'æ', Thief: 'ø', Farmer: 'Þ',
    Scholar: 'Ö', Healer: 'Ü', Soldier: 'ß', Innkeeper: 'Ä', Fishmonger: 'å',
    Mason: 'ö', Courier: 'ü', Servant: 'ä', Knight: 'Ÿ', Witch: 'Ñ',
  },
}

const RACE_DWARVEN = {
  name: 'Dwarven',
  weight: 0.12,
  firstNames: [
    'Thorin','Bruni','Dwalin','Gimra','Fundin','Nori','Balin','Gloin','Ori','Dain',
    'Thror','Bifur','Bofur','Bombur','Fili','Kili','Durin','Thrain','Nain','Groin',
    'Floi','Frar','Loni','Nali','Oin','Gror','Farin','Borin','Hild','Dis',
    'Kira','Dagni','Erna','Vigdis','Groa','Freya','Hulda','Inga','Milda','Solva',
  ],
  // Heavy / angular Unicode glyphs
  chars: {
    Guard: 'Ŧ', Merchant: 'Đ', Blacksmith: 'Ħ', Baker: 'ŋ', Priest: 'Ł',
    Noble: 'Ŵ', Beggar: 'ŧ', Bard: 'đ', Thief: 'ħ', Farmer: 'Ŋ',
    Scholar: 'Ĩ', Healer: 'Ũ', Soldier: 'ŀ', Innkeeper: 'Ő', Fishmonger: 'ű',
    Mason: 'Ĵ', Courier: 'ĸ', Servant: 'ŏ', Knight: 'Ŏ', Witch: 'Ŵ',
  },
}

const RACE_FEY = {
  name: 'Fey',
  weight: 0.13,
  firstNames: [
    'Oberon','Titania','Puck','Viviane','Morgana','Melusine','Erlking','Nimue','Ariel','Brighid',
    'Cernunnos','Danu','Epona','Fiachra','Gwydion','Herne','Iseult','Lugh','Morrigan','Niamh',
    'Oonagh','Pwyll','Rhiannon','Siofra','Tuatha','Unseelie','Branwen','Cerridwen','Dagda','Aine',
    'Blodeuwedd','Cliodhna','Diancecht','Etain','Fand','Grainne','Lir','Manannan','Nuada','Scathach',
  ],
  // Misc ornamental / mathematical Unicode glyphs
  chars: {
    Guard: 'Ƹ', Merchant: 'Ƨ', Blacksmith: 'Ʃ', Baker: 'ƪ', Priest: 'Ɵ',
    Noble: 'Ʊ', Beggar: 'ƕ', Bard: 'ƈ', Thief: 'ƍ', Farmer: 'Ƥ',
    Scholar: 'Ʀ', Healer: 'Ɣ', Soldier: 'ƹ', Innkeeper: 'Ƕ', Fishmonger: 'ƛ',
    Mason: 'ƙ', Courier: 'ƚ', Servant: 'ƞ', Knight: 'Ƣ', Witch: 'Ȝ',
  },
}

const RACES = [RACE_HUMAN, RACE_KHARIDIAN, RACE_NORTHBORN, RACE_ELVEN, RACE_DWARVEN, RACE_FEY]

// Precompute cumulative weights for weighted random selection
const RACE_CUM_WEIGHTS = []
{
  let sum = 0
  for (const r of RACES) { sum += r.weight; RACE_CUM_WEIGHTS.push(sum) }
}

// ============================================================
// SURNAMES (shared across all races — occupational names)
// ============================================================

const SURNAMES = [
  'Ironhand','Thatch','Ashford','Blackthorn','Copperfield','Dunmore','Elderwood','Fairfax',
  'Greenhill','Holloway','Iverson','Jarrow','Kingsford','Lockhart','Merriweather','Northcott',
  'Oakley','Pendleton','Quicksilver','Ravenswood','Stonegate','Thornbury','Underhill','Valemont',
  'Whitmore','Yarborough','Aldridge','Blackwood','Coldwell','Darkholme','Eastmere','Foxglove',
  'Goldsmith','Hawksworth','Ironcross','Jessop','Kendrick','Longfellow','Moorland','Nightingale',
  'Oxbridge','Proudfoot','Queensbury','Redmund','Silverstream','Thistledown','Upperton','Vanguard',
  'Westbrook','Yewdale','Ashburn','Briarwood','Clayborne','Driftwood','Elmsworth','Flintrock',
  'Graymane','Hearthstone','Inkwell','Jadewater','Kettleburn','Larkfield','Millstone','Netherby',
  'Oakenshield','Pinehurst','Quartzmore','Riverbend','Stormwind','Tidewater','Umbridge','Vinehall',
  'Windermere','Yeomanry','Arrowsmith','Barleycorn','Chandler','Draper','Fletcher','Granger',
  'Harper','Inker','Joiner','Cooper','Lorimer','Mason','Napier','Ostler',
  'Potter','Quarrier','Roper','Sawyer','Tanner','Usher','Vintner','Walker',
  'Weaver','Dyer','Baker','Brewer','Butcher','Carver','Fisher','Forester',
  'Gardener','Hayward','Hunter','Kemp','Lister','Miller','Page','Parker',
  'Reeve','Shepherd','Smith','Spencer','Steward','Thatcher','Turner','Ward',
  'Wright','Archer','Bailey','Brennan','Clark','Dawson','Evans','Frost',
  'Grant','Hayes','Ingram','Jarvis','Knox','Lawson','Marsh','Nash',
  'Owen','Price','Quinn','Reed','Shaw','Todd','Vale','Webb',
  'York','Abbott','Bishop','Cross','Dean','Elder','Fox','Graves',
  'Heath','Ivory','Jade','King','Lance','Moon','Noble','Oak',
  'Pike','Raven','Sage','Storm','Thorn','Ash','Birch','Clay',
  'Drake','Elm','Fern','Glen','Hart','Isle','Kern','Lake',
  'Moss','North','Pine','Rose','Stone','Swift','Wolf','Wren',
  'Flint','Brook','Dale','Fell','Holt','Lea','Rowan','Vale',
  'Byrne','Crane','Dove','Eagle','Finch','Hawk','Lark','Starling',
]

// ============================================================
// ROLE DEFINITIONS
// ============================================================

const ROLES = [
  { name: 'Guard',      fg: '#94a3b8', districts: [DISTRICT.MILITARY, DISTRICT.NOBLE], patrol: true,  interior: false },
  { name: 'Merchant',   fg: '#e8c080', districts: [DISTRICT.MARKET],                   patrol: true,  interior: true  },
  { name: 'Blacksmith', fg: '#d97706', districts: [DISTRICT.MARKET, DISTRICT.MILITARY], patrol: false, interior: true  },
  { name: 'Baker',      fg: '#f5d0a9', districts: [DISTRICT.MARKET, DISTRICT.RESIDENTIAL], patrol: true,  interior: true  },
  { name: 'Priest',     fg: '#c4b5fd', districts: [DISTRICT.TEMPLE],                   patrol: true,  interior: true  },
  { name: 'Noble',      fg: '#fbbf24', districts: [DISTRICT.NOBLE],                    patrol: true,  interior: false },
  { name: 'Beggar',     fg: '#78716c', districts: [DISTRICT.SLUMS, DISTRICT.MARKET],   patrol: false, interior: false },
  { name: 'Bard',       fg: '#34d399', districts: [DISTRICT.MARKET, DISTRICT.SLUMS],   patrol: false, interior: false },
  { name: 'Thief',      fg: '#6b7280', districts: [DISTRICT.SLUMS],                    patrol: false, interior: false },
  { name: 'Farmer',     fg: '#84cc16', districts: [DISTRICT.RESIDENTIAL, DISTRICT.MARKET], patrol: true, interior: false },
  { name: 'Scholar',    fg: '#60a5fa', districts: [DISTRICT.TEMPLE, DISTRICT.NOBLE],   patrol: true,  interior: true  },
  { name: 'Healer',     fg: '#f472b6', districts: [DISTRICT.TEMPLE, DISTRICT.RESIDENTIAL], patrol: true, interior: true },
  { name: 'Soldier',    fg: '#a1a1aa', districts: [DISTRICT.MILITARY],                 patrol: true,  interior: false },
  { name: 'Innkeeper',  fg: '#fb923c', districts: [DISTRICT.MARKET, DISTRICT.SLUMS],   patrol: false, interior: true  },
  { name: 'Fishmonger', fg: '#22d3ee', districts: [DISTRICT.MARKET],                   patrol: true,  interior: false },
  { name: 'Mason',      fg: '#a8a29e', districts: [DISTRICT.RESIDENTIAL, DISTRICT.MILITARY], patrol: true, interior: false },
  { name: 'Courier',    fg: '#facc15', districts: [DISTRICT.MARKET, DISTRICT.NOBLE],   patrol: true,  interior: false },
  { name: 'Servant',    fg: '#d4d4d8', districts: [DISTRICT.NOBLE, DISTRICT.RESIDENTIAL], patrol: true, interior: true },
  { name: 'Knight',     fg: '#e2e8f0', districts: [DISTRICT.NOBLE, DISTRICT.MILITARY], patrol: true,  interior: false },
  { name: 'Witch',      fg: '#a78bfa', districts: [DISTRICT.SLUMS, DISTRICT.TEMPLE],   patrol: false, interior: false },
]

// ============================================================
// DIALOG POOLS (~10 per role)
// ============================================================

const DIALOG = {
  Guard: [
    'Move along, citizen. Nothing to see here.',
    'The walls keep us safe. Do not take them for granted.',
    'I have been on watch since dawn. These legs ache.',
    'Report any suspicious activity to the captain.',
    'The eastern gate had trouble last week. Stay sharp.',
    'No weapons drawn inside the city, by order of the lord.',
    'Another quiet day. That is the best kind.',
    'I saw something strange near the dungeons last night.',
    'The captain wants double patrols this week.',
    'Keep your coin purse close. Thieves are bold lately.',
  ],
  Merchant: [
    'Fine wares! Best prices in all of Stonehaven!',
    'Looking for something special? I might have just the thing.',
    'Trade has been slow since the northern road washed out.',
    'My supplier from the east brings exotic spices. Interested?',
    'Haggling is an art. I respect a good haggler.',
    'The market stalls are full today. Competition keeps prices fair.',
    'I once sold a gem that turned out to be enchanted. Wild times.',
    'Come back tomorrow, I am expecting a new shipment.',
    'Every coin spent here stays in Stonehaven. Support local trade.',
    'The noble quarter pays triple for the same goods. Fools!',
  ],
  Blacksmith: [
    'The forge never sleeps, and neither do I.',
    'Iron, steel, or mithril — I shape them all.',
    'This hammer has been in my family three generations.',
    'Need a blade sharpened? Two coppers and it is done.',
    'The soldiers keep me busy with repairs.',
    'A good sword is worth more than a bag of gold.',
    'The heat of the forge reminds me I am alive.',
    'I forged the gates of the castle itself.',
    'Bring me ore and I will make something fine.',
    'Even the king trusts my work. That says enough.',
  ],
  Baker: [
    'Fresh bread! Baked this morning!',
    'The secret is in the sourdough starter. Fifty years old.',
    'Flour prices keep climbing. Blame the millers.',
    'Try the honey rolls. People come from three districts for them.',
    'I wake before the sun every day. Worth it for the craft.',
    'The taverns buy half my stock. Good business.',
    'Grain stores are low this season. Worrying times.',
    'Nothing beats warm bread on a cold morning.',
    'My grandmother taught me everything about baking.',
    'The noble houses want only white flour. Wasteful, I say.',
  ],
  Priest: [
    'The light watches over all who walk in faith.',
    'Come to the temple for guidance. All are welcome.',
    'I sense a darkness stirring beneath the city.',
    'Prayer is the armor of the soul.',
    'The ancient texts speak of trials yet to come.',
    'Blessings upon you, traveler.',
    'The temple bells ring at dawn and dusk. Listen for them.',
    'Even in darkness, there is light for those who seek it.',
    'The poor need our help more than ever this winter.',
    'Meditation brings clarity. You should try it sometime.',
  ],
  Noble: [
    'Do you know who I am? Show some respect.',
    'The castle functions because of families like mine.',
    'Politics is a game. I intend to win.',
    'My estate produces the finest wines in the region.',
    'The commoners do not understand the burden of nobility.',
    'I am hosting a banquet next week. Only the finest attend.',
    'The king values my counsel. As he should.',
    'Proper etiquette is the foundation of civilization.',
    'My ancestors built this district stone by stone.',
    'Money is not everything. Power, however...',
  ],
  Beggar: [
    'Spare a coin? Just one copper...',
    'I was not always like this. War took everything.',
    'The shelters are full. The streets are cold.',
    'Bless you if you can help. Curse nothing if you cannot.',
    'I know every alley and secret in this city.',
    'The guards chase us away, but where else can we go?',
    'A warm meal... that is all I dream about.',
    'I hear things. People talk like I am invisible.',
    'Once I was a soldier. Now look at me.',
    'The temple gives us bread on holy days. Small mercies.',
  ],
  Bard: [
    'Shall I sing you a tale of heroes long past?',
    'My lute has traveled more roads than most merchants.',
    'Every city has a song. Stonehaven\'s is a ballad of stone and iron.',
    'The best stories are the ones people try to hide.',
    'A coin for a song? You will not regret it.',
    'I learned my craft in the southern courts.',
    'Music soothes the savage beast. And the city guard.',
    'The taverns pay well for a good performer.',
    'I am composing an epic about the founding of this city.',
    'Listen closely — every note carries meaning.',
  ],
  Thief: [
    'You did not see me. I was never here.',
    'Keep your voice down. Walls have ears in this district.',
    'Information is more valuable than gold. Remember that.',
    'The guild controls everything that moves in the shadows.',
    'I could pick that lock in my sleep.',
    'Trust no one completely. Especially not me.',
    'The noble quarter has the best... opportunities.',
    'I only steal from those who can afford to lose it.',
    'The sewers connect more places than you would think.',
    'Every guard has a pattern. Learn it, and you are free.',
  ],
  Farmer: [
    'The soil outside the walls is rich. Good harvests this year.',
    'I bring produce to market every third day.',
    'Rain would be welcome. The crops are thirsty.',
    'The pests are terrible this season.',
    'My family has farmed this land for five generations.',
    'City folk do not appreciate where their food comes from.',
    'I trade grain for tools. A fair deal.',
    'The lord takes a heavy tithe. We manage.',
    'Sunrise to sunset. That is a farmer\'s life.',
    'I prefer the quiet of the fields to the noise of the city.',
  ],
  Scholar: [
    'Knowledge is the only treasure that grows when shared.',
    'The library contains texts dating back centuries.',
    'I am researching the ruins north of the city.',
    'History repeats itself. If only people would listen.',
    'The ancient scripts are difficult to decipher.',
    'Have you seen the old maps? The city was half this size.',
    'Education should be available to all, not just the wealthy.',
    'I correspond with scholars across the known world.',
    'The truth is often more complex than the legends suggest.',
    'Curiosity is not a sin, despite what some priests say.',
  ],
  Healer: [
    'Let me see that wound. I have herbs that can help.',
    'Prevention is better than cure. Eat well, sleep well.',
    'The plague two winters ago taught us much.',
    'I gather herbs from beyond the city walls. Dangerous but necessary.',
    'A healer\'s work is never done.',
    'The soldiers keep me busy, especially after training.',
    'Nature provides remedies for most ailments.',
    'Rest is the best medicine. People forget that.',
    'I trained under the temple healers for seven years.',
    'Clean water is more important than any potion I can brew.',
  ],
  Soldier: [
    'Training at dawn. Every day without exception.',
    'The barracks are cramped but we make do.',
    'I follow orders. That is what soldiers do.',
    'The border skirmishes keep us on edge.',
    'My sword arm is strong. That is all that matters.',
    'The captain is tough but fair. We respect that.',
    'Guard duty is boring. I prefer the field.',
    'We drill formations until they are second nature.',
    'Every soldier knows the value of a good pair of boots.',
    'The armory needs restocking. Budget problems again.',
  ],
  Innkeeper: [
    'Welcome! A room for the night? Or just an ale?',
    'The stew is hot and the beds are clean. What more do you need?',
    'I hear all the gossip. Comes with the trade.',
    'Business has been good since the festival.',
    'We do not allow fighting inside. Take it to the street.',
    'The ale comes from a local brewery. Best in the city.',
    'Travelers bring the most interesting stories.',
    'Room and board for three coppers a night. Fair price.',
    'I have run this inn for twenty years. Seen it all.',
    'The regulars are like family at this point.',
  ],
  Fishmonger: [
    'Fresh catch! Pulled from the river this morning!',
    'The river fish are plentiful this season.',
    'Watch the bones in the pike. Nasty surprise if you are not careful.',
    'I salt and smoke the surplus. Nothing goes to waste.',
    'The noble houses want only the finest fillets.',
    'Rain upstream means muddy fish. Not ideal.',
    'My stall has been here longer than most buildings.',
    'The eels are an acquired taste. But worth acquiring.',
    'I know every fisherman on the river by name.',
    'Fresh fish waits for no one. Buy now or regret later.',
  ],
  Mason: [
    'These walls were built to last a thousand years.',
    'Stone does not lie. You can read a building\'s history in its walls.',
    'I repaired the eastern wall after the siege. Hard work.',
    'Good mortar is the difference between a wall and a pile of rocks.',
    'The quarry outside town keeps us supplied.',
    'Every building in this city has my mark somewhere.',
    'Cutting stone is an art. Most people do not see it.',
    'The castle foundations go deeper than you would believe.',
    'Rain and frost are stone\'s worst enemies.',
    'I take pride in every block I lay. Each one matters.',
  ],
  Courier: [
    'Message for... well, not for you. Move along.',
    'I have run every street in this city a hundred times.',
    'Speed and discretion. That is what they pay me for.',
    'The noble houses send more letters than you would imagine.',
    'Rain or shine, the messages must get through.',
    'I know shortcuts through the city that maps do not show.',
    'Sealed letters. I never read them. Well, almost never.',
    'The merchant guild keeps me busiest during trade season.',
    'My legs are tired but the pay is decent.',
    'Time is money, and I deal in both.',
  ],
  Servant: [
    'Yes, my lord. Right away, my lord.',
    'The household runs because of people like me.',
    'I have served this family since I was a child.',
    'The master expects perfection. I do my best.',
    'There is dignity in honest work.',
    'The kitchen needs more firewood. Always more firewood.',
    'I know every room and passage in this house.',
    'Guests are expected tonight. Much to prepare.',
    'A good servant sees everything and says nothing.',
    'I dream of saving enough to start my own trade.',
  ],
  Knight: [
    'Honor and duty above all else.',
    'My sword is pledged to the defense of this city.',
    'The tournaments are approaching. I must prepare.',
    'A true knight protects the weak and upholds justice.',
    'I earned my spurs on the battlefield, not in a courtyard.',
    'The king\'s word is law. I enforce it.',
    'Chivalry is not dead. Not while I draw breath.',
    'My armor bears the scars of a dozen campaigns.',
    'The squires need more discipline. I will see to it.',
    'There is no greater honor than service to the realm.',
  ],
  Witch: [
    'The herbs I sell have... special properties.',
    'Do not believe everything they say about witches.',
    'I read fortunes in the stars. Yours is... interesting.',
    'The old ways are not evil. Just misunderstood.',
    'I brew potions that the healers cannot match.',
    'The shadows speak to those who know how to listen.',
    'Cross my palm with silver and I will tell your future.',
    'The city elders tolerate me. Barely.',
    'My cat sees things that human eyes cannot.',
    'There is magic in this place. Can you not feel it?',
  ],
}

// ============================================================
// ROUTE OFFSET TEMPLATES
// ============================================================

const ROUTE_OFFSETS = [
  [{ dx: 0, dy: -8 }, { dx: 8, dy: 0 }, { dx: 0, dy: 8 }, { dx: -8, dy: 0 }],
  [{ dx: 5, dy: -5 }, { dx: 5, dy: 5 }, { dx: -5, dy: 5 }, { dx: -5, dy: -5 }],
  [{ dx: 10, dy: 0 }, { dx: -10, dy: 0 }],
  [{ dx: 0, dy: 12 }, { dx: 0, dy: -12 }],
  [{ dx: 6, dy: 0 }, { dx: 6, dy: 6 }, { dx: -6, dy: 6 }, { dx: -6, dy: 0 }],
  [{ dx: 3, dy: -10 }, { dx: 10, dy: 3 }, { dx: -3, dy: 10 }, { dx: -10, dy: -3 }],
  [{ dx: 0, dy: -15 }, { dx: 15, dy: 0 }, { dx: 0, dy: 15 }, { dx: -15, dy: 0 }],
  [{ dx: 7, dy: 0 }, { dx: 0, dy: 7 }, { dx: -7, dy: 0 }, { dx: 0, dy: -7 }],
  [{ dx: 4, dy: -4 }, { dx: 8, dy: 0 }, { dx: 4, dy: 4 }, { dx: -4, dy: 4 }, { dx: -8, dy: 0 }, { dx: -4, dy: -4 }],
  [{ dx: 0, dy: -6 }, { dx: 6, dy: -6 }, { dx: 6, dy: 6 }, { dx: 0, dy: 6 }],
  [{ dx: 12, dy: 0 }, { dx: 12, dy: 12 }, { dx: 0, dy: 12 }],
  [{ dx: -5, dy: -10 }, { dx: 5, dy: -10 }, { dx: 5, dy: 10 }, { dx: -5, dy: 10 }],
  [{ dx: 3, dy: 0 }, { dx: 0, dy: 3 }, { dx: -3, dy: 0 }, { dx: 0, dy: -3 }],
  [{ dx: 8, dy: -4 }, { dx: 8, dy: 4 }, { dx: -8, dy: 4 }, { dx: -8, dy: -4 }],
  [{ dx: 0, dy: -20 }, { dx: 0, dy: 20 }],
  [{ dx: 15, dy: 0 }, { dx: -15, dy: 0 }],
  [{ dx: 5, dy: -8 }, { dx: -5, dy: -8 }, { dx: -5, dy: 8 }, { dx: 5, dy: 8 }],
  [{ dx: 10, dy: 10 }, { dx: -10, dy: -10 }],
  [{ dx: 6, dy: -3 }, { dx: 3, dy: 6 }, { dx: -6, dy: 3 }, { dx: -3, dy: -6 }],
  [{ dx: 0, dy: -5 }, { dx: 5, dy: 0 }, { dx: 0, dy: 5 }],
]

// ============================================================
// HELPERS
// ============================================================

function findWalkable(world, x, y, rng, radius) {
  if (!isSolid(world, x, y)) return { x, y }
  for (let r = 1; r <= radius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < world.width && ny >= 0 && ny < world.height && !isSolid(world, nx, ny)) {
          return { x: nx, y: ny }
        }
      }
    }
  }
  return { x, y }
}

function pickRace(rng) {
  const r = rng()
  for (let i = 0; i < RACE_CUM_WEIGHTS.length; i++) {
    if (r < RACE_CUM_WEIGHTS[i]) return RACES[i]
  }
  return RACES[0]
}

// ============================================================
// MAIN POPULATION FUNCTION
// ============================================================

export function populateNPCs(worldManager, districtMap, buildingRegistry) {
  const rng = mulberry32(12345)
  const overworld = worldManager.getWorld('overworld')
  if (!overworld) return

  const usedNames = new Set()
  let npcId = 0

  function generateName(race) {
    const names = race.firstNames
    for (let attempts = 0; attempts < 100; attempts++) {
      const first = names[(rng() * names.length) | 0]
      const last = SURNAMES[(rng() * SURNAMES.length) | 0]
      const full = `${first} ${last}`
      if (!usedNames.has(full)) {
        usedNames.add(full)
        return full
      }
    }
    const first = names[(rng() * names.length) | 0]
    const last = SURNAMES[(rng() * SURNAMES.length) | 0]
    return `${first} ${last} the ${++npcId}`
  }

  function pickRole(district) {
    const matching = ROLES.filter((r) => r.districts.includes(district))
    if (matching.length > 0 && rng() < 0.7) {
      return matching[(rng() * matching.length) | 0]
    }
    return ROLES[(rng() * ROLES.length) | 0]
  }

  function pickDialog(roleName) {
    const pool = DIALOG[roleName]
    if (!pool || pool.length === 0) return 'I have nothing to say.'
    return pool[(rng() * pool.length) | 0]
  }

  function makeRoute(spawnX, spawnY, world) {
    const template = ROUTE_OFFSETS[(rng() * ROUTE_OFFSETS.length) | 0]
    const waypoints = []
    for (const off of template) {
      let wx = spawnX + off.dx
      let wy = spawnY + off.dy
      wx = Math.max(1, Math.min(world.width - 2, wx))
      wy = Math.max(1, Math.min(world.height - 2, wy))
      const pos = findWalkable(world, wx, wy, rng, 5)
      waypoints.push({ x: pos.x, y: pos.y })
    }
    return { waypoints, currentIndex: 0 }
  }

  function createNpc(sx, sy, role, race, world, withRoute) {
    const char = race.chars[role.name] || role.name[0]
    const route = withRoute ? makeRoute(sx, sy, world) : null

    return {
      id: `npc_${npcId++}`,
      kind: 'npc',
      x: sx,
      y: sy,
      char,
      fg: role.fg,
      name: generateName(race),
      role: role.name,
      race: race.name,
      dialog: pickDialog(role.name),
      wanderCooldown: rng() * 2000,
      route,
    }
  }

  // --- Overworld NPCs (~4500) ---
  const OW_COUNT = 4500
  const ow = overworld

  const districtTiles = {}
  for (let d = 0; d <= 5; d++) districtTiles[d] = []

  for (let y = 0; y < ow.height; y++) {
    for (let x = 0; x < ow.width; x++) {
      if (isSolid(ow, x, y)) continue
      const d = districtMap[y * ow.width + x]
      if (d <= 5 && districtTiles[d]) {
        districtTiles[d].push(y * ow.width + x)
      }
    }
  }

  const totalTiles = Object.values(districtTiles).reduce((s, a) => s + a.length, 0)
  if (totalTiles === 0) return

  for (let i = 0; i < OW_COUNT; i++) {
    let r = rng() * totalTiles
    let district = 0
    for (let d = 0; d <= 5; d++) {
      r -= districtTiles[d].length
      if (r <= 0) { district = d; break }
    }

    const dTiles = districtTiles[district]
    if (dTiles.length === 0) continue

    const tileIdx = dTiles[(rng() * dTiles.length) | 0]
    const sy = (tileIdx / ow.width) | 0
    const sx = tileIdx - sy * ow.width

    const role = pickRole(district)
    const race = pickRace(rng)
    const useRoute = role.patrol && rng() < 0.7

    ow.entities.list.push(createNpc(sx, sy, role, race, ow, useRoute))
  }

  // --- Interior NPCs ---
  const interiorRoles = ROLES.filter((r) => r.interior)
  for (const info of buildingRegistry) {
    if (info.type === 'dungeon') continue
    const intWorld = worldManager.getWorld(`interior_${info.id}`)
    if (!intWorld) continue

    const count = rng() < 0.5 ? 1 : rng() < 0.5 ? 2 : 0
    for (let n = 0; n < count; n++) {
      for (let attempts = 0; attempts < 20; attempts++) {
        const ix = 2 + ((rng() * (intWorld.width - 4)) | 0)
        const iy = 2 + ((rng() * (intWorld.height - 4)) | 0)
        if (!isSolid(intWorld, ix, iy)) {
          let role
          if (info.type === 'shop') role = ROLES.find((r) => r.name === 'Merchant')
          else if (info.type === 'tavern') role = ROLES.find((r) => r.name === 'Innkeeper')
          else if (info.type === 'blacksmith') role = ROLES.find((r) => r.name === 'Blacksmith')
          else if (info.type === 'temple') role = ROLES.find((r) => r.name === 'Priest')
          else if (info.type === 'barracks') role = ROLES.find((r) => r.name === 'Soldier')
          else if (info.type === 'noble_house') role = ROLES.find((r) => r.name === 'Servant')
          else if (info.type === 'castle_throne') role = ROLES.find((r) => r.name === 'Knight')
          else if (info.type === 'castle_chamber') role = ROLES.find((r) => r.name === 'Servant')
          else role = interiorRoles[(rng() * interiorRoles.length) | 0]

          if (!role) role = interiorRoles[(rng() * interiorRoles.length) | 0]

          const race = pickRace(rng)
          intWorld.entities.list.push(createNpc(ix, iy, role, race, intWorld, false))
          break
        }
      }
    }
  }
}
