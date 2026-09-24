import { stylexPlugin } from "./babel.config.js";

export default {
  plugins: {
    "@stylexjs/postcss-plugin": {
      babelConfig: {
        babelrc: false,
        parserOpts: { plugins: ["jsx", "typescript"] },
        plugins: [stylexPlugin],
      },
      include: [
        "app/**/*.{js,jsx,ts,tsx}",
        "features/**/*.{js,jsx,ts,tsx}",
        "theme/**/*.{js,jsx,ts,tsx}",
        "tokens/generated/**/*.{js,ts,tsx}",
        "ui/**/*.{js,jsx,ts,tsx}",
      ],
      useCSSLayers: true,
    },
    autoprefixer: {},
  },
};
