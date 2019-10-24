import localResolve from 'rollup-plugin-local-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

const isExternal = p => !!/^three/.test(p);

export default {
  input: 'src/index.js',
  plugins: [
    localResolve(),
    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**',
      presets: ['@babel/env'],
      plugins: ['@babel/plugin-transform-runtime'],
    }),
    commonjs(),
  ],
  treeshake: true,
  external: p => isExternal(p),
  output: [
    {
      format: 'umd',
      name: 'amphion',
      file: 'build/amphion.js',
      sourcemap: true,
      globals: path => (/^three/.test(path) ? 'THREE' : null),
    },
    {
      format: 'es',
      file: 'build/amphion.module.js',
    },
  ],
};
