import type ClientConstellation from "@constl/ipa";
import { bds, utilsTests, utils } from "@constl/ipa";

import {
  கிளி,
  தேதி_நெடுவரிசை_அடையாளம்,
  தேதி_மாறி_அடையாளம்,
  பதிப்பு,
  பரிந்துரை_வகை,
  பிணையம்_பரிந்துரை,
} from "@/குறியீட்டு.js";
import type { schémaFonctionOublier } from "@constl/ipa/dist/src/utils";

const பரிந்துரையு_சரிபார்த்தல் = <வ extends பரிந்துரை_வகை>({
  மதிப்பு,
  பங்களிப்பாளர்,
  குறிப்பு,
}: {
  மதிப்பு: பிணையம்_பரிந்துரை<வ>[];
  பங்களிப்பாளர்: string;
  குறிப்பு: வ[];
}) => {
  for (const [இ, ம] of மதிப்பு.entries()) {
    expect(ம.பங்கேற்பாளர்).toEqual(பங்களிப்பாளர்);
    expect(typeof ம.கைரேகை).toBe("string");
    expect(new Date(ம.பரிந்துரை.தேதி).getTime()).toBeLessThan(Date.now());
    expect(
      Object.fromEntries(
        Object.entries(ம.பரிந்துரை).filter(
          (ஊ) => !["தேதி", "id"].includes(ஊ[0])
        )
      )
    ).toEqual(குறிப்பு[இ]);
  }
};

describe("கிளி", () => {
  test("பதிப்பு", async () => {
    expect(typeof பதிப்பு).toEqual("string");
  });
  describe("உருவாக்கு", function () {
    let விண்மீன்: ClientConstellation;
    let வாடிகையாளர்கள்: ClientConstellation[];
    let வார்ப்புரு: bds.schémaSpécificationBd;
    let மரந்துவிடு: schémaFonctionOublier;

    beforeAll(async () => {
      ({ clients: வாடிகையாளர்கள், fOublier: மரந்துவிடு } =
        await utilsTests.client.générerClients(1, "proc"));
      விண்மீன் = வாடிகையாளர்கள்[0];
      const உரை_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "chaîne",
      });
      const எண்_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "numérique",
      });
      வார்ப்புரு = {
        licence: "ODBl-1_0",
        nuées: [
          "/orbitdb/zdpuAt9PVUHGEyrL43tWDmpBUrgoPPWZHX7AGXWk4ZhEZ1oik/841abe65-93f5-4539-b721-2f8085a18cc5",
        ],
        tableaux: [
          {
            cols: [
              {
                idVariable: உரை_மாறி,
                idColonne: "உரை",
              },
              {
                idVariable: எண்_மாறி,
                idColonne: "எண்",
              },
            ],
            clef: "அட்டவணை சாபி",
          },
        ],
      };
    }, 20000);

    afterAll(async () => {
      if (மரந்துவிடு) await மரந்துவிடு();
    });

    test("வார்ப்புரு தயாரிப்பு", async () => {
      const தயாரான_வார்ப்புரு = கிளி.வார்ப்புரு_தயாரிப்பு({
        வார்ப்புரு,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
      });
      expect(
        தயாரான_வார்ப்புரு.tableaux
          .find((அ) => அ.clef === "அட்டவணை சாபி")
          ?.cols.find((நெ) => நெ.idColonne === தேதி_நெடுவரிசை_அடையாளம்)
      ).toEqual({
        idVariable: தேதி_மாறி_அடையாளம்,
        idColonne: தேதி_நெடுவரிசை_அடையாளம்,
      });
    });

    test("வார்ப்புரு தயாரிப்பு - அட்டவணை இல்லை", async () => {
      expect(() =>
        கிளி.வார்ப்புரு_தயாரிப்பு({ வார்ப்புரு, அட்டவணை_சாபி: "அட்டவணை இல்லை" })
      ).toThrow("அட்டவணை சாபி அட்டவணை வார்ப்புரில் கிடைத்ததில்லை.");
    });

    test("உருவாக்கம்", async () => {
      const { குழு_அடையாளம், தரவுத்தளம் } = await கிளி.உருவாக்கு({
        விண்மீன்,
        வார்ப்புரு,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
      });
      expect(utils.adresseOrbiteValide(குழு_அடையாளம்)).toBe(true);
      expect(utils.adresseOrbiteValide(தரவுத்தளம்)).toBe(true);
    });
  });

  describe("பரிந்துரைகளும் அங்கீகாரமும்", function () {
    let விண்மீன்: ClientConstellation;
    let வாடிகையாளர்கள்: ClientConstellation[];
    let வார்ப்புரு: bds.schémaSpécificationBd;
    let குழு_அடையாளம்: string;
    let தரவுத்தளம்: string;
    let என்_கிளி: கிளி<{ உரை: string; எண்: number }>;

    const பரிந்துரைகள் = new utilsTests.attente.AttendreRésultat<
      பிணையம்_பரிந்துரை<{ உரை: string; எண்: number }>[]
    >();

    const மரந்துவிடு: schémaFonctionOublier[] = [];
    beforeAll(async () => {
      const { clients, fOublier } = await utilsTests.client.générerClients(
        2,
        "proc"
      );
      வாடிகையாளர்கள் = clients;
      மரந்துவிடு.push(fOublier);

      விண்மீன் = வாடிகையாளர்கள்[0];

      const உரை_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "chaîne",
      });
      const எண்_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "numérique",
      });
      வார்ப்புரு = {
        licence: "ODBl-1_0",
        tableaux: [
          {
            cols: [
              {
                idVariable: உரை_மாறி,
                idColonne: "உரை",
              },
              {
                idVariable: எண்_மாறி,
                idColonne: "எண்",
              },
            ],
            clef: "அட்டவணை சாபி",
          },
        ],
      };
      ({ குழு_அடையாளம், தரவுத்தளம் } = await கிளி.உருவாக்கு({
        விண்மீன்,
        வார்ப்புரு,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
      }));

      என்_கிளி = new கிளி({
        விண்மீன்,
        மாறிலிகள்: {
          தரவுத்தள_அடையாளம்: தரவுத்தளம்,
          அட்டவணை_சாபி: "அட்டவணை சாபி",
          குழு_அடையாளம்,
          வார்ப்புரு,
        },
      });

      const { fOublier: பரிந்துரைகளை_மரந்துவிடு } =
        await என்_கிளி.பரிந்துரைகளை_கேள்ளு({
          செ: (ப) => பரிந்துரைகள்.mettreÀJour(ப),
        });
      மரந்துவிடு.push(பரிந்துரைகளை_மரந்துவிடு);
    }, 20000);

    afterAll(async () => {
      await Promise.all(மரந்துவிடு.map((செ) => செ()));
    });

    test("பரிந்துரையு", async () => {
      await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 123,
        },
      });
      const மதிப்பு = await பரிந்துரைகள்.attendreQue((ப) => ப.length > 0);
      const குறிப்பு = [
        {
          உரை: "தமிழ்",
          எண்: 123,
        },
      ];
      பரிந்துரையு_சரிபார்த்தல்({
        மதிப்பு,
        பங்களிப்பாளர்: await விண்மீன்.obtIdCompte(),
        குறிப்பு,
      });
    });
  });

  describe("இணைப்பு இல்லாத குழு", function () {
    let விண்மீன்: ClientConstellation;
    let வாடிகையாளர்கள்: ClientConstellation[];
    let வார்ப்புரு: bds.schémaSpécificationBd;
    let என்_கிளி: கிளி<{ உரை: string; எண்: number }>;

    const தரவுத்தளம் =
      "/orbitdb/zdpuAsiATt21PFpiHj8qLX7X7kN3bgozZmhEVswGncZYVHidX/கிடைக்கமாட்டேன்";
    const குழு_அடையாளம் =
      "/orbitdb/zdpuAsiATt21PFpiHj8qLX7X7kN3bgozZmhEVswGncZYVHidX/கிடைக்கமாட்டேன்";
    const பரிந்துரைகள் = new utilsTests.attente.AttendreRésultat<
      பிணையம்_பரிந்துரை<{ உரை: string; எண்: number }>[]
    >();

    const மரந்துவிடு: schémaFonctionOublier[] = [];
    beforeAll(async () => {
      const { clients, fOublier } = await utilsTests.client.générerClients(
        2,
        "proc"
      );
      வாடிகையாளர்கள் = clients;
      மரந்துவிடு.push(fOublier);

      விண்மீன் = வாடிகையாளர்கள்[0];

      const உரை_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "chaîne",
      });
      const எண்_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "numérique",
      });
      வார்ப்புரு = {
        licence: "ODBl-1_0",
        nuées: [குழு_அடையாளம்],
        tableaux: [
          {
            cols: [
              {
                idVariable: உரை_மாறி,
                idColonne: "உரை",
              },
              {
                idVariable: எண்_மாறி,
                idColonne: "எண்",
              },
            ],
            clef: "அட்டவணை சாபி",
          },
        ],
      };

      என்_கிளி = new கிளி({
        விண்மீன்: வாடிகையாளர்கள்[1],
        மாறிலிகள்: {
          தரவுத்தள_அடையாளம்: தரவுத்தளம்,
          அட்டவணை_சாபி: "அட்டவணை சாபி",
          குழு_அடையாளம்,
          வார்ப்புரு,
        },
      });

      const { fOublier: பரிந்துரைகளை_மரந்துவிடு } =
        await என்_கிளி.பரிந்துரைகளை_கேள்ளு({
          செ: (ப) => பரிந்துரைகள்.mettreÀJour(ப),
        });
      மரந்துவிடு.push(பரிந்துரைகளை_மரந்துவிடு);
    }, 20000);

    afterAll(async () => {
      await Promise.all(மரந்துவிடு.map((செ) => செ()));
    });

    test("பரிந்துரையு", async () => {
      await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 123,
        },
      });
      const மதிப்பு = await பரிந்துரைகள்.attendreQue((ப) => ப.length > 0);
      const குறிப்பு = [
        {
          உரை: "தமிழ்",
          எண்: 123,
        },
      ];
      பரிந்துரையு_சரிபார்த்தல்({
        மதிப்பு,
        பங்களிப்பாளர்: await வாடிகையாளர்கள்[1].obtIdCompte(),
        குறிப்பு,
      });
    });
  });
});
