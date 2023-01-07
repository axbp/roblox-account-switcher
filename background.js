chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'roblox.com' },
          })
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

chrome.runtime.onStartup.addListener(function() {
  chrome.storage.sync.get('lastrbxlogin', function(result) {
		if (result.lastrbxlogin) {
			chrome.cookies.set(
        {
          "url": "https://www.roblox.com",
          "domain": ".roblox.com",
          "name": ".ROBLOSECURITY",
          "httpOnly": true,
          "value": result.lastrbxlogin
        },
      );
		}
	});
})
