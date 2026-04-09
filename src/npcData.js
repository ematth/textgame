import { DISTRICT } from './world.js'

// ============================================================
// MOODS
// ============================================================

export const MOODS = ['content', 'anxious', 'cheerful', 'irritable', 'melancholy', 'suspicious', 'calm', 'excited']

// ============================================================
// RACE PHYSICAL STATS (height in cm, weight in kg)
// ============================================================

export const RACE_PHYSICALS = {
  Human:     { heightBase: 170, heightVar: 15, weightBase: 75, weightVar: 20 },
  Kharidian: { heightBase: 172, heightVar: 12, weightBase: 73, weightVar: 18 },
  Northborn: { heightBase: 180, heightVar: 14, weightBase: 85, weightVar: 22 },
  Elven:     { heightBase: 178, heightVar: 10, weightBase: 65, weightVar: 15 },
  Dwarven:   { heightBase: 140, heightVar: 10, weightBase: 80, weightVar: 20 },
  Fey:       { heightBase: 165, heightVar: 20, weightBase: 60, weightVar: 18 },
  Orcish:    { heightBase: 190, heightVar: 15, weightBase: 100, weightVar: 25 },
  Halfling:  { heightBase: 110, heightVar: 10, weightBase: 40, weightVar: 12 },
}

// ============================================================
// RACES — each with gendered first names and glyph sets
// ============================================================

const RACE_HUMAN = {
  name: 'Human',
  weight: 0.27,
  maleNames: [
    'Aldric','Cedric','Bran','Gareth','Theron','Osric','Wulfric','Leofric','Godwin','Alaric',
    'Edmund','Reynard','Tormund','Baldric','Hector','Percival','Roderick','Duncan','Godfrey','Lambert',
    'Bertram','Aldwin','Ulric','Osbert','Anselm','Crispin','Eadric','Norbert','Fulke','Leander',
    'Wolfram','Ingram','Baldwin','Gilbert','Hubert','Ranulf','Gervase','Odo','Drogo','Eustace',
    'Robert','William','Thomas','John','Richard','Walter','Henry','Simon','Adam','Geoffrey',
    'Ambrose','Benedict','Conrad','Desmond','Edgar','Felix','Gregory','Hadrian','Jasper','Leopold',
  ],
  femaleNames: [
    'Margery','Isolde','Elara','Rowena','Lydia','Adela','Brienne','Elowen','Matilda','Helga',
    'Sigrid','Gisela','Yvette','Mildred','Agnes','Rosalind','Beatrice','Clarice','Edith','Sabine',
    'Constance','Millicent','Cecily','Maude','Sybil','Aveline','Lettice','Muriel','Petronilla','Blanche',
    'Griselda','Thomasin','Rosamund','Alienor','Emeline','Benedicta','Scholastica','Gertrude','Hildegard','Clemence',
    'Alice','Joan','Mary','Elizabeth','Margaret','Catherine','Anne','Eleanor','Mabel','Juliana',
    'Cordelia','Drusilla','Evangeline','Felicity','Gwendolyn','Helena','Isadora','Josephine','Katerina','Lenora',
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
  weight: 0.13,
  maleNames: [
    'Thanos','Darius','Stavros','Nikos','Kostas','Alexios','Yannis','Spiros','Michail','Pavlos',
    'Herakles','Leonidas','Achilles','Orion','Theseus','Perseus','Atlas','Kyros','Zephyros','Solon',
    'Agamemnon','Cadmus','Draco','Eudoxos','Galen','Hermes','Icarus','Jason','Kreon','Lysander',
    'Minos','Nestor','Odeon','Priam','Silas','Talos','Xander','Zeno','Ariston','Demetrios',
  ],
  femaleNames: [
    'Elektra','Kassandra','Melina','Ioanna','Eleni','Dimitra','Chryssa','Athina','Despina','Kalliope',
    'Phoebe','Selene','Daphne','Ariadne','Medusa','Calypso','Hestia','Xanthe','Ianthe','Thalia',
    'Aglaia','Andromeda','Circe','Dione','Eirene','Galatea','Harmonia','Ismene','Korinna','Leda',
    'Melite','Nephele','Olympia','Penelope','Rhea','Sappho','Tethys','Urania','Xenia','Zephyrine',
  ],
  chars: {
    Guard: 'Σ', Merchant: 'Φ', Blacksmith: 'Ψ', Baker: 'β', Priest: 'Ω',
    Noble: 'Δ', Beggar: 'ζ', Bard: 'λ', Thief: 'θ', Farmer: 'γ',
    Scholar: 'Ξ', Healer: 'Π', Soldier: 'σ', Innkeeper: 'ι', Fishmonger: 'φ',
    Mason: 'μ', Courier: 'κ', Servant: 'ε', Knight: 'Λ', Witch: 'Θ',
  },
}

const RACE_NORTHBORN = {
  name: 'Northborn',
  weight: 0.13,
  maleNames: [
    'Dmitri','Vladimir','Alexei','Mikhail','Boris','Sergei','Nikolai','Vasily','Grigori','Fyodor',
    'Andrei','Pavel','Yuri','Ivan','Oleg','Rurik','Svyatoslav','Mstislav','Rostislav','Miroslav',
    'Dragomir','Bogdan','Kazimir','Radoslav','Stanislav','Tikhon','Vitomir','Yaroslav','Zdravko','Branimir',
    'Dobromir','Goran','Lazar','Mladen','Ratimir','Slobodan','Tomislav','Vojislav','Zvonimir','Predrag',
  ],
  femaleNames: [
    'Anastasia','Tatiana','Natasha','Olga','Katya','Yelena','Irina','Masha','Svetlana','Daria',
    'Ludmila','Zoya','Galina','Raisa','Tamara','Vasilisa','Yaroslava','Bogdana','Zlata','Milena',
    'Borislava','Desanka','Gordana','Jadranka','Ljubica','Mirjana','Nada','Radmila','Slavica','Vesna',
    'Branka','Danica','Iskra','Jasna','Kremena','Mila','Nevena','Rada','Snezana','Vera',
  ],
  chars: {
    Guard: 'Д', Merchant: 'Ж', Blacksmith: 'Ш', Baker: 'Б', Priest: 'Ф',
    Noble: 'Я', Beggar: 'э', Bard: 'Л', Thief: 'ц', Farmer: 'П',
    Scholar: 'Щ', Healer: 'Ю', Soldier: 'д', Innkeeper: 'И', Fishmonger: 'ж',
    Mason: 'ш', Courier: 'ч', Servant: 'н', Knight: 'Ч', Witch: 'Э',
  },
}

const RACE_ELVEN = {
  name: 'Elven',
  weight: 0.13,
  maleNames: [
    'Thalion','Faelar','Ithilien','Maedhros','Orophin','Silvan','Taurenil','Earendil','Findaril','Glorindel',
    'Haldaril','Idrilas','Amroth','Daeron','Ecthelion','Gwindor','Aranwe','Beleg','Cirdan','Denethor',
    'Feanor','Thingol','Celeborn','Elrohir','Elladan','Galathil','Ingwion','Lindir','Mablung','Saeros',
    'Turgon','Voronwe','Angrod','Caranthir','Curufin','Fingolfin','Maglor','Oropher','Rumil','Thranduil',
  ],
  femaleNames: [
    'Aelindra','Celebwen','Galawen','Luthiel','Nimrodel','Vanesse','Lorien','Miriel','Nenharma','Elanor',
    'Caladwen','Finduilas','Eldalote','Gilraen','Indis','Nerdanel','Melian','Tirion','Arwen','Galadriel',
    'Idril','Luthien','Morwen','Nimloth','Aredhel','Celebrian','Earwen','Haleth','Nellas','Silmariën',
    'Elenwë','Lalaith','Nienor','Rian','Varda','Yavanna','Aerin','Beruthiel','Ioreth','Lothiriel',
  ],
  chars: {
    Guard: 'Æ', Merchant: 'Ø', Blacksmith: 'Ð', Baker: 'þ', Priest: 'Å',
    Noble: 'Ý', Beggar: 'ð', Bard: 'æ', Thief: 'ø', Farmer: 'Þ',
    Scholar: 'Ö', Healer: 'Ü', Soldier: 'ß', Innkeeper: 'Ä', Fishmonger: 'å',
    Mason: 'ö', Courier: 'ü', Servant: 'ä', Knight: 'Ÿ', Witch: 'Ñ',
  },
}

const RACE_DWARVEN = {
  name: 'Dwarven',
  weight: 0.11,
  maleNames: [
    'Thorin','Dwalin','Fundin','Nori','Balin','Gloin','Ori','Dain','Thror','Bifur',
    'Bofur','Bombur','Fili','Kili','Durin','Thrain','Nain','Groin','Floi','Frar',
    'Loni','Nali','Oin','Gror','Farin','Borin','Bruni','Gimli','Narvi','Telchar',
    'Gamil','Azaghal','Bodruith','Ibun','Khim','Mim','Naugladur','Fangluin','Dwaling','Throrin',
  ],
  femaleNames: [
    'Hild','Dis','Kira','Dagni','Erna','Vigdis','Groa','Freya','Hulda','Inga',
    'Milda','Solva','Brynhild','Gunnhild','Ragnhild','Sigrun','Thordis','Alfhild','Asgerd','Bergljot',
    'Embla','Gudrun','Hervor','Jorunn','Krista','Oddny','Runa','Saldis','Thyra','Yngvild',
    'Astrid','Borghild','Dagmar','Eydis','Frida','Gerdur','Hjordis','Iduna','Kelda','Nanna',
  ],
  chars: {
    Guard: 'Ŧ', Merchant: 'Đ', Blacksmith: 'Ħ', Baker: 'ŋ', Priest: 'Ł',
    Noble: 'Ŵ', Beggar: 'ŧ', Bard: 'đ', Thief: 'ħ', Farmer: 'Ŋ',
    Scholar: 'Ĩ', Healer: 'Ũ', Soldier: 'ŀ', Innkeeper: 'Ő', Fishmonger: 'ű',
    Mason: 'Ĵ', Courier: 'ĸ', Servant: 'ŏ', Knight: 'Ŏ', Witch: 'ĳ',
  },
}

const RACE_FEY = {
  name: 'Fey',
  weight: 0.13,
  maleNames: [
    'Oberon','Puck','Erlking','Cernunnos','Fiachra','Gwydion','Herne','Lugh','Pwyll','Dagda',
    'Lir','Manannan','Nuada','Finvarra','Midir','Aengus','Bodb','Donn','Elathan','Bres',
    'Balor','Cian','Diarmuid','Fionn','Goll','Oisin','Oscar','Ailill','Conall','Fergus',
    'Naoise','Setanta','Amergin','Bran','Conn','Eochaid','Labraid','Nechtan','Tadg','Tuathal',
  ],
  femaleNames: [
    'Titania','Viviane','Morgana','Melusine','Nimue','Ariel','Brighid','Danu','Epona','Iseult',
    'Morrigan','Niamh','Oonagh','Rhiannon','Siofra','Branwen','Cerridwen','Aine','Blodeuwedd','Cliodhna',
    'Etain','Fand','Grainne','Scathach','Macha','Aoife','Deirdre','Sadb','Caer','Flidais',
    'Eriu','Banba','Boann','Brigantia','Cailleach','Derbforgaill','Fionnuala','Grania','Muirgen','Sinann',
  ],
  chars: {
    Guard: 'Ƹ', Merchant: 'Ƨ', Blacksmith: 'Ʃ', Baker: 'ƪ', Priest: 'Ɵ',
    Noble: 'Ʊ', Beggar: 'ƕ', Bard: 'ƈ', Thief: 'ƍ', Farmer: 'Ƥ',
    Scholar: 'Ʀ', Healer: 'Ɣ', Soldier: 'ƹ', Innkeeper: 'Ƕ', Fishmonger: 'ƛ',
    Mason: 'ƙ', Courier: 'ƚ', Servant: 'ƞ', Knight: 'Ƣ', Witch: 'Ȝ',
  },
}

const RACE_ORCISH = {
  name: 'Orcish',
  weight: 0.05,
  maleNames: [
    'Grokk','Thrak','Urgash','Mogul','Grimbold','Kragoth','Zurath','Borzag','Vashnak','Goroth',
    'Dreth','Maugor','Korgul','Thurgaz','Azgoth','Narzug','Boldug','Gashnak','Lurtz','Muzgash',
    'Gothmog','Azog','Bolg','Shagrat','Gorbag','Ugluk','Lugdush','Mauhur','Grishnakh','Ufthak',
    'Snaga','Radbug','Lagduf','Othrod','Krimpat','Gorkhan','Burzum','Ghashnak','Krotal','Skargrim',
  ],
  femaleNames: [
    'Grisha','Uzra','Mogra','Shagga','Krazul','Borgha','Dulga','Threkka','Azura','Vashka',
    'Grunda','Skarla','Mogsha','Tharga','Krusha','Bolga','Nagra','Zurka','Gashka','Druzha',
    'Murga','Kragra','Bashka','Lorga','Ushka','Grimka','Thrakka','Skulda','Vorgha','Bruzga',
    'Shakra','Gorsha','Narga','Kulga','Dagra','Muzga','Rashka','Thulga','Zarsha','Ogrha',
  ],
  chars: {
    Guard: 'Գ', Merchant: 'Դ', Blacksmith: 'Թ', Baker: 'ժ', Priest: 'Ի',
    Noble: 'Ծ', Beggar: 'ձ', Bard: 'թ', Thief: 'ծ', Farmer: 'Կ',
    Scholar: 'Հ', Healer: 'Ճ', Soldier: 'գ', Innkeeper: 'Լ', Fishmonger: 'դ',
    Mason: 'կ', Courier: 'հ', Servant: 'ղ', Knight: 'Ղ', Witch: 'Մ',
  },
}

const RACE_HALFLING = {
  name: 'Halfling',
  weight: 0.05,
  maleNames: [
    'Bilbo','Frodo','Samwise','Pippin','Merry','Hamfast','Lotho','Otho','Fredegar','Folco',
    'Griffo','Polo','Largo','Bingo','Bungo','Longo','Ponto','Porto','Posco','Rollo',
    'Sancho','Togo','Wilibald','Rufus','Doderic','Erling','Everard','Ferdinand','Filibert','Isembard',
    'Isembold','Isengar','Merimac','Paladin','Reginard','Saradoc','Tobold','Adelard','Dinodas','Gerontius',
  ],
  femaleNames: [
    'Rosie','Daisy','Lily','Primula','Lobelia','Belladonna','Amaranth','Asphodel','Camellia','Donnamira',
    'Eglantine','Estella','Goldilocks','Jessamine','Lalia','Malva','Marigold','Menegilda','Mirabella','Pearl',
    'Peony','Pervinca','Poppy','Primrose','Rosa','Ruby','Pansy','Angelica','Bell','Celandine',
    'Dora','Esmeralda','Gilly','Holly','Iris','Jasmine','Lavender','Myrtle','Rosamunda','Hilda',
  ],
  chars: {
    Guard: 'გ', Merchant: 'მ', Blacksmith: 'ბ', Baker: 'პ', Priest: 'წ',
    Noble: 'ნ', Beggar: 'ზ', Bard: 'დ', Thief: 'თ', Farmer: 'ფ',
    Scholar: 'ს', Healer: 'ჰ', Soldier: 'ყ', Innkeeper: 'ი', Fishmonger: 'ქ',
    Mason: 'ხ', Courier: 'ც', Servant: 'ვ', Knight: 'კ', Witch: 'ჯ',
  },
}

export const RACES = [RACE_HUMAN, RACE_KHARIDIAN, RACE_NORTHBORN, RACE_ELVEN, RACE_DWARVEN, RACE_FEY, RACE_ORCISH, RACE_HALFLING]

export const RACE_CUM_WEIGHTS = []
{
  let sum = 0
  for (const r of RACES) { sum += r.weight; RACE_CUM_WEIGHTS.push(sum) }
}

// ============================================================
// SURNAMES (shared across all races — occupational names)
// ============================================================

export const SURNAMES = [
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
  'Blackstone','Brightheart','Crowley','Deepwood','Emberglow','Farrow','Grimshaw','Highcastle',
  'Ironforge','Kettleblack','Longwater','Mosswood','Nightshade','Oakbottom','Proudmane','Ravenscroft',
  'Shadowmere','Thornwall','Undergrowth','Weathertop','Winterbourne','Stonebrow','Firebrand','Silvervein',
  'Coalridge','Dustwalker','Bramblewood','Clearwater','Amberhill','Goleli','Starfall','Willowmere',
]

// ============================================================
// ROLE DEFINITIONS
// ============================================================

export const ROLES = [
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
// COMBAT STATS (base values per role)
// ============================================================

export const COMBAT_STATS = {
  Knight:     { maxHp: 50, attack: 8, defense: 6 },
  Guard:      { maxHp: 40, attack: 6, defense: 5 },
  Soldier:    { maxHp: 45, attack: 7, defense: 4 },
  Merchant:   { maxHp: 20, attack: 3, defense: 2 },
  Blacksmith: { maxHp: 30, attack: 5, defense: 3 },
  Baker:      { maxHp: 18, attack: 2, defense: 1 },
  Priest:     { maxHp: 22, attack: 2, defense: 2 },
  Noble:      { maxHp: 25, attack: 3, defense: 3 },
  Beggar:     { maxHp: 15, attack: 2, defense: 1 },
  Bard:       { maxHp: 20, attack: 3, defense: 2 },
  Thief:      { maxHp: 25, attack: 5, defense: 2 },
  Farmer:     { maxHp: 22, attack: 3, defense: 2 },
  Scholar:    { maxHp: 18, attack: 1, defense: 1 },
  Healer:     { maxHp: 20, attack: 2, defense: 2 },
  Innkeeper:  { maxHp: 25, attack: 3, defense: 2 },
  Fishmonger: { maxHp: 20, attack: 3, defense: 1 },
  Mason:      { maxHp: 28, attack: 4, defense: 3 },
  Courier:    { maxHp: 20, attack: 3, defense: 1 },
  Servant:    { maxHp: 18, attack: 2, defense: 1 },
  Witch:      { maxHp: 22, attack: 4, defense: 2 },
}

// ============================================================
// EQUIPMENT TABLES (per role)
// ============================================================

export const EQUIPMENT_TABLES = {
  Knight:     { weapon: { name: 'Longsword', attackBonus: 7 }, armor: { name: 'Plate Armor', defenseBonus: 6 }, shield: { name: 'Kite Shield', defenseBonus: 3 } },
  Guard:      { weapon: { name: 'Spear', attackBonus: 4 }, armor: { name: 'Chainmail', defenseBonus: 4 }, shield: { name: 'Round Shield', defenseBonus: 2 } },
  Soldier:    { weapon: { name: 'Short Sword', attackBonus: 5 }, armor: { name: 'Brigandine', defenseBonus: 3 }, shield: { name: 'Buckler', defenseBonus: 1 } },
  Merchant:   { weapon: { name: 'Dagger', attackBonus: 2 }, armor: null, shield: null },
  Blacksmith: { weapon: { name: 'Hammer', attackBonus: 4 }, armor: { name: 'Leather Apron', defenseBonus: 1 }, shield: null },
  Baker:      { weapon: null, armor: null, shield: null },
  Priest:     { weapon: { name: 'Staff', attackBonus: 1 }, armor: { name: 'Robes', defenseBonus: 1 }, shield: null },
  Noble:      { weapon: { name: 'Rapier', attackBonus: 3 }, armor: { name: 'Fine Doublet', defenseBonus: 1 }, shield: null },
  Beggar:     { weapon: null, armor: null, shield: null },
  Bard:       { weapon: { name: 'Dagger', attackBonus: 2 }, armor: null, shield: null },
  Thief:      { weapon: { name: 'Stiletto', attackBonus: 4 }, armor: { name: 'Dark Leathers', defenseBonus: 2 }, shield: null },
  Farmer:     { weapon: { name: 'Pitchfork', attackBonus: 2 }, armor: null, shield: null },
  Scholar:    { weapon: null, armor: null, shield: null },
  Healer:     { weapon: { name: 'Herb Knife', attackBonus: 1 }, armor: null, shield: null },
  Innkeeper:  { weapon: { name: 'Cudgel', attackBonus: 2 }, armor: null, shield: null },
  Fishmonger: { weapon: { name: 'Fillet Knife', attackBonus: 2 }, armor: null, shield: null },
  Mason:      { weapon: { name: 'Mallet', attackBonus: 3 }, armor: { name: 'Work Leather', defenseBonus: 1 }, shield: null },
  Courier:    { weapon: { name: 'Short Knife', attackBonus: 1 }, armor: null, shield: null },
  Servant:    { weapon: null, armor: null, shield: null },
  Witch:      { weapon: { name: 'Ritual Dagger', attackBonus: 3 }, armor: null, shield: null },
}

// ============================================================
// PERSONALITY BASE VALUES (per role, 0.0 - 1.0)
// ============================================================

export const PERSONALITY_BASES = {
  Knight:     { bravery: 0.85, sociability: 0.40, aggression: 0.50, greed: 0.10, loyalty: 0.90 },
  Guard:      { bravery: 0.75, sociability: 0.35, aggression: 0.45, greed: 0.20, loyalty: 0.80 },
  Soldier:    { bravery: 0.80, sociability: 0.30, aggression: 0.55, greed: 0.15, loyalty: 0.85 },
  Merchant:   { bravery: 0.25, sociability: 0.75, aggression: 0.10, greed: 0.80, loyalty: 0.40 },
  Blacksmith: { bravery: 0.50, sociability: 0.45, aggression: 0.30, greed: 0.40, loyalty: 0.55 },
  Baker:      { bravery: 0.20, sociability: 0.70, aggression: 0.15, greed: 0.30, loyalty: 0.50 },
  Priest:     { bravery: 0.40, sociability: 0.65, aggression: 0.05, greed: 0.10, loyalty: 0.70 },
  Noble:      { bravery: 0.35, sociability: 0.50, aggression: 0.30, greed: 0.75, loyalty: 0.45 },
  Beggar:     { bravery: 0.15, sociability: 0.60, aggression: 0.20, greed: 0.70, loyalty: 0.30 },
  Bard:       { bravery: 0.30, sociability: 0.90, aggression: 0.10, greed: 0.35, loyalty: 0.50 },
  Thief:      { bravery: 0.60, sociability: 0.50, aggression: 0.65, greed: 0.85, loyalty: 0.40 },
  Farmer:     { bravery: 0.35, sociability: 0.55, aggression: 0.20, greed: 0.30, loyalty: 0.60 },
  Scholar:    { bravery: 0.20, sociability: 0.50, aggression: 0.05, greed: 0.20, loyalty: 0.50 },
  Healer:     { bravery: 0.45, sociability: 0.70, aggression: 0.05, greed: 0.15, loyalty: 0.65 },
  Innkeeper:  { bravery: 0.35, sociability: 0.80, aggression: 0.20, greed: 0.50, loyalty: 0.50 },
  Fishmonger: { bravery: 0.30, sociability: 0.60, aggression: 0.15, greed: 0.45, loyalty: 0.45 },
  Mason:      { bravery: 0.45, sociability: 0.40, aggression: 0.25, greed: 0.35, loyalty: 0.60 },
  Courier:    { bravery: 0.40, sociability: 0.55, aggression: 0.15, greed: 0.30, loyalty: 0.50 },
  Servant:    { bravery: 0.20, sociability: 0.45, aggression: 0.10, greed: 0.25, loyalty: 0.70 },
  Witch:      { bravery: 0.55, sociability: 0.35, aggression: 0.40, greed: 0.50, loyalty: 0.30 },
}

// ============================================================
// ROLE AGE RANGES
// ============================================================

export const ROLE_AGE_RANGES = {
  Knight: [22, 45], Guard: [20, 50], Soldier: [18, 40], Merchant: [25, 60],
  Blacksmith: [22, 55], Baker: [18, 60], Priest: [25, 70], Noble: [16, 65],
  Beggar: [12, 75], Bard: [16, 50], Thief: [14, 45], Farmer: [16, 60],
  Scholar: [20, 70], Healer: [22, 65], Innkeeper: [25, 60], Fishmonger: [18, 55],
  Mason: [20, 55], Courier: [14, 35], Servant: [14, 55], Witch: [20, 70],
}

// ============================================================
// DIALOG POOLS (~10 per role)
// ============================================================

export const DIALOG = {
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

export const ROUTE_OFFSETS = [
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
// BACKSTORY TEMPLATES (per role, {name} and {race} are substituted)
// ============================================================

export const BACKSTORY_TEMPLATES = {
  Guard:      ['Served the city watch faithfully for years.', 'A former soldier who found peace on the walls.', 'Took the post to feed a growing family.', 'Rose from a street urchin to a trusted guard.', 'Transferred here after trouble in another city.'],
  Merchant:   ['Built a trading business from nothing.', 'Inherited the family stall and doubled its profits.', 'Traveled far before settling in Stonehaven.', 'Dreams of opening shops in every district.', 'Once lost everything to bandits and started over.'],
  Blacksmith: ['Apprenticed under a master smith since childhood.', 'The forge runs in the family blood.', 'Crafted weapons for the royal army.', 'Seeks to forge a legendary blade.', 'Left the mountains to ply the trade in the city.'],
  Baker:      ['Learned the art from a grandmother\'s recipes.', 'Wakes before dawn without complaint.', 'Supplies bread to the temple and barracks alike.', 'Once fed an army during a siege.', 'Dreams of opening the finest bakery in the realm.'],
  Priest:     ['Devoted to the faith since a miraculous recovery.', 'Studies ancient religious texts in solitude.', 'Tends to the spiritual needs of the poor.', 'Once doubted, now believes with unshakable conviction.', 'Travels between temples spreading the word.'],
  Noble:      ['Born into privilege and political intrigue.', 'Manages vast family estates beyond the walls.', 'Schemes constantly to increase family influence.', 'Patron of the arts and local charities.', 'Secretly yearns for a simpler life.'],
  Beggar:     ['Lost everything in a fire years ago.', 'A veteran abandoned by the crown.', 'Fled servitude and found only poverty.', 'Knows the city\'s secrets better than any noble.', 'Waits for a chance to rebuild.'],
  Bard:       ['Trained in the courts of distant kingdoms.', 'Collects stories from every traveler.', 'Composes ballads that bring crowds to tears.', 'Wanders from city to city, never settling.', 'Hides a sharp mind behind cheerful songs.'],
  Thief:      ['Grew up on the streets with no other choice.', 'A former guild member who went independent.', 'Steals only from those who deserve it — mostly.', 'Has contacts in every district.', 'Plans one big score to retire on.'],
  Farmer:     ['Works land passed down through generations.', 'Travels to market regularly to sell produce.', 'Worries about the weather more than anything.', 'Simple life, honest work.', 'Dreams of buying more land outside the walls.'],
  Scholar:    ['Devoted a lifetime to studying ancient texts.', 'Corresponds with academics across the realm.', 'Seeks knowledge that others fear to uncover.', 'Teaches the children of nobles and commoners alike.', 'Working on a comprehensive history of Stonehaven.'],
  Healer:     ['Trained in herbal medicine at the temple.', 'Saved lives during the last plague.', 'Gathers rare herbs from dangerous places.', 'Believes healing is a sacred duty.', 'Runs a small clinic for those who cannot pay.'],
  Soldier:    ['Enlisted young and never looked back.', 'Survived three border campaigns.', 'Follows orders without question.', 'Trains harder than anyone in the barracks.', 'Hopes to earn a promotion this year.'],
  Innkeeper:  ['Bought the tavern with years of savings.', 'Knows every regular by name and drink.', 'Hears more secrets than the spymaster.', 'Keeps the peace with a firm hand and a ready smile.', 'The tavern is home, and everyone is welcome.'],
  Fishmonger: ['Up before dawn at the river every day.', 'Knows every fishing spot for miles.', 'The freshest catch in all of Stonehaven.', 'Inherited the stall from a beloved parent.', 'Salts and smokes fish through the winter months.'],
  Mason:      ['Built half the buildings in this district.', 'Learned stonemasonry from dwarven craftsmen.', 'Takes immense pride in solid foundations.', 'Repaired the city walls after the last siege.', 'Every stone placed with care and precision.'],
  Courier:    ['The fastest feet in Stonehaven.', 'Knows every shortcut and back alley.', 'Delivers messages for the guild and nobility.', 'Discretion is the most valuable skill.', 'Dreams of traveling beyond the city walls someday.'],
  Servant:    ['Has served the household since childhood.', 'Loyal to the family above all else.', 'Knows every secret passage in the manor.', 'Saves every coin toward a future trade.', 'Quiet efficiency is a point of pride.'],
  Knight:     ['Earned the title through battlefield valor.', 'Sworn to protect the weak and uphold justice.', 'Carries the weight of duty without complaint.', 'Trains squires in the art of combat.', 'Veteran of many campaigns, scarred but unbowed.'],
  Witch:      ['Practices the old arts in defiance of the mainstream.', 'Knows remedies the healers have forgotten.', 'Reads the future in stars and bones.', 'Tolerated for useful potions, feared for the rest.', 'Lives on the fringe by choice, not circumstance.'],
}

// ============================================================
// MEMORY-BASED DIALOG PREFIXES
// ============================================================

export const MEMORY_DIALOG = {
  witnessed_death: [
    'I just saw someone killed nearby... horrible.',
    'There was a death not far from here. Be careful.',
    'Blood was spilled today. This city grows darker.',
  ],
  attacked_by: [
    'I was attacked recently! Watch yourself around here.',
    'Some wretch tried to kill me not long ago!',
    'These streets are not safe. I was assaulted earlier.',
  ],
  conversation: [
    'I had a pleasant chat with someone not long ago.',
    'Good to see friendly faces in these times.',
  ],
  killed: [
    'I... had to defend myself earlier. It was them or me.',
    'Blood on my hands today. It was necessary.',
  ],
}
