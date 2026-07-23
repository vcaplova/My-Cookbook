import { NUM_RE, parseQtyStr } from './units';
// Pure helpers ported verbatim from the original Mise en Place app.

export function parseSecs(num, unit) {
  var n = parseFloat(num);
  var u = unit.toLowerCase();
  if (u[0] === 'h') return Math.round(n * 3600);
  if (u[0] === 'm') return Math.round(n * 60);
  if (u[0] === 's') return Math.round(n);
  return 0;
}

export function extractTimerFromStep(text) {
  var t = text.toLowerCase();
  var timers = [];
  var consumed = []; // character ranges already matched

  function overlaps(start, end) {
    for (var i = 0; i < consumed.length; i++) {
      if (start < consumed[i][1] && end > consumed[i][0]) return true;
    }
    return false;
  }

  // 1. "at least X unit" → single timer (ignore any "up to Y" following)
  var atLeastRe = /at\s+least\s+(\d+(?:\.\d+)?)\s*(hours?|hr?s?|minutes?|mins?|seconds?|secs?)/g;
  var m;
  while ((m = atLeastRe.exec(t)) !== null) {
    if (!overlaps(m.index, m.index + m[0].length)) {
      var secs = parseSecs(m[1], m[2]);
      if (secs > 0) {
        timers.push({ min: secs, max: secs });
        consumed.push([m.index, m.index + m[0].length]);
        // Mark any "or up to Y" after this as consumed too
        var upToRe = /or\s+up\s+to\s+(\d+(?:\.\d+)?)\s*(hours?|hr?s?|minutes?|mins?)/g;
        upToRe.lastIndex = m.index + m[0].length;
        var u = upToRe.exec(t);
        if (u && u.index < m.index + m[0].length + 30) {
          consumed.push([u.index, u.index + u[0].length]);
        }
      }
    }
  }

  // 2. "X to Y unit" and "X-Y unit" → range timer
  var rangeRe = /(\d+(?:\.\d+)?)\s*(?:to|-|–)\s*(\d+(?:\.\d+)?)\s*(hours?|hr?s?|minutes?|mins?|seconds?|secs?)/g;
  while ((m = rangeRe.exec(t)) !== null) {
    if (!overlaps(m.index, m.index + m[0].length)) {
      var minS = parseSecs(m[1], m[3]);
      var maxS = parseSecs(m[2], m[3]);
      if (maxS > 0) {
        timers.push({ min: minS, max: maxS });
        consumed.push([m.index, m.index + m[0].length]);
      }
    }
  }

  // 3. Standalone times: "12 minutes", "2 hours", "30 seconds"
  //    Find ALL occurrences and create separate timers for each
  var singleRe = /(\d+(?:\.\d+)?)\s*(hours?|hr?s?|minutes?|mins?|seconds?|secs?)/g;
  while ((m = singleRe.exec(t)) !== null) {
    if (!overlaps(m.index, m.index + m[0].length)) {
      // Skip if it looks like an ingredient amount (preceded by number/fraction context)
      var before = t.slice(Math.max(0, m.index - 15), m.index);
      if (/(?:tbsp|tsp|tablespoon|teaspoon|cup|oz|lb|g|kg|ml)/.test(before)) continue;
      var secs = parseSecs(m[1], m[2]);
      if (secs >= 30) { // ignore very short times like "1 second"
        timers.push({ min: secs, max: secs });
        consumed.push([m.index, m.index + m[0].length]);
      }
    }
  }

  return timers.length > 0 ? timers : null;
}

export function formatTimerTime(secs) {
  if (secs >= 3600) {
    var h = Math.floor(secs / 3600);
    var m = Math.floor((secs % 3600) / 60);
    var s = secs % 60;
    return h + ':' + (m<10?'0':'')+m + ':' + (s<10?'0':'')+s;
  }
  var m = Math.floor(secs / 60);
  var s = secs % 60;
  return (m<10?'0':'')+m + ':' + (s<10?'0':'')+s;
}

export function parseMinutes(str) {
  if (!str || str === '—') return 9999;
  var total = 0;
  var h = str.match(/(\d+)\s*h/i);
  var m = str.match(/(\d+)\s*m/i);
  if (h) total += parseInt(h[1]) * 60;
  if (m) total += parseInt(m[1]);
  if (!h && !m) { var n = parseInt(str); if (!isNaN(n)) total = n; }
  return total || 9999;
}

export function scaleIng(text, ratio) {
  if (ratio === 1) return text;
  return text.replace(/^(\d+\.?\d*\/\d+\.?\d*|\d+\.?\d*)/, function(m) {
    if (m.indexOf('/') >= 0) { var parts = m.split('/'); return fmtNum(parseFloat(parts[0])/parseFloat(parts[1])*ratio); }
    return fmtNum(parseFloat(m)*ratio);
  });
}

export function fmtNum(n) {
  if (n === Math.floor(n)) return String(Math.round(n));
  var whole = Math.floor(n); var frac = n - whole;
  var fracs = [[.25,'¼'],[.5,'½'],[.75,'¾'],[.33,'⅓'],[.67,'⅔']];
  for (var i = 0; i < fracs.length; i++) { if (Math.abs(frac-fracs[i][0])<0.07) return whole>0?whole+fracs[i][1]:fracs[i][1]; }
  return n.toFixed(1).replace(/\.0$/,'');
}


function buildSectionMap(r) {
  var rawSteps = r.steps || [];
  var stopwords = new Set(['with','and','the','for','all','purpose','into','from','over','until','then','this','that','them','some','each','both','more','well','very','just','also','only','such','even','once','most','make','made','high','heat','cool','cold','warm','room','temp','temperature','large','small','medium','whole','fresh','dried','ground','optional','taste','chopped','minced','diced','grated','sliced','unsalted','salted']);

  // Parse ingredient sections
  var sections = [];
  var current = { header: null, ingredients: [] };
  (r.ingredients || []).forEach(function(ing) {
    if (ing.startsWith('##')) {
      if (current.header !== null || current.ingredients.length) sections.push(current);
      current = { header: ing.replace(/^##\s*/, ''), ingredients: [] };
    } else {
      current.ingredients.push(ing);
    }
  });
  sections.push(current);

  var hasSections = sections.length > 1 && sections[0].header;

  // Filter out ## headers from steps, building a map of real step index → section index
  var steps = [];
  var stepSections = [];
  var currentSectionIdx = 0;
  rawSteps.forEach(function(s) {
    if (s.startsWith('##')) {
      // Find matching section by header name
      var hdr = s.replace(/^##\s*/, '').toLowerCase().trim();
      var found = sections.findIndex(function(sec){ return sec.header && sec.header.toLowerCase().trim() === hdr; });
      if (found >= 0) currentSectionIdx = found;
    } else {
      steps.push(s);
      stepSections.push(currentSectionIdx);
    }
  });

  // Fallback: if steps have no ## markers, assign by first ingredient match in order
  if (!hasSections || steps.length === stepSections.filter(function(s){ return s === 0; }).length && sections.length > 1) {
    // Check if steps array actually had ## markers
    var hadMarkers = rawSteps.some(function(s){ return s.startsWith('##'); });
    if (!hadMarkers && hasSections) {
      // Assign by first appearance of unique ingredient keywords, in section order
      var minStart = 0;
      var sectionStart = sections.map(function() { return -1; });
      sections.forEach(function(sec, si) {
        for (var i = minStart; i < steps.length; i++) {
          var st = steps[i].toLowerCase();
          if (sec.ingredients.some(function(ing){ return ingMatchesStep(ing, st); })) {
            sectionStart[si] = i; minStart = i + 1; break;
          }
        }
        if (sectionStart[si] < 0) sectionStart[si] = si === 0 ? 0 : sectionStart[si-1] + 1;
      });
      stepSections = steps.map(function(_, si) {
        var best = 0;
        for (var s = 0; s < sections.length; s++) {
          if (sectionStart[s] >= 0 && sectionStart[s] <= si) best = s;
        }
        return best;
      });
    }
  }

  function getWords(ing) {
    var name = ing.replace(/^[\d\/½¼¾⅓⅔⅛⅜⅝⅞\s]+(g|kg|ml|l|tsp|tbsp|cup|oz|lb|pinch|x|large|small|medium|whole)?\s*/i,'').toLowerCase();
    return name.split(/[\s,()]+/).filter(function(w){
      return w.length > 2 && !stopwords.has(w) && !/^\d+[a-z]*$/.test(w);
    });
  }

  // --- Quantity-aware matching -------------------------------------------
  // When a step spells out a measure ("add 2/3 cup water"), that measure binds
  // the step to the ingredient line carrying the same measure, rather than to
  // whichever line merely happens to be listed first.
  var UNIT_ALIASES = {
    cup:'cup', cups:'cup', tbsp:'tbsp', tablespoon:'tbsp', tablespoons:'tbsp',
    tsp:'tsp', teaspoon:'tsp', teaspoons:'tsp', g:'g', gram:'g', grams:'g',
    kg:'kg', kilogram:'kg', kilograms:'kg', ml:'ml', milliliter:'ml', milliliters:'ml',
    l:'l', liter:'l', liters:'l', litre:'l', litres:'l', oz:'oz', ounce:'oz', ounces:'oz',
    lb:'lb', lbs:'lb', pound:'lb', pounds:'lb'
  };
  var UNIT_WORDS = Object.keys(UNIT_ALIASES).join('|');
  var QTY_RE = new RegExp('(' + NUM_RE + ')\\s*(' + UNIT_WORDS + ')\\b', 'gi');

  // The leading measure on an ingredient line, e.g. "2/3 cup water" → 0.667 cup
  function ingQty(ing) {
    var m = new RegExp('^\\s*(' + NUM_RE + ')\\s*(' + UNIT_WORDS + ')\\b', 'i').exec(ing);
    if (!m) return null;
    return { amount: parseQtyStr(m[1]), unit: UNIT_ALIASES[m[2].toLowerCase()] };
  }

  // Position of a matching measure inside the step text, or -1
  function qtyPosInStep(qty, stepText) {
    if (!qty) return -1;
    QTY_RE.lastIndex = 0;
    var m;
    while ((m = QTY_RE.exec(stepText)) !== null) {
      if (UNIT_ALIASES[m[2].toLowerCase()] !== qty.unit) continue;
      var amt = parseQtyStr(m[1]);
      if (Math.abs(amt - qty.amount) < 0.02) return m.index;
    }
    return -1;
  }

  // Returns the character index of the earliest mention of this ingredient in
  // the step text, or -1 if the ingredient isn't mentioned at all.
  function matchPos(ing, stepText) {
    var words = getWords(ing);
    if (!words.length) return -1;
    var matchCount = 0;
    var earliest = -1;
    words.forEach(function(w){
      var re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b');
      var m = re.exec(stepText);
      if (m) {
        matchCount++;
        if (earliest < 0 || m.index < earliest) earliest = m.index;
      }
    });
    // Short ingredients (≤2 meaningful words): 1 match is enough
    // Longer ingredients: need 2+ matches to avoid false positives
    var ok = words.length <= 2 ? matchCount >= 1 : matchCount >= 2;
    return ok ? earliest : -1;
  }

  function ingMatchesStep(ing, stepText) {
    return matchPos(ing, stepText) >= 0;
  }

  // Assign every ingredient to exactly one step, then order the ingredients
  // within each step by where they are first mentioned in that step's text.
  var assignments = {}; // stepIdx → [ing, ing, ...]

  sections.forEach(function(sec, secIdx) {
    var sectionSteps = [];
    steps.forEach(function(_, i){ if (stepSections[i] === secIdx) sectionSteps.push(i); });
    if (!sectionSteps.length) return;

    var buckets = {};       // stepIdx → [{ ing, pos, order }]
    var nextSearchFrom = {}; // ingredient key → index into sectionSteps

    sec.ingredients.forEach(function(ing, order) {
      if (ing.startsWith('##')) return;
      var key = getWords(ing).join(' ');
      if (!key) return;

      var qty = ingQty(ing);

      // Pass 1: a step that names this ingredient AND its exact measure wins,
      // regardless of where it sits in the sequence.
      function findByQty(start) {
        for (var k = start; k < sectionSteps.length; k++) {
          var si = sectionSteps[k];
          var st = steps[si].toLowerCase();
          if (matchPos(ing, st) < 0) continue;
          var qp = qtyPosInStep(qty, st);
          if (qp >= 0) return { k: k, si: si, pos: qp };
        }
        return null;
      }

      // Pass 2: plain name match.
      function findFrom(start) {
        for (var k = start; k < sectionSteps.length; k++) {
          var si = sectionSteps[k];
          var pos = matchPos(ing, steps[si].toLowerCase());
          if (pos >= 0) return { k: k, si: si, pos: pos };
        }
        return null;
      }

      // Duplicate names (e.g. water for the rice, water for the sauce) are
      // consumed in order: the 2nd "water" looks from the step after the 1st.
      var start = nextSearchFrom[key] || 0;
      var hit = findByQty(start) || findFrom(start);
      if (!hit && start) hit = findByQty(0) || findFrom(0);
      if (!hit) return;

      nextSearchFrom[key] = hit.k + 1;
      if (!buckets[hit.si]) buckets[hit.si] = [];
      buckets[hit.si].push({ ing: ing, pos: hit.pos, order: order });
    });

    Object.keys(buckets).forEach(function(si) {
      assignments[si] = buckets[si]
        .sort(function(a, b){ return a.pos - b.pos || a.order - b.order; })
        .map(function(x){ return x.ing; });
    });
  });

  return { sections: sections, steps: steps, stepSections: stepSections, ingMatchesStep: ingMatchesStep, hasSections: hasSections, assignments: assignments };
}

export function getStepIngs(r, stepIdx) {
  return buildSectionMap(r).assignments[stepIdx] || [];
}

export function getStepSection(r, stepIdx) {
  var map = buildSectionMap(r);
  if (!map.hasSections) return null;
  var idx = map.stepSections[stepIdx];
  return idx !== undefined ? map.sections[idx].header : null;
}
