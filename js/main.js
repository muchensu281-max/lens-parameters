'use strict';

/* ─── 背景 ─── */
(function () {
    const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
    const PC ='https://youke.xn--y7xa690gmna.cn/s1/2026/01/31/697d0960f2497.webp';
    const MOB = 'https://youke.xn--y7xa690gmna.cn/s1/2026/01/31/697d0c2eac82f.webp';
    document.getElementById('bgLayer').style.backgroundImage = `url('${mobile ? MOB : PC}')`;
})();

/* ─── 预设数据 ─── */
const PRESETS = {
    apple: [
        { model: 'iPhone 17 Pro Max', lens: 'iPhone 17 Pro Max 后置摄像头 — 6.86mm f/1.78', f: '1.78', focal: '6.86', focal35: '24', iso: '100', shutter: '1/120', bias: '0' },
        { model: 'iPhone 17 Pro', lens: 'iPhone 17 Pro 后置摄像头 — 6.86mm f/1.78', f: '1.78', focal: '6.86', focal35: '24', iso: '100', shutter: '1/120', bias: '0' },
        { model: 'iPhone 17 Plus', lens: 'iPhone 17 Plus 后置双广角摄像头 — 6.86mm f/1.6', f: '1.6', focal: '6.86', focal35: '26', iso: '80', shutter: '1/100', bias: '0' },
        { model: 'iPhone 17', lens: 'iPhone 17 后置双广角摄像头 — 6.86mm f/1.6', f: '1.6', focal: '6.86', focal35: '26', iso: '80', shutter: '1/100', bias: '0' },
        { model: 'iPhone 16 Pro Max', lens: 'iPhone 16 Pro Max 后置摄像头 — 6.86mm f/1.78', f: '1.78', focal: '6.86', focal35: '24', iso: '100', shutter: '1/120', bias: '0' },
        { model: 'iPhone 16 Pro', lens: 'iPhone 16 Pro 后置摄像头 — 6.86mm f/1.78', f: '1.78', focal: '6.86', focal35: '24', iso: '100', shutter: '1/120', bias: '0' },
        { model: 'iPhone 16 Plus', lens: 'iPhone 16 Plus 后置双广角摄像头 — 6.86mm f/1.6', f: '1.6', focal: '6.86', focal35: '26', iso: '80', shutter: '1/100', bias: '0' },
        { model: 'iPhone 16', lens: 'iPhone 16 后置双广角摄像头 — 6.86mm f/1.6', f: '1.6', focal: '6.86', focal35: '26', iso: '80', shutter: '1/100', bias: '0' },
        { model: 'iPhone 15 Pro Max', lens: 'iPhone 15 Pro Max 后置摄像头 — 6.765mm f/1.78', f: '1.78', focal: '6.765', focal35: '24', iso: '100', shutter: '1/120', bias: '0' },
        { model: 'iPhone 15 Pro', lens: 'iPhone 15 Pro 后置摄像头 — 6.765mm f/1.78', f: '1.78', focal: '6.765', focal35: '24', iso: '100', shutter: '1/120', bias: '0' },
        { model: 'iPhone 15 Plus', lens: 'iPhone 15 Plus 后置双广角摄像头 — 6.86mm f/1.6', f: '1.6', focal: '6.86', focal35: '26', iso: '80', shutter: '1/100', bias: '0' },
        { model: 'iPhone 15', lens: 'iPhone 15 后置双广角摄像头 — 6.86mm f/1.6', f: '1.6', focal: '6.86', focal35: '26', iso: '80', shutter: '1/100', bias: '0' },
        { model: 'iPhone 14 Pro Max', lens: 'iPhone 14 Pro Max 后置摄像头 — 6.86mm f/1.78', f: '1.78', focal: '6.86', focal35: '24', iso: '100', shutter: '1/120', bias: '0' },
        { model: 'iPhone 14 Pro', lens: 'iPhone 14 Pro 后置摄像头 — 6.86mm f/1.78', f: '1.78', focal: '6.86', focal35: '24', iso: '100', shutter: '1/120', bias: '0' },
        { model: 'iPhone 14 Plus', lens: 'iPhone 14 Plus 后置双广角摄像头 — 5.7mm f/1.5', f: '1.5', focal: '5.7', focal35: '26', iso: '64', shutter: '1/60', bias: '0' },
        { model: 'iPhone 14', lens: 'iPhone 14 后置双广角摄像头 — 5.7mm f/1.5', f: '1.5', focal: '5.7', focal35: '26', iso: '64', shutter: '1/60', bias: '0' },
        { model: 'iPhone 13 Pro Max', lens: 'iPhone 13 Pro Max 后置摄像头 — 5.7mm f/1.5', f: '1.5', focal: '5.7', focal35: '26', iso: '100', shutter: '1/120', bias: '0' },
        { model: 'iPhone 13 Pro', lens: 'iPhone 13 Pro 后置摄像头 — 5.7mm f/1.5', f: '1.5', focal: '5.7', focal35: '26', iso: '100', shutter: '1/120', bias: '0' },
        { model: 'iPhone 13 mini', lens: 'iPhone 13 mini 后置双广角摄像头 — 5.1mm f/1.6', f: '1.6', focal: '5.1', focal35: '26', iso: '64', shutter: '1/60', bias: '0' },
        { model: 'iPhone 13', lens: 'iPhone 13 后置双广角摄像头 — 5.1mm f/1.6', f: '1.6', focal: '5.1', focal35: '26', iso: '64', shutter: '1/60', bias: '0' },
        { model: 'iPhone 12 Pro Max', lens: 'iPhone 12 Pro Max 后置摄像头 — 5.65mm f/1.6', f: '1.6', focal: '5.65', focal35: '26', iso: '64', shutter: '1/100', bias: '0' },
        { model: 'iPhone 12 Pro', lens: 'iPhone 12 Pro 后置摄像头 — 4.2mm f/1.6', f: '1.6', focal: '4.2', focal35: '26', iso: '64', shutter: '1/100', bias: '0' },
        { model: 'iPhone 12 mini', lens: 'iPhone 12 mini 后置双广角摄像头 — 4.2mm f/1.6', f: '1.6', focal: '4.2', focal35: '26', iso: '64', shutter: '1/60', bias: '0' },
        { model: 'iPhone 12', lens: 'iPhone 12 后置双广角摄像头 — 4.2mm f/1.6', f: '1.6', focal: '4.2', focal35: '26', iso: '64', shutter: '1/60', bias: '0' },
        { model: 'iPhone 11 Pro Max', lens: 'iPhone 11 Pro Max 后置摄像头 — 4.25mm f/1.8', f: '1.8', focal: '4.25', focal35: '26', iso: '64', shutter: '1/60', bias: '0' },
        { model: 'iPhone 11 Pro', lens: 'iPhone 11 Pro 后置摄像头 — 4.25mm f/1.8', f: '1.8', focal: '4.25', focal35: '26', iso: '64', shutter: '1/60', bias: '0' },
        { model: 'iPhone 11', lens: 'iPhone 11 后置双广角摄像头 — 4.25mm f/1.8', f: '1.8', focal: '4.25', focal35: '26', iso: '64', shutter: '1/60', bias: '0' },
        { model: 'iPhone XS Max', lens: 'iPhone XS Max 后置双摄像头 — 4.25mm f/1.8', f: '1.8', focal: '4.25', focal35: '26', iso: '50', shutter: '1/60', bias: '0' },
        { model: 'iPhone XS', lens: 'iPhone XS 后置双摄像头 — 4.25mm f/1.8', f: '1.8', focal: '4.25', focal35: '26', iso: '50', shutter: '1/60', bias: '0' },
        { model: 'iPhone XR', lens: 'iPhone XR 后置摄像头 — 4.25mm f/1.8', f: '1.8', focal: '4.25', focal35: '26', iso: '50', shutter: '1/60', bias: '0' },
        { model: 'iPhone X', lens: 'iPhone X 后置双摄像头 — 4.0mm f/1.8', f: '1.8', focal: '4.0', focal35: '28', iso: '50', shutter: '1/60', bias: '0' },
        { model: 'iPhone 8 Plus', lens: 'iPhone 8 Plus 后置双摄像头 — 3.99mm f/1.8', f: '1.8', focal: '3.99', focal35: '28', iso: '50', shutter: '1/60', bias: '0' },
        { model: 'iPhone 8', lens: 'iPhone 8 后置摄像头 — 3.99mm f/1.8', f: '1.8', focal: '3.99', focal35: '28', iso: '50', shutter: '1/60', bias: '0' },
        { model: 'iPhone 7 Plus', lens: 'iPhone 7 Plus 后置双摄像头 — 3.99mm f/1.8', f: '1.8', focal: '3.99', focal35: '28', iso: '50', shutter: '1/60', bias: '0' },
        { model: 'iPhone 7', lens: 'iPhone 7 后置摄像头 — 3.99mm f/1.8', f: '1.8', focal: '3.99', focal35: '28', iso: '50', shutter: '1/60', bias: '0' },
        { model: 'iPhone SE (3代)', lens: 'iPhone SE (3rd generation) 后置摄像头 — 3.99mm f/1.8', f: '1.8', focal: '3.99', focal35: '28', iso: '50', shutter: '1/60', bias: '0' },
        { model: 'iPhone SE (2代)', lens: 'iPhone SE (2nd generation) 后置摄像头 — 3.99mm f/1.8', f: '1.8', focal: '3.99', focal35: '28', iso: '50', shutter: '1/60', bias: '0' },
        { model: 'iPad Pro 13" M4', lens: 'iPad Pro (13-inch) (M4) 后置摄像头 — 6.86mm f/1.78', f: '1.78', focal: '6.86', focal35: '24', iso: '100', shutter: '1/120', bias: '0' },
        { model: 'iPad Pro 11" M4', lens: 'iPad Pro (11-inch) (M4) 后置摄像头 — 6.86mm f/1.78', f: '1.78', focal: '6.86', focal35: '24', iso: '100', shutter: '1/120', bias: '0' },
    ],
    vivo: [
        { make: 'vivo', model: 'vivo X300 Pro', lens: 'vivo X300 Pro 后置主摄 — 5.53mm f/1.57', f: '1.57', focal: '5.53', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 5' },
        { make: 'vivo', model: 'vivo X300', lens: 'vivo X300 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 5' },
        { make: 'vivo', model: 'vivo X200 Pro Mini', lens: 'vivo X200 Pro Mini 后置主摄 — 5.47mm f/1.85', f: '1.85', focal: '5.47', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 5' },
        { make: 'vivo', model: 'vivo X200 Pro', lens: 'vivo X200 Pro 后置主摄 — 5.53mm f/1.57', f: '1.57', focal: '5.53', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 5' },
        { make: 'vivo', model: 'vivo X200', lens: 'vivo X200 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 5' },
        { make: 'vivo', model: 'vivo X100 Ultra', lens: 'vivo X100 Ultra 后置主摄 — 8.6mm f/1.75', f: '1.75', focal: '8.6', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 4' },
        { make: 'vivo', model: 'vivo X100 Pro', lens: 'vivo X100 Pro 后置主摄 — 5.53mm f/1.57', f: '1.57', focal: '5.53', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 4' },
        { make: 'vivo', model: 'vivo X100', lens: 'vivo X100 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 4' },
        { make: 'vivo', model: 'vivo X90 Pro+', lens: 'vivo X90 Pro+ 后置主摄 — 8.6mm f/1.75', f: '1.75', focal: '8.6', focal35: '23', iso: '64', shutter: '1/100', bias: '0', sw: 'OriginOS 3' },
    ],
    iqoo: [
        { make: 'vivo', model: 'iQOO 15', lens: 'iQOO 15 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 5' },
        { make: 'vivo', model: 'iQOO 13', lens: 'iQOO 13 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 5' },
        { make: 'vivo', model: 'iQOO 12 Pro', lens: 'iQOO 12 Pro 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 4' },
        { make: 'vivo', model: 'iQOO 12', lens: 'iQOO 12 后置主摄 — 5.59mm f/1.88', f: '1.88', focal: '5.59', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 4' },
        { make: 'vivo', model: 'iQOO 11S', lens: 'iQOO 11S 后置主摄 — 5.59mm f/1.88', f: '1.88', focal: '5.59', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 3' },
        { make: 'vivo', model: 'iQOO 11', lens: 'iQOO 11 后置主摄 — 5.59mm f/1.88', f: '1.88', focal: '5.59', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'OriginOS 3' },
    ],
    oppo: [
        { make: 'OPPO', model: 'OPPO Find X8 Ultra', lens: 'OPPO Find X8 Ultra 后置主摄 — 6.72mm f/1.8', f: '1.8', focal: '6.72', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'ColorOS 15' },
        { make: 'OPPO', model: 'OPPO Find X8 Pro', lens: 'OPPO Find X8 Pro 后置主摄 — 5.96mm f/1.6', f: '1.6', focal: '5.96', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'ColorOS 15' },
        { make: 'OPPO', model: 'OPPO Find X8', lens: 'OPPO Find X8 后置主摄 — 5.64mm f/1.8', f: '1.8', focal: '5.64', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'ColorOS 15' },
        { make: 'OPPO', model: 'OPPO Find X7 Ultra', lens: 'OPPO Find X7 Ultra 后置主摄 — 8.6mm f/1.75', f: '1.75', focal: '8.6', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'ColorOS 14' },
        { make: 'OPPO', model: 'OPPO Find X7', lens: 'OPPO Find X7 后置主摄 — 5.59mm f/1.8', f: '1.8', focal: '5.59', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'ColorOS 14' },
        { make: 'OPPO', model: 'OPPO Find X6 Pro', lens: 'OPPO Find X6 Pro 后置主摄 — 8.6mm f/1.8', f: '1.8', focal: '8.6', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'ColorOS 13' },
        { make: 'OPPO', model: 'OPPO Find X6', lens: 'OPPO Find X6 后置主摄 — 5.59mm f/1.8', f: '1.8', focal: '5.59', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'ColorOS 13' },
    ],
    oneplus: [
        { make: 'OnePlus', model: 'OnePlus 14', lens: 'OnePlus 14 后置主摄 — 5.96mm f/1.6', f: '1.6', focal: '5.96', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'OxygenOS 15' },
        { make: 'OnePlus', model: 'OnePlus 13', lens: 'OnePlus 13 后置主摄 — 5.96mm f/1.6', f: '1.6', focal: '5.96', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'OxygenOS 15' },
        { make: 'OnePlus', model: 'OnePlus 12', lens: 'OnePlus 12 后置主摄 — 5.96mm f/1.6', f: '1.6', focal: '5.96', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'OxygenOS 14' },
        { make: 'OnePlus', model: 'OnePlus 11', lens: 'OnePlus 11 后置主摄 — 5.59mm f/1.8', f: '1.8', focal: '5.59', focal35: '24', iso: '80', shutter: '1/100', bias: '0', sw: 'OxygenOS 13' },
        { make: 'OnePlus', model: 'OnePlus 10 Pro', lens: 'OnePlus 10 Pro 后置主摄 — 5.59mm f/1.8', f: '1.8', focal: '5.59', focal35: '23', iso: '80', shutter: '1/100', bias: '0', sw: 'OxygenOS 12' },
    ],
    xiaomi: [
        { make: 'Xiaomi', model: 'Xiaomi 15 Ultra', lens: 'Xiaomi 15 Ultra 后置主摄 — 6.72mm f/1.63', f: '1.63', focal: '6.72', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'HyperOS 2.0' },
        { make: 'Xiaomi', model: 'Xiaomi 15 Pro', lens: 'Xiaomi 15 Pro 后置主摄 — 6.4mm f/1.44', f: '1.44', focal: '6.4', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'HyperOS 2.0' },
        { make: 'Xiaomi', model: 'Xiaomi 15', lens: 'Xiaomi 15 后置主摄 — 5.53mm f/1.63', f: '1.63', focal: '5.53', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'HyperOS 2.0' },
        { make: 'Xiaomi', model: 'Xiaomi 14 Ultra', lens: 'Xiaomi 14 Ultra 后置主摄 — 6.72mm f/1.63', f: '1.63', focal: '6.72', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'HyperOS 1.0' },
        { make: 'Xiaomi', model: 'Xiaomi 14 Pro', lens: 'Xiaomi 14 Pro 后置主摄 — 6.4mm f/1.42', f: '1.42', focal: '6.4', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'HyperOS 1.0' },
        { make: 'Xiaomi', model: 'Xiaomi 14', lens: 'Xiaomi 14 后置主摄 — 5.53mm f/1.61', f: '1.61', focal: '5.53', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'HyperOS 1.0' },
        { make: 'Xiaomi', model: 'Xiaomi 13 Ultra', lens: 'Xiaomi 13 Ultra 后置主摄 — 8.6mm f/1.9', f: '1.9', focal: '8.6', focal35: '23', iso: '64', shutter: '1/100', bias: '0', sw: 'MIUI 14' },
        { make: 'Xiaomi', model: 'Xiaomi 13 Pro', lens: 'Xiaomi 13 Pro 后置主摄 — 8.6mm f/1.9', f: '1.9', focal: '8.6', focal35: '23', iso: '64', shutter: '1/100', bias: '0', sw: 'MIUI 14' },
        { make: 'Xiaomi', model: 'Xiaomi 13', lens: 'Xiaomi 13 后置主摄 — 5.47mm f/1.8', f: '1.8', focal: '5.47', focal35: '23', iso: '64', shutter: '1/100', bias: '0', sw: 'MIUI 14' },
    ],
    redmi: [
        { make: 'Xiaomi', model: 'Redmi K80 Pro', lens: 'Redmi K80 Pro 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '23', iso: '50', shutter: '1/100', bias: '0', sw: 'HyperOS 2.0' },
        { make: 'Xiaomi', model: 'Redmi K80', lens: 'Redmi K80 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'HyperOS 2.0' },
        { make: 'Xiaomi', model: 'Redmi K70 Ultra', lens: 'Redmi K70 Ultra 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'HyperOS 1.0' },
        { make: 'Xiaomi', model: 'Redmi K70 Pro', lens: 'Redmi K70 Pro 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '24', iso: '50', shutter: '1/100', bias: '0', sw: 'HyperOS 1.0' },
        { make: 'Xiaomi', model: 'Redmi K70', lens: 'Redmi K70 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '24', iso: '64', shutter: '1/100', bias: '0', sw: 'HyperOS 1.0' },
        { make: 'Xiaomi', model: 'Redmi K60 Pro', lens: 'Redmi K60 Pro 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '24', iso: '64', shutter: '1/100', bias: '0', sw: 'MIUI 14' },
        { make: 'Xiaomi', model: 'Redmi K60', lens: 'Redmi K60 后置主摄 — 5.47mm f/1.88', f: '1.88', focal: '5.47', focal35: '24', iso: '64', shutter: '1/100', bias: '0', sw: 'MIUI 14' },
    ],
};

/*─── 状态 ─── */
let filesList = [];
let currentBrand = 'apple';
let processedBlobs = [];
let verifiedCode = sessionStorage.getItem('lp_verified_code') || '';
let deviceHashVal = '';
let backendCaps = null;
let exportRandomSeed = 0;

const IPHONE_17_PRO_MAX_LENSES = [
    { id: 'main', display: '主相机 — 24 mm ƒ1.78', lensModel: '主相机 — 24 mm ƒ1.78', focalLength: '24', focalLength35: '24', fNumber: '1.78' },
    { id: 'ultra', display: '超广角相机 — 13 mm ƒ2.2', lensModel: '超广角相机 — 13 mm ƒ2.2', focalLength: '13', focalLength35: '13', fNumber: '2.2' },
    { id: 'tele', display: '长焦相机 — 100 mm ƒ2.8', lensModel: '长焦相机 — 100 mm ƒ2.8', focalLength: '100', focalLength35: '100', fNumber: '2.8' },
];

/* ─── DOM ─── */
const $ = id => document.getElementById(id);
const uploadWrapper = $('uploadWrapper');
const uploadArea = $('uploadArea');
const fileInput = $('fileInput');
const filesSection = $('filesSection');
const filesGrid = $('filesGrid');
const fileCountEl = $('fileCount');
const addMoreBtn = $('addMoreBtn');
const presetsSection = $('presetsSection');
const formSections = $('formSections');
const actionBar = $('actionBar');
const loadingMask = $('loadingMask');
const loadingTxt = $('loadingTxt');
const toast = $('toast');
const resetBtn = $('resetBtn');
const dtInput = $('dateTimeOriginal');
const dtPlaceholder = $('dtPlaceholder');
const dlModal = $('dlModal');
const dlList = $('dlList');
const dlHint = $('dlHint');
const tutorialMask = $('tutorialMask');
const cardModal = $('cardModal');

/* ─── 初始化 ─── */
renderPresets();
initBackendCapabilities();

/* ─── 镜头档位 ─── */
$('lensProfileGrid')?.addEventListener('click', e => {
    const btn = e.target.closest('.lens-profile');
    if (!btn) return;
    applyLensProfile(btn.dataset.lens);
});
applyLensProfile('main', false);

/* ─── 品牌Tab ─── */
$('brandTabs').addEventListener('click', e => {
    const tab = e.target.closest('.brand-tab');
    if (!tab) return;
    document.querySelectorAll('.brand-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentBrand = tab.dataset.brand;
    renderPresets();
});

/* ─── 上传 ─── */
uploadArea.addEventListener('click', e => { if (e.target !== fileInput) fileInput.click(); });
addMoreBtn.addEventListener('click', e => { e.preventDefault(); fileInput.click(); });
fileInput.addEventListener('change', e => { if (e.target.files.length) handleFiles(e.target.files); fileInput.value = ''; });
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragleave', e => { e.preventDefault(); uploadArea.classList.remove('drag-over'); });
uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.classList.remove('drag-over'); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); });
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => e.preventDefault());

/* ─── 折叠卡片 ─── */
document.querySelectorAll('.card-header').forEach(h => {
    h.addEventListener('click', () => h.parentElement.classList.toggle('expanded'));
});

/* ─── 分辨率快选 ─── */
document.querySelectorAll('.res-chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.res-chip').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        $('imageWidth').value = btn.dataset.w;
        $('imageHeight').value = btn.dataset.h;
        updateResolutionInfo();
    });
});
$('originalSizeBtn').addEventListener('click', () => {
    const ref = getReferenceSize();
    if (!ref) return;
    $('imageWidth').value = ref.width;
    $('imageHeight').value = ref.height;
    document.querySelectorAll('.res-chip').forEach(b => b.classList.remove('selected'));
    updateResolutionInfo();
});
$('lockAspect').addEventListener('change', () => {
    if ($('lockAspect').checked) syncPairedDimension('imageWidth');
    updateResolutionInfo();
});
['imageWidth', 'imageHeight'].forEach(id => {
    $(id).addEventListener('input', () => {
        document.querySelectorAll('.res-chip').forEach(b => b.classList.remove('selected'));
        if ($('lockAspect').checked) syncPairedDimension(id);
        updateResolutionInfo();
    });
    $(id).addEventListener('blur', () => {
        const v = parseInt($(id).value, 10);
        $(id).value = Number.isFinite(v) && v > 0 ? String(v) : '';
        updateResolutionInfo();
    });
});

/* ─── 导出格式 ─── */
$('formatTabs').addEventListener('click', e => {
    const tab = e.target.closest('.format-tab');
    if (!tab || tab.disabled) return;
    document.querySelectorAll('.format-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    $('outputFormat').value = tab.dataset.format;
    updateFormatInfo();
});

/* ─── 时间占位 ─── */
const syncDtPlaceholder = () => {
    const empty = !dtInput.value;
    dtPlaceholder.classList.toggle('hidden', !empty);
    dtInput.classList.toggle('is-empty', empty);
};
dtInput.addEventListener('input', syncDtPlaceholder);
dtInput.addEventListener('change', syncDtPlaceholder);
syncDtPlaceholder();

/* ─── 按钮事件 ─── */
$('clearBtn').addEventListener('click', clearAllFields);
resetBtn.addEventListener('click', fullReset);
$('dlModalClose').addEventListener('click', () => dlModal.classList.remove('active'));
$('dlAllBtn').addEventListener('click', downloadAll);
dlHint.addEventListener('click', () => tutorialMask.classList.add('active'));
$('tutorialClose').addEventListener('click', () => tutorialMask.classList.remove('active'));
tutorialMask.addEventListener('click', e => { if (e.target === tutorialMask) tutorialMask.classList.remove('active'); });
dlModal.addEventListener('click', e => { if (e.target === dlModal) dlModal.classList.remove('active'); });

/* ─── 导出按钮（纯前端卡密验证）─── */
$('exportBtn').addEventListener('click', async () => {
    if (!filesList.length) { showToast('请先选择图片', 'error'); return; }

    if (verifiedCode) {
        const ok = await silentVerify(verifiedCode);
        if (ok) { doExport(); return; }
        verifiedCode = '';
        sessionStorage.removeItem('lp_verified_code');
    }

    openCardModal();
});

/* ─── 卡密弹窗 ─── */
$('cardModalClose').addEventListener('click', () => cardModal.classList.remove('active'));
cardModal.addEventListener('click', e => { if (e.target === cardModal) cardModal.classList.remove('active'); });

$('cardInput').addEventListener('input', function () {
    let v = this.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    let formatted = '';
    for (let i = 0; i < Math.min(v.length, 16); i++) {
        if (i > 0 && i % 4 === 0) formatted += '-';
        formatted += v[i];
    }
    this.value = formatted;this.style.borderColor = '';$('cardErrMsg').textContent = '';
});

$('cardInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmCard();
});

$('cardConfirmBtn').addEventListener('click', confirmCard);

document.querySelectorAll('.contact-copy').forEach(card => {
    const copyValue = card.dataset.copy || '';
    const copy = () => copyContactValue(copyValue);
    card.addEventListener('click', copy);
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            copy();
        }
    });
});

function openCardModal() {
    cardModal.classList.add('active');
    $('cardInput').value = '';
    $('cardErrMsg').textContent = '';
    const inp = $('cardInput');
    inp.style.borderColor = '';setTimeout(() => inp.focus(), 350);
}

async function confirmCard() {
    const code = $('cardInput').value.trim().toUpperCase();
    const errEl = $('cardErrMsg');
    const btn = $('cardConfirmBtn');

    if (!code) { errEl.textContent = '请输入卡密'; return; }
    if (code.length < 19) { errEl.textContent = '卡密格式不完整，应为XXXX-XXXX-XXXX-XXXX'; return; }

    btn.disabled = true;
    btn.textContent = '验证中...';
    errEl.textContent = '';

    try {
        const ok = await localVerifyCard(code, true);

        if (ok) {
            verifiedCode = code;
            sessionStorage.setItem('lp_verified_code', code);
            cardModal.classList.remove('active');
            doExport();
        } else {
            errEl.textContent = '卡密无效，请检查是否复制完整';
            $('cardInput').style.borderColor = 'rgba(248,113,113,.65)';
        }
    } catch (e) {
        errEl.textContent = getCardErrorMessage(e);
        $('cardInput').style.borderColor = 'rgba(248,113,113,.65)';
    } finally {
        btn.disabled = false;
        btn.textContent = '确认并导出';
    }
}

async function silentVerify(code) {
    try { return await localVerifyCard(code); } catch (e) { return false; }
}

function normalizeCardCode(code) {
    const raw = String(code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 16);
    return raw.match(/.{1,4}/g)?.join('-') || '';
}

async function sha256Hex(text) {
    if (!window.crypto?.subtle) throw new Error('CARD_CRYPTO_UNSUPPORTED');
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

async function localVerifyCard(code, activate = false) {
    const config = window.LENS_CARD_CONFIG || {};
    const entries = Array.isArray(config.entries)
        ? config.entries
        : (Array.isArray(config.hashes) ? config.hashes.map(hash => ({ hash, type: 'legacy', expiresAt: '' })) : []);
    if (!entries.length) throw new Error('CARD_CONFIG_MISSING');
    const normalized = normalizeCardCode(code);
    const salt = config.salt || 'LENS_STATIC_CARD_V1';
    const hash = await sha256Hex(`${salt}:${normalized}`);
    const entry = entries.find(item => item.hash === hash);
    if (!entry) return false;
    if (entry.durationDays) return verifyDurationCard(hash, Number(entry.durationDays), activate);
    if (!entry.expiresAt) return true;
    if (Date.now() <= new Date(entry.expiresAt).getTime()) return true;
    throw new Error('CARD_EXPIRED');
}

function verifyDurationCard(hash, durationDays, activate) {
    if (!Number.isFinite(durationDays) || durationDays <= 0) return false;
    const key = `lens_card_activation_${hash}`;
    let activatedAt = Number(localStorage.getItem(key) || 0);
    if (!activatedAt) {
        if (!activate) return true;
        activatedAt = Date.now();
        localStorage.setItem(key, String(activatedAt));
    }
    const expiresAt = activatedAt + durationDays * 24 * 60 * 60 * 1000;
    if (Date.now() <= expiresAt) return true;
    throw new Error('CARD_EXPIRED');
}

function getCardErrorMessage(err) {
    const code = err?.message || '';
    if (code === 'CARD_CONFIG_MISSING') return '卡密配置未加载，请刷新页面后重试';
    if (code === 'CARD_CRYPTO_UNSUPPORTED') return '当前浏览器不支持卡密校验，请换新版浏览器';
    if (code === 'CARD_EXPIRED') return '卡密已过期，请联系客服续费';
    return '卡密校验失败，请刷新后重试';
}

async function copyContactValue(text) {
    if (!text) return;
    try {
        let copied = false;
        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                copied = true;
            } catch (e) {}
        }
        if (!copied) {
            const input = document.createElement('input');
            input.value = text;
            input.setAttribute('readonly', '');
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            copied = document.execCommand('copy');
            input.remove();
        }
        if (!copied) throw new Error('COPY_FAILED');
        showToast('QQ号已复制', 'success');
    } catch (e) {
        showToast('复制失败，请手动长按复制', 'error');
    }
}

/* ─── 设备指纹 ─── */
async function getDeviceHash() {
    const raw = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        screen.width +'x' + screen.height + 'x' + screen.colorDepth,
        navigator.hardwareConcurrency || 0,
        navigator.platform || '',
        'LPSALT2024'
    ].join('||');

    if (window.crypto && crypto.subtle) {
        try {
            const buf = new TextEncoder().encode(raw);
            const hash = await crypto.subtle.digest('SHA-256', buf);
            return Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) { }
    }

    let h = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
        h ^= raw.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0').repeat(8);
}

/* ─── 渲染预设 ─── */
function renderPresets() {
    const grid = $('presetGrid');
    const list = PRESETS[currentBrand] || [];
    grid.innerHTML = list.map((p, i) => `
        <button class="preset-card" data-index="${i}" data-brand="${currentBrand}">
            <span class="preset-name">${p.model}</span>
        </button>
    `).join('');
    grid.querySelectorAll('.preset-card').forEach(btn => {
        btn.addEventListener('click', () => {
            grid.querySelectorAll('.preset-card').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            const p = PRESETS[btn.dataset.brand][+btn.dataset.index];
            applyPreset(p);showToast(`✓ ${p.model}`, 'success');
        });
    });
}

function applyPreset(p) {
    $('make').value = p.make || 'Apple';
    $('model').value = p.model;
    $('software').value = p.sw || '18.3';
    $('iso').value = p.iso || '100';
    $('exposureTime').value = p.shutter || '1/100';
    $('exposureBias').value = p.bias || '0';
    $('meteringMode').value = '5';
    $('whiteBalance').value = '0';
    $('flash').value = '16';
    $('offsetTime').value = '+08:00';
    applyLensProfile('main', false);
    showBubble();
}

function applyLensProfile(profileId, toastIt = true) {
    const lens = IPHONE_17_PRO_MAX_LENSES.find(item => item.id === profileId) || IPHONE_17_PRO_MAX_LENSES[0];
    document.querySelectorAll('.lens-profile').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lens === lens.id);
    });
    $('lensModel').value = lens.lensModel;
    $('focalLength').value = lens.focalLength;
    $('focalLength35').value = lens.focalLength35;
    $('fNumber').value = lens.fNumber;
    if (toastIt) showToast(`✓ ${lens.display}`, 'success');
}

function showBubble() {
    const b = $('exportBubble');
    b.classList.add('show');
    setTimeout(() => b.classList.remove('show'), 3000);
}

/* ─── 处理文件 ─── */
async function handleFiles(files) {
    setLoading(true, '加载中...');
    const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.heic', '.heif', '.tiff', '.tif'];
    const imgs = Array.from(files).filter(f =>
        f.type.startsWith('image/') || exts.includes('.' + f.name.split('.').pop().toLowerCase())
    );
    if (!imgs.length) { showToast('请选择图片文件', 'error'); setLoading(false); return; }

    for (let i = 0; i < imgs.length; i++) {
        setLoading(true, `加载中 ${i + 1}/${imgs.length}...`);
        const f = imgs[i];
        const ext = f.name.split('.').pop().toLowerCase();
        const isH = ext === 'heic' || ext === 'heif';
        try {
            let pf, url;
            let sourceFile = f;
            if (isH && typeof heic2any !== 'undefined') {
                const blob = await heic2any({ blob: f, toType: 'image/jpeg', quality: 0.95 });
                const jb = Array.isArray(blob) ? blob[0] : blob;
                pf = new File([jb], f.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type:'image/jpeg' });url = URL.createObjectURL(jb);
            } else {
                pf = f;
                url = URL.createObjectURL(f);
            }
            const dim = await readImageSize(url);
            filesList.push({ file: pf, sourceFile, dataUrl: url, objectUrl: url, width: dim.width, height: dim.height, isHeif: isH });
        } catch (e) {
            showToast(`处理失败：${f.name}`, 'error');
        }
    }

    if (filesList.length) { renderFiles(); activateUI(); updateFormatInfo(); showToast(`✓ 已添加 ${filesList.length} 张`, 'success'); }
    setLoading(false);
}

function renderFiles() {
    fileCountEl.textContent = filesList.length;
    filesGrid.innerHTML = filesList.map((it, i) => `
        <div class="file-card">
            <img src="${it.dataUrl}" alt="" loading="lazy">
            ${it.width && it.height ? `<div class="file-card-meta">${it.width}×${it.height}</div>` : ''}
            <button class="file-card-rm" data-i="${i}" aria-label="删除">×</button>
            <div class="file-card-name">${it.file.name}</div>
        </div>
    `).join('');
    filesGrid.querySelectorAll('.file-card-rm').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            filesList.splice(+btn.dataset.i, 1);
            if (!filesList.length) { fullReset(); return; }
            renderFiles();
            updateResolutionInfo();
            updateFormatInfo();
        });
    });
}

/* ─── UI 状态 ─── */
function activateUI() {
    uploadWrapper.classList.add('hidden');
    filesSection.classList.add('active');
    presetsSection.classList.add('active');
    formSections.classList.add('active');
    actionBar.classList.add('active');
    resetBtn.disabled = false;
    $('originalSizeBtn').disabled = !getReferenceSize();
    updateResolutionInfo();
    updateFormatInfo();
}

function fullReset() {
    clearAllFields();
    filesList = [];
    uploadWrapper.classList.remove('hidden');
    filesSection.classList.remove('active');
    presetsSection.classList.remove('active');
    formSections.classList.remove('active');
    actionBar.classList.remove('active');
    resetBtn.disabled = true;
    $('originalSizeBtn').disabled = true;
    updateResolutionInfo();
    updateFormatInfo();
    showToast('已重置', 'success');
}

function clearAllFields() {
    dtInput.value = '';
    syncDtPlaceholder();
    document.querySelectorAll('.preset-card').forEach(b => b.classList.remove('selected'));
    ['make', 'model', 'lensModel', 'software', 'fNumber', 'exposureTime', 'iso','focalLength', 'focalLength35', 'flash', 'meteringMode', 'whiteBalance',
        'exposureBias', 'offsetTime', 'imageWidth', 'imageHeight'].forEach(id => {
            const el = $(id);
            if (el) el.value = '';
        });document.querySelectorAll('.res-chip').forEach(b => b.classList.remove('selected'));
    updateResolutionInfo();
}

/* ─── Loading─── */
function setLoading(on, txt = '处理中...') {
    loadingTxt.textContent = txt;
    loadingMask.classList.toggle('active', on);
}

/* ─── Toast ─── */
let toastTimer;
function showToast(msg, type = '') {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    requestAnimationFrame(() => toast.classList.add('show'));
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ─── EXIF 工具 ─── */
function toExifStr(s) {
    if (!s) return s;
    if(/^[\x00-\x7F]*$/.test(s)) return s;
    const b = new TextEncoder().encode(s);
    return Array.from(b, x => String.fromCharCode(x)).join('');
}

function rational(s) {
    if (!s) return null;
    const n = parseFloat(String(s).replace(/mm$/i, ''));
    return isNaN(n) ? null : [Math.round(n * 100), 100];
}

function apertureValue(s) {
    const n = parseFloat(String(s || ''));
    if (!Number.isFinite(n) || n <= 0) return null;
    return [Math.round(Math.log2(n * n) * 100), 100];
}

function parseShutter(s) {
    if (!s) return null;
    const m = String(s).trim().match(/^(\d+)\s*\/\s*(\d+)$/);
    if (m) return [+m[1], +m[2]];
    const n = parseFloat(s);
    if (!isNaN(n) && n > 0) return n< 1 ? [1, Math.round(1/ n)] : [Math.round(n), 1];
    return null;
}

function parseShutterSeconds(value) {
    const r = parseShutter(value);
    if (!r) return 0;
    return r[0] / r[1];
}

function cleanNumber(n, digits = 2) {
    if (!Number.isFinite(n)) return '';
    return String(Number(n.toFixed(digits)));
}

function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
}

function pickVariant(values, baseValue, index, salt = 0) {
    if (!values.length) return baseValue;
    const start = Math.abs(exportRandomSeed + index * 17 + salt) % values.length;
    let picked = values[start];
    if (values.length > 1 && picked === baseValue) picked = values[(start + 1) % values.length];
    return picked;
}

function randomizeIso(value, index) {
    const base = Math.max(32, parseInt(value, 10) || 100);
    const standard = [32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200];
    const near = standard.filter(v => v >= base * 0.45 && v <= base * 2.3);
    return String(pickVariant(near.length ? near : standard, base, index, 11));
}

function randomizeExposureBias(value, index) {
    const base = parseFloat(value);
    const center = Number.isFinite(base) ? base : 0;
    const variants = [-0.7, -0.3, 0, 0.3, 0.7]
        .map(delta => cleanNumber(clamp(center + delta, -2, 2), 1));
    return pickVariant([...new Set(variants)], cleanNumber(center, 1), index, 53);
}

function randomizeShutter(value, index) {
    const baseSeconds = parseShutterSeconds(value) || 1 / 100;
    const factors = [0.55, 0.7, 0.85, 1, 1.2, 1.45, 1.7];
    const target = baseSeconds * factors[Math.abs(exportRandomSeed + index * 17 + 67) % factors.length];
    const denoms = [15, 20, 25, 30, 33, 40, 50, 60, 80, 100, 120, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000];
    const denom = denoms.reduce((best, cur) => Math.abs((1 / cur) - target) < Math.abs((1 / best) - target) ? cur : best, denoms[0]);
    return `1/${denom}`;
}

function pickLensProfile(index) {
    return IPHONE_17_PRO_MAX_LENSES[Math.abs(exportRandomSeed + index) % IPHONE_17_PRO_MAX_LENSES.length];
}

function randomizeExportMeta(meta, itemIndex = 0) {
    if (!$('randomizeParams')?.checked) return meta;
    const lens = pickLensProfile(itemIndex);
    return {
        ...meta,
        lensModel: lens.lensModel,
        fNumber: lens.fNumber,
        exposureTime: randomizeShutter(meta.exposureTime, itemIndex),
        iso: randomizeIso(meta.iso, itemIndex),
        exposureBias: randomizeExposureBias(meta.exposureBias, itemIndex),
        focalLength: lens.focalLength,
        focalLength35: lens.focalLength35,
    };
}

function fmtDt(v) {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d)) return null;
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}:${p(d.getMonth() + 1)}:${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function buildExif(w, h, meta = collectExportMeta()) {
    const ex = { '0th': {}, 'Exif': {}, 'GPS': {}, '1st': {}, 'Interop': {} };
    try {
        const make = meta.make || '';
        const model = meta.model || '';
        const sw = meta.software || '';
        const lens = meta.lensModel || '';

        if (make) ex['0th'][piexif.ImageIFD.Make] = make;
        if (model) ex['0th'][piexif.ImageIFD.Model] = model;
        if (sw) ex['0th'][piexif.ImageIFD.Software] = sw;

        const fn = rational(meta.fNumber);
        if (fn) ex['Exif'][piexif.ExifIFD.FNumber] = fn;
        const av = apertureValue(meta.fNumber);
        if (av) ex['Exif'][piexif.ExifIFD.ApertureValue] = av;
        const et = parseShutter(meta.exposureTime);
        if (et) ex['Exif'][piexif.ExifIFD.ExposureTime] = et;
        const iso = meta.iso;
        if (iso) ex['Exif'][piexif.ExifIFD.ISOSpeedRatings] = +iso;
        const fl = rational(meta.focalLength);
        if (fl) ex['Exif'][piexif.ExifIFD.FocalLength] = fl;
        const fl35 = meta.focalLength35;
        if (fl35) ex['Exif'][piexif.ExifIFD.FocalLengthIn35mmFilm] = +fl35;
        const flash = $('flash').value;
        if (flash !== '') ex['Exif'][piexif.ExifIFD.Flash] = +flash;
        const mm = $('meteringMode').value;
        if (mm !== '') ex['Exif'][piexif.ExifIFD.MeteringMode] = +mm;
        const wb = $('whiteBalance').value;
        if (wb !== '') ex['Exif'][piexif.ExifIFD.WhiteBalance] = +wb;
        const bias = meta.exposureBias;
        if (bias !== '') ex['Exif'][piexif.ExifIFD.ExposureBiasValue] = [Math.round(+bias * 100), 100];
        if (lens) ex['Exif'][piexif.ExifIFD.LensModel] = toExifStr(lens);
        if (piexif.ExifIFD.CustomRendered) ex['Exif'][piexif.ExifIFD.CustomRendered] = 0;
        if (piexif.ExifIFD.SceneCaptureType) ex['Exif'][piexif.ExifIFD.SceneCaptureType] = 0;

        const dt = fmtDt(meta.dateTimeOriginal);
        if (dt) {
            ex['Exif'][piexif.ExifIFD.DateTimeOriginal] = dt;
            ex['Exif'][piexif.ExifIFD.DateTimeDigitized] = dt;
            ex['0th'][piexif.ImageIFD.DateTime] = dt;
        }

        const cw = meta.imageWidth;
        const ch = meta.imageHeight;
        const fw = cw ? +cw : w;
        const fh = ch ? +ch : h;
        if (fw && fh) {
            ex['Exif'][piexif.ExifIFD.PixelXDimension] = fw;
            ex['Exif'][piexif.ExifIFD.PixelYDimension] = fh;
        }
    } catch (e) { console.error('buildExif:', e); }
    return ex;
}

function readImageSize(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = url;
    });
}

async function initBackendCapabilities() {
    try {
        const res = await fetch('api/capabilities', { cache: 'no-store' });
        backendCaps = await res.json();
    } catch (e) {
        backendCaps = { heifHevcWrite: false, offline: true };
    }
    updateFormatInfo();
}

function updateFormatInfo() {
    const format = $('outputFormat')?.value || 'jpeg';
    const info = $('formatInfo');
    if (!info) return;

    const heifTab = document.querySelector('.format-tab[data-format="heif"]');
    if (heifTab) heifTab.disabled = backendCaps && !backendCaps.heifHevcWrite;

    info.classList.remove('warn');
    if (format === 'jpeg') {
        info.textContent = backendCaps?.offline
            ? '当前为静态前端模式，JPEG 可直接导出；后端 EXIF 写入明天接入。'
            : 'JPEG 兼容性最好，后端会写入 EXIF。';
    } else if (format === 'same') {
        if (filesList.some(f => f.isHeif) && backendCaps && !backendCaps.heifHevcWrite) {
            info.textContent = '当前本地后端暂不支持 HEIC 编码，HEIF 原图会提示无法按原格式导出。';
            info.classList.add('warn');
        } else {
            info.textContent = '跟随原图格式：HEIF 原图导出 HEIC，其他图片导出 JPEG。';
        }
    } else if (format === 'heif') {
        if (backendCaps && !backendCaps.heifHevcWrite) {
            info.textContent = '当前本地后端不支持 HEIC/HEVC 编码；部署服务器需安装带 x265/HEVC 的 libheif。';
            info.classList.add('warn');
        } else {
            info.textContent = 'HEIC 适合 iPhone 相册，但需要后端 HEVC 编码支持。';
        }
    }
}

function getReferenceSize() {
    return filesList.find(it => it.width > 0 && it.height > 0) || null;
}

function getNumericInput(id) {
    const n = parseInt($(id).value, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
}

function isAspectLocked() {
    return $('lockAspect')?.checked !== false;
}

let syncingResolution = false;
function syncPairedDimension(sourceId) {
    if (syncingResolution) return;
    const ref = getReferenceSize();
    if (!ref) return;

    const sourceValue = getNumericInput(sourceId);
    if (!sourceValue) return;

    syncingResolution = true;
    if (sourceId === 'imageWidth') {
        $('imageHeight').value = Math.max(1, Math.round(sourceValue * ref.height / ref.width));
    } else {
        $('imageWidth').value = Math.max(1, Math.round(sourceValue * ref.width / ref.height));
    }
    syncingResolution = false;
}

function getExportDimensions(srcW, srcH) {
    const rawW = getNumericInput('imageWidth');
    const rawH = getNumericInput('imageHeight');
    const hasW = rawW > 0;
    const hasH = rawH > 0;

    if (isAspectLocked()) {
        if (hasW && hasH) {
            const scale = Math.min(rawW / srcW, rawH / srcH);
            return {
                width: Math.max(1, Math.round(srcW * scale)),
                height: Math.max(1, Math.round(srcH * scale)),
            };
        }
        if (hasW) return { width: rawW, height: Math.max(1, Math.round(srcH * rawW / srcW)) };
        if (hasH) return { width: Math.max(1, Math.round(srcW * rawH / srcH)), height: rawH };
        return { width: srcW, height: srcH };
    }

    if (hasW && hasH) return { width: rawW, height: rawH };
    if (hasW) return { width: rawW, height: Math.max(1, Math.round(srcH * rawW / srcW)) };
    if (hasH) return { width: Math.max(1, Math.round(srcW * rawH / srcH)), height: rawH };
    return { width: srcW, height: srcH };
}

function updateResolutionInfo() {
    const info = $('resInfo');
    if (!info) return;

    const ref = getReferenceSize();
    const originalBtn = $('originalSizeBtn');
    if (originalBtn) originalBtn.disabled = !ref;

    if (!ref) {
        info.classList.remove('warn');
        info.textContent = '上传图片后显示原图与导出尺寸';
        return;
    }

    const target = getExportDimensions(ref.width, ref.height);
    const scale = target.width && ref.width ? target.width / ref.width : 1;
    const megapixels = target.width * target.height / 1000000;
    const percent = Math.round(scale * 100);
    const mode = isAspectLocked() ? '等比导出' : '强制拉伸';
    info.innerHTML = `原图 <strong>${ref.width}×${ref.height}</strong> · 导出 <strong>${target.width}×${target.height}</strong> · ${percent}% · ${megapixels.toFixed(1)}MP · ${mode}`;
    info.classList.toggle('warn', target.width * target.height > 50000000);
}

function validateExportDimensions() {
    const ref = getReferenceSize();
    if (!ref) return true;
    const target = getExportDimensions(ref.width, ref.height);
    if (target.width * target.height > 80000000) {
        showToast('导出尺寸过大，建议控制在 80MP 以内', 'error');
        return false;
    }
    return true;
}

/* ─── 实际导出 ─── */
async function doExport() {
    if (!filesList.length) { showToast('请先选择图片', 'error'); return; }
    if (!validateExportDimensions()) return;
    exportRandomSeed = Math.floor(Math.random() * 1000000);
    setLoading(true, '处理中...');
    processedBlobs = [];
    let fail = 0;
    let lastError = '';

    for (let i = 0; i < filesList.length; i++) {
        setLoading(true, `处理中 ${i + 1}/${filesList.length}...`);
        try {
            const blob = await processOne(filesList[i], i);
            if (!blob || !blob.size) { fail++; continue; }
            const base = (filesList[i].sourceFile || filesList[i].file).name.replace(/\.[^.]+$/, '');
            const fileName = blob.fileName || `${base}_edited.${getOutputExt(filesList[i])}`;
            processedBlobs.push({
                blob,
                fileName,
                objectUrl: URL.createObjectURL(blob),
                downloaded: false,
            });
        } catch (e) { console.error('processOne:', e); lastError = e.message || '图片处理失败'; fail++; }
    }

    setLoading(false);

    if (!processedBlobs.length) { showToast(lastError || '全部处理失败，请重试', 'error'); return; }
    if (fail) showToast(`${fail} 张处理失败，已跳过`, 'error');

    if (verifiedCode) {
        try {
            if (!deviceHashVal) deviceHashVal = await getDeviceHash();
            await fetch('api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'use', code: verifiedCode, device_hash: deviceHashVal })
            });
        } catch (e) { /*静默失败 */ }
    }

    showDlModal();
}

function getOutputExt(item) {
    const format = $('outputFormat')?.value || 'jpeg';
    if (format === 'heif') return 'heic';
    if (format === 'same' && item?.isHeif) return 'heic';
    return 'jpg';
}

function collectExportMeta(itemIndex = 0) {
    return randomizeExportMeta({
        make: $('make').value.trim(),
        model: $('model').value.trim(),
        lensModel: $('lensModel').value.trim(),
        software: $('software').value.trim(),
        fNumber: $('fNumber').value.trim(),
        exposureTime: $('exposureTime').value.trim(),
        iso: $('iso').value.trim(),
        exposureBias: $('exposureBias').value.trim(),
        focalLength: $('focalLength').value.trim(),
        focalLength35: $('focalLength35').value.trim(),
        imageWidth: $('imageWidth').value.trim(),
        imageHeight: $('imageHeight').value.trim(),
        lockAspect: isAspectLocked(),
        dateTimeOriginal: dtInput.value,
        quality: 95,
    }, itemIndex);
}

async function processOne(item, itemIndex = 0) {
    const format = $('outputFormat')?.value || 'jpeg';
    const wantsHeic = format === 'heif' || (format === 'same' && item.isHeif);
    if (backendCaps?.offline) {
        if (wantsHeic) throw new Error('静态前端暂不支持 HEIC 导出，请选择 JPEG');
        return processOneClient(item, itemIndex);
    }

    try {
        return await processOneBackend(item, itemIndex);
    } catch (e) {
        if (wantsHeic) throw e;
        console.warn('后端处理失败，回退到浏览器 JPEG 导出', e);
        return processOneClient(item, itemIndex);
    }
}

async function processOneBackend(item, itemIndex = 0) {
    if (!verifiedCode) throw new Error('请先验证卡密');
    if (!deviceHashVal) deviceHashVal = await getDeviceHash();

    const body = new FormData();
    body.append('image', item.sourceFile || item.file);
    body.append('code', verifiedCode);
    body.append('device_hash', deviceHashVal);
    body.append('format', $('outputFormat')?.value || 'jpeg');
    body.append('meta', JSON.stringify(collectExportMeta(itemIndex)));

    const res = await fetch('api/process', { method: 'POST', body });
    if (!res.ok) {
        let msg = '后端处理失败';
        try {
            const data = await res.json();
            msg = data.msg || msg;
        } catch (e) { }
        throw new Error(msg);
    }

    const blob = await res.blob();
    const encodedName = res.headers.get('X-File-Name');
    if (encodedName) {
        try { blob.fileName = decodeURIComponent(encodedName); } catch (e) { blob.fileName = encodedName; }
    }
    return blob;
}

function processOneClient(item, itemIndex = 0) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const cv = document.createElement('canvas');
                const target = getExportDimensions(img.width, img.height);
                cv.width = target.width;
                cv.height = target.height;
                const ctx = cv.getContext('2d');
                if (!ctx) { reject(new Error('Canvas失败')); return; }
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, target.width, target.height);
                const jpg = cv.toDataURL('image/jpeg', 0.95);
                if (!jpg || jpg.length < 100) { reject(new Error('转换失败')); return; }
                let blob;
                try {
                    const exif = buildExif(target.width, target.height, collectExportMeta(itemIndex));
                    blob = dataUrlToBlob(piexif.insert(piexif.dump(exif), jpg));
                } catch (e) {
                    console.warn('EXIF写入失败，使用原始JPEG', e);
                    blob = dataUrlToBlob(jpg);
                }
                cv.width = 0; cv.height = 0;
                resolve(blob);
            } catch (e) { reject(e); }
        };
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = item.objectUrl || item.dataUrl;
    });
}

function dataUrlToBlob(dataUrl) {
    if (!dataUrl?.includes(',')) return new Blob([], { type: 'image/jpeg' });
    const [head, b64] = dataUrl.split(',');
    if (!b64) return new Blob([], { type: 'image/jpeg' });
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: head.split(':')[1].split(';')[0] });
}

function dlBlob(blob, name) {
    if (!blob?.size) { showToast('文件为空', 'error'); return; }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 60000);
}

/* ─── 下载弹窗 ─── */
function showDlModal() {
    dlList.innerHTML = processedBlobs.map((it, i) => `
        <div class="dl-item">
            <img class="dl-thumb" src="${it.objectUrl}" alt="${it.fileName}">
            <div class="dl-bar">
                <div class="dl-info">
                    <div class="dl-name">${it.fileName}</div>
                    <div class="dl-status" id="dst-${i}">长按图片保存 / 点击下载</div>
                </div>
                <button class="dl-btn" data-i="${i}">下载</button>
            </div>
        </div>
    `).join('');

    dlList.querySelectorAll('.dl-btn').forEach(btn => {
        btn.addEventListener('click', () => dlOne(+btn.dataset.i, btn));
    });

    $('dlAllBtn').textContent = '全部下载';
    dlModal.classList.add('active');
}

function dlOne(i, btn) {
    const it = processedBlobs[i];
    dlBlob(it.blob, it.fileName);
    it.downloaded = true;
    btn.textContent = '✓';
    btn.disabled = true;
    const st = $(`dst-${i}`);
    if (st) { st.textContent = '已下载'; st.classList.add('done'); }
}

async function downloadAll() {
    const btns = dlList.querySelectorAll('.dl-btn:not(:disabled)');
    for (const btn of btns) {
        dlOne(+btn.dataset.i, btn);
        await new Promise(r => setTimeout(r, 450));
    }
}
