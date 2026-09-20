import type { StyleSpecification } from 'maplibre-gl';
import { LANDCOVER_MIN_ZOOM, MAP_THEME, applyBlackTheme, fallbackBlackStyle } from './map-style';

/** Representative slice of CARTO's Dark Matter layer ids (see map-style.ts). */
function sampleStyle(): StyleSpecification {
  return {
    version: 8,
    name: 'Dark Matter',
    sources: { carto: { type: 'vector', url: 'https://example.test/tiles.json' } },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#0e0e0e' } },
      { id: 'landcover', type: 'fill', source: 'carto', 'source-layer': 'landcover', paint: { 'fill-color': '#0e0e0e' } },
      { id: 'park_national_park', type: 'fill', source: 'carto', 'source-layer': 'park', minzoom: 9, paint: { 'fill-color': '#0e0e0e' } },
      { id: 'park_nature_reserve', type: 'fill', source: 'carto', 'source-layer': 'park', minzoom: 12, paint: { 'fill-color': '#0e0e0e' } },
      { id: 'landuse_residential', type: 'fill', source: 'carto', 'source-layer': 'landuse', minzoom: 6, paint: { 'fill-color': 'rgba(0,0,0,0.5)' } },
      { id: 'water', type: 'fill', source: 'carto', 'source-layer': 'water', paint: { 'fill-color': '#2C353C' } },
      { id: 'water_shadow', type: 'fill', source: 'carto', 'source-layer': 'water', paint: { 'fill-color': 'transparent' } },
      {
        id: 'building',
        type: 'fill',
        source: 'carto',
        'source-layer': 'building',
        paint: { 'fill-color': { stops: [[15.5, 'transparent'], [16, 'transparent']] } as never },
      },
      {
        id: 'building-top',
        type: 'fill',
        source: 'carto',
        'source-layer': 'building',
        paint: { 'fill-color': 'rgba(57, 57, 57, 1)', 'fill-outline-color': '#0e0e0e' },
      },
      { id: 'waterway', type: 'line', source: 'carto', 'source-layer': 'waterway', paint: { 'line-color': 'rgba(63, 90, 109, 1)' } },
      { id: 'road_mot_fill_noramp', type: 'line', source: 'carto', 'source-layer': 'transportation', paint: { 'line-color': 'rgba(73, 73, 73, 1)' } },
      { id: 'road_mot_case_noramp', type: 'line', source: 'carto', 'source-layer': 'transportation', paint: { 'line-color': '#232323' } },
      { id: 'road_minor_case', type: 'line', source: 'carto', 'source-layer': 'transportation', paint: { 'line-color': '#1c1c1c' } },
      { id: 'boundary_country_inner', type: 'line', source: 'carto', 'source-layer': 'boundary', paint: { 'line-color': '#666' } },
      { id: 'boundary_country_outline', type: 'line', source: 'carto', 'source-layer': 'boundary', paint: { 'line-color': '#2C353C', 'line-width': 8, 'line-opacity': 0.5 } },
      {
        id: 'place_city_r5',
        type: 'symbol',
        source: 'carto',
        'source-layer': 'place',
        layout: { 'text-field': '{name}' },
        paint: { 'text-color': 'rgba(211, 228, 236, 1)', 'text-halo-color': '#222', 'text-halo-width': 1, 'icon-color': '#666' },
      },
      { id: 'place_villages', type: 'symbol', source: 'carto', 'source-layer': 'place', filter: ['==', 'class', 'village'], layout: { 'text-field': '{name}' }, paint: { 'text-color': '#999' } },
      { id: 'place_country_2', type: 'symbol', source: 'carto', 'source-layer': 'place', layout: { 'text-field': '{name}' }, paint: { 'text-color': '#999' } },
      { id: 'poi_park', type: 'symbol', source: 'carto', 'source-layer': 'poi', layout: { 'text-field': '{name}' }, paint: { 'text-color': '#515151' } },
      { id: 'housenumber', type: 'symbol', source: 'carto', 'source-layer': 'housenumber', paint: { 'text-color': 'transparent' } },
    ],
  };
}

type Paint = Record<string, unknown>;
type Layout = Record<string, unknown>;

function layer(style: StyleSpecification, id: string) {
  const found = style.layers.find((l) => l.id === id);
  if (!found) throw new Error(`layer ${id} missing`);
  return found as unknown as { paint: Paint; layout: Layout; minzoom?: number };
}

describe('applyBlackTheme', () => {
  it('does not mutate the input style', () => {
    const input = sampleStyle();
    const snapshot = JSON.stringify(input);
    applyBlackTheme(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it('paints land, water and background in black tones', () => {
    const themed = applyBlackTheme(sampleStyle());
    expect(layer(themed, 'background').paint['background-color']).toBe(MAP_THEME.background);
    expect(layer(themed, 'water').paint['fill-color']).toBe(MAP_THEME.water);
    expect(layer(themed, 'waterway').paint['line-color']).toBe(MAP_THEME.waterLine);
    expect(layer(themed, 'landuse_residential').paint['fill-color']).toBe(MAP_THEME.landuse);
    expect(layer(themed, 'building-top').paint['fill-color']).toBe(MAP_THEME.building);
    expect(layer(themed, 'building-top').paint['fill-outline-color']).toBe(MAP_THEME.buildingOutline);
  });

  it('pushes forest, grass and park fills out of the overview zooms', () => {
    const themed = applyBlackTheme(sampleStyle());
    expect(layer(themed, 'landcover').paint['fill-color']).toBe(MAP_THEME.park);
    expect(layer(themed, 'landcover').minzoom).toBe(LANDCOVER_MIN_ZOOM);
    expect(layer(themed, 'park_national_park').minzoom).toBe(LANDCOVER_MIN_ZOOM);
    // A stricter provider minzoom is kept as-is.
    expect(layer(themed, 'park_nature_reserve').minzoom).toBe(12);
    // Residential land use blobs are overview noise as well.
    expect(layer(themed, 'landuse_residential').minzoom).toBe(LANDCOVER_MIN_ZOOM);
  });

  it('suppresses basemap labels for the given place names', () => {
    const themed = applyBlackTheme(sampleStyle(), { hideLabels: ['Szeged', 'Szolnok'] });
    // No existing filter → the exclusion becomes the filter.
    expect((layer(themed, 'place_city_r5') as unknown as { filter: unknown }).filter).toEqual(['!in', 'name', 'Szeged', 'Szolnok']);
    // Existing filter → wrapped in a legacy `all`.
    expect((layer(themed, 'place_villages') as unknown as { filter: unknown }).filter).toEqual([
      'all',
      ['==', 'class', 'village'],
      ['!in', 'name', 'Szeged', 'Szolnok'],
    ]);
    // Non-place symbols are untouched.
    expect((layer(themed, 'poi_park') as unknown as { filter?: unknown }).filter).toBeUndefined();
  });

  it('leaves place filters alone when no names are given', () => {
    const themed = applyBlackTheme(sampleStyle());
    expect((layer(themed, 'place_city_r5') as unknown as { filter?: unknown }).filter).toBeUndefined();
    expect((layer(themed, 'place_villages') as unknown as { filter: unknown }).filter).toEqual(['==', 'class', 'village']);
  });

  it('keeps intentionally transparent fills transparent', () => {
    const themed = applyBlackTheme(sampleStyle());
    expect(layer(themed, 'water_shadow').paint['fill-color']).toBe('transparent');
    expect(layer(themed, 'building').paint['fill-color']).toEqual({ stops: [[15.5, 'transparent'], [16, 'transparent']] });
  });

  it('applies the road hierarchy to fills and casings', () => {
    const themed = applyBlackTheme(sampleStyle());
    expect(layer(themed, 'road_mot_fill_noramp').paint['line-color']).toBe(MAP_THEME.roadMajor);
    // Casings are the only road representation until the fill layer's zoom, so they are
    // zoom-stepped: road-colored below that zoom, dark outline above it.
    expect(layer(themed, 'road_mot_case_noramp').paint['line-color']).toEqual(MAP_THEME.roadMajorCase);
    expect(layer(themed, 'road_minor_case').paint['line-color']).toEqual(MAP_THEME.roadMinorCase);
    expect(MAP_THEME.roadMinorCase).toEqual(['step', ['zoom'], '#222226', 15, '#121214']);
  });

  it('draws country borders as a thin line and hides the glow halo', () => {
    const themed = applyBlackTheme(sampleStyle());
    expect(layer(themed, 'boundary_country_inner').paint['line-color']).toBe(MAP_THEME.boundaryCountry);
    expect(layer(themed, 'boundary_country_outline').layout['visibility']).toBe('none');
  });

  it('tiers label colors, adds black halos and hides POIs / house numbers', () => {
    const themed = applyBlackTheme(sampleStyle());
    const city = layer(themed, 'place_city_r5');
    expect(city.paint['text-color']).toBe(MAP_THEME.textStrong);
    expect(city.paint['text-halo-color']).toBe(MAP_THEME.halo);
    expect(city.paint['text-halo-width']).toBe(1.4);
    expect(city.paint['icon-color']).toBe(MAP_THEME.icon);
    expect(layer(themed, 'place_villages').paint['text-color']).toBe(MAP_THEME.text);
    expect(layer(themed, 'place_country_2').paint['text-color']).toBe(MAP_THEME.textMuted);
    expect(layer(themed, 'poi_park').layout['visibility']).toBe('none');
    expect(layer(themed, 'housenumber').layout['visibility']).toBe('none');
  });

  it('renames the style so the theme is visible in debugging tools', () => {
    expect(applyBlackTheme(sampleStyle()).name).toBe('Dark Matter — Black');
  });
});

describe('fallbackBlackStyle', () => {
  it('is a valid raster style with attribution and a black background', () => {
    const style = fallbackBlackStyle();
    expect(style.version).toBe(8);
    expect(style.layers[0]).toMatchObject({ type: 'background', paint: { 'background-color': MAP_THEME.background } });
    expect(style.layers[1]).toMatchObject({ type: 'raster', source: 'carto' });
    const source = style.sources['carto'] as { type: string; tiles: string[]; attribution: string };
    expect(source.type).toBe('raster');
    expect(source.tiles.length).toBe(4);
    expect(source.attribution).toContain('OpenStreetMap');
    expect(source.attribution).toContain('CARTO');
  });
});
