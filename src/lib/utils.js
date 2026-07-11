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

export function getStepIngs(r, stepIdx) {
  var steps = r.steps || [];
  var stopwords = new Set(['with','and','the','for','all','purpose','into','from','over','until','then','this','that','them','some','each','both','more','well','very','just','also','only','such','even','once','most','make','made','high','heat','cool','cold','warm','room','temp','temperature','large','small','medium','whole','fresh','dried','ground','optional','taste','chopped','minced','diced','grated','sliced','unsalted','salted']);

  function getWords(ing) {
    var name = ing.replace(/^[\d\/½¼¾⅓⅔⅛⅜⅝⅞\s]+(g|kg|ml|l|tsp|tbsp|cup|oz|lb|pinch|x|large|small|medium|whole)?\s*/i,'').toLowerCase();
    return name.split(/[\s,()]+/).filter(function(w){ return w.length > 3 && !stopwords.has(w); });
  }

  function matches(ing, stepText) {
    var words = getWords(ing);
    if (!words.length) return false;
    return words.some(function(w){
      return new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b').test(stepText);
    });
  }

  return r.ingredients.filter(function(ing){
    // Find the first step this ingredient matches
    var firstMatch = -1;
    for (var i = 0; i < steps.length; i++) {
      if (matches(ing, steps[i].toLowerCase())) { firstMatch = i; break; }
    }
    return firstMatch === stepIdx;
  });
}

