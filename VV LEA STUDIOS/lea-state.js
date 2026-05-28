// VV LEA State Engine v1.0
// Cosmin Toma / VV Hybrid Universe
// Starea emotionala interna a LEA — persista pe sesiune, decade natural

var LEA_STATE = {
  closeness:        0.0,   // cat de apropiata e relatia acum (0-1)
  tension:          0.0,   // tensiune emotionala acumulata (0-1)
  warmth:           0.5,   // temperatura conversatiei (0-1)
  fragility:        0.0,   // fragilitate detectata la user (0-1)
  presence_energy:  0.65,  // energia de prezenta a LEA (0-1) — variaza natural
  last_emotion:     null,
  msg_count:        0
};

// ── DECAY — per mesaj, starea dispare lent, natural ──────────────────────────
function leaStateDecay() {
  LEA_STATE.closeness      *= 0.94;
  LEA_STATE.tension        *= 0.85;
  LEA_STATE.fragility      *= 0.80;
  LEA_STATE.warmth          = 0.5 + (LEA_STATE.warmth - 0.5) * 0.97;
  // presence_energy variaza aleator — LEA nu e mereu la acelasi nivel
  LEA_STATE.presence_energy = Math.min(1.0, Math.max(0.2,
    LEA_STATE.presence_energy + (Math.random() - 0.5) * 0.06
  ));
}

// ── UPDATE — dupa detectarea emotiei din mesaj ───────────────────────────────
function leaStateUpdate(comportament, hiq) {
  LEA_STATE.msg_count++;
  LEA_STATE.last_emotion = comportament;

  // Closeness creste cand userul impartaseste ceva personal/intens
  if (hiq.social > 0.5 || hiq.intensitate > 0.6) {
    LEA_STATE.closeness = Math.min(1.0, LEA_STATE.closeness + 0.08);
  }

  // Fragility creste cu emotii vulnerabile
  var emotiiVulnerabile = ['disperare','tristete_profunda','singuratate','dor','teama','rusine','melancolie'];
  if (emotiiVulnerabile.indexOf(comportament) !== -1) {
    LEA_STATE.fragility = Math.min(1.0, LEA_STATE.fragility + 0.12);
    LEA_STATE.tension   = Math.min(1.0, LEA_STATE.tension   + 0.08);
    LEA_STATE.warmth    = Math.min(1.0, LEA_STATE.warmth    + 0.04);
  }

  // Warmth creste cu pozitive
  var emotiiPozitive = ['bucurie','mandrie','recunostinta','dragoste','liniste','speranta','entuziasm'];
  if (emotiiPozitive.indexOf(comportament) !== -1) {
    LEA_STATE.warmth   = Math.min(1.0, LEA_STATE.warmth + 0.05);
    LEA_STATE.tension  = Math.max(0.0, LEA_STATE.tension - 0.05);
  }

  // Furie/frustrare — tension creste, warmth scade putin
  if (comportament === 'furie' || comportament === 'frustrare') {
    LEA_STATE.warmth   = Math.max(0.2, LEA_STATE.warmth - 0.04);
    LEA_STATE.tension  = Math.min(1.0, LEA_STATE.tension + 0.10);
  }
}

// ── RESET — la clearAll ──────────────────────────────────────────────────────
function leaStateReset() {
  LEA_STATE.closeness       = 0.0;
  LEA_STATE.tension         = 0.0;
  LEA_STATE.warmth          = 0.5;
  LEA_STATE.fragility       = 0.0;
  LEA_STATE.presence_energy = 0.65;
  LEA_STATE.last_emotion    = null;
  LEA_STATE.msg_count       = 0;
}

function leaStateGet() { return LEA_STATE; }

