<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>

<link type="text/css" rel="stylesheet" href="<c:url value="/resources/css/zTreeStyle/zTreeStyle.css" />" /> 
<script type="text/javascript" src="<c:url value="/resources/js/jquery.ztree.all-3.5.js" />"></script>

<script> 
var zTreeObj;
var setting = {		   
		   data: {
			   simpleData: {
				   enable: true,
				   idKey: "id",
				   pIdKey: "pId",
				   rootPId: 0
			   }
		   }		   
	};

var nodes = ${nodes};

$(document).ready(function () {   
  //树载入 
  //zTreeObj = $.fn.zTree.init($("#treeDemo"), setting, nodes);
  
  //展开第一个节点，执行有问题！  
  /* var nodes = zTreeObj.getNodes();
  if (nodes.length>0) {
	  zTreeObj.expandNode(nodes[0], true, true, true);
  } */   
  
  //var zTreeObj  = $.fn.zTree.getZTreeObj("treeDemo");  
  //展开全部节点  
  //zTreeObj.expandAll(true);

  //$("#div_1").height(20);
  //$("#div_2").height($(".ui-layout-west").height()-20);
}); 
</script> 

<div id="div_1" class="ui-jqgrid-titlebar ui-jqgrid-caption ui-widget-header ui-corner-top ui-helper-clearfix"><span class="ui-jqgrid-title">系统模块功能</span></div>

<div id="div_2" style="overflow-y:scroll;">	
	<ul id="treeDemo" class="ztree"></ul>	
</div> 	