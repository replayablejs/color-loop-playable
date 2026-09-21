import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createVariants } from '@replayablejs/config';
import { exportProject } from '@replayablejs/export';

import config from '../replayable.config.ts';
import { packs } from './catalog/packs.mts';
import { renderCatalog } from './catalog/render-catalog.mts';
import type { CatalogPack } from './catalog/types.mts';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const outputDirectory = join(projectRoot, '.site');
const variants = createVariants(config);

// Use the public export result: filenames and delivery formats belong to Replayable.
const result = await exportProject(config, { projectRoot });
const catalog: CatalogPack[] = [];

for (const artifact of result.variants) {
  const variant = variants.find((candidate) => candidate.id === artifact.variantId);
  if (!variant) {
    throw new Error(`Unknown exported variant: ${artifact.variantId}`);
  }

  let pack = catalog.find((candidate) => candidate.id === variant.version);
  if (!pack) {
    pack = {
      id: variant.version,
      name: packs[variant.version]?.name ?? variant.version,
      description: packs[variant.version]?.description ?? 'Explore this Color Loop version.',
      languages: [],
    };
    catalog.push(pack);
  }

  let language = pack.languages.find(
    (candidate) => candidate.code === variant.localization.language,
  );
  if (!language) {
    language = { code: variant.localization.language, exports: [] };
    pack.languages.push(language);
  }

  language.exports.push({
    network: variant.network,
    href: `./exports/${encodeURIComponent(basename(artifact.file))}`,
    size: artifact.size,
  });
}

const html = renderCatalog(catalog);

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(join(outputDirectory, 'exports'), { recursive: true });
for (const artifact of result.variants) {
  await cp(artifact.file, join(outputDirectory, 'exports', basename(artifact.file)));
}
await cp(new URL('./catalog/catalog.css', import.meta.url), join(outputDirectory, 'catalog.css'));
await writeFile(join(outputDirectory, 'index.html'), html);
await writeFile(join(outputDirectory, '.nojekyll'), '');

console.log(
  `Catalog: ${catalog.length} packs, ${result.variants.length} exports → .site/index.html`,
);
