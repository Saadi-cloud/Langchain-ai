import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import "dotenv/config";
import OpenAI from "openai";

type similarityMatrics = "cosine" | "euclidean" | "dot_product";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const f1Data = [
  "https://en.wikipedia.org/wiki/Formula_One",
  "https://www.formula1.com/en/latest/all",
  "https://www.forbes.com/sites/brettknight/2023/11/29/formula-1s-highest-paid-driver-2023/?sh=12bdb942463f",
  "https://www.autosport.com/f1/news/history-of-female-f1-drivers-including-grand-prix-starters-and-test-drivers/10584871/",
  "https://en.wikipedia.org/wiki/2023 Formula One World Championship",
  "https://en.wikipedia.org/wiki/2022 Formula One World Championship",
  "https://en.wikipedia.org/wiki/List_of_Formula_One_World_Drivers%27_Champions",
  "https://en.wikipedia.org/wiki/2024 Formula One World Championship",
  "https://www.formula1.com/en/results.html/2024/races.html",
  "https://www.formula1.com/en/racing/2024.html",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async (
  similarityMetrics: similarityMatrics = "dot_product"
) => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: similarityMetrics,
    },
  });
  console.log(res);
};

const loadSampleData = async () => {
  const collection = db.collection(ASTRA_DB_COLLECTION);
  for await (const url of f1Data) {
    const content = await scrapePage(url);
    const chunks = splitter.splitText(content);
    for await (const chunk of await chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });
      const vector = embedding.data[0].embedding;

      const res = await collection.insertOne({
        $vector: vector,
        text: chunk,
      });
      console.log(res);
    }
  }
};

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: true,
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
      },
      evaluate: async (page, browser) => {
       const result = await page.evaluate(() => document.body.innerHTML)
       await browser.close()
        return result
      }
    });
    return (await (loader.scrape()))?.replace(/<[^>]*>?/gm, '');
}

createCollection().then(() => loadSampleData());

