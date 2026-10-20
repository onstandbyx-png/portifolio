# Runtimes do laboratório

| Arquivo | Origem | Licença |
|---|---|---|
| `rive.js` | Pacote npm `@rive-app/canvas` 2.45.0, empacotado com esbuild (expõe `window.RiveRT`) | MIT, Rive |
| `rive.wasm` | `@rive-app/canvas` 2.45.0, `rive.wasm` sem alteração | MIT, Rive |
| `lottie.js` | Pacote npm `lottie-web` 5.13.0, `build/player/lottie_svg`, empacotado com esbuild (expõe `window.LottieRT`) | MIT, Copyright (c) 2015 Bodymovin |

Os arquivos .riv e .json dos originais não estão neste repositório: o navegador
os baixa em tempo de execução de `public.rive.app` (Rive Marketplace, CC BY 4.0)
e `assets-v2.lottiefiles.com` (Lottie Simple License). O crédito de cada autor
aparece no cartão do original.
