const defaultSettings = {
	'context_menu': true,
	'hide_radar': true,
	'hide_reblog_header': true,
	'hide_recommended_blogs': true,
	'hide_source': true,
	'hide_sponsored': true,
	'hide_sponsored_sidebar': true,
	'ignore_body': false,
	'ignore_header': false,
	'ignore_tags': false,
	'listBlack': ['coronavirus', 'trump'],
	'listWhite': ['bjorn', 'octopus'],
	'match_words': true,
	'remove_redirects': true,
	'show_notice': true,
	'show_tags': true,
	'show_words': true,
	'version': '1.1.0'
}; // Initialize default values.

const BASE_CONTAINER_ID = 'base-container';

let settings = defaultSettings;
let gotSettings = false;
let isTumblrSaviorRunning = false;

const howToHide = '{display:none!important;}';

const styleRules = {
	hide_radar: [
		'aside > div:nth-child(2)' + howToHide
	],
	hide_reblog_header: [
		'._2zTTs' + howToHide,
		'._3zgGl{padding-top:inherit;}'
	],
	hide_recommended_blogs: [
		'aside > div:nth-child(1)' + howToHide
	],
	hide_source: [
		'.hjr__' + howToHide
	],
	hide_sponsored: [
		'._1DxdS:not(._2jOH-)' + howToHide
	],
	hide_sponsored_sidebar: [
		'._3bMU2' + howToHide
	]
};

const tumblrSaviorAnimation = [`
	@keyframes tumblrSaviorAnimation {
		from { clip: rect(1px, auto, auto, auto); }
		to { clip: rect(0px, auto, auto, auto); }
	}`,`
	article {
		animation-duration: 1ms;
		animation-name: tumblrSaviorAnimation;
	}
`];

const articleBlacklistedStyle = [`
	article.tumblr-savior-blacklisted:not(.tumblr-savior-override) > :not(._3wjj2):not(header):not(footer):not(ts-notice) {
		display: none;
	}
`];

const hydratingStyle = [`
	#${BASE_CONTAINER_ID}.hydrating .tumblr-savior-blacklisted footer::after {
		content: "Loading...";
	}
`];

const hideNoteCountStyle = [`
	article.tumblr-savior-blacklisted:not(.tumblr-savior-override) ._3t3fM {
		display: none;
	}
`];

const hideControlsStyle = [`
	article.tumblr-savior-blacklisted:not(.tumblr-savior-override) ._33VXm {
		display: none;
	}
`];

const showButtonStyle = [`
	.tumblr-savior-show {
		border: 2px solid var(--gray-40);
		color: var(--gray-65);
		border-radius: 3px;
		font-weight: 700;
		padding: 6px 10px;
		margin-left: 10px;
	}
	.tumblr-savior-show::after {
		content: "Show me"
	}
	.tumblr-savior-override .tumblr-savior-show::after {
		content: "Hide this"
	}
`];

const noticeStyle = [`
	ts-notice ._2m1qj {
		background-color: rgba(0,0,0,10%);
		display: flex;
		white-space: normal;
	}
	ts-notice svg {
		width: 64px;
	}
	ts-notice div.content {
		flex: 1 1 0;
		padding-left: 10px;
	}
	ts-notice h1 {
		margin-top: 5px;
	}
	article.tumblr-savior-blacklisted.tumblr-savior-override ts-notice {
		display: none;
	}
`];

let id = 0;

function getId() {
	return id++;
}

function createWarningSVG() {
	const id = getId();

	// Based on https://github.com/fabianalexisinostroza/Antu-classic
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('viewBox', '0 0 64 64');

	const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

	const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
	linearGradient.setAttribute('gradientTransform', 'matrix(1.31117 0 0 1.30239 737.39 159.91)')
	linearGradient.setAttribute('gradientUnits', 'userSpaceOnUse');
	linearGradient.setAttribute('id', id);
	linearGradient.setAttribute('y2', '-.599');
	linearGradient.setAttribute('x2', '0');
	linearGradient.setAttribute('y1', '45.47');

	const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
	stop1.setAttribute('stop-color', '#ffc515');

	const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
	stop2.setAttribute('offset', '1');
	stop2.setAttribute('stop-color', '#ffd55b');

	linearGradient.appendChild(stop1);
	linearGradient.appendChild(stop2);
	defs.appendChild(linearGradient);
	svg.appendChild(defs);

	const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	g.setAttribute('transform', 'matrix(.85714 0 0 .85714-627.02-130.8)');

	const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path1.setAttribute('d', 'm797.94 212.01l-25.607-48c-.736-1.333-2.068-2.074-3.551-2.074-1.483 0-2.822.889-3.569 2.222l-25.417 48c-.598 1.185-.605 2.815.132 4 .737 1.185 1.921 1.778 3.404 1.778h51.02c1.483 0 2.821-.741 3.42-1.926.747-1.185.753-2.667.165-4');
	path1.setAttribute('fill', `url(#${id})`);

	const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path2.setAttribute('d', 'm-26.309 18.07c-1.18 0-2.135.968-2.135 2.129v12.82c0 1.176.948 2.129 2.135 2.129 1.183 0 2.135-.968 2.135-2.129v-12.82c0-1.176-.946-2.129-2.135-2.129zm0 21.348c-1.18 0-2.135.954-2.135 2.135 0 1.18.954 2.135 2.135 2.135 1.181 0 2.135-.954 2.135-2.135 0-1.18-.952-2.135-2.135-2.135z');
	path2.setAttribute('fill', '#000');
	path2.setAttribute('fill-opacity', '.75');
	path2.setAttribute('stroke', '#40330d');
	path2.setAttribute('transform', 'matrix(1.05196 0 0 1.05196 796.53 161.87)');

	g.appendChild(path1);
	g.appendChild(path2);

	svg.appendChild(g);

	return svg;
}

const filters = {};

function needsToBeSaved(text) {
	const normalizedStr = text.toLowerCase().replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/\s+/g, ' ');

	return {
		blackList: settings.listBlack.filter((entry, index) => {
			return filters.black[index](normalizedStr);
		}),
		whiteList: settings.listWhite.filter((entry, index) => {
			return filters.white[index](normalizedStr);
		})
	};
}

function createStyle(styleId) {
	var elmStyle = document.createElement('style');

	elmStyle.type = 'text/css';
	elmStyle.id = styleId;

	return elmStyle;
}

function addGlobalStyle(styleId, newRules) {
	var cStyle, hadStyle, i, newRule;

	const [elmHead] = document.getElementsByTagName('head');

	if (!elmHead) {
		return;
	}

	cStyle = document.getElementById(styleId);

	hadStyle = !!cStyle;

	cStyle = cStyle || createStyle(styleId);

	while (cStyle.sheet && cStyle.sheet.cssRules.length) {
		cStyle.sheet.deleteRule(0);
	}

	if (cStyle.innerText) {
		cStyle.innerText = '';
	}

	for (i = 0; i < newRules.length; i += 1) {
		newRule = newRules[i];
		if (cStyle.sheet && cStyle.sheet.cssRules[0]) {
			cStyle.sheet.insertRule(newRule, 0);
		} else {
			cStyle.appendChild(document.createTextNode(newRule));
		}
	}

	if (!hadStyle) {
		elmHead.appendChild(cStyle);
	}
}

function show_tags() {
	var cssRules = [ '.tumblr-savior-blacklisted .pOoZl {display:block!important;}' ];
	addGlobalStyle('show-tags', cssRules);
}

function hide_tags() {
	var cssRules = [ '.tumblr-savior-blacklisted .pOoZl {display:none!important;}' ];
	addGlobalStyle('show-tags', cssRules);
}

const hideNoticesStyle = [`
	article.tumblr-savior-blacklisted {
		display:none;
	}
`];

function extractText(node) {
	// We were doing a naive tag removal and that worked until tumblr sometimes
	// didn't escape html in blog descriptions. So now we do it explicitly (#54)
	if (node.nodeType === 3) return node.textContent;

	var collection = [];

	for (var i = 0; i < node.childNodes.length; i += 1) {
		collection.push(extractText(node.childNodes[i]));
	}

	return collection.join(' ');
}

function toggleStyle(id) {
	var rules = styleRules[id];
	var hide = settings[id];
	var cssRules = [];

	if (hide) {
		for (var i = 0; i < rules.length; i += 1) {
			cssRules.push(rules[i]);
		}
	}

	addGlobalStyle(id, cssRules);
}

function applySettings() {
	if (settings.show_tags) {
		show_tags();
	} else {
		hide_tags();
	}

	addGlobalStyle('show-notices', settings.show_notice ? [] : hideNoticesStyle);

	for (var id in styleRules) {
		toggleStyle(id);
	}

	gotSettings = true;
}

function buildRegex(entry) {
	// Escape all regex characters except for * which matches anything except spaces.
	entry = entry.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, ' ').replace(/[*]/g, '[^\\s]*?');

	var str = '(^|\\W)(' + entry + ')(\\W|$)';
	var re = new RegExp(str);

	return function testRegex(content) {
		return content.match(re);
	};
}

function buildIndexOf(entry) {
	return function testIndexOf(content) {
		return content.indexOf(entry) !== -1;
	};
}

function parseSettings(savedSettings) {
	var i, entry, test;

	try {
		settings = JSON.parse(savedSettings);
	} catch (err) {
		console.warn('Tumblr Savior: Error parsing settings, using defaults.');
		settings = defaultSettings;
	}

	filters.black = [];
	filters.white = [];

	if (settings.match_words) {
		for (i = 0; i < settings.listBlack.length; i += 1) {
			entry = settings.listBlack[i].toLowerCase();
			test = buildRegex(entry);
			filters.black.push(test);
		}
		for (i = 0; i < settings.listWhite.length; i += 1) {
			entry = settings.listWhite[i].toLowerCase();
			test = buildRegex(entry);
			filters.white.push(test);
		}
	} else {
		for (i = 0; i < settings.listBlack.length; i += 1) {
			entry = settings.listBlack[i].toLowerCase();
			test = buildIndexOf(entry);
			filters.black.push(test);
		}
		for (i = 0; i < settings.listWhite.length; i += 1) {
			entry = settings.listWhite[i].toLowerCase();
			test = buildIndexOf(entry);
			filters.white.push(test);
		}
	}
}

const regexRedirect = /z=([^&]*)/;

function removeRedirect(link) {
	const encodedUrl = link.href.match(regexRedirect)[1];
	if (encodedUrl) {
		link.href = decodeURIComponent(encodedUrl);
	}
}

function removeRedirects(post) {
	if (!settings.remove_redirects) return;

	const links = post.getElementsByTagName('A')

	Array.prototype.forEach.call(links, link => {
		if (link.href.includes('t.umblr.com')) {
			removeRedirect(link);
		}
	})
}

function listWords(list) {
	const length = list.length;
	return list.reduce((out, word, index) => {
		if (length > 2 && index !== 0 && index < length - 1) {
			out += ',';
		}
		if (length > 1 && index === length - 1) {
			out += ' and';
		}
		out += ' \'' + word + '\'';
		return out;
	}, ':');
}

function decoratePost(post, blackList, whiteList) {
	if (!blackList.length) {
		return;
	}

	const tsNotice = document.createElement('ts-notice');
	tsNotice.className = '_3zgGl';

	const divNotice = document.createElement('div');
	divNotice.className = '_2m1qj';

	const divContent = document.createElement('div');
	divContent.className = 'content';

	const h1Content = document.createElement('h1');
	h1Content.appendChild(document.createTextNode('Content Warning'));
	divContent.appendChild(h1Content);

	const spanContent = document.createElement('span');
	const textContent = 'This post may contain' +
		(settings.show_words ? listWords(blackList) : ' something from your blacklist.');
	const textNotice = document.createTextNode(textContent);
	spanContent.appendChild(textNotice);

	divContent.appendChild(spanContent);

	divNotice.appendChild(createWarningSVG());
	divNotice.appendChild(divContent);
	tsNotice.appendChild(divNotice);

	post.insertBefore(tsNotice, post.querySelector('header').nextSibling);

	const buttonShow = document.createElement('button');
	buttonShow.className = 'tumblr-savior-show';
	buttonShow.addEventListener('click', () => {
		if (post.classList.contains('tumblr-savior-override')) {
			post.classList.remove('tumblr-savior-override');
		} else {
			post.classList.add('tumblr-savior-override');
		}
	});

	post.querySelector('footer ._1kqDq').appendChild(buttonShow);
}

function undecoratePost(post) {
	const existingNotices = post.getElementsByTagName('ts-notice');

	Array.prototype.forEach.call(existingNotices, existingNotice => {
		existingNotice.parentNode.removeChild(existingNotice);
	});

	const existingButtons = post.getElementsByClassName('tumblr-savior-show');

	Array.prototype.forEach.call(existingButtons, existingButton => {
		existingButton.parentNode.removeChild(existingButton);
	});
}

function checkPost(post) {
	if (!gotSettings) return;

	removeRedirects(post);

	post.classList.remove('tumblr-savior-blacklisted');
	post.removeAttribute('data-tumblr-savior-blacklist');

	let postText = '';
	const postHeader = post.querySelector('header');
	const postTags = post.querySelector('.pOoZl');

	if (!settings.ignore_header) {
		postText += extractText(postHeader);
	}

	if (!settings.ignore_body) {
		const postBody = Array.prototype.reduce.call(post.childNodes, (out, node) => {
			if (node.tagName === 'HEADER' || node.tagName === 'FOOTER' || node.classList.contains('pOoZl')) {
				return out;
			}
			return out + node.innerHTML;
		}, '');

		postText += postBody;
	}

	if (postTags && !settings.ignore_tags) {
		postText += extractText(postTags);
	}

	const { blackList, whiteList } = needsToBeSaved(postText);

	if (blackList.length) {
		post.classList.add('tumblr-savior-blacklisted');
		post.setAttribute('data-tumblr-savior-blacklist', blackList.join(', '));
	}

	if (whiteList.length) {
		post.classList.add('tumblr-savior-override');
		post.setAttribute('data-tumblr-savior-whitelist', whiteList.join(', '));
	}

	if (settings.show_notice) {
		hydrationPromise.then(() => {
			undecoratePost(post);
			decoratePost(post, blackList, whiteList);
		});
	} else {
		undecoratePost(post);
	}
}

function handleAnimationStart(event) {
	const { animationName, target: post } = event;

	if (animationName !== 'tumblrSaviorAnimation') return;

	checkPost(post);
}

function checkPosts() {
	const posts = document.getElementsByTagName('article');

	Array.prototype.forEach.call(posts, checkPost);
}

function chromeHandleMessage({ name, parameters }) {
	if (name === 'getSettings') {
		parseSettings(parameters);
		applySettings();
		checkPosts();
	}
}

function initialize() {
	document.addEventListener('animationstart', handleAnimationStart, false);

	addGlobalStyle('tumblr-savior-animation', tumblrSaviorAnimation);
	addGlobalStyle('article-blacklisted', articleBlacklistedStyle);
	addGlobalStyle('hydrating', hydratingStyle);
	addGlobalStyle('hide-note-count', hideNoteCountStyle);
	addGlobalStyle('hide-controls', hideControlsStyle);
	addGlobalStyle('show-button', showButtonStyle);
	addGlobalStyle('ts-notice', noticeStyle);

	chrome.runtime.onMessage.addListener(request => {
		if (request === 'refreshSettings') {
			chrome.runtime.sendMessage(null, { name: 'getSettings' }, null, chromeHandleMessage);
		}
	});

	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(null, { name: 'getSettings' }, null, message => {
			chromeHandleMessage(message);
			resolve();
		});
	});
}

function waitForHydration(baseContainer) {
	baseContainer.classList.add('hydrating');

	return new Promise((resolve, reject) => {
		const hydrationTimeout = setTimeout(() => {
			reject('Timed out waiting for hydration to complete');
		}, 10000);

		const hydrateCanary = document.createElement('hydrate-canary');

		baseContainer.insertBefore(hydrateCanary, baseContainer.firstChild);

		const observer = new MutationObserver(mutationList => {
			for (let i = 0; i < mutationList.length; i += 1) {
				if (Array.prototype.includes.call(mutationList[i].removedNodes, hydrateCanary)) {
					observer.disconnect();
					clearTimeout(hydrationTimeout);
					baseContainer.classList.remove('hydrating');
					return resolve();
				}
			}
		});

		observer.observe(baseContainer, { childList: true });
	});
}

function waitForBaseContainer() {
	return new Promise((resolve, reject) => {
		const observer = new MutationObserver(mutationList => {
			for (let i = 0; i < mutationList.length; i += 1) {
				for (let j = 0; j < mutationList[i].addedNodes.length; j += 1) {
					if (mutationList[i].addedNodes[j].id === BASE_CONTAINER_ID) {
						observer.disconnect();
						return resolve(mutationList[i].addedNodes[j]);
					}
				}
			}
		});
		observer.observe(document, { childList: true, subtree: true });
	});
}

const baseContainer = waitForBaseContainer();

const hydrationPromise = baseContainer.then(waitForHydration).catch(console.error);

baseContainer.then(initialize);
