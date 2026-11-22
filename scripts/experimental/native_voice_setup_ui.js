'use strict';
document.querySelector('form').onsubmit=async event=>{event.preventDefault();const input=document.getElementById('key'),button=document.querySelector('button'),status=document.getElementById('status');
    button.disabled=true;let key=input.value.trim();input.value='';
    try{const ok=await window.voiceSetup.save(key);status.textContent=ok?'Saved. Close this window, then restart the game.':'Could not save. Check the key and try again.';if(ok)input.disabled=true;else button.disabled=false;}
    catch(_){status.textContent='Could not save. Please try again.';button.disabled=false;}finally{key='';}
};
