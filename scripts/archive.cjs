// SPDX-License-Identifier: GPL-3.0-or-later
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),pkg=require('../package.json'),name=`Portlight-${pkg.version}`;
const git=(args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true});
const staged=process.argv.includes('--staged');
if(staged?(git(['diff','--name-only']).trim()||git(['ls-files','--others','--exclude-standard']).trim()):git(['status','--porcelain']).trim())throw Error('Review and stage/commit all source before creating matching release archives.');
const ref=staged?git(['write-tree']).trim():git(['rev-parse','HEAD']).trim();
execFileSync(process.execPath,[path.join(__dirname,'verify-release.cjs')],{cwd:root,stdio:'inherit',windowsHide:true});
const out=path.join(root,'artifacts');fs.mkdirSync(out,{recursive:true});
const win=path.join(out,name+'-windows-x64.zip'),src=path.join(out,name+'-source.zip');
for(const file of [win,src])if(fs.existsSync(file))throw Error('Archive already exists: '+path.basename(file));
const quote=s=>"'"+s.replaceAll("'","''")+"'";
// Package an untouched copy: Chromium may have written a locked debug.log in
// the UI smoke-test directory. No logs or test state belong in the download.
const clean=path.join(out,'staging',name+'-windows-x64');
if(fs.existsSync(clean))throw Error('Archive staging already exists; move it aside before retrying.');
fs.cpSync(path.join(root,'release',name+'-windows-x64'),clean,{recursive:true,filter:p=>!p.toLowerCase().endsWith('.log')});
execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',`$ErrorActionPreference='Stop'; Compress-Archive -LiteralPath ${quote(clean)} -DestinationPath ${quote(win)} -CompressionLevel Optimal`],{cwd:root,stdio:'inherit',windowsHide:true});
git(['archive','--format=zip',`--prefix=${name}-source/`,'-o',src,ref]);
const sums=[win,src].map(p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')+'  '+path.basename(p));
fs.writeFileSync(path.join(out,'SHA256SUMS.txt'),sums.join('\n')+'\n');
fs.writeFileSync(path.join(out,'SOURCE-REF.txt'),`${staged?'Git tree':'Git commit'}: ${ref}\n`);
console.log('Source reference: '+ref);console.log(sums.join('\n'));
