from pathlib import Path
root=Path('.')
def replace(path,old,new):
 p=root/path;s=p.read_text();assert old in s,(path,old);p.write_text(s.replace(old,new))
replace('index.html','narrative-20261016-r11','visibility-20261016-r12')
replace('index.html','  <link rel="stylesheet" href="/assets/showcase/narrative.css">','  <link rel="stylesheet" href="/assets/showcase/narrative.css">\n  <link rel="stylesheet" href="/assets/showcase/selected-visibility.css">')
replace('index.html','<article class="es-context" data-editorial-context>','<article class="es-context" data-editorial-context hidden inert aria-hidden="true">')
replace('index.html','<div id="experiencias" class="digital-anchor" aria-hidden="true"></div>','<!-- Digital navigation now leads to the retained Casa Costa scroll composition. -->\n<div id="sistemas" class="digital-anchor" aria-hidden="true"></div>\n<div id="experiencias" class="digital-anchor" aria-hidden="true"></div>')
replace('index.html','<section class="systems-section" id="sistemas" aria-label="Interfaces smiile">','<!-- Archived presentation: retained in source, not rendered or focusable. -->\n<section class="systems-section" id="trilhas" aria-label="Interfaces smiile" hidden inert aria-hidden="true">')
(root/'public/assets/showcase/selected-visibility.css').write_text('''/* Requested visibility scope: keep the artwork and interactions, hide only
   the adjacent reading blocks and the standalone Trilhas presentation. */
#editorial .es-context[hidden],
#editorial .pf-fatos-intro,
#trilhas[hidden] {
  display: none !important;
}

/* A hidden text column must not leave the remaining artwork off-center. */
#editorial .es-panel {
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
}
#editorial .es-stage {
  grid-column: 1;
  grid-row: 1;
  width: min(100%, 520px);
  justify-self: center;
}
#editorial #colecao {
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  margin-top: 32px;
  padding-top: 32px;
}

/* Keep live announcements for assistive technology without a reading block. */
#editorial .es-status {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* Preserve existing links without keeping the former section's spacing. */
body.portfolio-r6 #sistemas.digital-anchor {
  height: 0;
  min-height: 0;
  padding: 0;
  margin: 0;
  border: 0;
  scroll-margin-top: 96px;
}
''')
replace('public/assets/showcase/editorial-story.js',"  // The device repeats the accessible, adjustable text beside it.\n  frame.root.setAttribute('aria-hidden', 'true');\n  frame.root.removeAttribute('role');\n  frame.root.removeAttribute('aria-label');","  // Only hide duplicate semantics while the adjacent reading text is exposed.\n  // With the text archived, the retained artwork remains readable to assistive technology.\n  if (!context.hidden) {\n    frame.root.setAttribute('aria-hidden', 'true');\n    frame.root.removeAttribute('role');\n    frame.root.removeAttribute('aria-label');\n  }")
replace('tests/browser-narrative.mjs',"   await page.locator('.es-transcript summary').click();check('Transcript opens without replacing the artwork',await page.locator('[data-es-quote]').isVisible()&&await page.locator('.es-device').count()===1);\n   await page.locator('[data-editorial-step=\"1\"]').click();check('Editorial explanation follows the selected piece',/comparação/.test(await page.locator('[data-es-title]').innerText()));await page.locator('.es-transcript summary').click();", "   check('Requested editorial reading blocks are hidden without replacing the artwork',!await page.locator('.es-context').isVisible()&&!await page.locator('.pf-fatos-intro').isVisible()&&await page.locator('.es-device').count()===1);\n   await page.locator('[data-editorial-step=\"1\"]').click();check('Editorial selection still updates the active artwork and metadata',await page.locator('#editorial').getAttribute('data-editorial-active')==='context'&&/comparação/.test(await page.locator('[data-es-title]').textContent()));")
replace('tests/browser-narrative.mjs',"   check('The duplicate full Casa Costa gallery is removed',await page.locator('#sistemas .sp-products figure').count()===1);\n   for(const id of ['casa','trilhas']){", "   check('Standalone Trilhas is hidden and Digital retains a destination',await page.locator('#trilhas[hidden]').count()===1&&!await page.locator('#trilhas').isVisible()&&await page.locator('#sistemas.digital-anchor').count()===1);\n   check('No hidden Trilhas enlargement control is exposed',await page.locator('[data-art-open=\"trilhas\"]:visible').count()===0);\n   for(const id of ['casa']){")
replace('tests/presentation-motion.mjs'," // The transcript is optional in the revised presentation. Open it before\n // checking its rendered copy; keyboard navigation remains unchanged.\n const transcript=story.locator('.es-transcript');\n if(!await transcript.evaluate(el=>el.open))await transcript.locator('summary').click();", " // Adjacent reading blocks were explicitly hidden; artwork controls remain.\n check('Editorial text and deck introduction stay outside the visible layout',!await story.locator('.es-context').isVisible()&&!await story.locator('.pf-fatos-intro').isVisible());")
replace('tests/presentation-motion.mjs',"(await story.locator('[data-es-copy]').innerText()).includes('Câmera, mapa, mensagens')", "(await story.locator('[data-es-copy]').textContent()).includes('Câmera, mapa, mensagens')")
replace('tests/browser-static-presentations.mjs',"      check('The next digital project remains a static image without repeating Casa Costa',await page.locator('#sistemas .sp-products figure').count()===1&&await page.locator('#sistemas .sp-products figure img').count()===1);", "      check('Standalone Trilhas is hidden without removing the Digital destination',await page.locator('#trilhas[hidden]').count()===1&&!await page.locator('#trilhas').isVisible()&&await page.locator('#sistemas.digital-anchor').count()===1);")
p=root/'tests/browser-static-presentations.mjs';s=p.read_text();a=s.index("      const artwork=page.locator('.sp-products img');");b=s.index("      for(const id of ['trabalhos'",a);s=s[:a]+"      check('Hidden product presentation has no visible or focusable controls',await page.locator('#trilhas').evaluate(root=>root.hidden&&root.inert&&root.getBoundingClientRect().height===0));\n"+s[b:];p.write_text(s)
replace('tests/browser-static-presentations.mjs',"for(const id of ['trabalhos','editorial','colecao','sistemas'])", "for(const id of ['trabalhos','editorial','colecao','narrativa-visual'])")
replace('tests/browser-section-visibility.mjs',"   check('Requested Fatos introduction is hidden'", "   check('Retained editorial artwork remains accessible',await page.locator('.es-device').evaluate(n=>n.getAttribute('role')==='group'&&n.getAttribute('aria-hidden')!=='true'&&!!n.getAttribute('aria-label')));\n   check('Requested Fatos introduction is hidden'")
replace('.github/workflows/verify.yml','suite: [narrative, motion-rhythm, static-presentations, badge-loading, gestures, readable-hero]','suite: [section-visibility, narrative, motion-rhythm, static-presentations, badge-loading, gestures, readable-hero]')
(root/'.github/workflows/visibility-probe.yml').unlink()
