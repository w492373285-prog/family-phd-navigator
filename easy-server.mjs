import http from 'node:http';

const countries = [
  ['新西兰', 87, '博士学费友好，配偶工签和孩子公立教育路径相对清晰。', '学校少，就业市场小，需要尽早锁定导师。', 306000],
  ['澳大利亚', 86, '博士资源多，配偶工作权限强，毕业后路径较成熟。', '大城市生活成本高，州教育收费差异明显。', 454000],
  ['德国', 84, '公立教育和成本友好，岗位制博士及长期就业路径清晰。', '德语和制度适应是主要门槛。', 266000],
  ['加拿大', 80, '博士和移民路径丰富，孩子教育体系成熟。', '配偶工签政策变化较快，大城市住房贵。', 368000],
  ['香港', 78, '离家近，奖学金吸引力强，配偶受养人工作路径较友好。', '住房成本高，孩子学校和语言环境需提前评估。', 408000],
  ['英国', 74, '博士学制短，学校选择多，符合条件可带家属。', '家属政策收紧，生活成本和奖学金压力大。', 430000],
  ['荷兰', 70, '雇佣制博士机会较好，长期居留路径明确。', '住房紧张，配偶工作权限需逐案核验。', 392000],
  ['日本', 62, '费用较可控，安全性高，奖学金渠道稳定。', '语言适应和配偶工作时长限制明显。', 292000],
  ['爱尔兰', 61, '英语环境，就业后长期居留路径较清晰。', '住房紧张，奖学金名额少，配偶权限需核验。', 386000],
  ['新加坡', 55, '学校质量高，奖学金强，安全性好。', '配偶就业和孩子公立学校不确定，成本高。', 520000]
];

const stages = [
  ['确定国家方向', '筛选2-3个主攻国家，核验官方政策。'],
  ['评估申请背景', '整理GPA、论文、研究经历、推荐人和专业方向。'],
  ['准备语言成绩', '确定IELTS/TOEFL/PTE目标分并预约考试。'],
  ['筛选学校和导师', '建立学校导师表，按研究匹配和经费过滤。'],
  ['准备博士申请材料', '完成CV、Research Proposal、推荐信和学历材料。'],
  ['递交学校和奖学金申请', '按截止日期提交并跟进导师反馈。'],
  ['准备签证和家庭材料', '准备主申请、配偶、孩子签证与资金证明。'],
  ['落地后办理生活事项', '办理住宿、银行卡、医保、孩子入学和税号。']
];

const materials = ['护照', '身份证', '户口本', '结婚证', '出生证明', '学历证书', '成绩单', '推荐信', 'CV', 'Research Proposal', '英语成绩', '资金证明', '录取通知', '签证材料', '孩子入学材料'];

function html() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>一家三口出国读博全流程规划筛选器</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:#f5f7f2;color:#17211b;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}.app{max-width:520px;margin:0 auto;min-height:100vh;background:#fbfcf8;padding:18px 16px 86px}.hero{padding:22px 0}.eyebrow{font-weight:900;color:#126b56}.hero h1{font-size:29px;line-height:1.16;margin:6px 0}.hero p,.card p,.stage p,.report p,li{color:#5d6b64;line-height:1.65}.btn{border:0;border-radius:8px;background:#0f6b56;color:white;font-weight:900;min-height:44px;padding:0 16px}.ghost{background:#e6ebe5;color:#26362f}.grid{display:grid;gap:10px}.card,.form,.stage,.report{background:white;border:1px solid #dbe5dc;border-radius:8px;padding:14px;margin-bottom:12px}.card h2,.stage h2{margin:0 0 6px;font-size:19px}.score{font-size:28px;font-weight:900;color:#0f6b56}.row{display:flex;justify-content:space-between;gap:12px}.tag{display:inline-flex;border-radius:99px;background:#e0f1e7;color:#0f6b56;font-weight:900;font-size:12px;padding:3px 9px}label{display:grid;gap:6px;margin:10px 0;font-weight:800}input,select{border:1px solid #cfd9d1;border-radius:8px;min-height:42px;padding:10px;background:#fbfcf8}.nav{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(520px,100%);display:grid;grid-template-columns:repeat(5,1fr);gap:2px;background:white;border-top:1px solid #dde5dc;padding:8px 6px}.nav button{border:0;border-radius:8px;background:transparent;min-height:44px;color:#596a61}.nav button.on{background:#e2f0e7;color:#0f6b56;font-weight:900}.budget{display:grid;grid-template-columns:1fr 1fr;gap:8px}.budget span{background:#edf3ef;border-radius:8px;padding:8px;font-size:13px}.check{display:flex;gap:8px;align-items:flex-start;margin:8px 0}.check input{min-height:auto;margin-top:5px}.admin textarea{width:100%;border:1px solid #cfd9d1;border-radius:8px;min-height:90px;padding:10px}.tabs{display:flex;gap:8px;overflow-x:auto;margin:8px 0 14px}.tabs button{white-space:nowrap;border:0;border-radius:8px;min-height:36px;padding:0 12px}.hide{display:none}@media(max-width:390px){.hero h1{font-size:25px}}
  </style>
</head>
<body>
<div id="app" class="app"></div>
<nav class="nav">
  <button data-tab="home" class="on">首页</button><button data-tab="form">填写</button><button data-tab="result">结果</button><button data-tab="road">路线</button><button data-tab="admin">后台</button>
</nav>
<script>
const countries=${JSON.stringify(countries)};
const stages=${JSON.stringify(stages)};
const materials=${JSON.stringify(materials)};
let tab='home';
let plan=null;
const app=document.querySelector('#app');
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});
function scoreAdjust(base,budget,work,child){let s=base;if(work==='high')s+=3;if(child==='public')s+=2;if(budget&&budget>=400000)s+=1;return Math.min(100,s)}
function makePlan(){const budget=+document.querySelector('#budget')?.value||450000;const work=document.querySelector('#work')?.value||'high';const child=document.querySelector('#child')?.value||'public';const list=countries.map(c=>({name:c[0],score:scoreAdjust(c[1],budget,work,child),reason:c[2],risk:c[3],budget:c[4]})).sort((a,b)=>b.score-a.score);plan={top:list.slice(0,3),bad:list.slice(-3).reverse(),budget,work,child};tab='result';render()}
function exportReport(){window.print()}
function header(t,s){return '<header class="hero"><p class="eyebrow">Family PhD Navigator</p><h1>'+t+'</h1><p>'+s+'</p></header>'}
function render(){
 document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
 if(tab==='home') app.innerHTML=header('一家三口出国读博全流程规划筛选器','填写家庭情况后，生成国家推荐、博士申请路线、配偶工作、孩子入学、签证材料、预算和最终行动报告。')+'<button class="btn" onclick="tab=\\'form\\';render()">开始填写</button><div class="grid" style="margin-top:14px"><div class="card"><h2>国家推荐</h2><p>按博士、奖学金、配偶工作、孩子教育、成本、移民和安全综合评分。</p></div><div class="card"><h2>博士申请路线</h2><p>覆盖语言、导师、Research Proposal、奖学金和网申节点。</p></div><div class="card"><h2>家庭落地</h2><p>同步处理配偶合法工作、孩子公立学校、签证材料和一年预算。</p></div></div>';
 if(tab==='form') app.innerHTML=header('家庭信息填写','先填一个粗略版本，后面可以随时重算。')+'<div class="form"><label>家庭年度预算（人民币）<input id="budget" type="number" value="450000"></label><label>博士目标专业<input placeholder="例如：教育学 / 计算机 / 管理学"></label><label>英语成绩<input placeholder="例如：IELTS 6.5，暂无也可以"></label><label>配偶工作需求<select id="work"><option value="high">必须尽快合法工作</option><option value="mid">希望能工作</option><option value="low">短期可不工作</option></select></label><label>孩子学校偏好<select id="child"><option value="public">优先公立学校</option><option value="flexible">灵活</option><option value="international">可考虑国际学校</option></select></label><button class="btn" onclick="makePlan()">生成规划报告</button></div>';
 if(tab==='result') app.innerHTML=!plan?header('国家筛选结果','还没有生成结果。')+'<button class="btn" onclick="tab=\\'form\\';render()">去填写</button>':header('国家筛选结果','最推荐国家TOP3和不推荐原因。')+plan.top.map((c,i)=>'<div class="card"><div class="row"><div><span class="tag">TOP '+(i+1)+'</span><h2>'+c.name+'</h2></div><div class="score">'+c.score+'</div></div><p>'+c.reason+'</p><p><b>风险：</b>'+c.risk+'</p><div class="budget"><span>一年预算估算</span><span>¥'+c.budget.toLocaleString()+'</span></div></div>').join('')+'<div class="report"><h2>不推荐国家</h2>'+plan.bad.map(c=>'<p><b>'+c.name+'：</b>'+c.risk+'</p>').join('')+'<button class="btn" onclick="tab=\\'road\\';render()">看全流程路线图</button></div>';
 if(tab==='road') app.innerHTML=header('全流程路线图','8个阶段，从国家方向到落地生活事项。')+stages.map((s,i)=>'<div class="stage"><span class="tag">阶段 '+(i+1)+'</span><h2>'+s[0]+'</h2><p><b>当前任务：</b>'+s[1]+'</p><p><b>完成标准：</b>形成可执行清单并进入下一步。</p><p><b>风险提醒：</b>政策和学校要求要以官方页面为准。</p></div>').join('')+'<div class="report"><h2>材料清单</h2>'+materials.map(m=>'<label class="check"><input type="checkbox"><span>'+m+'</span></label>').join('')+'</div>';
 if(tab==='admin') app.innerHTML=header('后台管理','免安装演示版支持查看和复制数据；正式版后台在 Vue + Express + SQLite 项目中。')+'<div class="report admin"><h2>国家数据</h2><textarea>'+countries.map(c=>c.join(' | ')).join('\\n')+'</textarea><p>正式版可在「后台」里保存国家、学校、导师、预算、材料、流程和更新时间。</p><button class="btn" onclick="exportReport()">打印/导出PDF</button></div>';
}
render();
</script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html());
});

server.listen(5173, '127.0.0.1', () => {
  console.log('免安装版已启动：http://localhost:5173');
});
