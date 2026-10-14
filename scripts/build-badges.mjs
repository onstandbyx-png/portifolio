import { build } from "esbuild";
await build({
 entryPoints:["src/badges/index.ts"],
 outdir:"public/assets/badge-build",
 bundle:true, splitting:true,format:"esm",
 platform:"browser",target:["es2022"],minify:true,
 sourcemap:false,chunkNames:"chunks/[name]-[hash]",logLevel:"info"
});
