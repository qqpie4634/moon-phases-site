(() => {
  const observe=document.getElementById('observe'), quiz=document.getElementById('quiz');
  const a=document.getElementById('observeMode'),b=document.getElementById('quizMode');
  function mode(isQuiz){observe.hidden=isQuiz;quiz.hidden=!isQuiz;a.setAttribute('aria-pressed',String(!isQuiz));b.setAttribute('aria-pressed',String(isQuiz));if(isQuiz && document.getElementById('skyPlay').textContent.includes('暫停'))document.getElementById('skyPlay').click();}
  a.onclick=()=>mode(false);b.onclick=()=>mode(true);
  document.querySelector('a[href="#quiz"]').onclick=()=>mode(true);
  document.getElementById('showModel').addEventListener('click',()=>{mode(false);observe.scrollIntoView({block:'start',behavior:'smooth'});});
  mode(location.hash==='#quiz');
  window.addEventListener('hashchange',()=>mode(location.hash==='#quiz'));
})();
