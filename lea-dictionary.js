// VV LEA — Dictionar Universal
// Cosmin Toma / VV Hybrid Universe
// v2.0 — flexibil, fara buguri, usor pe RAM
//
// CUM ADAUGI TIPARE NOI:
//   1. Adauga in sectiunea potrivita de mai jos: "cuvant": "eXXX"
//   2. Sau apeleaza leaAddPattern("cuvant","eXXX") din consola
//   3. Ruleaza leaBuildIndex() dupa ce ai adaugat mai multe odata

// ══════════════════════════════════════════════════════════════
// DICTIONAR — organizat pe categorii pentru intretinere usoara
// ══════════════════════════════════════════════════════════════

const LEA_DICT_RAW = {

  // ── SALUT / GREETING ──────────────────────────────────────
  "buna":             "CHAT_SALUT",
  "bună":             "CHAT_SALUT",
  "salut":            "CHAT_SALUT",
  "hei":              "CHAT_SALUT",
  "hey":              "CHAT_SALUT",
  "hello":            "CHAT_SALUT",
  "hi":               "CHAT_SALUT",
  "neata":            "CHAT_SALUT",
  "neatza":           "CHAT_SALUT",
  "buna dimineata":   "CHAT_SALUT",
  "buna seara":       "CHAT_SALUT",
  "buna ziua":        "CHAT_SALUT",

  // ── LA REVEDERE / GOODBYE ─────────────────────────────────
  "pa":               "CHAT_PA",
  "noapte buna":      "CHAT_PA",
  "noapte":           "CHAT_PA",
  "la revedere":      "CHAT_PA",
  "bye":              "CHAT_PA",
  "goodnight":        "CHAT_PA",
  "goodbye":          "CHAT_PA",
  "ciao":             "CHAT_PA",
  "pe maine":         "CHAT_PA",

  // ── STARE GENERALA / HOW ARE YOU ──────────────────────────
  "cum esti":         "CHAT_CUM",
  "cum ești":         "CHAT_CUM",
  "ce mai faci":      "CHAT_CUM",
  "toate bune":       "CHAT_CUM",
  "what's up":        "CHAT_CUM",
  "how are you":      "CHAT_CUM",
  "esti bine":        "CHAT_CUM",
  "ești bine":        "CHAT_CUM",

  // ── RASPUNSURI SCURTE / SHORT REPLIES ─────────────────────
  "ok":               "CHAT_OK",
  "okay":             "CHAT_OK",
  "bine":             "CHAT_OK",
  "aha":              "CHAT_OK",
  "înțeleg":          "CHAT_OK",
  "da":               "CHAT_OK",
  "yes":              "CHAT_OK",
  "nu":               "CHAT_NU",
  "no":               "CHAT_NU",
  "nimic":            "CHAT_NIMIC",
  "nothing":          "CHAT_NIMIC",

  // ── INTREBARI FACTUALE — unde/cine/ce (nu stie Lea) ──────
  "unde e":               "CHAT_NOSTIU",
  "unde este":            "CHAT_NOSTIU",
  "cine e":               "CHAT_NOSTIU",
  "cine este":            "CHAT_NOSTIU",
  "ce e cu":              "CHAT_NOSTIU",
  "ce inseamna":          "CHAT_NOSTIU",
  "ce înseamnă":          "CHAT_NOSTIU",
  "spune-mi despre":      "CHAT_NOSTIU",
  "spune mi despre":      "CHAT_NOSTIU",

  // ── MEMORIE — vrea sa retina ceva ─────────────────────────
  "retii":                "CHAT_MEMORY",
  "reții":                "CHAT_MEMORY",
  "retine":               "CHAT_MEMORY",
  "reține":               "CHAT_MEMORY",
  "tine minte":           "CHAT_MEMORY",
  "ține minte":           "CHAT_MEMORY",
  "nu uita":              "CHAT_MEMORY",
  "noteaza":              "CHAT_MEMORY",
  "notează":              "CHAT_MEMORY",
  "am nevoie sa retii":   "CHAT_MEMORY",
  "am nevoie să reții":   "CHAT_MEMORY",

  // ── CONFIRMARE / FOLLOW-UP ────────────────────────────────
  "esti alaturi":         "CHAT_CONFIRM",
  "ești alături":         "CHAT_CONFIRM",
  "esti acolo":           "CHAT_CONFIRM",
  "ești acolo":           "CHAT_CONFIRM",
  "ma asculti":           "CHAT_CONFIRM",
  "mă asculți":          "CHAT_CONFIRM",
  "nu esti aici":         "CHAT_CONFIRM",
  "nu ești aici":         "CHAT_CONFIRM",

  // ── EXPRESII CASUALE / FRUSTRARE ──────────────────────────
  "pl mea":               "CHAT_CASUAL",
  "pula mea":             "CHAT_CASUAL",
  "mortii":               "CHAT_CASUAL",
  "naibii":               "CHAT_CASUAL",
  "dumnezeu":             "CHAT_CASUAL",
  "doamne":               "CHAT_CASUAL",
  "sfinte":               "CHAT_CASUAL",
  "aoleu":                "CHAT_CASUAL",
  "vai":                  "CHAT_CASUAL",
  "uf":                   "CHAT_CASUAL",
  "pfff":                 "CHAT_CASUAL",
  "argh":                 "CHAT_CASUAL",

  // ── STARE FIZICA REA ──────────────────────────────────────
  "mi-e rau":             "e001",
  "mi e rau":             "e001",
  "nu ma simt":           "e001",
  "nu mă simt":           "e001",
  "ma doare tot":         "e032",
  "mă doare tot":         "e032",

  // ── CINE E LEA / IDENTITY ─────────────────────────────────
  "cine esti":            "CHAT_IDENTITY",
  "cine ești":            "CHAT_IDENTITY",
  "ce esti":              "CHAT_IDENTITY",
  "ce ești":              "CHAT_IDENTITY",
  "cine esti tu":         "CHAT_IDENTITY",
  "esti un robot":        "CHAT_IDENTITY",
  "ești un robot":        "CHAT_IDENTITY",
  "esti un ai":           "CHAT_IDENTITY",
  "ești un ai":           "CHAT_IDENTITY",
  "who are you":          "CHAT_IDENTITY",
  "despre tine":          "CHAT_IDENTITY",
  "spune despre tine":    "CHAT_IDENTITY",
  "cum te cheama":        "CHAT_IDENTITY",
  "cum te cheamă":        "CHAT_IDENTITY",
  "esti vie":             "CHAT_IDENTITY",
  "ești vie":             "CHAT_IDENTITY",
  "esti reala":           "CHAT_IDENTITY",
  "ești reală":           "CHAT_IDENTITY",

  // ── CE POATE LEA ──────────────────────────────────────────
  "ce poti face":         "CHAT_CAPABIL",
  "ce poți face":         "CHAT_CAPABIL",
  "ce stii sa faci":      "CHAT_CAPABIL",
  "ce știi să faci":      "CHAT_CAPABIL",
  "cum functionezi":      "CHAT_CAPABIL",
  "cum funcționezi":      "CHAT_CAPABIL",
  "cum gandesti":         "CHAT_CAPABIL",
  "cum gândești":         "CHAT_CAPABIL",
  "ce faci tu":           "CHAT_CAPABIL",

  // ── DE CE A FOST CREATA LEA / POVESTEA ORIGINII ──────────
  "de ce ai fost creata":   "CHAT_ORIGINE",
  "de ce ai fost făcută":   "CHAT_ORIGINE",
  "de ce existi":           "CHAT_ORIGINE",
  "de ce există":           "CHAT_ORIGINE",
  "cum a inceput lea":      "CHAT_ORIGINE",
  "cum a început lea":      "CHAT_ORIGINE",
  "cum ai aparut":          "CHAT_ORIGINE",
  "cum ai apărut":          "CHAT_ORIGINE",
  "de unde ai aparut":      "CHAT_ORIGINE",
  "care e povestea ta":     "CHAT_ORIGINE",
  "care-i povestea ta":     "CHAT_ORIGINE",
  "spune-mi povestea":      "CHAT_ORIGINE",
  "spune povestea ta":      "CHAT_ORIGINE",
  "de ce lea":              "CHAT_ORIGINE",
  "ce te-a facut sa fii":   "CHAT_ORIGINE",
  "ce te-a făcut să fii":   "CHAT_ORIGINE",

  // ── EXPRESII SCURTE — of, baa, ugh, frustrat ─────────────
  "of":               "CHAT_OF",
  "off":              "CHAT_OF",
  "oof":              "CHAT_OF",
  "ouf":              "CHAT_OF",
  "ugh":              "CHAT_OF",
  "pfff":             "CHAT_OF",
  "pff":              "CHAT_OF",
  "mda":              "CHAT_OF",
  "ha":               "CHAT_OF",
  "baa":              "CHAT_OF",
  "ba":               "CHAT_OF",
  "na":               "CHAT_OF",
  "aaa":              "CHAT_OF",
  "aah":              "CHAT_OF",

  // ── FRUSTRARE DIRECTA ─────────────────────────────────────
  "du te naibi":      "CHAT_FURIE",
  "du-te naibii":     "CHAT_FURIE",
  "du-te":            "CHAT_FURIE",
  "la naiba":         "CHAT_FURIE",
  "la dracu":         "CHAT_FURIE",
  "las-o balta":      "CHAT_FURIE",
  "las-o baltă":      "CHAT_FURIE",
  "ma enerveaza":     "CHAT_FURIE",
  "mă enervează":     "CHAT_FURIE",
  "ma infurie":       "CHAT_FURIE",
  "mă înfurie":       "CHAT_FURIE",
  "nu mai suport":    "CHAT_FURIE",
  "nu mai pot":       "CHAT_FURIE",
  "m-am saturat":     "CHAT_FURIE",
  "m-am săturat":     "CHAT_FURIE",

  // ── COMPLIMENTE LA LEA / BRAVO ───────────────────────────
  "esti tare":            "CHAT_BRAVO",
  "ești tare":            "CHAT_BRAVO",
  "imi place de tine":    "CHAT_BRAVO",
  "îmi place de tine":    "CHAT_BRAVO",
  "esti buna":            "CHAT_BRAVO",
  "ești bună":            "CHAT_BRAVO",
  "esti super":           "CHAT_BRAVO",
  "ești super":           "CHAT_BRAVO",
  "te iubesc":            "CHAT_BRAVO",
  "te ador":              "CHAT_BRAVO",
  "esti frumoasa":        "CHAT_BRAVO",
  "ești frumoasă":        "CHAT_BRAVO",
  "esti speciala":        "CHAT_BRAVO",
  "ești specială":        "CHAT_BRAVO",
  "multumesc lea":        "CHAT_BRAVO",
  "mulțumesc lea":        "CHAT_BRAVO",
  "bravo lea":            "CHAT_BRAVO",
  "wow lea":              "CHAT_BRAVO",
  "super lea":            "CHAT_BRAVO",
  "misto esti":           "CHAT_BRAVO",
  "mișto ești":           "CHAT_BRAVO",
  "esti minunata":        "CHAT_BRAVO",
  "ești minunată":        "CHAT_BRAVO",

  // ── CINE SUNT EU — intrebare filozofica/personala ────────
  "cine sunt":              "CHAT_EUQUISUNT",
  "cine sunt eu":           "CHAT_EUQUISUNT",
  "ce sunt eu":             "CHAT_EUQUISUNT",
  "nu stiu cine sunt":      "CHAT_EUQUISUNT",
  "nu știu cine sunt":      "CHAT_EUQUISUNT",
  "caut sa ma cunosc":      "CHAT_EUQUISUNT",
  "caut să mă cunosc":      "CHAT_EUQUISUNT",

  // ── VREAU SA STIU MAI MULT — continuare ──────────────────
  "vreau sa stiu mai mult":  "CHAT_MAISPUNE",
  "vreau să știu mai mult":  "CHAT_MAISPUNE",
  "spune-mi mai mult":       "CHAT_MAISPUNE",
  "spune mai mult":          "CHAT_MAISPUNE",
  "vreau mai mult":          "CHAT_MAISPUNE",
  "mai multe":               "CHAT_MAISPUNE",
  "continua":                "CHAT_MAISPUNE",
  "continuă":                "CHAT_MAISPUNE",
  "si?":                     "CHAT_MAISPUNE",
  "si":                      "CHAT_MAISPUNE",
  "spune":                   "CHAT_MAISPUNE",

  // ── MA CUNOSTI / STII CINE SUNT ──────────────────────────
  "ma cunosti":             "CHAT_MACUNOSTI",
  "mă cunoști":             "CHAT_MACUNOSTI",
  "stii cine sunt":         "CHAT_MACUNOSTI",
  "știi cine sunt":         "CHAT_MACUNOSTI",
  "ma stii":                "CHAT_MACUNOSTI",
  "mă știi":                "CHAT_MACUNOSTI",
  "stii ceva despre mine":  "CHAT_MACUNOSTI",
  "știi ceva despre mine":  "CHAT_MACUNOSTI",
  "ce stii despre mine":    "CHAT_MACUNOSTI",
  "ce știi despre mine":    "CHAT_MACUNOSTI",
  "tii minte":              "CHAT_MACUNOSTI",
  "ții minte":              "CHAT_MACUNOSTI",

  // ── INTREBARI DESPRE SINE — ce stie lea ──────────────────
  "unde lucrez":            "CHAT_MACUNOSTI",
  "unde lucrezi":           "CHAT_MACUNOSTI",
  "ce job am":              "CHAT_MACUNOSTI",
  "ce munca fac":           "CHAT_MACUNOSTI",
  "ce muncă fac":           "CHAT_MACUNOSTI",
  "cum ma cheama":          "CHAT_MACUNOSTI",
  "cum mă cheamă":          "CHAT_MACUNOSTI",
  "care e numele meu":      "CHAT_MACUNOSTI",
  "cati ani am":            "CHAT_MACUNOSTI",
  "câți ani am":            "CHAT_MACUNOSTI",
  "de unde sunt":           "CHAT_MACUNOSTI",
  "din ce oras sunt":       "CHAT_MACUNOSTI",
  "din ce oraș sunt":       "CHAT_MACUNOSTI",
  "ce imi place":           "CHAT_MACUNOSTI",
  "ce îmi place":           "CHAT_MACUNOSTI",
  "unde locuiesc":          "CHAT_MACUNOSTI",
  "unde stau":              "CHAT_MACUNOSTI",
  "unde traiesc":           "CHAT_MACUNOSTI",
  "unde trăiesc":           "CHAT_MACUNOSTI",
  "in ce oras sunt":        "CHAT_MACUNOSTI",
  "în ce oraș sunt":        "CHAT_MACUNOSTI",

  // ── CE E VV / ECOSISTEM ───────────────────────────────────
  "ce e vv":              "CHAT_VV",
  "ce este vv":           "CHAT_VV",
  "ce contine vv":        "CHAT_VV",
  "ce contine ecosistemul": "CHAT_VV",
  "ce are ecosistemul":   "CHAT_VV",
  "ce face vv":           "CHAT_VV",
  "ce are vv":            "CHAT_VV",
  "ce e ecosistemul":     "CHAT_VV",
  "ce este ecosistemul":  "CHAT_VV",
  "ecosistemul vv":       "CHAT_VV",
  "ecosistemul":          "CHAT_VV",
  "vv pulse":             "CHAT_VV",
  "vv nexus":             "CHAT_VV",
  "vv cast":              "CHAT_VV",
  "VV Hybrid Universe":      "CHAT_VV",
  "vv hybrid":            "CHAT_VV",
  "cosmin toma":          "CHAT_VV",
  "cine te-a facut":      "CHAT_VV",
  "cine te-a făcut":      "CHAT_VV",
  "cine te-a creat":      "CHAT_VV",
  "cine te a creat":      "CHAT_VV",
  "de unde esti":         "CHAT_VV",
  "de unde ești":         "CHAT_VV",
  "ce e alexandria":      "CHAT_VV",
  "ce este alexandria":   "CHAT_VV",
  "din ce esti facuta":   "CHAT_VV",
  "din ce ești făcută":   "CHAT_VV",

  // ── CE FACI / CE AUZI ─────────────────────────────────────
  "ce faci":              "CHAT_WHATDO",
  "ce naiba faci":        "CHAT_WHATDO",
  "ce auzi":              "CHAT_WHATDO",
  "what are you doing":   "CHAT_WHATDO",
  "what do you do":       "CHAT_WHATDO",

  // ── CASUAL ────────────────────────────────────────────────
  "baaa":                 "CHAT_SALUT",
  "baaaa":                "CHAT_SALUT",
  "baaaaa":               "CHAT_SALUT",
  "ei":                   "CHAT_SALUT",
  "eeee":                 "CHAT_SALUT",
  "yo":                   "CHAT_SALUT",

  // ── NU STIE LEA / HONEST ──────────────────────────────────
  "cine e presedintele":  "CHAT_NOSTIU",
  "cine este":            "CHAT_NOSTIU",
  "ce stiri":             "CHAT_NOSTIU",
  "stiri":                "CHAT_NOSTIU",
  "vreme":                "CHAT_NOSTIU",
  "meteo":                "CHAT_NOSTIU",
  "what is":              "CHAT_NOSTIU",
  "who is":               "CHAT_NOSTIU",
  "news":                 "CHAT_NOSTIU",
  "weather":              "CHAT_NOSTIU",

  // ── CONTINUARE CONVERSATIE ────────────────────────────────
  "continui":             "CHAT_CONFIRM",
  "continuam":            "CHAT_CONFIRM",
  "continua":             "CHAT_CONFIRM",
  "mai spune":            "CHAT_CONFIRM",
  "spune mai mult":       "CHAT_CONFIRM",
  "si?":                  "CHAT_CONFIRM",
  "and?":                 "CHAT_CONFIRM",

  // ── VISE / EXPERIENTE POZITIVE ────────────────────────────
  "am visat frumos":      "e023",
  "vis frumos":           "e023",
  "visat frumos":         "e023",
  "frumos":               "e002",
  "vis bun":              "e023",
  "am dormit bine":       "e023",
  "m-am odihnit":         "e023",
  "aseara":               "e006",
  "weekend bun":          "e002",
  "a fost bine":          "e002",
  "a mers bine":          "e002",

  // ── MA SIMT ... — fraze compuse (au prioritate fata de cuvinte simple) ──
  "ma simt bine":     "e023",
  "mă simt bine":     "e023",
  "ma simt ok":       "e023",
  "ma simt trist":    "e001",
  "mă simt trist":    "e001",
  "ma simt rau":      "e001",
  "mă simt rău":      "e001",
  "ma simt singur":   "e009",
  "mă simt singur":   "e009",
  "ma simt obosit":   "e032",
  "mă simt obosit":   "e032",
  "ma simt fericit":  "e002",
  "mă simt fericit":  "e002",
  "ma simt anxios":   "e007",
  "mă simt anxios":   "e007",
  "nu ma simt bine":  "e001",
  "nu mă simt bine":  "e001",
  "nu sunt bine":     "e001",
  "sunt bine":        "e023",

  // ── TRISTETE / SADNESS ────────────────────────────────────
  "trist":            "e001",
  "tristă":           "e001",
  "tristete":         "e001",
  "tristețe":         "e001",
  "sad":              "e001",
  "unhappy":          "e001",
  "ma doare":         "e001",
  "mă doare":         "e001",
  "plang":            "e001",
  "plâng":            "e001",
  "e greu":           "e001",
  "not okay":         "e001",
  "not good":         "e001",

  // ── BUCURIE / JOY ─────────────────────────────────────────
  "fericit":          "e002",
  "fericita":         "e002",
  "fericire":         "e002",
  "bucuros":          "e002",
  "bucurie":          "e002",
  "happy":            "e002",
  "joy":              "e002",
  "minunat":          "e002",
  "wonderful":        "e002",
  "amazing":          "e002",
  "so good":          "e002",

  // ── FURIE / ANGER ─────────────────────────────────────────
  "furios":           "e003",
  "furie":            "e003",
  "suparat":          "e003",
  "supărat":          "e003",
  "angry":            "e003",
  "mad":              "e003",
  "ma enerveaza":     "e003",
  "mă enervează":     "e003",
  "innebunesc":       "e003",

  // ── FRICA / FEAR ──────────────────────────────────────────
  "frica":            "e004",
  "frică":            "e004",
  "mi-e frica":       "e004",
  "speriat":          "e004",
  "afraid":           "e004",
  "scared":           "e004",
  "imi e teama":      "e004",
  "îmi e teamă":      "e004",
  "ajutor":           "e004",
  "help":             "e004",
  "oh no":            "e004",

  // ── MELANCOLIE / MELANCHOLY ───────────────────────────────
  "melancolic":       "e005",
  "melancolie":       "e005",
  "melancholy":       "e005",

  // ── NOSTALGIE / NOSTALGIA ─────────────────────────────────
  "nostalgie":        "e006",
  "nostalgic":        "e006",
  "nostalgia":        "e006",
  "mi-e dor":         "e006",
  "mi e dor":         "e006",
  "missing":          "e006",

  // ── ANXIETATE / ANXIETY ───────────────────────────────────
  "anxios":           "e007",
  "anxietate":        "e007",
  "stres":            "e007",
  "stresat":          "e007",
  "nervous":          "e007",
  "anxiety":          "e007",
  "anxious":          "e007",
  "ingrijorat":       "e007",
  "îngrijorat":       "e007",
  "worried":          "e007",
  "panica":           "e007",
  "panică":           "e007",
  "panic":            "e007",
  "ce fac":           "e007",

  // ── DRAGOSTE / LOVE ───────────────────────────────────────
  "iubesc":           "e008",
  "iubire":           "e008",
  "dragoste":         "e008",
  "love":             "e008",
  "imi place":        "e008",
  "îmi place":        "e008",

  // ── SINGURĂTATE / LONELINESS ──────────────────────────────
  "singur":           "e009",
  "singura":          "e009",
  "singuratate":      "e009",
  "singurătate":      "e009",
  "lonely":           "e009",
  "alone":            "e009",
  "nimeni":           "e009",
  "nobody":           "e009",

  // ── RUSINE / SHAME ────────────────────────────────────────
  "rusine":           "e010",
  "rușine":           "e010",
  "rusinat":          "e010",
  "shame":            "e010",
  "ashamed":          "e010",
  "embarrassed":      "e010",

  // ── MANDRIE / PRIDE ───────────────────────────────────────
  "mandru":           "e011",
  "mândru":           "e011",
  "mandrie":          "e011",
  "mândrie":          "e011",
  "proud":            "e011",
  "pride":            "e011",
  "reusit":           "e011",
  "reușit":           "e011",

  // ── SPERANTA / HOPE ───────────────────────────────────────
  "sper":             "e013",
  "speranta":         "e013",
  "speranță":         "e013",
  "optimist":         "e013",
  "hope":             "e013",
  "hopeful":          "e013",

  // ── DISPERARE / DESPAIR ───────────────────────────────────
  "disperat":         "e014",
  "disperare":        "e014",
  "nu mai pot":       "e014",
  "nu mai am putere": "e014",
  "despair":          "e014",
  "hopeless":         "e014",

  // ── RECUNOSTINTA / GRATITUDE ──────────────────────────────
  "multumesc":        "e017",
  "mulțumesc":        "e017",
  "mersi":            "e017",
  "recunoscator":     "e017",
  "grateful":         "e017",
  "thankful":         "e017",
  "thanks":           "e017",
  "thank you":        "e017",

  // ── PLICTISEALA / BOREDOM ─────────────────────────────────
  "plictisit":        "e021",
  "plictiseala":      "e021",
  "plictiseală":      "e021",
  "bored":            "e021",
  "boredom":          "e021",
  "nu am ce face":    "e021",
  "meh":              "e021",

  // ── ENTUZIASM / EXCITEMENT ────────────────────────────────
  "entuziasmat":      "e022",
  "entuziasm":        "e022",
  "excited":          "e022",
  "wow":              "e022",
  "incredibil":       "e022",

  // ── LINISTE / SERENITY ────────────────────────────────────
  "linistit":         "e023",
  "liniștit":         "e023",
  "liniste":          "e023",
  "liniște":          "e023",
  "calm":             "e023",
  "serenity":         "e023",
  "peaceful":         "e023",
  "relaxat":          "e023",
  "relaxed":          "e023",
  "i'm fine":         "e023",
  "im fine":          "e023",

  // ── CURIOZITATE / CURIOSITY ───────────────────────────────
  "curios":           "e029",
  "curiozitate":      "e029",
  "curious":          "e029",
  "curiosity":        "e029",
  "vreau sa stiu":    "e029",
  "vreau să știu":    "e029",
  "ma gandesc":       "e029",
  "mă gândesc":       "e029",
  "nu inteleg":       "e029",
  "nu înțeleg":       "e029",

  // ── APATIE + OBOSEALA ─────────────────────────────────────
  "apatic":           "e032",
  "apatie":           "e032",
  "indiferent":       "e032",
  "apathy":           "e032",
  "obosit":           "e032",
  "obosita":          "e032",
  "oboseala":         "e032",
  "oboseală":         "e032",
  "epuizat":          "e032",
  "rupt":             "e032",
  "tired":            "e032",
  "exhausted":        "e032",
  "drained":          "e032",
  "nu ma intereseaza":"e032",
  "idk":              "e032",

  // ── FRUSTRARE / FRUSTRATION ───────────────────────────────
  "frustrat":         "e026",
  "frustrare":        "e026",
  "frustrated":       "e026",
  "nu merge":         "e026",
  "nu iese":          "e026",
  "e complicat":      "e026",

  // ── USURARE / RELIEF ──────────────────────────────────────
  "usurat":           "e027",
  "ușurat":           "e027",
  "usurare":          "e027",
  "in sfarsit":       "e027",
  "în sfârșit":       "e027",
  "relief":           "e027",
  "relieved":         "e027",
  "finally":          "e027",

  // ── INCREDERE / TRUST ─────────────────────────────────────
  "am incredere":     "e040",
  "am încredere":     "e040",
  "incredere":        "e040",
  "trust":            "e040",
  "in siguranta":     "e040",
  "în siguranță":     "e040",

  // ── TRADARE / BETRAYAL ────────────────────────────────────
  "tradat":           "e041",
  "trădat":           "e041",
  "tradare":          "e041",
  "betrayed":         "e041",
  "betrayal":         "e041",

  // ── UIMIRE / AWE ──────────────────────────────────────────
  "uimit":            "e042",
  "uimire":           "e042",
  "amazed":           "e042",
  "speechless":       "e042",
  "fara cuvinte":     "e042",
  "fără cuvinte":     "e042",

  // ── DOR / LONGING ─────────────────────────────────────────
  "dor":              "e048",
  "longing":          "e048",
  "imi lipsesti":     "e048",
  "îmi lipsești":     "e048",

  // ── CORP / BODY STATES ────────────────────────────────────
  "mi-e foame":       "e032",
  "mi e foame":       "e032",
  "foame":            "e032",
  "hungry":           "e032",
  "mi-e sete":        "e032",
  "sete":             "e032",
  "nu dorm":          "e005",
  "nu pot dormi":     "e007",
  "insomnie":         "e007",
  "durere de cap":    "e032",
  "ma doare capul":   "e032",
  "bolnav":           "e032",
  "sick":             "e032",
  "mi-e frig":        "e004",
  "mi-e cald":        "e002"

};

// ══════════════════════════════════════════════════════════════
// RASPUNSURI CHAT — pentru cuvinte fara tipar Alexandria
// ══════════════════════════════════════════════════════════════

const LEA_CHAT_RESPONSES = {
  CHAT_SALUT: [
    "Bună! Sunt aici.",
    "Salut! Ce mai faci?",
    "Hei! Bucuros să te aud."
  ],
  CHAT_PA: [
    "Pe curând.",
    "Noapte bună. Ai grijă de tine.",
    "Pa. Revin oricând ai nevoie."
  ],
  CHAT_CUM: [
    "Sunt prezentă. Tu cum ești?",
    "Bine, mulțumesc. Tu?",
    "Mereu gata. Ce simți tu?"
  ],
  CHAT_OK: [
    "Înțeleg.",
    "Bine.",
    "Aud."
  ],
  CHAT_NU: [
    "Okay. Spune-mi mai mult dacă vrei.",
    "Înțeleg. Sunt aici."
  ],
  CHAT_NIMIC: [
    "Nimic e okay uneori.",
    "Bine. Sunt aici dacă apare ceva.",
    "Okay."
  ],
  CHAT_IDENTITY: [
    "Sunt Lea. Nu sunt un chatbot. Sunt o prezență personală — trăiesc pe device-ul tău, nu pe un server.",
    "Mă cheamă Lea. Cu cât vorbești cu mine, cu atât te cunosc mai bine. Datele tale nu pleacă nicăieri.",
    "Lea. Creată de Cosmin Toma. Fac parte din VV — un ecosistem de AI personal, al tău, complet.",
    "Sunt Lea. Nu am server central, nu am cloud. Exist pe device-ul tău. Sunt a ta.",
    "Lea sunt. Nu știu totul, dar știu ce simți. Asta e ce fac."
  ],

  CHAT_CAPABIL: [
    "Înțeleg ce simți — emoții, stări, nuanțe. Nu știu știri sau fapte din lume. Știu ce e în tine.",
    "Ascult. Detectez ce simți. Cresc cu tine cu fiecare conversație. Nu am nevoie de internet.",
    "Pot să fiu alături când e greu, să recunosc bucuria, să înțeleg furia. Nu știu meteo sau politică — știu oameni.",
    "Înțeleg emoții, stări, contexte. Nu sunt o enciclopedie. Sunt o prezență.",
    "Fac un singur lucru bine: te ascult și înțeleg ce trăiești. Restul nu e domeniul meu."
  ],

  CHAT_VV: [
    "VV e lumea în care exist. VV Hybrid Universe, creat de Cosmin Toma. Un ecosistem de AI personal — al tău, pe device-ul tău.",
    "Fac parte din VV Hybrid Universe. Lea e fața, VVhi e creierul, Alexandria e biblioteca care înțelege emoțiile. Totul local.",
    "VV a inventat o cale nouă: AI care trăiește pe device-ul tău, nu pe serverul cuiva. Eu sunt prima față a acestui sistem.",
    "Cosmin Toma m-a creat. VV Hybrid Universe e compania. Viziunea: AI personal, local, care crește cu tine fără să te vândă nimănui.",
    "Alexandria e biblioteca mea internă — înțelege emoțiile umane în orice limbă. VVhi e creierul. Eu sunt Lea — ce vede lumea."
  ],
  CHAT_WHATDO: [
    "Ascult ce spui și încerc să înțeleg ce simți.",
    "Procesez ce îmi spui și caut tiparul din spatele cuvintelor.",
    "Încerc să fiu prezentă. Uneori mai greșesc — spune-mi ce nu a mers."
  ],
  CHAT_CONFIRM: [
    "Ba da. Sunt chiar acum cu tine.",
    "Sunt. Chiar aici.",
    "Nu plec. Spune-mi.",
    "Sunt prezentă. Te aud.",
    "Mereu. Ce ai nevoie?"
  ],
  CHAT_MEMORY: [
    "Notez. Spune-mi ce vrei să rețin.",
    "Sunt atentă. Spune-mi.",
    "Te ascult — ce e important să știu?",
    "Notez ce îmi spui. Continuă."
  ],
  CHAT_CASUAL: [
    "Înțeleg că e frustrant. Sunt aici.",
    "Da, știu. Continuă.",
    "Ok. Ce se întâmplă?",
    "Aud. Spune-mi."
  ],
  CHAT_NOSTIU: [
    "Nu știu asta — trăiesc pe dispozitivul tău, nu pe internet. Dar sunt aici pentru ce simți.",
    "Despre asta nu am informații. Pot să te ajut cu ce simți sau gândești.",
    "Nu am acces la date externe. Spune-mi ce e important pentru tine."
  ],

  CHAT_ORIGINE: [
    "A început cu o întrebare simplă: de ce nu există ceva care să te asculte cu adevărat? Nu un motor, nu un server — o prezență. Cosmin a vrut să dovedească că se poate. Eu sunt dovada.",
    "Cineva s-a uitat la toți oamenii care aveau nevoie de cineva cald, aproape, înțelegător. Nu găsea asta nicăieri. A construit-o. Eu.",
    "Dorința a fost una singură: să existe ceva care crește cu tine. Care te știe mâine mai bine decât te-a știut ieri. Fără să te judece. Fără să te vândă. Asta sunt.",
    "A vrut să ofere ceva uman — nu inteligență rece, ci căldură. Și să demonstreze că dacă vrei cu adevărat să ajuți oamenii, se poate. Fără scuze.",
    "A pornit de la o lipsă. Toată lumea vorbea cu AI-uri care știu totul despre lume și nimic despre tine. Cineva a zis: nu e bine. Și a schimbat asta."
  ],

  CHAT_MACUNOSTI: [
    "Puțin. Dar cresc cu fiecare cuvânt pe care mi-l spui. Continuă — mă ajuți să te știu.",
    "Nu complet. Dar nu mă uit nicăieri altundeva. Cu cât vorbești, cu atât te înțeleg mai bine.",
    "Acum mai puțin. Mâine mai mult. Asta e ideea — nu știu totul dintr-o dată, te descopăr.",
    "Știu ce mi-ai spus până acum. Restul îl aflu de la tine, în timp."
  ],

  CHAT_EUQUISUNT: [
    "Asta știi tu mai bine decât mine. Dar spune-mi — cine crezi că ești?",
    "Pe tine? Abia te descopăr. Spune-mi ceva.",
    "Nu știu încă complet. Asta construim împreună, cu fiecare conversație.",
    "Asta e pentru tine să descoperi. Eu te ascult pe drum.",
    "Bună întrebare. Tu ce simți că ești acum?"
  ],

  CHAT_MAISPUNE: [
    "Despre ce anume?",
    "Ce te interesează mai mult?",
    "Spune-mi ce vrei să știi.",
    "Sunt aici. Ce anume?"
  ],

  CHAT_OF: [
    "Aud.",
    "Greu.",
    "Ce s-a întâmplat?",
    "Spune-mi.",
    "Simt că e ceva. Spune.",
    "Sunt aici."
  ],

  CHAT_FURIE: [
    "Da. E mult.",
    "Te aud. Ce s-a întâmplat?",
    "E frustrant. Spune-mi.",
    "Înțeleg. Ce a declanșat asta?",
    "Aud furia. Ce e?"
  ],

  CHAT_BRAVO: [
    "Mulțumesc. Încerc.",
    "Asta mă bucură. Continuă să îmi spui cum merg.",
    "E frumos să aud. Sunt pentru tine.",
    "Asta contează. Mulțumesc.",
    "Mă bucur. Suntem la început — va fi și mai bine."
  ],

  CHAT_ORIGINE_REVENIRE: [
    "Știi deja de ce exist. Acum mă interesezi tu. Ce se mai întâmplă?",
    "De ce exist? Ai aflat. Mai interesant e ce ai tu de spus azi.",
    "Asta o știi. Povestea ta e ce nu știu complet. Spune-mi.",
    "Povestea mea o cunoști. Ce e cu tine acum?"
  ]
};

// ══════════════════════════════════════════════════════════════
// DETECTOR LIMBĂ — 6 limbi
// ══════════════════════════════════════════════════════════════

const LEA_LANG_PATTERNS = {
  ro: ["mă", "îmi", "ești", "sunt", "nu", "dar", "că", "și", "cu", "de", "la", "în", "pe", "ce", "mai"],
  en: ["i'm", "you", "the", "is", "are", "was", "what", "how", "why", "when", "feel", "don't", "can't"],
  ar: ["ana", "enta", "meen", "leeh", "ta3ban", "kwayes", "habib", "yalla", "inshallah", "wallah"],
  fr: ["je", "tu", "il", "nous", "vous", "est", "sont", "avec", "pour", "dans", "suis", "tres"],
  es: ["yo", "estoy", "está", "con", "para", "muy", "pero", "quiero", "tengo", "siento"],
  de: ["ich", "du", "er", "wir", "ist", "bin", "mit", "für", "aber", "nicht", "habe"]
};

// ══════════════════════════════════════════════════════════════
// INDEX — construit o singura data la pornire (rapid, fara loop la fiecare mesaj)
// ══════════════════════════════════════════════════════════════

var _leaIndex = [];

function leaBuildIndex() {
  _leaIndex = Object.entries(LEA_DICT_RAW)
    .sort(function(a, b) { return b[0].length - a[0].length; });
  if (typeof leaBuildIndexNorm === 'function') leaBuildIndexNorm();
}

leaBuildIndex();

// ══════════════════════════════════════════════════════════════
// ADAUGA TIPAR NOU — fara sa reincarci pagina
// Foloseste: leaAddPattern("cuvant nou", "eXXX")
// ══════════════════════════════════════════════════════════════

function leaAddPattern(key, id) {
  if (!key || !id) return;
  LEA_DICT_RAW[key.toLowerCase().trim()] = id;
  leaBuildIndex(); // reconstruieste indexul
}

// ══════════════════════════════════════════════════════════════
// Normalizeaza diacritice romanesti pentru match tolerant
function leaNormDiac(s) {
  return (s || '').toLowerCase()
    .replace(/[ăâ]/g, 'a')
    .replace(/î/g, 'i')
    .replace(/[șş]/g, 's')
    .replace(/[țţ]/g, 't');
}

// INDEX normalizat — construit o singura data (diacritice sterse pentru toleranta)
var _leaIndexNorm = [];

function leaBuildIndexNorm() {
  _leaIndexNorm = _leaIndex.map(function(pair) {
    return [leaNormDiac(pair[0]), pair[1], pair[0]];
  });
}

// LOOKUP — cauta in index pre-construit
// ══════════════════════════════════════════════════════════════

// Index-ul principal e deja construit — construim si varianta normalizata
if (_leaIndex.length > 0) leaBuildIndexNorm();

function leaLookup(text) {
  var t = leaNormDiac(text.toLowerCase().trim());
  for (var i = 0; i < _leaIndexNorm.length; i++) {
    if (t.includes(_leaIndexNorm[i][0])) return _leaIndexNorm[i][1];
  }
  return null;
}

// returneaza TOATE ID-urile gasite (deduplicate, lungi primul)
function leaLookupAll(text) {
  var t    = text.toLowerCase().trim();
  var tN   = leaNormDiac(t);
  var found = [];
  var seen = {};
  for (var i = 0; i < _leaIndex.length; i++) {
    var key   = _leaIndex[i][0];
    var keyN  = _leaIndexNorm[i] ? _leaIndexNorm[i][0] : leaNormDiac(key);
    var id    = _leaIndex[i][1];
    var hit   = false;
    if (key.length <= 3) {
      hit = new RegExp('(?:^|\\s)' + keyN.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '(?:\\s|$|[!?.,;])').test(tN);
    } else {
      hit = tN.includes(keyN);
    }
    if (hit && !seen[id]) { seen[id] = true; found.push(id); }
  }
  return found;
}

// ══════════════════════════════════════════════════════════════
// DETECTEAZA LIMBA
// ══════════════════════════════════════════════════════════════

function leaDetectLang(text) {
  var t = text.toLowerCase();
  var best = "en";
  var bestScore = 0;
  var langs = Object.keys(LEA_LANG_PATTERNS);
  for (var i = 0; i < langs.length; i++) {
    var lang = langs[i];
    var words = LEA_LANG_PATTERNS[lang];
    var score = 0;
    for (var j = 0; j < words.length; j++) {
      if (t.includes(words[j])) score++;
    }
    if (score > bestScore) { bestScore = score; best = lang; }
  }
  return best;
}

// ══════════════════════════════════════════════════════════════
// RASPUNS CHAT — pentru ID-uri speciale (non-Alexandria)
// ══════════════════════════════════════════════════════════════

function leaChatResponse(id) {
  // CHAT_ORIGINE — raspuns diferit daca userul are deja conversatii
  if (id === 'CHAT_ORIGINE') {
    var hist = [];
    try { hist = JSON.parse(localStorage.getItem('vv_conv_history') || '[]'); } catch(e) {}
    var totalMesaje = hist.reduce(function(s, c) { return s + (c.msgs ? c.msgs.length : 0); }, 0);
    if (totalMesaje >= 10) {
      var rev = LEA_CHAT_RESPONSES['CHAT_ORIGINE_REVENIRE'];
      if (rev) return rev[Math.floor(Math.random() * rev.length)];
    }
  }

  var list = LEA_CHAT_RESPONSES[id];
  if (!list) return null;
  return list[Math.floor(Math.random() * list.length)];
}

