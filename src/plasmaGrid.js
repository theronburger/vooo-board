
const plasmaGridVertex = `
attribute vec2 position;
varying vec2 vUv;
uniform float aspectRatio;
void main() {
    vUv = position * 0.5 + 0.5;
    vUv.x *= aspectRatio;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const plasmaGridFragment = `
//Shader modified for TWGL from Martin Wecke's ThreeJS background shader for the same project
#extension GL_OES_standard_derivatives : enable
precision highp float;

varying vec2 vUv;

uniform float time;
uniform vec2 gridSize;
uniform vec3 backgroundColor;
uniform vec3 foregroundColor;

#define PI 3.1415926535897932384626433832795


float getGrid(vec2 gridSize, float lineWidth) {
    float rX = vUv.x / gridSize.x;
    float rY = vUv.y / gridSize.y;
    float gridX = abs(fract(rX - 0.5) - 0.5) / fwidth(rX);
    float gridY = abs(fract(rY - 0.5) - 0.5) / fwidth(rY);
    
    float line = min(gridX, gridY) + 1.0 - lineWidth;
    return 1.0 - min(line, 1.0);
}



float v1(in vec2 uv, float scale) {
    return sin(uv.x * scale + time);
}

float v2(in vec2 uv, float scale) {
    return sin(scale * (uv.x * sin(time / 2.0) + uv.y * cos(time / 3.0)) + time);
}

float v3(in vec2 uv, float scale) {
    float cx = uv.x + 0.5 * sin(time / 5.0);
    float cy = uv.y + 0.5 * cos(time / 3.0);
    return sin(sqrt(128.0 * (cx * cx + cy * cy) + 1.0) + time);
}

float v(in vec2 uv, float scale) {
    return v1(uv, scale) + v2(uv, scale) + v3(uv, scale);
}

float getPlasma(float f, float s, float scale) {
    vec3 color = vec3(0.0,0.0,0.0);
    
    color.r += sin(v(vUv*s, scale) * PI * f);
    color.g += sin(v(vUv*s, scale) * PI * f);
    color.b += sin(v(vUv*s, scale) * PI * f);

    return clamp( color.r, 0.0, 1.0);
}   

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
    float grid1 = getGrid(gridSize, 1.0);
    float grid2 = getGrid(vec2( gridSize.x*0.25, gridSize.y*0.25), 1.0);

    bool debug = false;

    float plasma1 = getPlasma(0.2, 0.8, 3.0); // 0.2,0.8,3.0
    float plasma2 = getPlasma(0.2, 1.0, 7.42); // 0.25, 1.4, 5.42

    // mix both grids with plasma
    vec3 mixedColor = mix(
        vec3(grid1),
        vec3(grid2),
        plasma1
    );

    // add black/transparent spots
    mixedColor = mix( mixedColor, vec3(0.0), map( plasma2, 0.0,0.8,0.0,1.0));

    if( debug ) {
        gl_FragColor = vec4( vec3(map(plasma2, 0.0,0.8,0.0,1.0)), 1.0);
    } else {
        gl_FragColor = vec4( mix( backgroundColor, foregroundColor, clamp(mixedColor.r, 0.0,1.0)), 1.0);
    }    

}
`;

const gl = document.getElementById('canvas').getContext('webgl');
gl.getExtension('OES_standard_derivatives');
const programInfo = twgl.createProgramInfo(gl, [plasmaGridVertex, plasmaGridFragment]);
const bufferInfo = twgl.createBufferInfoFromArrays(gl, {position: {numComponents: 2, data: [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]}});

const uniforms = {
backgroundColor: [19/255, 40/255, 180/255],
foregroundColor: [1, 1, 1],
gridSize: [0.1, 0.1],
aspectRatio: 1, //initial,  overwritten in render method
};

function render(time) {
gl.canvas.width = window.innerWidth * window.devicePixelRatio;
gl.canvas.height = window.innerHeight * window.devicePixelRatio;
uniforms.aspectRatio = gl.canvas.width / gl.canvas.height;


gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

const t = time * 0.001;
uniforms.time = t;

gl.useProgram(programInfo.program);
twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
twgl.setUniforms(programInfo, uniforms);
twgl.drawBufferInfo(gl, bufferInfo);

requestAnimationFrame(render);
}


requestAnimationFrame(render);