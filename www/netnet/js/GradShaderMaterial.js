/* global THREE */
class GradShaderMaterial {
  constructor (unis) {
    unis = unis || {}
    this.uniforms = {
      time: { type: 'f', value: unis.time || 0 },
      xMult: { type: 'f', value: unis.xMult || 1 },
      xAdd: { type: 'f', value: unis.xAdd || 0.69 },
      yMult: { type: 'f', value: unis.yMult || 0.19 },
      yAdd: { type: 'f', value: unis.yAdd || 0.36 },
      zMult: { type: 'f', value: unis.zMult || 0.166 },
      zAdd: { type: 'f', value: unis.zAdd || 0.71 },
      alpha: { type: 'f', value: unis.alpha || 1 }
    }

    this.material = new THREE.ShaderMaterial({
      // uniforms: this.uniCube,
      // uniforms: this.unis['open-call'],
      uniforms: this.uniforms,
      // linewidth: 2,
      vertexShader: this.vertexShader(),
      fragmentShader: this.fragmentShader(),
      side: THREE.DoubleSide
      // transparent: true,
      // opacity: 0.7
    })

    // this.createGUI()
  }

  createGUI () {
    this.gui = new window.dat.GUI()
    const u = this.uniforms
    this.gui.add(u.xMult, 'value', -1, 1).name('xMult')
    this.gui.add(u.xAdd, 'value', -1, 1).name('xAdd')
    this.gui.add(u.yMult, 'value', -1, 1).name('yMult')
    this.gui.add(u.yAdd, 'value', -1, 1).name('yAdd')
    this.gui.add(u.zMult, 'value', -1, 1).name('zMult')
    this.gui.add(u.zAdd, 'value', -1, 1).name('zAdd')
    this.gui.add(u.alpha, 'value', -1, 1).name('alpha')
  }

  vertexShader () {
    return `
    varying vec3 vp;
    void main() {
        vec3 trans = vec3(position);
        vec4 mvPos = modelViewMatrix * vec4(trans,1.0);
        gl_Position = projectionMatrix * mvPos;
        vp = -mvPos.xyz;
    }`
  }

  fragmentShader () {
    return `#include <common>

      uniform float time;
      uniform float xMult;
      uniform float xAdd;
      uniform float yMult;
      uniform float yAdd;
      uniform float zMult;
      uniform float zAdd;
      uniform float alpha;

      varying vec3 vp;

      void main() {
        vec3 fdx = vec3(dFdx(vp.x), dFdx(vp.y), dFdx(vp.z));
        vec3 fdy = vec3(dFdy(vp.x), dFdy(vp.y), dFdy(vp.z));
        vec3 fdz = vec3(dFdx(vp.x), dFdx(vp.y), dFdx(vp.z));
        vec3 fdxy = refract( fdy, fdz, 1.0 );
        vec3 norm = normalize( fdxy );
        vec3 norm1 = normalize( cross( fdx, fdy ) );
        float x = norm.x * xMult + xAdd;
        // float x = sin(vp.x * xMult * 0.5);
        float y = norm.y * yMult + yAdd;
        float z = norm.z * zMult + zAdd;
        gl_FragColor = vec4( x, y, z, alpha );
      }`
  }
}

window.GradShaderMaterial = GradShaderMaterial
