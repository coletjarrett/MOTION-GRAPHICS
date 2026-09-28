const path=require('path');const puppeteer=require(path.join(require('os').homedir(),'.claude/skills/relief-film/node_modules/puppeteer-core'));
(async()=>{const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--allow-file-access-from-files']});const p=await b.newPage();await p.setViewport({width:1440,height:2400});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve('Library.html'),{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,1500));await p.screenshot({path:'qa/catalog.png'});console.log('errors',errs);await b.close()})();
