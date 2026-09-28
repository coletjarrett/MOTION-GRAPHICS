// node engine/render.js stills <tpl.js> 1,2.5,4 [paramsJSON]      → qa/stills/<name>_t.png
// node engine/render.js batch jobs.json <worker> <nworkers>         → out/<id>.mp4 (+ .mov with alpha)
// Run from the library root. Needs puppeteer-core (RELIEF_NODE_MODULES or MOTION_NODE_MODULES).
const http=require('http'),fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const puppeteer=(()=>{for(const p of [process.env.MOTION_NODE_MODULES,process.env.RELIEF_NODE_MODULES,path.join(process.cwd(),'node_modules'),path.join(require('os').homedir(),'.claude/skills/relief-film/node_modules')].filter(Boolean)){try{return require(path.join(p,'puppeteer-core'))}catch(e){}}throw Error('puppeteer-core not found')})();
const root=process.cwd(),mode=process.argv[2];
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/'||u==='/index.html')u='/engine/index.html';const f=path.join(root,u);fs.readFile(f,(e,d)=>{r.writeHead(e?404:200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});r.end(e?'':d)})});
const run=(args)=>new Promise((res,rej)=>{const p=spawn('ffmpeg',args,{stdio:['ignore','inherit','inherit']});p.on('exit',c=>c===0?res():rej(Error('ffmpeg '+c+' '+args.join(' '))))});
async function open(page,job){const errs=[];page.removeAllListeners('pageerror');page.on('pageerror',e=>errs.push(e.message));
 const url=`http://127.0.0.1:${server.address().port}/index.html?t=${encodeURIComponent(job.tpl)}&libs=${encodeURIComponent((job.libs||[]).join(','))}&p=${encodeURIComponent(JSON.stringify(job.params||{}))}`;
 await page.goto(url,{waitUntil:'networkidle0'});await page.waitForFunction('window.__loaded===true',{timeout:20000});
 if(errs.length)throw Error(job.tpl+': '+errs[0]);await page.evaluate(()=>window.ready());const A=await page.evaluate(()=>window.audit());
 await page.setViewport({width:A.size[0],height:A.size[1]});return {A,errs};}
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,protocolTimeout:0,args:['--ignore-gpu-blocklist','--disable-gpu-vsync','--force-color-profile=srgb','--font-render-hinting=none']});
 const page=await browser.newPage();await page.setViewport({width:1920,height:1080});
 page.on('console',m=>{if(m.type()==='error')console.error('CONSOLE',m.text())});
 if(mode==='stills'){const tpl=process.argv[3],ts=process.argv[4].split(',').map(Number),params=JSON.parse(process.argv[5]||'{}');
  const {A,errs}=await open(page,{tpl,params,libs:(process.env.LIBS||'').split(',').filter(Boolean)});const dir=path.join(root,'qa/stills');fs.mkdirSync(dir,{recursive:true});
  const name=process.env.NAME||path.basename(tpl,'.js')+'_'+path.basename(path.dirname(tpl));
  for(const t of ts){const d=await page.evaluate(t=>window.snap(t),t);const f=path.join(dir,`${name}_${t.toFixed(2)}.png`);fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));}
  if(errs.length)console.error('PAGEERROR',errs.join('\n'));console.log('OK',name,JSON.stringify(A));
 }else if(mode==='batch'){const jobs=JSON.parse(fs.readFileSync(process.argv[3],'utf8')),w=+process.argv[4],n=+process.argv[5];
  for(let j=w;j<jobs.length;j+=n){const job=jobs[j],T0=Date.now();try{
   const {A,errs}=await open(page,job);const outDir=path.join(root,job.dir||'out');fs.mkdirSync(outDir,{recursive:true});
   const base=path.join(outDir,job.id),alpha=A.alpha,tmp=base+(alpha?'.mov':'.silent.mp4');
   const vargs=alpha?['-c:v','prores_ks','-profile:v','4','-pix_fmt','yuva444p10le','-vendor','apl0','-alpha_bits','16']:['-vf','format=yuv420p','-c:v','libx264','-preset','medium','-crf','16','-profile:v','high','-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0'];
   const ff=spawn('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','image2pipe','-framerate',String(A.fps),'-c:v','png','-i','-',...vargs,tmp],{stdio:['pipe','inherit','inherit']});
   const done=new Promise((res,rej)=>{ff.on('error',rej);ff.on('exit',c=>c===0?res():rej(Error('ffmpeg '+c)))});
   for(let f=0;f<A.frames;f++){const d=await page.evaluate(t=>window.snap(t),f/A.fps);if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));}
   ff.stdin.end();await done;if(errs.length)throw Error(errs[0]);
   // preview/delivery mp4: alpha clips are composited over a plate; audio muxed if given
   const audio=job.audio&&fs.existsSync(path.join(root,job.audio))?['-i',path.join(root,job.audio)]:[];
   const x264=['-c:v','libx264','-preset','medium','-crf','16','-profile:v','high','-pix_fmt','yuv420p','-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0','-movflags','+faststart'];
   const amap=audio.length?['-map','[v]','-map',(alpha?'2':'1')+':a:0','-c:a','aac','-b:a','256k','-shortest']:['-map','[v]'];
   if(alpha){const plate=path.join(root,job.plate||'plates/plate_warm.png');
    await run(['-y','-hide_banner','-loglevel','error','-loop','1','-framerate',String(A.fps),'-i',plate,'-i',tmp,...audio,'-filter_complex',`[0:v]scale=${A.size[0]}:${A.size[1]},format=rgba[b];[b][1:v]overlay=shortest=1,format=yuv420p[v]`,...amap,...x264,'-t',String(A.frames/A.fps),base+'.mp4']);}
   else if(audio.length){await run(['-y','-hide_banner','-loglevel','error','-i',tmp,...audio,'-map','0:v','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-movflags','+faststart','-t',String(A.frames/A.fps),base+'.mp4']);fs.unlinkSync(tmp);}else{await run(['-y','-hide_banner','-loglevel','error','-i',tmp,'-c:v','copy','-movflags','+faststart',base+'.mp4']);fs.unlinkSync(tmp);}
   await run(['-y','-hide_banner','-loglevel','error','-ss',String((job.poster??.7)*A.frames/A.fps),'-i',base+'.mp4','-frames:v','1','-q:v','3',base+'.jpg']);
   const secs=(Date.now()-T0)/1000;fs.appendFileSync(path.join(root,'qa/render_log.jsonl'),JSON.stringify({id:job.id,frames:A.frames,secs,ms_per_frame:Math.round(secs*1000/A.frames),alpha,at:new Date().toISOString()})+'\n');
   console.log(`DONE ${job.id} ${A.frames}f ${secs.toFixed(1)}s`);
  }catch(e){console.error('FAIL',job.id,e.message);fs.appendFileSync(path.join(root,'qa/fail.log'),job.id+' '+e.message+'\n');}}
 }
}finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
