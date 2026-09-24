// Optional: refresh the curated documentation from a sibling local lab.
// Does not read archive keys, credentials, game packages, source C++, or media.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const workspace=path.resolve(process.argv[2]||path.join(root,'..'));
const hash=s=>createHash('sha256').update(s).digest('hex');
const slash=s=>s.split(path.sep).join('/');
const entries=[];
const chapters=[
 ['00-Readme.vi.md','start','Bắt đầu','Cách đọc và kết quả hiện tại'],
 ['01-AK74-Case-Study.vi.md','case-study','Lịch sử AK74','Nguyên nhân → sửa → kiểm chứng'],
 ['02-Gunplay-Foundations.vi.md','foundations','Nền tảng Gun Gameplay','22 chủ đề, từ input tới mục tiêu'],
 ['03-Weapon-Reconstruction-Workflow.vi.md','workflow','Quy trình cho khẩu tiếp theo','11 bước và các cổng nghiệm thu'],
 ['04-Weapon-Worksheet.template.vi.md','worksheet','Phiếu công việc','Sao chép để bắt đầu điều tra']
];
for(const[file,id,title,description]of chapters)entries.push({kind:'chapter',source:'WardogsAssetLab/Docs/Gunplay-Handbook/'+file,file:'content/handbook/'+file,route:'index.html#'+id,id,title,description});
const reports=['GunGameplay-Integration-Audit.vi.md','VideoGunplay-CodeAudit.vi.md','Showcase-Implementation.vi.md','Gunplay-Changes-20260923.vi.md','AK74-MechanismAudit-20260924.vi.md','AK74-VideoAnalysis-20260924.vi.md','AK74-AudioAudit-20260924.vi.md','AK74-HIP-Mechanisms-20260924.vi.md','Gunplay-WeaponEvidence-20260923.vi.md','AK74-HIP-Changes-20260924.vi.md'];
for(const file of reports)entries.push({kind:'report',source:'WardogsAssetLab/Docs/'+file,file:'content/reports/'+file,route:'reports/'+file.replace(/\.md$/,'.html')});
entries.push({kind:'report',source:'WardogsPorting/research/gameplay/bxMd6SvtJi8/ak74-hip-focus-20260924/README.vi.md',file:'content/reports/AK74-HIP-Measurement-Readme.vi.md',route:'reports/AK74-HIP-Measurement-Readme.vi.html'});
for(const[source,name]of [
 ['WardogsAssetLab/Config/AK74HipFire.json','AK74HipFire.json'],
 ['WardogsAssetLab/Saved/AK74Focus/validation-summary.json','AK74Focus-validation-summary.json'],
 ['WardogsAssetLab/Saved/AK74HipFocus/validation-summary.json','AK74HipFocus-validation-summary.json'],
 ['WardogsAssetLab/Saved/AK74EditorLevel/level-validation.json','AK74EditorLevel-validation.json']
])entries.push({kind:'evidence',source,file:'content/evidence/'+name,route:'content/evidence/'+name,title:name});
const canonical=p=>path.resolve(p).toLowerCase();
const bySource=new Map(entries.map(e=>[canonical(path.join(workspace,e.source)),e]));
const localReferences=new Map();
function relativeLocal(resolved){const relative=slash(path.relative(workspace,resolved));return relative.startsWith('../')||path.isAbsolute(relative)?path.basename(resolved):relative;}
function reference(resolved){const name=relativeLocal(resolved);const id='local-'+hash(name).slice(0,12);if(!localReferences.has(id))localReferences.set(id,{id,path:name});return id;}
function cleanPaths(text){return text.replaceAll(slash(workspace)+'/','').replaceAll(workspace+'\\','').replaceAll(workspace.replaceAll('\\','\\\\')+'\\\\','').replaceAll('G:/UE_5.8/','UE_5.8/');}
for(const e of entries){
 const source=path.join(workspace,e.source);let raw=fs.readFileSync(source,'utf8');e.sourceSha256=hash(raw);
 let text=raw;
 if(e.kind==='evidence'){
   const parsed=JSON.parse(raw);
   const clean=v=>typeof v==='string'?cleanPaths(v):Array.isArray(v)?v.map(clean):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clean(x)])):v;
   text=JSON.stringify(clean(parsed),null,2)+'\n';
 }else{
   e.title=e.title||raw.match(/^#\s+(.+)$/m)?.[1]||path.basename(e.file);
   text=text.replace(/(!?)\[([^\]\n]+)\]\(([^\n)]+)\)/g,(all,image,label,href)=>{
     href=href.replace(/^<|>$/g,'');
     if(/^(?:https?:|mailto:|#)/i.test(href))return all;
     const [pathname,suffix='']=href.split(/(?=[?#])/u,2);
     const resolved=path.resolve(path.dirname(source),decodeURIComponent(pathname));
     const known=bySource.get(canonical(resolved));
     const destination=known?path.join(root,known.file):path.join(root,'references.html');
     let target=slash(path.relative(path.dirname(path.join(root,e.file)),destination));
     target+=known?suffix:'#'+reference(resolved);
     return `[${image?'Hình: ':''}${label}${known?'':' (workspace)'}](${target})`;
   });
   text=cleanPaths(text);
   // Public readers did not personally perform the local acceptance test.
   text=text.replaceAll('Bạn đã chơi thử và chấp nhận HIP/ADS của AK74.','Người thực hiện dự án đã chơi thử và chấp nhận HIP/ADS của AK74.');
   if(e.id==='start'){
     text=text.replace('Bạn đã chơi thử và chấp nhận HIP/ADS của AK74.','Người thực hiện dự án đã chơi thử và chấp nhận HIP/ADS của AK74.');
     text=text.replace('Bản HTML có mục lục theo chương và theo chủ đề; có thể dùng tìm kiếm của trình duyệt và nút In / lưu PDF. Bốn file Markdown còn lại có thể chỉnh sửa bằng editor; sao chép phiếu 04 cho từng khẩu. Các link source/receipt trong bản HTML trỏ về file thật trên máy này, nên khi chuyển tài liệu sang máy khác cần giữ cấu trúc thư mục hoặc mang theo các bằng chứng liên quan.','Bản online có mục lục theo chương và theo chủ đề; có thể dùng tìm kiếm của trình duyệt và nút In / lưu PDF. Các chương Markdown, báo cáo bổ trợ và receipt được lưu trong repo. Liên kết có nhãn “workspace” dẫn tới danh mục file cần mở trên máy chứa WardogsAssetLab; website không khởi chạy Unreal hay cung cấp các video/capture và asset game đó. Sao chép phiếu 04 để làm việc với khẩu tiếp theo.');
   }
 }
 text=text.replace(/\r\n/g,'\n').trimEnd()+'\n';
 const destination=path.join(root,e.file);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,text);e.publishedSha256=hash(text);
}
fs.mkdirSync(path.join(root,'assets'),{recursive:true});
const original=fs.readFileSync(path.join(workspace,'WardogsAssetLab/Docs/Gunplay-Handbook.html'),'utf8');
const style=original.match(/<style>([\s\S]*?)<\/style>/)?.[1];if(!style)throw Error('Missing original handbook style');
fs.writeFileSync(path.join(root,'assets/styles.css'),style+'\n'+`
.notice{background:#f4f0df;border-left:3px solid #b17a33;padding:14px 18px;margin:20px 0;font-size:14px}.report-layout{max-width:1100px;margin:auto;padding:0 28px 50px}.report-layout .chapter{padding:36px 42px}.workspace-label{font-size:12px;color:var(--muted)}.refs-table td:first-child{font-size:12px}.refs-table tr{scroll-margin-top:25px}.entry-link{font-weight:600}.report-date{font-size:12px;color:var(--muted)}@media(max-width:720px){.report-layout{padding:0 12px 24px}.report-layout .chapter{padding:24px 19px}}@media print{.report-layout{padding:0}.report-layout .chapter{padding:0}.notice{border:1px solid #ccc}}
`);
const catalog={schema:'WardogsDocsPublicationV1',date:'2026-09-24',entries,localReferences:[...localReferences.values()].sort((a,b)=>a.path.localeCompare(b.path)),scope:'Authored documentation, selected calibration config and historical validation summaries. No game packages or media.'};
fs.writeFileSync(path.join(root,'content/catalog.json'),JSON.stringify(catalog,null,2)+'\n');
console.log(JSON.stringify({documents:entries.length,localReferences:catalog.localReferences.length},null,2));
