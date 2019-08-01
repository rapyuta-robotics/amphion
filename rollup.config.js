import localResolve from 'rollup-plugin-local-resolve';

const isExternal = p => !!(/^three/.test(p));

export default {
  input: 'src/index.js',
  plugins: [
    localResolve(),
  ],
  treeshake: true,
  external: p => isExternal(p),
  output: [
    {
      format: 'umd',
      name: 'amphion',
      file: 'build/amphion.js',
      sourcemap: true,
      globals: path => /^three/.test(path) ? 'THREE' : null,
    },
    {
      format: 'es',
      file: 'build/amphion.module.js',
    }
  ],

};
