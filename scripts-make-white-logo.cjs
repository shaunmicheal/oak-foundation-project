const fs = require("fs");
const sharp = require("sharp");

(async () => {
  const svg = fs.readFileSync("public/logo.svg");
  // The SVG viewport is 85x53 but embeds a 3840px raster - render at high density
  const rendered = await sharp(svg, { density: 1100 })
    .resize({ width: 1024 })
    .png()
    .toBuffer();

  const meta = await sharp(rendered).metadata();
  const stats = await sharp(rendered).stats();
  console.log(
    "channels:", stats.channels.length,
    "alphaMin:", stats.channels.length > 3 ? stats.channels[3].min : "n/a"
  );

  const hasAlpha = stats.channels.length === 4 && stats.channels[3].min < 250;
  let out;

  if (hasAlpha) {
    // Recolor every visible pixel to white, preserving transparency
    const w = meta.width;
    const h = meta.height;
    const whiteRect = Buffer.from(
      `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#ffffff"/></svg>`
    );
    out = await sharp(rendered)
      .composite([{ input: whiteRect, blend: "in" }])
      .png()
      .toBuffer();
  } else {
    // No alpha channel: turn near-white pixels transparent, everything else white
    const { data, info } = await sharp(rendered)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
        data[i + 3] = 0;
      } else {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }
    out = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toBuffer();
  }

  await sharp(out).png().toFile("public/logo-white.png");
  const finalMeta = await sharp("public/logo-white.png").metadata();
  console.log("logo-white.png:", finalMeta.width + "x" + finalMeta.height);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
