/**
 * Software License Agreement (BSD License)

 Copyright (c) 2014, Worcester Polytechnic Institute, Robert Bosch
 LLC, Yujin Robot. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:

 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above
 copyright notice, this list of conditions and the following
 disclaimer in the documentation and/or other materials provided
 with the distribution.
 * Neither the name of Worcester Polytechnic Institute, Robert
 Bosch LLC, Yujin Robot nor the names of its contributors may be
 used to endorse or promote products derived from this software
 without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @author Julius Kammerl - jkammerl@willowgarage.com
 */

import {
  Geometry,
  Object3D,
  Points,
  ShaderMaterial,
  Texture,
  Vector3,
} from 'three';

import { DEFAULT_OPTIONS_DEPTHCLOUD } from '../utils/constants';
import { assertIsHTMLVideoElement } from '../utils/helpers';

const vertexShader = `uniform sampler2D map;

uniform float width;
uniform float height;
uniform float nearClipping, farClipping;

uniform float pointSize;
uniform float zOffset;

uniform float focallength;
uniform float maxDepthPerTile;
uniform float resolutionFactor;

varying vec2 vUvP;
varying vec2 colorP;

varying float depthVariance;
varying float maskVal;

float sampleDepth(vec2 pos)
  {
    float depth;

    vec2 vUv = vec2( pos.x / (width*2.0), pos.y / (height*2.0)+0.5 );
    vec2 vUv2 = vec2( pos.x / (width*2.0)+0.5, pos.y / (height*2.0)+0.5 );

    vec4 depthColor = texture2D( map, vUv );

    depth = ( depthColor.r + depthColor.g + depthColor.b ) / 3.0 ;

    if (depth>0.99)
    {
      vec4 depthColor2 = texture2D( map, vUv2 );
      float depth2 = ( depthColor2.r + depthColor2.g + depthColor2.b ) / 3.0 ;
      depth = 0.99+depth2;
    }

    return depth;
  }

float median(float a, float b, float c)
  {
    float r=a;

    if ( (a<b) && (b<c) )
    {
      r = b;
    }
    if ( (a<c) && (c<b) )
    {
      r = c;
    }
    return r;
  }

float variance(float d1, float d2, float d3, float d4, float d5, float d6, float d7, float d8, float d9)
  {
    float mean = (d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8 + d9) / 9.0;
    float t1 = (d1-mean);
    float t2 = (d2-mean);
    float t3 = (d3-mean);
    float t4 = (d4-mean);
    float t5 = (d5-mean);
    float t6 = (d6-mean);
    float t7 = (d7-mean);
    float t8 = (d8-mean);
    float t9 = (d9-mean);
    float v = (t1*t1+t2*t2+t3*t3+t4*t4+t5*t5+t6*t6+t7*t7+t8*t8+t9*t9)/9.0;
    return v;
  }

vec2 decodeDepth(vec2 pos)
  {
    vec2 ret;


    float depth1 = sampleDepth(vec2(position.x-1.0, position.y-1.0));
    float depth2 = sampleDepth(vec2(position.x, position.y-1.0));
    float depth3 = sampleDepth(vec2(position.x+1.0, position.y-1.0));
    float depth4 = sampleDepth(vec2(position.x-1.0, position.y));
    float depth5 = sampleDepth(vec2(position.x, position.y));
    float depth6 = sampleDepth(vec2(position.x+1.0, position.y));
    float depth7 = sampleDepth(vec2(position.x-1.0, position.y+1.0));
    float depth8 = sampleDepth(vec2(position.x, position.y+1.0));
    float depth9 = sampleDepth(vec2(position.x+1.0, position.y+1.0));

    float median1 = median(depth1, depth2, depth3);
    float median2 = median(depth4, depth5, depth6);
    float median3 = median(depth7, depth8, depth9);

    ret.x = median(median1, median2, median3);
    ret.y = variance(depth1, depth2, depth3, depth4, depth5, depth6, depth7, depth8, depth9);

    return ret;

  }


void main() {

  vUvP = vec2( position.x / (width*2.0), position.y / (height*2.0)+0.5 );
  colorP = vec2( position.x / (width*2.0)+0.5 , position.y / (height*2.0)  );

  vec4 pos = vec4(0.0,0.0,0.0,0.0);
  depthVariance = 0.0;

  if ( (vUvP.x<0.0)|| (vUvP.x>0.5) || (vUvP.y<0.5) || (vUvP.y>0.0))
  {
    vec2 smp = decodeDepth(vec2(position.x, position.y));
    float depth = smp.x;
    depthVariance = smp.y;

    float z = -depth;

    pos = vec4(
      ( position.x / width - 0.5 ) * z * 0.5 * maxDepthPerTile * resolutionFactor * (1000.0/focallength) * -1.0,
      ( position.y / height - 0.5 ) * z * 0.5 * maxDepthPerTile * resolutionFactor * (1000.0/focallength),
      (- z + zOffset / 1000.0) * maxDepthPerTile,
      1.0);

    vec2 maskP = vec2( position.x / (width*2.0), position.y / (height*2.0)  );
    vec4 maskColor = texture2D( map, maskP );
    maskVal = ( maskColor.r + maskColor.g + maskColor.b ) / 3.0 ;
  }

  gl_PointSize = pointSize;
  gl_Position = projectionMatrix * modelViewMatrix * pos;

}`;

const fragmentShader = `uniform sampler2D map;
uniform float varianceThreshold;
uniform float whiteness;

varying vec2 vUvP;
varying vec2 colorP;

varying float depthVariance;
varying float maskVal;


void main() {

  vec4 color;

  if ( (depthVariance>varianceThreshold) || (maskVal>0.5) ||(vUvP.x<0.0)|| (vUvP.x>0.5) || (vUvP.y<0.5) || (vUvP.y>1.0))
  {
    discard;
  }
  else
  {
    color = texture2D( map, colorP );

    float fader = whiteness /100.0;

    color.r = color.r * (1.0-fader)+ fader;

    color.g = color.g * (1.0-fader)+ fader;

    color.b = color.b * (1.0-fader)+ fader;

    color.a = 1.0;//smoothstep( 20000.0, -20000.0, gl_FragCoord.z / gl_FragCoord.w );
  }

  gl_FragColor = vec4( color.r, color.g, color.b, color.a );

}`;

class DepthCloudObject extends Object3D {
  private readonly options = DEFAULT_OPTIONS_DEPTHCLOUD;
  private readonly url: string;
  private metaLoaded = false;
  private video: HTMLImageElement | HTMLVideoElement | undefined;
  private texture: Texture | undefined;
  private geometry: Geometry | undefined;
  private material: ShaderMaterial | undefined;
  private mesh: Points | undefined;

  constructor(url: string, options = DEFAULT_OPTIONS_DEPTHCLOUD) {
    super();
    this.options = {
      ...DEFAULT_OPTIONS_DEPTHCLOUD,
      ...options,
    };
    this.url = url;

    this.animate = this.animate.bind(this);
    this.onMetaLoaded = this.onMetaLoaded.bind(this);
  }

  onMetaLoaded() {
    this.metaLoaded = true;
    this.initStreamer();
  }

  isMjpeg() {
    const { streamType } = this.options;
    return streamType.toLowerCase() === 'mjpeg';
  }

  initVideo() {
    const { height, width } = this.options;

    this.video = document.createElement(this.isMjpeg() ? 'img' : 'video');
    this.video.width = width;
    this.video.height = height;
    this.video.addEventListener(
      this.isMjpeg() ? 'load' : 'loadedmetadata',
      this.onMetaLoaded,
      false,
    );

    if (!this.isMjpeg()) {
      assertIsHTMLVideoElement(this.video);
      this.video.loop = true;
    }

    this.video.src = this.url;
    this.video.crossOrigin = 'Anonymous';
    this.video.setAttribute('crossorigin', 'Anonymous');
  }

  initStreamer() {
    const {
      f,
      height,
      maxDepthPerTile,
      pointSize,
      varianceThreshold,
      whiteness,
      width,
    } = this.options;
    const resolutionFactor = Math.max(width, height) / 1024;
    if (this.metaLoaded) {
      this.texture = new Texture(this.video);
      this.geometry = new Geometry();

      const halfWidth = width / 2;
      const halfHeight = height / 2;
      for (let i = 0, l = halfWidth * halfHeight; i < l; i += 1) {
        this.geometry.vertices.push(
          new Vector3(i % halfWidth, i / halfWidth, 0),
        );
      }

      this.material = new ShaderMaterial({
        uniforms: {
          map: { type: 't', value: this.texture },
          width: { type: 'f', value: halfWidth },
          height: { type: 'f', value: halfHeight },
          focallength: { type: 'f', value: f },
          pointSize: { type: 'f', value: pointSize },
          zOffset: { type: 'f', value: 0 },
          whiteness: { type: 'f', value: whiteness },
          varianceThreshold: { type: 'f', value: varianceThreshold },
          maxDepthPerTile: { type: 'f', value: maxDepthPerTile },
          resolutionFactor: { type: 'f', value: resolutionFactor },
        },
        vertexShader,
        fragmentShader,
      });

      this.mesh = new Points(this.geometry, this.material);
      this.mesh.frustumCulled = false;
      this.mesh.position.set(0, 0, 0);

      this.add(this.mesh);

      requestAnimationFrame(this.animate);
    }
  }

  animate() {
    if (!this.texture) {
      return;
    }
    if (this.isMjpeg()) {
      this.texture.needsUpdate = true;
    } else {
      assertIsHTMLVideoElement(this.video);
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.texture.needsUpdate = true;
      }
    }
    if (this.video?.src) {
      requestAnimationFrame(this.animate);
    }
  }

  startStream() {
    if (!this.isMjpeg()) {
      assertIsHTMLVideoElement(this.video);
      this.video.play();
    }
  }

  stopStream() {
    if (!this.isMjpeg()) {
      assertIsHTMLVideoElement(this.video);
      this.video.pause();
    }
    this.video?.removeAttribute('src');
  }
}

export default DepthCloudObject;
