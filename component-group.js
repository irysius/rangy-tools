/*global m */
var component = {};

component.vm = {
	items: m.prop(null),
	position: m.prop(null),
	minSize: m.prop(null),
	maxSize: m.prop(null),
	visible: m.prop(false),
	init: function () { },
	load: function (items) { component.vm.items(items); }
}

component.controller = function () {
	var vm = component.vm;
	vm.init();
	return {};
}

component.view = function () {
	var vm = component.vm;
	return m('ul', vm.items());
}