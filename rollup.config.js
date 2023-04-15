/* eslint import/no-extraneous-dependencies: ['error', {'devDependencies': true}] */
import autoExternal from 'rollup-plugin-auto-external';

export default {
  input: 'src/index.js',
  plugins: [autoExternal()],
  output: [
    {file: 'lib/index.js', format: 'esm', sourcemap: true}
  ]
};
