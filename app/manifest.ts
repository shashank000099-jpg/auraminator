import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AURAMINATOR.IN • Elite Multi-Sided Commerce Engine",
    short_name: "AURAMINATOR",
    description: "Enterprise marketplace for luxury streetwear and encrypted digital vaults.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
