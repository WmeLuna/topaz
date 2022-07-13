(async () => {
    eval(await (await fetch('https://wmeluna.com/topaz/gooseless/libs.js')).text())
    eval(await (await fetch('https://wmeluna.com/topaz/gooseless/goosesettings.js')).text())
    eval(await (await fetch('https://wmeluna.com/topaz/gooseless/goosepatcher.js')).text())
    eval(await (await fetch('https://wmeluna.com/topaz/src/index.js')).text())
})