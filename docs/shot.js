const path=require('path');const puppeteer=require(path.join(require('os').homedir(),'.claude/skills/relief-film/node_modules/puppeteer-core'));
(async()=>{const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--allow-file-access-from-files']});const p=await b.newPage();await p.setViewport({width:816,height:2600});
await p.goto('file://'+path.resolve(process.argv[2]),{waitUntil:'networkidle0'});await p.screenshot({path:process.argv[3],fullPage:false});await b.close()})();
