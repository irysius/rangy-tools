(function (definition) {
	if (typeof define === 'function' && define.amd) {
		define([], definition);
	} else {
		var exports = definition();
		window.RangyTools = exports;
	}
})(function () {
	function nodesAsArray(nodes) {
		var array = [];
		var i;
		for (i = 0; i < nodes.length; ++i) {
			array.push(nodes[i]);
		}
		return array;
	}

	function nodeMatch(nodes, container, common) {
		var i;
		for (i = 0; i < nodes.length; ++i) {
			var element = nodes[i];
			if (compareNodes(element, container, common)) {
				return i;
			}
		}
		return -1;
	}

	function compareNodes(target, container, limit) {
		return _compareNodes(container);
		function _compareNodes(node) {
			if (node === target) {
				return true;
			} else if (node.parentElement === limit) {
				return false;
			} else {
				return _compareNodes(node.parentElement);
			}
		}	
	}

	function getJsonNodesFromRange(wrappedRange) {
		if (!wrappedRange) {
			return null;
		}

		// handle the case where range wraps only a single node.
		if (wrappedRange.startContainer === wrappedRange.endContainer) {
			if (wrappedRange.startOffset === wrappedRange.endOffset) {
				return null;
			} else {
				var single = nodeAsJson(wrappedRange.startContainer);
				single.text = single.text.substring(wrappedRange.startOffset, wrappedRange.endOffset);
				single.html = single.text;
				return single;
			}
		} else {
			var nodeArray = nodesAsArray(wrappedRange.commonAncestorContainer.childNodes);
			var i = nodeMatch(nodeArray, wrappedRange.startContainer, wrappedRange.commonAncestorContainer);
			var j = nodeMatch(nodeArray, wrappedRange.endContainer, wrappedRange.commonAncestorContainer);
			if (i === -1) { throw { message: 'matching code is busted.' }; }
			if (j === -1) { throw { message: 'matching code is busted.' }; }
			var results = nodeArray.slice(i, j + 1).map(nodeAsJson);
			results[0] = headJsonNode(results[0], wrappedRange.startContainer, wrappedRange.startOffset);
			results[results.length - 1] = tailJsonNode(results[1], wrappedRange.endContainer, wrappedRange.endOffset);
			return results;
		}
	}

	function nodeAsJson(node) {
		var result = {};
		switch (node.nodeType) {
			case 1: // ELEMENT_NODE
				result.type = 'element';
				break;
			case 3: // TEXT_NODE
				result.type = 'text';
				break;
			default:
				console.log('deprecated/not covered nodeType: ' + node.nodeType);
				return null;
		}
		result.node = node;
		result.text = node.textContent;
		result.nodeName = node.nodeName;
		if (result.nodeName !== '#text') {
			result.html = node.outerHTML;
		} else {
			result.html = result.text;
		}
		return result;
	}

	function headJsonNode(jsonNode, startContainer, startOffset) {
		var result = {};
		// type and nodeName are made up.
		result.type = 'fragment';
		result.nodeName = '#start';
		result.text = startContainer.textContent.substring(startOffset);
		var index = jsonNode.html.lastIndexOf(result.text);
		result.html = jsonNode.html.substring(index);

		result.node = jsonNode.node;
		result.jsonNode = jsonNode;

		return result;
	}

	function tailJsonNode(jsonNode, endContainer, endOffset) {
		var result = {};
		// type and nodeName are made up.
		result.type = 'fragment';
		result.nodeName = '#end';
		result.text = endContainer.textContent.substring(0, endOffset);
		var index = jsonNode.html.indexOf(result.text);
		result.html = jsonNode.html.substring(0, index + result.text.length);

		result.node = jsonNode.node;
		result.jsonNode = jsonNode;

		return result;	
	}

	return {
		getJsonNodesFromRange: getJsonNodesFromRange
	}
});