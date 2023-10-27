# கிளி
[![கிளி சோதனைகள்](https://github.com/lassi-niruvanam/kili/actions/workflows/%E0%AE%9A%E0%AF%8B%E0%AE%A4%E0%AE%A9%E0%AF%88%E0%AE%95%E0%AE%B3%E0%AF%8D.yml/badge.svg?branch=%E0%AE%AE%E0%AE%A4%E0%AF%8D%E0%AE%A4%E0%AE%BF%E0%AE%AF)](https://github.com/lassi-niruvanam/kili/actions/workflows/%E0%AE%9A%E0%AF%8B%E0%AE%A4%E0%AE%A9%E0%AF%88%E0%AE%95%E0%AE%B3%E0%AF%8D.yml)
[![codecov](https://codecov.io/gh/lassi-niruvanam/kili/graph/badge.svg?token=D41D2XBE0P)](https://codecov.io/gh/lassi-niruvanam/kili)
## நிருவல்


```sh
$ pnpm install @lassi-js/kili
```

Si vous développez une application dans un autre langage (p. ex., Python),
nous vous recommandons d'utiliser le [serveur WS Constellation](https://github.com/reseau-constellation/serveur-ws) ou bien l'un de ses clients pré-fabriqués
([Python](https://github.com/reseau-constellation/client-python),
[R](https://github.com/reseau-constellation/client-r), [Julia](https://github.com/reseau-constellation/Constellation.jl))
selon le langage de votre projet.

## Utilisation
Une fois l'IPA installé, vous pouvez importer Constellation et l'utiliser dans vos
projets.

```TypeScript
import { générerClient } from "@constl/ipa";

const client = générerClient();
...

```

## Documentation
Pour la documentation complète de Constellation, rendez-vous au https://docu.réseau-constellation.ca.
