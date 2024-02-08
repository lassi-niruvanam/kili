import type { ClientConstellation, bds, tableaux, types, créerConstellation } from "@constl/ipa";

import deepcopy from "deepcopy";

import {
  ignorerNonDéfinis,
  suivreBdDeFonction,
  uneFois,
  suivreBdsDeFonctionListe,
} from "@constl/utils-ipa";

import {
  மாறிலிகள் as முன்னிருப்பாக_மாறிலிகள்,
  தேதி_நெடுவரிசை_அடையாளம்,
  தேதி_மாறி_அடையாளம்,
  பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்,
  பங்கேற்பாளர்_மாறி_அடையாளம்,
  அங்கீகார_தத_மீதரவு_சாபி,
} from "@/மாறிலிகள்.js";

const குறியீட்டு_இல்லாமல்_வார்ப்புரு = (
  வார்ப்புரு: bds.schémaSpécificationBd,
): bds.schémaSpécificationBd => {
  வார்ப்புரு = deepcopy(வார்ப்புரு);
  வார்ப்புரு.tableaux = வார்ப்புரு.tableaux.map((tableau) => ({
    clef: tableau.clef,
    cols: tableau.cols.map((col) => ({
      idColonne: col.idColonne,
      idVariable: col.idVariable,
      optionnelle: col.optionnelle,
    })),
  }));
  return வார்ப்புரு;
};
export type பரிந்துரை_வகை = { [சாபி: string]: types.élémentsBd };
export type தேதியுடன்_பரிந்துரை_வகை<
  வ extends பரிந்துரை_வகை,
  தேதி_நெடுவரிசை_வ extends string = typeof தேதி_நெடுவரிசை_அடையாளம்,
> = வ & {
  [தேதி in தேதி_நெடுவரிசை_வ]: number;
};

export type பிணையம்_பரிந்துரை<
  வ extends பரிந்துரை_வகை,
  தேதி_நெடுவரிசை_வ extends string = typeof தேதி_நெடுவரிசை_அடையாளம்,
> = {
  பங்கேற்பாளர்: string;
  அடையாளம்: string;
  பரிந்துரை: தேதியுடன்_பரிந்துரை_வகை<வ, தேதி_நெடுவரிசை_வ>;
};

export type அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
  வ extends பரிந்துரை_வகை,
  பங்கேற்பாளர்_நெடுவரிசை_வ extends
    string = typeof பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்,
  தேதி_நெடுவரிசை_வ extends string = typeof தேதி_நெடுவரிசை_அடையாளம்,
> = தேதியுடன்_பரிந்துரை_வகை<வ, தேதி_நெடுவரிசை_வ> & {
  [பங்கேற்பாளர் in பங்கேற்பாளர்_நெடுவரிசை_வ]: string;
};

export class கிளி<
  வ extends பரிந்துரை_வகை,
  பங்கேற்பாளர்_நெடுவரிசை_வ extends
    string = typeof பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்,
  தேதி_நெடுவரிசை_வ extends string = typeof தேதி_நெடுவரிசை_அடையாளம்,
> {
  விண்மீன்: ReturnType<typeof créerConstellation>;

  அட்டவணை_சாபி: string;
  குழு_அடையாளம்: string;
  வார்ப்புரு: bds.schémaSpécificationBd;

  மாறிலிகள்: Omit<
    typeof முன்னிருப்பாக_மாறிலிகள்,
    "பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்" | "தேதி_நெடுவரிசை_அடையாளம்"
  > & {
    பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்: பங்கேற்பாளர்_நெடுவரிசை_வ;
    தேதி_நெடுவரிசை_அடையாளம்: தேதி_நெடுவரிசை_வ;
  };

  constructor({
    விண்மீன்,
    அட்டவணை_சாபி,
    குழு_அடையாளம்,
    வார்ப்புரு,
    மாறிலிகள்,
  }: {
    விண்மீன்: ClientConstellation;
    அட்டவணை_சாபி: string;
    குழு_அடையாளம்: string;
    வார்ப்புரு: bds.schémaSpécificationBd;
    மாறிலிகள்?: Partial<
      கிளி<வ, பங்கேற்பாளர்_நெடுவரிசை_வ, தேதி_நெடுவரிசை_வ>["மாறிலிகள்"]
    >;
  }) {
    this.விண்மீன் = விண்மீன்;

    this.அட்டவணை_சாபி = அட்டவணை_சாபி;
    this.குழு_அடையாளம் = குழு_அடையாளம்;
    வார்ப்புரு = கிளி.வார்ப்புரு_தயாரிப்பு({
      வார்ப்புரு,
      அட்டவணை_சாபி,
      குழு_அடையாளம்,
      மாறிலிகள்,
    });
    this.வார்ப்புரு = குறியீட்டு_இல்லாமல்_வார்ப்புரு(வார்ப்புரு);
    this.மாறிலிகள் = Object.assign({}, முன்னிருப்பாக_மாறிலிகள், மாறிலிகள்);
  }

  static வார்ப்புரு_தயாரிப்பு({
    வார்ப்புரு,
    அட்டவணை_சாபி,
    குழு_அடையாளம்,
    மாறிலிகள்,
  }: {
    வார்ப்புரு: bds.schémaSpécificationBd;
    அட்டவணை_சாபி: string;
    குழு_அடையாளம்: string;
    மாறிலிகள்?: Partial<{
      தேதி_நெடுவரிசை_அடையாளம்: string;
      தேதி_மாறி_அடையாளம்: string;
    }>;
  }): bds.schémaSpécificationBd {
    const நகல்: bds.schémaSpécificationBd = deepcopy(வார்ப்புரு);

    const வேண்டிய_அட்டவணை = நகல்.tableaux.find(
      (அட்டவணை) => அட்டவணை.clef === அட்டவணை_சாபி,
    );

    if (!வேண்டிய_அட்டவணை)
      throw new Error("அட்டவணை சாபி அட்டவணை வார்ப்புரில் கிடைத்ததில்லை.");
    const தேதி_நெடுவரிசை_உள்ளதா = வேண்டிய_அட்டவணை.cols.find(
      (நெடுவரிசை) =>
        நெடுவரிசை.idColonne ===
        (மாறிலிகள்?.தேதி_நெடுவரிசை_அடையாளம் || தேதி_நெடுவரிசை_அடையாளம்),
    );
    if (!தேதி_நெடுவரிசை_உள்ளதா) {
      வேண்டிய_அட்டவணை.cols.push({
        idVariable: மாறிலிகள்?.தேதி_மாறி_அடையாளம் || தேதி_மாறி_அடையாளம்,
        idColonne:
          மாறிலிகள்?.தேதி_நெடுவரிசை_அடையாளம் || தேதி_நெடுவரிசை_அடையாளம்,
      });
      நகல்.tableaux = நகல்.tableaux.map((அ) => {
        if (அ.clef === அட்டவணை_சாபி) {
          return வேண்டிய_அட்டவணை;
        } else {
          return அ;
        }
      });
    }

    if (!நகல்.nuées) {
      நகல்.nuées = [];
    }

    if (!நகல்.nuées.includes(குழு_அடையாளம்)) {
      நகல்.nuées.push(குழு_அடையாளம்);
    }

    return நகல்;
  }

  static async உருவாக்கு({
    விண்மீன்,
    வார்ப்புரு,
    அட்டவணை_சாபி,
    பேற்றோர்,
    மாறிலிகள்,
  }: {
    விண்மீன்: ClientConstellation;
    வார்ப்புரு: bds.schémaSpécificationBd;
    அட்டவணை_சாபி: string;
    பேற்றோர்?: string;
    மாறிலிகள்?: Partial<typeof முன்னிருப்பாக_மாறிலிகள்>;
  }): Promise<string> {
    if (!விண்மீன்.nuées || !விண்மீன்.bds)
      throw new Error("விண்மீன் தயராரானதில்லை");

    const குழு_அடையாளம் = await விண்மீன்.nuées.créerNuée({
      nuéeParent: பேற்றோர்,
    });
    வார்ப்புரு = this.வார்ப்புரு_தயாரிப்பு({
      வார்ப்புரு,
      அட்டவணை_சாபி,
      குழு_அடையாளம்,
      மாறிலிகள்,
    });

    for (const அட்டவணை of வார்ப்புரு.tableaux) {
      const அட்டவணை_அடையாளம் = await விண்மீன்.nuées.ajouterTableauNuée({
        idNuée: குழு_அடையாளம்,
        clefTableau: அட்டவணை.clef,
      });
      for (const நெடுவரிசை of அட்டவணை.cols) {
        await விண்மீன்.nuées.ajouterColonneTableauNuée({
          idTableau: அட்டவணை_அடையாளம்,
          idVariable: நெடுவரிசை.idVariable,
          idColonne: நெடுவரிசை.idColonne,
        });
        if (நெடுவரிசை.index) {
          /*await விண்மீன்.nuées.changerColIndexTableauNuée({
            idTableau: அட்டவணை_அடையாளம்,
            idColonne: நெடுவரிசை.idColonne,
            val: true,
          });*/
        }
      }
      if (வார்ப்புரு.motsClefs) {
        await விண்மீன்.nuées.ajouterMotsClefsNuée({
          idNuée: குழு_அடையாளம்,
          idsMotsClefs: வார்ப்புரு.motsClefs,
        });
      }
    }

    const அங்கீகரிக்கப்பட்ட_தரவுத்தளம்_வார்ப்புரு: bds.schémaSpécificationBd = {
      licence: வார்ப்புரு.licence,
      motsClefs: வார்ப்புரு.motsClefs,
      tableaux: வார்ப்புரு.tableaux.map((அட்டவணை) => {
        if (அட்டவணை.clef === அட்டவணை_சாபி) {
          return {
            clef: அட்டவணை.clef,
            cols: [
              ...அட்டவணை.cols,
              {
                idColonne:
                  மாறிலிகள்?.பங்கேற்பாளர்_நெடுவரிசை_அடையாளம் ||
                  பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்,
                idVariable:
                  மாறிலிகள்?.பங்கேற்பாளர்_மாறி_அடையாளம் ||
                  பங்கேற்பாளர்_மாறி_அடையாளம்,
              },
            ],
          };
        } else {
          return அட்டவணை;
        }
      }),
    };

    const தரவுத்தளம் = await விண்மீன்.bds.créerBdDeSchéma({
      schéma: அங்கீகரிக்கப்பட்ட_தரவுத்தளம்_வார்ப்புரு,
    });
    await விண்மீன்.nuées.sauvegarderMétadonnéeNuée({
      idNuée: குழு_அடையாளம்,
      clef: அங்கீகார_தத_மீதரவு_சாபி,
      valeur: தரவுத்தளம்,
    });
    return குழு_அடையாளம்;
  }

  async அங்கீகரிக்கப்பட்ட_உறுப்படிகளை_கேள்ளு({
    செ,
  }: {
    செ: types.schémaFonctionSuivi<
      tableaux.élémentDonnées<
        அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
          வ,
          பங்கேற்பாளர்_நெடுவரிசை_வ,
          தேதி_நெடுவரிசை_வ
        >
      >[]
    >;
  }): Promise<types.schémaFonctionOublier> {
    return await suivreBdsDeFonctionListe({
      fListe: async (
        fSuivreRacine: (parents: string[]) => Promise<void>,
      ): Promise<types.schémaFonctionOublier> => {
        return await this.விண்மீன்.nuées.suivreNuéesParents({
          idNuée: this.குழு_அடையாளம்,
          f: (பேற்றோர்கள்) =>
            fSuivreRacine([this.குழு_அடையாளம், ...பேற்றோர்கள்].reverse()),
        });
      },
      f: async (
        உறுப்படிகள்: tableaux.élémentDonnées<
          அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
            வ,
            பங்கேற்பாளர்_நெடுவரிசை_வ,
            தேதி_நெடுவரிசை_வ
          >
        >[],
      ) => {
        return await செ(உறுப்படிகள்);
      },
      fBranche: async (
        அடையாளம்: string,
        fSuivreBranche: types.schémaFonctionSuivi<
          tableaux.élémentDonnées<
            அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
              வ,
              பங்கேற்பாளர்_நெடுவரிசை_வ,
              தேதி_நெடுவரிசை_வ
            >
          >[]
        >,
      ): Promise<types.schémaFonctionOublier> => {
        return await suivreBdDeFonction({
          fRacine: async ({
            fSuivreRacine,
          }: {
            fSuivreRacine: (nouvelIdBdCible?: string) => Promise<void>;
          }) => {
            return await this.அங்கீகார_தரவுத்தள்ளைப்_கேள்ளு({
              செ: fSuivreRacine,
              அடையாளம்,
            });
          },
          f: ignorerNonDéfinis(fSuivreBranche),
          fSuivre: async ({
            id,
            fSuivreBd,
          }: {
            id: string;
            fSuivreBd: types.schémaFonctionSuivi<
              tableaux.élémentDonnées<
                அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
                  வ,
                  பங்கேற்பாளர்_நெடுவரிசை_வ,
                  தேதி_நெடுவரிசை_வ
                >
              >[]
            >;
          }) => {
            return await this.விண்மீன்.bds.suivreDonnéesDeTableauParClef<
              அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
                வ,
                பங்கேற்பாளர்_நெடுவரிசை_வ,
                தேதி_நெடுவரிசை_வ
              >
            >({
              idBd: id,
              clefTableau: this.அட்டவணை_சாபி,
              f: fSuivreBd,
            });
          },
        });
      },
    });
  }

  async பரிந்துரைகளை_கேள்ளு({
    செ,
    சந்ததி = true,
  }: {
    செ: types.schémaFonctionSuivi<பிணையம்_பரிந்துரை<வ, தேதி_நெடுவரிசை_வ>[]>;
    சந்ததி?: boolean;
  }): Promise<types.schémaRetourFonctionRechercheParProfondeur> {
    return await this.விண்மீன்.nuées.suivreDonnéesTableauNuée<
      தேதியுடன்_பரிந்துரை_வகை<வ, தேதி_நெடுவரிசை_வ>
    >({
      idNuée: this.குழு_அடையாளம்,
      clefTableau: this.அட்டவணை_சாபி,
      héritage: சந்ததி ? ["ascendance", "descendance"] : ["ascendance"],
      f: async (த) => {
        await செ(
          த.map((இ) => {
            return {
              பங்கேற்பாளர்: இ.idCompte,
              அடையாளம்: இ.élément.id,
              பரிந்துரை: இ.élément.données,
            };
          }),
        );
      },
      nRésultatsDésirés: 1000,
    });
  }

  async என்_பரிந்துரைகளை_கேள்ளு({
    செ,
  }: {
    செ: types.schémaFonctionSuivi<பிணையம்_பரிந்துரை<வ, தேதி_நெடுவரிசை_வ>[]>;
  }): Promise<types.schémaFonctionOublier> {
    return await this.விண்மீன்.bds.suivreDonnéesDeTableauUnique<
      தேதியுடன்_பரிந்துரை_வகை<வ, தேதி_நெடுவரிசை_வ>
    >({
      schémaBd: this.வார்ப்புரு,
      idNuéeUnique: this.குழு_அடையாளம்,
      clefTableau: this.அட்டவணை_சாபி,
      f: async (பரிந்துரைகள்) => {
        const பங்கேற்பாளர் = await this.விண்மீன்.obtIdCompte();
        await செ(
          பரிந்துரைகள்.map((ப) => {
            return {
              பங்கேற்பாளர்,
              அடையாளம்: ப.id,
              பரிந்துரை: ப.données,
            };
          }),
        );
      },
    });
  }

  async பரிந்துரையு({ பரிந்துரை }: { பரிந்துரை: வ }): Promise<string> {
    const தேதியை_சேரு = (
      உறுப்படி: வ | தேதியுடன்_பரிந்துரை_வகை<வ, தேதி_நெடுவரிசை_வ>,
    ): தேதியுடன்_பரிந்துரை_வகை<வ, தேதி_நெடுவரிசை_வ> => {
      if (!உறுப்படி[this.மாறிலிகள்.தேதி_நெடுவரிசை_அடையாளம்]) {
        return {
          ...உறுப்படி,
          [this.மாறிலிகள்.தேதி_நெடுவரிசை_அடையாளம்]: Date.now(),
        };
      }
      return உறுப்படி as தேதியுடன்_பரிந்துரை_வகை<வ, தேதி_நெடுவரிசை_வ>;
    };

    const அடையாளம் = await this.விண்மீன்.bds.ajouterÉlémentÀTableauUnique<
      தேதியுடன்_பரிந்துரை_வகை<வ, தேதி_நெடுவரிசை_வ>
    >({
      schémaBd: this.வார்ப்புரு,
      idNuéeUnique: this.குழு_அடையாளம்,
      clefTableau: this.அட்டவணை_சாபி,
      vals: தேதியை_சேரு(பரிந்துரை),
    });

    return அடையாளம்[0];
  }

  async பரிந்துரையை_நீக்கு({ அடையாளம் }: { அடையாளம்: string }) {
    return await this.விண்மீன்.bds.effacerÉlémentDeTableauUnique({
      schémaBd: this.வார்ப்புரு,
      idNuéeUnique: this.குழு_அடையாளம்,
      clefTableau: this.அட்டவணை_சாபி,
      idÉlément: அடையாளம்,
    });
  }

  async பரிந்துரையை_திருத்து({
    பரிந்துரை,
    அடையாளம்,
  }: {
    பரிந்துரை: வ;
    அடையாளம்: string;
  }) {
    await this.விண்மீன்.bds.modifierÉlémentDeTableauUnique({
      schémaBd: this.வார்ப்புரு,
      idNuéeUnique: this.குழு_அடையாளம்,
      clefTableau: this.அட்டவணை_சாபி,
      vals: பரிந்துரை,
      idÉlément: அடையாளம்,
    });
  }

  async அங்கீகார_தரவுத்தள்ளைப்_கேள்ளு({
    செ,
    அடையாளம்,
  }: {
    செ: types.schémaFonctionSuivi<string>;
    அடையாளம்?: string;
  }): Promise<types.schémaFonctionOublier> {
    const இறுதியான_செயலி = async (மீத்தரவு: {
      [clef: string]: types.élémentsBd;
    }) => {
      const தரவுத்தள_அடையாளம் =
        மீத்தரவு[this.மாறிலிகள்.அங்கீகார_தத_மீதரவு_சாபி];
      if (typeof தரவுத்தள_அடையாளம் === "string")
        return await செ(தரவுத்தள_அடையாளம்);
    };
    return await this.விண்மீன்.nuées.suivreMétadonnéesNuée({
      idNuée: அடையாளம் || this.குழு_அடையாளம்,
      f: இறுதியான_செயலி,
    });
  }

  async அங்கீகார_தரவுத்தத்தைப்_பெறு(): Promise<string> {
    const தரவுத்தள_அடையாளம் = await uneFois(
      async (செ: types.schémaFonctionSuivi<string>) => {
        return await this.அங்கீகார_தரவுத்தள்ளைப்_கேள்ளு({ செ });
      },
    );
    return தரவுத்தள_அடையாளம்;
  }

  async அங்கீகரி({
    பரிந்துரை,
  }: {
    பரிந்துரை: பிணையம்_பரிந்துரை<வ, தேதி_நெடுவரிசை_வ>;
  }): Promise<string> {
    const தரவுத்தள_அடையாளம் = await this.அங்கீகார_தரவுத்தத்தைப்_பெறு();

    const பரிந்துரை_உறுப்படி: அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
      வ,
      பங்கேற்பாளர்_நெடுவரிசை_வ,
      தேதி_நெடுவரிசை_வ
    > = Object.assign({}, பரிந்துரை.பரிந்துரை, {
      [this.மாறிலிகள்.பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்]: பரிந்துரை.பங்கேற்பாளர்,
    });

    const ஏற்கனவே_அங்கீகரிக்கப்பட்டவை = await uneFois(
      async (
        செ: types.schémaFonctionSuivi<
          tableaux.élémentDonnées<
            அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
              வ,
              பங்கேற்பாளர்_நெடுவரிசை_வ,
              தேதி_நெடுவரிசை_வ
            >
          >[]
        >,
      ) => {
        return await this.அங்கீகரிக்கப்பட்ட_உறுப்படிகளை_கேள்ளு({ செ });
      },
    );

    const இருக்கும்_உறுப்படி = ஏற்கனவே_அங்கீகரிக்கப்பட்டவை.find((அங்கீ) =>
      this.குறியீட்டு_நெடுவரிசைகள்_சமம்(அங்கீ.données, பரிந்துரை_உறுப்படி),
    );

    if (இருக்கும்_உறுப்படி) {
      // இந்த குறியீட்டு நெடுவரிசைகளின் மதிப்புகளுடன் இன்னொரு அங்கீகரிக்கப்பட்ட பரிந்துரை ஏற்கனவே இருந்தால், அதை திருத்தவும்.
      // விண்மீனின் bds.ajouterÉlément என்று செயலிக்கு சமீபத்தில் வரும் மாற்றங்களுடன் ஒரு வேளை இது இனிமேல் தேவைப்படாது.
      await this.அங்கீகரிக்கப்பட்ட_உறுப்படியை_திருத்து({
        பரிந்துரை,
        அடையாளம்: இருக்கும்_உறுப்படி.id,
      });
      return இருக்கும்_உறுப்படி.id;
    } else {
      return (
        await this.விண்மீன்.bds.ajouterÉlémentÀTableauParClef({
          idBd: தரவுத்தள_அடையாளம்,
          clefTableau: this.அட்டவணை_சாபி,
          vals: பரிந்துரை_உறுப்படி,
        })
      )[0];
    }
  }

  async அங்கீகரிக்கப்பட்ட_உறுப்படியை_நீக்கு({
    அடையாளம்,
  }: {
    அடையாளம்: string;
  }) {
    const தரவுத்தள_அடையாளம் = await this.அங்கீகார_தரவுத்தத்தைப்_பெறு();

    await this.விண்மீன்.bds.effacerÉlémentDeTableauParClef({
      idBd: தரவுத்தள_அடையாளம்,
      clefTableau: this.அட்டவணை_சாபி,
      idÉlément: அடையாளம்,
    });
  }

  async அங்கீகரிக்கப்பட்ட_உறுப்படியை_திருத்து({
    பரிந்துரை,
    அடையாளம்,
  }: {
    பரிந்துரை: பிணையம்_பரிந்துரை<வ, தேதி_நெடுவரிசை_வ>;
    அடையாளம்: string;
  }) {
    const தரவுத்தள_அடையாளம் = await this.அங்கீகார_தரவுத்தத்தைப்_பெறு();

    await this.விண்மீன்.bds.modifierÉlémentDeTableauParClef({
      idBd: தரவுத்தள_அடையாளம்,
      clefTableau: this.அட்டவணை_சாபி,
      idÉlément: அடையாளம்,
      vals: {
        ...பரிந்துரை.பரிந்துரை,
        [this.மாறிலிகள்.பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்]:
          பரிந்துரை.பங்கேற்பாளர்,
      },
    });
  }

  குறியீட்டு_நெடுவரிசைகள்_சமம்(
    இ: அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
      வ,
      பங்கேற்பாளர்_நெடுவரிசை_வ,
      தேதி_நெடுவரிசை_வ
    >,
    ஈ: அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
      வ,
      பங்கேற்பாளர்_நெடுவரிசை_வ,
      தேதி_நெடுவரிசை_வ
    >,
  ): boolean {
    const குறியீட்டு_நெடுவரிசைகள் =
      this.வார்ப்புரு.tableaux
        .find((அட்டவணை) => அட்டவணை.clef === this.அட்டவணை_சாபி)
        ?.cols.filter((நெடுவரிசை) => நெடுவரிசை.index)
        .map((நெடுவரிசை) => நெடுவரிசை.idColonne) || [];
    return குறியீட்டு_நெடுவரிசைகள்.every(
      (நெடுவரிசை) => இ[நெடுவரிசை] === ஈ[நெடுவரிசை],
    );
  }

  async உறுப்படிகளை_கேள்ளு({
    செ,
    பரிந்துரைகள் = "எனது",
  }: {
    செ: types.schémaFonctionSuivi<
      அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
        வ,
        பங்கேற்பாளர்_நெடுவரிசை_வ,
        தேதி_நெடுவரிசை_வ
      >[]
    >;
    பரிந்துரைகள்?: "எனது" | "அனைத்தும்";
  }): Promise<types.schémaFonctionOublier> {
    const தகவல்கள்: {
      அங்கீகரிக்கப்பட்டவை: அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
        வ,
        பங்கேற்பாளர்_நெடுவரிசை_வ,
        தேதி_நெடுவரிசை_வ
      >[];
      பந்திருரைக்கப்பட்டவை: அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
        வ,
        பங்கேற்பாளர்_நெடுவரிசை_வ,
        தேதி_நெடுவரிசை_வ
      >[];
    } = {
      அங்கீகரிக்கப்பட்டவை: [],
      பந்திருரைக்கப்பட்டவை: [],
    };

    const செ_கடைசி = async () => {
      const உறுப்படிகள்: அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
        வ,
        பங்கேற்பாளர்_நெடுவரிசை_வ,
        தேதி_நெடுவரிசை_வ
      >[] = [];
      for (const ப of தகவல்கள்.பந்திருரைக்கப்பட்டவை) {
        const முந்தையானது = உறுப்படிகள்.find((இ) =>
          this.குறியீட்டு_நெடுவரிசைகள்_சமம்(இ, ப),
        );

        if (முந்தையானது) {
          // எல்லோரை விட புதுமையான பரிந்துரையை மட்டும் உள்ளிடவும்
          const தேதி_முந்தையானது =
            முந்தையானது[this.மாறிலிகள்.தேதி_நெடுவரிசை_அடையாளம்];
          const தேதி_புதுசு = ப[this.மாறிலிகள்.தேதி_நெடுவரிசை_அடையாளம்];
          if (
            தேதி_முந்தையானது &&
            தேதி_புதுசு &&
            தேதி_புதுசு > தேதி_முந்தையானது
          ) {
            உறுப்படிகள்.splice(உறுப்படிகள்.indexOf(முந்தையானது), 1);
            உறுப்படிகள்.push(ப);
          }
        } else {
          உறுப்படிகள்.push(ப);
        }
      }
      for (const ப of தகவல்கள்.அங்கீகரிக்கப்பட்டவை) {
        const முந்தையானது = உறுப்படிகள்.find((இ) =>
          this.குறியீட்டு_நெடுவரிசைகள்_சமம்(இ, ப),
        );
        if (முந்தையானது) {
          உறுப்படிகள்.splice(உறுப்படிகள்.indexOf(முந்தையானது), 1);
        }
        உறுப்படிகள்.push(ப);
      }

      return await செ(உறுப்படிகள்);
    };

    const அங்கீகரிக்கப்பட்டவையை_மறந்துவிடு =
      await this.அங்கீகரிக்கப்பட்ட_உறுப்படிகளை_கேள்ளு({
        செ: async (இ) => {
          தகவல்கள்.அங்கீகரிக்கப்பட்டவை = இ.map((ஈ) => ஈ.données);
          await செ_கடைசி();
        },
      });
    const செ_மறந்துவிடு = [அங்கீகரிக்கப்பட்டவையை_மறந்துவிடு];
    if (பரிந்துரைகள் === "அனைத்தும்") {
      const பரிந்துரைக்கப்பட்டவையை_மறந்துவிடு = await this.பரிந்துரைகளை_கேள்ளு({
        செ: async (இ) => {
          தகவல்கள்.பந்திருரைக்கப்பட்டவை = இ.map((ஈ) => {
            return {
              [this.மாறிலிகள்.பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்]: ஈ.பங்கேற்பாளர்,
              ...ஈ.பரிந்துரை,
            };
          });
          await செ_கடைசி();
        },
      });
      செ_மறந்துவிடு.push(பரிந்துரைக்கப்பட்டவையை_மறந்துவிடு.fOublier);
    } else if (பரிந்துரைகள் === "எனது") {
      const பரிந்துரைக்கப்பட்டவையை_மறந்துவிடு =
        await this.என்_பரிந்துரைகளை_கேள்ளு({
          செ: async (இ) => {
            தகவல்கள்.பந்திருரைக்கப்பட்டவை = இ.map((ஈ) => {
              return {
                [this.மாறிலிகள்.பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்]:
                  ஈ.பங்கேற்பாளர்,
                ...ஈ.பரிந்துரை,
              };
            });
            await செ_கடைசி();
          },
        });
      செ_மறந்துவிடு.push(பரிந்துரைக்கப்பட்டவையை_மறந்துவிடு);
    }

    return async () => {
      await Promise.all(செ_மறந்துவிடு.map((செ) => செ()));
    };
  }
}
