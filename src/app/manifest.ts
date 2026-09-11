import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OAK Partner Convening 2026",
    short_name: "OAK 2026",
    description:
      "Registration, passes, programme, and partner directory for the OAK Partner Convening 2026.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#162E55",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
