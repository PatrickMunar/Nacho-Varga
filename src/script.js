import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import gsap from 'gsap'
import testVertexShader from './shaders/vertex.glsl'
import testFragmentShader from './shaders/fragment.glsl'

// Clear Scroll Memory
window.history.scrollRestoration = 'manual'

// -----------------------------------------------------------------
/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Loading Manager
const loadingBar = document.getElementById('loadingBar')
const loadingPage = document.getElementById('loadingPage')

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
       
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded/itemsTotal
        loadingBar.style.transform = 'scaleX(' + progressRatio + ')'
    }
)

const landingTextures = []
const s2Textures = []

// Texture loader
const textureLoader = new THREE.TextureLoader()
landingTextures[0] = textureLoader.load('./images/NachoLanding0.jpg')
landingTextures[1] = textureLoader.load('./images/NachoLanding1.jpg')
s2Textures[0] = textureLoader.load('./images/Section2-1.png')
s2Textures[1] = textureLoader.load('./images/Section2-2.png')
s2Textures[2] = textureLoader.load('./images/Section2-3.png')
s2Textures[3] = textureLoader.load('./images/Section2-4.png')

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

// Font Loader
const fontLoader = new FontLoader()
fontLoader.load('./fonts/Simpsonfont.ttf')

// gltfLoader.load(
//     'Bed.glb',
//     (obj) => {
       
//         scene.add(obj.scene)
//         obj.scene.scale.set(0.05,0.05,0.05)

//         // 
//         topBedframeGroup.add(obj.scene)
//         obj.scene.children[0].castShadow = true
//         obj.scene.children[0].receiveShadow = true
//     }
// )

// Lighting

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.set(10,-10,10)
scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {    
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0,0,12)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enabled = false
controls.enableDamping = true

// Nacho Triangles
let nachos = []
let nachoCount = 0
let totalNachos = 30
const makeNachos = () => {
    const material = new THREE.LineBasicMaterial({
        color: 0xaa0000
    });
    
    const points = [];

    const s = Math.random()*2 + 1

    points.push( new THREE.Vector3( -0.5 * s, 0, -10 ) );
    points.push( new THREE.Vector3( 0, Math.sin(Math.PI*60/180) * s, -10 ) );
    points.push( new THREE.Vector3( 0.5 * s, 0, -10 ) );
    points.push( new THREE.Vector3( -0.5 * s, 0, -10 ) );
    
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    
    const line = new THREE.Line( geometry, material );
    scene.add( line );

    const rx = Math.random()*0.5 * 0
    const ry = Math.random()*0.5 * 0
    const rz = Math.random()*1
    line.rotation.set(rx, ry, rz)

    const x = (Math.random() - 0.5) * 30
    const y = (Math.random() - 0.5) * 30 - Math.random()*30
    const z = (Math.random() - 0.5) * 5
    line.position.set(x, y, z)

    nachos[nachoCount] = line
    nachoCount++
    if (nachoCount < totalNachos) {
        makeNachos()
    }
}

makeNachos()

// Animations
const waveDownAnimation = (y) => {
    if (waveClickParameters.waveAmplitude >= 0.1) {
        waveClickParameters.waveAmplitude -= 0.02
        setTimeout(() => {
            waveDownAnimation(y)
        }, 10)
    }
    else {
        waveClickParameters.waveAmplitude = 0
        noClicks = false
    }
    y.uniforms.uAmplitude.value = waveClickParameters.waveAmplitude
}

const waveUpAnimation = (x) => {
    if (waveClickParameters.waveAmplitude <= 1) {
        waveClickParameters.waveAmplitude += 0.05
        setTimeout(() => {
            waveUpAnimation(x)
        }, 10)
    }
    else {
        waveDownAnimation(x)
    }
    x.uniforms.uAmplitude.value = waveClickParameters.waveAmplitude
}

// Section1
// Picture Parameters
const parameters = {
    widthFactor: 8,
    heightFactor: 8,
    amplitudeFactor: 0.3,
    speedFactor: 5,
    wideWidthFactor: 16,
    wideHeightFactor: 9
}

const waveClickParameters = {
    waveFrequency: 1,
    waveAmplitude: 0
}

const planeSize = {
    width: 32*parameters.widthFactor,
    height: 32*parameters.heightFactor,
    wideWidth: 32*parameters.wideWidthFactor,
    wideHeight: 32*parameters.wideHeightFactor,
}

const geometry = new THREE.PlaneGeometry(parameters.widthFactor, parameters.heightFactor, planeSize.width, planeSize.height)

// Material
const material = new THREE.RawShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    uniforms: {
        uFrequency: {value: waveClickParameters.waveFrequency},
        uTime: {value: 0},
        uOscillationFrequency: {value: 5},
        uColor: {value: new THREE.Color('#aa00ff')},
        uTexture: { value: landingTextures[0] },
        uAmplitude: {value: waveClickParameters.waveAmplitude}
    },
    side: THREE.DoubleSide
})

// Picture Mesh
let landingMesh = new THREE.Mesh(geometry, material)
landingMesh.position.set(5,0,0)
landingMesh.rotation.z = Math.PI*-2/180
scene.add(landingMesh)

// Section2
// Picture Parameters
const pm2geometry = new THREE.PlaneGeometry(parameters.wideWidthFactor * 0.5, parameters.wideHeightFactor * 0.5, planeSize.wideWidth, planeSize.wideHeight)

// Material
const pm2material = new THREE.RawShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    uniforms: {
        uFrequency: {value: waveClickParameters.waveFrequency * 1.5},
        uTime: {value: 0},
        uOscillationFrequency: {value: 5},
        uColor: {value: new THREE.Color('#aa00ff')},
        uTexture: { value: s2Textures[0] },
        uAmplitude: {value: waveClickParameters.waveAmplitude}
    },
    side: THREE.DoubleSide
})

// Picture Mesh
let pictureMesh2 = new THREE.Mesh(pm2geometry, pm2material)
pictureMesh2.position.set(5,-13,0)
pictureMesh2.rotation.z = Math.PI*10/180
scene.add(pictureMesh2)

// Picture Parameters
const pm3geometry = new THREE.PlaneGeometry(parameters.wideWidthFactor * 0.6, parameters.wideHeightFactor * 0.6, planeSize.wideWidth, planeSize.wideHeight)

// Material
const pm3material = new THREE.RawShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    uniforms: {
        uFrequency: {value: waveClickParameters.waveFrequency * 1.5},
        uTime: {value: 0},
        uOscillationFrequency: {value: 5},
        uColor: {value: new THREE.Color('#aa00ff')},
        uTexture: { value: s2Textures[2] },
        uAmplitude: {value: waveClickParameters.waveAmplitude}
    },
    side: THREE.DoubleSide
})

// Picture Mesh
let pictureMesh3 = new THREE.Mesh(pm3geometry, pm3material)
pictureMesh3.position.set(-4,-17,0)
pictureMesh3.rotation.z = Math.PI*-2/180
scene.add(pictureMesh3)

/**
 * Renderer
 */
 const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.setClearColor( 0x000000, 0 )
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping

// Raycaster
const raycaster = new THREE.Raycaster()

// Parallax Camera Group
const cameraGroup = new THREE.Group
cameraGroup.add(camera)
cameraGroup.position.set(0,0,0)
scene.add(cameraGroup)

// Mouse
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1

})

// Raycasting Click
let landingTexturesIndex = 0
let pictureMesh2Index = 0
let pictureMesh3Index = 2

let landingCurrentIntersect = null
let noClicks = false

window.addEventListener('click', () => {
    if (noClicks == false) {
        if (landingCurrentIntersect) {
            if (landingCurrentIntersect.object == landingMesh) {
                if (landingTexturesIndex == 0) {
                    landingTexturesIndex = 1
                }
                else {
                    landingTexturesIndex = 0
                }
                waveUpAnimation(material)
                noClicks = true
                setTimeout(() => {
                    material.uniforms.uTexture.value = landingTextures[landingTexturesIndex]
                }, 200)
            }
            else if (landingCurrentIntersect.object == pictureMesh2) {
                if (pictureMesh2Index == 0) {
                    pictureMesh2Index = 1
                }
                else {
                    pictureMesh2Index = 0
                }
                waveUpAnimation(pm2material)
                noClicks = true
                setTimeout(() => {
                    pm2material.uniforms.uTexture.value = s2Textures[pictureMesh2Index]
                }, 200)
            }
            else if (landingCurrentIntersect.object == pictureMesh3) {
                if (pictureMesh3Index == 2) {
                    pictureMesh3Index = 3
                }
                else {
                    pictureMesh3Index = 2
                }
                waveUpAnimation(pm3material)
                noClicks = true
                setTimeout(() => {
                    pm3material.uniforms.uTexture.value = s2Textures[pictureMesh3Index]
                }, 200)
            }
        }
    }
})

// Scroll
const sectionDistance = 15

let scrollY = window.scrollY
window.addEventListener('scroll', () => {
    scrollY = window.scrollY
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const parallaxTime = elapsedTime

    // Camera Scroll
    camera.position.y = -scrollY / sizes.height * sectionDistance

    // Update uTime
    material.uniforms.uTime.value = elapsedTime

    // Camera Parallax
    const parallaxX = mouse.x * 0.05
    const parallaxY = - mouse.y * 0.05
    cameraGroup.position.x += ( parallaxX - cameraGroup.position.x )    
    cameraGroup.position.y += ( parallaxY - cameraGroup.position.y )
    
    // Nacho Rotations
    // for (let i = 0; i < nachos.length; i++) {
    //     nachos[i].rotateZ(elapsedTime * 0.001)
    // }

    // Mesh Parallax
    landingMesh.rotation.y = mouse.x * 0.05
    landingMesh.rotation.x = - mouse.y * 0.05
    pictureMesh2.rotation.y = mouse.x * 0.05
    pictureMesh2.rotation.x = - mouse.y * 0.05
    pictureMesh3.rotation.y = mouse.x * 0.05
    pictureMesh3.rotation.x = - mouse.y * 0.05

    //Raycasting
    raycaster.setFromCamera(mouse, camera)

    const landingTestBox = [landingMesh, pictureMesh2, pictureMesh3]
    const landingIntersects = raycaster.intersectObjects(landingTestBox)

    if (landingIntersects.length) {
        if(!landingCurrentIntersect)
        {
            canvas.style.cursor = 'pointer'
        }
        if (landingCurrentIntersect === null) {
            landingCurrentIntersect = landingIntersects[0]
        }
    }
    else {
        if(landingCurrentIntersect)
        {
            canvas.style.cursor = 'default'
        }
        if (landingCurrentIntersect) {
            landingCurrentIntersect = null
        }
        landingCurrentIntersect = null
    }

    // Update controls
    if (controls.enabled == true) {
        controls.update()
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

