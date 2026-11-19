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
  const status=button.closest('[aria-live]')?.querySelector('.status')||button.parentElement.querySelector('.status');
  if(status)status.textContent='Download requested. Your document is a Markdown file.';
}
document.querySelector('#download-survey')?.addEventListener('click',event=>{
  event.preventDefault();
  const content=JSON.parse(document.querySelector('#survey-document').textContent);
  download('mastersori-day-one-survey.md',content,event.currentTarget);
});
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
function renderLaunch(){
  const data=new FormData(launchForm);
  const keys=['listening','governance','leadership','environment'];
  const unresolved=keys.findIndex(key=>data.get(key)!=='yes');
  const track=launchTracks[unresolved===-1?4:unresolved];
  const name=String(data.get('organization')||'Your organization').trim()||'Your organization';
  const labels=['Listening across the organization','Usable guardrails','Department-head support and direction','First-session environment'];
  const text=`# Mastersori launch map\n\n## ${name}\n\n${track.title}\n\n## Your stated starting conditions\n\n${keys.map((key,i)=>`- ${labels[i]}: ${data.get(key)==='yes'?'Ready / completed':'Not yet / mixed / unclear'}`).join('\n')}\n\n## Three next actions\n\n${track.actions.map(([heading,body],i)=>`${i+1}. ${heading} ${body}`).join('\n\n')}\n\n## Evidence to look for\n\n${track.evidence}\n\n## Limits\n\nThis is a rules-based starter map assembled from your choices, not an AI-generated assessment or an adoption score. Start with the earliest unresolved condition, then revisit the remaining preparation. It does not replace the full method.\n\nBy Kathleen Bartin · Prodigal Paradigm LLC · Mastersori first edition\n`;
  const panel=document.querySelector('#launch-result');
  panel.innerHTML=`<p class="eyebrow">Your launch map</p><p class="small muted">${escapeHTML(name)}</p><h3>${track.title}</h3><ol>${track.actions.map(([heading,body])=>`<li><strong>${heading}</strong><br>${body}</li>`).join('')}</ol><p class="small"><strong>Evidence to look for</strong><br>${track.evidence}</p><button class="outline-button" id="download-map" type="button">Download the map ↓</button><p class="status" role="status"></p><p class="small muted">Start here, then revisit the remaining preparation. A rules-based worksheet, not an AI assessment.</p>`;
  panel.dataset.rendered='true';
  document.querySelector('#download-map').addEventListener('click',()=>{
    const fresh=renderLaunch();
    download('mastersori-launch-map.md',fresh.text,document.querySelector('#download-map'));
  });
  return {text,panel};
}
launchForm?.addEventListener('submit',event=>{event.preventDefault();scrollToPanel(renderLaunch().panel);});
const later=fn=>{let t;return()=>{clearTimeout(t);t=setTimeout(fn,350);};};
const refreshLaunch=later(()=>{if(document.querySelector('#launch-result')?.dataset.rendered)renderLaunch();});
launchForm?.addEventListener('input',refreshLaunch);
launchForm?.addEventListener('change',refreshLaunch);
const storyForm=document.querySelector('#story-form');
function renderStory(){
  const data=new FormData(storyForm);
  const title=String(data.get('title')||'Untitled moonshot').trim()||'Untitled moonshot';
  const sections=[['beginning','The beginning'],['middle','The middle'],['end','The end'],['test','The reader test']];
  const content=sections.map(([key,label])=>`## ${label}\n\n${String(data.get(key)||'').trim()||'[Open question: this part of the story still needs to be written.]'}`).join('\n\n');
  const text=`# ${title}\n\nMastersori moonshot story-spec · Working draft\n\n${content}\n\n## Before you build\n\nAsk a person who does not know the story to read it. Can they reach the same outcome? Add missing steps, human review points, data boundaries, and exceptions. Test on a small, safe example. This worksheet formats your words; it does not validate the plan or call an AI model.\n\nBy Kathleen Bartin · Prodigal Paradigm LLC · First edition\n`;
  const panel=document.querySelector('#story-result');
  panel.innerHTML=`<p class="eyebrow">Your working story-spec</p><h3>${escapeHTML(title)}</h3><div class="worksheet-preview">${sections.map(([key,label])=>`<strong>${label}</strong>\n${escapeHTML(String(data.get(key)||'').trim()||'[Open question: not yet written.]')}`).join('\n\n')}</div><div class="actions"><button class="outline-button" id="download-story" type="button">Download the story ↓</button></div><p class="status" role="status"></p><p class="small muted">Your words, formatted. No feasibility check or AI review has been performed.</p>`;
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
