import { isBrowser, isElectronRenderer } from "wherearewe";
import { ClientConstellation, générerClient, bds, types } from "@constl/ipa";
import { client as utilsTestsClient, attente } from "@constl/utils-tests";
import { isValidAddress } from "@orbitdb/core";
import {
  கிளி,
  தேதி_நெடுவரிசை_அடையாளம்,
  தேதி_மாறி_அடையாளம்,
  பதிப்பு,
  பரிந்துரை_வகை,
  பிணையம்_பரிந்துரை,
  அங்கீகார_தத_மீதரவு_சாபி,
} from "@/குறியீட்டு.js";
import { expect } from "aegir/chai";

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
    expect(ம.பங்கேற்பாளர்).to.equal(பங்களிப்பாளர்);
    expect(ம.அடையாளம்).to.be.a("string");
    expect(
      new Date(ம.பரிந்துரை[தேதி_நெடுவரிசை_அடையாளம்]).getTime(),
    ).to.be.lessThan(Date.now());
    expect(
      Object.fromEntries(
        Object.entries(ம.பரிந்துரை).filter(
          (ஊ) => !["தேதி", "id"].includes(ஊ[0]),
        ),
      ),
    ).to.deep.equal(குறிப்பு[இ]);
  }
};

describe("கிளி", () => {
  it("பதிப்பு", async () => {
    expect(பதிப்பு).to.be.a("string");
  });
  describe("உருவாக்கு", function () {
    let விண்மீன்: ClientConstellation;
    let வாடிகையாளர்கள்: ClientConstellation[];
    let வார்ப்புரு: bds.schémaSpécificationBd;
    let மரந்துவிடு: types.schémaFonctionOublier;

    before("தயாரிப்பு", async () => {
      ({ clients: வாடிகையாளர்கள் as unknown, fOublier: மரந்துவிடு } =
        await utilsTestsClient.générerClients({
          n: 1,
          type: "proc",
          générerClient,
        }));
      விண்மீன் = வாடிகையாளர்கள்[0];

      const உரை_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "chaîne",
      });
      const எண்_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "numérique",
      });
      வார்ப்புரு = {
        licence: "ODbl-1_0",
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
    });

    after(async () => {
      if (மரந்துவிடு) await மரந்துவிடு();
    });

    it("வார்ப்புரு தயாரிப்பு", async () => {
      const தயாரான_வார்ப்புரு = கிளி.வார்ப்புரு_தயாரிப்பு({
        வார்ப்புரு,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
        குழு_அடையாளம்: வார்ப்புரு.nuées![0],
      });
      expect(
        தயாரான_வார்ப்புரு.tableaux
          .find((அ) => அ.clef === "அட்டவணை சாபி")
          ?.cols.find((நெ) => நெ.idColonne === தேதி_நெடுவரிசை_அடையாளம்),
      ).to.deep.equal({
        idVariable: தேதி_மாறி_அடையாளம்,
        idColonne: தேதி_நெடுவரிசை_அடையாளம்,
      });
    });

    it("வார்ப்புரு தயாரிப்பு - அட்டவணை இல்லை", async () => {
      expect(() =>
        கிளி.வார்ப்புரு_தயாரிப்பு({
          வார்ப்புரு,
          அட்டவணை_சாபி: "அட்டவணை இல்லை",
          குழு_அடையாளம்: வார்ப்புரு.nuées![0],
        }),
      ).to.throw("அட்டவணை சாபி அட்டவணை வார்ப்புரில் கிடைத்ததில்லை.");
    });

    it("உருவாக்கம்", async () => {
      const குழு_அடையாளம் = await கிளி.உருவாக்கு({
        விண்மீன்,
        வார்ப்புரு,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
      });
      expect(isValidAddress(குழு_அடையாளம்)).to.be.true();
    });
  });

  describe("பரிந்துரைகளும் அங்கீகாரமும்", function () {
    let விண்மீன்: ClientConstellation;
    let வாடிகையாளர்கள்: ClientConstellation[];
    let வார்ப்புரு: bds.schémaSpécificationBd;
    let குழு_அடையாளம்: string;

    let என்_கிளி: கிளி<{ உரை: string; எண்: number }>;

    const பரிந்துரைகள் = new attente.AttendreRésultat<
      பிணையம்_பரிந்துரை<{ உரை: string; எண்: number }>[]
    >();

    const மரந்துவிடு: types.schémaFonctionOublier[] = [];
    before("தயாரிப்பு", async () => {
      const { clients, fOublier } = await utilsTestsClient.générerClients({
        n: 1,
        type: "proc",
        générerClient,
      });
      வாடிகையாளர்கள் = clients as ClientConstellation[];
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
      குழு_அடையாளம் = await கிளி.உருவாக்கு({
        விண்மீன்,
        வார்ப்புரு,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
      });

      என்_கிளி = new கிளி({
        விண்மீன்,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
        குழு_அடையாளம்,
        வார்ப்புரு,
      });

      const { fOublier: பரிந்துரைகளை_மரந்துவிடு } =
        await என்_கிளி.பரிந்துரைகளை_கேள்ளு({
          செ: (ப) => பரிந்துரைகள்.mettreÀJour(ப),
        });
      மரந்துவிடு.push(பரிந்துரைகளை_மரந்துவிடு);
    });

    after(async () => {
      await Promise.all(மரந்துவிடு.map((செ) => செ()));
    });

    it("பரிந்துரையு", async () => {
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
    let வேறு_விண்மீன்: ClientConstellation;
    let வாடிகையாளர்கள்: ClientConstellation[];
    let வார்ப்புரு: bds.schémaSpécificationBd;
    let என்_கிளி: கிளி<{ உரை: string; எண்: number }>;

    const குழு_அடையாளம் =
      "/orbitdb/zdpuAsiATt21PFpiHj8qLX7X7kN3bgozZmகிடைக்கமாட்டேன்";
    const பரிந்துரைகள் = new attente.AttendreRésultat<
      பிணையம்_பரிந்துரை<{ உரை: string; எண்: number }>[]
    >();

    const மரந்துவிடு: types.schémaFonctionOublier[] = [];
    before("தயாரிப்பு", async () => {
      const { clients, fOublier } = await utilsTestsClient.générerClients({
        n: isBrowser || isElectronRenderer ? 1 : 2, // உலாவியில் இரண்டு விண்மீன்களை ஒரே நேரத்தில் உருவாக்க முடியாது
        type: "proc",
        générerClient,
      });
      வாடிகையாளர்கள் = clients as ClientConstellation[];
      மரந்துவிடு.push(fOublier);

      விண்மீன் = வாடிகையாளர்கள்[0];
      வேறு_விண்மீன் = வாடிகையாளர்கள்[வாடிகையாளர்கள்.length - 1];

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
        விண்மீன்: வேறு_விண்மீன்,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
        குழு_அடையாளம்,
        வார்ப்புரு,
      });

      const { fOublier: பரிந்துரைகளை_மரந்துவிடு } =
        await என்_கிளி.பரிந்துரைகளை_கேள்ளு({
          செ: (ப) => பரிந்துரைகள்.mettreÀJour(ப),
        });
      மரந்துவிடு.push(பரிந்துரைகளை_மரந்துவிடு);
    });

    after(async () => {
      await Promise.all(மரந்துவிடு.map((செ) => செ()));
    });

    it("பரிந்துரையு", async () => {
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
        பங்களிப்பாளர்: await வேறு_விண்மீன்.obtIdCompte(),
        குறிப்பு,
      });
    });
  });

  describe("இணைப்பு இல்லாத அங்கீகார தரவுத்தளம்", function () {
    let விண்மீன்: ClientConstellation;
    let வேறு_விண்மீன்: ClientConstellation;
    let வாடிகையாளர்கள்: ClientConstellation[];
    let என்_கிளி: கிளி<{ உரை: string; எண்: number }>;

    const தரவுத்தளம் =
      "/orbitdb/zdpuAsiATt21PFpiHj8qLX7X7kN3bgozZmகிடைக்கமாட்டேன்";
    const பரிந்துரைகள் = new attente.AttendreRésultat<
      பிணையம்_பரிந்துரை<{ உரை: string; எண்: number }>[]
    >();

    const மரந்துவிடு: types.schémaFonctionOublier[] = [];
    before("தயாரிப்பு", async () => {
      const { clients, fOublier } = await utilsTestsClient.générerClients({
        n: isBrowser || isElectronRenderer ? 1 : 2, // உலாவியில் இரண்டு விண்மீன்களை ஒரே நேரத்தில் உருவாக்க முடியாது
        type: "proc",
        générerClient,
      });
      வாடிகையாளர்கள் = clients as ClientConstellation[];
      மரந்துவிடு.push(fOublier);

      விண்மீன் = வாடிகையாளர்கள்[0];
      வேறு_விண்மீன் = வாடிகையாளர்கள்[வாடிகையாளர்கள்.length - 1]; // உலாவியில் இரண்டு விண்மீன்களை ஒரே நேரத்தில் உருவாக்க முடியாது

      const உரை_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "chaîne",
      });
      const எண்_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "numérique",
      });

      const வார்ப்புரு: bds.schémaSpécificationBd = {
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

      const குழு_அடையாளம் = await கிளி.உருவாக்கு({
        விண்மீன்,
        வார்ப்புரு,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
      });

      await விண்மீன்.nuées.sauvegarderMétadonnéeNuée({
        idNuée: குழு_அடையாளம்,
        clef: அங்கீகார_தத_மீதரவு_சாபி,
        valeur: தரவுத்தளம்,
      });

      என்_கிளி = new கிளி({
        விண்மீன்: வேறு_விண்மீன்,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
        குழு_அடையாளம்,
        வார்ப்புரு,
      });

      const { fOublier: பரிந்துரைகளை_மரந்துவிடு } =
        await என்_கிளி.பரிந்துரைகளை_கேள்ளு({
          செ: (ப) => பரிந்துரைகள்.mettreÀJour(ப),
        });
      மரந்துவிடு.push(பரிந்துரைகளை_மரந்துவிடு);
    });

    after(async () => {
      await Promise.all(மரந்துவிடு.map((செ) => செ()));
    });

    it("பரிந்துரையு", async () => {
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
        பங்களிப்பாளர்: await வேறு_விண்மீன்.obtIdCompte(),
        குறிப்பு,
      });
    });
  });
});
