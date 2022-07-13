// local storage fix
function getLocalStoragePropertyDescriptor() {
    const frame = document.createElement('frame');
    frame.src = 'about:blank';
    document.body.appendChild(frame);
    let r = Object.getOwnPropertyDescriptor(frame.contentWindow, 'localStorage');
    frame.remove();
    return r;
 }
Object.defineProperty(window, 'localStorage', getLocalStoragePropertyDescriptor());

//webpack add
const gooseWebPack = document.createElement('script')
gooseWebPack.textContent = `
    window.goosemod = {webpackModules:{},patcher:{},settings:{}};
    import('https://raw.githack.com/GooseMod/GooseMod/master/src/util/discord/webpackModules.js').then(m => window.goosemod.webpackModules = m)
`
document.head.appendChild(gooseWebPack);