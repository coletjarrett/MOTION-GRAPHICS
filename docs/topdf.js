const path=require('path');const puppeteer=require(path.join(require('os').homedir(),'.claude/skills/relief-film/node_modules/puppeteer-core'));
(async()=>{const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--allow-file-access-from-files']});const p=await b.newPage();
for(const [i,o] of [[process.argv[2],process.argv[3]]]){await p.goto('file://'+path.resolve(i),{waitUntil:'networkidle0'});await p.pdf({path:o,format:'Letter',printBackground:true,preferCSSPageSize:true});}
await b.close();console.log('pdf ok')})();
