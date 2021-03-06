import React from 'react';

import TreeNode from './TreeNode.js';

class Tree extends React.Component {
	static propTypes = {
		name: React.PropTypes.string,
		nameAsArray: React.PropTypes.bool,
		nodes: React.PropTypes.array,
		checked: React.PropTypes.array,
		expanded: React.PropTypes.array,
	};

	static defaultProps = {
		checked: [],
		expanded: [],
	};

	constructor(props) {
		super(props);

		this.state = {
			checked: props.checked,
			expanded: props.expanded,
		};

		this.handleCheck = this.handleCheck.bind(this);
	}

	getFormattedNodes(nodes) {
		return nodes.map((node) => {
			const formatted = Object.create(node);

			formatted.checked = this.state.checked.indexOf(node.value) > -1;
			formatted.collapsed = this.state.expanded.indexOf(node.value) === -1;

			if (this.hasChildren(node)) {
				formatted.children = this.getFormattedNodes(formatted.children);
			}

			return formatted;
		});
	}

	getTreeNodes(nodes) {
		const treeNodes = nodes.map((node, index) => {
			const checked = this.getCheckState(node);
			const children = this.getChildNodes(node);

			return (
				<TreeNode
					key={index}
					name={this.props.name}
					nameAsArray={this.props.nameAsArray}
					value={node.value}
					title={node.title}
					checked={checked}
					collapsed={node.collapsed}
					rawChildren={node.children}
					onCheck={this.handleCheck}
				>
					{children}
				</TreeNode>
			);
		});

		return (
			<ol>
				{treeNodes}
			</ol>
		);
	}

	getCheckState(node) {
		if (this.hasChildren(node) === false) {
			return node.checked ? 1 : 0;
		}

		if (this.isEveryChildChecked(node)) {
			return 1;
		}

		if (this.isSomeChildChecked(node)) {
			return 2;
		}

		return 0;
	}

	getChildNodes(node) {
		if (this.hasChildren(node)) {
			return this.getTreeNodes(node.children);
		}

		return null;
	}

	getHiddenInput() {
		if (this.props.name === undefined || this.props.nameAsArray) {
			return null;
		}

		const checked = this.state.checked.join(',');

		return <input name={this.props.name} value={checked} type="hidden" />;
	}

	setCheckState(node, isChecked) {
		if (this.hasChildren(node)) {
			// Percolate check status down to all children
			node.children.forEach((child) => {
				this.setCheckState(child, isChecked);
			});
		} else {
			// Set leaf to check/unchecked state
			const index = this.state.checked.indexOf(node.value);

			if (index > -1) {
				this.state.checked.splice(index, 1);
			}

			if (isChecked) {
				this.state.checked.push(node.value);
			}
		}
	}

	isEveryChildChecked(node) {
		return node.children.every((child) => {
			if (this.hasChildren(child)) {
				return this.isEveryChildChecked(child);
			}

			return child.checked;
		});
	}

	isSomeChildChecked(node) {
		return node.children.some((child) => {
			if (this.hasChildren(child)) {
				return this.isSomeChildChecked(child);
			}

			return child.checked;
		});
	}

	hasChildren(node) {
		if (typeof node.children !== 'object') {
			return false;
		}

		return node.children.length > 0;
	}

	handleCheck(node) {
		const isChecked = node.checked;

		this.setCheckState(node, isChecked);

		this.setState({
			checked: this.state.checked,
		});
	}

	render() {
		const nodes = this.getFormattedNodes(this.props.nodes);
		const treeNodes = this.getTreeNodes(nodes);

		return (
			<div className="react-checkbox-tree">
				{this.getHiddenInput()}
				{treeNodes}
			</div>
		);
	}
}

export default Tree;
