document.documentElement.classList.add('js');
const menu = document.querySelector('.menu-button');
const nav = document.querySelector('#main-nav');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.textContent = open ? 'Close' : 'Menu';
  nav.classList.toggle('is-open', open);
});
document.addEventListener('keydown', event => {
  if(event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true'){
    menu.click(); menu.focus();
  }
});
const stages = [...document.querySelectorAll('.stage')];
const expandButton = document.querySelector('#expand-stages');
const updateExpand=()=>{if(expandButton)expandButton.textContent=stages.every(s=>s.open)?'Collapse all steps':'Expand all steps'};
expandButton?.addEventListener('click',()=>{
  const shouldOpen = !stages.every(s=>s.open);
  stages.forEach(s=>s.open=shouldOpen);updateExpand();
});
stages.forEach(s=>s.addEventListener('toggle',updateExpand));
function openHash(){
  const id=location.hash.slice(1);
  const target=document.getElementById(id);
  if(target?.classList.contains('stage'))target.open=true;
}
window.addEventListener('hashchange',openHash);openHash();
const contentsDisclosure=document.querySelector('.contents-disclosure');
if(contentsDisclosure&&matchMedia('(max-width:640px)').matches){
  /* On a phone the contents list starts closed. Closing it moves everything below, so a jump is made only after the list has closed. */
  const land=id=>{
    const target=document.getElementById(id);
    if(!target)return;
    if(target.classList.contains('stage'))target.open=true;
    requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant',block:'start'}));
  };
  contentsDisclosure.open=false;
  contentsDisclosure.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link)return;
    event.preventDefault();
    const id=link.getAttribute('href').slice(1);
    contentsDisclosure.open=false;
    history.pushState(null,'','#'+id);
    land(id);
  });
  if(location.hash){
    const id=location.hash.slice(1);
    land(id);
    window.addEventListener('load',()=>land(id),{once:true});
  }
}
const tabs=[...document.querySelectorAll('[data-tab]')];
function selectTab(tab){
  tabs.forEach(t=>{
    const selected=t===tab;
    t.setAttribute('aria-selected',String(selected));
    t.tabIndex=selected?0:-1;
    document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;
  });
}
tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>selectTab(tab));
  tab.addEventListener('keydown',e=>{
    let index;
    if(e.key==='ArrowRight')index=(i+1)%tabs.length;
    if(e.key==='ArrowLeft')index=(i-1+tabs.length)%tabs.length;
    if(e.key==='Home')index=0;
    if(e.key==='End')index=tabs.length-1;
    if(index!==undefined){e.preventDefault();selectTab(tabs[index]);tabs[index].focus();}
  });
});
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function download(name,content,button){
  const blob=new Blob([content],{type:'text/markdown;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
  const status=button.parentElement.querySelector('.status')||button.closest('[aria-live]')?.querySelector('.status');
  if(status)status.textContent='Download requested. Your document is a Markdown file.';
}
const surveyText=()=>JSON.parse(document.querySelector('#survey-document').textContent);
document.querySelectorAll('.download-survey').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  download('mastersori-day-one-survey.md',surveyText(),event.currentTarget);
}));
document.querySelectorAll('.copy-survey').forEach(button=>button.addEventListener('click',async()=>{
  const status=button.parentElement.querySelector('.status');
  try{await navigator.clipboard.writeText(surveyText());if(status)status.textContent='Copied.';}
  catch(error){if(status)status.textContent='Copy did not work here. Use the download instead.';}
}));
const sourceURL=(document.querySelector('link[rel="canonical"]')?.href)||location.href.split(/[?#]/)[0];
const field=id=>String(document.getElementById(id)?.value||'');
const launchTracks=[
 {title:'Start by listening.',actions:[
 ['Send the day-one survey.','Use ten questions or fewer. Close with the project each person wishes they could attempt.'],
 ['Meet the department heads.','Ask the same questions face to face. Listen before making the case for AI.'],
 ['Make the two maps.','Compare individual and departmental readiness. Log the mismatches without turning them into confrontations.']],
 evidence:'A people map and a department map, with valid concerns and possible first projects recorded.'},
 {title:'Make the guardrails usable.',actions:[
 ['Resolve the data question.','Agree what may go into the approved platform, what must stay out, and who approves exceptions.'],
 ['Write the responsibility down.','Define external-output review, human oversight, and an acceptable-use policy people can explain.'],
 ['Put the direction on a timeline.','Name the desired outcomes now, in a quarter, in a year, and in five years.']],
 evidence:'An understood acceptable-use policy and a timeline with responsible owners, not just documents filed away.'},
 {title:'Win the heads before the room.',actions:[
 ['Ask what is behind the resistance.','Make it a conversation. Listen to the concern without treating it as a debate to win.'],
 ['Show a recognizable possibility.','Use a task the department cares about. Make the benefit concrete without promising job security.'],
 ['Name the shared direction.','After listening and demonstrating, agree how the head will support the team and its timeline.']],
 evidence:'Department heads who can explain both the boundaries and their own role in supporting the work.'},
 {title:'Prepare the first session.',actions:[
 ['Standardize the approved environment.','Confirm software, permissions, settings, and sufficient usage capacity. Resolve memory and retention with the governance owner.'],
 ['Test the real connections.','Check access to approved mail and calendar data. Keep send and change actions behind human approval.'],
 ['Rehearse one useful first build.','Prepare My EA, or a policy-compatible alternative, and leave time to troubleshoot in the session.']],
 evidence:'A tested environment where everyone can make an artifact without spending the session debugging access.'},
 {title:'Make something real.',actions:[
 ['Run the first hands-on build.','Open a project, add a chat, test approved connectors, and make a useful artifact from real work. Review it together.'],
 ['Return to the moonshot.','Bring back the last survey question. Write the beginning, middle, and end on paper before prompting.'],
 ['Set the human check-in cadence.','Agree what evidence can be collected, who reviews it, and how roadblocks get help.']],
 evidence:'A first artifact the person can use, a story-spec to iterate, and a date for the next check-in.'}
];
const scrollToPanel=panel=>panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
/* Each worksheet is rebuilt from the form as it stands now: when the preview is made, whenever a field changes afterward, and again at the moment of download. A download can never be older than the form. */
const launchForm=document.querySelector('#launch-form');
const conditions=[
 {id:'listening',label:'Listening across the organization',owner:'the sponsor',question:'Has anyone surveyed the staff or sat down with the department heads about AI yet, and where are the results?'},
 {id:'governance',label:'Usable guardrails',owner:'whoever owns data and compliance',question:'What may go into the approved AI platform, what must stay out, and is there an acceptable-use policy people can explain?'},
 {id:'leadership',label:'Department-head support and direction',owner:'the sponsor',question:'Which department heads are behind this, which are not, and is there a shared timeline?'},
 {id:'environment',label:'First-session environment',owner:'IT',question:'Are the approved tools installed, are the connections tested, and does everyone have enough usage capacity for a first session?'}
];
const stateLabel={yes:'Ready / completed',no:'Not yet / mixed / unclear',unknown:'Not known yet - a question to take to the owner'};
function renderLaunch(){
  const formStatus=launchForm.querySelector('.form-status');
  const answers=conditions.map(c=>({...c,state:field(c.id)}));
  const unanswered=answers.filter(a=>!a.state);
  if(unanswered.length){
    if(formStatus)formStatus.textContent=`Choose an answer for: ${unanswered.map(a=>a.label.toLowerCase()).join('; ')}. “I don’t know” is an answer.`;
    return null;
  }
  if(formStatus)formStatus.textContent='';
  const unknowns=answers.filter(a=>a.state==='unknown');
  const firstNo=answers.findIndex(a=>a.state==='no');
  const track=firstNo!==-1?launchTracks[firstNo]:(unknowns.length?null:launchTracks[4]);
  const title=track?track.title:'Ask before you start.';
  const name=field('organization').trim()||'Your organization';
  const asks=unknowns.map(a=>[`Ask ${a.owner}.`,a.question]);
  const askText=asks.length?`## Questions to ask first\n\nYou answered “I don’t know” to ${asks.length===1?'one condition':'some conditions'}. That is not recorded as “not yet”. It is a question for the person who owns the answer.\n\n${unknowns.map(a=>`- ${a.label}: ask ${a.owner}. ${a.question}`).join('\n')}\n\n`:'';
  const actionText=track?`## Three next actions\n\n${track.actions.map(([heading,body],i)=>`${i+1}. ${heading} ${body}`).join('\n\n')}\n\n## Evidence to look for\n\n${track.evidence}\n\n`:'';
  const text=`# Mastersori launch map\n\n## ${name}\n\n${title}\n\n## Your stated starting conditions\n\n${answers.map(a=>`- ${a.label}: ${stateLabel[a.state]}`).join('\n')}\n\n${askText}${actionText}## Limits\n\nThis is a rules-based starter map assembled from your choices, not an AI-generated assessment or an adoption score. Start with the earliest unresolved condition, then revisit the remaining preparation. It does not replace the full method.\n\nBy Kathleen Bartin · Prodigal Paradigm LLC · Mastersori first edition\nSource: ${sourceURL}\n`;
  const panel=document.querySelector('#launch-result');
  const askHTML=asks.length?`<p class="small"><strong>Questions to ask first</strong><br>“I don’t know” is not recorded as “not yet”. It goes to the person who owns the answer.</p><ol>${asks.map(([heading,body])=>`<li><strong>${heading}</strong><br>${body}</li>`).join('')}</ol>`:'';
  const actionHTML=track?`${asks.length?'<p class="small"><strong>Meanwhile, three next actions</strong></p>':''}<ol>${track.actions.map(([heading,body])=>`<li><strong>${heading}</strong><br>${body}</li>`).join('')}</ol><p class="small"><strong>Evidence to look for</strong><br>${track.evidence}</p>`:'';
  panel.innerHTML=`<p class="eyebrow">Your launch map</p><p class="small muted">${escapeHTML(name)}</p><h3>${title}</h3>${askHTML}${actionHTML}<button class="outline-button" id="download-map" type="button">Download the map ↓</button><p class="status" role="status"></p><p class="small muted">Start here, then revisit the remaining preparation. A rules-based worksheet, not an AI assessment.</p>`;
  panel.dataset.rendered='true';
  document.querySelector('#download-map').addEventListener('click',()=>{
    const fresh=renderLaunch();
    if(fresh)download('mastersori-launch-map.md',fresh.text,document.querySelector('#download-map'));
  });
  return {text,panel};
}
launchForm?.addEventListener('submit',event=>{event.preventDefault();const made=renderLaunch();if(made)scrollToPanel(made.panel);});
const later=fn=>{let t;return()=>{clearTimeout(t);t=setTimeout(fn,350);};};
const refreshLaunch=later(()=>{if(document.querySelector('#launch-result')?.dataset.rendered)renderLaunch();});
launchForm?.addEventListener('input',refreshLaunch);
launchForm?.addEventListener('change',refreshLaunch);
const storyForm=document.querySelector('#story-form');
function renderStory(){
  const title=field('story-title').trim()||'Untitled moonshot';
  const sections=[['beginning','The beginning'],['middle','The middle'],['end','The end'],['test','The reader test']];
  const part=key=>field('story-'+key).trim();
  const content=sections.map(([key,label])=>`## ${label}\n\n${part(key)||'[Open question: this part of the story still needs to be written.]'}`).join('\n\n');
  const text=`# ${title}\n\nMastersori moonshot story-spec · Working draft\n\n${content}\n\n## Before you build\n\nAsk a person who does not know the story to read it. Can they reach the same outcome? Add missing steps, human review points, data boundaries, and exceptions. Test on a small, safe example. This worksheet formats your words; it does not validate the plan or call an AI model.\n\nBy Kathleen Bartin · Prodigal Paradigm LLC · First edition\nSource: ${sourceURL}\n`;
  const panel=document.querySelector('#story-result');
  panel.innerHTML=`<p class="eyebrow">Your working story-spec</p><h3>${escapeHTML(title)}</h3><div class="worksheet-preview">${sections.map(([key,label])=>`<strong>${label}</strong>\n${escapeHTML(part(key)||'[Open question: not yet written.]')}`).join('\n\n')}</div><div class="actions"><button class="outline-button" id="download-story" type="button">Download the story ↓</button></div><p class="status" role="status"></p><p class="small muted">Your words, formatted. No feasibility check or AI review has been performed.</p>`;
  panel.dataset.rendered='true';
  document.querySelector('#download-story').addEventListener('click',()=>{
    const fresh=renderStory();
    download('mastersori-moonshot-story.md',fresh.text,document.querySelector('#download-story'));
  });
  return {text,panel};
}
storyForm?.addEventListener('submit',event=>{event.preventDefault();scrollToPanel(renderStory().panel);});
const refreshStory=later(()=>{if(document.querySelector('#story-result')?.dataset.rendered)renderStory();});
storyForm?.addEventListener('input',refreshStory);
storyForm?.addEventListener('change',refreshStory);
/* Last line of the file on purpose: the worksheets switch on only once every handler above is attached. */
document.querySelectorAll('fieldset.needs-script').forEach(set=>{set.disabled=false;});
document.documentElement.classList.add('js-ready');
