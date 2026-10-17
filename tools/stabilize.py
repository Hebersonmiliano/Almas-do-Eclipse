from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
p = root / 'Vampire_Survivors_Jogo.html'
s = p.read_text(encoding='utf-8-sig')
assert 'window.gamePersistence' not in s, 'Correções já aplicadas'
s = s.replace('<script>', '<script src="src/save.js"></script>\n<script>', 1)
start = s.index("let meta=JSON.parse(localStorage.getItem('vs10')")
end = s.index('const items=', start)
s = s[:start] + '''window.gamePersistence=GameSave.create(localStorage,(message,error)=>{
 console.warn(message,error);
 let box=document.getElementById('saveWarning');
 if(!box){box=document.createElement('div');box.id='saveWarning';box.style='position:fixed;bottom:5px;left:5px;z-index:100000;background:#781e1e;color:white;padding:10px';document.body.appendChild(box)}
 box.textContent=message;
});
let meta=window.gamePersistence.data;
function save(){window.gamePersistence.persist();info();window.refreshMetaHud?.()}
function info(){shopInfo.textContent=`Ouro ${meta.gold} | HP ${meta.hp} | Dano ${meta.dmg} | Vel ${meta.speed} | Sorte ${meta.luck} | XP ${meta.xp}`;const mg=document.getElementById('menuGold');if(mg)mg.textContent='Ouro: '+meta.gold}info();
''' + s[end:]
s = s.replace("(localStorage.getItem('gold')||0)", 'meta.gold')
s = s.replace('const save = JSON.parse(localStorage.getItem("metaProgression") || "{}");', 'const save = window.gamePersistence.data;')
s = s.replace('localStorage.setItem("metaProgression", JSON.stringify(save));', 'window.gamePersistence.persist(); info();')
s = s.replace('    renderMetaHud();\n\n    //', '    window.refreshMetaHud = renderMetaHud;\n    renderMetaHud();\n\n    //', 1)
s = s.replace('player.critChance = (player.critChance || 0.05)\n            + (save.upgrades.crit * 0.03);', 'player.crit += save.upgrades.crit * 0.03;')
s = s.replace('    setTimeout(applyMetaUpgrades, 1000);', '    window.applyMetaUpgrades = applyMetaUpgrades;')
s = s.replace('        applyMetaUpgrades();\n\n        console.log("Upgrade comprado:', '        // As melhorias compradas entram em vigor na próxima partida.\n\n        console.log("Upgrade comprado:')
s = s.replace('applyClass(cls);', 'applyClass(cls);\nwindow.applyMetaUpgrades?.();\nwindow.metaRewardGiven=false;', 1)
s = s.replace('window.goldRun || 0', 'goldRun || 0').replace('window.kills || 0','kills || 0').replace('window.wave || 1','wave || 1')
# O ouro da partida já é creditado por end(). Evita uma segunda recompensa em ouro.
s = s.replace('save.gold += Math.floor((goldRun || 0) * 0.35);', '// Ouro creditado uma única vez em end().')
start = s.index('    setInterval(()=>{', s.index('// DETECTAR MORTE'))
end = s.index('    },300);', start) + len('    },300);')
s = s[:start] + '''    window.finishMetaRun = function(){
        if(window.metaRewardGiven) return;
        window.metaRewardGiven=true;
        gainMetaResources();
        showMetaRewardPopup();
    };''' + s[end:]
s = s.replace("function end(win){state='end';", "function end(win){if(state==='end')return;state='end';player.electricShield=false;window.finishMetaRun?.();")
s = s.replace('window.startGame=cls=>{\ntry{', "window.startGame=cls=>{\nif(state!=='menu')return;\ntry{")
# Remove os dois contadores concorrentes e a segunda coleta de gemas.
s, count = re.subn(r'    setInterval\(\(\)=>\{\s*if\(typeof player === "undefined"\) return;\s*if\(player.tempMagnetTimer > 0\)\{.*?    \},16\);', '    // Duração controlada pelo delta time do loop principal.', s, flags=re.S)
assert count == 2, count
start = s.index('    setInterval(()=>{', s.index('// ATRAÇÃO REAL DAS GEMS'))
end = s.index('    },16);',start)+len('    },16);')
s = s[:start] + '    // Atração e XP centralizados em collectGems(dt).' + s[end:]
s = s.replace('player.tempMagnetTimer = 600;', 'player.tempMagnetTimer = 10;').replace('player.superMagnetTimer = 600;', 'player.superMagnetTimer = 10;')
s = s.replace('player.baseMagnet = 140;', 'player.baseMagnet = player.magnet || 130;')
s = s.replace('p.electricShieldEnd = Date.now() + duration;', 'p.electricShieldRemaining = duration / 1000;')
start = s.index('    setInterval(()=>{',s.index('// TIMER',s.index('window.activateElectricShield')))
end = s.index('    },100);',start)+len('    },100);')
s = s[:start] + '    // Duração do escudo controlada pelo loop principal.' + s[end:]
start = s.index('    const knownBosses = new WeakSet();')
end = s.index('    // ============================================================',start)
s = s[:start] + '    window.onBossDefeated = activateBossMagnet10s;\n\n' + s[end:]
s = s.replace("if(e.boss){chests.push", "if(e.boss){window.onBossDefeated?.(e.x,e.y);chests.push", 1)
# Callbacks de combate respeitam pausa, menus e fim da partida.
start=s.index('   META PROGRESSÃO')
end=s.index('/* PATCH: remover Shield Power residual */')
part=s[start:end]
part=part.replace('setInterval(()=>{','setInterval(()=>{\n        if(state!=="play" || paused) return;')
s=s[:start]+part+s[end:]
# Remover apenas o elemento que contém diretamente o rótulo, nunca um painel ancestral.
s=s.replace('const txt=(el.innerText||"").toLowerCase();','const txt=Array.from(el.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent).join(" ").toLowerCase();')
collect='for(const g of gems){let d=Math.hypot(g.x-player.x,g.y-player.y);if(d<player.magnet){g.x+=(player.x-g.x)*dt*7;g.y+=(player.y-g.y)*dt*7}if(d<player.r+g.r+6){g.dead=true;addXp(g.xp)}}'
assert collect in s
s=s.replace(collect,'collectGems(dt);')
s=s.replace('function update(dt){limitFX();','''function collectGems(dt){
 for(const g of gems){
  if(g.dead)continue;
  let d=Math.hypot(g.x-player.x,g.y-player.y);
  if(d<player.magnet){const factor=Math.min(1,dt*7);g.x+=(player.x-g.x)*factor;g.y+=(player.y-g.y)*factor}
  if(Math.hypot(g.x-player.x,g.y-player.y)<player.r+g.r+6){g.dead=true;addXp(g.xp)}
 }
}
function updatePowers(dt){
 if(player.tempMagnetTimer>0){player.tempMagnetTimer=Math.max(0,player.tempMagnetTimer-dt);if(!player.tempMagnetTimer){player.magnet=player.baseMagnet||130;player.superMagnetTimer=0}}
 if(player.electricShield){player.electricShieldRemaining=Math.max(0,(player.electricShieldRemaining||0)-dt);if(!player.electricShieldRemaining){player.electricShield=false;['electricShieldAura','electricShieldCore'].forEach(id=>document.getElementById(id)?.remove())}}
}
function update(dt){updatePowers(dt);limitFX();''')
p.write_text(s,encoding='utf-8')
print('Correções aplicadas em', p)
