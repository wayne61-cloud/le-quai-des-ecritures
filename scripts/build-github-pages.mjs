import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const repoName = "le-quai-des-ecritures";
const basePath = `/${repoName}/`;
const outputDir = "gh-pages-dist";
const publicDir = ".output/public";
const assetsDir = join(publicDir, "assets");

const files = await readdir(assetsDir);
const findAsset = (prefix, suffix) => {
  const file = files.find((item) => item.startsWith(prefix) && item.endsWith(suffix));
  if (!file) throw new Error(`Missing generated asset: ${prefix}*${suffix}`);
  return `${basePath}assets/${file}`;
};

const indexJs = findAsset("index-", ".js");
const routesJs = findAsset("routes-", ".js");
const scrollJs = findAsset("scroll-state-", ".js");
const stylesCss = findAsset("styles-", ".css");

await rm(outputDir, { force: true, recursive: true });
await mkdir(outputDir, { recursive: true });
await cp(publicDir, outputDir, { recursive: true });
await writeFile(join(outputDir, ".nojekyll"), "");

const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Yohann-Axel Bouah — Le Quai des Écritures | Portfolio comptable</title>
    <meta
      name="description"
      content="Portfolio interactif 3D de Yohann-Axel Bouah, étudiant BTS Comptabilité & Gestion à Lille. Une promenade côtière narrative : plage, repères dorés, ponton et horizon."
    />
    <meta name="author" content="Yohann-Axel Bouah" />
    <meta property="og:title" content="Yohann-Axel Bouah — Le Quai des Écritures" />
    <meta
      property="og:description"
      content="Un parcours comptable, raconté comme une promenade au bord de l'eau. Portfolio 3D immersif."
    />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="${basePath}favicon.ico" type="image/x-icon" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
    />
    <link rel="stylesheet" href="${stylesCss}" />
    <link rel="modulepreload" href="${indexJs}" />
    <link rel="modulepreload" href="${routesJs}" />
    <link rel="modulepreload" href="${scrollJs}" />
  </head>
  <body>
    <div class="flex min-h-screen w-full items-center justify-center bg-[#07111b] text-[#fff7e8]">
      <div class="text-center">
        <div class="mx-auto h-1 w-16 animate-shimmer rounded-full bg-[#d6b36a]"></div>
        <p class="mt-4 font-hand text-[#d6b36a]">Le quai s'éveille...</p>
      </div>
    </div>
    <script type="module" async src="${indexJs}"></script>
  </body>
</html>
`;

await writeFile(join(outputDir, "index.html"), html);
await writeFile(join(outputDir, "404.html"), html);
