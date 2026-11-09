
export default {
  multipass: true,
  floatPrecision: 3,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: false,
          convertPathData: {
            floatPrecision: 3,
          },
        },
      },
    },
  ],
};
