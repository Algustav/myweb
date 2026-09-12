const root = document.getElementById('math-lab');
const $ = (id) => root.querySelector('#' + id);
const C = ['#356bd7', '#d97732', '#248779'];
const fmt = (n) => Math.abs(n) < 1e-8 ? '0' : Number(n.toFixed(2)).toString();
const slider = (key, label, min, max, value, step = 0.1) => ({ key, label, min, max, value, step });
const select = (key, label, options, value = options[0][0]) => ({ key, label, options, value });
const basic = [slider('a', '系数 a（0 时退化为常数）', -3, 3, 1), slider('h', '水平位移 h', -3, 3, 0), slider('k', '竖直位移 k', -3, 3, 0)];
const experiments = [
  {id:'quadratic', title:'二次函数', topic:'01 / 函数与图像', description:'移动顶点，改变开口，观察解析式里的三个参数。', controls:basic, question:'h 从 0 变成 2，顶点向哪里移动？a 变成负数又会怎样？', explanation:'顶点满足 x − h = 0，所以顶点横坐标是 h，向右移动 2。a > 0 开口向上，a < 0 开口向下；|a| 越大，同一水平距离对应的高度变化越大。a = 0 时不再是二次函数。'},
  {id:'transform', title:'平移与伸缩', topic:'02 / 图像变换', description:'对照虚线原图，分清括号内外的变化。', controls:[select('base','基础函数',[['square','x²'],['abs','|x|'],['sin','sin x']]), ...basic], question:'f(x) + 2 与 f(x + 2) 的移动方向相同吗？', explanation:'f(x) + 2 把每个函数值增加 2，向上平移；f(x + 2) 要在更小的 x 处取到原来的函数值，向左平移。a 则控制竖直伸缩，负号还带来关于横轴的翻折。'},
  {id:'monotonic', title:'单调性与最值', topic:'03 / 函数的性质', description:'在抛物线上比较两个点，区分函数值的正负与增减。', controls:[slider('h','顶点横坐标 h',-2,2,0),slider('k','顶点纵坐标 k',-3,3,-1),slider('x1','左点 x₁',-4,3,-2),slider('gap','两点距离 Δx',0.2,2,1)], question:'图像在横轴上方，就一定是递增的吗？比较两个点能证明整个区间单调吗？', explanation:'函数值为正只说明图像在横轴上方。对 y = (x − h)² + k，函数在 (−∞, h] 递减，在 [h, +∞) 递增，最小值是 k。两个点只能提供一次比较，单调性要求区间内任意 x₁ < x₂ 都满足相应大小关系。'},
  {id:'parity', title:'奇函数与偶函数', topic:'04 / 对称性', description:'同时观察 x 与 −x 对应的两个点。', controls:[select('base','函数',[['even','x²（偶函数）'],['odd','x³ / 4（奇函数）'],['neither','x² + x（非奇非偶）']]),slider('x','观察位置 x',-2.5,2.5,1.5)], question:'仅仅看到一对对称的点，能判断函数的奇偶性吗？', explanation:'不能。定义域首先必须关于原点对称，再对定义域内任意 x 验证 f(−x) = f(x)（偶函数）或 f(−x) = −f(x)（奇函数）。这里三个函数的定义域都是实数集。'},
  {id:'exponential', title:'指数与对数', topic:'05 / 互为反函数', description:'切换底数，观察增长方向以及关于 y = x 的对称性。', controls:[select('a','底数 a',[['0.25','1/4'],['0.5','1/2'],['2','2'],['3','3'],['4','4']]),slider('x','指数曲线上的 x',-1.5,1.5,0.5)], question:'为什么 a 在 0 与 1 之间时，两条曲线都递减？', explanation:'当 0 < a < 1，指数增加意味着继续乘以小于 1 的正数，函数值变小；反函数也递减。指数函数的点 (x, aˣ) 交换坐标后成为对数函数上的点 (aˣ, x)。对数定义域为 x > 0；底数不能等于 1。'},
  {id:'roots', title:'零点与方程', topic:'06 / 数形结合', description:'上下移动水平线，把方程的解看成交点的横坐标。', controls:[slider('m','水平线 y = m',-3,5,1)], question:'x² − 2x = m 什么时候有 0、1、2 个实数解？', explanation:'配方得到 (x − 1)² = m + 1。因此 m < −1 时无实数解，m = −1 时有一个实数解 x = 1，m > −1 时有两个实数解 x = 1 ± √(m + 1)。'},
  {id:'inequality', title:'二次不等式', topic:'07 / 图像与解集', description:'高亮满足不等式的区间，再对照横轴上下的曲线。', controls:[select('a','开口方向',[['1','向上：a = 1'],['-1','向下：a = −1']]),slider('r1','左根 r₁',-3,0,-1),slider('r2','右根 r₂',0.5,3,2),select('sign','选择不等式',[['positive','f(x) > 0'],['negative','f(x) < 0']])], question:'为什么“两个根之间”有时是解集，有时不是？端点能取到吗？', explanation:'在两根之间，(x − r₁)(x − r₂) 为负；在两根之外为正，再乘以 a 决定函数值符号。这里使用严格不等号，因此两根都不能取到，用空心点表示。高亮带表示解集在当前窗口中的部分。'},
  {id:'circle', title:'单位圆与三角函数', topic:'08 / 从角度到函数', description:'改变角度：圆上的点与下方正弦、余弦曲线同步移动。', controls:[slider('theta','角度 θ（度）',0,720,45,1)], question:'转过 360° 后，点的位置和正弦、余弦值会怎样？', explanation:'单位圆半径为 1，点的坐标为 (cos θ, sin θ)，所以两者都在 [−1, 1] 内。每转一整圈坐标重复，对应周期 2π。角度超过 360° 时，圆上的点重复，曲线继续向前。'},
  {id:'trig', title:'三角函数的参数', topic:'09 / 振幅、周期与相位', description:'对比正弦和余弦，观察同一参数如何作用于两条曲线。', controls:[slider('a','振幅 A',0,3,1,0.05),slider('w','频率系数 ω',0.25,4,1,0.05),slider('p','相位 φ（弧度）',-3.14,3.14,0,0.01),select('visible','显示曲线',[['both','正弦与余弦'],['sin','仅正弦'],['cos','仅余弦']])], question:'ω 越大，为什么周期反而越小？相位 φ 等于水平移动距离吗？', explanation:'相位 ωx 每增加 2π，曲线重复，因此周期为 2π/ω。把 ωx + φ 写成 ω(x + φ/ω)，可知向左平移 φ/ω，而不是 φ。A = 0 时是常数函数，没有最小正周期。'},
  {id:'vectors', title:'平面向量与数量积', topic:'10 / 向量的几何意义', description:'调整向量分量，看平行四边形、夹角和投影如何变化。', controls:[slider('ax','向量 a：横分量',-3,3,2),slider('ay','向量 a：纵分量',-3,3,1),slider('bx','向量 b：横分量',-3,3,-1),slider('by','向量 b：纵分量',-3,3,2)], question:'数量积为 0，一定能说两个向量的夹角是 90° 吗？', explanation:'只有两个向量都非零时才有夹角。a·b = |a||b| cos θ，正值对应 0° ≤ θ < 90°，负值对应 90° < θ ≤ 180°，零对应直角；但零向量与任意向量的数量积也为零，夹角却没有定义。虚线垂足表示 b 在 a 方向上的投影。'}
];
let current, values = {}, width = 600;
const NS = 'http://www.w3.org/2000/svg';
function node(tag, attrs = {}, parent = $('plot'), text) {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,String(v)));
  if(text !== undefined) el.textContent = text;
  parent.appendChild(el); return el;
}
function chart(xmin=-5,xmax=5,ymin=-5,ymax=5, opts={}) {
  const svg=$('plot'), top=opts.top||18, height=opts.height||310;
  const left=48, right=width-16, bottom=top+height-46;
  let X=x=>left+(x-xmin)/(xmax-xmin)*(right-left), Y=y=>bottom-(y-ymin)/(ymax-ymin)*(bottom-top);
  if(opts.equal) {
    const unit=Math.min((right-left)/(xmax-xmin),(bottom-top)/(ymax-ymin));
    X=x=>(left+right)/2+(x-(xmin+xmax)/2)*unit;
    Y=y=>(top+bottom)/2-(y-(ymin+ymax)/2)*unit;
  }
  const l=X(xmin),r=X(xmax),t=Y(ymax),b=Y(ymin);
  const defs=node('defs'); const clip=node('clipPath',{id:'clip-'+top},defs);node('rect',{x:l,y:t,width:r-l,height:b-t},clip);
  const g=node('g',{'clip-path':`url(#clip-${top})`});
  for(let i=0;i<=4;i++) {
    const x=xmin+(xmax-xmin)*i/4,y=ymin+(ymax-ymin)*i/4;
    node('line',{x1:X(x),x2:X(x),y1:t,y2:b,stroke:'#e5ebf4'},g);
    node('line',{x1:l,x2:r,y1:Y(y),y2:Y(y),stroke:'#e5ebf4'},g);
    node('text',{x:X(x),y:b+19,'text-anchor':'middle',fill:'#62718a','font-size':11},svg,fmt(x));
    node('text',{x:l-8,y:Y(y)+4,'text-anchor':'end',fill:'#62718a','font-size':11},svg,fmt(y));
  }
  node('rect',{x:l,y:t,width:r-l,height:b-t,fill:'none',stroke:'#d3ddeb'});
  if(xmin<=0&&xmax>=0) node('line',{x1:X(0),x2:X(0),y1:t,y2:b,stroke:'#9cabc1'},g);
  if(ymin<=0&&ymax>=0) node('line',{x1:l,x2:r,y1:Y(0),y2:Y(0),stroke:'#9cabc1'},g);
  node('text',{x:(l+r)/2,y:b+40,'text-anchor':'middle',fill:'#526078','font-size':12},svg,opts.xlabel||'x');
  node('text',{x:l,y:t-6,fill:'#526078','font-size':12},svg,opts.ylabel||'y');
  function line(x1,y1,x2,y2,color=C[0],dash=false) {node('line',{x1:X(x1),y1:Y(y1),x2:X(x2),y2:Y(y2),stroke:color,'stroke-width':2,...(dash?{'stroke-dasharray':'5 4'}:{})},g);}
  function path(f,color=C[0],dash=false,lo=xmin,hi=xmax) {
    let d='', connected=false;
    for(let i=0;i<=900;i++) {const x=lo+(hi-lo)*i/900,y=f(x);if(!Number.isFinite(y)){connected=false;continue;} d+=(connected?'L':'M')+X(x).toFixed(2)+','+Y(y).toFixed(2);connected=true;}
    node('path',{d,fill:'none',stroke:color,'stroke-width':2.5,...(dash?{'stroke-dasharray':'6 4'}:{})},g);
  }
  function point(x,y,label='',color=C[0],open=false) {
    node('circle',{cx:X(x),cy:Y(y),r:5,fill:open?'white':color,stroke:color,'stroke-width':2},g);
    if(label)node('text',{x:Math.max(l+4,Math.min(r-4,X(x))),y:Math.max(t+15,Math.min(b-7,Y(y)-12)),'text-anchor':X(x)>(l+r)/2?'end':'start',fill:color,'font-size':12},svg,label);
  }
  function arrow(x,y,color,label){line(0,0,x,y,color);const px=X(x),py=Y(y),angle=Math.atan2(py-Y(0),px-X(0));if(x||y)node('path',{d:`M${px-10*Math.cos(angle-.4)},${py-10*Math.sin(angle-.4)}L${px},${py}L${px-10*Math.cos(angle+.4)},${py-10*Math.sin(angle+.4)}`,fill:'none',stroke:color,'stroke-width':2},g);point(x,y,label,color);}
  return {line,path,point,arrow,shade:(lo,hi)=>node('rect',{x:X(lo),y:t,width:X(hi)-X(lo),height:b-t,fill:'#356bd7',opacity:.07},g),circle:()=>node('ellipse',{cx:X(0),cy:Y(0),rx:X(1)-X(0),ry:Y(0)-Y(1),fill:'none',stroke:C[2],'stroke-width':2},g)};
}
function legend(items) {
  $('legend').replaceChildren();
  items.forEach(([label,color])=>{const span=document.createElement('span'),i=document.createElement('i');i.style.background=color;span.append(i,document.createTextNode(label));$('legend').append(span);});
}
function draw(){
  if(!current)return;
  const v=values, id=current.id, svg=$('plot');svg.replaceChildren();
  svg.setAttribute('viewBox',`0 0 ${width} ${id==='circle'?565:328}`);
  node('title',{},svg,current.title);node('desc',{},svg,current.description);
  let f='', result='', labels=[['函数图像',C[0]]];
  const signed=n=>n<0?`− ${fmt(-n)}`:`+ ${fmt(n)}`;
  if(id==='quadratic'||id==='transform'){
    const base=v.base==='abs'?Math.abs:v.base==='sin'?Math.sin:x=>x*x;
    const p=chart(-5,5,-5,8);if(id==='transform')p.path(base,'#8b99af',true);
    p.path(x=>v.a*base(x-v.h)+v.k);p.point(v.h,v.k,'',C[0]);
    f=id==='quadratic'?`y = ${fmt(v.a)}(x ${signed(-v.h)})² ${signed(v.k)}`:`y = ${fmt(v.a)} f(x ${signed(-v.h)}) ${signed(v.k)}`;
    result=v.a===0?`a = 0，图像退化为常数 y = ${fmt(v.k)}。`:id==='quadratic'?`顶点 (${fmt(v.h)}, ${fmt(v.k)})；对称轴 x = ${fmt(v.h)}；开口向${v.a>0?'上':'下'}。`:`水平位移 ${fmt(v.h)}，竖直位移 ${fmt(v.k)}；竖直缩放倍数 ${fmt(Math.abs(v.a))}${v.a<0?'，并关于横轴翻折':''}。`;
    if(id==='transform') labels=[['变换后',C[0]],['原函数（虚线）','#8b99af']];
  }else if(id==='monotonic'){
    const fun=x=>(x-v.h)**2+v.k,x2=v.x1+v.gap,y1=fun(v.x1),y2=fun(x2),p=chart(-5,5,-5,Math.max(8,y1+2,y2+2));
    p.path(fun);p.point(v.x1,y1,'P');p.point(x2,y2,'Q',C[1]);p.point(v.h,v.k,'最小值',C[2]);
    f=`y = (x ${signed(-v.h)})² ${signed(v.k)}`;result=`x₁ = ${fmt(v.x1)}，x₂ = ${fmt(x2)}；f(x₁) = ${fmt(y1)}，f(x₂) = ${fmt(y2)}。最小值 ${fmt(v.k)} 在 x = ${fmt(v.h)} 处取得。`;
  }else if(id==='parity'){
    const fun=v.base==='even'?x=>x*x:v.base==='odd'?x=>x*x*x/4:x=>x*x+x,p=chart(-3,3,-6,10);
    p.path(fun);p.point(v.x,fun(v.x),'P');p.point(-v.x,fun(-v.x),'P′',C[1]);p.line(v.x,fun(v.x),-v.x,fun(-v.x),'#8b99af',true);
    f='y = '+(v.base==='even'?'x²':v.base==='odd'?'x³ / 4':'x² + x');result=`f(x) = ${fmt(fun(v.x))}；f(−x) = ${fmt(fun(-v.x))}。${v.base==='even'?'关于纵轴对称。':v.base==='odd'?'关于原点对称。':'这个函数非奇非偶，即使个别点满足等式。'}`;
  }else if(id==='exponential'){
    const a=Number(v.a),y=a**v.x,extent=Math.max(5,y+0.8),p=chart(-2,extent,-2,extent,{equal:true});
    p.path(x=>a**x);p.path(x=>x>0?Math.log(x)/Math.log(a):NaN,C[1],false,0.002,extent);p.path(x=>x,'#8b99af',true);
    p.point(v.x,y,'P');p.point(y,v.x,'P′',C[1]);f=`y = ${a}ˣ　与　y = log${a}(x)`;result=`(${fmt(v.x)}, ${fmt(y)}) ↔ (${fmt(y)}, ${fmt(v.x)})；两函数均${a>1?'递增':'递减'}。`;
    labels=[['指数函数',C[0]],['对数函数',C[1]],['y = x（虚线）','#8b99af']];
  }else if(id==='roots'){
    const p=chart(-3,5,-4,8);p.path(x=>x*x-2*x);p.path(()=>v.m,C[1]);
    f=`x² − 2x = ${fmt(v.m)}`;
    if(v.m<-1-1e-8)result='0 个实数解：水平线在抛物线最低点下方。';else if(Math.abs(v.m+1)<1e-8){p.point(1,-1);result='1 个实数解：x = 1（重根）。';}else{const d=Math.sqrt(v.m+1);p.point(1-d,v.m);p.point(1+d,v.m);result=`2 个实数解：x = ${fmt(1-d)} 或 x = ${fmt(1+d)}。`;}
    labels=[['y = x² − 2x',C[0]],['y = m',C[1]]];
  }else if(id==='inequality'){
    const a=Number(v.a),p=chart(-5,5,-8,8),outside=(a>0)===(v.sign==='positive');
    if(outside){p.shade(-5,v.r1);p.shade(v.r2,5);}else p.shade(v.r1,v.r2);
    p.path(x=>a*(x-v.r1)*(x-v.r2));
    if(outside){p.line(-5,0,v.r1,0,C[1]);p.line(v.r2,0,5,0,C[1]);}else p.line(v.r1,0,v.r2,0,C[1]);
    p.point(v.r1,0,'',C[1],true);p.point(v.r2,0,'',C[1],true);
    f=`${a===1?'':'−'}(x ${signed(-v.r1)})(x ${signed(-v.r2)}) ${v.sign==='positive'?'>':'<'} 0`;
    result=`解集：${outside?`(−∞, ${fmt(v.r1)}) ∪ (${fmt(v.r2)}, +∞)`:`(${fmt(v.r1)}, ${fmt(v.r2)})`}；空心端点不包含在内。`;
    labels=[['函数',C[0]],['解集（数轴线段与高亮带）',C[1]]];
  }else if(id==='circle'){
    const angle=v.theta*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),p=chart(-1.5,1.5,-1.5,1.5,{equal:true,height:285,xlabel:'x = cos θ',ylabel:'y = sin θ'});
    p.circle();p.line(0,0,c,s);p.line(c,0,c,s,C[1],true);p.line(0,s,c,s,C[0],true);p.point(c,s,'P');
    const q=chart(0,4*Math.PI,-1.25,1.25,{top:312,height:235,xlabel:'θ（弧度）',ylabel:'函数值'});q.path(Math.sin,C[0]);q.path(Math.cos,C[1]);q.line(angle,-1.25,angle,1.25,'#8b99af',true);q.point(angle,s);q.point(angle,c,'',C[1]);
    f=`θ = ${v.theta}° = ${fmt(angle)} rad`;result=`P = (${fmt(c)}, ${fmt(s)})；cos θ = ${fmt(c)}，sin θ = ${fmt(s)}。`;labels=[['sin θ',C[0]],['cos θ',C[1]],['单位圆',C[2]]];
  }else if(id==='trig'){
    const p=chart(0,4*Math.PI,-3.3,3.3,{xlabel:'x（弧度）'});
    if(v.visible!=='cos')p.path(x=>v.a*Math.sin(v.w*x+v.p));if(v.visible!=='sin')p.path(x=>v.a*Math.cos(v.w*x+v.p),C[1]);
    f=`y = ${fmt(v.a)} sin(${fmt(v.w)}x ${signed(v.p)}) / cos(${fmt(v.w)}x ${signed(v.p)})`;
    result=v.a===0?'A = 0：两条曲线都变为 y = 0，没有最小正周期。':`振幅 ${fmt(v.a)}；周期 T = 2π/ω ≈ ${fmt(2*Math.PI/v.w)}；水平位移 −φ/ω ≈ ${fmt(-v.p/v.w)}。`;
    labels=v.visible==='sin'?[['正弦',C[0]]]:v.visible==='cos'?[['余弦',C[1]]]:[['正弦',C[0]],['余弦',C[1]]];
  }else if(id==='vectors'){
    const {ax,ay,bx,by}=v,p=chart(-7,7,-7,7,{equal:true}),dot=ax*bx+ay*by,na=Math.hypot(ax,ay),nb=Math.hypot(bx,by);
    p.line(ax,ay,ax+bx,ay+by,'#8b99af',true);p.line(bx,by,ax+bx,ay+by,'#8b99af',true);
    p.arrow(ax+bx,ay+by,C[2],'a+b');p.arrow(ax,ay,C[0],'a');p.arrow(bx,by,C[1],'b');
    if(na>0){const t=dot/(na*na);p.line(bx,by,t*ax,t*ay,'#8b99af',true);p.point(t*ax,t*ay,'',C[2],true);}
    f=`a = (${fmt(ax)}, ${fmt(ay)})，b = (${fmt(bx)}, ${fmt(by)})`;
    result=`a·b = ${fmt(dot)}；a+b = (${fmt(ax+bx)}, ${fmt(ay+by)})；${na*nb>0?`夹角 θ ≈ ${fmt(Math.acos(Math.max(-1,Math.min(1,dot/(na*nb))))*180/Math.PI)}°。`:'存在零向量，夹角未定义。'}`;
    labels=[['a',C[0]],['b',C[1]],['a + b',C[2]]];
  }
  $('formula').textContent=f;$('result').textContent=result;legend(labels);
}
function activate(id,updateHash=true){
  current=experiments.find(e=>e.id===id)||experiments[0];values={};
  $('experiment-title').textContent=current.title;$('topic').textContent=current.topic;$('experiment-description').textContent=current.description;$('question').textContent=current.question;$('explanation').textContent=current.explanation;root.querySelector('details').open=false;
  $('experiment-list').querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.id===current.id)));
  $('controls').replaceChildren();
  current.controls.forEach(c=>{
    values[c.key]=c.value;const label=document.createElement('label'),title=document.createElement('span');title.className='control-title';title.textContent=c.label;label.append(title);
    const input=document.createElement(c.options?'select':'input');input.id='control-'+c.key;label.htmlFor=input.id;
    let output;
    if(c.options)c.options.forEach(([val,text])=>{const option=document.createElement('option');option.value=val;option.textContent=text;input.append(option);});
    else {input.type='range';input.min=c.min;input.max=c.max;input.step=c.step;output=document.createElement('output');output.htmlFor=input.id;output.textContent=fmt(c.value);title.append(output);}
    input.value=c.value;input.addEventListener('input',()=>{values[c.key]=c.options?input.value:Number(input.value);if(output)output.textContent=fmt(values[c.key]);draw();});
    label.append(input);$('controls').append(label);
  });
  if(updateHash)history.replaceState(null,'','#'+current.id);draw();
}
experiments.forEach((e,i)=>{const b=document.createElement('button');b.type='button';b.dataset.id=e.id;const n=document.createElement('span');n.className='number';n.textContent=String(i+1).padStart(2,'0');b.append(n,document.createTextNode(e.title));b.addEventListener('click',()=>activate(e.id));$('experiment-list').append(b);});
$('reset').addEventListener('click',()=>activate(current.id));
width=Math.max(240,$('plot').parentElement.clientWidth);
activate(location.hash.slice(1),false);
window.addEventListener('hashchange',()=>activate(location.hash.slice(1),false));
new ResizeObserver(entries=>{width=Math.max(240,entries[0].contentRect.width);draw();}).observe($('plot').parentElement);
