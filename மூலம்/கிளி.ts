import type {bds, client, réseau, utils, valid} from '@constl/ipa';
import {
  தேதி_நெடுவரிசை_அடையாளம்,
    தேதி_மாறி_அடையாளம்,
    பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்,
    பங்கேற்பாளர்_மாறி_அடையாளம்,
} from "@/மாறிலிகள்.js";
import deepcopy from "deepcopy";
import { schémaFonctionOublier } from '@constl/ipa/dist/src/utils';

export type பரிந்துரை_வகை = {[சாபி: string]: utils.élémentsBd};
export type தேதியுடன்_பரிந்துரை_வகை<வ> = வ & {[தேதி_நெடுவரிசை_அடையாளம்]: string}

export type பிணையம்_பரிந்துரை<வ extends பரிந்துரை_வகை> = {
    பங்கேற்பாளர்: string;
    கைரேகை: string;
    பரிந்துரை: தேதியுடன்_பரிந்துரை_வகை<வ>
};

export type அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<வ extends பரிந்துரை_வகை> = தேதியுடன்_பரிந்துரை_வகை<வ> & {
    [பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்]: string;
};
  
export class கிளி<வ extends பரிந்துரை_வகை> {
    விண்மீன்: client.default;
  
    மாறிலிகள்: {
      தரவுத்தள_அடையாளம்: string;
      அட்டவணை_சாபி: string;
      குழு_அடையாளம்: string;
      வார்ப்புரு: bds.schémaSpécificationBd;
    };
  
    constructor({
      விண்மீன்,
      மாறிலிகள்,
    }: {
      விண்மீன்: client.default;
      மாறிலிகள்: {
        தரவுத்தள_அடையாளம்: string;
        அட்டவணை_சாபி: string;
        குழு_அடையாளம்: string;
        வார்ப்புரு: bds.schémaSpécificationBd;
      };
    }) {
      this.விண்மீன் = விண்மீன்;
      this.மாறிலிகள் = மாறிலிகள்;
    }

    static வார்ப்புரு_தயாரிப்பு({வார்ப்புரு, அட்டவணை_சாபி}: {வார்ப்புரு: bds.schémaSpécificationBd, அட்டவணை_சாபி: string}): bds.schémaSpécificationBd {
      const நகல்: bds.schémaSpécificationBd = deepcopy(வார்ப்புரு)

      const வேண்டிய_அட்டவணை = நகல்.tableaux.find(அட்டவணை => அட்டவணை.clef === அட்டவணை_சாபி)
      if (!வேண்டிய_அட்டவணை) throw new Error("அட்டவணை சாபி அட்டவணை வார்ப்புரில் கிடைத்ததில்லை.")
      const தேதி_நெடுவரிசை_உள்ளதா = வேண்டிய_அட்டவணை.cols.find(
        நெடுவரிசை => நெடுவரிசை.idColonne === தேதி_நெடுவரிசை_அடையாளம்
      );
      if (!தேதி_நெடுவரிசை_உள்ளதா) {
        வேண்டிய_அட்டவணை.cols.push({
          idVariable: தேதி_மாறி_அடையாளம்,
          idColonne: தேதி_நெடுவரிசை_அடையாளம்,
        });
        வார்ப்புரு.tableaux = வார்ப்புரு.tableaux.map(அ => {
          if (அ.clef === அட்டவணை_சாபி) {
            return வேண்டிய_அட்டவணை
          } else {
            return அ
          }
        })
      };

      return வார்ப்புரு
    }
  
    static async உருவாக்கு({
      விண்மீன்,
      வார்ப்புரு,
      அட்டவணை_சாபி,
    }: {
      விண்மீன்: client.default;
      வார்ப்புரு: bds.schémaSpécificationBd;
      அட்டவணை_சாபி: string;
    }): Promise<{
      குழு_அடையாளம்: string;
      தரவுத்தளம்: string;
    }> {
      if (!விண்மீன்.nuées || !விண்மீன்.bds) throw new Error('விண்மீன் தயராரானதில்லை');

      வார்ப்புரு = this.வார்ப்புரு_தயாரிப்பு({வார்ப்புரு, அட்டவணை_சாபி});
  
      const குழு_அடையாளம் = await விண்மீன்.nuées.créerNuée({});
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
            await விண்மீன்.nuées.changerColIndexTableauNuée({
              idTableau: அட்டவணை_அடையாளம்,
              idColonne: நெடுவரிசை.idColonne,
              val: true,
            });
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
        tableaux: வார்ப்புரு.tableaux.map(அட்டவணை => {
          if (அட்டவணை.clef === அட்டவணை_சாபி) {
            return {
              clef: அட்டவணை.clef,
              cols: [
                ...அட்டவணை.cols,
                {
                  idColonne: பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்,
                  idVariable: பங்கேற்பாளர்_மாறி_அடையாளம்,
                  index: true,
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
      return {
        குழு_அடையாளம்,
        தரவுத்தளம்,
      };
    }
  
    async அங்கீகரிக்கப்பட்ட_உறுப்படிகளை_கேள்ளு({
      செ,
    }: {
      செ: utils.schémaFonctionSuivi<valid.élémentDonnées<அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<வ>>[]>;
    }): Promise<schémaFonctionOublier> {
      if (!this.விண்மீன்.bds) throw new Error('விண்மீன் தயராரானதில்லை');
      return await this.விண்மீன்.bds.suivreDonnéesDeTableauParClef<அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<வ>>(
        {
          idBd: this.மாறிலிகள்.தரவுத்தள_அடையாளம்,
          clefTableau: this.மாறிலிகள்.அட்டவணை_சாபி,
          f: செ,
        },
      );
    }
  
    async பரிந்துரைகளை_கேள்ளு({
      செ,
    }: {

      செ: utils.schémaFonctionSuivi<பிணையம்_பரிந்துரை<வ>[]>;
    }): Promise<utils.schémaRetourFonctionRechercheParProfondeur> {
      if (!this.விண்மீன்.nuées) throw new Error('விண்மீன் தயராரானதில்லை');
  
      return await this.விண்மீன்.nuées.suivreDonnéesTableauNuée<தேதியுடன்_பரிந்துரை_வகை<வ>>({
        idNuée: this.மாறிலிகள்.குழு_அடையாளம்,
        clefTableau: this.மாறிலிகள்.அட்டவணை_சாபி,
        f: async த => {
          await செ(
            த.map(இ => {
              return {
                பங்கேற்பாளர்: இ.idBdCompte,
                கைரேகை: இ.élément.empreinte,
                பரிந்துரை: இ.élément.données,
              };
            }),
          );
        },
        nRésultatsDésirés: 1000
      });
    }
  
    async எனது_பரிந்துரைகளை_கேள்ளு({
      செ,
    }: {
      செ: utils.schémaFonctionSuivi<பிணையம்_பரிந்துரை<வ>[]>;
    }): Promise<utils.schémaFonctionOublier> {
      if (!this.விண்மீன்.bds) throw new Error('விண்மீன் தயராரானதில்லை');
  
      return await this.விண்மீன்.bds.suivreDonnéesDeTableauUnique<தேதியுடன்_பரிந்துரை_வகை<வ>>({
        schémaBd: this.மாறிலிகள்.வார்ப்புரு,
        idNuéeUnique: this.மாறிலிகள்.குழு_அடையாளம்,
        clefTableau: this.மாறிலிகள்.அட்டவணை_சாபி,
        f: async பரிந்துரைகள் => {
          const பங்கேற்பாளர் = await this.விண்மீன்.obtIdCompte();
          await செ(
            பரிந்துரைகள்.map(ப => {
              return {
                பங்கேற்பாளர்,
                கைரேகை: ப.empreinte,
                பரிந்துரை: ப.données,
              };
            }),
          );
        },
      });
    }
  
    async பரிந்துரையு({பரிந்துரை}: {பரிந்துரை: வ}) {
      if (!this.விண்மீன்.bds) throw new Error('விண்மீன் தயராரானதில்லை');
      const தேதியை_சேரு = (உறுப்படி: வ|தேதியுடன்_பரிந்துரை_வகை<வ>): தேதியுடன்_பரிந்துரை_வகை<வ> => {
        if (!உறுப்படி[தேதி_நெடுவரிசை_அடையாளம்]) {
          உறுப்படி[தேதி_நெடுவரிசை_அடையாளம்] = (new Date()).toString();
        }
        return உறுப்படி as தேதியுடன்_பரிந்துரை_வகை<வ>
      }
      await this.விண்மீன்.bds.ajouterÉlémentÀTableauUnique<தேதியுடன்_பரிந்துரை_வகை<வ>>({
        schémaBd: this.மாறிலிகள்.வார்ப்புரு,
        idNuéeUnique: this.மாறிலிகள்.குழு_அடையாளம்,
        clefTableau: this.மாறிலிகள்.அட்டவணை_சாபி,
        vals: தேதியை_சேரு(பரிந்துரை),
      });
    }
    async பரிந்துரையை_நீக்கு({கைரேகை}: {கைரேகை: string}) {
      if (!this.விண்மீன்.bds) throw new Error('விண்மீன் தயராரானதில்லை');
      return await this.விண்மீன்.bds.effacerÉlémentDeTableauUnique({
        schémaBd: this.மாறிலிகள்.வார்ப்புரு,
        idNuéeUnique: this.மாறிலிகள்.குழு_அடையாளம்,
        clefTableau: this.மாறிலிகள்.அட்டவணை_சாபி,
        empreinte: கைரேகை,
      });
    }
    async பரிந்துரையை_திருத்து({பரிந்துரை, கைரேகை}: {பரிந்துரை: வ; கைரேகை: string}) {
      if (!this.விண்மீன்.bds) throw new Error('விண்மீன் தயராரானதில்லை');
      await this.விண்மீன்.bds.modifierÉlémentDeTableauUnique({
        schémaBd: this.மாறிலிகள்.வார்ப்புரு,
        idNuéeUnique: this.மாறிலிகள்.குழு_அடையாளம்,
        clefTableau: this.மாறிலிகள்.அட்டவணை_சாபி,
        vals: பரிந்துரை,
        empreintePrécédente: கைரேகை,
      });
    }
  
    async அங்கீகரி({பரிந்துரை}: {பரிந்துரை: பிணையம்_பரிந்துரை<வ>}) {
      if (!this.விண்மீன்.bds) throw new Error('விண்மீன் தயராரானதில்லை');
  
      const பரிந்துரை_உறுப்படி: அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<வ> = Object.assign(
        {},
        பரிந்துரை.பரிந்துரை,
        {
          [பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்]: பரிந்துரை.பங்கேற்பாளர்,
        },
      );
      await this.விண்மீன்.bds.ajouterÉlémentÀTableauParClef({
        idBd: this.மாறிலிகள்.தரவுத்தள_அடையாளம்,
        clefTableau: this.மாறிலிகள்.அட்டவணை_சாபி,
        vals: பரிந்துரை_உறுப்படி,
      });
    }
  
    async அங்கிகரிக்கப்பட்ட_உறுப்படியை_நீக்கு({கைரேகை}: {கைரேகை: string}) {
      if (!this.விண்மீன்.bds) throw new Error('விண்மீன் தயராரானதில்லை');
  
      await this.விண்மீன்.bds.effacerÉlémentDeTableauParClef({
        idBd: this.மாறிலிகள்.தரவுத்தள_அடையாளம்,
        clefTableau: this.மாறிலிகள்.அட்டவணை_சாபி,
        empreinteÉlément: கைரேகை,
      });
    }
  
    async அங்கிகரிக்கப்பட்ட_உறுப்படியை_திருத்து({உறுப்படி, கைரேகை}: {உறுப்படி: வ; கைரேகை: string}) {
      if (!this.விண்மீன்.bds) throw new Error('விண்மீன் தயராரானதில்லை');
  
      await this.விண்மீன்.bds.modifierÉlémentDeTableauParClef({
        idBd: this.மாறிலிகள்.தரவுத்தள_அடையாளம்,
        clefTableau: this.மாறிலிகள்.அட்டவணை_சாபி,
        empreinteÉlément: கைரேகை,
        vals: உறுப்படி,
      });
    }

    async உறுப்படிகளை_கேள்ளு({
      செ,
      பரிந்துரைகள்="எனது"
    }: {
      செ: utils.schémaFonctionSuivi<அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<வ>[]>;
      பரிந்துரைகள்: "எனது" | "அனையும்"
    }): Promise<schémaFonctionOublier> {
      const தகவல்கள்: {
        அங்கீகரிக்கப்பட்டவை: அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<வ>[];
        பந்திருரைக்கப்பட்டவை: அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<வ>[];
      } = { 
        அங்கீகரிக்கப்பட்டவை: [],
        பந்திருரைக்கப்பட்டவை: [],
      }

      const குறியீட்டு_நெடுவரிசைகள் = this.மாறிலிகள்.வார்ப்புரு.tableaux.find(
        அட்டவணை => அட்டவணை.clef === this.மாறிலிகள்.அட்டவணை_சாபி
      )?.cols.filter(
        நெடுவரிசை => நெடுவரிசை.index
      ).map(
        நெடுவரிசை => நெடுவரிசை.idColonne
      ) || [];
      const செ_கடைசி = async () => {
        const உறுப்படிகள்: அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<வ>[] = [...தகவல்கள்.அங்கீகரிக்கப்பட்டவை];
        for (const ப of தகவல்கள்.பந்திருரைக்கப்பட்டவை) {
          const முந்தையானது = உறுப்படிகள்.find(இ=>குறியீட்டு_நெடுவரிசைகள்.every(
            நெடுவரிசை => இ[நெடுவரிசை] === ப[நெடுவரிசை]
          ))
          if (முந்தையானது) {
            // எல்லோரை விட புதுமையான பரிந்துரையை மட்டும் எடுக்கவும்
            const தேதி_முந்தையானது = முந்தையானது[தேதி_நெடுவரிசை_அடையாளம்];
            const தேதி_புதுசு = ப[தேதி_நெடுவரிசை_அடையாளம்];
            if (தேதி_முந்தையானது && தேதி_புதுசு && தேதி_புதுசு > தேதி_முந்தையானது) {
              உறுப்படிகள்.push(ப)
            }
          } else {
            உறுப்படிகள்.push(ப)
          }
        }
        return await செ(உறுப்படிகள்)
      }

      const அங்கீகரிக்கப்பட்டவையை_மறந்துவிடு = await this.அங்கீகரிக்கப்பட்ட_உறுப்படிகளை_கேள்ளு({
        செ: async இ => {
          தகவல்கள்.அங்கீகரிக்கப்பட்டவை = இ.map(ஈ=>ஈ.données)
          await செ_கடைசி()
        }
      })
      const செ_மறந்துவிடு = [அங்கீகரிக்கப்பட்டவையை_மறந்துவிடு];
      if (பரிந்துரைகள் === "அனையும்") {
        const பரிந்துரைக்கப்பட்டவையை_மறந்துவிடு = await this.பரிந்துரைகளை_கேள்ளு({
          செ: async இ => {
            தகவல்கள்.பந்திருரைக்கப்பட்டவை = இ.map(ஈ=>{
              return {
                [பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்] : ஈ.பங்கேற்பாளர்,
                ...ஈ.பரிந்துரை
              }
            });
            await செ_கடைசி()
          }
        });
        செ_மறந்துவிடு.push(பரிந்துரைக்கப்பட்டவையை_மறந்துவிடு.fOublier)
      } else if (பரிந்துரைகள் === "எனது") {
        const பரிந்துரைக்கப்பட்டவையை_மறந்துவிடு = await this.எனது_பரிந்துரைகளை_கேள்ளு({
          செ: async இ => {
            தகவல்கள்.பந்திருரைக்கப்பட்டவை = இ.map(ஈ=>{
              return {
                [பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்] : ஈ.பங்கேற்பாளர்,
                ...ஈ.பரிந்துரை
              }
            });
            await செ_கடைசி()
          }
        });
        செ_மறந்துவிடு.push(பரிந்துரைக்கப்பட்டவையை_மறந்துவிடு)
      }
      
      return async () => {
        await Promise.all(செ_மறந்துவிடு.map(செ=>செ()))
      }
    }
  }