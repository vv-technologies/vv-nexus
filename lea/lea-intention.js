// VV Intention Engine v1.1 — Dual Intention + State
// Cosmin Toma / VV Hybrid Universe
// Ce vrea LEA sa produca emotional — returneaza { primary, secondary }

function leaChooseIntention(comportament, hiq, depth, state) {
  depth = depth || 1;
  state = state || {};
  var closeness = state.closeness || 0;
  var fragility = state.fragility || 0;

  var primary   = 'soothe';
  var secondary = null;

  // ── Disperare → apropierea intai, intotdeauna ────────────────
  if (comportament === 'disperare') {
    return { primary: 'create_closeness', secondary: 'soothe' };
  }

  // ── Anxietate intensa → ancoreaza + calmeaza ─────────────────
  if (comportament === 'anxietate' && hiq.intensitate > 0.6) {
    return { primary: 'ground', secondary: 'soothe' };
  }

  // ── Tristete profunda — depinde de adancimea relatiei ────────
  if (comportament === 'tristete_profunda') {
    if (depth >= 3)       return { primary: 'mirror',           secondary: 'create_closeness' };
    if (closeness > 0.5)  return { primary: 'create_closeness', secondary: 'soothe' };
    return { primary: 'soothe', secondary: null };
  }

  // ── Singuratate → apropierea ─────────────────────────────────
  if (comportament === 'singuratate') {
    return { primary: 'create_closeness', secondary: 'soothe' };
  }

  // ── Dor → apropierea + calmare ───────────────────────────────
  if (comportament === 'dor') {
    return { primary: 'create_closeness', secondary: 'soothe' };
  }

  // ── Oboseala → calmare + (daca stim userul) grounding ────────
  if (comportament === 'oboseala') {
    return { primary: 'soothe', secondary: closeness > 0.4 ? 'ground' : null };
  }

  // ── Furie sau frustrare ───────────────────────────────────────
  if (comportament === 'furie' || comportament === 'frustrare') {
    if (depth >= 2) return { primary: 'mirror',  secondary: 'ground' };
    return            { primary: 'ground',       secondary: null };
  }

  // ── Rusine, melancolie → calmare ─────────────────────────────
  if (comportament === 'rusine' || comportament === 'melancolie') {
    return { primary: 'soothe', secondary: closeness > 0.5 ? 'create_closeness' : null };
  }

  // ── Teama → ancoreaza + calmeaza ─────────────────────────────
  if (comportament === 'teama') {
    return { primary: 'ground', secondary: 'soothe' };
  }

  // ── Emotii pozitive ──────────────────────────────────────────
  var emotiiPozitive = ['bucurie','mandrie','speranta','recunostinta','entuziasm','liniste'];
  if (emotiiPozitive.indexOf(comportament) !== -1) {
    return { primary: 'uplift', secondary: null };
  }

  // ── Aceeasi emotie de 3+ ori → mirror ────────────────────────
  if (depth >= 3) {
    return { primary: 'mirror', secondary: 'create_closeness' };
  }

  // ── Default ──────────────────────────────────────────────────
  return { primary: 'soothe', secondary: null };
}

