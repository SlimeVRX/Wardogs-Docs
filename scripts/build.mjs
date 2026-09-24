import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Marked} from '../vendor/marked.esm.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'content/catalog.json'),'utf8'));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const slash=s=>s.split(path.sep).join('/');
const byFile=new Map(catalog.entries.map(e=>[path.resolve(root,e.file).toLowerCase(),e]));
const checked=new Set();
function hrefTo(fromRoute,toRoute){const[filename,fragment]=toRoute.split('#',2);let href=slash(path.relative(path.dirname(path.join(root,fromRoute)),path.join(root,filename)));if(filename===fromRoute&&fragment)return '#'+fragment;return href+(fragment?'#'+fragment:'');}
function render(e){
 const headings=[],ids=new Set(),md=new Marked({gfm:true});
 md.use({renderer:{
  heading({tokens,depth}){const html=this.parser.parseInline(tokens),label=html.replace(/<[^>]+>/g,'');const prefix=e.id||slug(path.basename(e.file));const base=depth===1?prefix+'-title':prefix+'-'+slug(label);let id=base,n=2;while(ids.has(id))id=base+'-'+n++;ids.add(id);if(depth===2)headings.push({id,label});return `<h${depth} id="${id}">${html}</h${depth}>\n`;},
  link({href,title,tokens}){
   if(!href)return this.parser.parseInline(tokens);let target=href;
   if(!/^(?:https?:|mailto:|#)/i.test(href)){
    const parts=href.match(/^([^?#]*)(.*)$/),resolved=path.resolve(path.dirname(path.join(root,e.file)),decodeURIComponent(parts[1]));const known=byFile.get(resolved.toLowerCase());
    const route=known?known.route:slash(path.relative(root,resolved));
    if(!known&&route!=='references.html'&&!fs.existsSync(resolved))throw Error(`Missing link ${e.file}: ${href}`);
    if(route.startsWith('../')||path.isAbsolute(route))throw Error(`Escaped publication root: ${href}`);
    target=hrefTo(e.route.split('#')[0],route)+(parts[2]||'');checked.add(route);
   }
   return `<a href="${escape(target)}"${title?` title="${escape(title)}"`:''}${/^https?:/i.test(target)?' target="_blank" rel="noopener noreferrer"':''}>${this.parser.parseInline(tokens)}</a>`;
  }
 }});
 const html=md.parse(fs.readFileSync(path.join(root,e.file),'utf8')).replace(/<table>/g,'<div class="table-wrap" tabindex="0" role="region" aria-label="Bảng dữ liệu"><table>').replace(/<\/table>/g,'</table></div>');
 return{...e,html,headings};
}
const header=prefix=>`<header class="masthead"><div class="brand">WARDOGS DOCS<span>Cẩm nang Gun Gameplay · tiếng Việt · 24.09.2026</span></div><div class="actions"><a href="${prefix}index.html">Cẩm nang</a><a href="${prefix}references.html">Báo cáo & bằng chứng</a><a href="https://github.com/SlimeVRX/Wardogs-Docs">GitHub ↗</a><button class="theme-toggle" id="theme-toggle" type="button" aria-pressed="false"><span aria-hidden="true">☾</span>Nền tối</button><button class="print" onclick="window.print()">In / lưu PDF</button></div></header>`;
function page(title,body,prefix='',script=''){return`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><script src="${prefix}assets/theme.js"></script><meta name="description" content="Báo cáo hiệu chỉnh AK74, nền tảng Gun Gameplay và quy trình tái tạo cảm giác bắn từng khẩu."><title>${escape(title)} · Wardogs Docs</title><link rel="stylesheet" href="${prefix}assets/styles.css"><link rel="stylesheet" href="${prefix}assets/theme.css"></head><body>${header(prefix)}${body}${script}</body></html>`;}
const chapters=catalog.entries.filter(e=>e.kind==='chapter').map(render);
const nav=chapters.map((c,i)=>`<div class="nav-group"><a class="chapter-link" href="#${c.id}"><span class="number">0${i}</span><span>${escape(c.title)}<small>${escape(c.description)}</small></span></a><details><summary>Chủ đề trong chương</summary><ul>${c.headings.map(h=>`<li><a href="#${h.id}">${h.label}</a></li>`).join('')}</ul></details></div>`).join('');
const articles=chapters.map((c,i)=>`<article class="chapter" id="${c.id}" aria-labelledby="${c.id}-title"><div class="chapter-kicker">CHƯƠNG 0${i} <span>·</span> <a href="${c.file}">Bản Markdown ↗</a></div>${c.html}${i<chapters.length-1?`<a class="next-chapter" href="#${chapters[i+1].id}">Đọc tiếp: ${escape(chapters[i+1].title)} <span>→</span></a>`:'<a class="next-chapter" href="#start">Về đầu cẩm nang ↑</a>'}</article>`).join('');
const script=`<script>const links=[...document.querySelectorAll('.chapter-link')];function updateChapter(){let current='start';for(const c of document.querySelectorAll('article.chapter'))if(c.getBoundingClientRect().top<180)current=c.id;for(const a of links)if(a.hash==='#'+current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}addEventListener('scroll',updateChapter,{passive:true});updateChapter();</script>`;
fs.writeFileSync(path.join(root,'index.html'),page('Hiểu và tái tạo cảm giác bắn',`<a class="skip" href="#start">Đến nội dung</a><div class="layout"><nav aria-label="Mục lục"><p class="nav-title">LỘ TRÌNH ĐỌC</p>${nav}<p class="nav-note">Ctrl + F để tìm trong tài liệu.<br><a href="references.html">11 báo cáo bổ trợ và bằng chứng</a></p></nav><main>${articles}<footer class="footer">Nghiên cứu độc lập tại WardogsAssetLab. Không phải tài liệu chính thức của WARDOGS/BULKHEAD. Các kết quả gắn với build và phạm vi đã đo.</footer></main></div>`,'',script));
const reports=catalog.entries.filter(e=>e.kind==='report').map(render);fs.mkdirSync(path.join(root,'reports'),{recursive:true});
for(const r of reports){const body=`<main class="report-layout"><article class="chapter"><p class="report-date">BÁO CÁO LỊCH SỬ · <a href="../references.html">Về danh mục</a> · <a href="../${r.file}">Markdown</a></p><aside class="notice">Báo cáo này giữ trạng thái tại thời điểm ghi. Các nhận xét về asset, sound, ADS và thông số có thể đã được sửa ở bước sau. Đọc <a href="../index.html#case-study">lịch sử AK74</a> và <a href="../index.html#start">kết quả hiện tại</a> trước khi sử dụng số liệu.</aside>${r.html}</article></main>`;fs.writeFileSync(path.join(root,r.route),page(r.title,body,'../'));}
const rows=catalog.localReferences.map(r=>`<tr id="${r.id}"><td><code>${escape(r.path)}</code></td><td>Mở trong workspace chứa WardogsAssetLab / WardogsPorting. File này không được phân phối trên website.</td></tr>`).join('');
const refs=`<main class="report-layout"><article class="chapter"><h1>Báo cáo và bằng chứng</h1><p>Cẩm nang được tổng hợp từ các báo cáo dưới đây. Các báo cáo cũ là lịch sử nghiên cứu; kết quả được chấp nhận hiện tại nằm trong <a href="index.html#case-study">chương AK74</a>.</p><h2>Báo cáo bổ trợ</h2><ol>${reports.map(r=>`<li><a class="entry-link" href="${r.route}">${escape(r.title)}</a></li>`).join('')}</ol><h2>Config và receipt đã công bố</h2><p>Các JSON giữ số liệu lịch sử của từng lượt kiểm tra. Đường dẫn tuyệt đối trong workspace đã được rút gọn; không phải receipt kiểm thử mới của website.</p><ul>${catalog.entries.filter(e=>e.kind==='evidence').map(e=>`<li><a href="${e.route}">${escape(e.title)}</a></li>`).join('')}</ul><h2 id="workspace">Tài liệu cần workspace local</h2><p>Source C++, launcher Unreal, video, ảnh capture, audio và các dữ liệu bên dưới không nằm trong repo tài liệu này. Liên kết có nhãn <strong>workspace</strong> được đưa về đúng hàng tương ứng để người có project tìm lại; trang web không tự khởi chạy Unreal. Đường dẫn bắt đầu từ thư mục làm việc chứa hai project.</p><div class="table-wrap refs-table" tabindex="0" role="region" aria-label="Danh sách tài liệu local"><table><thead><tr><th>Đường dẫn tương đối / tên file</th><th>Cách truy cập</th></tr></thead><tbody>${rows}</tbody></table></div><p><a href="content/catalog.json">Danh mục xuất bản và hash tài liệu</a> · <a href="index.html">Về cẩm nang</a></p></article></main>`;
fs.writeFileSync(path.join(root,'references.html'),page('Báo cáo và bằng chứng',refs));
console.log(JSON.stringify({htmlPages:reports.length+2,chapters:chapters.length,reports:reports.length,localOnlyReferences:catalog.localReferences.length,checkedLinks:checked.size},null,2));
