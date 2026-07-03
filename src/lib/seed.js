// Seed data ported from the original app.

export const SEED_COLLECTIONS = [
  { id: 'Pastry',    name: 'Pastry',           color: '#C0694A', emoji: '🥐' },
  { id: 'Italian',   name: 'Italian',           color: '#7A9E6E', emoji: '🍝' },
  { id: 'Weeknight', name: 'Weeknight Dinners', color: '#6E8FA8', emoji: '🍳' },
  { id: 'French',    name: 'French',            color: '#9B7DBE', emoji: '🥖' },
  { id: 'Sweet',     name: 'Sweet',             color: '#D4A843', emoji: '🍰' },
];

export const COLLECTION_COLORS = ['#C0694A','#D4A843','#7A9E6E','#6E8FA8','#9B7DBE','#C0855A','#5A8A7A','#7A6EA8','#A87A6E','#6E8A5A','#B85C8A','#5C8AB8','#8AB85C','#B8A05C','#5CB8A8'];

export const FOOD_EMOJIS = [
  '🍕','🍝','🍜','🍛','🍲','🥘','🫕','🥗','🥙','🌮','🌯',
  '🍔','🌭','🥪','🥨','🧀','🥚','🍳','🥞','🧇','🥓','🥩','🍗','🍖',
  '🍤','🦐','🦞','🦀','🐟','🍣','🍱','🍚','🍙','🍘','🍥',
  '🥐','🥖','🍞','🥨','🧁','🎂','🍰','🍮','🍭','🍬','🍫','🍩','🍪','🍦',
  '🫐','🍓','🍇','🍉','🍊','🍋','🍑','🍒','🥝','🍎','🍐','🥑',
  '🥦','🥕','🌽','🥔','🧅','🧄','🫒','🌶','🥬','🥒','🍅','🫑',
  '🫘','🥜','🌰','🍄','🧂','🫙','🫚','🥫',
  '☕','🍵','🧃','🥛','🍺','🍷','🍸','🫖',
  '🥣','🥧','🧆','🫔','🥮',
];

export const SEED_RECIPES = [
  { id:1, title:'Kouign-Amann', img:'', cookTime:'2h 30m', servings:8, collections:['Pastry','French','Sweet'], tags:['buttery','weekend','breton'], starred:true, pinned:false, addedAt:Date.now()-1000*60*60*2, ingredients:['500g bread flour','10g salt','7g instant yeast','300ml warm water','200g unsalted butter','200g caster sugar'], steps:['Mix flour, salt and yeast. Add water gradually and knead to a smooth dough.','Rest dough for 1 hour until doubled.','Roll out dough and encase butter in layers, folding and chilling 3 times.','Sprinkle sugar on final roll-out and fold into a round tin.','Bake at 190°C for 40 minutes until deep golden and caramelised.'] },
  { id:2, title:'Tagliatelle al Ragù', img:'', cookTime:'3h', servings:4, collections:['Italian','Weeknight'], tags:['comfort','slow-cook','pasta'], starred:true, pinned:false, addedAt:Date.now()-1000*60*60*24, ingredients:['400g tagliatelle','300g beef mince','150g pork mince','1 onion diced','2 carrots diced','200ml white wine','400g canned tomatoes'], steps:['Sweat onion and carrot in olive oil for 15 minutes.','Add mince and brown well.','Pour in wine and reduce by half.','Add tomatoes and simmer on lowest heat for 2 hours.','Cook pasta al dente, finish in sauce.'] },
  { id:3, title:'Tarte Tatin', img:'', cookTime:'1h 15m', servings:6, collections:['Pastry','French','Sweet'], tags:['apple','classic','caramel'], starred:false, pinned:false, addedAt:Date.now()-1000*60*60*48, ingredients:['6 Golden Delicious apples','120g butter','150g caster sugar','1 sheet puff pastry'], steps:['Peel, core and halve the apples.','Melt butter and sugar until amber caramel forms.','Arrange apples in pan, cook 10 minutes.','Drape pastry over top. Bake at 200°C for 25 minutes.','Cool 5 minutes then invert onto plate.'] },
  { id:4, title:'Cacio e Pepe', img:'', cookTime:'20m', servings:2, collections:['Italian','Weeknight'], tags:['quick','pasta','simple'], starred:false, pinned:false, addedAt:Date.now()-1000*60*60*72, ingredients:['200g spaghetti','100g Pecorino Romano grated','50g Parmigiano Reggiano grated','2 tsp black peppercorns','Salt'], steps:['Toast peppercorns and grind coarsely.','Cook pasta, reserve 200ml pasta water.','Add pepper to pan with pasta water.','Add pasta and cheese, toss vigorously until creamy.'] },
  { id:5, title:'Croissants', img:'', cookTime:'3h', servings:12, collections:['Pastry','French'], tags:['laminated','weekend','butter'], starred:false, pinned:false, addedAt:Date.now()-1000*60*60*96, ingredients:['500g strong flour','10g salt','80g sugar','10g yeast','300ml milk','280g butter for lamination','1 egg for wash'], steps:['Make dough, rest overnight.','Laminate butter with 3 folds, chilling between each.','Roll out, cut triangles, roll up.','Prove 2 hours, egg wash, bake at 200°C for 18 minutes.'] },
  { id:6, title:'Crème Brûlée', img:'', cookTime:'1h', servings:4, collections:['French','Sweet'], tags:['classic','elegant','vanilla'], starred:false, pinned:false, addedAt:Date.now()-1000*60*60*120, ingredients:['500ml double cream','1 vanilla pod','6 egg yolks','100g caster sugar','4 tbsp demerara sugar'], steps:['Heat cream with vanilla until simmering.','Whisk yolks with sugar until pale.','Pour cream into yolks whisking constantly.','Strain into ramekins, bake in bain-marie at 150°C for 40 minutes.','Chill 2 hours, torch demerara until crackled.'] },
];
