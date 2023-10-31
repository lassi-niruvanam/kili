import {
  isBrowser,
  isElectronRenderer,
} from "wherearewe";
import {
  ClientConstellation,
  générerClient,
  bds,
  types,
  type tableaux,
} from "@constl/ipa";
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
  அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை,
} from "@/குறியீட்டு.js";
import { expect } from "aegir/chai";

const பரிந்துரையு_சரிபார்த்தல் = <வ extends பரிந்துரை_வகை>({
  மதிப்பு,
  குறிப்பு,
}: {
  மதிப்பு: பிணையம்_பரிந்துரை<வ>[];
  குறிப்பு: { பங்கேற்பாளர்: string; பரிந்துரை: வ }[];
}) => {
  expect(மதிப்பு.length).to.equal(குறிப்பு.length);

  for (const [இ, ம] of மதிப்பு.entries()) {
    expect(ம.பங்கேற்பாளர்).to.equal(குறிப்பு[இ].பங்கேற்பாளர்);
    expect(ம.அடையாளம்).to.be.a("string");
    expect(
      new Date(ம.பரிந்துரை[தேதி_நெடுவரிசை_அடையாளம்]).getTime(),
    ).to.be.lessThan(Date.now());
    expect(
      Object.fromEntries(
        Object.entries(ம.பரிந்துரை).filter(
          (ஊ) => ![தேதி_நெடுவரிசை_அடையாளம்].includes(ஊ[0]),
        ),
      ),
    ).to.deep.equal(குறிப்பு[இ].பரிந்துரை);
  }
};

const அங்கீகரி_சரிபார்த்தல் = <வ extends பரிந்துரை_வகை>({
  மதிப்பு,
  குறிப்பு,
}: {
  மதிப்பு: tableaux.élémentDonnées<அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<வ>>[];
  குறிப்பு: Omit<
    அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<வ>,
    typeof தேதி_நெடுவரிசை_அடையாளம்
  >[];
}) => {
  expect(மதிப்பு.length).to.equal(குறிப்பு.length);
  for (const [இ, ம] of மதிப்பு.entries()) {
    expect(ம.id).to.be.a("string");

    expect(
      new Date(ம.données[தேதி_நெடுவரிசை_அடையாளம்]).getTime(),
    ).to.be.lessThan(Date.now());
    expect(
      Object.fromEntries(
        Object.entries(ம.données).filter(
          (ஊ) => ![தேதி_நெடுவரிசை_அடையாளம்].includes(ஊ[0]),
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
    const அங்கீகரிக்கப்பட்டவை = new attente.AttendreRésultat<
      tableaux.élémentDonnées<
        அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<{ உரை: string; எண்: number }>
      >[]
    >();

    let விண்மீனை_மரந்துவிடு: types.schémaFonctionOublier | undefined =
      undefined;
    let மரந்துவிடு: types.schémaFonctionOublier[] = [];

    before("தயாரிப்பு", async () => {
      const { clients, fOublier } = await utilsTestsClient.générerClients({
        n: 1,
        type: "proc",
        générerClient,
      });
      வாடிகையாளர்கள் = clients as ClientConstellation[];
      விண்மீனை_மரந்துவிடு = fOublier;

      விண்மீன் = வாடிகையாளர்கள்[0];
    });

    after(async () => {
      பரிந்துரைகள்.toutAnnuler();
      அங்கீகரிக்கப்பட்டவை.toutAnnuler();
      if (விண்மீனை_மரந்துவிடு) await விண்மீனை_மரந்துவிடு();
    });

    this.beforeEach(async () => {
      const உரை_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "chaîne",
      });
      const எண்_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "numérique",
      });
      const சிறப்பு_சொல் = await விண்மீன்.motsClefs.créerMotClef();

      வார்ப்புரு = {
        licence: "ODBl-1_0",
        motsClefs: [சிறப்பு_சொல்],
        tableaux: [
          {
            cols: [
              {
                idVariable: உரை_மாறி,
                idColonne: "உரை",
                index: true,
              },
              {
                idVariable: எண்_மாறி,
                idColonne: "எண்",
              },
            ],
            clef: "அட்டவணை சாபி",
          },
          {
            cols: [
              {
                idVariable: எண்_மாறி,
                idColonne: "எண்",
              },
            ],
            clef: "இன்னொரு அட்டவணை",
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

      const அங்கீகரிக்கப்பட்டவையை_மரந்துவிடு =
        await என்_கிளி.அங்கீகரிக்கப்பட்ட_உறுப்படிகளை_கேள்ளு({
          செ: (உறுப்படி) => அங்கீகரிக்கப்பட்டவை.mettreÀJour(உறுப்படி),
        });
      மரந்துவிடு.push(அங்கீகரிக்கப்பட்டவையை_மரந்துவிடு);
    });

    afterEach(async () => {
      await Promise.all(மரந்துவிடு.map((செ) => செ()));
      மரந்துவிடு = [];
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
          பங்கேற்பாளர்: await விண்மீன்.obtIdCompte(),
          பரிந்துரை: {
            உரை: "தமிழ்",
            எண்: 123,
          },
        },
      ];

      பரிந்துரையு_சரிபார்த்தல்({
        மதிப்பு,
        குறிப்பு,
      });
    });

    it("பரிந்துரையை திருத்து", async () => {
      const பரிந்துரை_அடையாளம் = await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 123,
        },
      });
      const பரிந்துரை = {
        உரை: "தமிழ்",
        எண்: 456,
      };
      const குறிப்பு = [
        {
          பங்கேற்பாளர்: await விண்மீன்.obtIdCompte(),
          பரிந்துரை,
        },
      ];
      await என்_கிளி.பரிந்துரையை_திருத்து({
        பரிந்துரை,
        அடையாளம்: பரிந்துரை_அடையாளம்,
      });
      const மதிப்பு = await பரிந்துரைகள்.attendreQue(
        (ப) => ப[0].பரிந்துரை.எண் > 123,
      );
      பரிந்துரையு_சரிபார்த்தல்({
        மதிப்பு,
        குறிப்பு,
      });
    });
    it("பரிந்துரையை நீக்கு", async () => {
      const பரிந்துரை_அடையாளம் = await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 123,
        },
      });

      await பரிந்துரைகள்.attendreQue((ப) => ப.length > 0);
      await என்_கிளி.பரிந்துரையை_நீக்கு({
        அடையாளம்: பரிந்துரை_அடையாளம்,
      });
      await பரிந்துரைகள்.attendreQue((ப) => ப.length === 0);
    });

    it("பரிந்துரையை அங்கீகரி", async () => {
      const பரிந்துரை = {
        உரை: "தமிழ்",
        எண்: 123,
      };
      await என்_கிளி.பரிந்துரையு({
        பரிந்துரை,
      });
      const கிடைத்த_பரிந்துரைகள் = await பரிந்துரைகள்.attendreQue(
        (ப) => ப.length > 0,
      );
      await என்_கிளி.அங்கீகரி({
        பரிந்துரை: கிடைத்த_பரிந்துரைகள்[0],
      });

      const மதிப்பு = await அங்கீகரிக்கப்பட்டவை.attendreQue(
        (அங்கீ) => அங்கீ.length > 0,
      );

      const குறிப்பு = [
        {
          பங்கேற்பாளர்: await விண்மீன்.obtIdCompte(),
          ...பரிந்துரை,
        },
      ];
      அங்கீகரி_சரிபார்த்தல்({
        மதிப்பு,
        குறிப்பு,
      });
    });

    it("புதுச பரிந்துரையை அங்கீகரி", async () => {
      await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 123,
        },
      });
      let கிடைத்த_பரிந்துரைகள் = await பரிந்துரைகள்.attendreQue(
        (ப) => ப.length > 0,
      );
      await என்_கிளி.அங்கீகரி({
        பரிந்துரை: கிடைத்த_பரிந்துரைகள்[0],
      });

      await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 456,
        },
      });
      கிடைத்த_பரிந்துரைகள் = await பரிந்துரைகள்.attendreQue(
        (ப) => ப.length > 1,
      );

      const புதுச_பரிந்துரை = கிடைத்த_பரிந்துரைகள்.find(
        (ப) => ப.பரிந்துரை.எண் > 123,
      );
      expect(புதுச_பரிந்துரை).to.exist();

      const அடையாளம் = (
        await அங்கீகரிக்கப்பட்டவை.attendreQue((அங்கீ) => அங்கீ.length > 0)
      )[0].id;

      await என்_கிளி.அங்கீகரிக்கப்பட்ட_உறுப்படியை_திருத்து({
        அடையாளம்,
        பரிந்துரை: புதுச_பரிந்துரை!,
      });

      const மதிப்பு = [
        (
          await அங்கீகரிக்கப்பட்டவை.attendreQue(
            (அங்கீ) => !!அங்கீ.find((இ) => இ.données.எண் > 123),
          )
        ).find((இ) => இ.données.எண் > 123)!,
      ];
      const குறிப்பு = [
        {
          பங்கேற்பாளர்: await விண்மீன்.obtIdCompte(),
          உரை: "தமிழ்",
          எண்: 456,
        },
      ];
      அங்கீகரி_சரிபார்த்தல்({
        மதிப்பு,
        குறிப்பு,
      });
    });

    it("பரிந்துரையை நீக்கு", async () => {
      await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 123,
        },
      });

      const கிடைத்த_பரிந்துரைகள் = await பரிந்துரைகள்.attendreQue(
        (ப) => ப.length > 0,
      );

      await என்_கிளி.அங்கீகரி({
        பரிந்துரை: கிடைத்த_பரிந்துரைகள்[0],
      });

      const உறுப்படி = (
        await அங்கீகரிக்கப்பட்டவை.attendreQue((அங்கீ) => அங்கீ.length > 0)
      )[0];

      await என்_கிளி.அங்கீகரிக்கப்பட்ட_உறுப்படியை_நீக்கு({
        அடையாளம்: உறுப்படி.id,
      });

      await அங்கீகரிக்கப்பட்டவை.attendreQue((அங்கீ) => அங்கீ.length === 0);
    });
  });

  describe("விருப்பங்கள்", function () {
    let விண்மீன்: ClientConstellation;
    let வாடிகையாளர்கள்: ClientConstellation[];
    let வார்ப்புரு: bds.schémaSpécificationBd;
    let குழு_அடையாளம்: string;

    let விண்மீனை_மரந்துவிடு: types.schémaFonctionOublier | undefined =
      undefined;
    let மரந்துவிடு: types.schémaFonctionOublier[] = [];

    before("தயாரிப்பு", async () => {
      const { clients, fOublier } = await utilsTestsClient.générerClients({
        n: 1,
        type: "proc",
        générerClient,
      });
      வாடிகையாளர்கள் = clients as ClientConstellation[];
      விண்மீனை_மரந்துவிடு = fOublier;

      விண்மீன் = வாடிகையாளர்கள்[0];
    });

    after(async () => {
      if (விண்மீனை_மரந்துவிடு) await விண்மீனை_மரந்துவிடு();
    });

    this.beforeEach(async () => {
      const உரை_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "chaîne",
      });
      const எண்_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "numérique",
      });
      const சிறப்பு_சொல் = await விண்மீன்.motsClefs.créerMotClef();

      வார்ப்புரு = {
        licence: "ODBl-1_0",
        motsClefs: [சிறப்பு_சொல்],
        tableaux: [
          {
            cols: [
              {
                idVariable: உரை_மாறி,
                idColonne: "உரை",
                index: true,
              },
              {
                idVariable: எண்_மாறி,
                idColonne: "எண்",
              },
            ],
            clef: "அட்டவணை சாபி",
          },
          {
            cols: [
              {
                idVariable: எண்_மாறி,
                idColonne: "எண்",
              },
            ],
            clef: "இன்னொரு அட்டவணை",
          },
        ],
      };
      குழு_அடையாளம் = await கிளி.உருவாக்கு({
        விண்மீன்,
        வார்ப்புரு,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
        மாறிலிகள்: {
          தேதி_நெடுவரிசை_அடையாளம்: "தேதி மற்றும் நேரம்",
        },
      });
    });

    afterEach(async () => {
      await Promise.all(மரந்துவிடு.map((செ) => செ()));
      மரந்துவிடு = [];
    });

    it("வேறு தேதி மற்றும் பங்கேற்பாளர் நெடுவரிசை பெயர்", async () => {
      const பரிந்துரைகள் = new attente.AttendreRésultat<
        பிணையம்_பரிந்துரை<{ உரை: string; எண்: number }, "தேதி மற்றிம் நேரம்">[]
      >();
      const அங்கீகரிக்கப்பட்டவை = new attente.AttendreRésultat<
        tableaux.élémentDonnées<
          அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<
            { உரை: string; எண்: number },
            "பங்கேற்பாளர் அடையாளம்",
            "தேதி மற்றிம் நேரம்"
          >
        >[]
      >();

      const என்_கிளி = new கிளி<
        { உரை: string; எண்: number },
        "பங்கேற்பாளர் அடையாளம்",
        "தேதி மற்றிம் நேரம்"
      >({
        விண்மீன்,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
        குழு_அடையாளம்,
        வார்ப்புரு,
        மாறிலிகள்: {
          தேதி_நெடுவரிசை_அடையாளம்: "தேதி மற்றிம் நேரம்",
          பங்கேற்பாளர்_நெடுவரிசை_அடையாளம்: "பங்கேற்பாளர் அடையாளம்",
        },
      });

      const { fOublier: பரிந்துரைகளை_மரந்துவிடு } =
        await என்_கிளி.பரிந்துரைகளை_கேள்ளு({
          செ: (ப) => பரிந்துரைகள்.mettreÀJour(ப),
        });
      மரந்துவிடு.push(பரிந்துரைகளை_மரந்துவிடு);

      const அங்கீகரிக்கப்பட்டவையை_மரந்துவிடு =
        await என்_கிளி.அங்கீகரிக்கப்பட்ட_உறுப்படிகளை_கேள்ளு({
          செ: (உறுப்படி) => அங்கீகரிக்கப்பட்டவை.mettreÀJour(உறுப்படி),
        });
      மரந்துவிடு.push(அங்கீகரிக்கப்பட்டவையை_மரந்துவிடு);

      await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 456,
        },
      });
      const கிடைத்த_பரிந்துரைகள் = await பரிந்துரைகள்.attendreQue(
        (ப) => ப.length > 0,
      );
      expect(கிடைத்த_பரிந்துரைகள்[0].பரிந்துரை["தேதி மற்றிம் நேரம்"])
        .to.be.a("number")
        .lessThan(Date.now());

      await என்_கிளி.அங்கீகரி({ பரிந்துரை: கிடைத்த_பரிந்துரைகள்[0] });
      const கிடைத்த_அங்கீகரிக்கப்பட்டவை = await அங்கீகரிக்கப்பட்டவை.attendreQue(
        (அங்கீ) => அங்கீ.length > 0,
      );
      expect(கிடைத்த_அங்கீகரிக்கப்பட்டவை[0].données["தேதி மற்றிம் நேரம்"])
        .to.be.a("number")
        .lessThan(Date.now());
      expect(
        கிடைத்த_அங்கீகரிக்கப்பட்டவை[0].données["பங்கேற்பாளர் அடையாளம்"],
      ).to.equal(await விண்மீன்.obtIdCompte());
    });
  });

  describe("இணையம்", function () {
    let விண்மீன்: ClientConstellation;
    let வேறு_விண்மீன்: ClientConstellation;
    let வாடிகையாளர்கள்: ClientConstellation[];
    let வார்ப்புரு: bds.schémaSpécificationBd;
    let குழு_அடையாளம்: string;

    let என்_கிளி: கிளி<{ உரை: string; எண்: number }>;
    let வேறு_கிளி: கிளி<{ உரை: string; எண்: number }>;

    let விண்மீனை_மரந்துவிடு: types.schémaFonctionOublier | undefined =
      undefined;
    let மரந்துவிடு: types.schémaFonctionOublier[] = [];

    before("தயாரிப்பு", async () => {
      const { clients, fOublier } = await utilsTestsClient.générerClients({
        n: isBrowser || isElectronRenderer ? 1 : 2, // உலாவியில் இரண்டு விண்மீன்களை ஒரே நேரத்தில் உருவாக்க முடியாது,
        type: "proc",
        générerClient,
      });
      வாடிகையாளர்கள் = clients as ClientConstellation[];
      விண்மீனை_மரந்துவிடு = fOublier;

      விண்மீன் = வாடிகையாளர்கள்[0];
      வேறு_விண்மீன் = வாடிகையாளர்கள்[வாடிகையாளர்கள்.length - 1];
    });

    after(async () => {
      if (விண்மீனை_மரந்துவிடு) await விண்மீனை_மரந்துவிடு();
    });

    this.beforeEach(async () => {
      const உரை_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "chaîne",
      });
      const எண்_மாறி = await விண்மீன்.variables.créerVariable({
        catégorie: "numérique",
      });
      const சிறப்பு_சொல் = await விண்மீன்.motsClefs.créerMotClef();

      வார்ப்புரு = {
        licence: "ODBl-1_0",
        motsClefs: [சிறப்பு_சொல்],
        tableaux: [
          {
            cols: [
              {
                idVariable: உரை_மாறி,
                idColonne: "உரை",
                index: true,
              },
              {
                idVariable: எண்_மாறி,
                idColonne: "எண்",
              },
            ],
            clef: "அட்டவணை சாபி",
          },
          {
            cols: [
              {
                idVariable: எண்_மாறி,
                idColonne: "எண்",
              },
            ],
            clef: "இன்னொரு அட்டவணை",
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

      வேறு_கிளி = new கிளி({
        விண்மீன்: வேறு_விண்மீன்,
        அட்டவணை_சாபி: "அட்டவணை சாபி",
        குழு_அடையாளம்,
        வார்ப்புரு,
      });
    });

    afterEach(async () => {
      await Promise.all(மரந்துவிடு.map((செ) => செ()));
      மரந்துவிடு = [];
    });

    it("உறுப்படிகள் - எனது பரிந்துரைகள்", async () => {
      const உறுப்படிகள் = new attente.AttendreRésultat<
        அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<{ உரை: string; எண்: number }>[]
      >();
      மரந்துவிடு.push(async () => உறுப்படிகள்.toutAnnuler());
      const உறுப்படிகளை_மறந்துவிடு = await என்_கிளி.உறுப்படிகளை_கேள்ளு({
        செ: (உறு) => உறுப்படிகள்.mettreÀJour(உறு),
      });
      மரந்துவிடு.push(உறுப்படிகளை_மறந்துவிடு);

      await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 123,
        },
      });
      const மதிப்பு = (
        await உறுப்படிகள்.attendreQue((உறு) => உறு.length > 0)
      ).map((உறு) => ({ données: உறு, id: "" }));
      அங்கீகரி_சரிபார்த்தல்({
        மதிப்பு,
        குறிப்பு: [
          {
            பங்கேற்பாளர்: await விண்மீன்.obtIdCompte(),
            உரை: "தமிழ்",
            எண்: 123,
          },
        ],
      });
    });

    it("உறுப்படிகள் - அனைத்தும் பரிந்துரைகள்", async () => {
      const உறுப்படிகள் = new attente.AttendreRésultat<
        அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<{ உரை: string; எண்: number }>[]
      >();
      மரந்துவிடு.push(async () => உறுப்படிகள்.toutAnnuler());
      const உறுப்படிகளை_மறந்துவிடு = await என்_கிளி.உறுப்படிகளை_கேள்ளு({
        செ: (உறு) => உறுப்படிகள்.mettreÀJour(உறு),
        பரிந்துரைகள்: "அனைத்தும்",
      });
      மரந்துவிடு.push(உறுப்படிகளை_மறந்துவிடு);

      await வேறு_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 123,
        },
      });
      const மதிப்பு = (
        await உறுப்படிகள்.attendreQue((உறு) => உறு.length > 0)
      ).map((உறு) => ({ données: உறு, id: "" }));
      அங்கீகரி_சரிபார்த்தல்({
        மதிப்பு,
        குறிப்பு: [
          {
            பங்கேற்பாளர்: await வேறு_விண்மீன்.obtIdCompte(),
            உரை: "தமிழ்",
            எண்: 123,
          },
        ],
      });
    });

    it("உறுப்படிகள் - அங்கீகரிக்கப்பட்ட மதிப்பைப் பயன்படுத்து", async () => {
      const பரிந்துரைகள் = new attente.AttendreRésultat<
        பிணையம்_பரிந்துரை<{ உரை: string; எண்: number }>[]
      >();
      மரந்துவிடு.push(async () => உறுப்படிகள்.toutAnnuler());
      const { fOublier: பரிந்துரைகள்_மறந்துவிடு } =
        await என்_கிளி.பரிந்துரைகளை_கேள்ளு({
          செ: (ப) => பரிந்துரைகள்.mettreÀJour(ப),
        });
      மரந்துவிடு.push(பரிந்துரைகள்_மறந்துவிடு);

      const உறுப்படிகள் = new attente.AttendreRésultat<
        அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<{ உரை: string; எண்: number }>[]
      >();
      மரந்துவிடு.push(async () => உறுப்படிகள்.toutAnnuler());
      const உறுப்படிகளை_மறந்துவிடு = await என்_கிளி.உறுப்படிகளை_கேள்ளு({
        செ: (உறு) => உறுப்படிகள்.mettreÀJour(உறு),
      });
      மரந்துவிடு.push(உறுப்படிகளை_மறந்துவிடு);

      await வேறு_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 456,
        },
      });

      await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 123,
        },
      });

      const மதிப்பு = (
        await உறுப்படிகள்.attendreQue((உறு) => உறு.length > 0)
      ).map((உறு) => ({ données: உறு, id: "எதோ ஒன்று" }));
      அங்கீகரி_சரிபார்த்தல்({
        மதிப்பு,
        குறிப்பு: [
          {
            பங்கேற்பாளர்: await விண்மீன்.obtIdCompte(),
            உரை: "தமிழ்",
            எண்: 123,
          },
        ],
      });
      const வேறு_பயனாளர்_அடையாளம் = await வேறு_விண்மீன்.obtIdCompte();
      const புதுச_பரிந்துரை = (
        await பரிந்துரைகள்.attendreQue(
          (ப) => !!ப.find((இ) => இ.பங்கேற்பாளர் === வேறு_பயனாளர்_அடையாளம்),
        )
      ).find((இ) => இ.பங்கேற்பாளர் === வேறு_பயனாளர்_அடையாளம்);
      await என்_கிளி.அங்கீகரி({
        பரிந்துரை: புதுச_பரிந்துரை!,
      });

      const புதுச_மதிப்பு = (
        await உறுப்படிகள்.attendreQue(
          (உறு) => உறு.length > 0 && உறு[0].எண் > 123,
        )
      ).map((உறு) => ({ données: உறு, id: "எதோ இரண்டு" }));

      அங்கீகரி_சரிபார்த்தல்({
        மதிப்பு: புதுச_மதிப்பு,
        குறிப்பு: [
          {
            பங்கேற்பாளர்: await வேறு_விண்மீன்.obtIdCompte(),
            உரை: "தமிழ்",
            எண்: 456,
          },
        ],
      });
    });

    it("உறுப்படிகள் - புதுச பரிந்துரையைப் பயன்படுத்து", async () => {
      const உறுப்படிகள் = new attente.AttendreRésultat<
        அங்கீகரிக்கப்பட்ட_உறுப்படி_வகை<{ உரை: string; எண்: number }>[]
      >();
      மரந்துவிடு.push(async () => உறுப்படிகள்.toutAnnuler());
      const உறுப்படிகளை_மறந்துவிடு = await என்_கிளி.உறுப்படிகளை_கேள்ளு({
        செ: (உறு) => உறுப்படிகள்.mettreÀJour(உறு),
      });
      மரந்துவிடு.push(உறுப்படிகளை_மறந்துவிடு);

      await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 123,
        },
      });


      const மதிப்பு = (
        await உறுப்படிகள்.attendreQue((உறு) => உறு.length > 0)
      ).map((உறு) => ({ données: உறு, id: "" }));

      அங்கீகரி_சரிபார்த்தல்({
        மதிப்பு,
        குறிப்பு: [
          {
            பங்கேற்பாளர்: await விண்மீன்.obtIdCompte(),
            உரை: "தமிழ்",
            எண்: 123,
          },
        ],
      });

      await என்_கிளி.பரிந்துரையு({
        பரிந்துரை: {
          உரை: "தமிழ்",
          எண்: 456,
        },
      });

      const புதுச_மதிப்பு = (
        await உறுப்படிகள்.attendreQue(
          (உறு) => உறு.length > 0 && உறு[0].எண் > 123,
        )
      ).map((உறு) => ({ données: உறு, id: "" }));
      அங்கீகரி_சரிபார்த்தல்({
        மதிப்பு: புதுச_மதிப்பு,
        குறிப்பு: [
          {
            பங்கேற்பாளர்: await விண்மீன்.obtIdCompte(),
            உரை: "தமிழ்",
            எண்: 456,
          },
        ],
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

    let மரந்துவிடு: types.schémaFonctionOublier[] = [
      async () => பரிந்துரைகள்.toutAnnuler(),
    ];
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
      மரந்துவிடு = [];
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
          பரிந்துரை: {
            உரை: "தமிழ்",
            எண்: 123,
          },
          பங்கேற்பாளர்: await வேறு_விண்மீன்.obtIdCompte(),
        },
      ];
      பரிந்துரையு_சரிபார்த்தல்({
        மதிப்பு,
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

    let மரந்துவிடு: types.schémaFonctionOublier[] = [
      async () => பரிந்துரைகள்.toutAnnuler(),
    ];
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
      மரந்துவிடு = [];
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
          பரிந்துரை: {
            உரை: "தமிழ்",
            எண்: 123,
          },
          பங்கேற்பாளர்: await வேறு_விண்மீன்.obtIdCompte(),
        },
      ];
      பரிந்துரையு_சரிபார்த்தல்({
        மதிப்பு,
        குறிப்பு,
      });
    });
  });
});
