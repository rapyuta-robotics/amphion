/*
  This file is in js format intentionally.
  Using dynamic import requires targeting "esnext",
  which prevents us from creating a UMD bundle
 */
import { PCLDecoder } from './pcl';

if (!window.WebAssembly) {
  import('pcl-decoder').then(module => {
    PCLDecoder.attachDecoder(module);
  });
}
