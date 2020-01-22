import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import minify from 'rollup-plugin-babel-minify';
import ignoreImport from 'rollup-plugin-ignore-import';

const isExternal = p => !!/^three/.test(p);

export default {
  input: 'src/index.ts',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    typescript({ useTsconfigDeclarationDir: true }),
    commonjs({ extensions: ['.js', '.ts'] }),
    ignoreImport({
      include: ['src/utils/attachPCL.js'],
      body: 'export default undefined;',
    }),
    minify({
      // TODO: remove this once all files have been translated to `.ts` files
      comments: false,
    }),
  ],
  treeshake: true,
  external: p => isExternal(p),
  output: [
    {
      format: 'umd',
      name: 'amphion',
      file: 'build/wasmless/amphion.js',
      sourcemap: true,
    },
    {
      format: 'es',
      file: 'build/wasmless/amphion.module.js',
    },
  ],
};
