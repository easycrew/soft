// new表格
function Tree(treeStructure, treeName, container) {
	this.treeStructure = treeStructure;
	this.treeName = treeName;
	this.container = container;
	this.datas = [];
	this.setting = {};
	this.treeNode = null;
	this.tree;
	this.treeResult;
	this.init();

}
Tree.prototype = {
	init : function() {
		var that = this;
		debugger;
		this.treeSetting = this.treeStructure;
		if (this.treeSetting.searchNode) {
			$(
					'<div><span style="margin-left: 9px;">搜索：</span><input class="ztree" id="searchInput"></input></div>')
					.appendTo($(that.container));
		}

		$('<div class="ztree" id="' + this.treeName + '"></div>').appendTo(
				$(that.container));
		if (this.treeSetting) {
			this.baseRoot = this.treeSetting["baseRoot"];
			this.loadUrl = this.treeSetting["url"];
			this.target = this.treeSetting["target"];

			this.viewUrl = this.loadUrl + "/" + this.baseRoot + "View";
			this.removeUrl = this.loadUrl + "/" + this.baseRoot + "Remove";
			this.editUrl = this.loadUrl + "/" + this.baseRoot + "Edit";
			this.addUrl = this.loadUrl + "/" + this.baseRoot + "Add";
			this.expandAll = this.treeSetting["expandAll"];
			this.loadFun = this.treeSetting["loadFun"];
			this.addFun = this.treeSetting["addFun"];
			this.editFun = this.treeSetting["editFun"];
			this.viewFun = this.treeSetting["viewFun"];
			this.removeFun = this.treeSetting["removeFun"];
			this.checkedFun = this.treeSetting["checkedFun"];
			this.mapping = this.treeSetting["mapping"] || {};
			this.groupData = this.treeSetting["groupData"];
			this.isHiddenEdit = this.treeSetting["isHiddenEdit"];
			this.isHiddenAdd = this.treeSetting["isHiddenAdd"];
			this.isHiddenDel = this.treeSetting["isHiddenDel"];
			this.async = this.treeSetting["async"];
			this.extendAttrs = this.treeSetting["extendAttrs"];
			this.idKey = this.mapping["id"] || "ID";
			this.pIdKey = this.mapping["pid"] || "PID";
			this.nodeName = this.mapping["name"] || "NAME";

			this.queryUrl = this.loadUrl;// +"/"+this.baseRoot+"Query";
			var view = {
				selectedMulti : false
			};
			var edit = {
				enable : false,
				editNameSelectAll : true
			};

			var callBack = {
				"onClick" : function(event, treeId, treeNode) {
					if (that.viewFun) {
						that.viewFun(treeId, treeNode);
					} else {
						$("#" + that.target).load(that.viewUrl);
					}
				},
				"onExpand" : function(event, treeId, treeNode) {
					var inputValue = $("#searchInput").val();
					if (inputValue) {
						var inputValueItem = inputValue.split(",");
						for(var i = 0;i<inputValueItem.length;i++){
							if (treeNode.NAME.indexOf(inputValueItem[i]) != -1) {
								var id = treeNode.tId;
								$("#" + id + "_span").css("background-color",
									"blue");
								$("#" + id + "_span").css("color", "white");
							}
						}
					}
				}
			};
			if (this.checkedFun) {
				callBack["onCheck"] = function(e, treeId, treeNode) {
					that.checkedFun(treeId, treeNode);
				};
			}
			// 删除数据0p
			var removeFun = function(treeId, treeNode) {
				jyDialog().confirm(
						"确认删除  " + treeNode[that.nodeName] + " 吗？",
						function() {
							if (that.removeFun) {
								that.removeFun(treeId, treeNode);
							} else {
								var params = "id=" + treeNode.ID;
								jyAjax(that.removeUrl, params,
										function(result) {// 请求成功后
											that.zTree.removeNode(treeNode);
										});
							}
						});
				return false;
			};
			// 打开修改页面
			var editFun = function(treeId, treeNode) {
				that.treeNode = treeNode;
				if (that.editFun) {
					that.editFun(treeId, treeNode);
				} else {
					$("#" + that.target).load(that.editUrl);
				}
				return false;
			};
			var addFun = function(treeId, treeNode) {
				if (that.addFun) {
					that.addFun(treeId, treeNode);
				} else {
					$("#" + that.target).load(that.addUrl);
				}
			};
			var checkAll = function(treeId, treeNode) {
				if (treeNode && treeNode.children) {
					var me = arguments.callee;
					for ( var i = 0; i < treeNode.children.length; i++) {
						var t = treeNode.children[i];
						that.tree.checkNode(t);
						me(t.ID, t);
					}
				}
				if (!treeNode.checked) {
					that.tree.checkNode(treeNode);
				}
			};

			edit["showRemoveBtn"] = false;
			edit["showRenameBtn"] = false;

			var btnMap = {
				"remove" : "删除",
				"edit" : "编缉",
				"add" : "新增",
				"all" : "全选",
				"upload" : "点击上传",
				"coverfile" : "点击覆盖",
				"downloadfile" : "点击下载"
			};
			// 填加新增按钮
			view["addHoverDom"] = function(treeId, tn) {
				(function(treeNode) {
					var addBtn = function(name, sObj, fun, treeNode, treeId,
							title, isInnerHTMl, isHidden) {
						var innerHTML = "";
						if (isInnerHTMl) {
							innerHTML = "<div style='float:left;'><a href='javascript:void(0)'>"
									+ title + "</a></div>";
						}
						var hiddenStr = "";
						if (isHidden) {
							hiddenStr = 'style="display:none;"';
						}
						var buttonId = name + "Btn_" + treeNode.tId;
						var title_ = btnMap[name] || title;
						var str = "<span " + hiddenStr + " class='button "
								+ name + "' id='" + buttonId + "' title='"
								+ title_ + "' onfocus='this.blur();'>"
								+ innerHTML + "</span>";
						sObj.after(str);
						var btn = $("#" + buttonId);
						if (btn)
							btn.unbind().bind("click", function() {
								fun(treeId, treeNode);
								return false;
							});
					};
					that.treeNode = treeNode;
					var sObj = $("#" + treeNode.tId + "_span");
					if (treeNode.editNameFlag
							|| $("#addBtn_" + treeNode.tId).length > 0
							|| $("#allBtn_" + treeNode.tId).length > 0) {
						return;
					}
					if (that.treeSetting.isEdit) {
						if (!(treeNode.children && treeNode.children.length)) {
							addBtn("remove", sObj, removeFun, treeNode, treeId,
									null, null, that.isHiddenDel);
						}
						addBtn("edit", sObj, editFun, treeNode, treeId, null,
								null, that.isHiddenEdit);
						addBtn("add", sObj, addFun, treeNode, treeId, null,
								null, that.isHiddenAdd);
					}
					if (that.treeSetting.editBtnExt) {
						(function(treeNode) {
							var btns = that.treeSetting.editBtnExt(treeNode);
							if (btns) {
								for ( var i = 0; i < btns.length; i++) {
									var btn = btns[i];
									var name = btn.name;
									addBtn(name, sObj, btn.fun, treeNode,
											treeId, "点击上传", false);
								}
							}
						})(treeNode);
					}
					if (that.treeSetting.checkChildNodes) {
						addBtn("all", sObj, checkAll, treeNode, treeId, "全选",
								true);
					}
				})(tn);
			};
			// 移除新增按钮
			view["removeHoverDom"] = function(treeId, treeNode) {
				if (that.treeSetting.isEdit || that.treeSetting.editBtnExt) {
					$("#addBtn_" + treeNode.tId).unbind().remove();
					$("#editBtn_" + treeNode.tId).unbind().remove();
					$("#removeBtn_" + treeNode.tId).unbind().remove();
				}
				if (that.treeSetting.checkChildNodes) {
					$("#allBtn_" + treeNode.tId).unbind().remove();
				}
				if (that.treeSetting.editBtnExt) {
					var btns = that.treeSetting.editBtnExt(treeNode);
					if (btns) {
						for ( var i = 0; i < btns.length; i++) {
							var btn = btns[i];
							var name = btn.name;
							$("#" + name + "Btn_" + treeNode.tId).unbind()
									.remove();
						}
					}
				}
			};

			that.setting["edit"] = edit;
			that.setting["callback"] = callBack;
			that.setting["view"] = view;
			if (that.treeSetting.check) {
				that.setting["check"] = {
					enable : true
				};
				if (that.treeSetting.disabledLink) {
					that.setting["check"]["chkboxType"] = {
						"Y" : "",
						"N" : ""
					};
				}
			}
			that.setting["data"] = {
				simpleData : {
					enable : true,
					idKey : that.idKey,
					pIdKey : that.pIdKey
				},
				key : {
					name : that.nodeName
				}
			};
			that.setting["async"] = that.async;
			if (that.extendAttrs) {
				for ( var att in that.extendAttrs) {
					that.setting[att] = that.extendAttrs[att];
				}
			}
			$("#searchInput").unbind().change(
					function() {
						if (this.value.length > 0) {
							var valueItem = this.value.split(",");
							var nodeList=[];
							var hLight = true;
							$.fn.zTree.init($("#" + that.treeName),
									that.setting, that.treeResult);
							for (var i =0;i<valueItem.length;i++){
								// 将找到的nodelist节点更新至Ztree内
								nodeList = nodeList.concat(that.tree.getNodesByParamFuzzy(
									"NAME", valueItem[i]));
							}
							for ( var i = 0; i < nodeList.length; i++) {
								nodeList[i].isParent = hLight;
								that.tree.expandNode(nodeList[i], true, false,
									false,true);
							}
						} else {
							$.fn.zTree.init($("#" + that.treeName),
									that.setting, that.treeResult);
						}
					});
		}
	},
	show : function(treeDatas) {
		var that = this;
		var createTree = function(result) {
			if (that.groupData) {
				for ( var i = 0; i < result.length; i++) {
					var obj = result[i];
					result[i] = that.groupData(obj);
				}
			}
			$.fn.zTree.init($("#" + that.treeName), that.setting, result);
			that.tree = $.fn.zTree.getZTreeObj(that.treeName);
			if (that.expandAll) {
				that.tree.expandAll(true);
			}
			if (that.loadFun) {
				that.loadFun(that.tree, result);
			}
		};
		if (treeDatas) {
			createTree(treeDatas);
			return;
		}
		var params = "";
		var _url = that.queryUrl;
		jyAjax(_url, params, function(result) {// 请求成功后
			debugger;
			if (result) {
				that.treeResult = result;
				createTree(result);
			}
		});
	},
	getId : function(node) {
		return node[this.idKey];
	},
	getName : function(node) {
		return node[this.nodeName];
	},
	addByFrom : function(form) {
		var f;
		if (typeof (form) === "string") {
			f = $("#" + form);
		} else {
			f = $(form);
		}
		var params = f.serialize();
		var _url = that.addUrl;
		jyAjax(_url, params, function(result) {// 请求成功后
			if (result) {
				that.addByForm(result);
			}
		});
	},
	addByPojo : function(pojo) {
		var treeNode = this.treeNode;
		this.tree.addNodes(treeNode, pojo);
	},
	addByPojos : function(pojos) {
		var treeNode = this.treeNode;
		this.tree.addNodes(treeNode, pojos);
	},
	edit : function(pojo) {
		var that = this;
		this.treeNode[that.nodeName] = pojo[that.nodeName];
		setTimeout(function() {
			that.tree.updateNode(that.treeNode);
		}, 10);
		return false;
	},
	remove : function(nodeObj) {
		this.tree.removeNode(nodeObj);
	},
	getTree : function() {
		return this.tree;
	}
};
(function($) {
	$.fn.jyTree = function(treeStructure) {
		var tname = "tname" + (new Date()).getTime();
		return new Tree(treeStructure, tname, $(this)[0]);
	};
})(jQuery);
