"""UI regression check with synthetic, intercepted API responses; never writes to the backend.
Run the exported app on localhost:8094, then python3 scripts/check-redesign.py.
Requires the locally installed Python Playwright and Chromium; no app dependencies added.
"""
import json, os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
ARTIFACTS=ROOT/'artifacts'
PREVIEW_URL=os.environ.get('REDESIGN_PREVIEW_URL', 'http://127.0.0.1:8094')
ARTIFACTS.mkdir(exist_ok=True)
DECKS=[
 {'deck_id':1,'deck_name':'The art of remembering','subject':'Psychology','author':'Shuffle','card_count':48},
 {'deck_id':2,'deck_name':'A universe of questions','subject':'Science','author':'Shuffle','card_count':64},
 {'deck_id':3,'deck_name':'Everyday French','subject':'Languages','author':'Camille','card_count':120},
 {'deck_id':4,'deck_name':'Ideas that changed us','subject':'Philosophy','author':'Shuffle','card_count':36},
 {'deck_id':5,'deck_name':'The beauty of numbers','subject':'Mathematics','author':'Shuffle','card_count':72},
 {'deck_id':6,'deck_name':'A brief history of art','subject':'Art','author':'Shuffle','card_count':54},
]
SESSION=[{'card_id':1,'recto':'Why does trying to recall an idea help you remember it?', 'verso':'Retrieving a memory strengthens the pathways that make it easier to find again. This is the testing effect.','difficulty':1,'streak':0,'last_review_timestamp':None,'success':None}]
OVERVIEW=dict(total_reviews=128,correct_reviews=108,incorrect_reviews=20,known_reviews=28,remembered_reviews=80,accuracy=84.375,unique_cards_reviewed=56,active_days=5,current_streak=4,longest_streak=8)
TREND=[dict(x=f'2026-09-0{i+1}',y=v,label=day) for i,(v,day) in enumerate(zip([12,24,18,0,36,20,18],['M','T','W','T','F','S','S']))]
ANALYTICS=dict(range='week',overview=OVERVIEW,review_count_trend=TREND,accuracy_trend=[dict(p,y=v) for p,v in zip(TREND,[65,80,78,0,85,90,94])],cards_reviewed_trend=TREND,deck_breakdown=[],recent_activity=[])

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
 page=context.new_page()
 errors=[]
 page.on('pageerror',lambda e: errors.append(str(e)))
 def api(route):
  path=urlparse(route.request.url).path
  if path in ['/auth/refresh','/auth/login']:
   data={'session':{'access_token':'visual-test-token','refresh_token':'visual-test-refresh','expires_at':'2030-01-01T00:00:00Z','token_type':'bearer'},'user':{'id':'visual-test','email':'alex@example.test'}}
  elif path=='/me': data={'user_id':1,'user_name':'Alex Morgan','email':'alex@example.test','inscription_date':'2026-01-05'}
  elif path=='/decks': data=DECKS
  elif path=='/me/decks': data=DECKS[:3]
  elif path=='/me/study-cards': data=SESSION
  elif path=='/me/analytics': data=ANALYTICS
  elif path in ['/me/study-chat/models','/me/study-chat/image-models']: data={'models':[{'id':'test-model','label':'Learning assistant'}],'default_model':'test-model'}
  elif path=='/me/study-chat/history': data={'thread_id':None,'messages':[]}
  elif path=='/me/reviews': data={}
  else: data={}
  route.fulfill(status=200,content_type='application/json',body=json.dumps(data),headers={'Access-Control-Allow-Origin':'*'})
 page.route('**/*', lambda route: api(route) if urlparse(route.request.url).path.startswith(('/auth/', '/me', '/decks')) else route.continue_())
 page.goto(PREVIEW_URL)
 page.wait_for_timeout(1500)
 page.wait_for_timeout(450)
 page.screenshot(path=str(ARTIFACTS/'welcome-mobile.png'),full_page=True)
 print('WELCOME',page.locator('body').inner_text()[:1500])
 page.evaluate("""() => { localStorage.setItem('auth-storage_app_refresh_token','visual-test-refresh'); localStorage.setItem('onboarding-storage_preferences_visual-test', JSON.stringify({completedAt:'2026-01-05',dailyGoal:3,reminderEnabled:false,selectedDeckIds:[1,2,3]})); }""")
 page.reload()
 page.get_by_test_id('start-study-session').wait_for(timeout=15000)
 page.wait_for_timeout(450)
 page.screenshot(path=str(ARTIFACTS/'study-home-mobile.png'),full_page=True)
 print('HOME',page.locator('body').inner_text()[:1500])
 page.get_by_test_id('start-study-session').click()
 page.get_by_test_id('reveal-answer').wait_for()
 page.wait_for_timeout(450)
 page.screenshot(path=str(ARTIFACTS/'study-question-mobile.png'),full_page=True)
 assert page.get_by_role('button',name='I remembered the answer',exact=True).count()==0,'Rating shown before reveal'
 page.get_by_test_id('reveal-answer').click()
 page.get_by_role('button',name='I remembered the answer',exact=True).wait_for()
 page.wait_for_timeout(450)
 page.screenshot(path=str(ARTIFACTS/'study-answer-mobile.png'),full_page=True)
 print('ANSWER',page.locator('body').inner_text()[:1500])
 page.get_by_role('button',name='I remembered the answer',exact=True).click()
 page.get_by_test_id('reveal-answer').wait_for()
 for _ in range(2):
  page.get_by_test_id('reveal-answer').click()
  page.get_by_role('button',name='I remembered the answer',exact=True).click()
 page.get_by_text('Look how far you came.',exact=True).wait_for()
 page.wait_for_timeout(450)
 page.screenshot(path=str(ARTIFACTS/'session-complete-mobile.png'),full_page=True)
 print('SUMMARY',page.locator('body').inner_text()[:1500])
 page.get_by_role('button',name='Back to my decks',exact=True).click()
 page.get_by_test_id('start-study-session').wait_for()
 page.get_by_test_id('start-study-session').click()
 page.get_by_test_id('reveal-answer').wait_for()
 page.get_by_role('button',name='Open study assistant',exact=True).click()
 page.wait_for_timeout(450)
 page.screenshot(path=str(ARTIFACTS/'assistant-mobile.png'),full_page=True)
 print('ASSISTANT',page.locator('body').inner_text()[:1500])
 page.get_by_role('button',name='Close study chat',exact=True).click()
 page.get_by_test_id('tab-library').click()
 page.get_by_test_id('library-search-input').wait_for()
 page.wait_for_timeout(500)
 page.wait_for_timeout(450)
 page.screenshot(path=str(ARTIFACTS/'library-mobile.png'),full_page=True)
 page.get_by_test_id('tab-profile').click()
 page.wait_for_timeout(700)
 page.wait_for_timeout(450)
 page.screenshot(path=str(ARTIFACTS/'progress-mobile.png'),full_page=True)
 print('PROGRESS',page.locator('body').inner_text()[:1500])
 # Exercise the same-deck entry route after manually finishing a session.
 page.get_by_test_id('tab-flashcard').click()
 page.get_by_role('button',name='Finish this session',exact=True).click()
 page.get_by_text('Every review counts.',exact=True).wait_for()
 page.get_by_test_id('tab-library').click()
 page.get_by_role('button',name='Study The art of remembering',exact=True).click()
 page.get_by_test_id('reveal-answer').wait_for()

 # Settings, prompts, and long rich content use the real components and parser.
 page.get_by_role('button',name='Open session settings',exact=True).click()
 page.get_by_text('Session settings',exact=True).wait_for()
 page.wait_for_timeout(400)
 page.screenshot(path=str(ARTIFACTS/'settings-mobile.png'))
 print('SETTINGS',page.locator('body').inner_text()[-1800:])
 close=page.get_by_role('button',name='Close session settings',exact=True)
 if close.count()==0: close=page.get_by_role('button',name='Close quick settings',exact=True)
 close.click()
 page.get_by_role('button',name='Open study assistant',exact=True).click()
 page.get_by_role('button',name='Give me a hint',exact=True).click()
 expect(page.get_by_role('textbox',name='Study chat message',exact=True)).not_to_have_value('')
 page.get_by_role('button',name='Close study chat',exact=True).click()
 SESSION[0]['recto']='What does the spacing effect tell us about memory?\n\n**Consider this model:** $R(t) = e^{-t/S}$'
 SESSION[0]['verso']='## A stronger connection\n\nSpacing retrieval across time supports retention. The relationship $R(t) = e^{-t/S}$ is an illustrative forgetting curve.\n\n'+('Practice recalling before looking at the answer. Each effort helps you find the idea again.\n\n'*8)+'**End of the explanation.**'
 page.get_by_role('button',name='Finish this session',exact=True).click()
 page.get_by_role('button',name='Back to my decks',exact=True).click()
 page.get_by_test_id('start-study-session').click()
 page.get_by_test_id('reveal-answer').wait_for()
 page.frame_locator('iframe').locator('.katex').first.wait_for()
 page.get_by_test_id('reveal-answer').click()
 frame=page.frame_locator('iframe')
 frame.get_by_text('End of the explanation.',exact=True).wait_for()
 page.get_by_role('button',name='I remembered the answer',exact=True).scroll_into_view_if_needed()
 assert page.locator('iframe').evaluate('(f)=>f.clientHeight >= f.contentDocument.querySelector(".math-root").scrollHeight - 2'), 'Rich card content clipped'
 page.wait_for_timeout(300)
 page.screenshot(path=str(ARTIFACTS/'long-math-card-mobile.png'))
 page.get_by_role('button',name='I remembered the answer',exact=True).click()

 # Responsive layout, accessible tabs, and keyboard focus with reduced motion.
 page.emulate_media(reduced_motion='reduce')
 for screen_width,screen_height in [(320,740),(1280,900)]:
  page.set_viewport_size({'width':screen_width,'height':screen_height})
  page.get_by_test_id('tab-library').click()
  page.get_by_test_id('library-search-input').fill('French')
  expect(page.get_by_role('button',name='Everyday French, Languages deck',exact=True)).to_be_visible()
  expect(page.get_by_role('button',name='The art of remembering, Psychology deck',exact=True)).not_to_be_visible()
  page.get_by_role('button',name='Clear search',exact=True).click()
  page.wait_for_timeout(300)
  page.screenshot(path=str(ARTIFACTS/f'library-{screen_width}.png'))
  assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Horizontal page overflow'
  page.get_by_test_id('tab-profile').click()
  page.get_by_text('84.4',exact=False).first.wait_for()
  page.wait_for_timeout(300)
  page.screenshot(path=str(ARTIFACTS/f'progress-{screen_width}.png'))
  previous=page.get_by_role('button',name='Previous data point',exact=True).first
  previous.scroll_into_view_if_needed()
  previous.click()
  page.wait_for_timeout(150)
  page.screenshot(path=str(ARTIFACTS/f'charts-{screen_width}.png'))
  assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Horizontal chart overflow'
 page.keyboard.press('Tab')
 assert page.evaluate('document.activeElement !== document.body'), 'Keyboard focus is missing'
 assert not errors, errors
 print('PASS: recall/reveal/ratings, goal summary, new and same-deck sessions, assistant prompts, settings, long math, filters, charts, keyboard and reduced-motion responsive layouts. No browser errors.')
 browser.close()
