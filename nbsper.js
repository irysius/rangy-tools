(function (definition) {
	if (typeof define === 'function' && define.amd) {
		define(['rangy', 'rangyutils'], definition);
	} else {
		var exports = definition(window.rangy, window.RangyUtils);
		window.Nbsper = exports;
	}
})(function (rangy, rangyutils) {
	rangy.init();
	var nbsp = '\xA0';
	var mdot = '\xB7';

	var Nbsper = function () {
		var button = document.createElement('button');
		button.className = 'medium-editor-action';
		button.textContent = '&nbsp;';
		button.onclick = function () {
			mainToggle();
		}

		// Should return an element that is integrated into the toolbar. Usually a button
		function getButton() {
			return button;
		}

		// Called whenever a user selects some text within Medium Editor's sphere of influence.
		function checkState(domElement) {
			// ignore the domElement entirely, check for the presence of nbsp.
			var text = domElement.outerHTML;
			if (text.indexOf(nbsp) !== -1 || text.indexOf(mdot) !== -1) {
				button.classList.add('medium-editor-button-active');
			}
		}		

		return {
			getButton: getButton,
			checkState: checkState
		}
	}

	function toggleNbsp(jsonNode) {
		var result = { convertToNbsp: false };
		jsonNode.textNodes.forEach(function (node) {
			var originalText = node.textContent;
			var replacementText = '';
			if (jsonNode.text.length < node.textContent.length) {
				var index = originalText.indexOf(jsonNode.text);
				var targetText = originalText.substring(index, index + jsonNode.text.length);
				console.log(targetText);
				targetText = toggleText(targetText);
				replacementText = originalText.substring(0, index) + targetText + originalText.substring(index + jsonNode.text.length);
			} else {
				var targetText = originalText;
				console.log(targetText);
				targetText = toggleText(targetText);
				replacementText = targetText;
			}
			
			rangyutils.replaceTextNode(node, replacementText);
			if (replacementText.indexOf('\xA0') !== -1 || replacementText.indexOf('\xB7') !== -1) {
				result.convertToNbsp = true;
			}
		});

		function toggleText(value) {
			if (value.indexOf(nbsp) != -1 || value.indexOf(mdot) != -1) {
				return value.replace(/\xA0/g, ' ').replace(/\xB7/g, ' ').replace(/[ ]+/g, ' ');
			} else {
				return value.replace(/[ ]+/g, ' ').replace(/[ ]+/g, '\xB7');
			}
		}

		return result;
	}

	function mainToggle() {
		var range = getFirstRange();
		var saved = saveSelection(range.commonAncestorContainer);
		var x = rangyutils.getJsonNodesFromRange(range);
		console.log(x);
		var result = { convertToNbsp: false };
		if (x) {
			if (x.hasOwnProperty('length') && x.map) {
				var y = x.map(rangyutils.mapTextNode);
				var z = y.map(toggleNbsp);
				if (z.any(function (_z) { return _z.convertToNbsp; })) {
					result.convertToNbsp = true;
				}
			} else {
				var a = rangyutils.mapTextNode(x);
				var b = toggleNbsp(a);
				result.convertToNbsp = b.convertToNbsp;
			}
			var newRange = getFirstRange();
			restoreSelection(newRange.commonAncestorContainer, saved);
		}
		return result;
	}

	function getFirstRange() {
		var sel = rangy.getSelection();
		return sel.rangeCount ? sel.getRangeAt(0) : null;
	}

	// Courtesy of Tim Down
	// http://stackoverflow.com/questions/13949059/persisting-the-changes-of-range-objects-after-selection-in-html/13950376#13950376
	var saveSelection, restoreSelection;

	if (window.getSelection && document.createRange) {
		saveSelection = function(containerEl) {
			var range = window.getSelection().getRangeAt(0);
			var preSelectionRange = range.cloneRange();
			preSelectionRange.selectNodeContents(containerEl);
			preSelectionRange.setEnd(range.startContainer, range.startOffset);
			var start = preSelectionRange.toString().length;

			return {
				start: start,
				end: start + range.toString().length
			};
		};

		restoreSelection = function(containerEl, savedSel) {
			var charIndex = 0, range = document.createRange();
			range.setStart(containerEl, 0);
			range.collapse(true);
			var nodeStack = [containerEl], node, foundStart = false, stop = false;

			while (!stop && (node = nodeStack.pop())) {
				if (node.nodeType == 3) {
					var nextCharIndex = charIndex + node.length;
					if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
						range.setStart(node, savedSel.start - charIndex);
						foundStart = true;
					}
					if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
						range.setEnd(node, savedSel.end - charIndex);
						stop = true;
					}
					charIndex = nextCharIndex;
				} else {
					var i = node.childNodes.length;
					while (i--) {
						nodeStack.push(node.childNodes[i]);
					}
				}
			}

			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	} else if (document.selection) {
		saveSelection = function(containerEl) {
			var selectedTextRange = document.selection.createRange();
			var preSelectionTextRange = document.body.createTextRange();
			preSelectionTextRange.moveToElementText(containerEl);
			preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
			var start = preSelectionTextRange.text.length;

			return {
				start: start,
				end: start + selectedTextRange.text.length
			}
		};

		restoreSelection = function(containerEl, savedSel) {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(containerEl);
			textRange.collapse(true);
			textRange.moveEnd("character", savedSel.end);
			textRange.moveStart("character", savedSel.start);
			textRange.select();
		};
	}

	return Nbsper;
})