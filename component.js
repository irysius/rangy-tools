/*global m */
var component = {};

component.vm = function () {
	var dis = this;
	this.init = function () {
		dis.type = m.prop('');
		dis.title = m.prop('');
		dis.handler = m.prop(null);
		dis.value = m.prop(null);
		dis.group = m.prop(null);
		dis.checked = m.prop(null);
	}
	this.load = function (menuItem) {
		var validTypes = [ 'action', 'checkbox', 'radio', 'separator', 'submenu' ];
		if (validTypes.indexOf(menuItem.type) === -1) { return; }
		dis.type(menuItem.type);
		switch (dis.type()) {
			case 'action':
				dis.title(menuItem.title);
				dis.handler(menuItem.handler);
				break;
			case 'checkbox':
				dis.title(menuItem.title);
				dis.value(menuItem.value);
				dis.checked(menuItem.checked);
				break;
			case 'radio':
				dis.title(menuItem.title);
				dis.value(menuItem.value);
				dis.group(menuItem.group);
				dis.checked(menuItem.checked);
				break;
			case 'separator':
				break;
			case 'submenu':
				dis.title(menuItem.title);
				dis.handler(menuItem.handler);
				break;
		}
		m.redraw();
	}
	return {};
}

component.controller = function () {
	var vm = component.vm;
	vm.init();
	return {};
}

component.view = function () {
	var vm = component.vm;
	switch (vm.type()) {
		case 'action':
			return menuAction(vm.title(), vm.handler());
		case 'checkbox':
			return menuCheckbox(vm.title(), vm.value(), vm.checked());
		case 'radio':
			return menuRadioOption(vm.title(), vm.value(), vm.group(), vm.checked());
		case 'separator':
			return menuSeparator();
		case 'submenu':
			return menuSubmenu(vm.title());
		default:
			return m();
	}
}

function menuAction(title, handler) {
	title = title || '';
	var aHash = { role: 'menuitem', tabindex: -1 };
	if (handler) { aHash.onclick = handler; }
	return m('li', { role: 'presentation' }, [
		m('a', aHash, title)
	]);
}

function menuCheckbox(title, value, checked) {
	title = title || '';
	value = value || '';
	checked = Boolean(checked) || false;
	return m('li', { role: 'presentation' }, [
		m('div.checkbox', [
			m('label', [ m('input[type=checkbox]', { checked: checked, value: value }, title) ])
		])
	]);
}

function menuRadioOption(title, value, group, checked) {
	title = title || '';
	value = value || '';
	checked = Boolean(checked) || false;
	var radioHash = { checked: checked, value: value };
	if (group) { radioHash.name = group; }

	return m('li', { role: 'presentation' }, [
		m('div.radio', [
			m('label', [ 
				m('input[type=radio]', radioHash, title) ])
		])
	]);
}

function menuSeparator() {
	return m('li', { role: 'presentation', class: 'divider' });
}

function menuSubmenu(title, handler) {
	title = title || '';
	var spanHash = {};
	if (!!handler) { spanHash.onmouseover = handler; }
	return m('li', { role: 'presentation' }, [
		m('span', spanHash, title)
	]);
}