function nodesAsArray(nodes) {
	var array = [];
	var i;
	for (i = 0; i < nodes.length; ++i) {
		array.push(nodes[i]);
	}
	return array;
}

function nodeMatch(nodes, container) {
	var i;
	for (i = 0; i < nodes.length; ++i) {
		var element = nodes[i];
		if (element === container) {
			return i;
		} else if (element === container.parentElement) {
			return i;
		}
	}
	return -1;
}

function getJsonNodesFromRange(wrappedRange) {
	var nodeArray = nodesAsArray(wrappedRange.commonAncestorContainer.childNodes);
	var i = nodeMatch(nodeArray, wrappedRange.startContainer);
	var j = nodeMatch(nodeArray, wrappedRange.endContainer);
	return nodeArray.slice(i, j + 1).map();
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
	result.text = result.textContent;
	result.nodeName = node.nodeName;
	if (result.nodeName !== '#text') {
		result.html = node.outerHTML;
	} else {
		result.html = result.text;
	}
	return result;
}

function headJsonNode(jsonNode, startContainer, startOffset) {
	// type and nodeName are made up.
	result.type = 'fragment';
	result.nodeName = '#start';
	result.text = startContainer.textContent.substring(startOffset);
	var index = jsonNode.html.lastIndexOf(result.text);
	result.html = jsonNode.html.substring(index);

	result.jsonNode = jsonNode;

	return result;
}

function tailJsonNode(jsonNode, endContainer, endOffset) {
	// type and nodeName are made up.
	result.type = 'fragment';
	result.nodeName = '#end';
	result.text = endContainer.textContent.substring(0, endOffset);
	var index = jsonNode.html.indexOf(result.text);
	result.html = jsonNode.html.substring(0, index + result.text.length);

	result.jsonNode = jsonNode;

	return result;	
}