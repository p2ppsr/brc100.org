import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('examples stay local, update safely, and offer accessible keyboard tabs',async ({page}) => {
  const errors=[],outbound=[];
  page.on('pageerror',e => errors.push(e.message));
  page.on('request',r => { if (new URL(r.url()).origin !== new URL(page.url() === 'about:blank' ? r.url() : page.url()).origin) outbound.push(r.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toHaveText('One interface.An open world.');
  await page.getByRole('button',{name:'Sign a message'}).click();
  await page.getByLabel('Your example message').fill('Hello 🌍 <a>example</a>');
  await expect(page.locator('#example-code')).toContainText('Hello 🌍 <a>example</a>');
  await expect(page.locator('#example-code a')).toHaveCount(0);
  await page.getByRole('tab',{name:'Request',exact:true}).click();
  await expect(page.locator('#example-code')).toContainText('"method": "createSignature"');
  await page.getByRole('tab',{name:'Request',exact:true}).press('ArrowRight');
  await expect(page.getByRole('tab',{name:'Response shape'})).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#example-code')).toContainText('not a live wallet result');
  await page.getByRole('button',{name:'Create a transaction'}).click();
  await expect(page.locator('#example-description')).toContainText('can spend funds');
  await page.getByRole('tab',{name:'TypeScript',exact:true}).click();
  await expect(page.locator('#example-code')).toContainText('wallet.createAction');
  await page.getByRole('button',{name:'Check the network'}).click();
  await expect(page.locator('#example-code')).toContainText('wallet.getNetwork');
  await expect(page.locator('#example-controls')).toBeHidden();
  expect(errors).toEqual([]);
  expect(outbound).toEqual([]);
});
test('copy buttons copy the selected example and install command', async ({page,context}) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/');
  await page.getByRole('button',{name:'Copy example code'}).click();
  await expect(page.getByRole('status')).toHaveText('Example copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('wallet.getPublicKey');
  await page.getByRole('button',{name:'Copy npm install command'}).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npm install @bsv/sdk');
});
for (const width of [320,375,390,768,1024,1440]) {
  test('responsive layout at '+width+'px',async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const flow of ['Identity','Signatures','Transactions']) {
      await page.locator('.visual-switches').getByRole('button',{name:flow,exact:true}).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.getByRole('button',{name:'Sign a message'}).click();
    await page.getByLabel('Your example message').fill('A message with several characters to check narrow screens');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width <= 700) {
      await page.getByRole('button',{name:'Open navigation'}).click();
      await expect(page.getByRole('navigation')).toBeVisible();
      await page.getByRole('button',{name:'Close navigation'}).press('Escape');
      await expect(page.getByRole('navigation')).toBeHidden();
      await page.getByRole('button',{name:'Open navigation'}).click();
      await page.getByRole('navigation').getByRole('link',{name:'Resources',exact:true}).click();
      await expect(page.getByRole('navigation')).toBeHidden();
    }
    await page.locator('summary').first().click();
    await expect(page.locator('details').first()).toHaveAttribute('open','');
  });
}
test('reduced motion and usable content without JavaScript',async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(process.env.SITE_URL || 'http://127.0.0.1:4179');
  await expect(page.getByRole('heading',{name:'More than a wallet balance.'})).toBeVisible();
  await expect(page.locator('#example-code')).toContainText('wallet.getPublicKey');
  expect(await page.locator('.connector-top i').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await context.close();
});

for (const width of [390,1440]) {
  test('accessibility at '+width+'px',async ({page}) => {
    await page.setViewportSize({width,height:1000});
    await page.goto('/');
    const results = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('community directory ordering, integration labels and contribution links',async ({page}) => {
  await page.goto('/');
  const wallets=page.locator('[data-directory="wallets"] h4');
  await expect(wallets).toHaveText(['BSV Browser (opens in a new tab)','BSV Desktop (opens in a new tab)','HandCash (opens in a new tab)','Hodos Browser (opens in a new tab)','Metanet (opens in a new tab)','Peacock (opens in a new tab)','Yours Wallet (opens in a new tab)']);
  const apps=page.locator('[data-directory="apps"] h4');
  await expect(apps).toHaveText(['1Sat Market (opens in a new tab)','BitPlan (opens in a new tab)','BSV Radar (opens in a new tab)','MetaNet Apps (opens in a new tab)','SocialCert (opens in a new tab)']);
  await expect(page.locator('.directory-card').filter({has:page.getByRole('heading',{name:'HandCash',exact:false})})).toContainText('BRC-100 · beta');
  await expect(page.getByRole('link',{name:'Add an app or wallet'})).toHaveAttribute('href','https://github.com/p2ppsr/brc100.org/blob/master/CONTRIBUTING.md');
  await expect(page.getByRole('link',{name:'Source available'})).toHaveAttribute('href','https://github.com/p2ppsr/brc100.org');
  await expect(page.getByRole('link',{name:'Open BSV License',exact:false})).toBeVisible();
});
