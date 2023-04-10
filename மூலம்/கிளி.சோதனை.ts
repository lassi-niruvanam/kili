import type ClientConstellation from "@constl/ipa";
import { bds, utilsTests, utils } from "@constl/ipa";

import {கிளி, தேதி_நெடுவரிசை_அடையாளம், தேதி_மாறி_அடையாளம், பதிப்பு } from "@/குறியீட்டு.js"
import { schémaFonctionOublier } from "@constl/ipa/dist/src/utils";

describe("கிளி", () => {
    test('பதிப்பு',async () => {
        expect(typeof பதிப்பு).toEqual('string');
    })
    describe("உருவாக்கு", function () {
        let விண்மீன்: ClientConstellation
        let வாடிகையாளர்கள்: ClientConstellation[];
        let வார்ப்புரு: bds.schémaSpécificationBd;
        let மரந்துவிடு: schémaFonctionOublier;

        beforeAll(async () => {
            ({clients: வாடிகையாளர்கள், fOublier: மரந்துவிடு} = await utilsTests.client.générerClients(1, 'proc'));
            விண்மீன் = வாடிகையாளர்கள்[0];
            const உரை_மாறி = await விண்மீன்.variables.créerVariable({catégorie: "chaîne"});
            const எண்_மாறி = await விண்மீன்.variables.créerVariable({catégorie: "numérique"});
            வார்ப்புரு = {
                licence: "ODBl-1_0",
                nuées: ['/orbitdb/zdpuAt9PVUHGEyrL43tWDmpBUrgoPPWZHX7AGXWk4ZhEZ1oik/841abe65-93f5-4539-b721-2f8085a18cc5'],
                tableaux: [{
                    cols: [
                        {
                            idVariable: உரை_மாறி,
                            idColonne: "உரை"
                        },
                        {
                            idVariable: எண்_மாறி,
                            idColonne: "எண்"
                        }
                    ],
                    clef: "அட்டவணை சாபி"
                }]
            }
        }, 20000);

        afterAll(async () => {
            if (மரந்துவிடு) await மரந்துவிடு();
        });

        test("வார்ப்புரு தயாரிப்பு", async () => {
            const தயாரான_வார்ப்புரு = கிளி.வார்ப்புரு_தயாரிப்பு({வார்ப்புரு, அட்டவணை_சாபி: "அட்டவணை சாபி"});
            expect(தயாரான_வார்ப்புரு.tableaux.find(அ => அ.clef === "அட்டவணை சாபி")?.cols.find(நெ=>நெ.idColonne===தேதி_நெடுவரிசை_அடையாளம்)).toEqual({
                idVariable: தேதி_மாறி_அடையாளம்,
                idColonne: தேதி_நெடுவரிசை_அடையாளம்,
              })
        });

        test("வார்ப்புரு தயாரிப்பு - அட்டவணை இல்லை", async () => {
            expect(()=>கிளி.வார்ப்புரு_தயாரிப்பு({வார்ப்புரு, அட்டவணை_சாபி: "அட்டவணை இல்லை"})).toThrow("அட்டவணை சாபி அட்டவணை வார்ப்புரில் கிடைத்ததில்லை.");
        });

        test("உருவாக்கம்", async () => {
            const { குழு_அடையாளம், தரவுத்தளம் } = await கிளி.உருவாக்கு({விண்மீன், வார்ப்புரு, அட்டவணை_சாபி:"அட்டவணை சாபி"})
            expect(utils.adresseOrbiteValide(குழு_அடையாளம்)).toBe(true);
            expect(utils.adresseOrbiteValide(தரவுத்தளம்)).toBe(true);
        });
    });
});