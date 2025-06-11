module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    {
      pattern:
        /(bg|border)-(gray|blue|green|pink|red|orange|yellow|purple|indigo|teal)-(100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern:
        /dark:(bg|border)-(gray|blue|green|pink|red|orange|yellow|purple|indigo|teal)-(700)/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
