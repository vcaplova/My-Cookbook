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
  orchidMauve: {
    name: 'Orchid Mauve',
    vars: {
      '--parchment': '#EEEAF0', '--cream': '#F8F6F9', '--linen': '#E2DCE5',
      '--terra': '#844EA2', '--terra-dk': '#5B3371', '--terra-lt': '#D0BEDA',
      '--espresso': '#281F2E', '--walnut': '#5B4766', '--ink': '#281F2E', '--muted': '#8F799A',
      '--sidebar': '#281F2E', '--s-text': '#F5F4F6', '--s-dim': '#9885A3',
      '--btn-shadow': '0 2px 8px rgba(132,78,162,.32)'
    }
  },
  roseQuartz: {
    name: 'Rose Quartz',
    vars: {
      '--parchment': '#F0EAEC', '--cream': '#F9F6F7', '--linen': '#E5DCDF',
      '--terra': '#D34576', '--terra-dk': '#A82451', '--terra-lt': '#DEBAC6',
      '--espresso': '#2E1F24', '--walnut': '#664752', '--ink': '#2E1F24', '--muted': '#9A7984',
      '--sidebar': '#2E1F24', '--s-text': '#F6F4F4', '--s-dim': '#A3858F',
      '--btn-shadow': '0 2px 8px rgba(211,69,118,.32)'
    }
  },
  blueberryPlum: {
    name: 'Blueberry Plum',
    vars: {
      '--parchment': '#EAEBF0', '--cream': '#F6F6F9', '--linen': '#DCDDE4',
      '--terra': '#424494', '--terra-dk': '#282A61', '--terra-lt': '#BCBCDC',
      '--espresso': '#1D1E34', '--walnut': '#44446A', '--ink': '#1D1E34', '--muted': '#77789C',
      '--sidebar': '#1D1E34', '--s-text': '#F4F4F6', '--s-dim': '#8383A5',
      '--btn-shadow': '0 2px 8px rgba(66,68,148,.32)'
    }
  },
  sageGarden: {
    name: 'Sage Garden',
    vars: {
      '--parchment': '#EDF0EA', '--cream': '#F7F9F6', '--linen': '#E0E4DC',
      '--terra': '#69894D', '--terra-dk': '#435A2F', '--terra-lt': '#B0895C',
      '--espresso': '#282F23', '--walnut': '#56614C', '--ink': '#282F23', '--muted': '#89977D',
      '--sidebar': '#282F23', '--s-text': '#F5F6F4', '--s-dim': '#93A088',
      '--btn-shadow': '0 2px 8px rgba(105,137,77,.32)'
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
