const isNext12 = (config) => !!config.module.rules.find((rule) => rule.oneOf);

const updateNextGreaterThan12Config = (config) => {
  const oneOfRule = config.module.rules.find((rule) => rule.oneOf);

  // Next 12 has multiple TS loaders, and we need to update all of them.
  const tsRules = oneOfRule.oneOf.filter(
    (rule) => rule.test && rule.test.toString().includes("tsx|ts")
  );

  tsRules.forEach((rule) => {
    // eslint-disable-next-line no-param-reassign
    rule.include = undefined;
  });

  return config;
};

const updateNextLessThan12Config = (config) => {
  // Next < 12 uses a single Babel loader.
  const tsRule = config.module.rules.find(
    (rule) => rule.test && rule.test.toString().includes("tsx|ts")
  );

  tsRule.include = undefined;
  tsRule.exclude = /node_modules/;

  return config;
};

module.exports = {
  compiler: {
    styledComponents: {
      displayName: false,
      ssr: true,
    },
  },
  swcMinify: true,
  images: {
    domains: ["raw.githubusercontent.com"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/trade/1",
        permanent: false,
      },
    ];
  },
  webpack: (config) => {
    if (isNext12(config)) return updateNextGreaterThan12Config(config);
    return updateNextLessThan12Config(config);
  },
};
