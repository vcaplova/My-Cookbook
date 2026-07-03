export const PALETTES = {
  terracotta: {
    name: 'Terracotta',
    vars: {
      '--parchment': '#F5EFE0', '--cream': '#FAF6EE', '--linen': '#EDE4D0',
      '--terra': '#C0694A', '--terra-dk': '#A0502F', '--terra-lt': '#E8A98A',
      '--espresso': '#2E1F0F', '--walnut': '#7A4E2D', '--ink': '#2C1F10', '--muted': '#9C856A',
      '--sidebar': '#2E1F0F', '--s-text': '#E8D9C0', '--s-dim': '#7A6248',
      '--btn-shadow': '0 2px 8px rgba(192,105,74,.32)'
    }
  },
  rosewood: {
    name: 'Rosewood',
    vars: {
      '--parchment': '#F3ECE4', '--cream': '#FBF6F1', '--linen': '#E8DDD3',
      '--terra': '#AE4842', '--terra-dk': '#7B2D29', '--terra-lt': '#DEB2AF',
      '--espresso': '#371715', '--walnut': '#7D3430', '--ink': '#371715', '--muted': '#A76662',
      '--sidebar': '#371715', '--s-text': '#F8F1EA', '--s-dim': '#AC7572',
      '--btn-shadow': '0 2px 8px rgba(174,72,66,.32)'
    }
  },
  blushPetal: {
    name: 'Blush Petal',
    vars: {
      '--parchment': '#EBD8D0', '--cream': '#FEFEFF', '--linen': '#F4EBE8',
      '--terra': '#B2664D', '--terra-dk': '#7D4736', '--terra-lt': '#EAC9C1',
      '--espresso': '#351F18', '--walnut': '#7E4A39', '--ink': '#351F18', '--muted': '#B6735E',
      '--sidebar': '#351F18', '--s-text': '#FEFEFF', '--s-dim': '#BC7F6C',
      '--btn-shadow': '0 2px 8px rgba(178,102,77,.32)'
    }
  },
  cloudBlush: {
    name: 'Cloud Blush',
    vars: {
      '--parchment': '#EFE5DC', '--cream': '#FFFFFF', '--linen': '#F7F2EE',
      '--terra': '#B26E4D', '--terra-dk': '#7D4D36', '--terra-lt': '#F3D8C7',
      '--espresso': '#32221B', '--walnut': '#775340', '--ink': '#32221B', '--muted': '#AA7F69',
      '--sidebar': '#32221B', '--s-text': '#FFFFFF', '--s-dim': '#B28A76',
      '--btn-shadow': '0 2px 8px rgba(178,110,77,.32)'
    }
  },
  creamHoney: {
    name: 'Cream & Honey',
    vars: {
      '--parchment': '#F8F3E7', '--cream': '#FFFDF8', '--linen': '#F0E8D2',
      '--terra': '#D6872D', '--terra-dk': '#A3651A', '--terra-lt': '#EFC48A',
      '--espresso': '#352113', '--walnut': '#825126', '--ink': '#352113', '--muted': '#C28A51',
      '--sidebar': '#352113', '--s-text': '#F5EFDD', '--s-dim': '#B6783A',
      '--btn-shadow': '0 2px 8px rgba(214,135,45,.32)'
    }
  },
  creamPlum: {
    name: 'Cream & Plum',
    vars: {
      '--parchment': '#F6F3EC', '--cream': '#FEFDF9', '--linen': '#E9E4DA',
      '--terra': '#8A5FA8', '--terra-dk': '#5B3B78', '--terra-lt': '#D3BFE0',
      '--espresso': '#241C2C', '--walnut': '#5C4468', '--ink': '#241C2C', '--muted': '#96829F',
      '--sidebar': '#241C2C', '--s-text': '#F1ECF3', '--s-dim': '#7C6685',
      '--btn-shadow': '0 2px 8px rgba(138,95,168,.32)'
    }
  },
  creamSky: {
    name: 'Cream & Sky',
    vars: {
      '--parchment': '#F5F4EC', '--cream': '#FDFDF9', '--linen': '#E6E7DD',
      '--terra': '#6E88A8', '--terra-dk': '#485F7D', '--terra-lt': '#AEC0D6',
      '--espresso': '#1E2530', '--walnut': '#3E4E63', '--ink': '#1E2530', '--muted': '#8391A0',
      '--sidebar': '#1E2530', '--s-text': '#EFF1F5', '--s-dim': '#6C7A8A',
      '--btn-shadow': '0 2px 8px rgba(110,136,168,.32)'
    }
  },
  creamBerry: {
    name: 'Cream & Berry',
    vars: {
      '--parchment': '#F7F2ED', '--cream': '#FFFCF9', '--linen': '#EEE3DB',
      '--terra': '#E1608B', '--terra-dk': '#C2295C', '--terra-lt': '#F3C8D7',
      '--espresso': '#321B22', '--walnut': '#75384D', '--ink': '#321B22', '--muted': '#C57794',
      '--sidebar': '#321B22', '--s-text': '#F6ECEE', '--s-dim': '#B85177',
      '--btn-shadow': '0 2px 8px rgba(225,96,139,.32)'
    }
  }
};

export const DEFAULT_PALETTE = 'terracotta';

export function applyPalette(key) {
  const p = PALETTES[key];
  if (!p) return;
  const root = document.documentElement;
  Object.entries(p.vars).forEach(([k, v]) => root.style.setProperty(k, v));
}
