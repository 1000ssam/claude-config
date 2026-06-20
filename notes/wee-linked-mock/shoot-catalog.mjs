import pw from 'file:///home/user/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const DIR='/mnt/c/dev/notes/wee-linked-mock';
const b=await chromium.launch({args:['--allow-file-access-from-files']});
const p=await (await b.newContext({viewport:{width:1240,height:1400},deviceScaleFactor:1.5})).newPage();
await p.goto('file://'+DIR+'/reference-catalog.html',{waitUntil:'load'});
await p.waitForTimeout(1200);
await p.screenshot({path:DIR+'/catalog-preview.png',fullPage:true});
await b.close();console.log('OK');
