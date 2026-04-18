fetch('https://spendx-beta.vercel.app/')
  .then(r => r.text())
  .then(html => {
    const hasMeta = html.includes('deploy-verify');
    console.log('Has deploy-verify meta:', hasMeta);
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    console.log('Page title:', titleMatch ? titleMatch[1] : '?');
    // Check if the static js filename is new or old
    const jsMatch = html.match(/src="\/static\/js\/(.*?)"/);
    console.log('JS bundle:', jsMatch ? jsMatch[1] : '?');
  });
