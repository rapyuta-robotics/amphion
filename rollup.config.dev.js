import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';

const isExternal = p => !!/^three/.test(p);

export default {
  input: 'src/index.ts',
  watch: {
    chokidar: false,
  },
  onwarn(message) {
    if (
      // these two messages are false positives
      // need to investigate why these are triggered
      message.code === 'MISSING_GLOBAL_NAME' ||
      message.code === 'UNRESOLVED_IMPORT'
    ) {
      return;
    }
    console.warn(message);
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    typescript({ useTsconfigDeclarationDir: true }),
    commonjs({ extensions: ['.js', '.ts'] }),
  ],
  treeshake: true,
  external: p => isExternal(p),
  output: [
    {
      format: 'umd',
      name: 'amphion',
      file: 'build/amphion.js',
      sourcemap: true,
    },
    {
      format: 'es',
      file: 'build/amphion.module.js',
    },
  ],
};
