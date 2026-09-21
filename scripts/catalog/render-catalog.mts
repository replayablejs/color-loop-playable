import { toHtml } from 'hast-util-to-html';
import { h } from 'hastscript';

import { testingTools } from './testing-tools.mts';
import type { CatalogExport, CatalogLanguage, CatalogPack } from './types.mts';

const languages = new Intl.DisplayNames(['en'], { type: 'language' });
const networkNames: Record<string, string> = {
  preview: 'Browser preview',
  applovin: 'AppLovin',
  meta: 'Meta',
  google: 'Google',
  liftoff: 'Liftoff',
  mintegral: 'Mintegral',
  moloco: 'Moloco',
  unity: 'Unity',
};

export function renderCatalog(packs: CatalogPack[]): string {
  const document = h(null, [
    { type: 'doctype' },
    h('html', { lang: 'en' }, [
      h('head', [
        h('meta', { charset: 'utf-8' }),
        h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
        h('meta', {
          name: 'description',
          content:
            'Play Color Loop in your browser or download network-ready exports, built with Replayable.',
        }),
        h('title', 'Color Loop · Playable catalog'),
        h('link', { rel: 'stylesheet', href: './catalog.css' }),
      ]),
      h('body', [
        h('header', [
          h('p.eyebrow', 'BUILT WITH REPLAYABLE'),
          h('h1', 'Color Loop'),
          h(
            'p.intro',
            'Choose a puzzle version, match colors on the conveyor, and clear the board.',
          ),
          h(
            'p.help',
            'Play opens a standalone browser preview. Download a network-ready HTML or ZIP export for testing or production campaigns. Each network download includes testing tools or setup guides. Use the matching network export; some tools require an account or mobile app.',
          ),
        ]),
        h('main', packs.map(renderPackCard)),
        h('footer', [
          h(
            'p',
            'Exports preserve the network-specific delivery format. Browser previews do not simulate an ad network’s host environment.',
          ),
          h('a', { href: 'https://github.com/replayablejs/replayable' }, 'Explore Replayable'),
        ]),
      ]),
    ]),
  ]);

  return `${toHtml(document)}\n`;
}

function renderPackCard(pack: CatalogPack) {
  return h('article.pack', { 'data-pack': pack.id }, [
    h('div.pack-heading', [h('h2', pack.name), h('p', pack.description)]),
    ...pack.languages.map(renderLanguage),
  ]);
}

function renderLanguage(language: CatalogLanguage) {
  const name = languages.of(language.code) ?? language.code;
  const preview = language.exports.find((entry) => entry.network === 'preview');

  return h('section.language', [
    h('div.language-heading', [
      h('h3', name),
      ...(preview
        ? [
            h(
              'a.play',
              {
                href: preview.href,
                target: '_blank',
                rel: 'noopener',
                'aria-label': `Play ${name} preview`,
              },
              'Play preview ↗',
            ),
          ]
        : [h('span', 'No browser preview in this build')]),
    ]),
    h('details', [
      h('summary', `Download exports (${language.exports.length})`),
      h('ul.exports', language.exports.map(renderExport)),
    ]),
  ]);
}

function renderExport(entry: CatalogExport) {
  const tools = testingTools[entry.network] ?? [];
  const format = entry.href.split('.').at(-1)?.toUpperCase();
  const size = new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(
    entry.size / 1_000_000,
  );

  return h('li', [
    h('a.download', { href: entry.href, download: true }, [
      h('span', `Download ${networkNames[entry.network] ?? entry.network}`),
      h('span.file-info', `${format} · ${size} MB ↓`),
    ]),
    ...tools.map((tool) =>
      h(
        'a.testing-tool',
        { href: tool.url, target: '_blank', rel: 'noopener noreferrer' },
        `${tool.name} ↗`,
      ),
    ),
  ]);
}
