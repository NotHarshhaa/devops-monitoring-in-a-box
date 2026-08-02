import next from 'eslint-config-next';

/**
 * Flat ESLint configuration.
 *
 * The project previously had no ESLint config at all, and `next lint` (which
 * this repo's lint script called) was removed in Next.js 16 - so linting was a
 * no-op that then became a hard error. ESLint is now invoked directly.
 */
export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'coverage/**',
      'next-env.d.ts',
      'prisma/generated/**',
      '*.tsbuildinfo',
    ],
  },
  ...next,
  {
    rules: {
      // Genuine correctness rule: conditional hooks change hook order between
      // renders and crash React. Kept as an error.
      'react-hooks/rules-of-hooks': 'error',

      // The rules below arrived with eslint-config-next 16 and flag React
      // Compiler-oriented patterns across a lot of pre-existing code. They are
      // warnings so `npm run lint` stays actionable while the fetch-in-effect
      // hooks are migrated to react-query incrementally.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',

      // The dashboard renders remote monitoring images and logos where the
      // Next Image component's optimisation is not applicable.
      '@next/next/no-img-element': 'warn',
      // Escaped entities are a stylistic concern, not a defect.
      'react/no-unescaped-entities': 'warn',
    },
  },
];
