// Ported verbatim from the original Mise en Place unit conversion logic.

var CUP_WEIGHTS = {
  'all-purpose flour': 120, 'plain flour': 120, 'bread flour': 127,
  'whole wheat flour': 130, 'wholemeal flour': 130, 'self-raising flour': 120,
  'almond flour': 96, 'almond meal': 96, 'rice flour': 158,
  'cornstarch': 120, 'corn starch': 120, 'cornflour': 120, 'corn flour': 120,
  'arrowroot': 120, 'potato starch': 160, 'tapioca starch': 120, 'tapioca flour': 120,
  'flour': 120, 'baking powder': 230, 'baking soda': 230, 'bicarbonate of soda': 230,
  'cocoa powder': 85, 'cocoa': 85, 'cacao': 85,
  'powdered sugar': 120, 'icing sugar': 120, 'confectioners sugar': 120,
  'caster sugar': 200, 'granulated sugar': 200, 'brown sugar': 200,
  'raw sugar': 200, 'demerara': 220, 'muscovado': 220, 'sugar': 200,
  'rolled oats': 90, 'oatmeal': 90, 'oats': 90,
  'quinoa': 170, 'white rice': 185, 'brown rice': 190, 'rice': 185,
  'couscous': 165, 'bulgur': 140, 'cornmeal': 160, 'polenta': 160, 'semolina': 165,
  'panko': 60, 'breadcrumbs': 110,
  'ground almonds': 95, 'almonds': 143, 'walnuts': 120, 'pecans': 100,
  'cashews': 130, 'peanuts': 145, 'hazelnuts': 135, 'pistachios': 123,
  'pine nuts': 135, 'sesame seeds': 145, 'chia seeds': 160, 'flaxseed': 150,
  'sunflower seeds': 140, 'pumpkin seeds': 130,
  'chocolate chips': 170, 'raisins': 145, 'dried cranberries': 100,
  'desiccated coconut': 75, 'shredded coconut': 75, 'coconut flakes': 60,
  'cream cheese': 225, 'ricotta': 246, 'mascarpone': 240,
  'grated parmesan': 100, 'grated cheese': 100, 'shredded cheese': 110,
  'peanut butter': 260, 'almond butter': 250, 'tahini': 240,
  'tomato paste': 260, 'miso': 270,
  'honey': 340, 'maple syrup': 320, 'agave': 340, 'molasses': 340,
  'butter': 225,
};

var LIQUID_KEYWORDS = [
  'water','milk','cream','stock','broth','juice','oil','vinegar','wine','beer',
  'rum','vodka','whiskey','brandy','buttermilk','kefir','coconut milk',
  'almond milk','oat milk','soy milk','heavy cream','double cream',
  'whipping cream','half and half','creme fraiche','lemon juice','lime juice',
  'orange juice','olive oil','vegetable oil','canola oil','fish sauce',
  'soy sauce','hot sauce','worcestershire','liquid',
];

function roundMetric(val) {
  if (val >= 100) return Math.round(val / 5) * 5;
  if (val >= 10) return Math.round(val);
  return Math.round(val * 10) / 10;
}

function normalizeFractions(text) {
  // Convert unicode fractions to slash form first
  var uni = {'½':'1/2','¼':'1/4','¾':'3/4','⅓':'1/3','⅔':'2/3','⅛':'1/8','⅜':'3/8','⅝':'5/8','⅞':'7/8'};
  for (var k in uni) {
    // "1½" → "1 1/2"
    text = text.replace(new RegExp('(\d)' + k, 'g'), '$1 ' + uni[k]);
    // lone "½" → "1/2"
    text = text.split(k).join(uni[k]);
  }
  // "1 1/2" → "1.5"
  text = text.replace(/(\d+)\s+(\d+)\/(\d+)/g, function(m, w, n, d) {
    return String(Math.round((parseInt(w) + parseInt(n)/parseInt(d)) * 1000) / 1000);
  });
  // "1/2" → "0.5"
  text = text.replace(/(\d+)\/(\d+)/g, function(m, n, d) {
    return String(Math.round(parseInt(n)/parseInt(d) * 1000) / 1000);
  });
  return text;
}

function parseFractionStr(str) {
  return parseFloat(str) || 0;
}

function convertToMetric(text) {
  var normalized = normalizeFractions(text);
  var lower = text.toLowerCase();
  var out = normalized;

  // Temperature °F → °C
  out = out.replace(/(\d+(?:\.\d+)?)\s*°F/g, function(m, f) {
    return Math.round((parseFloat(f) - 32) * 5 / 9) + '°C';
  });

  // Sticks of butter
  out = out.replace(/(\d+(?:\.\d+)?)\s*sticks?\s*(?:of\s*)?butter/gi, function(m, n) {
    return roundMetric(parseFloat(n) * 113) + 'g butter';
  });

  // Cups
  out = out.replace(/(\d+(?:\.\d+)?)\s*cups?/gi, function(m, num) {
    var n = parseFloat(num);
    var bestKey = null, bestLen = 0;
    for (var k in CUP_WEIGHTS) {
      if (lower.indexOf(k) >= 0 && k.length > bestLen) { bestKey = k; bestLen = k.length; }
    }
    if (bestKey) return roundMetric(n * CUP_WEIGHTS[bestKey]) + 'g';
    for (var li = 0; li < LIQUID_KEYWORDS.length; li++) {
      if (lower.indexOf(LIQUID_KEYWORDS[li]) >= 0) return roundMetric(n * 240) + 'ml';
    }
    return roundMetric(n * 240) + 'ml';
  });

  // Fluid ounces (before plain oz)
  out = out.replace(/(\d+(?:\.\d+)?)\s*fl\.?\s*oz/gi, function(m, n) {
    return roundMetric(parseFloat(n) * 30) + 'ml';
  });

  // Pounds / lbs
  out = out.replace(/(\d+(?:\.\d+)?)\s*(?:pounds?|lbs?)(?![a-zA-Z])/gi, function(m, n) {
    var g = roundMetric(parseFloat(n) * 453.6);
    return g >= 1000 ? (Math.round(g / 100) / 10) + 'kg' : g + 'g';
  });

  // Ounces
  out = out.replace(/(\d+(?:\.\d+)?)\s*(?:ounces?|oz)(?![a-zA-Z])/gi, function(m, n) {
    return roundMetric(parseFloat(n) * 28.35) + 'g';
  });

  return out;
}


export function convertIngredient(text, unitMode) {
  if (unitMode !== 'metric') return text;
  if (/tbsp|tsp|tablespoon|teaspoon/i.test(text)) return text;
  return convertToMetric(text);
}
export { convertToMetric };
