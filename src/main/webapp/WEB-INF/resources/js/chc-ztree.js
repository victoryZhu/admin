
var treeNodeID_newnode="";
var baseurl=""; 

/**
 * 设置zTree树
 */
var setting = {
	async: {
		enable: true,
		type:"GET",
		url: getUrlByNodeId
	},
	edit: {
		enable: false,
		showRemoveBtn: false,
		showRenameBtn: false
	},
	data: {
		keep: {
			//是否锁定叶子或者支节点节点状态
			parent:false,
			leaf:false
		},
		key:{
			name:"name"
		},
		simpleData : {
			enable: true,
			idKey: "id",
			pIdKey: "pId",
			rootPId: "0" 
		}
	},
	view: {
		selectedMulti: false//默认是可以多个节点可以同时选中，通过Ctrl+左键，此处设为不可
	},
	callback: {
		//每次展开都执行beforeExpand
		beforeExpand: beforeExpand,
		beforeCollapse: zTreeBeforeCollapse,
		beforeRemove: beforeRemove,
		beforeAsync: beforeAsync, 
		onAsyncSuccess: onAsyncSuccess,
		onAsyncError: onAsyncError,
		onClick: zTreeOnClick,
		onRemove: onRemove
	}
};


/**
 * @author ZhengHaibo
 * 功能：通过NodeId获得节点的孩子节点
 * 调用：当父节点展开时，调用，返回该父节点的子节点
 * 后台数据格式：JSON
 * @param treeId 树控件的Id
 * @param treeNode 树节点对象：包含Id等信息
 * @return
 */
function getUrlByNodeId(treeId, treeNode) {
	return proPath+treeNode.nodeOpenUrl;
} 

function getNode(treeId, treeNode) {	
	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
	zTree.selectNode(treeNode);//设置为第一个节点为选中
	zTreeOnClick(null, treeId, treeNode);//显示第一个节点的详细信息 
}

/**
 * 展开之前执行的函数
 * @param treeId
 * @param treeNode
 * @return
 */
function beforeExpand(treeId, treeNode) { 
	getNode(treeId, treeNode);
	return true;
}

function zTreeBeforeCollapse(treeId, treeNode) {
	getNode(treeId, treeNode);
    return true;
};
 
//改变上层公司时刷新节点所设置 ，存放父节点，将全部父节点展开完，长度变为0
//二维数组，第一维存放JGXXID,第二维存放父节点顺序，0表示第一个父节点（直接父节点）
var changeSjjgIds=new Array(); 
function changeSjjgExpandNodes(){ 
	//外部覆盖，用于展开改变上层公司时的父节点
}

//拖动时目标极点未展开时，需异动展开执行后继动作
var dragNode=null;
var dragAsyncFlag=false;
function beforeAsync(){ 
}

/**
 * 加载成功后执行的函数
 * @param event 封装了js的事件
 * @param treeId 树控件的Id
 * @param treeNode 树节点对象
 * @param msg 返回的JSON格式的消息
 * @return
 */ 
function onAsyncSuccess(event, treeId, treeNode, msg) { 
	if (!msg || msg.length == 0) {
		return;
	}
	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
	var nodes = zTree.transformToArray(treeNode.children);
	 
	if (changeSjjgIds.length>0){ 
		changeSjjgExpandNodes(changeSjjgIds);
	} 
	if(dragAsyncFlag&&dragNode!=null){
		changeBM(dragNode,treeNode,'inner'); 
	}
	$.each(nodes,function(index,node){		
		zTree.updateNode(node);//更新树结构
		if (treeNodeID_newnode==node.id){
			zTree.selectNode(node);//选择点
			zTree.setting.callback.onClick(null, zTree.setting.treeId, node);//调用事件 		
		}
			  
	});
	treeNodeID_newnode="";
}

function onAsyncError(event, treeId, treeNode, XMLHttpRequest, textStatus, errorThrown) {	 
	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
	alert("Error ! 异步获取数据异常");
	treeNode.icon = "";
	
	zTree.updateNode(treeNode);	
}

function ajaxGetNodes(treeNode, reloadType) {
	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
	if (reloadType == "refresh") {
		treeNode.icon = "resources/css/zTreeStyle/img/loading.gif";//basePath+
		zTree.updateNode(treeNode);
	}
}

function onRemove(e, treeId, treeNode) {
	//document.getElementById("iframepage").src="";
}

function beforeRemove(treeId, treeNode) { 
}

function refreshaddnode(data,selected){
	  var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
	  nodes = zTree.getSelectedNodes(),
	  treeNode = nodes[0];
	  if (treeNode.zAsync){
		  //true 表示父节点展开时不需要自动异步加载 
		 // false 表示父节点展开时需要自动异步加载 
		  //getNodeImg(data);
		  
		  //此代码好像没用了
		  if(treeNode.type=='ry') treeNode=treeNode.getParentNode();//如果选择人员还可以新增的用此代码 
		  
		  treeNode =zTree.addNodes(treeNode, data);		  
		  if (selected){
			  zTree.selectNode(treeNode[0]);//选择点  
			  zTree.setting.callback.onClick(null, zTree.setting.treeId, treeNode[0]);//调用事件 			  
		  }
	  }
	  else{
		  
		  $.each(data,function(idx,node){   
			  treeNodeID_newnode= node.id;
		  });
		  //展开会异动执行，onAsyncSuccess中执行选择当前点
		  zTree.expandNode(treeNode,true);	
		  
	  }	  
}

function refreshupdatenode(data,selected){
	  var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
	  nodes = zTree.getSelectedNodes(),
	  treeNode = nodes[0];
	  //if(treeNode.pId!=data.Pid) zTree.removeNode(treeNode, false);
	  var jsonData = eval(data);//接收到的数据转化为JQuery对象，由JQuery为我们处理  
	  $.each(jsonData,function(idx,item){   
		  treeNode.name=item.name;
		  if(item.drag!=null){
			  treeNode.drag=item.drag;
			  treeNode.drop=item.drop;
		  }
		  if(item.ryxxid!=null){
			  treeNode.ryxxid=item.ryxxid;
			  treeNode.fullTime=item.fullTime;
		  }
	  });   
	  zTree.updateNode(treeNode);	  
	  if (selected){
		  zTree.selectNode(treeNode);//选择点  
		  zTree.setting.callback.onClick(null, zTree.setting.treeId, treeNode);//调用事件 			  
	  }
}
 
function zTreeOnClick(event, treeId, treeNode) { 
	changeNode(treeNode.type,treeNode.id); 
}

function treeInit(){	
	$.get(proPath+baseurl, null, function(data) {		
		$.fn.zTree.init($("#treeDemo"), setting, data);//初始化zTree树	 
		
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");//获取ztree对象  		 
		var nodes = zTree.getNodes();
		zTree.selectNode(nodes[0]);//选择点  
		zTree.setting.callback.onClick(null, zTree.setting.treeId, nodes[0]);//调用事件 
		zTree.expandNode(nodes[0], true);  //展开第一个节点		
	});
};

