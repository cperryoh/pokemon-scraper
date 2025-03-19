const puppeteer = require("puppeteer");
const fs = require("fs");
const https = require("https");
const jp_url = "https://jp.pokellector.com/Expansion-Pack-Expansion/";
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close();
          resolve(filepath);
        });

        fileStream.on("error", (err) => {
          fs.unlink(filepath, () => {}); // Delete the file if there's an error
          reject(err);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};
async function get_cards(page) {
  return await page.$$("div.card");
}
async function go_back(page) {
  await page.goto(jp_url);
}
async function get_info(page) {
  let title = await page.$("h1.icon.set");
  const textObject = (
    await page.evaluate((name) => name.innerText, title)
  ).replace("\n", "_");
  console.log(textObject);
  const card = await page.$("div.card > img");

  const url = await page.evaluate((c) => c.src, card);
  await downloadImage(url, `./cards/jp/${textObject}.png`);
  console.log(url);
}
async function scroll_to_bottom(page) {
  await page.evaluate(() => {
    window.scrollBy(0, 10000); // Scroll down by 500 pixels
  });
  await delay(1000);
}
async function scrape() {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    // Create a new page
    const page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 800,
    });

    // Navigate to website
    await go_back(page);
    let card_count = (await get_cards(page)).length;
    console.log(card_count);
    var i = 0;
    for (var i = 29; i < card_count; i++) {
      let cards = await get_cards(page);
      await cards[i].click();
      await delay(500);
      await get_info(page);
      await go_back(page);
    }
    // Extract data from the page
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Always close the browser
    await browser.close();
  }
}

scrape();
