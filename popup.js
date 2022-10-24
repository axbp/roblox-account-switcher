const http = new XMLHttpRequest();
var refreshAccountContainer = false;

var tokens = {}


function getToken(callback=false) {
    chrome.cookies.get(
		{
			"url": "https://www.roblox.com",
			"name": ".ROBLOSECURITY"
		},
		function(cookie) {
        if(callback) {
            callback(cookie.value);
        }
    });
}

function setToken(value, callback=false) {
	chrome.cookies.set(
		{
			"url": "https://www.roblox.com",
			"domain": ".roblox.com",
			"name": ".ROBLOSECURITY",
			"httpOnly": true,
			"value": value
		},
		function(cookie) {
        if(callback) {
            callback(cookie.value);
        }
		chrome.tabs.reload(function(){});
    });
}

function getUserFromToken(callback) {
	http.open("GET", "https://users.roblox.com/v1/users/authenticated", true);

	http.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			callback(JSON.parse(this.responseText));
		}
	}

	http.send();
}

function getStoreToken(callback=false) {
	getToken(function(token) {
		getUserFromToken(function(user) {
			let id = user.id;
			let name = user.name;
			tokens[id.toString()] = {
				name: name,
				id: id,
				token: token
			}
			setTokens();
			
			if (callback) {
				callback();
			}
		});
	});
}

function getStoreRefreshToken() {
	getStoreToken(function() {
		refreshAccountContainer();
	});
}

function readTokens(callback=false) {
	chrome.storage.sync.get('rbxtokens', function(result) {
		if (result.rbxtokens) {
			console.log("found tokens");
			tokens = result.rbxtokens[0];
		} else {
			console.log("oof");
			tokens = {};
		}
		if (callback) { 
			callback();
		}
		refreshAccountContainer();
	});
}

function setTokens(callback=false) {
	chrome.storage.sync.set({rbxtokens: [tokens]}, function() {
		if (callback) { 
			callback();
		}
	});
}



document.addEventListener('DOMContentLoaded', function() {
	const addAccountButton = document.getElementById("add-account");
	const logoutAccountButton = document.getElementById("logout-account");
	const logoutAllAccountsButton = document.getElementById("clear-account");
	const showUsageButton = document.getElementById("usage-button");
	const hideUsageButton = document.getElementById("close-usage");
	
	const accountContainer = document.getElementsByClassName("account-container")[0];
	const menuContainer = document.getElementsByClassName("menu-container")[0];
	
	refreshAccountContainer = function() {
		accountContainer.innerHTML = "";
		for (var key in tokens) {
			if (tokens.hasOwnProperty(key)) {
				let value = tokens[key];
				let tokenElement = document.createElement("button");
				tokenElement.classList.add("account")
				tokenElement.innerHTML = '<img src="https://www.roblox.com/headshot-thumbnail/image?userId=' + value.id + '&width=420&height=420&format=png>">' + value.name + " <code>" + value.id + "</code>"
				tokenElement.rbxid = key
				tokenElement.onclick = function() {
					setToken(value.token);
				}
				accountContainer.appendChild(tokenElement);
			}
		}
	}
	
    addAccountButton.addEventListener('click', function() {
		getStoreRefreshToken();
	});
	
	logoutAccountButton.addEventListener('click', function() {
		setToken("");
	});
	
	logoutAllAccountsButton.addEventListener('click', function() {
		areYouSure = confirm("This will remove of your accounts. You will need to readd accounts if need be.");
		if (areYouSure) {		
			tokens = {};
			setTokens(function() {
				window.close();
			});
		}
	});
	
	showUsageButton.addEventListener('click', function() {
		menuContainer.classList.remove("hidden");
	});
	
	hideUsageButton.addEventListener('click', function() {
		menuContainer.classList.add("hidden");
	});
	
	readTokens();
	
	var links = document.getElementsByTagName("a");
	console.log(links);
	for (var i = 0; i < links.length; i++) {
		(function () {
			var ln = links[i];
			var loc = ln.href;
			ln.onclick = function () {
				console.log(ln);
				chrome.tabs.create({active: true, url: loc});
			};
		})();
	}
});